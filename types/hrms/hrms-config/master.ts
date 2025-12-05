export interface IMasterBankList {
    hrmbD_Id: number;
    mI_Id: number;
    hrmbD_BankName: string;
    hrmbD_BankAccountNo: string;
    hrmbD_BankAddress: string;
    hrmbD_BranchName: string;
    hrmbD_IFSCCode: string;
    hrmbD_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterCourseList {
    hrmC_Id: number;
    mI_Id: number;
    hrmC_QulaificationName: string;
    hrmC_QualificationDesc: string;
    hrmC_DefaultQualFag: boolean;
    hrmC_ActiveFlag: boolean;
    hrmC_SpecialisationFlag: boolean;
    hrmC_Order: number;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterCourseSetOrderList {
    hrmC_Id: number;
    hrmC_QulaificationName: string;
    hrmC_Order: number;
}

export interface IMasterDepartmentList {
    hrmD_Id: number;
    mI_Id: number;
    hrmD_DepartmentName: string;
    hrmD_Order: number;
    hrmD_ActiveFlag: boolean;
    hrmD_InternalTrainingMinimumHrs: number;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterDepartmentSetOrderList {
    hrmD_Id: number;
    hrmD_DepartmentName: string;
    hrmD_Order: number;
}

export interface IMasterDesignationList {
    hrmdeS_Id: number;
    mI_Id: number;
    hrmdeS_DesignationName: string;
    hrmdeS_BasicAmount: number;
    hrmdeS_SanctionedSeats: number;
    hrmdeS_DisplaySanctionedSeatsFlag: boolean;
    hrmdeS_Order: number;
    hrmdeS_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterDesignationSetOrderList {
    hrmdeS_Id: number;
    hrmdeS_DesignationName: string;
    hrmdeS_Order: number;
}

export interface IMasterGenderList {
    ivrmmG_Id: number;
    mI_Id: number;
    ivrmmG_GenderName: string;
    ivrmmG_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterGradeList {
    hrmG_Id: number;
    mI_Id: number;
    hrmG_GradeName: string;
    hrmG_GradeDisplayName: string;
    hrmG_PayScaleRange: string;
    hrmG_PayScaleFrom: number;
    hrmG_IncrementOf: number;
    hrmG_PayScaleTo: number;
    hrmG_Order: number;
    hrmG_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterGradeSetOrderList {
    hrmG_Id: number;
    hrmG_GradeName: string;
    hrmG_Order: number;
}

export interface IMasterGroupTypeList {
    hrmgT_Id: number;
    mI_Id: number;
    hrmgT_EmployeeGroupType: string;
    hrmgT_Code: string;
    hrmgT_Order: number;
    hrmgT_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterGroupTypeSetOrderList {
    hrmgT_Id: number;
    hrmgT_EmployeeGroupType: string;
    hrmgT_Order: number;
}

export interface IMasterLeaveYearList {
    hrmlY_Id: number;
    mI_Id: number;
    hrmlY_LeaveYear: string;
    hrmlY_FromDate: string;
    hrmlY_ToDate: string;
    hrmlY_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterLeaveYearSetOrderList {
    hrmlY_Id: number;
    hrmlY_LeaveYear: string;
    hrmlY_LeaveYearOrder: number;
}

export interface IMasterMaritalStatusList {
    ivrmmmS_Id: number;
    mI_Id: number;
    ivrmmmS_MaritalStatus: string;
    ivrmmmS_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterProfessionalTaxList {
    hrmpT_Id: number;
    mI_Id: number;
    hrmpT_SalaryFrom: number;
    hrmpT_SalaryTo: number;
    hrmpT_PTax: number;
    hrmpT_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterEmployeeTypeList {
    hrmeT_Id: number;
    mI_Id: number;
    hrmeT_EmployeeType: string;
    hrmeT_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterSpecializationList {
    hrmspL_Id: number;
    mI_Id: number;
    hrmspL_SpecialisationName: string;
    hrmspL_ActiveFlg: boolean;
    createdDate: string;
    updatedDate: string;
}

export interface IMasterLoanList {
    hrmlN_Id: number;
    mI_Id: number;
    hrmL_LoanType: string;
    hrmL_Max: number;
    hrmlN_ActiveFlag: boolean;
    createdDate: string;
    updatedDate: string;
}
