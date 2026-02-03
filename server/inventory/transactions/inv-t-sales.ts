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
    const url = `/api/INV_T_Sales/getloaddata?${urlParams}`;

    try {
        const response = await api.get<any>('inventory', url);

        const extractData = (res: any, key?: string) => {
            if (!res) return [];
            if (key && res.data?.[key] && Array.isArray(res.data[key])) return res.data[key];
            if (key && res[key] && Array.isArray(res[key])) return res[key];
            if (Array.isArray(res.data)) return res.data;
            if (Array.isArray(res)) return res;
            if (res.data?.$values) return res.data.$values;
            if (res.$values) return res.$values;
            if (key && res.data?.[key]?.$values) return res.data[key].$values;
            return [];
        };

        const rawSales = extractData(response, 'get_Sale');
        const salesList = rawSales.map((item: any) => ({
            ...item,
            invmsL_ActiveFlg: !!(item.invmsL_ActiveFlg ?? item.INVMSL_ActiveFlg ?? item.invmsl_activeflg)
        }));

        return {
            success: true,
            data: {
                get_Sale: salesList,
                total: response.total || salesList.length,
                get_Store: extractData(response, 'get_Store'),
                get_Product: extractData(response, 'get_Product'),
                get_employee: extractData(response, 'get_employee'),
                get_customer: extractData(response, 'get_customer'),
                get_item: extractData(response, 'get_item')
            }
        };

    } catch (error) {
        console.error('Error fetching Sales load data:', error);
        return {
            success: false,
            data: {
                get_Sale: [],
                total: 0,
                get_Store: [],
                get_Product: [],
                get_employee: [],
                get_customer: [],
                get_item: []
            }
        };
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
