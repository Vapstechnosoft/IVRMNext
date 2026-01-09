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
    className: string;
    categoryName: string;
    updatedDate: string;
    ttcC_Id: number;
}

export interface ITimeTableMasterCategory {
    ttmC_Id: number;
    ttmC_CategoryName: string;
    ttmC_ActiveFlag: boolean;
}

export interface ITimeTableMasterAcademicYear {
    asmaY_Id: number;
    mI_Id: number;
    asmaY_Year: string;
    asmaY_From_Date: string;
    asmaY_To_Date: string;
    asmaY_PreAdm_F_Date: string;
    asmaY_PreAdm_T_Date: string;
    asmaY_Order: number;
    asmaY_ActiveFlag: number;
    asmaY_Pre_ActiveFlag: number;
    is_Active: boolean;
    asmaY_ReggularFlg: boolean;
    asmaY_NewFlg: boolean;
    asmaY_NewAdmissionFlg: boolean;
    asmaY_Cut_Of_Date: string;
    asmaY_CreatedBy: number;
    asmaY_UpdatedBy: number;
    asmaY_AcademicYearCode: string;
    asmaY_RegularFeeFDate: string;
    asmaY_RegularFeeTDate: string;
    createdDate: string;
    updatedDate: string;
}
export interface ITimeTableCategoryDropDownData {
    ttmC_Id: number;
    mI_Id: number;
    ttmC_CategoryName: string;
    createdDate: string;
    updatedDate: string;
    ttmC_ActiveFlag: boolean;
}

export interface ITimeTableClassDropDownData {
    asmcL_Id: number;
    mI_Id: number;
    asmcL_ClassName: string;
    asmcL_ClassCode: string;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_Order: number;
    asmcL_MaxCapacity: number;
    asmcL_ActiveFlag: boolean;
    asmcL_PreadmFlag: number;
    createdDate: string;
    updatedDate: string;
}
