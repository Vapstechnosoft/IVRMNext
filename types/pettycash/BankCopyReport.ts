export interface IBankCopyReportSummary {
    month: string;
    totalDebit: number;
    totalCredit: number;
    ivrM_Month_Id: number;
    asmaY_Year: string;
}

export interface IBankCopyReportDetail {
    PaymentDate: string;
    Particular: string;
    Voucher: string;
    TotalDebit: number;
    TotalCredit: number;
}

export interface IBankCopyReportParams {
    ASMAY_Id: number;
    IVRM_Month_Id: number;
    ASMAY_Year: string;
}

export interface IBankCopyReportResponse {
    bankreport: IBankCopyReportSummary[];
    getdebitcreditdetails?: IBankCopyReportDetail[];
}
