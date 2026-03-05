
export interface VisitorTransactionData {
    vmmV_Id: number;
    vmmV_VisitorName: string;
    vmmV_VisitorContactNo: string;
    vmmV_VisitorEmailid: string;
    vmmV_MeetingDateTime: string; // ISO String
    vmmV_EntryDateTime: string;
    vmmV_FromPlace: string;
    empname?: string; // For display
    vmmV_MeetingPurpose: string;
    vmmV_FromAddress: string;
    vmmV_MeetingLocation: string;
    vmmV_VisitorPhoto?: string;
    vmmV_ExitDate?: string; // Potential future field
    vmmV_ExitTime?: string; // Potential future field
}

export interface AddVisitorInitialData {
    emplist: { hrmE_Id: number; hrmE_EmployeeFirstName: string }[];
    gridoptions: VisitorTransactionData[];
}

export interface PreviousVisitorData {
    vmmV_Id: number;
    vmmV_VisitorName: string;
    vmmV_VisitorContactNo: string;
    vmmV_VisitorEmailid: string;
    vmmV_FromPlace: string;
    vmmV_VisitorPhoto?: string;
    vmmV_FromAddress?: string;
}

export interface AppointmentVisitorData {
    vpA_Id: number;
    vpA_VisitorName: string;
    vpA_ContactNo: string;
    vpA_EmailId: string;
    vpA_FromPlace?: string;
    vpA_VisitDateTime: string; // ISO
    empname?: string;
    vpA_Purpose?: string;
}

export interface VisitorAppointmentData {
    vmaP_Id: number;
    vmaP_VisitorName: string;
    vmaP_VisitorContactNo: string;
    vmaP_VisitorEmailid: string;
    EMPNAME?: string; // Staff Name
    vmaP_FromPlace: string;
    vmaP_VisitTypeFlg: string;
    vmaP_EntryDateTime: string; // ISO
    vmaP_MeetingPurpose: string;
    vmaP_MeetingLocation: string;
    vmaP_Status?: string;
    vmaP_ActiveFlag: boolean;
    RCNT?: number; // Document count?
}

export interface VisitorAppointmentInitialData {
    emplist: { hrmE_Id: number; hrmE_EmployeeFirstName: string }[];
    getdata: VisitorAppointmentData[];
}

export interface InwardTransactionData {
    foiN_Id: number;
    foiN_Discription: string;
    foiN_From: string;
    foiN_ContactPerson: string;
    foiN_DateTime: string; // ISO
    foiN_InwardNo: string;
    foiN_PhoneNo: string;
    foiN_EmailId: string;
    foiN_To?: number; // Person To ID
    foiN_HandedOverTo?: number;
    foiN_DispatchedBy?: number;
    foiN_Address?: string;
    hrmE_EmployeeFirstName?: string; // Person To Name
    firstName1?: string; // Handed Over First Name
    firstName2?: string; // Middle
    firstName3?: string; // Last
    secnam1?: string; // Dispatched By First Name
    secnam2?: string;
    secnam3?: string;
    foiN_ActiveFlag: boolean;
}

export interface InwardInitialData {
    emplist: { hrmE_Id: number; hrmE_EmployeeFirstName: string }[];
    getdataall: InwardTransactionData[];
}

export interface OutwardTransactionData {
    foouT_Id: number;
    foouT_Discription: string;
    foouT_From: string;
    foouT_To: string;
    foouT_DateTime: string; // ISO
    foouT_OutwardNo: string;
    foouT_PhoneNo: string;
    foouT_EmailId: string;
    foouT_Address: string;
    foouT_DispatchedBy?: number;
    hrmE_EmployeeFirstName?: string; // Dispatched By Name
    foouT_DispatchedPhNo?: string;
    foouT_DispatchedThrough: string;
    foouT_DispatchedDeatils: string;
    foouT_ActiveFlag: boolean;
}

export interface OutwardInitialData {
    emplist: { hrmE_Id: number; hrmE_EmployeeFirstName: string }[];
    getdata: OutwardTransactionData[];
}

export interface GatePassTransactionData {
    id: number;
    type: 'student' | 'employee';
    name: string;
    code: string; // AdmNo or EmpCode
    department?: string; // Class or Dept
    designation?: string; // Section or Desig
    dateTime: string;
    remarks: string;
    studentId?: number;
    employeeId?: number;
}

export interface GatePassInitialData {
    emplist: { hrmE_Id: number; hrmE_EmployeeFirstName: string; hrmD_DepartmentName: string; hrmdeS_DesignationName: string; hrmE_MobileNo: string }[];
    studentlist: { amsT_Id: number; amsT_FirstName: string; amsT_AdmNo: string; asmcL_ClassName: string; asmC_SectionName: string; amsT_MobileNo: string }[];
    getdata: GatePassTransactionData[];
}

export interface AppointmentStatusVisitorData {
    vmmV_Id: number;
    vmmV_VisitorName: string;
    vmmV_CkeckedInOutStatus?: string;
}

export interface AppointmentStatusEditData {
    vmmV_Id: number;
    empname: string;
    vmmV_MeetingDateTime: string; // ISO String
    vmmV_EntryDateTime: string; // Time string
    vmmV_Remarks: string;
}

export interface AppointmentStatusInitialData {
    visitorlist: AppointmentStatusVisitorData[];
}
