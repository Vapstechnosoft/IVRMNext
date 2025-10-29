export interface MasterGroupTypeResponse {
    success: boolean;
    message: string;
    data: {
        grouptypeList: GroupTypeDetail[];
    };
}

export interface GroupTypeDetail {
    HRMGT_Id: number;
    MI_Id: number;
    HRMGT_EmployeeGroupType: string;
    HRMGT_Code: string;
    HRMGT_Order: number;
    HRMGT_ActiveFlag: boolean;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterGroupTypeInput {
    HRMGT_Id?: number;
    MI_Id: number;
    HRMGT_EmployeeGroupType: string;
    HRMGT_Code: string;
    HRMGT_Order?: number;
    HRMGT_ActiveFlag: boolean;
}
