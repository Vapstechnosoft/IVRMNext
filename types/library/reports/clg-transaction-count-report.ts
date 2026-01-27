export interface ICLGTransactionCountReportRequest {
    statuscount: boolean;
    Issue_Date?: string;
    IssueToDate?: string;
    ASMAY_Id: number;
    LMAL_Id: number;
}

export interface ICLGTransactionCountReportGridData {
    // For Status Count = False (College Details)
    ASMCL_CourseName?: string; // Mapped from AMCO_CourseName
    AMB_BranchName?: string;
    AMSE_SEMName?: string;
    ACMS_SectionName?: string;
    STDCOUNT?: number; // Or seccount
    seccount?: number;

    // For Status Count = True (Transaction Type)
    LBTR_Status?: string;
}

export interface ICLGTransactionCountReportInitialData {
    yearlist: Array<{
        asmaY_Id: number;
        asmaY_Year: string;
    }>;
    msterliblist1: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
}
