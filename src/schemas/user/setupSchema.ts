import { z } from 'zod';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
// Define the Zod schema for form validation
export const setupFormSchema = z.object({
  dob: z.string().refine((val) => new Date(val).getFullYear() <= new Date().getFullYear() - 18, {
    message: "You must be at least 18 years old",
  }),
  gender: z.enum(['male', 'female', 'others'], {
    errorMap: () => ({ message: 'This field is required' }),
  }),
  interest: z.enum(['male', 'female', 'others'], {
    errorMap: () => ({ message: 'This field is required' }),
  }),
  lookingFor: z.enum(['short-term', 'long-term', 'friends', 'figuring-out'], {
    errorMap: () => ({ message: 'This field is required' }),
  }),
  images: z
    .array(
      z.instanceof(File).refine((file) => {
        return file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type);
      }, "Invalid file type or size must be under 5MB"),
    )
    .min(2, "Minimum 2 images are required"),
});




