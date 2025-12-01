import { z } from 'zod';

/**
 * Employee Type Schemas
 */
export const employeeTypeSchema = {
    addOrUpdate: z.object({
        HRMET_Id: z.number().optional(),
        MI_Id: z.number(),
        HRMET_EmployeeType: z
            .string()
            .min(1, 'Employee type is required')
            .max(50, 'Employee type must not exceed 50 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Employee type must contain only alphabets'),
        HRMET_ActiveFlag: z.boolean().default(true)
    })
};

/**
 * Group Type Schemas
 */
export const groupTypeSchema = {
    addOrUpdate: z.object({
        HRMGT_Id: z.number().optional(),
        MI_Id: z.number(),
        HRMGT_EmployeeGroupType: z
            .string()
            .trim()
            .min(1, 'Group type name is required')
            .max(50, 'Group type must not exceed 50 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Group type must contain only alphabets'),
        HRMGT_Code: z
            .string()
            .trim()
            .min(1, 'Code is required')
            .max(20, 'Code must not exceed 20 characters')
            .regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric'),
        HRMGT_Order: z.number().min(0, 'Order must be a positive number').max(9999999999, 'Order must not exceed 10 digits'),
        HRMGT_ActiveFlag: z.boolean().default(true)
    })
};

/**
 * Department Schemas
 */
export const departmentSchema = {
    addOrUpdate: z.object({
        HRMD_Id: z.number().optional(),
        MI_Id: z.number(),
        HRMD_DepartmentName: z
            .string()
            .min(1, 'Department name is required')
            .max(50, 'Department name must not exceed 50 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Department name must contain only alphabets'),
        HRMD_Order: z.number().min(0, 'Order must be a positive number').max(9999, 'Order must not exceed 4 digits').optional(),
        HRMD_InternalTrainingMinimumHrs: z
            .number()
            .min(0, 'Training hours must be a positive number')
            .max(99, 'Training hours must not exceed 2 digits')
            .optional(),
        HRMD_ActiveFlag: z.boolean().default(true)
    })
};

/**
 * Designation Schemas
 */
export const designationSchema = {
    addOrUpdate: z.object({
        HRMDES_Id: z.number().optional(),
        MI_Id: z.number(),
        HRMDES_DesignationName: z
            .string()
            .min(1, 'Designation name is required')
            .max(50, 'Designation name must not exceed 50 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Designation name must contain only alphabets'),
        HRMDES_BasicAmount: z
            .number()
            .min(0, 'Basic amount must be a positive number')
            .max(9999999999.99, 'Basic amount must not exceed 10 digits including decimals'),
        HRMDES_SanctionedSeats: z
            .number()
            .min(0, 'Sanctioned seats must be a positive number')
            .max(999, 'Sanctioned seats must not exceed 3 digits'),
        HRMDES_DisplaySanctionedSeatsFlag: z.boolean().default(false),
        HRMDES_Order: z.number().min(0, 'Order must be a positive number').max(9999, 'Order must not exceed 4 digits').optional(),
        HRMDES_ActiveFlag: z.boolean().default(true)
    })
};

/**
 * Grade Schemas
 */
export const gradeSchema = {
    addOrUpdate: z
        .object({
            HRMG_Id: z.number().optional(),
            MI_Id: z.number(),
            HRMG_GradeName: z
                .string()
                .min(1, 'Grade name is required')
                .max(50, 'Grade name must not exceed 50 characters')
                .regex(/^[a-zA-Z\s]+$/, 'Grade name must contain only alphabets'),
            HRMG_GradeDisplayName: z
                .string()
                .min(1, 'Display name is required')
                .max(50, 'Display name must not exceed 50 characters')
                .regex(/^[a-zA-Z\s]+$/, 'Display name must contain only alphabets'),
            HRMG_PayScaleFrom: z
                .number()
                .min(0, 'Pay scale from must be a positive number')
                .max(9999999999.99, 'Pay scale from must not exceed 10 digits including decimals'),
            HRMG_IncrementOf: z.number().min(0, 'Increment must be a positive number').max(999, 'Increment must not exceed 3 digits'),
            HRMG_PayScaleTo: z
                .number()
                .min(0, 'Pay scale to must be a positive number')
                .max(9999999999.99, 'Pay scale to must not exceed 10 digits including decimals'),
            HRMG_PayScaleRange: z.string().optional(),
            HRMG_Order: z.number().min(0, 'Order must be a positive number').max(9999, 'Order must not exceed 4 digits').optional(),
            HRMG_ActiveFlag: z.boolean().default(true)
        })
        .refine((data) => data.HRMG_PayScaleTo >= data.HRMG_PayScaleFrom, {
            message: 'Pay scale to must be greater than or equal to pay scale from',
            path: ['HRMG_PayScaleTo']
        })
};

export const departmentSalaryReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'At least one group type is required'),
    department: z.array(z.string()).min(1, 'At least one department is required'),
    designation: z.array(z.string()).min(1, 'At least one designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required')
});

export type DepartmentSalaryReportFormFields = z.infer<typeof departmentSalaryReportSchema>;

export const BankCashReportSchema = z.object({
    groupType: z.array(z.string()).min(1, 'At least one group type is required'),
    department: z.array(z.string()).min(1, 'At least one department is required'),
    designation: z.array(z.string()).min(1, 'At least one designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    bankCash: z.enum(['Bank', 'Cash', 'Cheque'], {
        required_error: 'Payment method is required'
    })
});

export type BankCashReportSchemaFormFields = z.infer<typeof BankCashReportSchema>;

export const SalaryCertificateSchema = z.object({
    groupType: z.array(z.string()).min(1, 'At least one group type is required'),
    department: z.array(z.string()).min(1, 'At least one department is required'),
    designation: z.array(z.string()).min(1, 'At least one designation is required'),
    month: z.string().min(1, 'Month is required'),
    year: z.string().min(1, 'Year is required'),
    employee: z.string().min(1, 'Employee is required')
});

export type FormFields = z.infer<typeof SalaryCertificateSchema>;

export const LoanReportSchema = z
    .object({
        groupType: z.array(z.string()).min(1, 'At least one group type is required'),
        department: z.array(z.string()).min(1, 'At least one department is required'),
        designation: z.array(z.string()).min(1, 'At least one designation is required'),
        reportType: z.enum(['All', 'Individual'], {
            required_error: 'Report type is required'
        }),
        month: z.string().optional(),
        year: z.string().optional(),
        employee: z.string().optional()
    })
    .refine(
        (data) => {
            if (data.reportType === 'All') {
                return data.month;
            }
            return true;
        },
        {
            message: 'Month are required for All',
            path: ['month']
        }
    )
    .refine(
        (data) => {
            if (data.reportType === 'All') {
                return data.year;
            }
            return true;
        },
        {
            message: 'Year are required for All',
            path: ['year']
        }
    )
    .refine(
        (data) => {
            if (data.reportType === 'Individual') {
                return data.employee;
            }
            return true;
        },
        {
            message: 'Employee is required for Individual',
            path: ['employee']
        }
    );

export type LoanReportFormFields = z.infer<typeof LoanReportSchema>;

export const ReportSchema = z
    .object({
        groupType: z.array(z.string()).min(1, 'Group Type is required'),
        department: z.array(z.string()).min(1, 'Department is required'),
        designation: z.array(z.string()).min(1, 'Designation is required'),
        reportType: z.enum(['Earning', 'Deduction']),
        earningHead: z.string().optional(),
        deductionHead: z.string().optional(),
        dateType: z.enum(['month', 'betweenDates']),
        month: z.string().optional(),
        year: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        employeeType: z.enum(['all', 'individual']),
        employee: z.string().optional()
    })
    .superRefine((data, ctx) => {
        if (data.reportType === 'Earning' && !data.earningHead) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Earning Head is required when Report Type is Earning',
                path: ['earningHead']
            });
        }

        if (data.reportType === 'Deduction' && !data.deductionHead) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Deduction Head is required when Report Type is Deduction',
                path: ['deductionHead']
            });
        }

        if (data.dateType === 'month') {
            if (!data.month) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Month is required when Date Type is Month',
                    path: ['month']
                });
            }
            if (!data.year) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Year is required when Date Type is Month',
                    path: ['year']
                });
            }
        }

        if (data.dateType === 'betweenDates') {
            if (!data.fromDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'From Date is required when Date Type is Between Dates',
                    path: ['fromDate']
                });
            }
            if (!data.toDate) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'To Date is required when Date Type is Between Dates',
                    path: ['toDate']
                });
            }

            if (data.fromDate && data.toDate) {
                const from = new Date(data.fromDate);
                const to = new Date(data.toDate);
                if (to < from) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'To Date must be after From Date',
                        path: ['toDate']
                    });
                }
            }
        }

        if (data.employeeType === 'individual' && !data.employee) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Employee is required when Employee Type is Individual',
                path: ['employee']
            });
        }
    });

export type ReportFormFields = z.infer<typeof ReportSchema>;
