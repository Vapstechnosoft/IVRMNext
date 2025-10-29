export interface MasterLoanResponse {
    success: boolean;
    message: string;
    data: {
        gmasterloanList: MasterLoanDetail[];
    };
}

export interface MasterLoanDetail {
    HRMLN_Id: number;
    MI_Id: number;
    HRML_LoanType: string;
    HRML_Max: number;
    HRMLN_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterLoanInput {
    HRMLN_Id?: number;
    MI_Id: number;
    HRML_LoanType: string;
    HRML_Max: number;
    HRMLN_ActiveFlag: boolean;
}
