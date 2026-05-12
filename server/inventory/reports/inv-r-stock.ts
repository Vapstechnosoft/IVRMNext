'use server';
 
import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
 
export async function getInvRStockDetails(optionflag: string) {
    const url = `/INV_R_StockFacade/getloaddata?optionflag=${optionflag}`;
    return await api.get<any>('inventory', url);
}
 
export async function getInvRStockReport(payload: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/INV_R_StockFacade/onreport?${urlParams}`;
    return await api.post<any>('inventory', url, payload);
}
