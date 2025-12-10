export interface IadmissionClassDropdown {
    asmcL_Id: number;
    asmcL_ClassCode: string;
    asmcL_ClassName: string;
    asmcL_Order: number;
    asmcL_MinAgeYear: number;
    asmcL_MinAgeMonth: number;
    asmcL_MinAgeDays: number;
    asmcL_MaxAgeYear: number;
    asmcL_MaxAgeMonth: number;
    asmcL_MaxAgeDays: number;
    asmcL_MaxCapacity: number;
}

export interface IadmissionStudentApplicationList {
    pasr_id: number;
    asmay_id: number;
    pasR_RegistrationNo: string;
    student_name: string;
    pasR_Sex: string;
    applied_class_name: string;
    is_fee_applicable: number;
    payment_status: number;
    application_status: string;
    admission_status: string;
    applied_by: string;
    pasR_ActiveFlag: number;
}
