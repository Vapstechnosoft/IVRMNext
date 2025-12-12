'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getStudentTcReport(data: any, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, ',ivrmmR_Name');
    const url = `/StudentTcReport/GetAdmissionTcReport?${urlParams}&ASMAY_Id=${data.ASMAY_Id}&AllOrInd=${data.AllOrInd}&ASMCL_Id=${data.ASMCL_Id}&ASMC_Id=${data.ASMC_Id}&TempararyArrayheadList=${data.TempararyArrayheadList}&PermOrTemp=${data.PermOrTemp}&AMC_Id=${data.AMC_Id}`;
    return await api.post<any>('admission', url, data);
}
