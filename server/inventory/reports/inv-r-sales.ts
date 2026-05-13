'use server';
 
import { api, getSearchParamsUrl } from '@/lib/apiService';
import { ApiSearchparams } from '@/types';
 
export async function getInvRSalesLoadData() {
    return await api.post<any>('inventory', '/INV_R_SalesFacade/getloaddata', {});
}
 
export async function getInvRSalesDetails(optionflag: string) {
    const url = `/INV_R_SalesFacade/mainradiochange?type=${optionflag}`;
    return await api.get<any>('inventory', url);
}
 
export async function getInvRSalesClassData() {
    return await api.post<any>('inventory', '/INV_R_SalesFacade/radiochange', { type: 'C' });
}
 
export async function getInvRSalesStudentList(payload: any) {
    return await api.post<any>('inventory', '/INV_R_SalesFacade/getStudentlist', payload);
}
 
export async function getInvRSalesReport(payload: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_R_SalesFacade/onreport?${urlParams}`;
    return await api.post<any>('inventory', url, payload);
}
