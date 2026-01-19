export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
    Selected?: boolean;
}

export interface IClassDetails {
    asmcL_Id: number;
    asmcL_ClassName: string;
    Selected?: boolean;
}

export interface IAlumniLetterStudent {
    amsT_Id: number;
    amsT_RegistrationNo: string;
    amsT_AdmNo: string;
    amsT_FirstName: string;
    amsT_Date: string;
    amsT_DOB: string;
    asmcL_ClassName: string;
    amsT_MobileNo: string;
    amsT_emailId: string;
    amsT_Sex: string;
    AMST_PerStreet: string;
    AMST_PerArea: string;
    AMST_PerCity: string;
    AMST_PerPincode: string;
    amsT_FatherName: string;
    selected?: boolean;
    AMST_BloodGroup?: string;
}

export interface IAlumniLettersLoadResponse {
    newuser1: IAcademicYear[];
    newuser2: IClassDetails[];
    logopath: { logoname: string }[];
}

export interface IAlumniLettersReportResponse {
    searchstudentDetails2: IAlumniLetterStudent[];
}

export interface IAlumniLettersShowReportResponse {
    searchstudentDetails: IAlumniLetterStudent[];
}
