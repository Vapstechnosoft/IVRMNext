'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get employee log report data
 * POST /api/EmployeeLogReportFacade/search
 */
export async function getEmployeeLogReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeLogReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}
