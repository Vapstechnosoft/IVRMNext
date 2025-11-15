export interface MasterMaritalStatusResponse {
    IVRMMMS_Id: number;
    MI_Id: number;
    IVRMMMS_MaritalStatus: string | null;
    IVRMMMS_ActiveFlag: boolean | null;
    maritalstatusList: MaritalStatusDetail[];
    retrunMsg: string;
    roleId: number;
    CreatedDate: string | null;
    UpdatedDate: string | null;
}

export interface MaritalStatusDetail {
    IVRMMMS_Id: number;
    MI_Id: number;
    IVRMMMS_MaritalStatus: string;
    IVRMMMS_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterMaritalStatusInput {
    IVRMMMS_Id?: number;
    MI_Id: number;
    IVRMMMS_MaritalStatus: string;
    IVRMMMS_ActiveFlag: boolean;
}
