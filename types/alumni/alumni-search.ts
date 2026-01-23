export interface IAlumniAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IAlumniClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface IAlumniSearchDetailsResponse {
    yearList: IAlumniAcademicYear[];
    classList: IAlumniClass[];
}

export interface IAlumniSearchResultItem {
    almst_id: number;
    amsT_FirstName: string;
    amsT_DOB: string;
    amsT_MobileNo: string;
    amsT_emailId: string;
    ASMAY_Id_Join: string;
    ASMAY_Id_Left: string;
    ALMST_MembershipId: string;
    ALMMC_MembershipCategory: string;
    IVRMMD_Name: string;
    amsT_BloodGroup: string;
    ALSPR_Designation: string;
    IVRMMS_Name: string;
    ALMST_ConCity: string;
    ALMST_FullAddess: string;
    ALMST_PerPincode: string;
    ASMAY_Id_NEW_Left?: string; // For Address Book view
    Leftclass?: string;
    ASMCL_Id_Join?: number;
    ALMST_District?: string;
}

export interface IAlumniSearchResponse {
    searchResult: IAlumniSearchResultItem[];
    count: number;
}
