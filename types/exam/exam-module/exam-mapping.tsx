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
    elP_Id: number;
    asmaY_Year: string;
    ivrmstauL_Id: number;
    hrmE_EmployeeName: string;
    elP_ActiveFlg: boolean;
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmS_Id: number;
    asmC_SectionName: string;
    asmaY_Order: number;
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
export interface ILoginPrivilegeDetails {
    slno: number;
    classId: number;
    className: string;

    sectionId: number;
    sectionName: string;

    subjectId: number;
    subjectName: string;

    subSubjectId: number;
    subSubjectName: string; // Allow backend extra fields safely
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

export interface ILifeSkillAreaMapping {
    ecsaM_Id: number;
    ecsA_Id: number;
    ecS_Id: number;
    mI_Id: number;
    asmaY_Id: number;
    emgR_Id: number;
    ecS_SkillName: string;
    ecsA_SkillArea: string;
    ecsaM_IndicatorDescription: string;
    emgR_NAME: string;
    asmaY_Year: string;
    asmaY_Order?: number;
    ecsaM_ActiveFlag: boolean;
    createdDate?: string;
    updatedDate?: string;
}
export interface CategoryDetail {
    eycE_Id: number;
    eycE_CategoryFlg: boolean;
    mycL_CategoryName: string;
    mycL_Id: number;
}
export interface ExamDetail {
    eycE_Id: number;
    eycE_ExamFlg: boolean;
    emE_Id: number;
    emE_ExamName: string;
}

export interface IExamMarksProcessCondition {
    eycE_Id: number;
    eamY_Year: string;
    eypE_Flag: boolean;
    eypE_SeviourFlg: boolean;
    examName: string;
    emgr_ExamGroup?: string;
    estT_Description?: string;

    eypdT_MonthDayFlg: boolean;
    eypdT_CountFlg: boolean;
    eypdT_WeekDayFlg: boolean;
    eypdT_SpecifcDateFlg: boolean;
    eypdT_Count: number;
    eypdT_CountOfDays: number;

    eycD_DaysFlg: boolean;
    eycD_HoursFlg: boolean;
    eycD_Count: number;
    eycD_CountOfTime: number;

    eycE_AttendanceFlg: boolean;
    eycE_HomeWorkFlg: boolean;
    eycE_DisciplineFlg: boolean;

    eyp_CTFlg: boolean;

    eycE_CategoryFlg: boolean;
    categoryDetails: CategoryDetail[];

    eycE_ExamFlg: boolean;
    examDetails: ExamDetail[];
}

export interface IExamWiseRemarksGrid {
    asmS_Id: number;
    asmC_SectionName: string;
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmaY_Id: number;
    asmaY_Year: string;
    asmaY_Order: number;
    emE_Id: number;
    emE_ExamName: string;
    emE_ExamOrder: number;
}

export interface IExamWiseStudentRemarksStudent {
    amsT_FirstName: string;
    amsT_Id: number;
    amsT_RegistrationNo: string;
    amaY_RollNo: number;
    amsT_AdmNo: string;
    emeR_Remarks: string | null;
    estmP_TotalObtMarks: number;
    estmP_TotalMaxMarks: number;
    estmP_Percentage: number;
}

export interface IHallTicketGeneratedItem {
    asmaY_Year: string;
    emE_ExamName: string;
    asmcL_ClassName: string;
    asmC_SectionName: string;
    asmaY_Order: number;
    asmcL_Id: number;
    asmS_Id: number;
    asmaY_Id: number;
    emE_Id: number;
}

// Student List Response
export interface IHallTicketStudentItem {
    amsT_Id: number;
    amsT_FirstName: string;
    amsT_AdmNo: string;
    ehT_HallTicketNo: string;
    amaY_Rollno: number;
    ehT_Id: number;
    ehT_PublishFlg: boolean | null;
    asmcL_ClassName: string;
    asmC_SectionName: string;
}

export interface IPromotionRemarksGrid {
    slNo: number; // Serial number
    admNo: string; // Admission number
    studentName: string; // Student's full name
    studentId: number; // Student ID
    remarks?: string; // Remarks for the student
}

export interface IPromotionSetting {
    id: number;
    asmaY_Id: number;
    emcA_CategoryName?: string;
    emgR_GradeName?: string;
    promotion_type: string;
    pass_to_individual: boolean;
    pass_to_overall: boolean;
    best_applicable: boolean;
    best_off: number;
}

export interface IExamPromotionalSettingDetails {
    eycsE_Id: number; // Subject Mapping ID  (Row ID)
    eycE_Id: number; // Parent ExamId (FK)
    emS_Id: number; // Subject Id
    subjectName: string;
    maxMarks: number;
    minMarks: number;
    passPercentage?: number;
    isActive: boolean;

    // Navigation Forward → Page-2
    groups?: IExamSubjectGroupingDetails[];
}

export interface IExamSubjectGroupDetails {
    emcA_Id: number;
    emcA_CategoryName: string;
    emE_Id: number;
    emE_ExamName: string;
}

// types/exam/student-transaction.ts

export interface IStudentTransactionGrid {
    slNo: number;
    studentId: number;
    studentName: string;
    regNo: string;
    rollNo: number;
    score: number;
    checked?: boolean;
}

export interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

export interface IClass {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface ISection {
    asmS_Id: number;
    asmC_SectionName: string;
}

export interface IExamTerm {
    ect_Id: number;
    ect_TermName: string;
}

export interface ISkillActivity {
    id: number;
    name: string;
    type: 'skill' | 'activity';
}

export interface ISkillName {
    id: number;
    name: string;
}

export interface ISkillArea {
    id: number;
    name: string;
    skillNameId: number;
}

export interface IActivityName {
    id: number;
    name: string;
}

export interface IActivityArea {
    id: number;
    name: string;
    activityNameId: number;
}
