'use server';

import { api } from '@/lib/apiService';
import { getSearchParamsUrl } from '@/lib/apiService';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';

const BASE_URL = 'BookRegister/';

export async function getBookRegisterList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    try {
        const response = await api.get<any>('library', `${BASE_URL}Getdetails?${urlParams}`);
        return response;
    } catch (error) {
        return [];
    }
}

export async function saveBookRegister(data: BookRegisterPayload) {
    const validation = bookRegisterSchema.addOrUpdate.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    try {
        const payload = {
            ...data,
            LMB_EntryDate: new Date(data.LMB_EntryDate).toISOString(),
            Purchase_Date: new Date(data.Purchase_Date).toISOString()
        };

        const response = await api.post<any>('library', `${BASE_URL}Savedata`, payload);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to save record' };
    }
}

export async function deactivateBookRegister(data: { LMB_Id: number; LMB_BookTitle?: string }) {
    const validation = bookRegisterSchema.delete.safeParse(data);

    if (!validation.success) {
        return { success: false, message: validation.error.errors[0].message };
    }

    try {
        const response = await api.post<any>('library', `${BASE_URL}deactiveY`, data);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to delete record' };
    }
}

export async function getInitialData() {
    try {
        // Assuming 'Getdetails' returns the initial lists as well, as per legacy pattern often used.
        // If not, we might need a separate endpoint.
        const response = await api.get<any>('library', `${BASE_URL}Getdetails`);
        return response;
    } catch (error) {
        return {};
    }
}
