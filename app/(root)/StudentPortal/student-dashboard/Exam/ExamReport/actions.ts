'use server';

import { AcademicYear, Exam, ExamConfig, ExamReportData, ExamReportPayload, Subject } from './types';

// MOCK DATA

const MOCK_YEARS: AcademicYear[] = [
    { asmaY_Id: 23, asmaY_Year: '2023-2024', Selected: true },
    { asmaY_Id: 22, asmaY_Year: '2022-2023', Selected: false },
    { asmaY_Id: 21, asmaY_Year: '2021-2022', Selected: false },
];

const MOCK_EXAMS: Exam[] = [
    { emE_Id: 101, emE_ExamName: 'Mid Term Exam', Selected: false },
    { emE_Id: 102, emE_ExamName: 'Annual Exam', Selected: false },
];

const MOCK_SUBJECTS: Subject[] = [
    { ismS_Id: 501, ismS_SubjectName: 'Mathematics', Selected: false },
    { ismS_Id: 502, ismS_SubjectName: 'Science', Selected: false },
    { ismS_Id: 503, ismS_SubjectName: 'English', Selected: false },
    { ismS_Id: 504, ismS_SubjectName: 'Social Studies', Selected: false },
];

const MOCK_CONFIG: ExamConfig = {
    exmConfig_ClassRankFlg: true,
    exmConfig_SecRankFlg: true,
    exmConfig_ClassPositionFlg: true,
    exmConfig_SectionPositionFlg: true,
    exmconfig_FeeDefaulterDisplayFlg: false,
};

const MOCK_REPORT_DATA: ExamReportData[] = [
    {
        ASMAY_Year: '2023-2024',
        EME_ExamName: 'Mid Term Exam',
        ISMS_SubjectName: 'Mathematics',
        ISMS_Id: 501,
        ESTMPS_MaxMarks: 100,
        EYCES_MinMarks: 35,
        ESTMPS_ObtainedMarks: 85,
        ESTMPS_ObtainedGrade: 'A',
        ESTMPS_PassFailFlg: 'Pass',
        ESTMPS_ClassHighest: 98,
        ESTMPS_ClassAverage: 75,
        ESTMPS_SectionHighest: 95,
        ESTMPS_SectionAverage: 72,
        EYCES_MarksDisplayFlg: true,
        ESTMP_TotalGrade: 'A',
        ESTMP_Percentage: 85,
        ESTMP_ClassRank: 5,
        ESTMP_SectionRank: 2,
    },
    {
        ASMAY_Year: '2023-2024',
        EME_ExamName: 'Mid Term Exam',
        ISMS_SubjectName: 'Science',
        ISMS_Id: 502,
        ESTMPS_MaxMarks: 100,
        EYCES_MinMarks: 35,
        ESTMPS_ObtainedMarks: 78,
        ESTMPS_ObtainedGrade: 'B+',
        ESTMPS_PassFailFlg: 'Pass',
        ESTMPS_ClassHighest: 96,
        ESTMPS_ClassAverage: 70,
        ESTMPS_SectionHighest: 92,
        ESTMPS_SectionAverage: 68,
        EYCES_MarksDisplayFlg: true,
        ESTMP_TotalGrade: 'B+',
        ESTMP_Percentage: 78,
        ESTMP_ClassRank: 12,
        ESTMP_SectionRank: 5,
    },
    {
        ASMAY_Year: '2023-2024',
        EME_ExamName: 'Mid Term Exam',
        ISMS_SubjectName: 'English',
        ISMS_Id: 503,
        ESTMPS_MaxMarks: 100,
        EYCES_MinMarks: 35,
        ESTMPS_ObtainedMarks: 92,
        ESTMPS_ObtainedGrade: 'A+',
        ESTMPS_PassFailFlg: 'Pass',
        ESTMPS_ClassHighest: 99,
        ESTMPS_ClassAverage: 80,
        ESTMPS_SectionHighest: 95,
        ESTMPS_SectionAverage: 82,
        EYCES_MarksDisplayFlg: true,
        ESTMP_TotalGrade: 'A+',
        ESTMP_Percentage: 92,
        ESTMP_ClassRank: 2,
        ESTMP_SectionRank: 1,
    }
];

export async function getExamReportLoadData() {
    // Mock API call
    return {
        studetiallist: MOCK_YEARS
    };
}

export async function getExamData(payload: { Type: string; ASMAY_Id: number }) {
    // Mock API call
    // Logic to select Exam or Subject based on payload could be added here
    // For now returning both exams and subjects for simplicity in mock
    return {
        examlist: MOCK_EXAMS,
        subjectlist: MOCK_SUBJECTS
    };
}

export async function getSubjects(payload: { Type: string; ASMAY_Id: number; EME_Id: number }) {
    return {
        subjectlist: MOCK_SUBJECTS
    };
}

export async function getStudentExamDetails(payload: ExamReportPayload) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic filtering logic for mock
    let filteredData = [...MOCK_REPORT_DATA];

    if (payload.Type === 'EWAS' && payload.EME_Id) {
        // Filter by Exam ID (Mocking logic as report data has names not IDs)
        // In real app, we filter by ID. Here we just return the dataset associated with "Mid Term"
        // if the ID matches 101, else empty or similar.
        if (payload.EME_Id === 102) {
            // Annual Exam - Return empty or different data
            filteredData = [];
        }
    } else if (payload.Type === 'SWAE' && payload.ISMS_Id) {
        filteredData = filteredData.filter(d => d.ISMS_Id === Number(payload.ISMS_Id));
    }

    return {
        examReportList: filteredData,
        getexamconfig: [MOCK_CONFIG],
        get_eme_id_details: [{ eycE_SubExamFlg: false, eycE_SubSubjectFlg: false }] // Mocking no sub-exams/subjects
    };
}
