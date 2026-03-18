'use server';

import { api } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';
import type { IMasterSportsCCNameUOMResponse } from '@/types/sports/masters/sports-cc-name-uom';

const BASE_URL = 'sports';

export async function getMasterSportsCCNameUOMs() {
    const url = `/MasterSportsCCNameUOM_/getDetails`;
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
    const SPCCMNUOM_Id = data.spccmnuoM_Id;
    const SPCCMNUOM_ActiveFlag = data.spccmnuoM_ActiveFlag;

    const url = `/MasterSportsCCNameUOM_/deactivate?SPCCMNUOM_Id=${SPCCMNUOM_Id}&SPCCMNUOM_ActiveFlag=${SPCCMNUOM_ActiveFlag}`;
    const res = await api.post<any>(BASE_URL, url, {});
    revalidatePath('/Sports/Masters/SportsCCNameUOM');
    return res;
}
