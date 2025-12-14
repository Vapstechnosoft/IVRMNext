import { deleteIdSchema } from '@/schemas/validationSchemas';
import { z } from 'zod';

export const masterStudentCountReportSchema = {
    addOrUpdate: z.object({
        type: z.number().default(1),
        report_type: z
            .enum(['Registered List', 'Registered Count', 'Payment Report'], {
                message: 'Report type is required'
            })
            .optional(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        asmaY_Id: z.number().int({ message: 'Academic Year ID is required' }).optional(),
        asmcL_Id: z.number().int().default(0)
    }),
    delete: z.object({
        asmay_id: deleteIdSchema('asmay_id')
    })
};

export const studentSearchSchema = z.object({
    status: z.enum(['all', 'studying', 'left'], {
        required_error: 'Please select student status'
    }),
    criteria: z
        .array(
            z.object({
                field: z.string().min(1, 'Field is required'),
                operator: z.string().min(1, 'Operator is required'),
                value: z.string().min(1, 'Value is required'),
                condition: z.string().optional()
            })
        )
        .min(1, 'At least one search criteria is required')
});

export const admissionReportSchema = z.object({
    academicYear: z.number().min(1, 'Academic year is required'),
    status: z.string().min(1, 'Status is required'),
    selectedClasses: z.array(z.string()).min(1, 'Please select at least one class'),
    selectedFields: z.array(z.string()).min(1, 'Please select at least one field')
});

export const TotalStrengthSchema = z
    .object({
        reportType: z.enum(['All', 'Individual']),
        status: z.string().min(1, 'Status is required'),
        withTc: z.boolean().optional().default(false),
        withDeactive: z.boolean().optional().default(false),
        academicYear: z.number().min(1, 'Academic year is required'),
        class: z.string().optional(),
        section: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.reportType === 'Individual') {
                return !!data.class && !!data.section;
            }
            return true;
        },
        {
            message: 'Class and Section are required for Individual report',
            path: ['class']
        }
    );
