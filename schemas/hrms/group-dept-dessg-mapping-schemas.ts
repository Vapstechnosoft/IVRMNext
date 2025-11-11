import { z } from 'zod';

/**
 * Group-Department-Designation Mapping Schema
 */
export const groupDeptDessgMappingSchema = {
    addOrUpdate: z.object({
        hrgtddS_Id: z.number().optional(),
        mI_Id: z.number(),
        hrmgT_Id: z.number().min(1, 'Please select a group type'),
        hrmD_Id: z.number().min(1, 'Please select a department'),
        hrmdeS_Id: z.number().optional(),
        designationids: z.array(z.number()).min(1, 'Please select at least one designation'),
        hrgtddS_ActiveFlg: z.boolean().default(true),
        hrgtddS_CreatedBy: z.number().optional(),
        logInUserId: z.number().optional()
    })
};
