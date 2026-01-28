export interface IBookCirculationReportInitialData {
    lib_list: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
    classList?: Array<{
        asmcL_Id: number;
        asmcL_ClassName: string;
    }>;
    sectionList?: Array<{
        asmS_Id: number;
        asmC_SectionName: string;
    }>;
    // Other fields if needed from API
}

export interface IBookCirculationReportRequest {
    Type: string; // Book Type: all, Issue, Reference, etc.
    AGType: 'Student' | 'Staff' | 'Guest' | 'Department' | 'all';
    TrnType: string; // Transaction Status: all, Issue, Return
    IssueFromDate?: string;
    IssueToDate?: string;
    DueFromdate?: string;
    DueTodate?: string;
    LMAL_Id: number;
    selectedClasslist?: Array<{ asmcL_Id: number }>;
    selectedSectionlist?: Array<{ asmS_Id: number }>;
}

// Union of all possible fields for different member types
export interface IBookCirculationReportGridData {
    lmb_BookTitle: string;
    lmbano_AccessionNo: string;
    lbtr_Status: string;
    lbtr_IssuedDate: string;
    lbtr_DueDate: string;
    lbtr_ReturnedDate: string | null;
    lbtr_FineCollected: number;
    lbtr_TotalFine: number;
    lmb_BookType: string;

    // Student specific
    amsT_AdmNo?: string;
    amsT_Name?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
    amaY_RollNo?: string;
    latedays?: number;

    // Staff specific
    empName?: string;
    hrmE_EmployeeCode?: string;

    // Guest specific
    lbtR_GuestName?: string;
    lbtR_GuestEmailId?: string;
    lbtR_GuestContactNo?: string;

    // Department specific
    hrmD_DepartmentName?: string;
}

export interface IBookCirculationReportResponse {
    reportlist: IBookCirculationReportGridData[];
}
