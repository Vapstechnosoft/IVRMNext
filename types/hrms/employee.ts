// Employee Register Types

export interface EmployeeOnloadResponse {
    MI_Id: number;
    HRME_Id: number;
    employeeTypedropdownlist?: any[];
    groupTypedropdownlist?: any[];
    departmentdropdownlist?: any[];
    designationdropdownlist?: any[];
    gradedropdownlist?: any[];
    genderdropdownlist?: any[];
    maritalStatusdropdownlist?: any[];
    coursedropdownlist?: any[];
    SpecialisationList?: any[];
    bankdropdownlist?: any[];
    religiondropdownlist?: any[];
    casteCategorydropdownlist?: any[];
    castedropdownlist?: any[];
    countrydropdownlist?: any[];
    AllState?: any[];
    retrunMsg?: string;
}

export interface EmployeeListItem {
    HRME_Id: number;
    MI_Id: number;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRME_EmployeeCode: string;
    HRMET_EmployeeType?: string;
    HRMGT_EmployeeGroupType?: string;
    HRMD_DepartmentName?: string;
    HRMDES_DesignationName?: string;
    HRME_MobileNo?: number;
    HRME_EmailId?: string;
    HRME_ActiveFlag: boolean;
    HRME_DOJ?: string;
    HRME_DOB?: string;
}

export interface EmployeeSaveRequest {
    HRME_Id: number;
    MI_Id: number;
    HRMET_Id?: number | null;
    HRMGT_Id?: number | null;
    HRMD_Id?: number | null;
    HRMDES_Id?: number | null;
    HRMG_Id?: number | null;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRME_EmployeeCode: string;
    HRME_BiometricCode?: string;
    HRME_RFCardId?: string;

    // Personal Details
    HRME_DOB?: string;
    HRME_DOJ?: string;
    IVRMMG_Id?: number | null;
    IVRMMMS_Id?: number | null;
    ReligionId?: number | null;
    CasteCategoryId?: number | null;
    CasteId?: number | null;
    HRME_FatherName?: string;
    HRME_MotherName?: string;
    HRME_SpouseName?: string;
    HRME_MobileNo?: number | null;
    HRME_EmailId?: string;
    HRME_BloodGroup?: string;
    HRME_Photo?: string;

    // Address Details
    HRME_PerStreet?: string;
    HRME_PerArea?: string;
    HRME_PerCity?: string;
    HRME_PerAdd4?: string;
    HRME_PerStateId?: number | null;
    HRME_PerCountryId?: number | null;
    HRME_PerPincode?: number | null;
    HRME_LocStreet?: string;
    HRME_LocArea?: string;
    HRME_LocCity?: string;
    HRME_LocAdd4?: string;
    HRME_LocStateId?: number | null;
    HRME_LocCountryId?: number | null;
    HRME_LocPincode?: number | null;

    // PF/ESI Details
    HRME_PFApplicableFlag?: boolean;
    HRME_PFAccNo?: string;
    HRME_PFDate?: string;
    HRME_ESIApplicableFlag?: boolean;
    HRME_ESIAccNo?: string;
    HRME_ESIDate?: string;
    HRME_GratuityAccNo?: string;

    // Bank Details
    HRME_PaymentType?: string;
    HRME_BankAccountNo?: string;

    // Other Details
    HRME_ExpectedRetirementDate?: string;
    HRME_PANCardNo?: string;
    HRME_AadharCardNo?: number | null;
    HRME_SubjectsTaught?: string;
    HRME_TechNonTeachingFlg?: boolean;
    HRME_ActiveFlag?: boolean;
    HRME_LeftFlag?: boolean;

    // Arrays for related data
    qualificationDetails?: any[];
    experienceDetails?: any[];
    documentList?: any[];

    LogInUserId: number;
}

export interface EmployeeSaveResponse {
    HRME_Id: number;
    retrunMsg?: string;
}

export interface EmployeeDetailResponse {
    HRME_Id: number;
    MI_Id: number;
    HRMET_Id?: number;
    HRMGT_Id?: number;
    HRMD_Id?: number;
    HRMDES_Id?: number;
    HRMG_Id?: number;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeMiddleName?: string;
    HRME_EmployeeLastName?: string;
    HRME_EmployeeCode: string;
    HRME_BiometricCode?: string;
    HRME_RFCardId?: string;
    HRME_DOB?: string;
    HRME_DOJ?: string;
    IVRMMG_Id?: number;
    IVRMMMS_Id?: number;
    ReligionId?: number;
    CasteCategoryId?: number;
    CasteId?: number;
    HRME_FatherName?: string;
    HRME_MotherName?: string;
    HRME_SpouseName?: string;
    HRME_MobileNo?: number;
    HRME_EmailId?: string;
    HRME_BloodGroup?: string;
    HRME_Photo?: string;
    HRME_PerStreet?: string;
    HRME_PerArea?: string;
    HRME_PerCity?: string;
    HRME_PerStateId?: number;
    HRME_PerCountryId?: number;
    HRME_PerPincode?: number;
    HRME_LocStreet?: string;
    HRME_LocArea?: string;
    HRME_LocCity?: string;
    HRME_LocStateId?: number;
    HRME_LocCountryId?: number;
    HRME_LocPincode?: number;
    HRME_PFApplicableFlag?: boolean;
    HRME_PFAccNo?: string;
    HRME_PFDate?: string;
    HRME_ESIApplicableFlag?: boolean;
    HRME_ESIAccNo?: string;
    HRME_ESIDate?: string;
    HRME_GratuityAccNo?: string;
    HRME_PaymentType?: string;
    HRME_BankAccountNo?: string;
    HRME_ExpectedRetirementDate?: string;
    HRME_PANCardNo?: string;
    HRME_AadharCardNo?: number;
    HRME_SubjectsTaught?: string;
    HRME_TechNonTeachingFlg?: boolean;
    HRME_ActiveFlag: boolean;
    HRME_LeftFlag?: boolean;
    qualificationDetails?: any[];
    experienceDetails?: any[];
    documentList?: any[];
}

export interface QualificationDetail {
    HRMEQ_Id: number;
    HRME_Id: number;
    HRMC_Id?: number;
    HRME_QualificationName?: string;
    HRMEQ_CollegeName?: string;
    HRMEQ_UniversityName?: string;
    HRMEQ_YearOfPassing?: number;
    HRMEQ_RegistrationNo?: string;
    HRMEQ_Result?: string;
    HRMEQ_CGPAOrPerFlag?: string;
    HRMEQ_CGPA?: string;
    HRMEQ_Percentage?: string;
    HRMEQ_AreaOfSpecialisation?: string;
}

export interface ExperienceDetail {
    HRMEE_Id: number;
    HRME_Id: number;
    HRMEE_OrganisationName?: string;
    HRMEE_OrganisationAddress?: string;
    HRMEE_Department?: string;
    HRMEE_Designation?: string;
    HRMEE_JoinDate?: string;
    HRMEE_ExitDate?: string;
    HRMEE_NoOfYears?: number;
    HRMEE_NoOfMonths?: number;
    HRMEE_AnnualSalary?: number;
    HRMEE_ReasonForLeaving?: string;
}

export interface DocumentDetail {
    HRMEDS_Id: number;
    HRME_Id: number;
    HRMEDS_DocumentName?: string;
    HRMEDS_DocumentImageName?: string;
    HRMEDS_DucumentDescription?: string;
}
