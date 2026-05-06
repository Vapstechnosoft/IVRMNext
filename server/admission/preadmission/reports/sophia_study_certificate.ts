'use server';

import { api } from '@/lib/apiService';

export async function getSophiaStudyCertLoadData() {
    const url = '/StudyCertificate/getdata';
    return await api.post<any>('admission', url, 1);
}

export async function getSophiaStudyCertDetails(data: any) {
    const url = '/StudyCertificate/Studdetails';
    return await api.post<any>('admission', url, data);
}

export async function getSophiaStudyCertSearchFilter(data: any) {
    const url = '/StudyCertificate/searchfilter';
    return await api.post<any>('admission', url, data);
}

