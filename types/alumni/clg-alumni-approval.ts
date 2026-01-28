export interface IClgAlumniApprovalDetails {
    alcsreG_Id: number;
    alcsreG_MemberName: string;
    a_year: string;
    l_year: string;
    admit_course: string;
    left_course: string;
    admit_branch: string;
    left_branch: string;
    isSelected22?: boolean;
}

export interface IStudentMatchDetails {
    membername: string;
    alcmsT_AdmNo: string;
    yeardmitted: string;
    courseadmitted: string;
    branchadmitted: string;
    alcmsT_Id: number;
    alcsreG_Id: number;
    isSelected?: boolean;
}

export interface IClgAlumniApprovalLoadDataResponse {
    almdetails: IClgAlumniApprovalDetails[];
}

export interface ICheckStudentAlumniResponse {
    studentDetails: IStudentMatchDetails[];
}

export interface IApproveClgAlumniResponse {
    returnval: string;
}
