export interface IBookArrivalReportInitialData {
    lib_list: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
    deptlist: Array<{
        lmD_Id: number;
        lmD_DepartmentName: string;
    }>;
}

export interface IBookArrivalReportRequest {
    Type: string;
    Type2: string;
    LMD_Id: number;
    Fromdate?: string;
    ToDate?: string;
    LMAL_Id: number;
}

export interface IBookArrivalReportGridData {
    lmbano_AccessionNo: string;
    lmb_BookTitle: string;
    lmb_ISBNNo: string;
    lmb_CallNo: string;
    lmb_ClassNo: string;
    lmb_BookType: string;
    lmd_DepartmentName: string;
    authorName: string;
    lmp_PublisherName: string;
    lml_LanguageName: string;
    lmb_PurOrDonated: string;
    lmb_EntryDate: string;
    lmb_PurchaseDate: string;
}

export interface IBookArrivalReportResponse {
    reportlist: IBookArrivalReportGridData[];
}
