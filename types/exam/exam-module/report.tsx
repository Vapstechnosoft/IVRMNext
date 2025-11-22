// src/types/exam/exam-module/report.ts
export interface ISubject {
    ismS_Id: number;
    ismS_SubjectName: string;
    eyceS_AplResultFlg: boolean;
    type: 'Marks' | 'Grade';
    eyceS_MarksDisplayFlg?: boolean;
    eyceS_GradeDisplayFlg?: boolean;
    eyceS_SubjectOrder?: number;
    estmpS_MaxMarks?: number | null;
}
export interface ICumulativeReport {
    amsT_FirstName: string;
    amaY_RollNo?: number | null;
    amsT_AdmNo?: string | null;
    amsT_RegistrationNo?: string | null;
    sub_list: Array<{
        ismS_Id: number;
        estmpS_ObtainedMarks?: number | null;
        estmpS_ObtainedGrade?: string | null;
        estmpS_PassFailFlg?: string | null;
    }>;
    estmP_TotalMaxMarks?: number | null;
    estmP_TotalObtMarks?: number | null;
    estmP_Percentage?: number | null;
    estmP_TotalGrade?: string | null;
    estmP_Result?: string | null;
    estmP_ClassRank?: string | number | null;
    estmP_SectionRank?: string | number | null;
    classheld?: number | null;
    classatt?: number | null;
}

export interface IReportHeader {
    mI_name?: string;
    yr?: string;
    cla?: string;
    sec?: string;
    exmmid?: string;
}
export interface IAcademicYearandClass {
    mI_Id?: number;
    asmaY_Id: number;
    asmaY_Year: string;
    asmcL_Id: number;
    asmcL_ClassName: string;
}

export interface IAcademicYearandClassandsection {
    mI_Id?: number;
    asmaY_Id: number;
    asmaY_Year: string;
    asmcL_Id: number;
    asmcL_ClassName: string;
    asmS_Id: number;
    asmC_SectionName: string;
    emE_Id: number;
    emE_ExamName: string;
    amsT_Id: number;
    amsT_FirstName: string;
}

export interface IExamReportCard {
    amsT_FirstName: string;
    amsT_FatherName?: string;
    amsT_DOB?: string;
    amaY_RollNo?: number | null;
    amsT_AdmNo?: string | null;
    amsT_RegistrationNo?: string | null;
    sub_list: Array<{
        ismS_Id: number;
        estmpS_ObtainedMarks?: number | null;
        estmpS_ObtainedGrade?: string | null;
        estmpS_PassFailFlg?: string | null;
        estmpS_MaxMarks?: number | null;
    }>;
    estmP_TotalMaxMarks?: number | null;
    estmP_TotalObtMarks?: number | null;
    estmP_Percentage?: number | null;
    estmP_TotalGrade?: string | null;
    estmP_Result?: string | null;
    estmP_ClassRank?: string | number | null;
    estmP_SectionRank?: string | number | null;
    classheld?: number | null;
    classatt?: number | null;
    estmP_TotalGradeRemark?: string;
}
