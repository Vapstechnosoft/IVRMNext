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
