export interface MasterGenderResponse {
    IVRMMG_Id: number;
    MI_Id: number;
    IVRMMG_GenderName: string | null;
    IVRMMG_ActiveFlag: boolean;
    genderList: GenderItem[];
    retrunMsg: string;
    roleId: number;
    CreatedDate: string | null;
    UpdatedDate: string | null;
}

export interface GenderItem {
    IVRMMG_Id: number;
    MI_Id: number;
    IVRMMG_GenderName: string;
    IVRMMG_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterGenderInput {
    IVRMMG_Id?: number;
    MI_Id: number;
    IVRMMG_GenderName: string;
    IVRMMG_ActiveFlag: boolean;
}
