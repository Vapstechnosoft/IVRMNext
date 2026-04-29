export interface ILibLostBookReportRequest {
    bookType: string;
    bnbFlg: string;
    fromdate?: string;
    toDate?: string;
    lmaL_Id: number;
    IVRMUL_Id?: number;
    reportlist?: string[];
    lib_list?: string[];
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

export type ILibLostBookReportInitialData = Array<{
    lmaL_Id: number;
    lmaL_LibraryName: string;
    lmaL_ActiveFlag: boolean;
}>;
