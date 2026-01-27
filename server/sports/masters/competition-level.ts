'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterCompetitionLevel } from '@/types/sports/masters/competition-level';

export async function getMasterCompetitionLevels(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/SportMasterCompitionLevel/Getdetails?${urlParams}`;

    const dummyDataCount = 14;
    const dummyData: IMasterCompetitionLevel[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccmcL_Id: 3000 + i,
        mI_Id: 2,
        spccmcL_CompitionLevel: i % 2 === 0 ? `Level ${1 + Math.floor(i / 2)}` : `Tier ${1 + Math.floor(i / 2)}`,
        spccmcL_CLDesc: `Description for Competition Level ${i + 1}`,
        spccmcL_ActiveFlag: ![1, 4, 7, 10, 13].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterCompetitionLevel[]>('sports', url);

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

export async function saveMasterCompetitionLevel(data: any) {
    const url = '/SportMasterCompitionLevel/';

    // Mapping keys to match AngularJS expectations of backend
    const payload = {
        SPCCMCL_Id: data.spccmcL_Id || 0,
        SPCCMCL_CompitionLevel: data.spccmcL_CompitionLevel,
        SPCCMCL_CLDesc: data.spccmcL_CLDesc
    };

    return await api.post<any>('sports', url, payload);
}

export async function deactivateMasterCompetitionLevel(data: any) {
    const url = '/SportMasterCompitionLevel/deactivate';
    return await api.post<any>('sports', url, data);
}
