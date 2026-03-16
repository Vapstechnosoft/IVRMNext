import { z } from 'zod';

export const alumniLettersSchema = z.object({
    reporttype: z.enum(['Alumni', 'Regular']),
    letter_list: z.string().min(1, 'Select Letter Type'),
    display_DateandTime: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^\d{4}\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):([0-5][0-9])$/.test(val),
            {
                message: 'please enter correct date and time yyyy/MM/dd hh:mm'
            }
        ),
    asmaY_Id: z.string().min(1, 'Select Academic Year'),
    asmcL_Id: z.string().min(1, 'Select Class'),
    searchRows: z
        .array(
            z.object({
                condition: z.string().optional(),
                field: z.string().min(1, 'Select Field'),
                operator: z.string().min(1, 'Select Operator'),
                value: z.string().min(1, 'Enter Value')
            })
        )
        .optional()
});

export type AlumniLettersSchema = z.infer<typeof alumniLettersSchema>;
