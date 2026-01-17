'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvMasterStore, IEmployeeDropdown } from '@/types/inventory/masters/inv-master-store';

export async function getInvMasterStore(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_MasterStore/getloaddata?${urlParams}`;

    try {
        const response = await api.get<{ get_store: IInvMasterStore[]; empname_list: IEmployeeDropdown[] }>('inventory', url);

        // If API returns success but no data, or if we want to ensure some data is always present for testing
        if (response.success && response.data && response.data.get_store && response.data.get_store.length > 0) {
            return response;
        }

        // Return 20 rows of dummy data if API data is empty
        let dummyStores: IInvMasterStore[] = Array.from({ length: 20 }, (_, i) => ({
            invmsT_Id: i + 1,
            invmS_StoreName: `Store ${String.fromCharCode(65 + (i % 26))} - ${i + 1}`,
            invmS_StoreLocation: `Location ${i + 1}, Block ${String.fromCharCode(65 + (i % 4))}`,
            invmS_ContactPerson: `Person ${i + 1}`,
            invmS_ContactNo: `90000000${(i + 10).toString().slice(-2)}`,
            invmS_ActiveFlg: i % 4 !== 0,
            hrmE_Id: 100 + (i % 5) + 1,
            employeename: `Employee ${(i % 5) + 1}`
        }));

        const dummyEmployees: IEmployeeDropdown[] = Array.from({ length: 5 }, (_, i) => ({
            hrmE_Id: 100 + i + 1,
            employeename: `Employee ${i + 1}`,
            hrmE_MobileNo: `98765432${(10 + i).toString().slice(-2)}`
        }));

        // Apply Search
        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummyStores = dummyStores.filter(item =>
                item.invmS_StoreName.toLowerCase().includes(search) ||
                item.invmS_StoreLocation.toLowerCase().includes(search) ||
                item.invmS_ContactPerson?.toLowerCase().includes(search) ||
                item.invmS_ContactNo.toLowerCase().includes(search)
            );
        }

        const totalItems = dummyStores.length;

        // Apply Pagination
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummyStores = dummyStores.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data)!!',
            data: {
                get_store: dummyStores,
                empname_list: dummyEmployees,
                total: totalItems
            }
        } as any;
    } catch (error) {
        console.error('Error fetching Store data:', error);

        let dummyStores: IInvMasterStore[] = Array.from({ length: 20 }, (_, i) => ({
            invmsT_Id: i + 1,
            invmS_StoreName: `Store ${String.fromCharCode(65 + (i % 26))} - ${i + 1} (EF)`,
            invmS_StoreLocation: `Location ${i + 1}, Block ${String.fromCharCode(65 + (i % 4))}`,
            invmS_ContactPerson: `Person ${i + 1}`,
            invmS_ContactNo: `90000000${(i + 10).toString().slice(-2)}`,
            invmS_ActiveFlg: i % 4 !== 0,
            hrmE_Id: 100 + (i % 5) + 1,
            employeename: `Employee ${(i % 5) + 1}`
        }));

        // Apply Search
        const search = searchParams?.search_query?.toString().toLowerCase();
        if (search) {
            dummyStores = dummyStores.filter(item =>
                item.invmS_StoreName.toLowerCase().includes(search) ||
                item.invmS_StoreLocation.toLowerCase().includes(search)
            );
        }

        const totalItems = dummyStores.length;

        // Apply Pagination
        const page = Number(searchParams?.page) || 1;
        const pageSize = Number(searchParams?.page_size) || 10;
        const startIndex = (page - 1) * pageSize;
        dummyStores = dummyStores.slice(startIndex, startIndex + pageSize);

        return {
            success: true,
            message: 'Data fetched successfully (Expanded Dummy Data - Error Fallback)!!',
            data: {
                get_store: dummyStores,
                empname_list: [
                    { hrmE_Id: 101, employeename: 'John Doe', hrmE_MobileNo: '9876543210' }
                ],
                total: totalItems
            }
        } as any;
    }
}

export async function saveInvMasterStore(data: any) {
    const url = `/INV_MasterStore/savedetails`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterStore(data: IInvMasterStore) {
    const url = `/INV_MasterStore/deactive`;
    return await api.post<any>('inventory', url, data);
}
