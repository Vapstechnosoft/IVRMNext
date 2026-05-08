'use server';

import { api } from '@/lib/apiService';
import type { IRackReportInitialData, IRackReportRequest, IRackReportResponse } from '@/types/library/reports/rack-report';

const FACADE = 'RackReport';

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
    const url = `AvailableBooksReport/getdetails`;
    const response = await api.get<any>('library', url);
    const responseData = response.data || response;
    const libList = responseData.data?.libraryList || responseData.libraryList || responseData.lib_list || responseData.data?.lib_list || responseData;
    return extractList(libList);
}

export async function getRackReportInitialData(lmalId = 0, pageid = 2) {
    const url = `${FACADE}/library_RackReport_getdetails`;
    const response = await api.post<any>('library', url, { 
        MI_Id: 30,
        LMAL_Id: lmalId,
        id: pageid 
    });
    
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
    const url = `${FACADE}/get-rackReport-report`;
    
    const payload = {
        ...data,
        MI_Id: 30,
        LMAL_Id: Number(data.LMAL_Id),
        LMRA_Id: Number(data.LMRA_Id),
        LMB_Id: Number(data.LMB_Id || 0),
        LMSU_Id: Number(data.LMSU_Id || 0)
    };

    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;
    
    // Based on the provided response JSON: { success: true, message: "Success", data: [...] }
    let reportlist: any[] = [];
    
    if (responseData.data && Array.isArray(responseData.data)) {
        reportlist = responseData.data;
    } else if (Array.isArray(responseData)) {
        reportlist = responseData;
    } else if (responseData.reportlist) {
        reportlist = extractList(responseData.reportlist);
    } else if (responseData.data?.reportlist) {
        reportlist = extractList(responseData.data.reportlist);
    } else if (responseData.griddata) {
        reportlist = extractList(responseData.griddata);
    } else if (responseData.$values) {
        reportlist = responseData.$values;
    }

    return {
        reportlist: Array.isArray(reportlist) ? reportlist : []
    } as IRackReportResponse;
}
