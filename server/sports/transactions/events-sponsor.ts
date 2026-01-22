'use server';

import { api, getSearchParamsUrl, type ApiResponse } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';

/**
 * Fetch Events Sponsor Mapping with 17 dummy entries.
 */
export async function getEventsSponsorMapping(searchParams?: ApiSearchparams): Promise<ApiResponse<IEventSponsorMapping[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/EventSponsorMapping/getDetails/2?${urlParams}`;

    const dummyDataCount = 17;
    const dummyData: IEventSponsorMapping[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccesP_Id: 1000 + i,
        mI_Id: 1,
        spccE_Id: 2000 + i,
        spccmsP_Id: 3000 + i,
        spccesP_ActiveFlag: ![2, 5, 8, 12, 15].includes(i),
        spccpM_Name: `Annual Sports Program ${i + 1}`,
        sponsorName: `Sponsor Company ${i + 1}`,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    try {
        const response = await api.get<IEventSponsorMapping[]>('sports', url);
        if (response.success && response.data && response.data.length > 0) {
            return response;
        }
        return {
            success: true,
            message: 'Data fetched successfully (Dummy Data)!!',
            data: dummyData
        };
    } catch (error) {
        return {
            success: true,
            message: 'Data fetched successfully (Dummy Data)!!',
            data: dummyData
        };
    }
}

/**
 * Save or Update Events Sponsor Mapping.
 */
export async function saveEventsSponsorMapping(data: any): Promise<ApiResponse<any>> {
    const url = '/EventSponsorMapping/saveRecord';
    return await api.post<any>('sports', url, data);
}

/**
 * Deactivate or Activate Events Sponsor Mapping.
 */
export async function deactivateEventsSponsorMapping(data: any): Promise<ApiResponse<any>> {
    const url = '/EventSponsorMapping/deactivate';
    return await api.post<any>('sports', url, data);
}
