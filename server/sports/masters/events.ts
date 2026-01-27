'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterEvent } from '@/types/sports/masters/events';

export async function getMasterEvents(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterEvent/getDetails/2?${urlParams}`;

    const dummyDataCount = 20;
    const dummyData: IMasterEvent[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccmE_Id: 1000 + i,
        mI_Id: 1,
        spccmE_EventName: `Annual Sports Day ${i + 1}`,
        spccmE_EventNameDesc: `Annual Sports Celebration Event ${i + 1}`,
        spccmE_ActiveFlag: ![0, 3, 7, 12, 16].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterEvent[]>('sports', url);

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

export async function saveMasterEvent(data: any) {
    const url = '/MasterEvent/saveRecord';
    return await api.post<any>('sports', url, data);
}

export async function deactivateMasterEvent(data: any) {
    const url = '/MasterEvent/deactivate/';
    return await api.post<any>('sports', url, data);
}
