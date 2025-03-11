import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, 'This field is required').email("Invalid email format"),
    password: z.string().min(1, "This field is required")
});