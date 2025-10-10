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
