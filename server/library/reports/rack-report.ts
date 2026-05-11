'use server';

import { api } from '@/lib/apiService';
import type { IRackReportInitialData, IRackReportRequest, IRackReportResponse } from '@/types/library/reports/rack-report';

const FACADE = '/RackReport';

const extractList = (list: any) => {
    if (!list) return [];
    if (Array.isArray(list)) return list;
    
    if (list && typeof list === 'object' && '$values' in list) return list.$values;
    
    const actual = list.data || list.$values || list;
    if (Array.isArray(actual)) return actual;
    if (actual && typeof actual === 'object' && '$values' in actual) return actual.$values;
    
    return [];
};

export async function getRackReportLibraries() {
    const url = `/AvailableBooksReport/getdetails`;
    const response = await api.get<any>('library', url);
    const responseData = response.data || response;
    const libList = responseData.data?.libraryList || responseData.libraryList || responseData.lib_list || responseData.data?.lib_list || responseData;
    return extractList(libList);
}

export async function getRackReportInitialData() {
    const url = '/RackReport/library_RackReport_getdetails';
    const response = await api.get<any>('library', url, 
    //     { 
    //     MI_Id: 30,
    //     LMAL_Id: lmalId,
    //     id: pageid 
    // }
);
    
    const responseData = response.data || response;
    const data = responseData.data || responseData;

    return {
        lib_list: [], 
        racklist: extractList(data.racklist || data.msterRacklist || []),
        booklist: extractList(data.booklist || data.msterbooklist || data.book_list || []),
        subjectlist: extractList(data.subjectlist || data.mstersubjectlist || data.subject_list || []),
        floorlist: extractList(data.floorlist || [])
    } as IRackReportInitialData;
}

export async function getRackReportData(data: IRackReportRequest) {
    // Exact URL as requested: api/RackReport/get-rackReport-report
    // Note: 'api/' is usually handled by the base URL in apiService
    const url = `${FACADE}/get-rackReport-report`;
    
    // Exactly as requested by user: { "LMAL_Id": 2, "LMRA_Id": 4 }
    const payload = {
        LMAL_Id: Number(data.LMAL_Id),
        LMRA_Id: Number(data.LMRA_Id)
    };

    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;
    
    let reportlist: any[] = [];
    
    // Handle the specific response structure: { success: true, message: "Success", data: [...] }
    if (responseData.data && Array.isArray(responseData.data)) {
        reportlist = responseData.data;
    } else if (Array.isArray(responseData)) {
        reportlist = responseData;
    } else if (responseData.reportlist) {
        reportlist = extractList(responseData.reportlist);
    } else if (responseData.griddata) {
        reportlist = extractList(responseData.griddata);
    }

    return {
        reportlist: Array.isArray(reportlist) ? reportlist : []
    } as IRackReportResponse;
}
