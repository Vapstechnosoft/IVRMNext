export interface MasterEarningsDeductionsResponse {
    success: boolean;
    message: string;
    data: {
        earningdetectionList: EarningsDeductionDetail[];
    };
}

export interface EarningsDeductionDetail {
    HRMED_Id: number;
    MI_Id: number;
    HRMED_Name: string;
    HRMED_EDTypeFlag: string;
    HRMED_EarnDedFlag: string;
    HRMED_AmountPercentFlag: string;
    HRMED_AmountPercent: string;
    HRMED_ActiveFlag: boolean;
    HRMED_RoundOffFlag: string;
    HRMED_Order: number;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterEarningsDeductionsInput {
    HRMED_Id?: number;
    MI_Id: number;
    HRMED_Name: string;
    HRMED_EDTypeFlag: string;
    HRMED_EarnDedFlag: string;
    HRMED_AmountPercentFlag: string;
    HRMED_AmountPercent: string;
    HRMED_ActiveFlag: boolean;
    HRMED_RoundOffFlag: string;
    HRMED_Order?: number;
}
