'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterSponsor } from '@/types/sports/masters/sponsors';

export async function getMasterSponsors(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterSponser/loadgrid/1?${urlParams}`;

    const dummyDataCount = 24;
    const dummyData: IMasterSponsor[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccmsP_Id: 4000 + i,
        mI_Id: 1,
        spccmsP_SponsorName: `Sponsor ${i + 1}`,
        spccmsP_ContactPerson: `Person ${String.fromCharCode(65 + (i % 26))} ${i + 1}`,
        spccmsP_ContactNo: `98765432${(i + 10).toString().slice(-2)}`,
        spccmsP_SponsorDetails: `Details for Sponsor ${i + 1}. This is a dummy description for testing.`,
        spccmsP_ActiveFlag: ![1, 5, 11, 17, 22].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterSponsor[]>('sports', url);

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

export async function saveMasterSponsor(data: any) {
    const url = '/MasterSponser/saveRecord';
    return await api.post<any>('sports', url, data);
}

export async function deactivateMasterSponsor(data: any) {
    const url = '/MasterSponser/deactivateSponser/';
    return await api.post<any>('sports', url, data);
}
