'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';
import type { ApiSearchparams } from '@/types';
import type { IMasterSportsCCNameUOMResponse } from '@/types/sports/masters/sports-cc-name-uom';

const BASE_URL = 'sports';

export async function getMasterSportsCCNameUOMs(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterSportsCCNameUOM_/getDetails?${urlParams}`;
    return await api.post<IMasterSportsCCNameUOMResponse>(BASE_URL, url, {});
}

export async function saveMasterSportsCCNameUOM(data: any) {
    const url = `/MasterSportsCCNameUOM_/save`;
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCNameUOM');
    return res;
}

export async function editMasterSportsCCNameUOM(id: number) {
    const url = `/MasterSportsCCNameUOM_/EditDetails/${id}`;
    return await api.post<any>(BASE_URL, url, {});
}

export async function deactivateMasterSportsCCNameUOM(data: any) {
    const url = `/MasterSportsCCNameUOM_/deactivate`;
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCNameUOM');
    return res;
}
