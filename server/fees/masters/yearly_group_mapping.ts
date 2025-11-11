'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterAllFeeHeadList, IMasterFeeHeadDropdownList, IMasterFeeInstallmentDropdownList } from '@/types/fees/masters/masters';

export async function getMasterfeehead() {
    const url = '/YearlyFeeGroupMappingFacade/feeheads';
    return await api.get<{
        success: boolean;
        message: string;
        data: IMasterFeeHeadDropdownList[];
    }>('fees', url);
}

export async function getMasterfeeInstallment() {
    const url = '/YearlyFeeGroupMappingFacade/feeinstallments';

    return await api.get<{
        success: boolean;
        message: string;
        data: IMasterFeeInstallmentDropdownList[];
    }>('fees', url);
}

export async function addMasterYearlyGroupMapping(data: any) {
    const url = '/YearlyFeeGroupMappingFacade/savefeeheadinstallment';
    return await api.post<any>('fees', url, data);
}

export async function getMasterAllFeeHead(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'ASMAY_Id,FMG_Id');
    const url = `/YearlyFeeGroupMappingFacade/getallfeehead?MI_Id=30${urlParams ? `&${urlParams}` : ''}`;

    return await api.get<{
        success: boolean;
        message: string;
        data: IMasterAllFeeHeadList[];
    }>('fees', url);
}
