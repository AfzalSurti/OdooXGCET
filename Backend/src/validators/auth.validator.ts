import { z } from 'zod';

export const signUpSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
  phoneNumber: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .trim(),
  department: z.string().min(1, 'Department is required').trim(),
  position: z.string().min(1, 'Position is required').trim(),
  joiningYear: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  role: z.enum(['EMPLOYEE', 'HR', 'ADMIN'], { message: 'Role must be EMPLOYEE, HR, or ADMIN' })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').trim(),
  phoneNumber: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]? [0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .trim(),
  department: z.string().min(1, 'Department is required').trim(),
  position: z.string().min(1, 'Position is required').trim(),
  joiningYear: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  role: z.enum(['EMPLOYEE', 'HR', 'ADMIN']).default('EMPLOYEE')
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;