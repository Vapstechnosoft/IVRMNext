'use server';

import { api } from '@/lib/apiService';
import type { ILibLostBookReportInitialData, ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';

const MODULE_URL = 'LostBookReport';

export async function getLibLostBookReportInitialData(): Promise<ILibLostBookReportInitialData> {
    // Using the specific payload provided by the user for initialization
    const response = await api.post<any>('library', `${MODULE_URL}/lost-get-details`, {
        IVRMUL_Id: 21602,
        lmaL_Id: 2,
        bookType: "Issue",
        bnbFlg: "ALL",
        fromdate: "2026-01-01",
        toDate: "2026-12-31",
        reportlist: ["Book 1", "Book 2"],
        lib_list: ["Library 1", "Library 2"]
    });
    
    // Check multiple common fields where the library list might be located
    const responseData = response.data || response.msterliblist || response.msterliblist1 || response.librarylist || response.lib_list;
    
    // Defensive handling for $values wrapping
    if (responseData && typeof responseData === 'object' && '$values' in responseData) {
        return responseData.$values as ILibLostBookReportInitialData;
    }
    
    return (Array.isArray(responseData) ? responseData : []) as ILibLostBookReportInitialData;
}

export async function getLibLostBookReportSearch(data: ILibLostBookReportRequest) {
    const response = await api.post<any>('library', `${MODULE_URL}/get-lost-book-report`, data);
    return response.data; // This will return the 'data' array from the backend response
}
