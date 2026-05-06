'use server';

import { api } from '@/lib/apiService';
import type { ILibLostBookReportInitialData, ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';

const MODULE_URL = 'LostBookReport';

export async function getLibLostBookReportInitialData() {
    // Using the specific payload provided by the user for initialization
    const response = await api.post<ILibLostBookReportInitialData>('library', `${MODULE_URL}/lost-get-details`, {
        IVRMUL_Id: 21602,
        lmaL_Id: 2,
        bookType: "Issue",
        bnbFlg: "ALL",
        fromdate: "2026-01-01",
        toDate: "2026-12-31",
        reportlist: ["Book 1", "Book 2"],
        lib_list: ["Library 1", "Library 2"]
    });
    return response.data;
}

export async function getLibLostBookReportSearch(data: ILibLostBookReportRequest) {
    const response = await api.post<any>('library', `${MODULE_URL}/get_report`, data);
    return response.data;
}
