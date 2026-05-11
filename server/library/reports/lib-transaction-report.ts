'use server';

import { auth } from '@/lib/auth';
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
export async function getLibTransactionReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    // LibTransactionReportFacade/Getdetails/2 → returns { msterliblist1, yearlist }
    const url = `${FACADE}/Getdetails/2`;
    const response = await api.get<any>('library', url);
    const data = response?.data ?? response;

    return {
        msterliblist1: extractList(data.msterliblist1 || []),
        yearlist: extractList(data.yearlist || [])
    } as ILibTransactionReportInitialData;
}

// Get report data
export async function getLibTransactionReportSearch(data: ILibTransactionReportRequest) {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        ...data,
        MI_Id: session.mi_id,
        IVRMUL_Id: session.roleId || 0
    };

    const url = `${FACADE}/get_report`;
    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;

    return {
        alldata: extractList(responseData.alldata || responseData.reportlist || []),
        classlist: extractList(responseData.classlist || [])
    };
}

