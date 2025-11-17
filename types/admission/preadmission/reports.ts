export interface IMasterStudentCountReportList {
    type: number;
    asmay_id: string;
    from_date: string;
    to_date: string;
    report_type: number;
    asmcl_id: number;
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
