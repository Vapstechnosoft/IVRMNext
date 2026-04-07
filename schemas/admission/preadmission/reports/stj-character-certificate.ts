import { z } from 'zod';

export const StjCharacterCertificateSchema = z.object({
    allorindi: z.enum(['A', 'I']),
    optradio: z.enum(['S', 'L', 'D']),
    ASMAY_Id: z.number().min(1, 'Please select Academic Year'),
    ASMCL_Id: z.number().optional().nullable(),
    ASMS_Id: z.number().optional().nullable(),
    AMST_Id: z.number().min(1, 'Please select Student'),
    ASA_FromDate: z.date({ required_error: 'Please select Date' }),
    
    // Checkbox groups
    House: z.record(z.string(), z.any()).optional(),
    activities: z.record(z.string(), z.any()).optional(),
    staticActivities: z.record(z.string(), z.any()).optional(), // Clubs
    School: z.record(z.string(), z.any()).optional(),

    // Text fields
    Posts: z.string().optional(),
    Principal: z.string().optional(),
    Year: z.string().optional(),
    Final: z.string().optional(),
    Year1: z.string().optional(),
    Final1: z.string().optional(),
}).refine((data) => {
    if (data.allorindi === 'I') {
        return !!data.ASMCL_Id && !!data.ASMS_Id;
    }
    return true;
}, {
    message: 'Please select Class and Section for individual report',
    path: ['ASMCL_Id']
});

export type StjCharacterCertificateFields = z.infer<typeof StjCharacterCertificateSchema>;
