'use server';

import { auth } from '@/lib/auth';
import { api } from '@/lib/apiService';
import type { ILibraryMonthEndReportInitialData, ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';

const FACADE = 'LibraryMonthEndReport';

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getLibraryMonthEndReportInitialData() {
    const url = `${FACADE}/montheendreport_getdetails`;
    const response = await api.get<any>('library', url);
    
    // Extremely robust parsing for nested data objects
    const data = response?.data?.data || response?.data || response;

    return {
        acdlist: extractList(data.acdlist || []),
        monthlist: extractList(data.monthlist || []),
        msterliblist1: extractList(data.alldata || data.msterliblist1 || [])
    } as ILibraryMonthEndReportInitialData;
}

export async function getLibraryMonthEndReportSearch(data: ILibraryMonthEndReportRequest) {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        LMRA_Id: data.LMRA_Id || 0,
        MI_Id: session.mi_id,
        ASMAY_Id: data.ASMAY_Id,
        year: data.year,
        IVRM_Month_Id: String(data.IVRM_Month_Id),
        griddata: null
    };

    const url = `${FACADE}/monthendreport_Savedata`; 
    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;

    const rawList = extractList(responseData.data || responseData.griddata || responseData.reportlist || responseData.alldata || (Array.isArray(responseData) ? responseData : []));

    // Normalize keys to uppercase for frontend consistency
    return rawList.map((item: any) => {
        const normalizedItem: any = {};
        for (const key in item) {
            normalizedItem[key.toUpperCase()] = item[key];
        }
        return normalizedItem;
    });
}
