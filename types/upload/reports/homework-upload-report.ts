export interface IHomeWorkReport {
    ihW_Id: number;
    ihW_Topic: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    ismS_SubjectName: string;
    ihwupl_FileName: string;
    ihwupl_Date: string;
    employeename: string | null;
    userName: string | null;
    ihW_Attachment: string | null;
    asmaY_Id?: number;
}

export interface IHomeWorkAttachment {
    ihwatT_FileName: string;
    ihwatT_Attachment: string;
    ihW_Attachment: string | null;
}

export interface IHomeWorkReportPayload {
    fromdate: string;
    todate: string;
    classarray: { ASMCL_Id: number }[] | undefined;
    type: string;
}

export interface IHomeWorkReportResponse {
    classreportlist: IHomeWorkReport[];
}

export interface IHomeWorkAttachmentResponse {
    attachementlist: IHomeWorkAttachment[];
}
export interface IHomeWorkDetails {
    ASMCL_ClassName: string;
    ASMCL_Id: number;
    ASMC_SectionName: string;
    ASMS_Id: number;
    ISMS_SubjectName: string;
    ISMS_Id: number;
    ICW_Id: number;
    ICW_Content: string;
    ICW_Topic: string;
    ICW_SubTopic: string;
    ICW_FromDate: string; // ISO date string
    ICW_ToDate: string; // ISO date string
    ICW_ActiveFlag: boolean;
    ICW_Assignment: string | null;
    ICW_TeachingAid: string | null;
    ICW_Evaluation: string | null;
    ICW_Attachment: string | null;
    ICW_FilePath: string | null;
    MI_Id: number;
    ASMAY_Id: number;
    IHW_AssignmentNo: string | number | null;
    IHW_Attachment: string | null;
    IHW_Assignment: string | null;
    IHW_Date: string | null; // ISO date string or null
    IHW_Topic: string | null;
    IHW_ActiveFlag: boolean | null;
    IHW_Id: number | null;
    IVRMUL_Id: number | null;
    IHW_FilePath: string | null;
    createdDate?: string;
    createdTime?: string;
    FilesCount?: number;
}

export interface IHomeWorkUploadReport {
    topic: string;
    className: string;
    sectionName: string;
    subjectName: string;
    uploadDate: string;
    fileName: string;
    userName: string;
    employeeName: string;
}
