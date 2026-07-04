'use server';

import { api } from '@/lib/apiService';

export async function getStudentEmployeeSmartCardInitialDetails() {
    const url = `/StudentAddressBook2/getinitialdata/2`;
    return await api.get<any>('admission', url);
}

export async function getStudentEmployeeSmartCardReport(data: any) {
    const url = `/StudentAddressBook2/getdetailsstdemp`;
    return await api.post<any>('admission', url, data);
}
