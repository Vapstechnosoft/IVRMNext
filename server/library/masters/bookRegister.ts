'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { IBookRegisterList } from '@/types/library/transactions/transactions';
import { ensureArray } from '@/lib/utils';

const BASE_URL = 'BookRegister/';

export async function getBookRegisterList(data: { IVRMUL_Id: number; searchParams?: ApiSearchparams }) {
    try {
        const urlParams = getSearchParamsUrl(data.searchParams ?? {}, 'lmB_BookTitle');
        const url = `/BookRegister/book-register-main-load/${data.IVRMUL_Id}?${urlParams}`;
        return await api.get<any>('library', url);
    } catch (error: any) {
        return { success: false, message: error?.message || 'Failed to fetch book register data', data: [] };
    }
}

export async function saveBookRegister(data: BookRegisterPayload) {
    try {
        const payload = {
            ...data,
            lmB_EntryDate: new Date(data.lmB_EntryDate).toISOString(),
            purchase_Date: new Date(data.purchase_Date).toISOString()
        };

        const response = await api.post<any>('library', `${BASE_URL}Savedata`, payload);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to save record' };
    }
}

export async function deactivateBookRegister(data: { LMB_Id: number; LMB_BookTitle?: string }) {
    try {
        const response = await api.post<any>('library', `${BASE_URL}deactiveY`, data);
        return response;
    } catch (error) {
        return { success: false, message: 'Failed to delete record' };
    }
}

export async function getLanguageDropdown() {
    try {
        const url = 'BookRegister/language-dropdown';
        const response = await api.get<any>('library', url);
        return response?.data || response;
    } catch (error) {
        return [];
    }
}

export async function getInitialData() {
    try {
        // Fetch main load data (contains most dropdowns)
        const mainLoadUrl = 'BookRegister/book-register-main-load/21602';
        const mainLoadResponse = await api.get<any>('library', mainLoadUrl);

        // Fetch category list specifically as it seems to be missing from main-load
        const categoryUrl = 'MasterCategory/master-books-category-list';
        const categoryResponse = await api.get<any>('library', categoryUrl);

        // Fetch subject list
        const subjectUrl = 'BookRegister/book-register-subject-dropdown';
        const subjectResponse = await api.get<any>('library', subjectUrl);

        // Fetch department list
        const departmentUrl = 'MasterDepartmentFacade/get-master-department-list';
        const departmentResponse = await api.get<any>('library', departmentUrl);

        // Fetch language list
        const languageResponse = await getLanguageDropdown();

        return {
            ...(mainLoadResponse || {}),
            categorylist: ensureArray(categoryResponse),
            subjectlist: ensureArray(subjectResponse),
            deptlist: ensureArray(departmentResponse),
            langlist: Array.isArray(languageResponse) ? languageResponse : ensureArray(languageResponse)
        };
    } catch (error) {
        return { success: false, message: 'Failed to fetch initial data' };
    }
}
