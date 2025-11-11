// EXAM MAPPING
export interface IYearlyCategorySubjectMapping {
    eyC_Id: number;
    eyC_BasedOnPaperTypeFlg: boolean;
    asmaY_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    emcA_Id: number;
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
    esG_ExamPromotionFlag: 'IE' | 'PE';
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
    eycE_Id: number;
    eyC_Id: number;
    emcA_Id: number;
    asmaY_Id: number;
    emE_Id: number;
    emgR_Id: number;
    asmaY_Year: string;
    emcA_CategoryName: string;
    emE_ExamName: string;
    emE_ExamCode: string;
    emgR_GradeName: string;

    eycE_AttendanceFromDate: string;
    eycE_AttendanceToDate: string;

    eycE_SubExamFlg: boolean;
    eycE_SubSubjectFlg: boolean;
    eycE_ActiveFlg: boolean;

    asmaY_Order: number;
    eycE_BestOf: number;
    eycE_BestOfApplicableFlg: boolean;

    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: string;

    slno?: number;
    selected?: boolean;

    subExamList?: {
        emsE_Id: number;
        emsE_SubExamName: string;
        eycE_SubExamFlg?: boolean;
        eycE_MaxMarks?: string;
        eycE_MinMarks?: string;
        emgR_Id?: number;
        emgR_GradeName?: string;
        exemptedFlg?: boolean;
        exemptedPer?: string;
    }[];

    subSubjectList?: {
        emsS_Id: number;
        emsS_SubSubjectName: string;
        eycE_SubSubjectFlg?: boolean;
        eycE_MaxMarks?: string;
        eycE_MinMarks?: string;
        emgR_Id?: number;
        emgR_GradeName?: string;
        exemptedFlg?: boolean;
        exemptedPer?: string;
    }[];
}

export interface IExamSubjectOrder {
    eyceS_Id: number;
    eycE_Id: number;
    ismS_Id: number;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    eyceS_SubjectOrder: number;
}

export interface IExamSubjectWizardDetails {
    eyceS_Id: number;
    eycE_Id: number;
    ismS_Id: number;
    emcA_CategoryName: string;
    emE_ExamName: string;
    emgR_GradeName: string;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    eyceS_MaxMarks: number;
    eyceS_MinMarks: number;
    eyceS_MarksEntryMax: number;
    eyceS_SubExamFlg: boolean;
    eyceS_SubSubjectFlg: boolean;
    eyceS_MarksGradeEntryFlg: string;
    eyceS_MarksDisplayFlg: boolean;
    eyceS_GradeDisplayFlg: boolean;
    eyceS_AplResultFlg: boolean;
    eyceS_SubjectOrder: number;
    eyceS_ActiveFlg: boolean;
    pT_Count: number;
}

export interface ICoScholasticActivityAreaMapping {
    ecacT_SkillName?: string; // "ACTIVITY"
    ecactA_SkillArea?: string; // "ART EDUCATION"
    emgR_GradeName?: string; // "100 Marks Percentage"
    ecactaM_Id?: number; // 19
    emgR_Id?: number; // 133
    ecactaM_ActiveFlag: boolean; // true
    ecactaM_IndicatorDescription?: string | null; // "string" (or null)
    asmaY_Year?: string; // "2024-2025"
    asmaY_Order?: number;
    ecacT_Id?: number;
    ecactA_Id?: number;
    asmaY_Id?: number; // 26
    }


export interface ISubSubjectSubExamMapped {
    eycessS_Id: number;
    eyceS_Id: number;
    ismS_Id: number;
    emsS_Id: number;
    emgR_GradeName: string;
    ismS_SubjectName: string;
    ismS_SubjectCode: string;
    emsS_SubSubjectName?: string;
    emsS_SubSubjectCode?: string;
    emsE_SubExamName?: string;
    emsE_SubExamCode?: string;
    eycessS_MaxMarks: number;
    eycessS_MinMarks: number;
    eycessS_ExemptedFlg: boolean;
    eycessS_ExemptedPer: number;
    eycessS_SubSubjectOrder: number;
    eycessS_ActiveFlg: boolean;
    eycessS_GradesFlg: boolean;
    eycessS_MarksFlg: boolean;
    eycessS_AplResultFlg?: boolean;
    eycessS_MarksEntryMax?: number;

}
