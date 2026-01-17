export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface ICourse {
    amcO_Id: number;
    courseName: string;
}

export interface IBranch {
    amB_Id: number;
    branchName: string;
    acaycB_Id?: number;
}

export interface ISemester {
    amsE_Id: number;
    semesterName: string;
}

export interface IAlumniSearchCriteriaRow {
    field: string;
    operator: string;
    value: string;
    condition?: string;
}

export interface IAlumniSearchResult {
    ALCMST_Id: number;
    ALCMST_FirstName: string;
    ALCMST_MiddleName?: string;
    ALCMST_LastName: string;
    ALCMST_AdmNo: string;
    AMCO_CourseName: string;
    AMB_BranchName: string;
    AMSE_SEMName: string;
    ALCMST_DOB: string;
    ALCMST_Sex: string;
    ALCMST_MotherName: string;
    ALCMST_FatherName: string;
    ALCMST_emailId: string;
    ALCMST_MobileNo: string;
    ALCMST_BloodGroup: string;
}

export interface IClgAlumniSearchLoadDataResponse {
    fillyear: IAcademicYear[];
}

export interface IClgAlumniSearchResponse {
    searchResult: IAlumniSearchResult[];
    count: number;
}
