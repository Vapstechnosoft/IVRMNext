'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterLoanList } from '@/types/hrms/hrms-config/master';

export async function getMasterLoan(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmL_LoanType');
    const url = `/api/MasterLoanFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterLoanList[]>('hrms', url);
}

export async function addOrUpdateMasterLoan(data: any) {
    const url = '/api/MasterLoanFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterLoan(id: number) {
    const url = `/api/MasterLoanFacade/toggle/${id}`;
    return await api.put('hrms', url);
}

