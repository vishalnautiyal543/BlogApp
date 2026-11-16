import {z} from "zod"

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50),

  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscore allowed"
    ),

  email: z.email(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),

});