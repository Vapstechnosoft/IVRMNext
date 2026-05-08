export interface IAvailableBooksReportInitialData {
    libraryList: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;

    departmentList: Array<{
        lmD_Id: number;
        lmD_DepartmentName: string;
    }>;
}

export interface IAvailableBooksReportRequest {
    type: string;
    type2: string;
    fromdate?: string;
    toDate?: string;
    lmD_Id: number;
    statuscount: boolean;
    lmaL_Id: number;
    subjectsthomos: boolean;
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
