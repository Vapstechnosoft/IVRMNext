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
            .min(1, 'Group type name is required')
            .max(50, 'Group type must not exceed 50 characters')
            .regex(/^[a-zA-Z\s]+$/, 'Group type must contain only alphabets'),
        HRMGT_Code: z
            .string()
            .min(1, 'Code is required')
            .max(20, 'Code must not exceed 20 characters')
            .regex(/^[a-zA-Z0-9]+$/, 'Code must be alphanumeric'),
        HRMGT_Order: z
            .number()
            .min(0, 'Order must be a positive number')
            .max(9999999999, 'Order must not exceed 10 digits'),
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
        HRMD_Order: z
            .number()
            .min(0, 'Order must be a positive number')
            .max(9999, 'Order must not exceed 4 digits')
            .optional(),
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
        HRMDES_Order: z
            .number()
            .min(0, 'Order must be a positive number')
            .max(9999, 'Order must not exceed 4 digits')
            .optional(),
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
            HRMG_IncrementOf: z
                .number()
                .min(0, 'Increment must be a positive number')
                .max(999, 'Increment must not exceed 3 digits'),
            HRMG_PayScaleTo: z
                .number()
                .min(0, 'Pay scale to must be a positive number')
                .max(9999999999.99, 'Pay scale to must not exceed 10 digits including decimals'),
            HRMG_PayScaleRange: z.string().optional(),
            HRMG_Order: z
                .number()
                .min(0, 'Order must be a positive number')
                .max(9999, 'Order must not exceed 4 digits')
                .optional(),
            HRMG_ActiveFlag: z.boolean().default(true)
        })
        .refine((data) => data.HRMG_PayScaleTo >= data.HRMG_PayScaleFrom, {
            message: 'Pay scale to must be greater than or equal to pay scale from',
            path: ['HRMG_PayScaleTo']
        })
};
