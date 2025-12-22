import { z } from 'zod';
import { createStringOnlyOptionalSchema } from '../validationSchemas';

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

    Fmc_allorsudentorother: z.enum(['all', 'stud', 'preadm', 'other', 'Trpt', 'thirdparty', 'multiplepaymentmode']).default('all'),

    Fmc_allorcorddorop: z.enum(['All', 'C', 'B', 'O', 'Ecs', 'S', 'R', 'BT', 'U']).default('All'),

    storedTrans: z.boolean().default(false),
    thirdPartyTrans: z.boolean().default(false),
    pdaTrans: z.boolean().default(false)
});

export const yearlyFeeCollectionSchema = z.object({
    fromDate: z.string().optional(),

    toDate: z.string().optional()
});

export const headWiseReportSchema = z.object({
    asmaY_Id: z.number({ message: 'Academic Year is required' }),
    classcategoryid: z.number({ message: 'Class Category is required' })
});

export const feeMonthEndReportsSchema = z.object({
    fmtP_Year: z.string().min(1, 'Please select year'),
    asmay_Id: z.number({ message: 'Academic Year is required' }),
    iename: createStringOnlyOptionalSchema('IE Name', 1, 50),
    from_Month: z.string().min(1, 'Please select from month')
});

export const feeDefaulterReportSchema = z
    .object({
        userType: z.enum(['Students', 'Staff', 'Others']).default('Students'),

        viewMode: z.enum(['Yearly Wise', 'Date Wise']).default('Yearly Wise'),

        breakdown: z
            .enum([
                'FGW', // Fee Group Wise
                'FHW', // Fee Head Wise
                'FCW', // Class Wise
                'FIW', // Installment Wise
                'FSW', // Student/Staff Wise
                'FPW' // Parent Wise
            ])
            .default('FGW'),

        academicYearId: z.number({ message: 'Academic Year is required' }),

        includeClassSection: z.boolean().optional(),

        classId: z.number().optional(),

        sectionId: z.number().optional(),

        customGroupIds: z.array(z.number()).min(1, 'Please select at least one Custom Group'),

        //feeGroupIds: z.array(z.number()).min(1, 'Please select at least one Fee Group'),
        feeGroupIds: z.array(z.number()).min(1, 'Please select at least one Fee Group'),
        termIds: z.array(z.number()).min(1, 'Please select at least one Term'),

        busRouteIds: z.array(z.number()).optional(),

        status: z.object({
            active: z.boolean(),
            deactive: z.boolean(),
            left: z.boolean(),
            balance: z.boolean()
        }),

        formatI: z.boolean(),

        dueDate: z.date().optional(),

        dueDateType: z.enum(['Due Date', 'Till Due Date']).optional(),

        bulkDownload: z.boolean().optional()
    })
    .superRefine((data, ctx) => {
        // If class-section is enabled, class & section are required
        if (data.includeClassSection) {
            if (!data.classId || data.classId === 0) {
                ctx.addIssue({
                    path: ['classId'],
                    message: 'Class is required',
                    code: z.ZodIssueCode.custom
                });
            }

            if (!data.sectionId || data.sectionId === 0) {
                ctx.addIssue({
                    path: ['sectionId'],
                    message: 'Section is required',
                    code: z.ZodIssueCode.custom
                });
            }
        }

        // Date validation when Date Wise is selected
        if (data.viewMode === 'Date Wise' && !data.dueDate) {
            ctx.addIssue({
                path: ['dueDate'],
                message: 'Due date is required for Date Wise report',
                code: z.ZodIssueCode.custom
            });
        }
    });

export const feesClassCategoryReportSchema = {
    addOrUpdate: z.object({
        asmaY_Id: z.number({ required_error: 'Academic year is required' })
    })
};
