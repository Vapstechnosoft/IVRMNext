'use server';

import { api } from '@/lib/apiService';

export async function checkPreadmissionLive(subdomain: string) {
    const url = `/configuration/check_preadmission_live/${subdomain}`;
    return await api.get<boolean>('preadmission', url);
}
