import express, { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router:Router = express.Router();

// All attendance routes require authentication
router.use(authenticateToken);

const checkInSchema = z.object({
  location: z.string().optional()
});

/**
 * POST /api/attendance/check-in
 * Employee check-in endpoint
 */
router.post('/check-in', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = checkInSchema.parse(req.body);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already checked in today
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId: req.user.id, // employeeId in Attendance model refers to User.id
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingRecord && existingRecord.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    // Determine status (late if after 9 AM)
    const checkInHour = now.getHours();
    const status = checkInHour > 9 ? 'late' : 'present';

    let attendance;
    if (existingRecord) {
      // Update existing record
      attendance = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          checkIn: now,
          status,
          location: validatedData.location ?? null // Change undefined to null
        }
      });
    } else {
      // Create new record
      attendance = await prisma.attendance.create({
        data: {
          employeeId: req.user.id,
          date: today,
          checkIn: now,
          status,
          location: validatedData.location ?? null // Change undefined to null
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
    }
    console.error('Check-in error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during check-in'
    });
  }
});

/**
 * POST /api/attendance/check-out
 * Employee check-out endpoint
 */
router.post('/check-out', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find today's attendance record
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: req.user.id,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    // Calculate work hours
    const checkInTime = attendance.checkIn.getTime();
    const checkOutTime = now.getTime();
    const workHours = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: Math.round(workHours * 10) / 10 // Round to 1 decimal
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: updated
    });
  } catch (error) {
    console.error('Check-out error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during check-out'
    });
  }
});

/**
 * GET /api/attendance/today
 * Get today's attendance record for current user
 */
router.get('/today', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: req.user.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: attendance || null
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching attendance'
    });
  }
});

/**
 * GET /api/attendance/weekly
 * Get weekly attendance summary for current user
 */
router.get('/weekly', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const records = await prisma.attendance.findMany({
      where: {
        employeeId: req.user.id,
        date: {
          gte: weekStart
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get weekly attendance error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching attendance'
    });
  }
});

/**
 * GET /api/attendance
 * Get attendance history with optional filters
 * HR/ADMIN can view all, employees can only view their own
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { employeeId, startDate, endDate } = req.query;
    const isHR = req.user.role === 'HR' || req.user.role === 'ADMIN';

    // Employees can only view their own attendance
    const targetEmployeeId = isHR && employeeId ? String(employeeId) : req.user.id;

    const where: any = {
      employeeId: targetEmployeeId
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.date.lte = new Date(String(endDate));
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc'
      },
      take: 100 // Limit to 100 records
    });

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching attendance'
    });
  }
});

/**
 * GET /api/attendance/:employeeId/logs
 * Get attendance logs for a specific employee (HR/ADMIN only)
 */
router.get('/:employeeId/logs', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const where: any = {
      employeeId
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(String(startDate));
      }
      if (endDate) {
        where.date.lte = new Date(String(endDate));
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get employee logs error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching attendance logs'
    });
  }
});

export default router;

