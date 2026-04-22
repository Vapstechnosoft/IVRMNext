'use server';

import { api } from '@/lib/apiService';

const MODULE_URL = 'ImportLibrarydata';

export async function getImportLibraryDataInitial() {
    // 2 is likely a page id or similar magic number from old code
    const response = await api.get<any>('library', `${MODULE_URL}/getdetails/2`);
    return response.data;
}

export async function checkLibraryDataValidation(data: any) {
    const response = await api.post<any>('library', `${MODULE_URL}/checkvalidation`, data);
    return response.data;
}

export async function saveImportLibraryData(data: any) {
    const response = await api.post<any>('library', `${MODULE_URL}/`, data);
    return response.data;
}
