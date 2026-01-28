'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterEventVenue } from '@/types/sports/masters/venue';

export async function getMasterVenues(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterEventVenue/loadgrid/1?${urlParams}`;

    const dummyDataCount = 15;
    const dummyData: IMasterEventVenue[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccmeV_Id: 2000 + i,
        mI_Id: 1,
        spccmeV_EventVenue: `Venue Name ${i + 1}`,
        spccmeV_EventVenueDesc: `Description for Venue ${i + 1}`,
        spccmeV_ActiveFlag: ![0, 4, 8, 13].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterEventVenue[]>('sports', url);

        let allData = dummyData;
        let totalCount = dummyDataCount;

        if (response && response.success && Array.isArray(response.data)) {
            allData = [...response.data, ...dummyData];
            totalCount = (response.total || response.data.length) + dummyDataCount;
        }

        return {
            success: true,
            message: response?.message || 'Data loaded successfully',
            data: allData.slice(start, end),
            total: totalCount
        };
    } catch (error) {
        return {
            success: true,
            message: 'Static data loaded (Backup)',
            data: dummyData.slice(start, end),
            total: dummyDataCount
        };
    }
}

export async function saveMasterVenue(data: any) {
    const url = '/MasterEventVenue/saveRecord';
    return await api.post<any>('sports', url, data);
}

export async function deactivateMasterVenue(data: any) {
    const url = '/MasterEventVenue/deactivate/';
    return await api.post<any>('sports', url, data);
}
