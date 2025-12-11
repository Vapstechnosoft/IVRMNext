'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get employee monthly report data
 * POST /api/EmployeeMonthlyReportFacade/search
 */
export async function getEmployeeMonthlyReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeMonthlyReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}

