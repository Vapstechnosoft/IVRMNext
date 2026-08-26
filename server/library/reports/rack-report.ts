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

const normalizeLibraryList = (list: any[]) => {
    return list.map((lib: any) => {
        if (!lib || typeof lib !== 'object') return lib;
        const lmaL_Id = lib.lmaL_Id ?? lib.lmal_Id ?? lib.LMAL_Id ?? lib.lmal_id ?? lib.lmalId ?? lib.id;
        const lmaL_LibraryName =
            lib.lmaL_LibraryName ??
            lib.lmal_LibraryName ??
            lib.LMAL_LibraryName ??
            lib.lmal_libraryname ??
            lib.libraryname ??
            lib.libraryName ??
            lib.name;
        return {
            ...lib,
            lmaL_Id: Number(lmaL_Id),
            lmaL_LibraryName: String(lmaL_LibraryName || '')
        };
    });
};

const normalizeRackList = (list: any[]) => {
    return list.map((rack: any) => {
        if (!rack || typeof rack !== 'object') return rack;
        const lmrA_Id = rack.lmrA_Id ?? rack.lmra_Id ?? rack.LMRA_Id ?? rack.lmra_id ?? rack.lmraId ?? rack.id;
        const lmrA_RackName =
            rack.lmrA_RackName ??
            rack.lmra_RackName ??
            rack.LMRA_RackName ??
            rack.lmra_rackname ??
            rack.rackname ??
            rack.rackName ??
            rack.name;
        return {
            ...rack,
            lmrA_Id: Number(lmrA_Id),
            lmrA_RackName: String(lmrA_RackName || '')
        };
    });
};

export async function getRackReportLibraries() {
    const url = 'AvailableBooksReport/getdetails';
    const response = await api.get<any>('library', url);

    // Safely extract the inner data object
    let data: any = {};
    if (response) {
        if (response.data && typeof response.data === 'object') {
            data = response.data;
        } else {
            data = response;
        }
    }

    const libList = data.libraryList || data.lib_list || data.libList || data.msterliblist1 || data.library_list || data || [];
    const list = extractList(libList);
    return normalizeLibraryList(list);
}

export async function getRackReportInitialData() {
    const url = 'RackReport/library_RackReport_getdetails';
    const response = await api.get<any>('library', url);

    // Safely extract the inner data object
    let data: any = {};
    if (response) {
        if (response.data && typeof response.data === 'object') {
            data = response.data;
        } else {
            data = response;
        }
    }

    // Extract all lists safely from the data object
    const libList = data.lib_list || data.libraryList || data.libList || data.msterliblist1 || data.library_list || [];
    const racklist = data.racklist || data.msterRacklist || [];
    const booklist = data.booklist || data.msterbooklist || data.book_list || [];
    const subjectlist = data.subjectlist || data.mstersubjectlist || data.subject_list || [];
    const floorlist = data.floorlist || [];

    return {
        lib_list: normalizeLibraryList(extractList(libList)),
        racklist: normalizeRackList(extractList(racklist)),
        booklist: extractList(booklist),
        subjectlist: extractList(subjectlist),
        floorlist: extractList(floorlist)
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
