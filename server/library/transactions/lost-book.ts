// app/services/library/lostBookService.ts
'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { APIResponse, AuthorOption, BookOption, ILostBookList } from '@/types/library/transactions/transactions';

// Get lost books list with search params
export async function getLostBookList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'lmB_BookTitle');
    const url = `/LostBook/lost-book-list?${urlParams}`;
    return await api.get<APIResponse<ILostBookList[]>>('library', url);
}

// Get book dropdown list for lost book form
export async function getBookListDropdown(bookcat_type: string, booktype: string) {
    const url = `/LostBook/book-list-dropdown/${bookcat_type}/${booktype}`;
    return await api.get<APIResponse<BookOption[]>>('library', url);
}

// Get author dropdown by book ID
export async function getAuthorNameDropdown(lmbanO_Id: number) {
    const url = `/LostBook/author-name-list-dropdown/${lmbanO_Id}`;
    return await api.get<APIResponse<AuthorOption[]>>('library', url);
}

// Save lost book record
export async function saveLostBookRecord(data: any) {
    const url = '/LostBook/saverecord';
    return await api.post<any>('library', url, data);
}

// // Search books filter
// export async function searchBooksFilter(data: {
//     searchfilter: string;
//     bookcat_type: string;
//     booktype: string;
// }) {
//     const url = `/LostBook/searchfilter`;
//     return await api.post<APIResponse<BookOption[]>>('library', url, data);
// }

// // Get radio change data
// export async function getRadioChangeData(data: {
//     bookcat_type: string;
//     booktype: string;
// }) {
//     const url = `/LostBook/get_radiochange`;
//     return await api.post<APIResponse<BookOption[]>>('library', url, data);
// }

// // Get author details
// export async function getAuthorDetails(data: {
//     LMB_Id: number;
//     LMBANO_Id: number;
// }) {
//     const url = `/LostBook/get_authorNm`;
//     return await api.post<APIResponse<AuthorOption[]>>('library', url, data);
// }

// // Get initial data for page load
// export async function getLostBookPageData(data: {
//     booktype: string;
//     bookcat_type: string;
// }) {
//     const url = `/LostBook/getdetails`;
//     return await api.post<APIResponse<{
//         booktitle: BookOption[];
//         lostbooks: LostBook[];
//     }>>('library', url, data);
// }
