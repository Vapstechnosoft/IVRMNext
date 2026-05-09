export interface ILibraryMonthEndReportRequest {
    ASMAY_Id: number;
    IVRM_Month_Id: number;
    year: string;
    ieName?: string;
    LMRA_Id?: number; // Optional Library ID
}

export interface ILibraryMonthEndReportGridData {
    TOTALBOOK: number;
    AVAILBOOK: number;
    PURCHASECNT: number;
    DONATECNT: number;
    STDISSUECNT: number;
    STDRETURNCNT: number;
    STFISSUECNT: number;
    STFRETURNCNT: number;
    DEPISSUECNT: number;
    DEPRETURNCNT: number;
    GSTISSUECNT: number;
    GSTRETURNCNT: number;
    FINEAMOUNT: number;
    SMSCOUNT: number;
    EMAILCOUNT: number;
}

export interface ILibraryMonthEndReportInitialData {
    acdlist: Array<{
        asmaY_Id: number;
        asmaY_Year: string;
    }>;
    monthlist: Array<{
        ivrM_Month_Id: number;
        ivrM_Month_Name: string;
    }>;
}
