import express, { type Request, type Response, Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { signUpSchema, loginSchema, verifyEmailSchema } from '../validators/auth.validator.js';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.middleware.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.middleware.js';

const router: Router = express.Router();

/**
 * POST /api/auth/signup
 * User registration endpoint
 * Creates a new user with email verification token
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const validatedData = signUpSchema.parse(req.body);

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists. Please try to sign in.',
        field: 'email'
      });
    }

    // Check if employee ID already exists
    const existingUserByEmployeeId = await prisma.user.findUnique({
      where: { employeeId: validatedData.employeeId }
    });

    if (existingUserByEmployeeId) {
      return res.status(409).json({
        success: false,
        message: 'Employee ID already exists. Please try to sign in.',
        field: 'employeeId'
      });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(validatedData.password, 10);
    
    // Generate email verification token (24 hour expiry)
    const emailVerifyToken = Math.random().toString(36).substring(2, 15) + 
                             Math.random().toString(36).substring(2, 15);
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user with all required fields
    const newUser = await prisma.user.create({
      data: {
        employeeId: validatedData.employeeId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash,
        companyName: validatedData.companyName,
        phoneNumber: validatedData.phoneNumber,
        department: validatedData.department,
        position: validatedData.position,
        joiningYear: validatedData.joiningYear,
        role: validatedData.role,
        emailVerified: false,
        emailVerifyToken,
        emailVerifyExpires
      },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: newUser,
        verificationToken: emailVerifyToken,
        redirectTo: '/email-verification'
      }
    });

  } catch (error: unknown) {
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

    console.error('Sign-up error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * User login endpoint
 * Returns JWT token on success
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (!user) {
      // Return generic error to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(validatedData.password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token (no email verification required)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (excluding sensitive fields) and token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          employeeId: user.employeeId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        }
      }
    });

  } catch (error: unknown) {
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

    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

/**
 * POST /api/auth/verify-email
 * Email verification endpoint
 * Verifies the email verification token and marks email as verified
 */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const validatedData = verifyEmailSchema.parse(req.body);

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: validatedData.token,
        emailVerifyExpires: {
          gt: new Date() // Token must not be expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified. You can login now.'
      });
    }

    // Update user to mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.',
      data: {
        redirectTo: '/login'
      }
    });

  } catch (error: unknown) {
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

    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during email verification. Please try again.'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 * Protected route - requires valid JWT token
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Fetch full user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        position: true,
        companyName: true,
        phoneNumber: true,
        joiningYear: true,
        emailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching user data.'
    });
  }
});

export default router;
