'use server';

import { api } from '@/lib/apiService';

const BASE_URL = '/ClgMasterQuota';

export async function getClgMasterQuotaInitialData() {
    try {
        return await api.get<any>('college', `${BASE_URL}/getalldetails?pageid=2`);
    } catch (error) {
        console.error('[Server] getClgMasterQuotaInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function saveMasterQuota(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savedetails`, data);
}

export async function editMasterQuota(data: any) {
    return await api.post<any>('college', `${BASE_URL}/editdetails`, data);
}

export async function toggleMasterQuota(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactiveQuota`, data);
}

export async function saveMasterQuotaCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savedetails1`, data);
}

export async function editMasterQuotaCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/editdetails1`, data);
}

export async function toggleMasterQuotaCategory(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactiveQuota1`, data);
}

export async function saveMasterQuotaCategoryMapping(data: any) {
    return await api.post<any>('college', `${BASE_URL}/savedetails2`, data);
}

export async function toggleMasterQuotaCategoryMapping(data: any) {
    return await api.post<any>('college', `${BASE_URL}/activedeactiveQuota2`, data);
}
