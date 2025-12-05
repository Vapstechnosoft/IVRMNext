// Dropdown Interfaces - All follow the key/value pattern from /api/MasterDropDown endpoints
export interface IGradeDropdown {
    key: string;
    value: string;
}

export interface IEmployeeTypeDropdown {
    key: string;
    value: string;
}

export interface IGroupTypeDropdown {
    key: string;
    value: string;
}

export interface IDepartmentDropdown {
    key: string;
    value: string;
}

export interface IDesignationDropdown {
    key: string;
    value: string;
}

export interface IGenderDropdown {
    key: string;
    value: string;
}

export interface IMaritalStatusDropdown {
    key: string;
    value: string;
}

export interface IReligionDropdown {
    key: string;
    value: string;
}

export interface ICasteCategoryDropdown {
    key: string;
    value: string;
}

export interface ICasteDropdown {
    key: string;
    value: string;
}

export interface IBankDropdown {
    key: string;
    value: string;
}

export interface ICountryDropdown {
    key: string;
    value: string;
}

export interface IStateDropdown {
    key: string;
    value: string;
}

export interface ICourseDropdown {
    key: string;
    value: string;
}

export interface ISpecializationDropdown {
    key: string;
    value: string;
}

export interface IInstitutionDropdown {
    key: string;
    value: string;
}

export interface IPaymentModeDropdown {
    key: string;
    value: string;
}

export interface ILeaveReasonDropdown {
    key: string;
    value: string;
}

// Employee List Interface
export interface IEmployeeList {
    hrmE_Id: number;
    hrmE_EmployeeCode: string;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeLastName: string;
    hrmE_EmailId: string;
    hrmE_MobileNo: string;
    hrmE_ActiveFlag: boolean;
}

// Employee Save Request/Response - Will be defined based on actual form payloads
export interface IEmployeeSaveRequest {
    [key: string]: any;
}

export interface IEmployeeSaveResponse {
    success: boolean;
    message: string;
    data?: any;
}

// Employee Detail Response
export interface IEmployeeDetailResponse {
    [key: string]: any;
}
