'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

/**
 * Get employee in-out report data
 * POST /api/EmployeeInOutReportFacade/search
 */
export async function getEmployeeInOutReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'searchableColumns');
    const url = `/api/EmployeeInOutReportFacade/search?${urlParams}`;
    return await api.post<any>('hrmsfrontoffice', url, data);
}
