'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IFeeOpeningAcademicyearDropDownList,
    IFeeOpeningBalanceList,
    IFeeOpeningCategoryDropDownList,
    IFeeOpeningClassDropdownList,
    IFeeOpeningGroupDropdownList,
    IFeeOpeningHeadDropDownList,
    IFeeOpeningInstallmentDropdownList,
    IFeeOpeningPDA,
    IFeeOpeningRefundable,
    IFeeOpeningSectionDropdownList
} from '@/types/fees/transactions/transactions';

export async function getFeeOpeningBalance(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeOpeningBalanceFacade/30?${urlParams}`;
    return await api.get<IFeeOpeningBalanceList[]>('fees', url);
}

export async function addOrUpdateFeeOpeningBalance(data: any) {
    const url = '/FeeOpeningBalance/save-opening-balance';
    return await api.post<any>('fees', url, data);
}

export async function studentNameDropdown(data: any) {
    const url = '/FeeOpeningBalance/student-name-dropdown';
    return await api.post<any>('fees', url, data);
}

export async function studentListDropdown(data: any) {
    const url = '/FeeOpeningBalance/opening-balance-student-list';
    return await api.post<any>('fees', url, data);
}
export async function toggleFeeOpeningBalance(id: number) {
    const url = `/FeeOpeningBalanceFacade/paymentDecative/${id}`;
    return await api.put('fees', url);
}
export async function getOpeningAcademicYearDropdownData() {
    const url = 'FeeOpeningBalance/academicyear-dropdown-by-miid';
    return await api.get<IFeeOpeningAcademicyearDropDownList[]>('fees', url);
}

export async function getOpeningClassDropdownData() {
    const url = 'FeeOpeningBalance/class-dropdown';
    return await api.get<IFeeOpeningClassDropdownList[]>('fees', url);
}
export async function getOpeningSectionDropdownData(asmaY_Id: number, asmcL_Id: number) {
    const url = `FeeOpeningBalance/section-dropdown-by-class?asmay_Id=${asmaY_Id || 0}&asmcl_Id=${asmcL_Id || 0}`;
    return await api.get<IFeeOpeningSectionDropdownList[]>('fees', url);
}
export async function getOpeningRefundable(asmaY_Id: number, filterrefund: string) {
    const url = `FeeOpeningBalance/refundable?filterrefund=${filterrefund}&asmay_Id=${asmaY_Id || 0}`;
    return await api.get<IFeeOpeningRefundable[]>('fees', url);
}
export async function getOpeningBalanceList(asmaY_Id: number) {
    const url = `FeeOpeningBalance/opening-balance-list/${asmaY_Id}`;
    return await api.get<IFeeOpeningBalanceList[]>('fees', url);
}
export async function getOpeningPDAList(asmaY_Id: number) {
    const url = `FeeOpeningBalance/opening-balance-pda-list/${asmaY_Id}`;
    return await api.get<IFeeOpeningPDA[]>('fees', url);
}
export async function getOpeningHeadDropdownData(asmaY_Id: number) {
    const url = `FeeOpeningBalance/fee-head-dropdown?asmay_Id=${asmaY_Id}`;
    return await api.get<IFeeOpeningHeadDropDownList[]>('fees', url);
}

export async function getOpeningCategoryDropdownData() {
    const url = 'FeeOpeningBalance/category-dropdown-by-miid';
    return await api.get<IFeeOpeningCategoryDropDownList[]>('fees', url);
}
export async function getOpeningGroupDropdownData(fmH_Id: number) {
    const url = `FeeOpeningBalance/group-dropdown-by-head?fmh_Id=${fmH_Id}`;
    return await api.get<IFeeOpeningGroupDropdownList[]>('fees', url);
}

export async function getOpeningInstallmentDropdownData(asmaY_Id: number, fmG_id: number, fmH_Id: number) {
    const url = `FeeOpeningBalance/installment-dropdown-by-group?asmay_Id=${asmaY_Id}&fmg_id=${fmG_id}&fmh_Id=${fmH_Id}`;
    return await api.get<IFeeOpeningInstallmentDropdownList[]>('fees', url);
}

export async function deleteOpeningBalance(fillbusroutestudents: string, fmoB_Id: number) {
    const url = `FeeOpeningBalance/delete?fillbusroutestudents=${fillbusroutestudents}&FMOB_Id=${fmoB_Id}`;
    return await api.delete<any>('fees', url);
}
