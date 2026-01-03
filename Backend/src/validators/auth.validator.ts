import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const signUpSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').trim(),
  email: z.email('Invalid email format').toLowerCase().trim(),
  password: passwordSchema,
  companyName: z.string().min(1, 'Company name is required').trim(),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Invalid phone number format')
    .trim(),
  role: z.enum(['EMPLOYEE', 'HR'], { message: 'Role must be either EMPLOYEE or HR' })
});

export type SignUpInput = z.infer<typeof signUpSchema>;
