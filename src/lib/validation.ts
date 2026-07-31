import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  mobile: z.string().min(10, "Valid mobile number required").max(15),
  email: z.string().email("Invalid email address"),
  monthlySalary: z.number().positive("Monthly salary must be positive"),
  loanAmount: z.number().positive("Loan amount must be positive"),
  loanType: z.enum([
    "Personal Loan",
    "Business Loan",
    "Loan Against Property",
    "Overdraft Facility",
    "Home Loan",
    "Other",
  ]),
  source: z.string().optional(),
  status: z
    .enum(["NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"])
    .optional(),
  assignedTo: z.string().optional(),
  remarks: z
    .array(
      z.object({
        text: z.string().min(1),
        author: z.string().min(1),
      })
    )
    .optional(),
});

export const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["AGENT", "MANAGER", "SUPER_ADMIN"]),
  active: z.boolean().optional(),
});

export const remarkSchema = z.object({
  text: z.string().min(1, "Remark text is required").max(1000),
});

export const publicLeadSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  monthlySalary: z.number().positive("Monthly salary must be a positive amount"),
  loanAmount: z.number().positive("Loan amount must be a positive amount"),
  loanType: z.enum([
    "Personal Loan",
    "Business Loan",
    "Loan Against Property",
    "Overdraft Facility",
    "Home Loan",
    "Other",
  ]),
});

export const connectorSignupSchema = z.object({
  name: z.string().min(1, "Full name is required").max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Enter a valid email address"),
  city: z.string().min(1, "City is required").max(100),
  networkType: z.enum([
    "Shopkeeper",
    "Insurance Agent",
    "CA/Accountant",
    "Real Estate Broker",
    "Individual",
    "Other",
  ]),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfsc: z.string().optional().nullable(),
  bankAccountHolderName: z.string().optional().nullable(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LeadInput = z.infer<typeof leadSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type PublicLeadInput = z.infer<typeof publicLeadSchema>;
export type ConnectorSignupInput = z.infer<typeof connectorSignupSchema>;
