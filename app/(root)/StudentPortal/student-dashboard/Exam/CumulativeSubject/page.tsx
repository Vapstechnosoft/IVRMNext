'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

export async function getExamloadCumulativeReport() {
    const url = '/ExamReport/get_Cumulative_loaddata';
    return await api.post<any>('portal', url);
}

export async function getAcademicYearList() {
    const url = '/fee_class_category/academicyearlist';
    return await api.get<any>('fees', url);
}

export async function getExamDataforExamReport(asmay_Id: number, type: string) {
    const session = await auth();
    const amst_Id = session?.user?.amst_id || 18828;
    const url = `/ExamReport/get-exam-data?AMST_Id=${amst_Id}&ASMAY_Id=${asmay_Id}&Type=${type}`;
    return await api.post<any>('portal', url,);
}

export async function getSubjectDataforExamReport(asmay_Id: number) {
    const session = await auth();
    const amst_Id = session?.user?.amst_id || 18828;
    const payload = {
        "amsT_Id": amst_Id,
        "asmaY_Id": asmay_Id
    };
    const url = 'ExamReport/get-Subjects';
    return await api.post<any>('portal', url, payload);
}

export async function getExamReportDataforExamReport(payload: any) {
    const url = '/ExamReport/get-report-data';
    return await api.post<any>('portal', url, payload);
}
