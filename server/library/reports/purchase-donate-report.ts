'use server';

import { api } from '@/lib/apiService';
import type {
    IPurchaseDonateReportGridData,
    IPurchaseDonateReportRequest
} from '@/types/library/reports/purchase-donate-report';

export async function getPurchaseDonateReportData(data: IPurchaseDonateReportRequest) {
    // POST PurchaseDonateReport/getdata
    // Payload: { mI_Id: 30, circ_Flag: "Book", lbcpA_Flg: "Purchased" }
    // api.post() returns the HTTP body directly: { success, message, data: [...] }
    const response = await api.post<any>('library', 'PurchaseDonateReport/getdata', data);
    const list = response?.data;
    return Array.isArray(list) ? list as IPurchaseDonateReportGridData[] : [];
}
