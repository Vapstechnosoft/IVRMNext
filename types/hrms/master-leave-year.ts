export interface MasterLeaveYearResponse {
    success?: boolean;
    message?: string;
    data?: LeaveYearDetail[] | {
        leaveYearList: LeaveYearDetail[];
    };
    leaveYearList?: LeaveYearDetail[];
    retrunMsg?: string;
    total?: number;
    page?: number;
    page_size?: number;
}

export interface LeaveYearDetail {
    HRMLY_Id: number;
    MI_Id: number;
    HRMLY_LeaveYear: string;
    HRMLY_FromDate: string;
    HRMLY_ToDate: string;
    HRMLY_ActiveFlag: boolean;
    HRMLY_LeaveYearOrder: number;
    CreatedDate: string;
    UpdatedDate: string;
}

export interface MasterLeaveYearInput {
    HRMLY_Id?: number;
    MI_Id: number;
    HRMLY_LeaveYear: string;
    HRMLY_FromDate: string;
    HRMLY_ToDate: string;
    HRMLY_ActiveFlag: boolean;
    HRMLY_LeaveYearOrder?: number;
}
