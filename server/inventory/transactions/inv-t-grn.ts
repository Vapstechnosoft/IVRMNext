'use server';
 
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
 
export async function getInvTGRNLoadData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const grnUrl = `/INV_T_GRNFacade/getloaddata?${urlParams}`;
    return await api.get<any>('inventory', grnUrl);
}
 
export async function loadGRNItems() {
    return await api.get<any>('inventory', `/INV_T_GRNFacade/loaditems`);
}
 
export async function loadGRNStores() {
    return await api.get<any>('inventory', `/INV_T_GRNFacade/loadstores`);
}
 
export async function loadGRNSuppliers() {
    return await api.get<any>('inventory', `/INV_T_GRNFacade/loadsuppliers`);
}
 
export async function loadGRNTax() {
    return await api.get<any>('inventory', `/INV_T_GRNFacade/loadtax`);
}
 
export async function saveInvTGRNDetails(data: any) {
    const url = `/INV_T_GRNFacade/savegrn`;
    return await api.post<any>('inventory', url, data);
}
 
export async function deleteInvTGRN(data: any) {
    const url = `/INV_T_GRNFacade/GRN_Delete`;
    return await api.post<any>('inventory', url, data);
}
 
export async function toggleInvTGRNActive(data: any) {
    const id = data.invmgrN_Id || data.INVMGRN_Id;
    const url = `/INV_T_GRNFacade/deactive?id=${id}`;
    return await api.post<any>('inventory', url, {});
}
 
export async function getInvTGRNItemTax(invtgrN_Id: number) {
    const url = `/INV_T_GRNFacade/get_itemtax`;
    return await api.post<any>('inventory', url, { INVTGRN_Id: invtgrN_Id });
}
 
export async function getInvTGRNItemDetails(invmgrN_Id: number) {
    const url = `/INV_T_GRNFacade/get_GRNitemDetails`;
    return await api.post<any>('inventory', url, { INVMGRN_Id: invmgrN_Id });
}
 
export async function getInvTGRNEditDetails(invmgrN_Id: number) {
    const url = `/INV_T_GRNFacade/editgrndetails?id=${invmgrN_Id}`;
    return await api.get<any>('inventory', url);
}
 
export async function getItemTaxDetail(id: number) {
    const url = `/INV_T_GRNFacade/getItemTaxDetail?id=${id}`;
    return await api.get<any>('inventory', url);
}
 
export async function getInvItemDetail(itemId: number) {
    const url = `/INV_T_GRNFacade/getitemDetail`;
    return await api.post<any>('inventory', url, { INVMI_Id: itemId });
}
 
export async function getItemDetail(id: number) {
    const url = `/INV_T_GRNFacade/getItemDetail?id=${id}`;
    return await api.get<any>('inventory', url);
}
