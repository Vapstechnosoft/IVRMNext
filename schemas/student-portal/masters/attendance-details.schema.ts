import { z } from 'zod';

export const attendanceDetailsSchema = z.object({
    asmaY_Id: z.string().min(1, { message: 'Select the Academic Year' })
});

export type AttendanceDetailsSchema = z.infer<typeof attendanceDetailsSchema>;
