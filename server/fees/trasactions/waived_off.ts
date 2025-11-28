'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IFeeClassList,
    IFeeSectionList,
    IFeeTransactionWaivedOffList,
    feeTransactionWaivedOffGrid,
    feeTransactionWaivedOffGroup,
    feeTransactionWaivedOffHead,
    feeTransactionWaivedOffStudentDetails
} from '@/types/fees/transactions/transactions';

export async function feeTransactionWaivedOff(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeWaivedOff/GetFeeWaivedOffList?${urlParams}`;
    return await api.get<feeTransactionWaivedOffGrid[]>('fees', url);
}

export async function addOrUpdateTransactionWaivedOff(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/FeeMasterTermsFacade/fee_terms/30?${urlParams}`;
    return await api.get<IFeeTransactionWaivedOffList[]>('fees', url);
}

export async function addOrUpdateFeeTerm(data: any) {
    const url = '/FeeFineSlabFacade/AddOrUpdate';
    return await api.post<any>('fees', url, data);
}

export async function toggleFeeTerm(id: number) {
    const url = `/FeeFineSlabFacade/Toggle/${id}`;
    return await api.put('fees', url);
}

export async function getsectiondetails() {
    const url = '/FeeStudentTransaction/section-details';
    return await api.get<IFeeSectionList[]>('fees', url);
}

export async function getClassdetails() {
    const url = '/FeeStudentTransaction/class-details';
    return await api.get<IFeeClassList[]>('fees', url);
}

export async function getStudentdetails(asmay_Id: number, asmcl_Id: number, asms_Id: number) {
    const url = `/FeeWaivedOff/getstudent/${asmay_Id}?asmcl_id=${asmcl_Id}&asms_id=${asms_Id}`;
    return await api.get<feeTransactionWaivedOffStudentDetails[]>('fees', url);
}

export async function getGroupList(asmay_Id: number, amst_Id: number, filterradio: string) {
    const url = `/FeeWaivedOff/getgroup?asmay_id=${asmay_Id}&amst_id=${amst_Id}&filterradiobuttonvalue=${filterradio}`;
    return await api.get<feeTransactionWaivedOffGroup[]>('fees', url);
}

export async function getHeadList(asmay_Id: number, amst_Id: number, filterradio: string, fineWaivedOff: number, groupIds: any) {
    const url = `/FeeWaivedOff/gethead?asmay_id=${asmay_Id}&amst_id=${amst_Id}&filterradiobuttonvalue=${filterradio}&finewaiveoff=${fineWaivedOff}`;
    return await api.post<feeTransactionWaivedOffHead[]>('fees', url, groupIds);
}

export async function saveFeeWivedOff(payload: any) {
    const url = '/FeeWaivedOff/savedata';
    return await api.post<any[]>('fees', url, payload);
}

export async function uploadDocument(data: any) {
    const url = '/document_upload/upload_document';
    return await api.postMultipart<string>('preadmission', url, data);
}
