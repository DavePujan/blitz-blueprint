import { z } from 'zod';

// Password validation schema
export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&#]/, "Password must contain at least one special character (@$!%*?&#)");

// Username validation schema
export const usernameSchema = z.string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be less than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

// Room validation schema
export const roomSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Room name is required")
    .max(50, "Room name must be less than 50 characters"),
  password: z.string()
    .max(128, "Password must be less than 128 characters")
    .optional()
    .or(z.literal('')),
  gameMode: z.enum(['deathmatch', 'objective'], {
    errorMap: () => ({ message: "Please select a valid game mode" })
  }),
  mapName: z.enum(['factory', 'warehouse'], {
    errorMap: () => ({ message: "Please select a valid map" })
  })
});

// Signup validation schema
export const signupSchema = z.object({
  username: usernameSchema,
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: passwordSchema
});
