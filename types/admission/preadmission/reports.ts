export interface IMasterStudentCountReportList {
    user_id: number;
    user_name: string;
    email: string;
    phone_number: string;
    entry_date: string;
}
export interface IParentsDashboardStudentResponse {
    pasr_id: number;
    registration_number: string;
    student_name: string;
    date_of_birth: string;
    mobile_no: number;
    email_id: string;
    applied_class_name: string;
    is_fee_applicable: number;
    payment_status: number;
    application_status: string;
    admission_status: string;
    student_photo: string;
}

export interface IClassTeacherReportList {
    ASMCL_ClassName: string;
    ASMC_SectionName: string;
    IVRMSTAUL_UserName: string;
    PAMS_SubjectName: string;
}

export interface IStudentYearlyAttendenceReportList {
    RowNo: number;
    AMST_Id: number;
    name: string;
    AMST_AdmNo: string;
    AMST_RegistrationNo: string;
    AMAY_RollNo: number;
    monthlyAttendance: {
        [key: string]: number;
    };
    totalPresent: number;
    totalWorkingDays: number;
    totalAbsent: number;
    percentage: string;
}
export interface IRigistrationReportList {
    rowNumber: number;
    user_Name: string;
    email_Id: string;
    mob_No: string;
    name: string;
    created_Date: string;
}

export interface IStudentAttendanceReportList {
    AMST_Id: number;
    name: string;
    AMST_AdmNo: string;
    AMAY_RollNo: number;
    ASA_ClassHeld: number;
    ASA_Class_Attended: number;
    Percentage: number;
    RowNo: number;
}
export type Student = {
    studentnam: string;
    AMST_Id: number;
    admno: string;
    fathername: string;
    mothername: string;
    class: string;
    section: string;
    acadamicyear: string;
    dob: string;
    caste_name: string;
    addressd1: string;
    addressd13: string;
    city: string;
    photopath: string;
    MI_Logo: string;
    IVRMMCT_Name: string;
    pincode: string;
    street: string;
    area: string;
    constreet: string;
    conarea: string;
    concity: string;
    dobwords: string;
};

export type StudyCertificateResponse = {
    studentList: Student[];
    masterCompany: any[];
    academicList: any[];
    principalSign: any[];
};

export type GenerateQRCodeResponse = {
    ascisS_QRCode: string;
};
