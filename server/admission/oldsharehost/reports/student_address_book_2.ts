'use server';

import { api } from '@/lib/apiService';

export async function getStudentAddressBook2InitialData() {
    const url = `/StudentAddressBook2/getinitialdata/2`;
    return await api.get<any>('admission', url);
}

export async function studentAddressBook2YearChange(data: any) {
    const url = `/StudentAddressBook2/yearchange`;
    // The Angular code used get with data, which might have been a query string or a post. 
    // Usually these are POSTs in this backend.
    return await api.post<any>('admission', url, data);
}

export async function studentAddressBook2SectionChange(data: any) {
    const url = `/StudentAddressBook2/sectionchange`;
    return await api.post<any>('admission', url, data);
}

export async function getStudentAddressBook2Report(data: any) {
    const url = `/StudentAddressBook2/getdetails`;
    return await api.post<any>('admission', url, data);
}
