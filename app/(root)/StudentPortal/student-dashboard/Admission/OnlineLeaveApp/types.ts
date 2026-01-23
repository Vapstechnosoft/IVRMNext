export interface StudentDetails {
    asmS_Id: number;
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_RegistrationNo: string;
    amsT_MobileNo: number;
    amsT_emailId: string;
}

export interface LeaveApplication {
    aslA_Id: number;
    asmS_Id: number;
    aslA_Flag: string; // 'OnStudy' | 'Leave'
    aslA_ApplyDate: string;
    aslA_FromDate: string;
    aslA_ToDate: string;
    aslA_Reason: string;
    aslA_Status: string;
    aslA_ActiveFlag: boolean;
    aslA_LeaveId?: number;
    amsT_FirstName?: string;
    asmcL_ClassName?: string;
    asmC_SectionName?: string;
}

export interface LeaveLoadData {
    roletype: string;
    studentdetails: StudentDetails[];
    allstuddata: LeaveApplication[];
    pendingleave?: LeaveApplication[]; // For staff/principal view if needed later
}

export interface LeaveApplyPayload {
    ASLA_Id: number;
    ASLA_ApplyDate: string;
    ASLA_FromDate: string;
    ASLA_ToDate: string;
    ASLA_Flag: string;
    ASLA_LeaveId?: number;
    ASLA_Reason: string;
}
