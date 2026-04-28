export interface IPDAReportIncome {
    amsT_Id: number;
    fyP_Id: number;
    payment_Mode: string;
    cashAmount: number;
    bankAmount: number;
    fyP_Tot_Amount: number;
}

export interface IPDAReportExpense {
    particular: string;
    pcreqtndeT_Amount: number;
}

export interface IPDAReportResponse {
    income: IPDAReportIncome[];
    expense: IPDAReportExpense[];
}

export interface IPDAReportParams {
    ASMAY_Id: number;
    From_Date: string;
    To_Date?: string;
}
