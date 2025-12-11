'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get employee yearly report data
 * POST /api/EmployeeYearlyReportFacade/search
 */
export async function getEmployeeYearlyReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeYearlyReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}

