'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IInvMasterTax, IInvMasterTaxLedger, IInvMasterTaxLedgerDTO } from '@/types/inventory/masters/inv-master-tax';

export async function getInvMasterTax(searchParams?: ApiSearchparams) {
    console.log("getInvMasterTax: Function called");
    const url = `/api/INV_MasterTaxFacade/loadtaxlist`;
    console.log(`getInvMasterTax: Making GET request to ${url} using 'inventory' client`);

    try {
        const response = await api.get<{ get_tax: IInvMasterTax[]; getloaddata: IInvMasterTaxLedger[] }>('inventory', url);
        console.log("getInvMasterTax: API call successful", response ? Object.keys(response) : "null");
        return response;
    } catch (error) {
        console.error("getInvMasterTax: API call failed", error);
        throw error;
    }
}

export async function getInvMasterTaxDetails(id: number) {
    const data = { INVMT_Id: id };
    const url = `/api/INV_MasterTaxFacade/getdetails`;
    return await api.post<any>('inventory', url, data);
}

export async function getLedgerUnder(famled_id: number) {
    const data = { FAMLED_Id: famled_id };
    const url = `/api/INV_MasterTaxFacade/getledgerunder`;
    return await api.post<any>('inventory', url, data);
}

export async function saveInvMasterTax(data: any) {
    const params = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            params.append(key, data[key].toString());
        }
    }
    const url = `/api/INV_MasterTaxFacade/savedetails?${params.toString()}`;

    console.log("saveInvMasterTax: Posting with Query Params to", url);
    return await api.post<any>('inventory', url, {});
}

export async function saveInvMasterTaxLedger(data: IInvMasterTaxLedgerDTO) {
    const url = `/api/INV_MasterTaxFacade/saveledger`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvMasterTax(data: IInvMasterTax) {
    // User specified: /api/INV_MasterTaxFacade/deactive?id=6
    // So we use query param 'id'
    const url = `/api/INV_MasterTaxFacade/deactive?id=${data.invmT_Id}`;
    return await api.post<any>('inventory', url, {});
}
