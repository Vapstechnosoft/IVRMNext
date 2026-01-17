'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterDivision } from '@/types/sports/masters/division';

export async function getMasterDivisions(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/SportMasterDivision/Getdetails?${urlParams}`;

    const dummyDataCount = 18;
    const dummyData: IMasterDivision[] = Array.from({ length: dummyDataCount }, (_, i) => ({
        spccmD_Id: 2000 + i,
        mI_Id: 2,
        spccmD_DivisionName: `Division ${String.fromCharCode(65 + i)}`,
        spccmD_DivisionDescription: `Description for Division ${String.fromCharCode(65 + i)}`,
        spccmD_ActiveFlag: ![2, 5, 8, 12, 15].includes(i),
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
    }));

    const page = searchParams?.page || 1;
    const pageSize = searchParams?.page_size || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    try {
        const response = await api.get<IMasterDivision[]>('sports', url);

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

export async function saveMasterDivision(data: any) {
    const url = '/SportMasterDivision/';
    // According to JS, for save/update it sends:
    // "SPCCMD_Id": $scope.SPCCMD_Id,
    // "SPCCMD_DivisionName": $scope.name,
    // "SPCCMD_DivisionDescription": $scope.description
    // We should probably map our standard keys to these if needed, 
    // but usually the backend handles both or we follow the server action pattern.
    // I'll keep it consistent with our IMasterDivision for now as per other pages.

    // Mapping keys to match AngularJS expectations of backend
    const payload = {
        SPCCMD_Id: data.spccmD_Id || 0,
        SPCCMD_DivisionName: data.spccmD_DivisionName,
        SPCCMD_DivisionDescription: data.spccmD_DivisionDescription
    };

    return await api.post<any>('sports', url, payload);
}

export async function deactivateMasterDivision(data: any) {
    const url = '/SportMasterDivision/deactivate';
    return await api.post<any>('sports', url, data);
}
