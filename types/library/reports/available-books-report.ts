export interface IAvailableBooksReportInitialData {
    msterliblist1: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;

    deptlist: Array<{
        lmD_Id: number;
        lmD_DepartmentName: string;
    }>;
}

export interface IAvailableBooksReportRequest {
    Type: string;
    Type2: string;
    Fromdate?: string;
    ToDate?: string;
    LMD_Id: number;
    statuscount: boolean;
    LMAL_Id: number;
}

export interface IAvailableBooksReportGridData {
    lmb_EntryDate: string;
    lmbano_AccessionNo: string;
    lmb_BookTitle: string;
    lmb_ISBNNo: string;
    lmb_CallNo: string;
    lmb_ClassNo: string;
    lmb_NetPrice: number;
    lmb_BookType: string;
    lmd_DepartmentName: string;
    authorName: string;
    lmp_PublisherName: string;
    lml_LanguageName: string;
    lms_SubjectName: string;
    lmb_PurOrDonated: string;
}

export interface IAvailableBooksReportResponse {
    griddata: IAvailableBooksReportGridData[];
}
