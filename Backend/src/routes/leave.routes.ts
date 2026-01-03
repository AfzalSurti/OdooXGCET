import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

// All leave routes require authentication
router.use(authenticateToken);

const applyLeaveSchema = z.object({
  type: z.enum(['annual', 'sick', 'personal', 'unpaid']),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  reason: z.string().min(1, 'Reason is required')
});

const approveRejectSchema = z.object({
  comment: z.string().optional()
});

/**
 * POST /api/leaves
 * Apply for leave
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const validatedData = applyLeaveSchema.parse(req.body);

    // Validate dates
    if (validatedData.startDate >= validatedData.endDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: req.user.id,
        type: validatedData.type,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        reason: validatedData.reason,
        status: 'pending'
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
    }
    console.error('Apply leave error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting leave request'
    });
  }
});

/**
 * GET /api/leaves
 * Get leave requests
 * HR/ADMIN can view all, employees can only view their own
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { status, employeeId } = req.query;
    const isHR = req.user.role === 'HR' || req.user.role === 'ADMIN';

    const where: any = {};
    
    // Employees can only view their own requests
    if (!isHR) {
      where.employeeId = req.user.id;
    } else if (employeeId) {
      where.employeeId = String(employeeId);
    }

    if (status) {
      where.status = String(status);
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match frontend expectations
    const transformed = leaveRequests.map(req => ({
      id: req.id,
      employeeId: req.employeeId,
      employeeName: `${req.employee.firstName} ${req.employee.lastName}`,
      type: req.type,
      startDate: req.startDate.toISOString().split('T')[0],
      endDate: req.endDate.toISOString().split('T')[0],
      reason: req.reason,
      status: req.status,
      createdAt: req.createdAt.toISOString()
    }));

    return res.status(200).json({
      success: true,
      data: transformed
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching leave requests'
    });
  }
});

/**
 * GET /api/leaves/:id
 * Get a specific leave request
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const isHR = req.user.role === 'HR' || req.user.role === 'ADMIN';

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            email: true
          }
        }
      }
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Employees can only view their own requests
    if (!isHR && leaveRequest.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Get leave request error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching leave request'
    });
  }
});

/**
 * POST /api/leaves/:id/approve
 * Approve a leave request (HR/ADMIN only)
 */
router.post('/:id/approve', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = approveRejectSchema.parse(req.body);

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approvedBy: req.user?.id,
        approvedAt: new Date()
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request approved',
      data: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
    }
    console.error('Approve leave error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while approving leave request'
    });
  }
});

/**
 * POST /api/leaves/:id/reject
 * Reject a leave request (HR/ADMIN only)
 */
router.post('/:id/reject', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = approveRejectSchema.parse(req.body);

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        approvedBy: req.user?.id,
        approvedAt: new Date(),
        rejectionComment: validatedData.comment
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: updated
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
    }
    console.error('Reject leave error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while rejecting leave request'
    });
  }
});

/**
 * GET /api/leaves/:id/explanation
 * Get AI explanation for leave request (placeholder - returns mock data)
 * In production, this would call an AI service
 */
router.get('/:id/explanation', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Mock AI explanation - in production, this would call an AI service
    const explanation = {
      decision: leaveRequest.status === 'pending' 
        ? 'Recommend approval based on employee history and policy compliance'
        : leaveRequest.status === 'approved'
        ? 'Approved based on valid reason and available leave balance'
        : 'Rejected due to policy violation or insufficient leave balance',
      factors: [
        {
          title: 'Leave Balance',
          description: 'Employee has sufficient leave balance available',
          impact: 'positive' as const
        },
        {
          title: 'Reason Validity',
          description: 'The provided reason aligns with company leave policies',
          impact: 'positive' as const
        },
        {
          title: 'Previous Attendance',
          description: 'Employee has good attendance record in the past 6 months',
          impact: 'positive' as const
        }
      ],
      confidence: 0.85
    };

    return res.status(200).json({
      success: true,
      data: explanation
    });
  } catch (error) {
    console.error('Get explanation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching explanation'
    });
  }
});

export default router;

