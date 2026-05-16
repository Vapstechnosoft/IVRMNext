'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type {
    IBookArrivalReportInitialData,
    IBookArrivalReportRequest,
    IBookArrivalReportResponse
} from '@/types/library/reports/book-arrival-report';

const FACADE = 'BookArrivalReport';

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getBookArrivalReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const payload = {
        MI_Id: session.mi_id
    };

    const url = `${FACADE}/bookarrivalReport-getdetails`;
    const response = await api.get<any>('library', url, { params: payload });
    const data = response?.data ?? response;

    return {
        lib_list: extractList(data.lib_list || []),
        deptlist: extractList(data.deptlist || [])
    } as IBookArrivalReportInitialData;
}

export async function getBookArrivalReportData(data: IBookArrivalReportRequest) {
    const url = `${FACADE}/bookarrivaldetails-Report`;
    return await api.post<IBookArrivalReportResponse>('library', url, data);
}
