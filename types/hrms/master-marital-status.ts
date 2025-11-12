export interface MasterMaritalStatusResponse {
    success?: boolean;
    message?: string;
    data?: MaritalStatusDetail[] | {
        maritalstatusList: MaritalStatusDetail[];
    };
    maritalstatusList?: MaritalStatusDetail[];
    retrunMsg?: string;
    total?: number;
    page?: number;
    page_size?: number;
    // Legacy fields (for backward compatibility)
    IVRMMMS_Id?: number;
    MI_Id?: number;
    IVRMMMS_MaritalStatus?: string | null;
    IVRMMMS_ActiveFlag?: boolean | null;
    roleId?: number;
    CreatedDate?: string | null;
    UpdatedDate?: string | null;
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
