export interface ILibLostBookReportRequest {
    BookType: string;
    BNBFlg: string;
    Fromdate?: string;
    ToDate?: string;
    LMAL_Id: number;
}

export interface ILibLostBookReportGridData {
    LMBANO_AccessionNo: string;
    LMB_BookTitle: string;
    LMBANO_AvialableStatus: string;
    LMBANO_AmountCollected: number;
    LMBANO_ModeOfPayment: string;
    LMBANO_LostDamagedReason: string;
    LMBANO_LostDamagedDate: string;
}

export interface ILibLostBookReportInitialData {
    lib_list: Array<{
        lmaL_Id: number;
        lmaL_LibraryName: string;
    }>;
}
