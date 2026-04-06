'use server';

import { api } from '@/lib/apiService';

export async function getDashboardCounts() {
    const url = '/api/configuration/dashboard';
    return await api.get('preadmission', url);
}
