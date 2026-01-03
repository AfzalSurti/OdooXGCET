import express, { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { signUpSchema } from '../validators/auth.validator.js';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
const router = express.Router();
router.post('/signup', async (req, res) => {
    try {
        const validatedData = signUpSchema.parse(req.body);
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
        const passwordHash = await bcryptjs.hash(validatedData.password, 10);
        const emailVerifyToken = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
        const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const newUser = await prisma.user.create({
            data: {
                employeeId: validatedData.employeeId,
                email: validatedData.email,
                passwordHash,
                companyName: validatedData.companyName,
                phoneNumber: validatedData.phoneNumber,
                role: validatedData.role,
                emailVerifyToken,
                emailVerifyExpires
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
    }
    catch (error) {
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
export default router;
//# sourceMappingURL=auth.routes.js.map