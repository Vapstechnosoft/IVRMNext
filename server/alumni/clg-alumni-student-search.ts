'use server';

import { api } from '@/lib/apiService';
import type { IClgAlumniSearchLoadDataResponse, IClgAlumniSearchResponse } from '@/types/alumni/clg-alumni-student-search';

export async function getClgAlumniSearchLoadData() {
    const url = '/CLGAlumniMembership/get_intial_data/1';
    return await api.get<IClgAlumniSearchLoadDataResponse>('alumni', url);
}

export async function getCoursesByYear(asmaY_Id: number) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const url = `/ApplicationForm/getCourse/`;
    return await api.post<any>('alumni', url, { ASMAY_Id: asmaY_Id });
}

export async function getBranchesByCourse(data: { AMCO_Id: number; ASMAY_Id: number }) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const url = `/ApplicationForm/getBranch/`;
    return await api.post<any>('alumni', url, data);
}

export async function getSemestersByBranch(data: { AMB_Id: number; ASMAY_Id: number; ACAYCB_Id: number }) {
    // biome-ignore lint/style/noUnusedTemplateLiteral: <explanation>
    const url = `/ApplicationForm/getSemester/`;
    return await api.post<any>('alumni', url, data);
}

export async function searchClgAlumniStudents(data: any) {
    const url = '/CLGAlumnistudentsearch/';
    return await api.post<IClgAlumniSearchResponse>('alumni', url, data);
}
