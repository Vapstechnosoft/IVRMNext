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

// export const paymentgatewaydetailsSchema = {
//     addOrUpdate: z.object({
//          mi_id: z.number().int(),
//         fpgD_Id: z.number().int().optional(),
//         fpgD_AuthorisationKey: z.string({ message: 'AuthorisationKey is required' }),
//         fpgD_Image: z.string({ message: 'Image is required' }),
//         fpgD_MerchantId: z.string({ message: 'MerchantId is required' }),
//         fpgD_PGName: z.string({ message: 'PGName is required' }),
//         fpgD_SaltKey: z.string({ message: 'SaltKey is required' }),
//         // fpgD_SubMerchantId: z.string({ message: 'SubMerchantId is required' }),
//         fpgD_URL: z.string().optional(),
//         // gatewayName: z.string({ message: 'gatewayName is required' }),
//         fpgD_AccNo: z.string({ message: 'AccNo is required' }),
//         fpgD_MerchantKey: z.string({ message: 'MerchantKey is required' }),
//         fpgD_MobileActiveFlag: z.boolean().optional(),
//         submerchantIds: z.array(z.object({ id: z.string() })).optional()
//     }),
//     delete: z.object({
//         FPGD_Id: deleteIdSchema('FPGD_Id')
//     })
// };
export const paymentgatewaydetailsSchema = {
    addOrUpdate: z.object({
        fpgD_MerchantId: z.string().min(1, 'Merchant ID is required'),
        fpgD_SaltKey: z.string().min(1, 'Salt Key is required'),
        fpgD_Image: z.string().min(1, 'Image is required'),
        fpgD_URL: z.string().min(1, 'URL is required'),
        fpgD_AccNo: z.string().min(1, 'Account Number is required'),
        fpgD_MerchantKey: z.string().min(1, 'Merchant Key is required'),
        impG_Id: z.number().int().optional(),
        fpgD_MobileActiveFlag: z.boolean().optional()

        //     fpgD_MerchantId: z.string({ message: 'MerchantId is required' }),
        //   fpgD_SaltKey: z.string().min(1, 'Salt Key is required'),
        //   fpgD_Image: z.string().min(1, 'Image is required'),
        //   fpgD_URL: z.string().min(1, 'URL is required'),
        //   fpgD_AccNo: z.string().min(1, 'Account Number is required'),
        //   fpgD_PGName: z.string().min(1, 'PG Name is required')
        //   fpgD_MerchantKey: z.string().min(1, 'Merchant Key is required')
        //   ,
        //   impG_Id: z.number().int().optional()
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
        fmI_No_Of_Installments: z.number().optional(),
        installments: z
            .array(
                z.object({
                    sno: z.number(),
                    ftI_Name: z.string().min(1, { message: 'Installment name is required' })
                })
            )
            .optional()
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
        fyG_Id: z
            .number({
                required_error: 'Yearly Group ID is required',
                invalid_type_error: 'Yearly Group ID must be a number'
            })
            .refine((val) => val > 0, {
                message: 'Yearly Group ID must be greater than 0'
            })
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
            rebateApplicable: z.boolean().default(false),
            rebateType: z.enum(['Percentage', 'Amount']).nullable().optional(),
            rebateValue: z
                .union([
                    z
                        .string()
                        .transform((val) => {
                            const trimmed = val?.trim();
                            if (trimmed === '' || trimmed === null || trimmed === undefined) {
                                return undefined;
                            }

                            if (!/^\d*\.?\d*$/.test(trimmed)) {
                                throw new Error('Only numbers and a single decimal point are allowed');
                            }
                            return Number(trimmed);
                        })
                        .refine((val) => val === undefined || !Number.isNaN(val), {
                            message: 'Rebate Value must be a valid number'
                        }),
                    z.number(),
                    z.undefined()
                ])
                .optional(),
            feeGroupIds: z.array(z.number()).min(1, { message: 'Select at least one Fee Group' })
        })
        .superRefine((data, ctx) => {
            if (data.rebateApplicable) {
                if (!data.rebateType) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['rebateType'],
                        message: 'Rebate Type is required when rebate is applicable'
                    });
                }
                if (data.rebateValue === undefined || data.rebateValue === null || Number.isNaN(Number(data.rebateValue))) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['rebateValue'],
                        message: 'Rebate Value is required and must be a valid number when rebate is applicable'
                    });
                } else if (data.rebateType === 'Percentage') {
                    if (data.rebateValue < 0 || data.rebateValue > 100) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['rebateValue'],
                            message: 'Percentage must be between 0 and 100'
                        });
                    }
                } else if (data.rebateType === 'Amount') {
                    if (data.rebateValue < 0) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ['rebateValue'],
                            message: 'Amount cannot be negative'
                        });
                    }
                }
            }
        }),

    delete: z.object({
        fyG_Id: deleteIdSchema('fyG_Id')
    })
};
//term,concession,ter fee head

export const masterConcessionSchema = {
    addOrUpdate: z.object({
        fmcC_Id: z.number().int().optional(),
        fmcC_ConcessionName: z.string({ message: 'ConcessionName is required' }),
        fmcC_ConcessionApplLimit: z.number({
            message: 'ConcessionApplLimit is required'
        }),
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

export const masterConcessionDetailsSchema = {
    addOrUpdate: z.object({
        fmcC_Id: z.number().int().optional(),
        fmcC_ConcessionName: z.string({ message: 'ConcessionName is required' }),
        fmcC_ConcessionApplLimit: z.number({
            message: 'ConcessionApplLimit is required'
        }),
        fmcC_ConcessionFlag: z.string().optional(),
        fmcC_ActiveFlag: z.boolean().optional()
    }),
    delete: z.object({
        // fmcC_Id: deleteIdSchema('fmcC_Id')
    })
};

export const feeConfigSchema = {
    addOrUpdate: z.object({
        fmC_Id: z.number().int().optional(),
        FMC_GroupOrTermFlg: createStringSchema('FMC_GroupOrTermFlg', 1, 1), // “T” or “G”
        FMC_ArrearAfterFlag: z.boolean().optional(),
        FMC_Areawise_FeeFlg: z.number().int().optional(),
        FMC_TransportFeeAreaFlag: z.boolean().optional(),
        FMC_TransportFeeZoneFlag: z.boolean().optional(),
        FMC_DOACheckFlag: z.boolean().optional(),
        FMC_GroupRemarksFlag: z.boolean().optional(),
        FMC_AutoReceiptFeeGroupFlag: z.boolean().optional(),
        FMC_Receipt_Format: z.boolean().optional(),
        FMC_EableStaffTrans: z.boolean().optional(),
        FMC_EableOtherStudentTrans: z.boolean().optional(),
        FMC_FineEnableDisable: z.boolean().optional(),
        FMC_FineMapping: z.boolean().optional(),
        FMC_USER_PREVILEDGE: z.boolean().optional(),
        FMC_StaffConcessionCheck: z.boolean().optional(),
        FMC_ShowPreviousFeeFisrtFlg: z.boolean().optional(),
        FMC_MakerCheckerReqdFlg: z.boolean().optional(),
        FMC_RebateAplicableFlg: z.boolean().optional(),
        FMC_RebateAgainstFullPaymentFlg: z.boolean().optional(),
        FMC_RebateAgainstPartialPaymentFlg: z.boolean().optional(),
        // Receipt Settings
        FMC_RInstallmentsFlag: z.boolean().optional(),
        FMC_RInstallmentsMergeFlag: z.boolean().optional(),
        FMC_RFineFlag: z.boolean().optional(),
        FMC_RConcessionFlag: z.boolean().optional(),
        FMC_RWaivedFlag: z.boolean().optional(),
        FMC_RBalanceFlag: z.boolean().optional(),
        FMC_RAmountFlag: z.boolean().optional(),
        FMC_RBankFlag: z.boolean().optional(),
        FMC_ChallanOptionFlag: z.boolean().optional(),
        FMC_RDueDateFlag: z.boolean().optional(),
        FMC_RAddressFlag: z.boolean().optional(),
        // Fee Receipt Heads
        FMC_RFeeHeaderFlag: z.boolean().optional(),
        FMC_RClassFlag: z.boolean().optional(),
        FMC_RSectionFlag: z.boolean().optional(),
        FMC_RUserNameFlag: z.boolean().optional(),
        FMC_RFatherNameFlag: z.boolean().optional(),
        FMC_MotherNameFlag: z.boolean().optional(),
        FMC_RHeaderTitleFlag: z.boolean().optional(),
        FMC_RPaymentDetailsFlag: z.boolean().optional(),
        FMC_RAmountReceivedFlag: z.boolean().optional(),
        FMC_RRemarksFlag: z.boolean().optional(),
        FMC_RCurrentDateFlag: z.boolean().optional(),
        // Daily Collection
        FMC_Fine_Column: z.boolean().optional(),
        FMC_ArrearColumn: z.boolean().optional(),
        // Account Setting
        FMC_StudentwiseJVFlag: createStringSchema('FMC_StudentwiseJVFlag', 1, 1), // “S” or “H”
        // Fee Print Option
        FMC_RFeeGroupFeeHeadFlag: z.boolean().optional(),
        FMC_RSplFeeHeadFlag: z.boolean().optional(),
        FMC_fmC_AutoRecieptPrintFlag: z.boolean().optional(),
        PartialPayment: z.string().optional(),
        FinancialAccount: z.string().optional(),
        Rebate: z.string().optional()
    }),
    delete: z.object({
        fmC_Id: deleteIdSchema('fmC_Id')
    })
};
export const masterClassYearlyGroupMappingSchema = {
    addOrUpdate: z.object({
        academicYear: z.string().min(1, { message: 'Academic Year is required' }),
        usePrefix: z.boolean(),
        useSuffix: z.boolean(),
        prefixValue: z.string().optional(),
        suffixValue: z.string().optional(),
        // startingNumber: z
        //   .string()
        //   .min(1, { message: 'Starting Number is required' })
        //   .refine((value) => !isNaN(Number(value)) && Number(value) >= 0, {
        //     message: 'Starting Number must be a valid non-negative number'
        //   }),
        groups: z.array(z.string()).min(1, { message: 'At least one group must be selected' }),
        autoGroupName: z.string().min(1, { message: 'Auto Group Name is required' }),
        address: z.string().optional(),
        receiptTemplateFormat: z.string().optional()
    })
};
