'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterFeeHeadDropdownList, IMasterFeeInstallmentDropdownList } from '@/types/fees/masters/masters';

export async function getMasterfeehead(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/YearlyFeeGroupMappingFacade/feeheads${urlParams}`;
    return await api.get<IMasterFeeHeadDropdownList[]>('fees', url);
}

export async function getMasterfeeInstallment(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/YearlyFeeGroupMappingFacade/feeinstallments${urlParams}`;
    return await api.get<IMasterFeeInstallmentDropdownList[]>('fees', url);
}
