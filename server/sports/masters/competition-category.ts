'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { revalidatePath } from 'next/cache';
import type { ApiSearchparams } from '@/types';

export async function getMasterCompetitionCategories(searchParams?: ApiSearchparams) {
    const params = { ...searchParams };
    if (params.search_query) {
        params.search_query = String(params.search_query).trim();
        // If no columns selected, use default searchable columns
        if (!params.search_columns || params.search_columns === '') {
            params.search_columns = 'SPCCMCC_CompitionCategory,SPCCMCC_CCDesc';
        }
    }
    const urlParams = getSearchParamsUrl(params);
    const url = `/MasterCompetitionCategory/getDetails?${urlParams}`;
    return await api.post<any>('sports', url, params || {});
}

export async function getMasterCompetitionCategoryDetails(id: number) {
    const url = `/MasterCompetitionCategory/EditDetails/${id}`;
    return await api.post<any>('sports', url, {});
}

export async function saveMasterCompetitionCategory(data: any) {
    const url = '/MasterCompetitionCategory/save';
    const res = await api.post<any>('sports', url, data);
    revalidatePath('/Sports/Masters/CompetitionCategory');
    return res;
}

export async function deactivateMasterCompetitionCategory(data: any) {
    const url = '/MasterCompetitionCategory/deactivate';
    const res = await api.post<any>('sports', url, data);
    revalidatePath('/Sports/Masters/CompetitionCategory');
    return res;
}
