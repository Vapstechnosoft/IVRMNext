export interface IMasterDayList {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterDaySetOrderList {
    ttmD_Id: number;
    mI_Id: number;
    ttmD_DayName: string;
    ttmD_DayCode: string;
    order_Id: number;
    ttmD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterBuildingList {
    ttmB_Id: number;
    mI_Id: number;
    ttmB_BuildingName: string;
    ttmB_ActiveFlag: string;
}

export interface IStaffAbbreviationList {
    ttmsaB_Id: number;
    mI_Id: number;
    hrmE_Id: number;
    ttmsaB_Abbreviation: string;
    asmaY_Id: number;
    createdDate: string;
    updatedDate: string;
    ttmsaB_ActiveFlag: boolean;
    firstName: string;
    middleName: string;
    lastName: string;
}

export interface ISubjectAbbreviationList {
    ttmsuaB_Id: number;
    mI_Id: number;
    subjectName: string;
    ttmsuaB_Abbreviation: string;
    ttmsuaB_ActiveFlag: boolean;
    ismS_Id: number;
}

export interface IStaffDropdownList {
    ttmsaB_Id: number;
    mI_Id: number;
    hrmE_Id: number;
    staffName: string;
    firstName: string;
    middleName: string;
    lastName: string;
    ttmsaB_ActiveFlag: boolean;
    asmaY_Id: number;
    createdDate: string;
    updatedDate: string;
}
