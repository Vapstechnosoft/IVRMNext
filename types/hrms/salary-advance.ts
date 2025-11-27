// Salary Advance Types

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

// Onload Request
export interface SalaryAdvanceOnloadRequest {
    roleId: number;
}

// Dropdown Types
export interface EmployeeDropdown {
    HRME_Id: number;
    MI_Id: number;
    HRMET_Id: number;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
    HRMG_Id: number;
    HRME_EmployeeCode: string;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName: string | null;
    HRME_EmployeeLastName: string | null;
    HRME_BiometricCode: string | null;
    HRME_RFCardId: string | null;
    HRME_PerStreet?: string | null;
    HRME_PerArea?: string | null;
    HRME_PerCity?: string | null;
    HRME_PerAdd4?: string | null;
    HRME_PerStateId?: number | null;
    HRME_PerCountryId?: number | null;
    HRME_PerPincode?: number | null;
    HRME_LocStreet?: string | null;
    HRME_LocArea?: string | null;
    HRME_LocCity?: string | null;
    HRME_LocAdd4?: string | null;
    HRME_LocStateId?: number | null;
    HRME_LocCountryId?: number | null;
    HRME_LocPincode?: number | null;
    IVRMMMS_Id?: number | null;
    IVRMMG_Id?: number | null;
    CasteCategoryId?: number | null;
    CasteId?: number | null;
    ReligionId?: number | null;
    HRME_FatherName?: string | null;
    HRME_MotherName?: string | null;
    HRME_SpouseName?: string | null;
    HRME_SpouseOccupation?: string | null;
    HRME_SpouseMobileNo?: number | null;
    HRME_SpouseEmailId?: string | null;
    HRME_SpouseAddress?: string | null;
    HRME_DOB?: string | null;
    HRME_DOJ?: string | null;
    HRME_ExpectedRetirementDate?: string | null;
    HRME_PFDate?: string | null;
    HRME_ESIDate?: string | null;
    HRME_MobileNo?: number | null;
    HRME_EmailId?: string | null;
    HRME_BloodGroup?: string | null;
    HRME_PaymentType?: string | null;
    HRME_BankAccountNo?: string | null;
    HRME_PFApplicableFlag?: boolean | null;
    HRME_PFMaxFlag?: boolean | null;
    HRME_PFFixedFlag?: boolean | null;
    HRME_PFAccNo?: string | null;
    HRME_ESIAccNo?: string | null;
    HRME_GratuityAccNo?: string | null;
    HRME_ESIApplicableFlag?: boolean | null;
    HRME_Photo?: string | null;
    HRME_LeftFlag?: boolean | null;
    HRME_DOL?: string | null;
    HRME_LeavingReason?: string | null;
    HRME_Height?: string | null;
    HRME_HeightUOM?: string | null;
    HRME_Weight?: number | null;
    HRME_WeightUOM?: string | null;
    HRME_IdentificationMark?: string | null;
    HRME_ApprovalNo?: string | null;
    HRME_PANCardNo?: string | null;
    HRME_AadharCardNo?: number | null;
    HRME_SubstituteFlag?: boolean | null;
    HRME_NationalSSN?: string | null;
    HRME_SalaryType?: string | null;
    HRME_EmployeeOrder?: number | null;
    HRME_ActiveFlag?: boolean | null;
    HRME_UINumber?: string | null;
    HRME_doc?: string | null;
    HRME_SubjectsTaught?: string | null;
    HRME_AppDownloadedDeviceId?: string | null;
    HRME_PHDResearchGuideFlg?: boolean | null;
    HRME_TechNonTeachingFlg?: string | null;
    HRME_RGRecognitionYear?: number | null;
    HRME_AnyHealthIssue?: string | null;
    HRME_EyeSightIssue?: string | null;
    HRME_TransfferedTo?: number | null;
    HRME_RecordTransferredFlg?: boolean | null;
    HRME_MSTeamsUserId?: string | null;
    HRME_MSTeamsEmailId?: string | null;
    HRME_MSTeamsPassword?: string | null;
    HRME_ExcPunch?: boolean | null;
    HRME_RetiredFlg?: boolean | null;
    HRME_PensionStoppedDate?: string | null;
    HRME_FPFNotApplicableFlg?: boolean | null;
    HRME_EPFNotApplicableFlg?: boolean | null;
    HRME_AllowSoftwareAccessFlg?: boolean | null;
    CreatedDate?: string | null;
    UpdatedDate?: string | null;
    HRMD_DepartmentName?: string;
    HRMDES_DesignationName?: string;
}

export interface LeaveYearDropdown {
    HRMLY_Id: number;
    HRMLY_LeaveYear: string;
    HRMLY_FromDate: string;
    HRMLY_ToDate: string;
}

export interface MonthDropdown {
    IVRM_Month_Id: number;
    IVRM_Month_Name: string;
}

export interface ModeOfPaymentDropdown {
    IVRMMOD_Id: number;
    IVRMMOD_ModeOfPayment: string;
    value?: string;
    label?: string;
}

// Salary Advance Item
export interface SalaryAdvanceItem {
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESA_EntryDate: string;
    HRESA_AdvYear: number;
    HRESA_AdvMonth: string;
    HRESA_AppliedAmount: number;
    HRESA_SanctinedAmount: number;
    HRESA_Remarks: string;
    HRESA_AdvStatus: string;
    HRESA_ModeOfPayment: string;
    HRESA_ReferenceNo: number;
    HRESA_ActiveFlag: boolean;
    HRME_EmployeeFirstName?: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRME_EmployeeCode?: string;
}

// Configuration Details
export interface ConfigurationDetails {
    HRC_Id: number;
    MI_Id: number;
    HRC_PFMaxAmt: number;
    HRC_FPFPer: number;
    HRC_EPFPer: number;
    HRC_AsPerEmpFlag: boolean;
    HRC_PFAccNoPrefix: string;
    HRC_AccNo2: number;
    HRC_AccNo21: number;
    HRC_AccNo22: number;
    HRC_RetirementYrs: number;
    HRC_ECodePrefix: string;
    HRC_ESIMax: number;
    HRC_ESIEmplrCont: number;
    HRC_PayMethodFlg: string;
    HRC_ArrSalaryFlag: boolean;
    HRC_CummArrFlag: boolean;
    HRC_SalaryFromDay: number;
    HRC_SalaryToDay: number;
    HRC_ARTFPFPer: number;
    HRC_ARTEPFPer: number;
    HRC_ESIMaxAmount: number;
    HRC_AC2MinAmount: number;
    HRC_AC21MinAmount: number;
    HRC_AC22MinAmount: number;
    HRC_SalAdvApprovalFlg: boolean;
    HRC_LoanApprovalFlg: boolean;
    HRC_LeaveApprovalFlg: boolean;
    HRC_IncrementApprovalFlg: boolean;
    HRC_ProbationApprovalFlg: boolean;
    HRC_SalApprovalFlg: boolean;
    HRC_EducationCess: number;
    roleId: number;
    retrunMsg: string;
    hrStandardList: any[];
    monthdropdown: MonthDropdown[];
    HRC_partAmaxflag: number;
    HRC_partBmaxflag: number;
    HRC_IncrementMonth: string;
    HRC_MinimumWorkingPeriod: number;
    HRC_FixedIncrmentFlg: boolean;
    HRC_NoOfOptionalHolidays: number;
    HRC_IncrementOnceInMonths: number;
    HRC_AlertDay: number;
}

// Master Employee (full employee details)
export interface MasterEmployee {
    CreatedDate: string;
    UpdatedDate: string;
    HRME_Id: number;
    MI_Id: number;
    HRMET_Id: number;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
    HRMG_Id: number;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName: string | null;
    HRME_EmployeeLastName: string | null;
    HRME_EmployeeCode: string;
    HRME_BiometricCode: string | null;
    HRME_RFCardId: string | null;
    HRME_PerStreet: string | null;
    HRME_PerArea: string | null;
    HRME_PerCity: string | null;
    HRME_PerAdd4: string | null;
    HRME_PerStateId: number | null;
    HRME_PerCountryId: number | null;
    HRME_PerPincode: number | null;
    HRME_LocStreet: string | null;
    HRME_LocArea: string | null;
    HRME_LocCity: string | null;
    HRME_LocAdd4: string | null;
    HRME_LocStateId: number | null;
    HRME_LocCountryId: number | null;
    HRME_LocPincode: number | null;
    IVRMMMS_Id: number | null;
    IVRMMG_Id: number | null;
    CasteCategoryId: number | null;
    CasteId: number | null;
    ReligionId: number | null;
    HRME_FatherName: string | null;
    HRME_MotherName: string | null;
    HRME_SpouseName: string | null;
    HRME_SpouseOccupation: string | null;
    HRME_SpouseMobileNo: number | null;
    HRME_SpouseEmailId: string | null;
    HRME_SpouseAddress: string | null;
    HRME_DOB: string | null;
    HRME_DOJ: string | null;
    HRME_ExpectedRetirementDate: string | null;
    HRME_PFDate: string | null;
    HRME_ESIDate: string | null;
    HRME_MobileNo: number | null;
    HRME_EmailId: string | null;
    HRME_BloodGroup: string | null;
    HRME_PaymentType: string | null;
    HRME_BankAccountNo: string | null;
    HRME_PFApplicableFlag: boolean | null;
    HRME_PFMaxFlag: boolean | null;
    HRME_PFFixedFlag: boolean | null;
    HRME_PFAccNo: string | null;
    HRME_ESIAccNo: string | null;
    HRME_GratuityAccNo: string | null;
    HRME_ESIApplicableFlag: boolean | null;
    HRME_Photo: string | null;
    HRME_LeftFlag: boolean | null;
    HRME_DOL: string | null;
    HRME_LeavingReason: string | null;
    HRME_Height: string | null;
    HRME_HeightUOM: string | null;
    HRME_Weight: number | null;
    HRME_WeightUOM: string | null;
    HRME_IdentificationMark: string | null;
    HRME_ApprovalNo: string | null;
    HRME_PANCardNo: string | null;
    HRME_AadharCardNo: number | null;
    HRME_SubstituteFlag: boolean | null;
    HRME_NationalSSN: string | null;
    HRME_SalaryType: string | null;
    HRME_EmployeeOrder: number | null;
    HRME_ActiveFlag: boolean | null;
    HRME_UINumber: string | null;
    HRME_doc: string | null;
    HRME_SubjectsTaught: string | null;
    HRME_AppDownloadedDeviceId: string | null;
    HRME_PHDResearchGuideFlg: boolean | null;
    HRME_TechNonTeachingFlg: string | null;
    HRME_RGRecognitionYear: number | null;
    HRME_AnyHealthIssue: string | null;
    HRME_EyeSightIssue: string | null;
    HRME_TransfferedTo: number | null;
    HRME_RecordTransferredFlg: boolean | null;
    HRME_MSTeamsUserId: string | null;
    HRME_MSTeamsEmailId: string | null;
    HRME_MSTeamsPassword: string | null;
    HRME_ExcPunch: boolean | null;
    HRME_RetiredFlg: boolean | null;
    HRME_PensionStoppedDate: string | null;
    HRME_FPFNotApplicableFlg: boolean | null;
    HRME_EPFNotApplicableFlg: boolean | null;
    HRME_AllowSoftwareAccessFlg: boolean | null;
}

// Salary Advance Item with MasterEmployee
export interface SalaryAdvanceItemWithEmployee extends SalaryAdvanceItem {
    CreatedDate?: string;
    UpdatedDate?: string;
    MasterEmployee?: MasterEmployee;
}

// Onload Response
export interface SalaryAdvanceOnloadResponse {
    CreatedDate?: string;
    UpdatedDate?: string;
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESA_EntryDate?: string;
    HRESA_AdvYear?: number;
    HRESA_AdvMonth?: string;
    HRESA_AppliedAmount?: number;
    HRESA_Remarks?: string;
    HRESA_ActiveFlag?: boolean;
    HRESA_AdvStatus?: string;
    HRESA_SanctinedAmount?: number;
    HRESA_ModeOfPayment?: string;
    HRESA_ReferenceNo?: number;
    empadvaList: SalaryAdvanceItemWithEmployee[];
    retrunMsg: string;
    Status?: string;
    roleId: number;
    HRME_EmployeeFirstName?: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    employeedropdown: EmployeeDropdown[];
    leaveyeardropdown: LeaveYearDropdown[];
    monthdropdown: MonthDropdown[];
    modeOfPaymentdropdown: ModeOfPaymentDropdown[];
    configurationDetails?: ConfigurationDetails;
    empGrossSal?: number;
    totalAppliedAmount?: number;
    searchfilter?: string;
}

// Save Request
export interface SalaryAdvanceSaveRequest {
    HRESA_Id: number;
    MI_Id: number;
    HRME_Id: number;
    HRESA_EntryDate: string;
    HRESA_AdvYear: number;
    HRESA_AdvMonth: string;
    HRESA_AppliedAmount: number;
    HRESA_SanctinedAmount: number;
    HRESA_Remarks: string;
    HRESA_AdvStatus: string;
    HRESA_ModeOfPayment: string;
    HRESA_ReferenceNo: number;
    HRESA_ActiveFlag: boolean;
    roleId: number;
}

// Save Response
export interface SalaryAdvanceSaveResponse {
    HRESA_Id: number;
    retrunMsg: string;
    roleId: number;
}

// Delete Request
export interface SalaryAdvanceDeleteRequest {
    HRESA_Id: number;
    roleId: number;
}
