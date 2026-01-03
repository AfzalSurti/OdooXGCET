import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';
import { z } from 'zod';

const router = express.Router();

// All payroll routes require authentication
router.use(authenticateToken);

const updateSalarySchema = z.object({
  basicSalary: z.number().positive().optional(),
  housingAllowance: z.number().min(0).optional(),
  transportAllowance: z.number().min(0).optional(),
  medicalAllowance: z.number().min(0).optional(),
  performanceBonus: z.number().min(0).optional(),
  incomeTax: z.number().min(0).optional(),
  healthInsurance: z.number().min(0).optional(),
  providentFund: z.number().min(0).optional()
});

/**
 * GET /api/payroll/my
 * Get current user's payroll records
 */
router.get('/my', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? Number(month) : currentDate.getMonth() + 1;
    const targetYear = year ? Number(year) : currentDate.getFullYear();

    const where: any = {
      employeeId: req.user.id,
      month: targetMonth,
      year: targetYear
    };

    const payroll = await prisma.payroll.findFirst({
      where
    });

    if (!payroll) {
      // Return empty structure if no payroll record exists
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No payroll record found for this period'
      });
    }

    return res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Get my payroll error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching payroll'
    });
  }
});

/**
 * GET /api/payroll
 * Get all payroll records (HR/ADMIN only)
 */
router.get('/', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? Number(month) : currentDate.getMonth() + 1;
    const targetYear = year ? Number(year) : currentDate.getFullYear();

    const where: any = {
      month: targetMonth,
      year: targetYear
    };

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        employeeId: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: payrolls
    });
  } catch (error) {
    console.error('Get all payroll error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching payroll records'
    });
  }
});

/**
 * PUT /api/payroll/:employeeId/salary
 * Update employee salary structure (HR/ADMIN only)
 */
router.put('/:employeeId/salary', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;
    const validatedData = updateSalarySchema.parse(req.body);

    // Verify employee exists
    const employee = await prisma.user.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate totals
    const basicSalary = validatedData.basicSalary || 0;
    const housingAllowance = validatedData.housingAllowance || 0;
    const transportAllowance = validatedData.transportAllowance || 0;
    const medicalAllowance = validatedData.medicalAllowance || 0;
    const performanceBonus = validatedData.performanceBonus || 0;
    const incomeTax = validatedData.incomeTax || 0;
    const healthInsurance = validatedData.healthInsurance || 0;
    const providentFund = validatedData.providentFund || 0;

    const grossSalary = basicSalary + housingAllowance + transportAllowance + medicalAllowance + performanceBonus;
    const totalDeductions = incomeTax + healthInsurance + providentFund;
    const netSalary = grossSalary - totalDeductions;

    // Get current month/year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Update or create payroll record
    const payroll = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId,
          month,
          year
        }
      },
      update: {
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        performanceBonus,
        incomeTax,
        healthInsurance,
        providentFund,
        grossSalary,
        totalDeductions,
        netSalary
      },
      create: {
        employeeId,
        month,
        year,
        basicSalary,
        housingAllowance,
        transportAllowance,
        medicalAllowance,
        performanceBonus,
        incomeTax,
        healthInsurance,
        providentFund,
        grossSalary,
        totalDeductions,
        netSalary
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Salary updated successfully',
      data: payroll
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues
      });
    }
    console.error('Update salary error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating salary'
    });
  }
});

/**
 * GET /api/payroll/:payrollId/download
 * Download payslip (placeholder - returns JSON for now)
 * In production, this would generate a PDF
 */
router.get('/:payrollId/download', async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { payrollId } = req.params;

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            position: true
          }
        }
      }
    });

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Employees can only download their own payslips
    const isHR = req.user.role === 'HR' || req.user.role === 'ADMIN';
    if (!isHR && payroll.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // In production, generate PDF here
    // For now, return JSON data
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payrollId}.json`);
    
    return res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    console.error('Download payslip error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while downloading payslip'
    });
  }
});

export default router;

