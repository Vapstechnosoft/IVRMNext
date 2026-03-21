'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';

export async function getDashboardCounts() {
    const url = '/configuration/dashboard';
    return await api.get<any>('preadmission', url);
}
