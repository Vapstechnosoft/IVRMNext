'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvTGRN, IInvTGRNLoadData } from '@/types/inventory/transactions/inv-t-grn';

const MOCK_GRN_DATA: IInvTGRN[] = Array.from({ length: 20 }, (_, i) => ({
    invmgrN_Id: i + 1,
    invmgrN_GRNNo: `GRN-${2024000 + i + 1}`,
    invmgrN_InvoiceNo: `INV-${1000 + i + 1}`,
    invmgrN_PurchaseDate: new Date(2024, 0, i + 1).toISOString(),
    invmgrN_PurchaseValue: 5000 + (i * 500),
    invmgrN_TotDiscount: 100 + (i * 10),
    invmgrN_TotTaxAmt: 450 + (i * 45),
    invmgrN_TotalAmount: 5350 + (i * 535),
    invmgrN_Remarks: `Mock GRN record ${i + 1}`,
    invmgrN_ReturnFlg: false,
    invmgrN_PaidFlg: i % 2 === 0,
    invmgrN_CreditFlg: i % 2 !== 0,
    invmsT_Id: 1,
    invmS_Id: 1,
    invmgrN_POReference: i % 3 === 0 ? `PO-${500 + i}` : undefined,
    invmgrN_ActiveFlg: true,
    invmS_StoreName: i % 2 === 0 ? 'Main Store' : 'Sub Store',
    invmS_SupplierName: i % 2 === 0 ? 'Global Suppliers' : 'Local Vendors'
}));

export async function getInvTGRNLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_T_GRN/getloaddata?${urlParams}`;

    try {
        const response = await api.get<IInvTGRNLoadData>('inventory', url);

        // If API returns success but no data or we want to ensure 20 items for testing
        if (response.success && response.data) {
            // If the API is working, we might still want to supplement or replace for testing
            // But for this task, I will provide the mock data as requested.
        }

        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const total = MOCK_GRN_DATA.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = MOCK_GRN_DATA.slice(start, end);

        // Returning mock data to fulfill "give 20 data" and "pagination should work"
        return {
            success: true,
            message: 'Success (Mock Data)',
            data: {
                get_GRN: paginatedData,
                total: total,
                get_item: [
                    { id: 1, name: 'Sample Item 1' },
                    { id: 2, name: 'Sample Item 2' }
                ],
                get_Store: [
                    { id: 1, name: 'Main Store' },
                    { id: 2, name: 'Sub Store' }
                ],
                get_supplier: [
                    { id: 1, name: 'Global Suppliers' },
                    { id: 2, name: 'Local Vendors' }
                ],
                get_tax: [
                    { id: 1, name: 'GST 18%', taxPer: 18 },
                    { id: 2, name: 'GST 12%', taxPer: 12 }
                ]
            }
        } as any;
    } catch (error) {
        console.error('Error fetching GRN load data:', error);

        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const total = MOCK_GRN_DATA.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = MOCK_GRN_DATA.slice(start, end);

        return {
            success: true,
            message: 'Success (Mock Data)',
            data: {
                get_GRN: paginatedData,
                total: total,
                get_item: [],
                get_Store: [],
                get_supplier: [],
                get_tax: []
            }
        } as any;
    }
}

export async function saveInvTGRNDetails(data: any) {
    const url = `/INV_T_GRN/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deleteInvTGRN(data: any) {
    const url = `/INV_T_GRN/GRN_Delete`;
    return await api.post<any>('inventory', url, data);
}

export async function toggleInvTGRNActive(data: any) {
    const url = `/INV_T_GRN/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNItemTax(invtgrN_Id: number) {
    const data = { INVTGRN_Id: invtgrN_Id };
    const url = `/INV_T_GRN/get_itemtax`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNItemDetails(invmgrN_Id: number) {
    const data = { INVMGRN_Id: invmgrN_Id };
    const url = `/INV_T_GRN/get_GRNitemDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTGRNEditDetails(invmgrN_Id: number) {
    const data = { INVMGRN_Id: invmgrN_Id };
    const url = `/INV_T_GRN/Edit_GRN_details`;
    return await api.post<any>('inventory', url, data);
}
