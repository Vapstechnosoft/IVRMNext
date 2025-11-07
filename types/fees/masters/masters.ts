export interface IMasterPaymentGatewayList {
    fpgD_Id: number;
    fpgD_AuthorisationKey: string;
    fpgD_Image: string;
    fpgD_MerchantId: string;
    fpgD_MobileActiveFlag: boolean;
    fpgD_PGName: string;
    fpgD_SaltKey: string;
    fpgD_SubMerchantId: string;
    fpgD_URL: string;
    gatewayName: string;
    fpgD_AccNo: string;
    fpgD_PGActiveFlag: string;
    fpgD_MerchantKey: string;
    submerchantIds: string;
    impG_Id: number;
}

export interface IFineSlabList {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

export interface IMasterConcession {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

//fees masters
export interface IMasterClassList {
    asmcL_Id: number;
    asmcL_ClassCategoryCode: string;
    asmcL_ClassCategoryName: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}

export interface IMasterClassYearlyCategoryList {
    asmcC_Id: number;
    asmaY_Year: string;
    amC_Name: string;
    asmcL_ClassName: string;
    is_Active: boolean;
    mi_id: number;
}

//installment fees

export interface IMasterFeesInstallmentList {
    fmI_Id: number;
    mI_Id: number;
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    ftI_Name?: string;
    fmI_ActiceFlag?: boolean | number;
    installments?: Array<{
        sno?: number;
        ftI_Id?: number;
        ftI_Name?: string;
        fdate?: string;
        tdate?: string;
        aplc?: string;
        ddate?: string;
    }>;
}
//groups
export interface IMasterGroupList {
    fmG_Id: number;
    mI_Id: number;
    fmG_GroupName: string;
    fmG_Remarks: string;
    fmG_CompulsoryFlag: string;
    fmG_ActiceFlag: boolean;
    user_id: number;
    fmG_PRE_FLAG: string;
    fmG_TransportFlg: boolean;
    fmG_HostelFlg: boolean;
    fmG_BatchwiseFeeApplFlg: boolean;
    fmG_RegNewFlg: string;
    createdDate: string;
    updatedDate: string;
}

export interface IFeeHeadsList {
    fmH_Id: number;
    mI_Id: number;
    fmH_FeeName: string;
    fmH_Flag: string;
    fmH_ActiveFlag: boolean;
    fmH_Order: number;
    fmH_SpecialFeeFlag: boolean;
    fmH_PDAFlag: boolean;
    fmH_RefundFlag: boolean;
}

export interface IModeOfPaymentList {
    ivrmmoD_Id: number;
    mI_Id: number;
    ivrmmoD_ModeOfPayment: string;
    ivrmmoD_ModeOfPayment_Code: string;
    ivrmmoD_ActiveFlag: boolean;
}

//used category
export interface IMasterClassYearlyList {
    fmG_GroupName: string;
    fmG_Id: any;
    asmcl_ActiveFlag: boolean;
    asmcL_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    fmcC_Id: string;
    fmcC_ClassCategoryName: string;
    fycC_ActiveFlag: boolean;
    asmcL_ClassName: string;
    fyccC_Id: number;
    fycC_Id: number;
}

export interface IMasterCasteCategoryList {
    fmcC_Id: number;
    mI_Id: number;
    fyccC_Id: number;
    fmcC_ClassCategoryName: string;
    imcC_CategoryDesc: string;
    fmcC_ClassCategoryCode: string;
    fmcC_ActiveFlag: boolean;
}

export interface IMaasterFeesYearlyGrouping {
    grouplist: never[];

    fyG_Id: number;
    fmG_GroupName: string;
    fyG_ActiveFlag?: boolean;
    fyG_PartialRebateAmtOrPercentageValue?: number | string;
    fyG_RebateApplicableFlg?: boolean;
    fyG_RebateTypeFlg?: string | boolean;
    asmaY_Year?: string;
    asmaY_Id?: number;
    mI_Id?: number;
    fmG_Id?: number;
    createdDate?: string;
}

export interface IMasterConcessionDetails {
    fmfS_Id: number;
    fmfS_ToDay: number;
    fmfS_FromDay: number;
    fmfS_FineType: string;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
}

export interface IMasterInstallmentsDropdownList {
    ftI_ID: number;
    ftI_NAME: string;
}

export interface IMasterTermDropdownList {
    fmT_Id: number;
    fmT_Name: string;
}

export interface IMasterHeadDropdownList {
    fmH_Id: number;
    fmH_Flag: string;
    fmH_FeeName: string;
}
export interface IMasterTermFeeHeadList {
    fmT_Id: number;
    fmT_Name: string;
    fmT_IncludeArrearFeeFlg: boolean;
    fmT_ActiveFlag: boolean;
    termname: string;
    headname: string;
    installmentname: string;
    idforedt: number;
    fmH_Id: number;
    ftI_Id: number;
    heads?: { fmH_Id: number }[];
    installments?: { ftI_ID: number }[];
}

export interface IMasterTermsList {
    fmT_Id: number;
    fmT_Name: string;
    fmT_IncludeArrearFeeFlg: boolean;
    fmT_ActiveFlag: boolean;
}

export interface IMasterpaymentGatewayDropdownList {
    impG_Id: number;
    impG_PGName: string;
}

export interface IMasterGroupWiseAutoReciptList {
    asmaY_Id: any;
    asmcL_Id: number;
    fmcC_Id: any;
    fyccC_Id: number;
    asmaY_Year: string;
    fmcC_ClassCategoryName: string;
    asmcL_ClassName: string;
    prefix: string;
    suffix: string;
    startingNumber: string;
    groups: string;
    autoGroupName: string;
    address: string;
    receiptTemplateFormat: string;
    fycC_ActiveFlag: boolean;
}

//used rebate settings
export interface IMasterYearlyRebateSettingsList {
    asmcl_ActiveFlag: boolean;
    asmaY_Id: number;
    asmaY_Year: string;
    fyG_PartialRebate: string;
    fyG_PartialRebateAmtOrPercentageValue?: number | string;
    fyg_date: string;
}

export interface IMasterGroupsGrouping {
    selectedFeeGroups: any;
    fmgG_Id: number;
    fmgG_GroupName: string;
    fmgG_GroupCode: string;
    feeGroupName: string;
    selectedFeeGroupIds: number[];
}
//used for fee previlege
export interface IMasterFeePrevilegeList {
    asmcl_ActiveFlag: boolean;
    asmaY_Id: number;
    asmaY_Year: string;
    ifp_Id: number;
    ifp_FeePrevilegeName: string;
    ifp_Description: string;
    ifp_ActiveFlag: boolean;
}

export interface IAcademicYearDropDown {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
}

// Group dropdown
export interface IMasterGroupDropdown {
    groupId: number;
    groupName: string;
}

export interface IMasterRoleDropdown {
    roleId: number;
    roleName: string;
}

export interface IMasterOnlinePaymentHeadgroupList {
    fopM_Id(fopM_Id: any): unknown;
    fmcC_Id: number;
    mI_Id: number;
    institutionName: string;
    classCategory: string;
    subMerchantId: string;
    groupName: string;
    headSearchTerm: string;
    installmentName: string;
    terms: string;
    academicYear: string;
}

export interface IMasterFeeHeadDropdownList {
    mI_Id: number;
    fmH_Id: number;
    fmH_FeeName: string;
}

export interface IMasterFeeInstallmentDropdownList {
    fmI_Id: number;
    fmI_Name: string;
}
export interface IMasterFeeYearlyHeadGroupMapping {
    mi_Id: number;
    asmaY_Id: number;
    fmcC_Id: number;
    asmcL_Id: number;
    fyccC_Id: number;
    fmH_Id: number;
    fmI_Id: number;
}

export interface IMasterYearlyRebateList {
    asmaY_Id: number;
    fyG_PartialRebateAmtOrPercentageValue?: number | string;
    fyG_PartialRebateTypeFlg?: string;
    fyG_PartialRebateApplicableFlg?: boolean;
}

export interface InstallmentResponse {
    success: boolean;
    message: string;
    data: {
        feemasterinstalment: FeeMasterInstallment[];
        feeinstalmentlist: FeeInstallmentList[];
    };
}

export interface FeeMasterInstallment {
    fmI_Id: number;
    mI_Id: number;
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    fmI_ActiceFlag: boolean;
}

export interface FeeInstallmentList {
    ftI_Id: number;
    fmI_Id: number;
    ftI_Name: string;
}

export interface IMasterOnlinePaymentHeadgroupList {
    fmcC_Id: number;
    mI_Id: number;
    institutionName: string;
    classCategory: string;
    subMerchantId: string;
    groupName: string;
    className: string;
    headSearchTerm: string;
    installmentName: string;
    terms: string;
    academicYear: string;
}
export interface IMasterFeesInstallmentList {
    fmI_Id: number;
    mI_Id: number;
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    ftI_Name?: string;
    fmI_ActiceFlag?: boolean | number;
    installments?: Array<{
        sno?: number;
        ftI_Id?: number;
        ftI_Name?: string;
        fdate?: string;
        tdate?: string;
        aplc?: string;
        ddate?: string;
    }>;
}
export interface IMasterClassYearlyList {
    fmG_GroupName: string;
    fmG_Id: any;
    asmcl_ActiveFlag: boolean;
    asmcL_Id: number;
    asmaY_ID: number;
    asmaY_Year: string;
    fmcC_Id: string;
    fmcC_ClassCategoryName: string;
    fycC_ActiveFlag: boolean;
    asmcL_ClassName: string;
    fyccC_Id: number;
    fycC_Id: number;
}

export interface IMasterFeeHeadDropdownList {
    mI_Id: number;
    fmH_Id: number;
    fmH_FeeName: string;
}

export interface IMasterFeeInstallmentDropdownList {
    fmI_Id: number;
    fmI_Name: string;
}

export interface IMasterAllFeeHeadList {
    fyghM_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    fmG_Id: number;
    fmH_Id: number;
    fmI_Id: number;
    returnval: boolean;
    fmG_GroupName: string;
    fmH_FeeName: string;
    fmI_Name: string;
    userid: number;
    deleteId: number;
}
