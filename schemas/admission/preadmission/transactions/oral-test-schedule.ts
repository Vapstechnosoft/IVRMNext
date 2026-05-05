import { z } from 'zod';

export const oralTestScheduleSchema = z.object({
    paotS_Id: z.number().optional().default(0),
    paotS_ScheduleName: z.string().min(1, 'Schedule Name is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    paotS_ScheduleDate: z.date({
        required_error: 'Schedule Date is required',
        invalid_type_error: 'Invalid Date',
    }),
    paotS_ScheduleTime: z.date({
        required_error: 'Start Time is required',
    }),
    paotS_ScheduleTimeTo: z.date({
        required_error: 'End Time is required',
    }),
    paotS_Remarks: z.string().optional(),
    paotS_Superviser: z.string().optional(),
    paotS_Skills: z.string().optional(),
    paotS_TPFlag: z.boolean().default(false),
    paotS_TimePeriod: z.union([z.number(), z.string().transform(Number)]).optional(),
    paotS_Strength: z.union([z.number(), z.string().transform(Number)]).refine(n => n > 0, {
        message: 'Number of students must be at least 1',
    }),
    autoschedule: z.boolean().default(false),
    meetingvc: z.boolean().default(false),
    pavidc: z.boolean().default(false),
    autostudent: z.boolean().default(true),
    stafflag: z.boolean().default(false),
    principalflg: z.boolean().default(false),
    managerflg: z.boolean().default(false),
    anybodystart: z.boolean().default(false),
});

export type OralTestScheduleFormValues = z.infer<typeof oralTestScheduleSchema>;

export const oralReScheduleSchema = oralTestScheduleSchema.extend({
    previousScheduleId: z.string().min(1, 'Previous Schedule is required'),
});

export type OralReScheduleFormValues = z.infer<typeof oralReScheduleSchema>;
