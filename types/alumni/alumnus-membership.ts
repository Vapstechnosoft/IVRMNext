export interface IYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface IMemberCategory {
    almmC_Id: number;
    almmC_MembershipCategory: string;
}

export interface ICountry {
    ivrmmC_Id: number;
    ivrmmC_CountryName: string;
}

export interface IState {
    ivrmmS_Id: number;
    ivrmmS_Name: string;
}

export interface IDistrict {
    ivrmmD_Id: number;
    ivrmmD_Name: string;
}

export interface IAlumnusInitialData {
    alumnilist: any[];
    alumnilistnew: any[];
    membercategory: IMemberCategory[];
    fillyear: IYear[];
    fillclass: IClass[];
    countryDrpDown: ICountry[];
    statedropdown: IState[];
    districtdropdown: IDistrict[];
    almdetails: any[];
    flag: string;
    alumnitrue: boolean;
    studentDetails: any[];
}

export interface IQualification {
    Qualification: string;
    ALMST_PUC_INS_NAME: string;
    ALMST_PUC_PASSED_OUT: string;
    ALSQU_Percentage: string;
    ALMST_PLACE: string;
    ALMST_PerState: number;
    ALSQU_OtherDetails: string;
    placess1?: boolean;
}

export interface IProfessionalDetail {
    ALSPR_CompanyName: string;
    ALSPR_Designation: string;
    ALSPR_WorkingSince?: number;
    ALSPR_CompanyAddress: string;
    ALSPR_EmailId?: string;
    ALSPR_OtherDetails: string;
}

export interface IAchievementDetail {
    ALSAC_Achievement: string;
    ALSAC_Remarks: string;
}

export interface IReadmittedStudent {
    ALMSTRADM_YearJoined: number;
    ALMSTRADM_YearLeft: number;
    ALMSTRADM_ClassJoined: number;
    ALMSTRADM_ClassLeft: number;
}

export interface IAlumnusSavePayload {
    ALMST_Id: number;
    ALMST_AdmNo: string;
    ASMAY_Id_Join?: number;
    ASMAY_Id_Left?: number;
    ASMCL_Id_Join?: number;
    ASMCL_Id_Left?: number;
    ALMST_DOB: string;
    ALMST_MobileNo: string;
    ALMST_FatherName: string;
    ALMST_PhoneNo: string;
    ALMST_emailId: string;
    ALMST_Marital_Status: number;
    ALMST_PerCountry?: number;
    ALMST_PerState?: number;
    ALMST_PerDistrict?: number;
    ALMST_ConCity?: string;
    ALMST_ConArea?: string;
    ALMST_ConStreet?: string;
    ALMST_StudentPhoto?: string;
    ALMST_FamilyPhoto?: string;
    ALMST_BloodGroup: string;
    ALMST_ConPincode?: string;
    ALSAC_Achievement?: string;
    ALSAC_Remarks?: string;
    ALSPR_CompanyName?: string;
    ALSPR_Designation?: string;
    ALSPR_WorkingSince?: number;
    ALSPR_EmailId?: string;
    ALMST_MembershipId?: string;
    ALMST_FullAddess?: string;
    ALMST_AmountPaid?: string | number;
    ALMST_MembershipCategory?: number;
    ALSPR_CompanyAddress?: string;
    ALSPR_OtherDetails?: string;
    qualification_array: IQualification[];
    ALMST_NickName: string;
    ALMST_SpouseName?: string;
    ALMST_SpouseContactNo?: string;
    ALMST_SpouseEmailId?: string;
    ALMST_SpouseQulaification?: string;
    ALMST_SpouseProfession?: string;
    ALMST_WeddingAnniversaryDate?: string;
    ReadmittedStudentDTO?: IReadmittedStudent[];
}
