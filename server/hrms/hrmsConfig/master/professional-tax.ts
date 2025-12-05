'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterProfessionalTaxList } from '@/types/hrms/hrms-config/master';

export async function getMasterProfessionalTax(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'hrmpT_SalaryFrom,hrmpT_SalaryTo,hrmpT_PTax');
    const url = `/api/MasterProfessionalTaxFacade/onloadgetdetails?${urlParams}`;
    return await api.get<IMasterProfessionalTaxList[]>('hrms', url);
}

export async function addOrUpdateMasterProfessionalTax(data: any) {
    const url = '/api/MasterProfessionalTaxFacade';
    return await api.post<any>('hrms', url, data);
}

export async function toggleMasterProfessionalTax(id: number) {
    const url = `/api/MasterProfessionalTaxFacade/deactivateRecordById/${id}`;
    return await api.put('hrms', url);
}

export async function deleteMasterProfessionalTax(id: number) {
    const url = `/api/MasterProfessionalTaxFacade/delete/${id}`;
    return await api.delete<any>('hrms', url);
}
