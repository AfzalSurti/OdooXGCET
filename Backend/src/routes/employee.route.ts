import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { createEmployeeSchema } from '../validators/auth.validator.js';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { generateEmployeeId, generateRandomPassword } from '../utils/employeeid.generator.js';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.middleware.js';

const router = express.Router();

// All employee routes require authentication
router.use(authenticateToken);

// CREATE EMPLOYEE (HR/ADMIN Only)
// Requires authentication and HR or ADMIN role
router.post('/create', requireRole('HR', 'ADMIN'), async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const validatedData = createEmployeeSchema. parse(req.body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists.',
        field: 'email'
      });
    }

    const employeeId = await generateEmployeeId(
      validatedData.companyName,
      validatedData.firstName,
      validatedData.lastName,
      validatedData.joiningYear
    );

    
    const generatedPassword = generateRandomPassword(12);
    const passwordHash = await bcryptjs.hash(generatedPassword, 10);

    const newUser = await prisma.user. create({
      data: {
        employeeId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash,
        companyName: validatedData.companyName,
        phoneNumber:  validatedData.phoneNumber,
        department: validatedData.department,
        position: validatedData.position,
        joiningYear: validatedData.joiningYear,
        role: validatedData.role,
        emailVerified: false
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: {
        employeeId:  newUser.employeeId,
        password: generatedPassword,
        employee: {
          id: newUser.id,
          employeeId: newUser.employeeId,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          department: newUser.department,
          position: newUser.position,
          role: newUser.role,
          createdAt: newUser.createdAt
        }
      }
    });

  } catch (error:  unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    console.error('Create employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating employee.'
    });
  }
});

// GET ALL EMPLOYEES
// All authenticated users can view employees
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const employees = await prisma.user. findMany({
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName:  true,
        email: true,
        companyName: true,
        phoneNumber: true,
        department:  true,
        position: true,
        role: true,
        joiningYear: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching employees.'
    });
  }
});

// GET EMPLOYEE BY ID
// All authenticated users can view employee details
router.get('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req. params;

    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        companyName: true,
        phoneNumber: true,
        department:  true,
        position: true,
        role: true,
        joiningYear: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    return res.status(500).json({
      success: false,
      message:  'An error occurred while fetching employee.'
    });
  }
});

// UPDATE EMPLOYEE
// HR/ADMIN can update any employee, employees can update their own data
router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.employeeId;
    delete updateData.passwordHash;
    delete updateData. createdAt;

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email:  true,
        companyName:  true,
        phoneNumber: true,
        department: true,
        position: true,
        role: true,
        joiningYear: true,
        emailVerified: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating employee.'
    });
  }
});

export default router;