'use server';

import { api } from '@/lib/apiService';
import {
    NDS9ReportPayload,
    NDS9ReportResponse,
    ClassListResponse,
    SectionListResponse,
    StudentListResponse,
    NDS9ReportData,
    NDS15ReportData,
    NDS15ReportResponse
} from '@/types/exam/NDS/NDS_9_ProgressNewCardReport';

export async function getClasses(asmay_id: number) {
    const payload = { ASMAY_Id: asmay_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/get_classes', payload);
    return response as any as ClassListResponse;
}

export async function getSections(asmay_id: number, asmcl_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/get_sections', payload);
    return response as any as SectionListResponse;
}

export async function getStudents(asmay_id: number, asmcl_id: number, asms_id: number) {
    const payload = { ASMAY_Id: asmay_id, ASMCL_Id: asmcl_id, ASMS_Id: asms_id };
    const response = await api.post<any>('exam', '/JSHSExamReports_/GetStudentDetails', payload);
    return response as any as StudentListResponse;
}

export async function getNDS9Report(payload: NDS9ReportPayload): Promise<NDS9ReportData> {
    const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
    return {
        success: response?.success ?? false,
        data: (response?.data || response) as any as NDS9ReportResponse,
        message: response?.message
    };
}

export async function getNDS15Report(payload: NDS9ReportPayload): Promise<NDS15ReportData> {
    const response = await api.post<any>('exam', '/JSHSExamReports_/nds_6_8_report', payload);
    return {
        success: response?.success ?? false,
        data: (response?.data || response) as any as NDS15ReportResponse,
        message: response?.message
    };
}
