'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { revalidatePath } from 'next/cache';
import { SportsCCNameMasterDataDTO, SportsCCNameEditDetailsDTO } from '@/types/sports/masters/sports-cc-name';

const BASE_URL = 'sports';

export async function getSportsCCNameDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'groupName,spccmscC_SportsCCName,spccmscC_SportsCCDesc');
    const url = `/MasterSportsCCName/getDetails?${urlParams}`;
    return await api.post<SportsCCNameMasterDataDTO>(BASE_URL, url, {});
}

export async function saveSportsCCName(data: any) {
    const url = '/MasterSportsCCName/save';
    const res = await api.post<any>(BASE_URL, url, data);
    revalidatePath('/Sports/Masters/SportsCCName');
    return res;
}

export async function editSportsCCNameDetails(id: number) {
    const url = `/MasterSportsCCName/EditDetails/${id}`;
    return await api.post<SportsCCNameEditDetailsDTO>(BASE_URL, url, {});
}

export async function deactivateSportsCCName(data: any) {
    const SPCCMSC_Id = data.spccmscC_Id;
    const SPCCMSC_ActiveFlag = data.spccmscC_ActiveFlag;

    const url = `/MasterSportsCCName/deactivate?SPCCMSC_Id=${SPCCMSC_Id}&SPCCMSC_ActiveFlag=${SPCCMSC_ActiveFlag}`;
    const res = await api.post<any>(BASE_URL, url, {});
    revalidatePath('/Sports/Masters/SportsCCName');
    return res;
}
