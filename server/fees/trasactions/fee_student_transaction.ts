'use server';

import { api } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { Ifeetransaction } from '@/types/fees/transactions/transactions';

export async function getFeeStudentTransactionDetails(asmaY_Id: number, searchParams?: ApiSearchparams) {
    const data = {
        page: searchParams?.page || 1,
        page_size: searchParams?.page_size || 10,
        search_query: searchParams?.search_query || '',
        search_column: searchParams?.search_column || '',
        sort_column: searchParams?.sort_column || '',
        sort_direction: searchParams?.sort_direction || 'asc',
        is_export: false
    };

    // ASMAY_Id as query param
    const url = `/FeeStudentTransaction/fee-details?ASMAY_Id=${asmaY_Id || 231}`;

    // Make POST request
    return await api.post<Ifeetransaction[]>('fees', url, data);
}

export async function searchStudentName(payload: any) {
    const url = '/FeeStudentTransaction/fee-stud-search-filter';
    return api.post<any>('fees', url, payload);
}

export async function getStudentDetails(payload: any) {
    const url = '/FeeStudentTransaction/fee-stud-lst-det';
    return api.post<any>('fees', url, payload);
}

export async function getFeeHead(payload: any) {
    const url = '/FeeStudentTransaction/fee-stud-lst-det';
    return api.post<any>('fees', url, payload);
}
