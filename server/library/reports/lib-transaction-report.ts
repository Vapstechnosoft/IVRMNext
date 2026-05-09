'use server';

import { api } from '@/lib/apiService';
import type {
    ILibTransactionReportGridData,
    ILibTransactionReportInitialData,
    ILibTransactionReportRequest,
    ILibTransactionReportYearListData
} from '@/types/library/reports/lib-transaction-report';

const FACADE = '/LibTransactionReportFacade';

const extractList = (list: any) => {
    if (!list) return [];
    // Handle the case where the list itself is the response object or has a data property
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

// Get initial data for the report form
// Uses the same endpoint as CLG Transaction Count Report:
// GET LibTransactionReportFacade/Getdetails/2 → returns { msterliblist1, yearlist }
export async function getLibTransactionReportInitialData() {
    // api.get() returns the HTTP body directly:
    // { success, message, data: { msterliblist1: [...], yearlist: [...] } }
    const response = await api.get<any>('library', '/AvailableBooksReport/getdetails');
    const data = response?.data ?? {};

    return {
        msterliblist1: extractList(data.msterliblist1 ?? data.libraryList ?? []),
        yearlist: extractList(data.yearlist ?? data.yearList ?? [])
    } as ILibTransactionReportInitialData;
}

export async function getLibTransactionReportYearList() {
    // api.get() returns the HTTP body directly:
    // { success, message, data: { msterliblist1: [...], yearlist: [...] } }
    const response = await api.get<any>('library', '/LibTransactionReport/library_countreport_getdetails');
    const data = response?.data ?? {};

    return {
        departmentList: extractList(data.yearlist ?? data.departmentList ?? [])
    } as ILibTransactionReportYearListData;
}

// Get report data
export async function getLibTransactionReportSearch(data: ILibTransactionReportRequest) {
    const url = `${FACADE}/get_report`;
    const response = await api.post<any>('library', url, data);
    const responseData = response.data || response;

    return {
        alldata: extractList(responseData.alldata || responseData.reportlist || []),
        classlist: extractList(responseData.classlist)
    };
}
