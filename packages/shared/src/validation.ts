import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  phone: z
    .string()
    .min(9, "Phone must be at least 9 digits")
    .regex(/^[0-9+\-\s]+$/, "Phone can only contain digits, +, -, spaces"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  phone: z
    .string()
    .min(9, "Phone must be at least 9 digits")
    .regex(/^[0-9+\-\s]+$/, "Phone can only contain digits, +, -, spaces"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  memberType: z.enum(["church", "pta", "both"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email").toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const paymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .min(1, "Amount must be at least 1"),
  type: z.enum([
    "tithe",
    "offering",
    "special",
    "school",
    "uniform",
    "lunch",
    "bus",
  ]),
  provider: z.enum(["MTN", "Airtel", "Zamtel"]),
  phoneNumber: z
    .string()
    .min(9, "Phone number is required")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
});

export const batchPaymentSchema = z.object({
  childId: z.string().min(1, "Child is required"),
  term: z.enum(["term1", "term2", "term3"]),
  year: z.number().min(2020).max(2100),
  provider: z.enum(["MTN", "Airtel", "Zamtel"]),
  phoneNumber: z
    .string()
    .min(9, "Phone number is required")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number"),
  items: z
    .array(
      z.object({
        type: z.enum(["school", "uniform", "lunch", "bus"]),
        amount: z.number().min(0),
      })
    )
    .min(1, "Select at least one fee"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type BatchPaymentInput = z.infer<typeof batchPaymentSchema>;