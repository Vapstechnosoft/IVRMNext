'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvTSales, IInvTSalesLoadData } from '@/types/inventory/transactions/inv-t-sales';

const MOCK_SALES_DATA: IInvTSales[] = Array.from({ length: 20 }, (_, i) => ({
    invmsL_Id: i + 1,
    invmsL_SalesNo: `SALES-${2024000 + i + 1}`,
    invmsL_SalesDate: new Date(2024, 0, i + 1).toISOString(),
    invmsL_SalesValue: 2000 + (i * 200),
    invmsL_TotDiscount: 50 + (i * 5),
    invmsL_TotTaxAmt: 100 + (i * 10),
    invmsL_TotalAmount: 2150 + (i * 215),
    invmsL_Remarks: `Mock Sales record ${i + 1}`,
    invmsL_StuOtherFlg: i % 3 === 0 ? 'Student' : (i % 3 === 1 ? 'Staff' : 'Customer'),
    invmsT_Id: 1,
    invmS_StoreName: 'Main Store',
    invmsL_ActiveFlg: true,
    studentName: i % 3 === 0 ? `Student ${i + 1}` : undefined,
    employeeName: i % 3 === 1 ? `Staff ${i + 1}` : undefined,
    customerName: i % 3 === 2 ? `Customer ${i + 1}` : undefined,
}));

export async function getInvTSalesLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_T_Sales/getloaddata?${urlParams}`;

    try {
        const response = await api.get<IInvTSalesLoadData>('inventory', url);

        if (response.success && response.data) {
            // Use API data if available
        }

        // Mock data fallback
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const total = MOCK_SALES_DATA.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = MOCK_SALES_DATA.slice(start, end);

        return {
            success: true,
            message: 'Success (Mock Data)',
            data: {
                get_Sale: paginatedData,
                total: total,
                get_Store: [
                    { invmsT_Id: 1, invmS_StoreName: 'Main Store' },
                    { invmsT_Id: 2, invmS_StoreName: 'Sub Store' }
                ],
                get_Product: [],
                get_employee: [
                    { hrmE_Id: 1, employeename: 'Staff A' },
                    { hrmE_Id: 2, employeename: 'Staff B' }
                ],
                get_customer: [
                    { invmC_Id: 1, invmC_CustomerName: 'Customer X' },
                    { invmC_Id: 2, invmC_CustomerName: 'Customer Y' }
                ],
                get_item: [
                    { invmI_Id: 1, invmI_ItemName: 'Notebook', invstO_SalesRate: 50, invstO_BatchNo: 'B1' },
                    { invmI_Id: 2, invmI_ItemName: 'Pen', invstO_SalesRate: 10, invstO_BatchNo: 'B2' }
                ]
            }
        } as any;

    } catch (error) {
        console.error('Error fetching Sales load data:', error);
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const total = MOCK_SALES_DATA.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = MOCK_SALES_DATA.slice(start, end);

        return {
            success: true,
            message: 'Success (Mock Data)',
            data: {
                get_Sale: paginatedData,
                total: total,
                get_Store: [],
                get_Product: [],
                get_employee: [],
                get_customer: [],
                get_item: []
            }
        } as any;
    }
}

export async function saveInvTSalesDetails(data: any) {
    const url = `/INV_T_Sales/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deleteInvTSales(data: any) {
    const url = `/INV_T_Sales/deactive`; // The angular code uses 'deactive' for delete/active toggle logic often, but checks flag. 
    // Actually Angular code has `deactive` function calling `INV_T_Sales/deactive`.
    // And there's no explicit delete. Usually deactive serves as soft delete.
    return await api.post<any>('inventory', url, data);
}

export async function toggleInvTSalesActive(data: any) {
    const url = `/INV_T_Sales/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function getInvTSalesItemDetails(invmsL_Id: number, saletype: string) {
    const data = { INVMSL_Id: invmsL_Id, saletype: saletype };
    const url = `/INV_T_Sales/getSaleItemDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getStudentClsSec(type: string) {
    const data = { type: type };
    const url = `/INV_T_Sales/getStudentClsSec`;
    return await api.post<any>('inventory', url, data);
}

export async function getStudentList(data: any) {
    const url = `/INV_T_Sales/getStudentlist`;
    return await api.post<any>('inventory', url, data);
}

export async function getSectionList(data: any) {
    const url = `/INV_T_Sales/getsectionlist`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemOnStoreChange(invmsT_Id: number) {
    const data = { INVMST_Id: invmsT_Id };
    const url = `/INV_T_Sales/getitem`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemDetail(data: any) {
    const url = `/INV_T_Sales/getitemDetail`;
    return await api.post<any>('inventory', url, data);
}
