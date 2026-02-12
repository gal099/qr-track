import { z } from 'zod';

// Validation schemas using Zod
export const generateQRSchema = z.object({
  targetUrl: z.string().url({ message: 'Must be a valid URL' }),
  fgColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Must be a valid hex color' })
    .default('#000000'),
  bgColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: 'Must be a valid hex color' })
    .default('#FFFFFF'),
});

export type GenerateQRInput = z.infer<typeof generateQRSchema>;

// Error responses
export interface APIError {
  error: string;
  details?: string;
}
