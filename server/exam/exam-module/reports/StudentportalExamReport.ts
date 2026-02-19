'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getExamReportLoadData() {
    // const session = await auth();
    // const amst_Id = session?.amst_id || 17064; 
    const payload = {
        "AMST_Id": 17064
    };
    const url = '/ExamReport/Exam-get-load-data';
    return await api.post<any>('portal', url, payload);
}

export async function getAcademicYearList() {
    const url = '/fee_class_category/academicyearlist';
    return await api.getArray<any>('fees', url);
}

export async function getExamDataforExamReport(asmay_Id: number, type: string) {
    const session = await auth();
    const amst_Id = (session as any)?.amst_id || 17064;
    const payload = {
        "ASMAY_Id": asmay_Id,
        "AMST_Id": amst_Id,
        "Type": type
    };
    const url = '/ExamReport/get-exam-data';
    return await api.post<any>('portal', url, payload);
}

export async function getSubjectDataforExamReport(asmay_Id: number) {
    const session = await auth();
    const amst_Id = (session as any)?.amst_id || 17064;
    const payload = {
        "ASMAY_Id": asmay_Id,
        "AMST_Id": amst_Id
    };
    const url = '/ExamReport/get-Subjects';
    return await api.post<any>('portal', url, payload);
}

export async function getExamReportDataforExamReport(payload: any) {
    const url = '/ExamReport/get-report-data';
    return await api.post<any>('portal', url, payload);
}
