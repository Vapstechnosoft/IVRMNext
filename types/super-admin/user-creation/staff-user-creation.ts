export interface RoleTypeDTO {
    ivrmrT_Id: number;
    ivrmrT_Role: string;
    Selected?: boolean;
}

export interface TrustDTO {
    mO_Id: number;
    mO_Name: string;
    Selected?: boolean;
}

export interface InstitutionDTO {
    mI_Id: number;
    mI_Name: string;
    Selected?: boolean;
}

export interface StaffDTO {
    hrmE_Id: number;
    stafname: string;
    Selected?: boolean;
}

export interface CategoryDTO {
    amC_Id: number;
    amC_Name: string;
    catid?: boolean;
}

export interface ModuleDTO {
    ivrmM_Id: number;
    ivrmM_ModuleName: string;
    model?: boolean;
}

export interface PageDTO {
    ivrmP_Id: number;
    ivrmmP_PageName: string;
    ivrmM_ModuleName: string;
    intname?: string;
    ivrmrP_AddFlag: boolean;
    ivrmrP_DeleteFlag: boolean;
    ivrmrP_UpdateFlag: boolean;
    ivrmrP_ProcessFlag: boolean;
    ivrmrP_ReportFlag: boolean;
    checked?: boolean;
}

export interface MobilePageDTO {
    ivrmmaP_Id: number;
    ivrmmaP_AppPageName: string;
    ivrmmaP_AddFlg: boolean;
    ivrmmaP_DeleteFlg: boolean;
    ivrmmaP_UpdateFlg: boolean;
    checked?: boolean;
}

export interface EmployeeListDTO {
    stafname: string;
    hrmE_EmployeeCode: string;
    user_Name: string;
}

export interface StaffUserCreationOnloadDTO {
    fillorganisation: TrustDTO[];
    fillinstitution: InstitutionDTO[];
    fillroletype: RoleTypeDTO[];
    fillmodule: ModuleDTO[];
    fillstaff: StaffDTO[];
    fillstaffusers: StaffDTO[];
    fillcategory: CategoryDTO[];
    showgrid1: PageDTO[];
}
