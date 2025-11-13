'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';

export async function getFeeMasterGroupwiseAutoReceipt(asmay_Id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'academicyear,fgaR_PrefixName,fgaR_SuffixName');

    const url = `/FeeMasterGroupwiseAutoReceipt/GetMasterGroupwiseAutoReceiptList?mi_Id=30&asmay_Id=${asmay_Id}${urlParams}`;

    return await api.get<IMasterGroupWiseAutoReciptList[]>('fees', url);
}
export async function getFeeMasterGroupwiseAutoReceiptGroupDropDown(academicYear: number) {
    const url = `/FeeMasterGroupwiseAutoReceipt/GetGroupDropdown?mi_Id=${30}&asmay_Id=${academicYear}`;

    return await api.get<any>('fees', url);
}

export async function addOrUpdateMasterFeeMasterGroupwiseAutoReceipt(payload: any) {
    const url = '/FeeMasterGroupwiseAutoReceipt/AddorUpdateMasterGroupwiseAutoReceipt';

    return await api.post<any>('fees', url, payload);
}
