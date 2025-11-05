export interface EarningDeductionType {
    HRMEDT_Id: number;
    HRMEDT_EarnDedType: string;
    HRMEDT_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterEarningsDeductionsResponse {
    success: boolean;
    message: string;
    data: {
        earningdetectionList: EarningsDeductionDetail[];
        eardettypeDropdown?: EarningDeductionType[];
        earningList?: EarningsDeductionDetail[];
        detectionList?: EarningsDeductionDetail[];
    };
}

export interface MasterEarningsDeductionsOnloadResponse {
    earningdetectionList?: EarningsDeductionDetail[];
    eardettypeDropdown?: EarningDeductionType[];
    eardettypelist?: EarningDeductionType[];
    earningList?: EarningsDeductionDetail[];
    detectionList?: EarningsDeductionDetail[];
    arrearlist?: any[];
    grosslist?: any[];
    retrunMsg?: string;
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
    HRMED_ReviseFlg: boolean;
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
    HRMED_ReviseFlg: boolean;
}
