'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterBankList } from '@/types/hrms/hrms-config/master';

export async function getMasterBank(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmbD_BankName,hrmbD_BranchName,hrmbD_BankAccountNo,hrmbD_IFSCCode,hrmbD_BankAddress');
    const url = `/api/MasterBankFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterBankList[]>('hrms', url);
}

export async function addOrUpdateMasterBank(data: any) {
    const url = '/api/MasterBankFacade/SaveUpdate';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterBank(id: number) {
    const url = `/api/MasterBankFacade/toggle/${id}`;
    return await api.put('hrms', url);
}
