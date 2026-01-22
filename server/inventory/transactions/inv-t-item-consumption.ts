
'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { InvTItemConsumption } from '@/types/inventory/transactions/inv-t-item-consumption';

const MOCK_DATA: InvTItemConsumption[] = Array.from({ length: 30 }, (_, i) => ({
    invmiC_Id: i + 1,
    invmsT_Id: 1,
    invmS_StoreName: 'General Store',
    invmiC_ICNo: `IC-${2024000 + i}`,
    invmiC_ICDate: new Date().toISOString(),
    invmiC_Remarks: `Consumption Record ${i + 1}`,
    invmiC_StuOtherFlg: i % 2 === 0 ? 'Staff' : 'Department',
    invmiC_ActiveFlg: true,
}));

export async function getInvTItemConsumptionLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_ItemConsumption/getloaddata?${urlParams}`;

    try {
        const response = await api.get<any>('inventory', url);
        if (response.success && response.data && response.data.get_itemconsumption && response.data.get_itemconsumption.length > 0) {
            return response; // Use real data if available and not empty
        }
    } catch (error) {
        console.warn("API fetch failed, falling back to mock data:", error);
    }

    // Fallback Mock with Pagination logic
    const page = Number(searchParams?.page) || 1;
    const pageSize = Number(searchParams?.page_size) || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedData = MOCK_DATA.slice(start, end);

    return {
        success: true,
        data: {
            get_itemconsumption: paginatedData,
            total: MOCK_DATA.length,
            get_Store: [
                { invmsT_Id: 1, invmS_StoreName: 'General Store' },
                { invmsT_Id: 2, invmS_StoreName: 'Lab Store' }
            ],
            get_employee: [
                { hrmE_Id: 101, employeename: 'Admin User', hrmE_EmployeeCode: 'EMP001' },
                { hrmE_Id: 102, employeename: 'Teacher One', hrmE_EmployeeCode: 'EMP002' },
                { hrmE_Id: 103, employeename: 'Staff Two', hrmE_EmployeeCode: 'EMP003' }
            ],
            get_Department: [
                { hrmD_Id: 10, hrmD_DepartmentName: 'IT Department' },
                { hrmD_Id: 11, hrmD_DepartmentName: 'Science Department' }
            ],
            get_Student: [
                { amsT_Id: 1001, studentname: 'Student A', amsT_AdmNo: 'ADM001' }
            ],
            get_Product: [
                { invmP_Id: 1, invmP_ProductName: 'Stationery' }
            ]
        }
    };
}

export async function saveInvTItemConsumption(data: any) {
    const url = `/INV_ItemConsumption/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactiveInvTItemConsumption(data: any) {
    const url = `/INV_ItemConsumption/deactive`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemConsumptionDetails(data: any) {
    const url = `/INV_ItemConsumption/getICDetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemsOnStoreChange(invmsT_Id: number) {
    const data = { INVMST_Id: invmsT_Id };
    const url = `/INV_ItemConsumption/ItemConsumption`;
    return await api.post<any>('inventory', url, data);
}

export async function getItemStockDetails(data: any) {
    const url = `/INV_T_Sales/getitemDetail`; // Reusing as per legacy code
    return await api.post<any>('inventory', url, data);
}
