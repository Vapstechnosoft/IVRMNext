export interface IClgPreadmissionStatusFilter {
    asmaY_Id: number;
    amcO_Id: number;
    pamsT_Id: number;
    status_type: 'Appsts' | 'admsts';
}

export interface IClgPreadmissionStudent {
    pacA_Id: number;
    name: string;
    pacA_RegistrationNo: string;
    pacA_ApplStatus?: number;
    pacA_AdmStatus?: number;
    statusName?: string;
    pamsT_Id?: number;
    pacA_Statusremark?: string;
    remarkcount?: number;
    amcO_CourseName?: string;
    pacA_Sex?: string;
    fee_status?: string;
    ispaC_ApplFeeFlag?: number;
    selected?: boolean;
}

export interface IClgPreadmissionStatusUpdate {
    studentlist: IClgPreadmissionStudent[];
    Student_status: number | string;
    email?: boolean;
    sms?: boolean;
    default?: boolean;
    MailSubject?: string;
    MailHeader?: string;
    Parameter_email?: string;
    MailFooter?: string;
    smscontent?: string;
    otptype?: string;
    forgetEmailOTP?: string;
}
