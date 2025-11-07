'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';

export async function getStudentCountReport(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'asmaY_Year,asmaY_AcademicYearCode');
    const url = `/report/student_count_report?${urlParams}`;
    return await api.get<IMasterStudentCountReportList[]>('preadmission', url);
}
export async function RegisteredDropDown(data: any) {
    const url = '/master_caste_category';
    return await api.get<any>('admission', url, data);
}
export async function addOrUpdateStudentCountReport(data: any) {
    const url = '/master_caste_category';
    return await api.post<any>('admission', url, data);
}
