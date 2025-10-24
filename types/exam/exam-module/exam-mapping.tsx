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
