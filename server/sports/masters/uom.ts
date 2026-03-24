'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterUOM } from '@/types/sports/masters/uom';

export async function getMasterUOMs(searchParams?: ApiSearchparams) {
    // Following the Events page reference: URL parameters with api.post and an empty body.
    // We explicitly map the frontend column names to backend DMO field names (PascalCase) 
    // and provide the required search_column to trigger the search helper on the backend.
    
    const params = {
        ...searchParams,
        // Map frontend sorting keys to backend database field names
        sort_column: searchParams?.sort_column === 'spccmuoM_Id' ? 'SPCCMUOM_Id' : 
                    searchParams?.sort_column === 'spccmuoM_UOMName' ? 'SPCCMUOM_UOMName' : 
                    searchParams?.sort_column === 'spccmuoM_ActiveFlag' ? 'SPCCMUOM_ActiveFlag' :
                    searchParams?.sort_column || '',
        // The apiService getSearchParamsUrl helper expects 'search_columns' to map to 'search_column' in the URL
        search_columns: searchParams?.search_query ? 'SPCCMUOM_UOMName' : ''
    };
    
    const urlParams = getSearchParamsUrl(params);
    const url = `/SportMasterUOM/Getdetails?${urlParams}`;
    return await api.post<IMasterUOM[]>('sports', url, {});
}

export async function getMasterUOMDetails(id: number) {
    const url = `/SportMasterUOM/GetSelectedRowDetails/${id}`;
    return await api.post<IMasterUOM>('sports', url, {});
}

export async function saveMasterUOM(data: any) {
    const payload = {
        spccmuoM_Id: data.spccmuoM_Id,
        spccmuoM_UOMName: data.spccmuoM_UOMName
    };

    const url = `/SportMasterUOM`;
    return await api.post<any>('sports', url, payload);
}

export async function deactivateMasterUOM(data: any) {
    const payload = {
        ...data,
        SPCCMUOM_Id: data.spccmuoM_Id ?? data.SPCCMUOM_Id,
        SPCCMUOM_ActiveFlag: data.spccmuoM_ActiveFlag ?? data.SPCCMUOM_ActiveFlag,
        MI_Id: data.mI_Id || 0
    };

    const url = `/SportMasterUOM/deactivate`;
    return await api.post<any>('sports', url, payload);
}
