'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterConfiguration } from '@/types/admission/preadmission/masters';

export async function addMatserConfiguration(data: any) {
    const url = '/configuration/master_configuration';
    return await api.post<any>('preadmission', url, data);
}

export async function getMasterConfiguration(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/configuration/master_configuration?${urlParams}`;
    return await api.get<IMasterConfiguration[]>('preadmission', url);
}
