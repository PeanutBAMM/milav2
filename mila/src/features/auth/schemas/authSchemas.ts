import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Naam moet minimaal 2 karakters zijn'),
    email: z.string().email('Ongeldig email adres'),
    password: z.string().min(6, 'Wachtwoord moet minimaal 6 karakters zijn'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ongeldig email adres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
