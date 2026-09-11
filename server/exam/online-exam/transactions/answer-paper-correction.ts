'use server';

import { api } from '@/lib/apiService';
import type { IAnswerPaperInitialData, IStudentEvaluationDetails, IStudentExamSubmission } from '@/types/exam/online-exam/transactions';

// Get Initial Filter dropdowns (Years, Classes, Sections, Exams)
export async function getAnswerPaperInitialData() {
    const url = '/LP_OnlineExamAnswerPaperCorrection/getloaddata';
    return await api.get<IAnswerPaperInitialData>('exam', url);
}

// Fetch student exam submissions matching filter criteria
export async function getStudentSubmissions(filterData: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    ISMS_Id: number;
    LPMOEEX_Id: number;
}) {
    const url = '/LP_OnlineExamAnswerPaperCorrection/getstudentlist';
    return await api.post<IStudentExamSubmission[]>('exam', url, filterData);
}

// Fetch student's individual question & answer sheet for evaluation
export async function getStudentAnswerSheet(data: {
    AMST_Id: number;
    LPMOEEX_Id: number;
}) {
    const url = '/LP_OnlineExamAnswerPaperCorrection/getstudentanswers';
    return await api.post<IStudentEvaluationDetails>('exam', url, data);
}

// Save teacher evaluated marks
export async function saveEvaluatedMarks(data: {
    AMST_Id: number;
    LPMOEEX_Id: number;
    evaluations: { questionId: number; awardedMarks: number; teacherRemarks?: string }[];
}) {
    const url = '/LP_OnlineExamAnswerPaperCorrection/saveevaluatedmarks';
    return await api.post<any>('exam', url, data);
}
