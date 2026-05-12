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

export async function deactivateMasterRack(data: any) {
    const session = await auth();
    const payload = {
        ...data,
        MI_Id: session?.mi_id
    };
    const url = 'RackDetailsFacade/deactiveY';
    return await api.post<any>('library', url, payload);
}

