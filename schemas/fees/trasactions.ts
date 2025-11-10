import { z } from 'zod';
import { deleteIdSchema } from '../validationSchemas';

export const amountEntrySchema = {
    addOrUpdate: z.object({
        //asmaY_Id: z.number().int({ message: 'Academic Year is required' }),
        asmaY_Id: z.number({ message: 'Academic Year is required' }),
        feeGroupId: z.number({ message: 'Fee Group is required' }),
        categoryId: z.number({ message: 'Category is required' })
    }),
    delete: z.object({
        fmA_Id: deleteIdSchema('fmA_Id')
    })
};

export const thirdPartyTransactionSchema = {
    addOrUpdate: z
        .object({
            studentType: z.enum(['student', 'other']),
            academicYearId: z.number().min(1, 'Academic Year is required'),

            // academicYearId: z.number({ message: 'Term is required' }),
            studentId: z.number().optional(),
            studentName: z.string().optional(),
            groupId: z.number().min(1, 'Group Name is required'),
            headId: z.number().min(1, 'Head Name is required'),
            amount: z.number().min(0.01, 'Amount is required'),
            towards: z.string().optional(),
            //date: z.string().min(1, "Date is required"),
            date: z.string({ required_error: 'Date is required' }).min(1, ' Date is required'),

            // date: z
            //   .preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date({
            //     required_error: "Date is required",
            //     invalid_type_error: "Invalid date format",
            //   })),

            paymentMode: z.enum(['bank', 'cash', 'rtgsneft', 'card']),
            bankId: z.number().optional(),
            chequeDate: z.string().optional(),
            chequeNo: z.string().optional()
        })
        .superRefine((data, ctx) => {
            if (data.paymentMode === 'bank') {
                if (!(typeof data.bankId === 'number' && data.bankId > 0)) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Bank Name is required',
                        path: ['bankId']
                    });
                }
                if (!(typeof data.chequeDate === 'string' && data.chequeDate.trim() !== '')) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Cheque Date is required',
                        path: ['chequeDate']
                    });
                }
                if (!(typeof data.chequeNo === 'string' && data.chequeNo.trim() !== '')) {
                    ctx.addIssue({
                        code: 'custom',
                        message: 'Cheque Number is required',
                        path: ['chequeNo']
                    });
                }
            }
        }),

    delete: z.object({
        tpt_id: deleteIdSchema('tpt_id')
    })
};

//transactions
export const feeOpeningBalanceSchema = {
    addOrUpdate: z
        .object({
            mi_id: z.number().int().nonnegative(),
            selectionType: z.enum(['T', 'G', 'C'], {
                required_error: 'Selection type is required'
            }),
            academicYear: z.string().min(1, 'Academic year is required'),

            category: z.string().nullable().optional(),
            class: z.string().nullable().optional(),
            section: z.string().nullable().optional(),
            student: z.string().nullable().optional(),

            feeHead: z.string().nullable().optional(),
            feeGroup: z.string().nullable().optional(),

            feeInstallments: z.array(z.string()).optional(),

            date: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)')
                .optional(),

            refundableType: z.enum(['Refundable', 'NonRefundable']),
            activeType: z.enum(['Active', 'Left']),
            pdaorfeeType: z.enum(['Fees']),
            nameFormat: z.enum(['NameReg.No', 'Reg.NoName'])
        })
        .passthrough()
        .refine(
            (data) => {
                if (data.selectionType === 'C' && !data.category) return false;
                if (data.selectionType !== 'C' && !data.class) return false;
                if (data.selectionType === 'G' && !data.student) return false;
                return true;
            },
            {
                message: 'Invalid data: required fields missing based on selectionType value.',
                path: ['selectionType']
            }
        ),

    delete: z.object({
        fmC_Id: deleteIdSchema('fmC_Id')
    })
};

export const feeTransactionWaivedOffSchema = {
    addOrUpdate: z
        .object({
            mi_id: z.number().int().nonnegative(),

            academicYear: z.string().min(1, 'Academic year is required'),

            class: z.string().nullable().optional(),
            section: z.string().nullable().optional(),
            student: z.string().nullable().optional(),

            feeHead: z.string().nullable().optional(),
            feeGroup: z.string().nullable().optional(),

            feeInstallments: z.array(z.string()).optional(),

            date: z
                .string()
                .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (yyyy-MM-dd)')
                .optional(),

            refundableType: z.enum(['Refundable', 'NonRefundable']),
            activeType: z.enum(['FineWaiveOff', 'CompleteFineWaiveOff']),
            mremarks: z.string().nullable().optional(),
            nameFormat: z.enum(['NameReg.No', 'Reg.NoName'])
        })
        .passthrough(),
    delete: z.object({
        fmC_Id: deleteIdSchema('fmC_Id')
    })
};

export const feePreadmissionTransactionSchema = {
    addOrUpdate: z.object({
        //asmaY_Id: z.number().int({ message: 'Academic Year is required' }),
        asmaY_Id: z.number({ message: 'Academic Year is required' }),
        // feeGroupId: z.number({ message: 'Fee Group is required' }),
        // categoryId: z.number({ message: 'Category is required' })

        feeGroupId: z.number().optional(),
        categoryId: z.number().optional()
    }),
    delete: z.object({
        fmA_Id: deleteIdSchema('fmA_Id')
    })
};
