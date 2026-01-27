'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterProgram } from '@/types/sports/masters/program';

export async function getMasterPrograms(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/ProgramMaster/loadgrid/1?${urlParams}`;

    const dummyDataCount = 24;
    const dummyData: IMasterProgram[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccpM_Id: 3000 + i,
        mI_Id: 1,
        spccpM_Name: `Program Name ${i + 1}`,
        spccpM_Description: `Description for Program ${i + 1}`,
        spccpM_ActiveFlag: ![4, 9, 14, 19, 23].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterProgram[]>('sports', url);

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

export async function saveMasterProgram(data: any) {
    const url = '/ProgramMaster/saveRecord';
    return await api.post<any>('sports', url, data);
}

export async function deactivateMasterProgram(data: any) {
    const url = '/ProgramMaster/deactivate/';
    return await api.post<any>('sports', url, data);
}
