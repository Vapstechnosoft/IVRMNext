'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IBookArrivalReportInitialData, IBookArrivalReportRequest } from '@/types/library/reports/book-arrival-report';

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

    const url = `/${FACADE}/bookarrivalReport-getdetails`;
    const response = await api.get<any>('library', url);
    const data = response?.data ?? response;

    let libList = extractList(data.lib_list || data.msterliblist1 || []);
    const deptList = extractList(data.deptlist || []);

    if (libList.length === 0) {
        console.log('[book-arrival-report] Library list is empty. Fetching from MasterLibrary...');
        try {
            const masterLibUrl = `/MasterLibrary/get-master-library-list?page=1&page_size=100&sort_column=lmaL_LibraryName&sort_direction=asc&mI_Id=${session.mi_id}`;
            const masterLibRes = await api.get<any>('library', masterLibUrl);
            const mData = masterLibRes?.data || masterLibRes;
            if (mData) {
                libList = extractList(mData.list || mData.librylist || mData.liballdata || mData.msterliblist1 || []);
            }
        } catch (e: any) {
            console.warn('Failed to fetch master libraries fallback:', e?.message || String(e));
        }
    }

    return {
        lib_list: libList,
        deptlist: deptList
    } as IBookArrivalReportInitialData;
}

export async function getBookArrivalReportData(data: IBookArrivalReportRequest) {
    try {
        const session = await auth();
        if (!session?.mi_id) {
            throw new Error('Authentication required');
        }

        const payload = {
            p_type: data.p_type || 'ALL',
            p_type2: data.p_type2 || 'ALL',
            p_lmd_id: data.p_lmd_id === '0' || data.p_lmd_id === 0 || !data.p_lmd_id ? 'ALL' : String(data.p_lmd_id),
            p_fromdate: data.p_fromdate || '',
            p_todate: data.p_todate || '',
            p_lmal_id: Number(data.p_lmal_id),
            bookArrival: true,
            subjectsthomos: false,
            MI_Id: session.mi_id,
            IVRMUL_Id: session.roleId || 0
        };

        const url = `/${FACADE}/bookarrivaldetails-Report`;
        const response = await api.post<any>('library', url, payload);
        return response?.data || response;
    } catch (error) {
        console.error('Error in getBookArrivalReportData:', error);
        return { success: false, message: 'Failed to fetch book arrival report data' };
    }
}
