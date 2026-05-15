'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getPaymentModes(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.getArray<any>('inventory', `/INV_VendorPaymentFacade/loadPaymentModes?${urlParams}`);
}

export async function getSuppliers(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    return await api.getArray<any>('inventory', `/INV_T_GRNFacade/loadsuppliers?${urlParams}`);
}


export async function getInvVendorPaymentGRNDetails(invmS_Id: number, invmgrN_Id?: number) {
    const url = `/INV_VendorPaymentFacade/getGRNdetail?INVMS_Id=${invmS_Id}&INVMGRN_Id=${invmgrN_Id || 0}`;
    return await api.get<any>('inventory', url);
}

export async function saveInvVendorPayment(data: any) {
    const url = `/INV_VendorPaymentFacade/saveVendorPayment`;
    return await api.post<any>('inventory', url, data);
}

export async function deactivateInvVendorPayment(invspT_Id: number) {
    const url = `/INV_VendorPaymentFacade/deactiveVendorPayment?INVSPT_Id=${invspT_Id}`;
    return await api.post<any>('inventory', url, {});
}

export async function getInvVendorPaymentModelDetails(invspT_Id: number) {
    const url = `/INV_VendorPaymentFacade/getmodeldetail?INVSPT_Id=${invspT_Id}`;
    return await api.post<any>('inventory', url, {});
}

export async function getInvGRNItemDetails(invmgrN_Id: number) {
    const url = `/INV_T_GRNFacade/get_GRNitemDetails`;
    return await api.post<any>('inventory', url, { INVMGRN_Id: invmgrN_Id });
}

export async function loadVendorPayments(searchParams?: ApiSearchparams) {
    const searchableColumns = "INVMS_SupplierName,INVSPT_ModeOfPayment,INVSPT_PaymentReference,INVSPT_ChequeDDNo,INVSPT_BankName,INVSPT_Remarks";
    
    // Map sort_column to uppercase as expected by the backend facade
    const params = { ...searchParams };
    if (params.sort_column) {
        params.sort_column = params.sort_column.toUpperCase();
    }
    
    const urlParams = getSearchParamsUrl(params ?? {}, searchableColumns);
    const url = `/INV_VendorPaymentFacade/loadVendorPayments?${urlParams}`;
    return await api.get<any>('inventory', url);
}

export async function getGRNList(invmS_Id: number) {
    const url = `/INV_VendorPaymentFacade/getGRNList?INVMS_Id=${invmS_Id}`;
    return await api.get<any>('inventory', url);
}

export async function getGRNDetail(invmS_Id: number, invmgrN_Id: number) {
    const url = `/INV_VendorPaymentFacade/getGRNdetail?INVMS_Id=${invmS_Id}&INVMGRN_Id=${invmgrN_Id}`;
    return await api.get<any>('inventory', url);
}
