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

export interface ICategoryClassMapping {
    academicName: string;
    acdlist: any | null;
    asmaY_Id: number;
    asmcL_Id: number;
    binddetails: any | null;
    categoryName: string;
    categorylist: any | null;
    className: string;
    classlist: any | null;
    clssids: any | null;
    createdDate: string | null;
    updatedDate: string | null;
    detailslist: any | null;
    mI_Id: number;
    message: string | null;
    returnMsg: string | null;
    returnval: boolean;
    roleId: number;
    userId: number;
    ttcC_Id: number;
    ttcC_ActiveFlag: boolean;
    ttmC_Id: number;
}

export interface ITimeTableMasterCategory {
    ttmC_Id: number;
    ttmC_CategoryName: string;
    ttmC_ActiveFlag: boolean;

    mI_Id: number;
    asmaY_Id: number;

    academiclist: any | null;
    asmayYear: string | null;

    categorylist: any | null;
    categorylistedit: any | null;

    returnduplicatestatus: any | null;
    returnval: boolean;

    createdDate: string;
    updatedDate: string;
}
