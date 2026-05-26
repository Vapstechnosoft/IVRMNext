'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterCustomer(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterCustomerFacade/getloaddata?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvMasterCustomer(data: any) {
    const url = '/INV_MasterCustomerFacade/savedetails';
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterCustomer(data: any) {
    const url = `/INV_MasterCustomerFacade/deactive?id=${data.invmC_Id}`;
    return await api.get<any>('inventory', url);
}
