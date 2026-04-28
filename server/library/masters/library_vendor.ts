'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterVendorList } from '@/types/library/masters/masters';

export async function getMasterVendorList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmV_VendorName');
    const url = `/MasterVendor/get-master-vendor-list?${urlParams}`;
    return await api.get<IMasterVendorList[]>('library', url);
}

export async function addOrUpdateMasterVendor(data: any) {
    try {
        const url = '/MasterVendor/add-or-update/';
        return await api.post<any>('library', url, data);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during save' };
    }
}

export async function toggleMasterVendor(id: number) {
    try {
        const url = `/MasterVendor/toggle?LMV_Id=${id}`;
        return await api.put('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during toggle' };
    }
}

export async function deleteMasterVendor(id: number) {
    try {
        const url = `/MasterVendor/delete/${id}`;
        return await api.delete('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'An error occurred during delete' };
    }
}
