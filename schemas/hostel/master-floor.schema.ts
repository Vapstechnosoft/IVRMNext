import { z } from 'zod';

export const masterFloorSchema = z.object({
  hlmF_Id: z.number().optional(),
  hlmH_Id: z.string().min(1, { message: 'Select Hostel' }), // Using string for Select value
  hrmF_FloorName: z
    .string()
    .min(1, { message: 'Enter the field Floor Name' })
    .max(50, { message: 'Floor Name must not exceed 50 characters' }),
  hrmF_TotalRooms: z
    .string()
    .min(1, { message: 'Enter Total No Of Room' })
    .regex(/^[0-9]+$/, { message: 'The field contains only numbers' })
    .max(50, { message: 'Total Room must not exceed 50 characters' }), // HTML has maxlength=50 for this input
  hrmF_FloorDesc: z
    .string()
    .max(250, { message: 'Description must not exceed 250 characters' })
    .optional(),
  facilities: z
    .array(z.number())
    .min(1, { message: 'Select Facilities' }),
});

export type IMasterFloorForm = z.infer<typeof masterFloorSchema>;
