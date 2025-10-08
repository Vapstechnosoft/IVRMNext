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
