// /types/exam/master-subject.ts

export interface IMasterSubject {
    exsuB_Id: number; // Unique Subject ID
    exsuB_SubjectName: string; // Subject Name
    exsuB_IVRSName: string; // IVRS Subject Name
    exsuB_SubjectCode: string; // Subject Code
    exsuB_SubjectType: string; // Subject Type (e.g., Theory/Practical)
    exsuB_MaxMarks: number; // Maximum Marks
    exsuB_MinMarks: number; // Minimum Marks
    exsuB_PreAdmissionFlag: number; // Pre-Admission Flag (0/1)
    exsuB_AttendanceFlag: number; // Attendance Flag (0/1)
    exsuB_BatchWiseFlag: number; // Batch Wise Flag (0/1)
    exsuB_ExamFlag: number; // Exam Flag (0/1)
    exsuB_LanguageFlag: number; // Language Flag (0/1)
    exsuB_ExtraFeeFlag: number; // Extra Fee Flag (0/1)
    exsuB_IsActiveFlag: boolean;
}

export interface IMasterSubjectOrder {
    exsuB_Id: number; // Unique Subject ID
    exsuB_SubjectName: string; // Subject Name
    exsuB_SubjectCode: string; // Subject Code
    exsuB_SubjectOrder: number;
}

export interface IMasterExam {
    ex_Id: number;
    ex_ExamName: string;
    ex_IVRSExamName: string;
    ex_ExamDescription: string;
    ex_ExamCode: string;
    ex_ExamOrder: number;
    ex_FinalExamFlag: number;
    ex_SubjectWiseMarksPublishFlag: number;
    ex_IsActiveFlag: boolean;
}

export interface IMasterExamPaper {
    ex_Id: number;
    ex_ExamPaperType: string;
    ex_DisplayColor: string;
    ex_PaperTypeDescription: string;
    ex_IsActiveFlag: boolean;
}

export interface IMasterSubExam {
    ex_Id: number;
    ex_SubExamName: string;
    ex_SubExamCode: string;
    ex_IsActiveFlag: boolean;
}

export interface IMasterSubSubject {
    ex_Id: number;
    ex_SubSubjectName: string;
    ex_SubSubjectCode: string;
    ex_IsActiveFlag: boolean;
}

export interface IMasterGrade {
    ex_Id: number;
    ex_GradeName: string;
    ex_GradeDetails: string;
    ex_IsActiveFlag: boolean;
}

export interface IGradeDetails {
    ex_Id: number;
    ex_Grade: string;
    ex_From: number;
    ex_To: number;
    ex_GradePoints: number;
    ex_Remarks: string;
    ex_IsActiveFlag: boolean;
}

export interface IMasterSubjectGroup {
    ex_Id: number;
    ex_GroupName: string;
    ex_MaxApplicapleSubjects: number;
    ex_MinApplicableSubjects: number;
    ex_BestOffSubjects: number;
    ex_ElectiveSubjects: number;
    ex_IsActiveFlag: boolean;
}

export interface IMasterSubjectGroupDetails {
    ex_Id: number;
    ex_SubjectName: string;
    ex_SubjectCode: string;
}

export interface IMasterCategory {
    ex_Id: number;
    ex_CategoryName: string;
    ex_CCEPromotionApplicableFlag: number;
    ex_IsActiveFlag: boolean;
}

// Category Class Mapping

export interface ICategoryMapping {
    ex_Id: number;
    ex_AcademicYear: string;
    ex_CategoryName: string;
    ex_ClassName: string;
    ex_IsActiveFlag: boolean;
}

export interface IMasterExamCategoryMapping {
    ex_Id: number;
    ex_AcademicYear: string;
    ex_CategoryName: string;
    ex_ClassName: string;
    ex_Sections: ISection[];
    ex_IsActiveFlag: boolean;
}

export interface IAcademicYear {
    id: number;
    year: string;
}

export interface ICategory {
    id: number;
    name: string;
}

export interface IClass {
    id: number;
    name: string;
}

export interface ISection {
    id: number;
    name: string;
}
