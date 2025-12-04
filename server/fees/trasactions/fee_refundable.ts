'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IFeeRefundableList } from '@/types/fees/transactions/transactions';

export async function getFeeRefundableDetails(asmay_id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(
        searchParams ?? {},
        'admisionNo,studentName,studentName,refundedAmount,modeOfPayment,fr_Date,amst_Id'
    );
    const url = `/FeeRefundableFacade/get-student-refundable-list/${asmay_id}?${urlParams}`;
    return await api.get<IFeeRefundableList[]>('fees', url);
}

export async function addOrUpdateFeeRefundableDetails(data: any) {
    const url = '/fee_amount_entry';
    return await api.post<any>('fees', url, data);
}

export async function deleteFeeRefundableDetails(fr_id: number) {
    const url = `/FeeRefundableFacade/deleteRefund?FR_ID=${fr_id}/755242`;
    return await api.delete('fees', url);
}
