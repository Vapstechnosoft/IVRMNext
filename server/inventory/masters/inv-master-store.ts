'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getInvMasterStore(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const storeListUrl = `/INV_MasterStoreFacade/GetStoreList?${urlParams}`;
    const employeeListUrl = `/INV_MasterStoreFacade/GetEmployeeList`;

    return await Promise.all([api.post<any>('inventory', storeListUrl, {}), api.post<any>('inventory', employeeListUrl, {})]).then(
        ([storeRes, empRes]) => ({
            success: true,
            data: {
                get_store: storeRes.data ?? storeRes,
                empname_list: empRes.data ?? empRes,
                total: storeRes.total ?? 0
            }
        })
    );
}

export async function saveInvMasterStore(data: any) {
    const params = new URLSearchParams();
    const mapping: Record<string, string> = {
        invmsT_Id: 'INVMST_Id',
        invmS_StoreName: 'INVMS_StoreName',
        invmS_StoreLocation: 'INVMS_StoreLocation',
        invmS_ContactPerson: 'INVMS_ContactPerson',
        invmS_ContactNo: 'INVMS_ContactNo',
        hrmE_Id: 'HRME_Id',
        invmS_ActiveFlg: 'INVMST_ActiveFlg'
    };

    for (const key in data) {
        const apiKey = mapping[key] || key;
        const val = data[key];
        if (val !== undefined && val !== null) {
            params.append(apiKey, val.toString());
        }
    }

    const url = `/INV_MasterStoreFacade/savedetails?${params.toString()}`;
    return await api.post<any>('inventory', url, {});
}

export async function deactivateInvMasterStore(data: any) {
    const url = `/INV_MasterStoreFacade/deactive?id=${data.invmsT_Id}`;
    return await api.post<any>('inventory', url, {});
}
