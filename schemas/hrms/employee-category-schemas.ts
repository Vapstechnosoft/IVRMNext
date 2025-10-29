import { z } from 'zod';

/**
 * Employee Type Schemas
 */
export const employeeTypeSchema = {
    addOrUpdate: z.object({
        HRMET_Id: z.number().optional(),
        MI_Id: z.number(),
        HRMET_EmployeeType: z.string().min(1, 'Employee type is required'),
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
        HRMGT_EmployeeGroupType: z.string().min(1, 'Group type name is required'),
        HRMGT_Code: z.string().min(1, 'Code is required'),
        HRMGT_Order: z.number().min(0, 'Order must be a positive number'),
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
        HRMD_DepartmentName: z.string().min(1, 'Department name is required'),
        HRMD_Order: z.number().min(0, 'Order must be a positive number').optional(),
        HRMD_InternalTrainingMinimumHrs: z.number().min(0, 'Training hours must be a positive number').optional(),
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
        HRMDES_DesignationName: z.string().min(1, 'Designation name is required'),
        HRMDES_BasicAmount: z.number().min(0, 'Basic amount must be a positive number'),
        HRMDES_SanctionedSeats: z.number().min(0, 'Sanctioned seats must be a positive number'),
        HRMDES_DisplaySanctionedSeatsFlag: z.boolean().default(false),
        HRMDES_Order: z.number().min(0, 'Order must be a positive number').optional(),
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
            HRMG_GradeName: z.string().min(1, 'Grade name is required'),
            HRMG_GradeDisplayName: z.string().min(1, 'Display name is required'),
            HRMG_PayScaleFrom: z.number().min(0, 'Pay scale from must be a positive number'),
            HRMG_IncrementOf: z.number().min(0, 'Increment must be a positive number'),
            HRMG_PayScaleTo: z.number().min(0, 'Pay scale to must be a positive number'),
            HRMG_PayScaleRange: z.string().optional(),
            HRMG_Order: z.number().min(0, 'Order must be a positive number').optional(),
            HRMG_ActiveFlag: z.boolean().default(true)
        })
        .refine((data) => data.HRMG_PayScaleTo >= data.HRMG_PayScaleFrom, {
            message: 'Pay scale to must be greater than or equal to pay scale from',
            path: ['HRMG_PayScaleTo']
        })
};
