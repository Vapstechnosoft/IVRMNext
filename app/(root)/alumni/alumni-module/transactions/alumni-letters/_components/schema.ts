import { z } from 'zod';

export const alumniLettersSchema = z.object({
    reporttype: z.enum(['Alumni', 'Regular']),
    letter_list: z.string().min(1, 'Select Letter Type'),
    display_DateandTime: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/.test(val),
            {
                message: 'Invalid format. Use dd-MM-yyyy HH:mm (e.g., 25-12-2023 14:30)'
            }
        ),
    asmaY_Id: z.string().min(1, 'Select Academic Year'),
    asmcL_Id: z.string().min(1, 'Select Class')
});

export type AlumniLettersSchema = z.infer<typeof alumniLettersSchema>;
