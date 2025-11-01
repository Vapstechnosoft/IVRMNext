'use server';

import { api } from '@/lib/apiService';
import type {
    CumulativeSalaryReportOnloadResponse,
    CumulativeSalaryReportSearchRequest,
    CumulativeSalaryReportSearchResponse
} from '@/types/hrms/reports/cumulative-salary-report';

export async function getCumulativeSalaryReportOnload(MI_Id = 30) {
    const url = `/api/CumulativeSalaryReportFacade/onloadgetdetailsNew?mid=${MI_Id}`;
    return await api.post<CumulativeSalaryReportOnloadResponse>('hrms', url, {});
}

export async function searchCumulativeSalaryReport(data: CumulativeSalaryReportSearchRequest) {
    const url = '/api/CumulativeSalaryReportFacade/GetEmployeedetailsBySelectionNew';
    return await api.post<CumulativeSalaryReportSearchResponse>('hrms', url, data);
}

export async function testCumulativeSalaryReportAPI(MI_Id = 30) {
    return await getCumulativeSalaryReportOnload(MI_Id);
}
