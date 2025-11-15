export interface MasterEmployeeTypeResponse {
    HRMET_Id: number;
    MI_Id: number;
    HRMET_EmployeeType: string | null;
    HRMET_ActiveFlag: boolean;
    employeeTypeList: EmployeeTypeDetail[];
    retrunMsg: string;
    roleId: number;
    CreatedDate: string | null;
    UpdatedDate: string | null;
}

export interface EmployeeTypeDetail {
    HRMET_Id: number;
    MI_Id: number;
    HRMET_EmployeeType: string;
    HRMET_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterEmployeeTypeInput {
    HRMET_Id?: number;
    MI_Id: number;
    HRMET_EmployeeType: string;
    HRMET_ActiveFlag: boolean;
}

export interface OnloadGetEmployeeTypeDetailsRequest {
    CreatedDate?: string;
    UpdatedDate?: string;
    HRMET_Id: number;
    MI_Id: number;
    HRMET_EmployeeType: string;
    HRMET_ActiveFlag: boolean;
    employeeTypeList: Array<{
        HRMET_Id: number;
        MI_Id: number;
        HRMET_EmployeeType: string;
        HRMET_ActiveFlag: boolean;
        CreatedDate: string;
        UpdatedDate: string;
    }>;
    retrunMsg: string;
    roleId: number;
}

export interface SaveEmployeeTypeRequest {
    CreatedDate: string;
    UpdatedDate: string;
    HRMET_Id: number;
    MI_Id: number;
    HRMET_EmployeeType: string;
    HRMET_ActiveFlag: boolean;
    employeeTypeList: Array<{
        CreatedDate: string;
        UpdatedDate: string;
        HRMET_Id: number;
        MI_Id: number;
        HRMET_EmployeeType: string;
        HRMET_ActiveFlag: boolean;
    }>;
    retrunMsg: string;
    roleId: number;
}
