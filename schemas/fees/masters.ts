import { z } from 'zod';
import { createStringSchema, deleteIdSchema } from '../validationSchemas';

export const loginSchema = z.object({
    email: z.string({ message: 'Email is required' }),
    password: createStringSchema('Password', 6, 50)
});

export const masterFeeheadSchema = {
    addOrUpdate: z.object({
        fmH_Id: z.number().optional(),
        fmH_FeeName: createStringSchema('fmH_FeeName', 1, 100),
        fmH_Order: z.number().int({ message: 'fmH_Order is required' }),
        fmH_Flag: createStringSchema('fmH_Flag', 1, 100),
        fmH_RefundFlag: z.boolean().optional(),
        fmH_PDAFlag: z.boolean().optional(),
        fmH_SpecialFeeFlag: z.boolean().optional()
    }),
    delete: z.object({
        fmH_Id: deleteIdSchema('fmH_Id')
    })
};

export const masterModeOfPaymentSchema = {
    addOrUpdate: z.object({
        ivrmmoD_Id: z.number().int({ message: 'ivrmmoD_Id is required' }).optional(),
        ivrmmoD_ModeOfPayment: createStringSchema('ivrmmoD_ModeOfPayment', 1, 100),
        ivrmmoD_ModeOfPayment_Code: createStringSchema('ivrmmoD_ModeOfPayment_Code', 1, 100)
    }),
    delete: z.object({
        ivrmmoD_Id: deleteIdSchema('ivrmmoD_Id')
    })
};

export const paymentgatewaydetailsSchema = {
    addOrUpdate: z.object({
        fpgD_Id: z.number().int({ message: 'fpgD_Id is required' }).optional(),
        fpgD_AuthorisationKey: z.string({ message: 'AuthorisationKey is required' }),
        fpgD_Image: z.string({ message: 'Image is required' }),
        fpgD_MerchantId: z.string({ message: 'erchantId is required' }),
        fpgD_PGName: z.string({ message: 'PGName is required' }),
        fpgD_SaltKey: z.string({ message: 'SaltKey is required' }),
        fpgD_SubMerchantId: z.string({ message: 'SubMerchantId is required' }),
        fpgD_URL: z.string({ message: 'URL is required' }),
        gatewayName: z.string({ message: 'gatewayName is required' }),
        fpgD_AccNo: z.string({ message: 'AccNo is required' })
    }),
    delete: z.object({
        FPGD_Id: deleteIdSchema('FPGD_Id')
    })
};

export const fineslabSchema = {
    addOrUpdate: z
        .object({
            fmfS_Id: z.number().optional(),
            fmfS_FineType: z.enum(['Between', 'GreaterThan', 'LessThan'], {
                message: 'Fine Type is required'
            }),
            fmfS_FromDay: z.number({ message: 'From Day is required' }).optional(),
            fmfS_ToDay: z.number({ message: 'To Day is required' }).optional(),
            fmfS_ECSFlag: z.string({ message: 'ECS Flag is required' }).optional(),
            fmfS_ActiveFlag: z.boolean().optional()
        })
        .superRefine((data, ctx) => {
            const { fmfS_FineType, fmfS_FromDay, fmfS_ToDay } = data;

            if (fmfS_FineType === 'Between') {
                if (typeof fmfS_FromDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_FromDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'Enter From Day'
                    });
                }

                if (typeof fmfS_ToDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_ToDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'Enter To Day'
                    });
                } else if (typeof fmfS_FromDay === 'number' && fmfS_ToDay < fmfS_FromDay) {
                    ctx.addIssue({
                        path: ['fmfS_ToDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'To Day must be greater than or equal to From Day'
                    });
                }
            }

            if (fmfS_FineType === 'GreaterThan' || fmfS_FineType === 'LessThan') {
                if (typeof fmfS_FromDay !== 'number') {
                    ctx.addIssue({
                        path: ['fmfS_FromDay'],
                        code: z.ZodIssueCode.custom,
                        message: 'From Day is required'
                    });
                }
            }
        }),

    delete: z.object({
        fmfS_Id: z.number({ message: 'fmfS_Id is required for deletion' })
    })
};

// export const fineslabSchema = {
//     addOrUpdate: z.object({
//         fmfS_Id: z.number().optional(),
//         fmfS_ToDay: z.number().optional(),
//         fmfS_FromDay: z.number().optional(),
//         fmfS_FineType:z.string().optional(),
//         fmfS_ECSFlag: z.string().optional()
//     }),
//     delete: z.object({
//         fmfS_Id: deleteIdSchema('fmfS_Id')
//     })
// };

export const masterClassCategorySchema = {
    addOrUpdate: z.object({
        fmcC_Id: z.number().optional(),
        fmcC_ClassCategoryName: z.string().min(1, { message: 'Class Category Name is required' }),
        fmcC_ClassCategoryCode: z.string().min(1, { message: 'Class Category Code is required' }),
        mI_Id: z.number().optional(),
        fmcC_ActiveFlag: z.boolean().optional()
    }),
    delete: z.object({
        fmcC_Id: deleteIdSchema('fmcC_Id')
    })
};
export const masterClassSchema = {
    addOrUpdate: z.object({
        asmcl_id: z.number().optional(),
        asmcl_classcode: z.string().min(1, { message: 'Class Category Code is required' }),
        asmcl_classname: z.string().min(1, { message: 'Class Category Name is required' }),

        academicYearId: z.string().min(1, { message: 'Academic Year is required' }),
        categoryId: z.string().min(1, { message: 'Category is required' })
    }),

    delete: z.object({
        asmS_Id: deleteIdSchema('asmS_Id')
    })
};

export const masterGroupsGroupingSchema = {
    addOrUpdate: z.object({
        imgg_Id: z.number().optional(),
        imgg_GroupingName: z.string().min(1, { message: 'Grouping Name is required' }),
        imgg_Code: z.string().min(1, { message: 'Code is required' }),
        imgg_feeGroupIds: z.string().min(1, { message: 'Fee Group IDs are required' }),
        immgg_feeGroupNames: z.string().min(1, { message: 'Fee Group Names are required' }),
        imgg_ActiveFlag: z.boolean()
    }),
    delete: z.object({
        imgg_Id: z.number({ message: 'ID is required for deletion' })
    })
};

//installment fees

export const masterInstallmentSchema = {
    addOrUpdate: z.object({
        fmI_Name: z.string().min(1, { message: 'Master Installment Name is required' }),

        fmI_Installment_Type: z.string().min(1, { message: 'Installment Type is required' }),

        fmI_No_Of_Installments: z.number().min(1, { message: 'Number of installments must be at least 1' }).optional(),

        installments: z
            .array(
                z.object({
                    sno: z.number(),
                    ftI_Name: z.string().min(1, { message: 'Installment name is required' })
                })
            )
            .nonempty({ message: 'At least one installment is required' })
    }),
    delete: z.object({
        mI_ID: z.number().optional()
    })
};

export const masterGroupSchema = {
    addOrUpdate: z.object({
        fmG_Id: z.number().int().optional(),
        fmG_GroupName: z.string().min(1, { message: 'Fee Group is required' }).max(200),
        fmG_Remarks: z.string().min(1, { message: 'Remarks is required' }).max(500),
        transportHostelType: z.enum(['transport', 'hostel'], {
            required_error: 'Please select either Transport or Hostel'
        }),
        studentType: z.enum(['regular', 'newstudent'], {
            required_error: 'Please select student type'
        }),
        fmG_CompulsoryFlag: z.boolean().default(false)
    }),
    toggle: z.object({
        fmG_Id: z.number(),
        fmG_ActiceFlag: z.boolean()
    }),
    delete: z.object({
        fmG_Id: z.number().optional()
    })
};

export const masterInstallmentDueDateSchema = z.object({
    fmI_Name: z.string().min(1, { message: 'Academic Year is required' }),
    fmI_Installment_Type: z.string().min(1, { message: 'Installment type is required' }),
    fmI_No_Of_Installments: z.number().min(1, { message: 'Number of installments must be at least 1' }).optional(),
    installments: z
        .array(
            z.object({
                sno: z.number(),
                ftI_Name: z.string().min(1, { message: 'Installment name is required' }),
                fdate: z.string().optional(),
                tdate: z.string().optional(),
                aplc: z.string().optional(),
                ddate: z.string().optional()
            })
        )
        .min(1, { message: 'At least one installment is required' })
        .optional()
});

export const YearlyGroupSchema = {
    addOrUpdate: z
        .object({
            academicYear: z.string().min(1, { message: 'Academic Year is required' }),
            rebateApplicable: z.boolean(),
            rebateType: z.enum(['Percentage', 'Amount']).optional(),
            rebateValue: z.union([z.number(), z.literal('')]).optional(),
            feeGroupIds: z.array(z.number()).min(1, { message: 'Select at least one Fee Group' })
        })
        .refine(
            (data) => {
                if (data.rebateApplicable && !data.rebateType) {
                    return false;
                }
                return true;
            },
            {
                message: 'Rebate Type is required when rebate is applicable',
                path: ['rebateType']
            }
        )
        .refine(
            (data) => {
                if (
                    data.rebateApplicable &&
                    (data.rebateValue === '' || data.rebateValue === undefined || Number.isNaN(Number(data.rebateValue)))
                ) {
                    return false;
                }
                return true;
            },
            {
                message: 'Rebate Value is required and must be a valid number when rebate is applicable',
                path: ['rebateValue']
            }
        ),
    delete: z.object({
        fyG_Id: deleteIdSchema('fyG_Id')
    })
};

//term,concession,ter fee head

export const masterConcessionSchema = {
    addOrUpdate: z.object({
        fmcC_Id: z.number().int().optional(),
        fmcC_ConcessionName: z.string({ message: 'ConcessionName is required' }),
        fmcC_ConcessionApplLimit: z.number({ message: 'ConcessionApplLimit is required' }),
        fmcC_ConcessionFlag: z.string().optional(),
        fmcC_ActiveFlag: z.boolean().optional()
    }),
    delete: z.object({
        fmcC_Id: deleteIdSchema('fmcC_Id')
    })
};

export const masterTermsSchema = {
    addOrUpdate: z.object({
        fmT_Id: z.number().int().optional(),
        fmT_Name: z.string({ message: 'Term Name is required' }),
        fmT_IncludeArrearFeeFlg: z.boolean().optional(),
        fmT_ActiveFlag: z.boolean().optional()
    }),
    delete: z.object({
        fmT_Id: deleteIdSchema('fmT_Id')
    })
};

export const masterTermFeeHeadSchema = {
    addOrUpdate: z.object({
        heads: z.array(z.string()).nonempty('Please select at least one Head'),
        //    terms: z.array(z.string()).nonempty('Please select Term'),
        installments: z.array(z.string()).nonempty('Please select at least one Term'),
        fmT_Id: z.number({ message: 'Term is required' }),
        ftI_Id: z.number({ message: 'Installment is required' })
    }),
    delete: z.object({
        // FPGD_Id: deleteIdSchema('FPGD_Id')
    })
};
