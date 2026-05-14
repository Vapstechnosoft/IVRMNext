'use server';

import { api } from '@/lib/apiService';
import { getSearchParamsUrl } from '@/lib/apiService';
import { bookRegisterSchema } from '@/schemas/library/bookRegister';
import type { ApiSearchparams } from '@/types';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { IBookRegisterList } from '@/types/library/transactions/transactions';

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

export async function getInitialData() {
    try {
        // Fetch main load data (contains most dropdowns)
        const mainLoadUrl = `/BookRegister/book-register-main-load/21602`;
        const mainLoadResponse = await api.get<any>('library', mainLoadUrl);

        // Fetch category list specifically as it seems to be missing from main-load
        const categoryUrl = `/MasterCategory/master-books-category-list`;
        const categoryResponse = await api.get<any>('library', categoryUrl);

        // Fetch subject list
        const subjectUrl = `/BookRegister/book-regester-subject-dropdown`;
        const subjectResponse = await api.get<any>('library', subjectUrl);

        // Fetch department list
        const departmentUrl = `/BookRegister/department-dropdown`;
        const departmentResponse = await api.get<any>('library', departmentUrl);

        return {
            ...(mainLoadResponse || {}),
            categorylist: categoryResponse?.data || mainLoadResponse?.categorylist || [],
            subjectlist: subjectResponse?.subjectlist || subjectResponse?.subjectList || subjectResponse?.data || mainLoadResponse?.subjectlist || [],
            deptlist: departmentResponse?.deptlist || departmentResponse?.deptList || departmentResponse?.data || mainLoadResponse?.deptlist || []
        };
    } catch (error) {
        return { success: false, message: 'Failed to fetch initial data' };
    }
}
