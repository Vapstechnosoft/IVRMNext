'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get employee late in/early out report data
 * POST /api/EmployeeLateInEarlyOutReportFacade/search
 */
export async function getEmployeeLateInEarlyOutReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeLateInEarlyOutReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}

