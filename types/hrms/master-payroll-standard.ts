export interface MasterPayrollStandardResponse {
    success: boolean;
    message: string;
    data: {
        hrStandardList: PayrollStandardDetail[];
    };
}

export interface PayrollStandardDetail {
    HRC_Id: number;
    MI_Id: number;
    HRC_PFMaxAmt: number;
    HRC_FPFPer: number;
    HRC_EPFPer: number;
    HRC_RetirementYrs: number;
    HRC_ESIMax: number;
    HRC_ESIEmplrCont: number;
    HRC_SalaryFromDay: number;
    HRC_SalaryToDay: number;
    HRC_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterPayrollStandardInput {
    HRC_Id?: number;
    MI_Id: number;
    HRC_PFMaxAmt: number;
    HRC_FPFPer: number;
    HRC_EPFPer: number;
    HRC_RetirementYrs: number;
    HRC_ESIMax: number;
    HRC_ESIEmplrCont: number;
    HRC_SalaryFromDay: number;
    HRC_SalaryToDay: number;
    HRC_ActiveFlag: boolean;
}
