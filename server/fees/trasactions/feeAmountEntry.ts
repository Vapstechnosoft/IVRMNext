'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterpaymentGatewayDropdownList } from '@/types/fees/masters/masters';
import type {
    IFeeAcademicyearDropDownList,
    IFeeAmountEntryList,
    IFeeClassCategoryDropDownList,
    IFeeGroupDropDownList,
    IMasterAmountEntryDetails
} from '@/types/fees/transactions/transactions';

export async function getAmountEntry(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/fee_amount_entry/30?${urlParams}`;
    return await api.get<IFeeAmountEntryList[]>('fees', url);
}

export async function addOrUpdateAmountEntry(data: any) {
    const url = '/fee_amount_entry';
    return await api.post<any>('fees', url, data);
}

// export async function getCategorydrodowndata(searchParams?: ApiSearchparams) {
//     const urlParams = getSearchParamsUrl(searchParams ?? {});
//     const url = `/fee_amount_entry/30?${urlParams}`;
//     return await api.post<IFeeAmountEntryList[]>('fees', url);
// }

export async function getCategorydrodowndata(academicYear_Id: number) {
    const url = `fee_amount_entry/getclass_categorylist?mi_id=30&asmay_id=${academicYear_Id}`;
    return await api.post<IFeeClassCategoryDropDownList>('fees', url);
}

export async function getgroupdrodown(academicYear_Id: number) {
    //const url = `fee_amount_entry/fee_grouplist?mi_id=30&asmay_id=${academicYear_Id}`;

    const url = 'fee_amount_entry/fee_grouplist?mi_id=30&asmay_id=231';
    return await api.post<IFeeGroupDropDownList>('fees', url);
}

export async function getAcademicYearDropdownData() {
    const url = '/fee_class_category/academicyearlist/30';
    return await api.get<IFeeAcademicyearDropDownList[]>('fees', url);
}
// export async function getgroupdrodown(searchParams?: ApiSearchparams) {
//     const urlParams = getSearchParamsUrl(searchParams ?? {});
//     const url = `/fee_amount_entry/30?${urlParams}`;
//     return await api.get<IFeeAmountEntryList[]>('fees', url);
// }

export async function addOrUpdatepaymentgatewaydetails(data: any) {
    const url = '/FeePaymentGatewayDetailsFacade';
    return await api.post<any>('fees', url, data);
}

export async function togglepaymentgatewaydetails(mi_id: number, id: number) {
    const url = `/FeePaymentGatewayDetailsFacade/deletePaymentGatewayDetails/${id}`;
    return await api.put('fees', url);
}

export async function getpaymentgateway_dropdown(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeePaymentGatewayDetailsFacade/paymentgatewaylist/30?${urlParams}`;
    return await api.get<IMasterpaymentGatewayDropdownList[]>('fees', url);
}

// export async function getAcademicYearDropdown() {
//     const url = '/master_class_category/academic_year_drop_down_list/30';
//     return await api.get<IAcademicYearDropDown[]>('admission', url);
// }

export async function getAmountentrydetails(mi_id: number, asmay_id: number, fmcC_id: number, fmG_id: number) {
    const url = `/fee_amount_entry/getgroupmappedheads/${mi_id}/${asmay_id}/${fmcC_id}/${fmG_id}`;
    return await api.get<IMasterAmountEntryDetails[]>('fees', url);
}
