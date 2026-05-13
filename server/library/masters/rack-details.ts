'use server';

import { auth } from '@/lib/auth';
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getMasterRackDetails(searchParams?: ApiSearchparams) {
    const session = await auth();
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/RackDetails/get-master-rack-list?${urlParams}`;
    const response = await api.get<any>('library', url);
    return response;
}

export async function addOrUpdateMasterRack(data: any) {
    const session = await auth();
    const payload = {
        ...data,
        MI_Id: session?.mi_id
    };
    const url = 'RackDetailsFacade/Savedata';
    return await api.post<any>('library', url, payload);
}

export async function toggleMasterRack(id: number) {
    try {
        const url = `/RackDetails/toggle-master-rack/${id}`;
        // Usually toggle endpoints are POST in this architecture.
        return await api.post<any>('library', url, {});
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to toggle record' };
    }
}
