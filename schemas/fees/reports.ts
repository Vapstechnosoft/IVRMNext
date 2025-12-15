import { z } from 'zod';

export const feeAuditSchema = z.object({
    academicYearId: z.string().min(1, 'Academic Year is required'),
    fromDate: z.date().optional(),
    toDate: z.date().optional(),
    breakdown: z.string().optional()
});

export const dailyFeeCollectionSchema = z.object({
    report: z.enum(['All', 'students', 'staff', 'others']).default('students'),

    rpttyp: z.enum(['All', 'Individual']).default('Individual'),
    reportdate: z.enum(['transdate', 'settdate', 'SettledOnline']).default('transdate'),

    asmaY_Id: z.number().min(1, { message: 'Academic Year is required' }),

    groupIds: z.array(z.number()).min(1, { message: 'Select at least one Group' }),

    chequeDate: z.boolean().default(false),
    acdmyr: z.boolean().default(false),
    headwise: z.boolean().default(false),
    paymentwise: z.boolean().default(false),

    fromDate: z.string().min(1, { message: 'From Date is required' }),
    toDate: z.string().min(1, { message: 'To Date is required' }),

    enableAllClasses: z.boolean().default(false),
    asmcL_Id: z.number().optional(),

    Fmc_allorsudentorother: z.enum(['All', 'stud', 'preadm', 'other', 'Trpt', 'thirdparty', 'multiplepaymentmode']).default('All'),

    Fmc_allorcorddorop: z.enum(['All', 'C', 'B', 'O', 'Ecs', 'S', 'R', 'BT', 'U']).default('All'),

    storedTrans: z.boolean().default(false),
    thirdPartyTrans: z.boolean().default(false),
    pdaTrans: z.boolean().default(false)
});

export const yearlyFeeCollectionSchema = z.object({
    fromDate: z.string().optional(),

    toDate: z.string().optional()
});
