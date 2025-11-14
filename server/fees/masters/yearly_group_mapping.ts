'use server';

import { api } from '@/lib/apiService';
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

export async function getMasterAllFeeHead(params?: ApiSearchparams) {
    const fields = 'fyghM_Id,fmG_GroupName,fmH_FeeName,fmI_Name,fyghM_FineApplicableFlag,fyghM_Common_AmountFlag,ASMAY_Id,page,page_size';

    const usp = new URLSearchParams();
    const safeParams = params ?? {};
    for (const [key, value] of Object.entries(safeParams)) {
        if (value !== undefined && value !== null) {
            usp.append(key, String(value));
        }
    }
    usp.append('fields', fields);

    const url = `/YearlyFeeGroupMappingFacade/getallfeehead?MI_Id=30&${usp.toString()}`;

    return await api.get<{
        success: boolean;
        message: string;
        data: IMasterAllFeeHeadList[];
    }>('fees', url);
}
