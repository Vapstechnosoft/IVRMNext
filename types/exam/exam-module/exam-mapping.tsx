// EXAM MAPPING
export interface IYearlyCategorySubjectMapping {
    eyC_Id: number;
    eyC_BasedOnPaperTypeFlg: boolean;
    asmaY_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    eycG_Id: number;
    emG_Id: number;
    emG_GroupName: string;
    emG_ElectiveFlg: boolean;
    eyC_ActiveFlg: boolean;
    eycG_ActiveFlg: boolean;
    asmaY_Order: number;
}

export interface IYearlyCategorySubjectMappingViewDetails {
    eycgS_Id: number;
    eycG_Id: number;
    ismS_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    emG_GroupName: string;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
}

// interface.ts
// -----------------------------------------------------------------------------
// Defines all type structures used in the Exam Login Privileges master module
// -----------------------------------------------------------------------------

export interface IExamLoginPrivileges {
    elp_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    ivrmulF_Id: number;
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
    entryType: 'ct' | 'st' | 'others';
    classList: {
        asmcL_Id: number;
        asmcL_ClassName: string;
    }[];
    sectionList: {
        asmS_Id: number;
        asmC_SectionName: string;
    }[];
    subjectList: {
        ismS_Id: number;
        ismS_SubjectName: string;
    }[];
    subSubjectList?: {
        emsS_Id: number;
        emsS_SubSubjectName: string;
    }[];
    activeStatus: boolean;
}

export interface IExamLoginPrivilegesForm {
    asmaY_Id: number;
    ivrmulF_Id: number;
    hrmE_Id: number;
    entryType: 'ct' | 'st' | 'others';
    classIds: number[];
    sectionIds: number[];
    subjectIds: number[];
    subSubjectIds?: number[];
}

export interface IExamLoginPrivilegesView {
    elp_Id: number;
    asmaY_Year: string;
    userName: string;
    employeeName: string;
    className: string;
    sectionName: string;
    subjectName: string;
    subSubjectName?: string;
    activeStatus: boolean;
}

export interface IExamLoginPrivilegesTableProps {
    data: IExamLoginPrivilegesView[];
    onEdit: (row: IExamLoginPrivilegesView) => void;
    onDelete: (row: IExamLoginPrivilegesView) => void;
}

export interface IYearlyCategorySubjectMappingView {
    slno?: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    emG_GroupName: string;
    emG_ElectiveFlg: boolean;
    eycG_ActiveFlg: boolean;
    eycG_Id: number;
}

export interface IYearlyCategoryDatesMapping {
    asmaY_Id: number;
    eyC_Id: number;
    emcA_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    eyC_ExamStartDate: string;
    eyC_ExamEndDate: string;
    eyC_MarksEntryLastDate: string;
    eyC_MarksProcessLastDate: string;
    eyC_MarksPublishDate: string;
}

export interface IExamSubjectGroupMapping {
    esG_Id: number;
    asmaY_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    esG_SubjectGroupName: string;
    eysgR_PromotionType: 'IE' | 'PE';
    esG_GroupMinMarks: number;
    esG_GroupMaxMarks: number;
    emE_ExamName?: string | null;
    esgE_Id: number;
    esG_CompulsoryFlag: 'Y' | 'N';
    asmaY_Order: number;
}

export interface IExamSubjectGroupingDetails {
    emcA_CategoryName: string;
    esG_SubjectGroupName: string;
    esG_GroupMinMarks: number;
    esG_GroupMaxMarks: number;
    emE_ExamName: string;
    esG_Id: number;
    esgE_Id: number;
    esG_CompulsoryFlag: 'Y' | 'N';
    ismS_SubjectName: string;
    esgS_Id: number;
    asmaY_Id: number;
    emcA_Id: number;
    emE_Id: number;
    ismS_Id: number;
    esgS_ActiveFlag: boolean;
}

export interface IESubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_OrderFlag: number;
    eyceS_AplResultFlg?: boolean;
}

export interface IExamTermAndExamMapping {
    ecT_Id?: number | null;
    asmaY_Id: number;
    emcA_Id: number;
    ecT_TermName: string;
    ecT_TermStartDate: string;
    ecT_TermEndDate: string;
    ecT_Marks: number;
    ecT_MinMarks: number;
    ecT_ActiveFlag: boolean;
    ecT_PublishDate: string;
    asmaY_Year: string;
    emcA_CategoryName: string;
    emgR_GradeName?: string;
    emgR_Id?: number;
    saveddetails: IExamTermAndExamMappingDetails[];
}

export interface IExamTermAndExamMappingDetails {
    ecteX_Id: number;
    emE_Id: number;
    emE_ExamName: string;
    ecteX_MarksPercentValue: number;
    ecteX_MarksPerFlag: 'M' | 'P';
    ecteX_NotApplToTotalFlg: boolean;
    ecteX_ActiveFlag: boolean;
    emE_ExamOrder: number;
    ecT_Id: number;
    ecteX_RoundOffReqFlg: boolean;
    ecteX_ConversionReqFlg: boolean;
}

export interface IExamSubjectWizard {
    ecysE_Id: number;
    amcO_Id: number;
    amb_Id: number;
    amsE_Id: number;
    acss_Id: number;
    acst_Id: number;
    emg_Id: number;
    eme_Id: number;
    emgr_Id: number;

    amcO_CourseName: string;
    amb_BranchName: string;
    amse_SemesterName: string;
    acss_SchemeName: string;
    acst_SchemeType: string;
    emg_GroupName: string;
    eme_ExamName: string;
    emgr_GradeName: string;

    ecysE_AttendanceFromDate: string;
    ecysE_AttendanceToDate: string;

    ecysE_SubExamFlg: boolean;
    ecysE_SubSubjectFlg: boolean;
    ecysE_ActiveFlg: boolean;

    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: string;

    slno?: number;
    selected?: boolean;

    subExamList?: {
        emsE_Id: number;
        emsE_SubExamName: string;
        ecysE_SubExamFlg?: boolean;
        ecysE_MaxMarks?: string;
        ecysE_MinMarks?: string;
        emgr_Id?: number;
        emgr_GradeName?: string;
        exemptedFlg?: boolean;
        exemptedPer?: string;
    }[];

    subSubjectList?: {
        emsS_Id: number;
        emsS_SubSubjectName: string;
        ecysE_SubSubjectFlg?: boolean;
        ecysE_MaxMarks?: string;
        ecysE_MinMarks?: string;
        emgr_Id?: number;
        emgr_GradeName?: string;
        exemptedFlg?: boolean;
        exemptedPer?: string;
    }[];
}
