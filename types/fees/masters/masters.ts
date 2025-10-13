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
}

export interface IMasterClassYearlyList {
    asmcL_Id: number;
    asmcL_AcademicYear: string;
    asmcL_ClassCategory: string;
    asmcL_Classes: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}

export interface IMasterClassYearlyCategoryList {
    asmcC_Id: number;
    asmaY_Year: string;
    amC_Name: string;
    asmcL_ClassName: string;
    is_Active: boolean;
}

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

//Groups Grouping
export interface IMasterGroupsGrouping {
    imgg_Id: number;
    imgg_GroupingName: string;
    imgg_Group_Code: string;
    imgg_feeGroupIds?: string | undefined;
    immgg_feeGroupNames: string;
    imgg_ActiveFlag: boolean;
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

export interface IMasterClassYearlyList {
    asmcL_Id: number;
    asmcL_AcademicYear: string;
    asmcL_ClassCategory: string;
    asmcL_Classes: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}

//installment fees

export interface IMasterFeesInstallmentList {
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    ftI_Name: string;
    mI_ID: 30;
    fmI_Id: number;
    fmI_ActiveFlag: boolean;
}
//groups
export interface IMasterGroupList {
    ivrmmoD_Id: number;
    mI_Id: number;
    ivrmmoD_MasterGroup: string;
    ivrmmoD_MasterGroup_Code: string;
    ivrmmoD_Transport: boolean;
    ivrmmoD_Hostel: boolean;
    ivrmmoD_Compulsory: boolean;
    ivrmmoD_Regular: boolean;
    ivrmmoD_NewStudent: boolean;
    ivrmmoD_ActiveFlag: boolean;
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

export interface IMasterClassYearlyCategoryList {
    asmcC_Id: number;
    asmaY_Year: string;
    amC_Name: string;
    asmcL_ClassName: string;
    is_Active: boolean;
}
export interface IMasterClassList {
    asmcL_Id: number;
    asmcL_ClassCategoryCode: string;
    asmcL_ClassCategoryName: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}

export interface IMasterClassYearlyList {
    asmcL_Id: number;
    asmcL_AcademicYear: string;
    asmcL_ClassCategory: string;
    asmcL_Classes: string;
    asmcL_ActiveFlag: boolean;
    asmcL_ClassName: string;
}
