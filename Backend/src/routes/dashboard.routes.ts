import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics based on user role
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { role } = req.query;
    const userRole = String(role || req.user.role).toUpperCase();
    const isHR = userRole === 'HR' || userRole === 'ADMIN';

    if (isHR) {
      // HR/ADMIN dashboard stats
      const totalEmployees = await prisma.user.count({
        where: {
          role: {
            in: ['EMPLOYEE', 'HR']
          }
        }
      });

      const pendingApprovals = await prisma.leaveRequest.count({
        where: {
          status: 'pending'
        }
      });

      // Today's attendance count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAttendance = await prisma.attendance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow
          },
          status: {
            in: ['present', 'late']
          }
        }
      });

      // Calculate attendance rate (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalAttendanceRecords = await prisma.attendance.count({
        where: {
          date: {
            gte: thirtyDaysAgo
          },
          status: {
            in: ['present', 'late']
          }
        }
      });

      const totalExpectedDays = totalEmployees * 30; // Simplified calculation
      const attendanceRate = totalExpectedDays > 0 
        ? Math.round((totalAttendanceRecords / totalExpectedDays) * 100)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalEmployees,
          pendingApprovals,
          todayAttendance,
          attendanceRate
        }
      });
    } else {
      // Employee dashboard stats
      // Get today's check-in status
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAttendance = await prisma.attendance.findFirst({
        where: {
          employeeId: req.user.id,
          date: {
            gte: today,
            lt: tomorrow
          }
        }
      });

      // Get weekly work hours
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const weeklyRecords = await prisma.attendance.findMany({
        where: {
          employeeId: req.user.id,
          date: {
            gte: weekStart
          }
        }
      });

      const weeklyHours = weeklyRecords.reduce((sum, record) => {
        return sum + (record.workHours || 0);
      }, 0);

      // Get leave balance (simplified - in production, calculate from leave requests)
      const approvedLeaves = await prisma.leaveRequest.count({
        where: {
          employeeId: req.user.id,
          status: 'approved',
          type: 'annual'
        }
      });

      const leaveBalance = 12 - approvedLeaves; // Assuming 12 days annual leave

      return res.status(200).json({
        success: true,
        data: {
          checkedIn: !!todayAttendance?.checkIn,
          checkInTime: todayAttendance?.checkIn?.toISOString() || null,
          weeklyHours: Math.round(weeklyHours * 10) / 10,
          leaveBalance: Math.max(0, leaveBalance)
        }
      });
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching dashboard stats'
    });
  }
});

/**
 * GET /api/dashboard/activity
 * Get recent activity for current user
 */
router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Get recent attendance records
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        employeeId: req.user.id
      },
      orderBy: {
        date: 'desc'
      },
      take: 5
    });

    // Get recent leave requests
    const recentLeaves = await prisma.leaveRequest.findMany({
      where: {
        employeeId: req.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // Transform to activity format
    const activities = [
      ...recentAttendance.map(att => ({
        type: 'attendance' as const,
        id: att.id,
        date: att.date,
        description: att.checkIn 
          ? `Check-in at ${att.checkIn.toLocaleTimeString()}`
          : 'No check-in recorded',
        status: att.status
      })),
      ...recentLeaves.map(leave => ({
        type: 'leave' as const,
        id: leave.id,
        date: leave.createdAt,
        description: `${leave.type} leave request - ${leave.status}`,
        status: leave.status
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
     .slice(0, 10);

    return res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching activity'
    });
  }
});

export default router;

