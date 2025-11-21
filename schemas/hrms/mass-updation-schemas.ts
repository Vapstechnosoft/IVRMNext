import { z } from 'zod';

/**
 * Mass Updation Schemas
 * Requirements:
 * Search Criteria:
 * - Group type – Mandatory - Drop down
 * - Department – Mandatory - Drop down
 * - Designation – Mandatory - Drop down
 * Employee Records:
 * - Earning - Radio buttons –select any one.
 * - Amount - Radio button – Should be able to select any one option.
 * - Head – Drop down – Select option
 * - Percentage – Decimal – (5,2)
 * - Action - Radio buttons – select any option.
 */

// Form schema matching the form interface
export const massUpdationFormSchema = z
    .object({
        groupType: z.array(z.string()).min(1, 'Group Type is required'),
        department: z.array(z.string()).min(1, 'Department is required'),
        designation: z.array(z.string()).min(1, 'Designation is required'),
        selectedHead: z.string().min(1, 'Head is required'),
        updateType: z.enum(['Percentage', 'Amount'], {
            required_error: 'Please select Amount or Percentage'
        }),
        updateValue: z.number().min(0, 'Value must be greater than or equal to 0'),
        effectiveDate: z.string().optional(),
        earningDeduction: z.enum(['Earning', 'Deduction'], {
            required_error: 'Please select Earning or Deduction'
        }),
        addRemove: z.enum(['Add', 'Remove'], {
            required_error: 'Please select an Action'
        })
    })
    .refine(
        (data) => {
            if (data.updateType === 'Percentage') {
                const str = data.updateValue.toString();
                const parts = str.split('.');
                return parts[0].length <= 3 && (parts[1]?.length || 0) <= 2;
            }
            return true;
        },
        {
            message: 'Percentage must be in decimal format (5,2)',
            path: ['updateValue']
        }
    );

export const massUpdationSchema = {
    search: z.object({
        groupType: z.array(z.string()).min(1, 'Group Type is required'),
        department: z.array(z.string()).min(1, 'Department is required'),
        designation: z.array(z.string()).min(1, 'Designation is required')
    }),
    update: z
        .object({
            MI_Id: z.number(),
            employeeIdList: z.array(z.number()).min(1, 'Please select at least one employee'),
            earningDeduction: z.enum(['Earning', 'Deduction'], {
                required_error: 'Please select Earning or Deduction'
            }),
            updateType: z.enum(['Amount', 'Percentage'], {
                required_error: 'Please select Amount or Percentage'
            }),
            selectedHead: z.string().min(1, 'Head is required'),
            updateValue: z.number().min(0, 'Value must be greater than or equal to 0'),
            addRemove: z.enum(['Add', 'Remove'], {
                required_error: 'Please select an Action'
            }),
            LogInUserId: z.number().optional()
        })
        .refine(
            (data) => {
                if (data.updateType === 'Percentage') {
                    const str = data.updateValue.toString();
                    const parts = str.split('.');
                    return parts[0].length <= 3 && (parts[1]?.length || 0) <= 2;
                }
                return true;
            },
            {
                message: 'Percentage must be in decimal format (5,2)',
                path: ['updateValue']
            }
        )
};
