import { auth } from '@/lib/auth';
import { api } from '@/lib/apiService';
import type {
    ICLGTransactionCountReportInitialData,
    ICLGTransactionCountReportRequest
} from '@/types/library/reports/clg-transaction-count-report';

const FACADE = 'LibTransactionReport'; // Assuming shared or similar facade

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getCLGTransactionCountReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        MI_Id: session.mi_id
    };

    const url = `${FACADE}/library_countreport_getdetails`;
    const response = await api.get<any>('library', url, { params: payload });
    const data = response?.data ?? response;

    return {
        msterliblist1: extractList(data.msterliblist1 || data.alldata || []),
        yearlist: extractList(data.yearlist || data.acdlist || [])
    } as ICLGTransactionCountReportInitialData;
}

export async function getCLGTransactionCountReportSearch(data: ICLGTransactionCountReportRequest) {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        ...data,
        MI_Id: session.mi_id
    };

    const url = `${FACADE}/get-transaction-count-report`; // shared with school report usually
    const response = await api.post<any>('library', url, payload);
    const responseData = response.data || response;

    return extractList(responseData.alldata || responseData.reportlist || responseData.griddata || (Array.isArray(responseData) ? responseData : []));
}
