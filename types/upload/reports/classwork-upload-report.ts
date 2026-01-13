export interface IClassWorkReport {
  icW_Id: number;
  icW_Topic: string;
  asmcL_ClassName: string;
  asmC_SectionName: string;
  ismS_SubjectName: string;
  icwupl_FileName: string;
  icwupl_Date: string;
  employeename: string | null;
  userName: string | null;
  icW_Attachment: string | null;
  FilesCount?: number;
}

export interface IAttachment {
  icwatT_FileName: string;
  icwatT_Attachment: string;
  icW_Attachment: string | null;
}

export interface IReportPayload {
  fromdate: string;
  todate: string;
  classarray: { ASMCL_Id: number }[] | undefined;
}

export interface IInitialData {
  classlist: {
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmcL_ActiveFlag: boolean;
    mI_Id: number;
  }[];
}

export interface IReportResponse {
  classreportlist: IClassWorkReport[];
}

export interface IAttachmentResponse {
  attachementlist: IAttachment[];
}
