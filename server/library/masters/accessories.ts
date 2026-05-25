'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterAccessories(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterAccessoriesFacade/get-master-acessories-list?${urlParams}`;
    const response = await api.get<any[]>('library', url);
    return response;
}

export async function addOrUpdateMasterAccessories(data: any) {
    const url = '/MasterAccessoriesFacade/add-or-update';
    return await api.post<any>('library', url, data);
}

export async function deactivateMasterAccessories(data: any) {
    try {
        const id = typeof data === 'object' ? data.lmaC_Id : data;
        const url = `/MasterAccessoriesFacade/toggle-master-accessories/${id}`;
        return await api.put<any>('library', url);

    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}

