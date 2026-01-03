import { z } from 'zod';
export declare const signUpSchema: z.ZodObject<{
    employeeId: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    companyName: z.ZodString;
    phoneNumber: z.ZodString;
    role: z.ZodEnum<{
        EMPLOYEE: "EMPLOYEE";
        HR: "HR";
    }>;
}, z.core.$strip>;
export type SignUpInput = z.infer<typeof signUpSchema>;
//# sourceMappingURL=auth.validator.d.ts.map