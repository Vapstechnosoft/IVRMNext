'use server';

import { api } from '@/lib/apiService';
import type {
    IAlumniLettersLoadResponse,
    IAlumniLettersReportResponse,
    IAlumniLettersShowReportResponse
} from '@/types/alumni/alumni-letters';

export async function getAlumniLettersLoadData() {
    const url = '/Alumniletters/BindData/2';
    return await api.get<IAlumniLettersLoadResponse>('alumni', url);
}

export async function getAlumniLettersShowReport(data: { ASMAY_Id: number; ASMCL_Id: number; logoname: string }) {
    const url = '/Alumniletters/ShowReport';
    return await api.post<IAlumniLettersShowReportResponse>('alumni', url, data);
}

export async function getAlumniLettersReport(data: {
    ASMAY_Id: number;
    ASMCL_Id: number;
    letter_list: string;
    logoname: string;
    studlistdata: { amsT_Id: number }[];
}) {
    const url = '/Alumniletters/letterReport';
    return await api.post<IAlumniLettersReportResponse>('alumni', url, data);
}
