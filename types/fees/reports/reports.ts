export interface IFeeAcademicYearDropdownList {
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export interface IFeeGroupDropdownList {
    fmG_Id: number;
    fmG_GroupName: string;
}

export interface IFeeTermDropdownList {
    fmT_Id: number;
    fmT_Name: string;
}

export interface IFeeBusRouteDropdownList {
    trmR_Id: number;
    trmR_RouteName: string;
}

export interface IFeeCustomGroupDropdownList {
    fmgG_Id: number;
    fmgG_GroupName: string;
}

export interface IFeeClassDropdownList {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface IFeeSectionDropdownList {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IFeeAuditReport {
    feeGroup: string;
    totalDue: number;
}

export interface IFeeDefaulterReportRow {
    feeGroup: string;
    totalDue: number;
    fsS_CurrentYrCharges: number;
    fsS_TotalToBePaid: number;
    fsS_ToBePaid: number;
    fsS_PaidAmount: number;
    fsS_ConcessionAmount: number;
    fsS_AdjustedAmount: number;
    fsS_WaivedAmount: number;
    fsS_RefundAmount: number;
    fsS_RunningExcessAmount: number;
    fsS_FineAmount: number;
}

export interface IDailyFeeCollectionResponse {
    success: boolean;
    message: string;
    data: IDailyFeeCollectionData;
    total?: number | null;
    page?: number | null;
    page_size?: number | null;
}

export interface IDailyFeeCollectionRequest {
    AsmayId: number;
    FromDate: string;
    ToDate: string;
    Headwise?: boolean;
    Paymentwise?: boolean;
    regornamedetails?: string;
    allorstdorothersflag?: string;
    ClassFlag?: string;
    allorindivflag?: string;
    allorcorchoronlineflag?: string;
    Cheque?: string;
    TempararyArrayListstring?: string;
    GroupFlag?: string;
    All_List?: { columnID: string }[];
}

export interface IDailyFeeCollectionData {
    listCode: string;
    listName: string;
    list: any[]; // dynamic per report type
}

export interface IFeeInstallmentDropdownList {
    // fmI_Id: number;
    // fmI_Name: string;
    //  fmI_Id: number;
    // fmI_Name: string;

    fmI_Id: number;
    mI_Id: number;
    fmI_Name: string;
    fmI_No_Of_Installments: number;
    fmI_Installment_Type: string;
    fmI_ActiceFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface FeeHeadAmounts {
    [feeHeadName: string]: number;
}

export interface HeadwiseListItem {
    date: string; // ISO string: "2025-01-02T00:00:00"
    totalPaidAmount: number;
    feeHeadAmounts: FeeHeadAmounts;
}

export interface FeeDailyCollectionHeadwiseResponse {
    listCode: string;
    listName: string;
    list: HeadwiseListItem[];
}

export interface IFeeYearlyCollectionReportRow {
    slNo: number;
    studentName: string;
    classSection: string;
    admissionNo: string;
    installmentName: string;
    totalPayable: number;
    paidAmount: number;
    balance: number;
    concession: number;
    arrear: number;
    excess: number;
    charge: number;
    adjustment: number;
}

export interface HeadwiseClassCategoryDropDown {
    fmcC_Id: number;
    fhwR_ClassCategoryName: string;
}

export interface HeadwiseReportData {
    fmG_GroupName: string;
    fmH_FeeName: string;
    fmcC_ClassCategoryName: string;
    ftI_Name: string;
    amount: number;
    fmG_ActiceFlag: boolean;
    fyghM_FineApplicableFlag: string;
}

export interface IFeeTrasactionInstallmentDropdownList {
    ftI_Id: number;
    ftI_InstallmentName: string;
}

export interface IduedateReportData {
    FTI_Id: number;
    FMG_GroupName: string;
    FMH_FeeName: string;
    FMI_Name: string;
    FTI_Name: string;
    FMCC_Id: number;
    FTDD_Month: number;
    FTDD_Day: number;
    FMFS_Id: number;
    FMFS_FineType: string;
    FTFS_Id: number;
    FTFS_FineType: string;
    FTFS_Amount: number;
    FTIDD_DueDate: string;
}

export interface FeeClassCategoryReportList {
    fmG_Id: number;
    fmG_GroupName: string;
    fmH_RefundFlag: boolean;
    fmH_PDAFlag: boolean;
    fmH_SpecialFeeFlag: boolean;
    fmH_Order: number;
    fmH_FeeName: string;
    fmH_Flag: string;
    fmH_Id: number;
    asmaY_Id: number;
    fmI_Name: string;
    fyghM_FineApplicableFlag: string;
    fyghM_Common_AmountFlag: string;
    ftI_Id: number;
    ftI_Name: string;
    fmI_Id: number;
    ftidD_ApplicableDate: string;
    ftidD_DueDate: string;
    ftidD_FromDate: string;
    ftidD_ToDate: string;
    fmfS_Id: number;
    fmfS_FineType: string;
    fmfS_FromDay: number;
    fmfS_ToDay: number;
    fmfS_ECSFlag: string;
    fmfS_ActiveFlag: boolean;
    mI_Id: number;
    fmcC_ClassCategoryName: string;
    asmC_SectionName: string;
    asmcL_Id: number;
    asmS_Id: number;
    asmcL_ClassName: string;
    fmcC_Id: number;
    normalizedUserName: string;
    ivrmrT_Role: string;
    user_Id: number;
    fmT_Id: number;
    fmT_Name: string;
    fmA_Amount: number;
    fmA_Id: number;
    ftfS_Amount: number;
    ftddE_Month: string;
    fmgG_GroupName: string;
    fmgG_Id: number;
}
