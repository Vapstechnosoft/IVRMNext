'use server';

import { api } from '@/lib/apiService';

export async function getSrkvsAddressBookLoadData() {
    return await api.get<any>('admission', '/StudentAddressBook2/getinitialdata/2');
}

export async function changeYearSrkvsAddressBook(data: { ASMAY_Id: number; flag: string }) {
    return await api.post<any>('admission', '/StudentAddressBook2/yearchangenew', data);
}

export async function changeClassSrkvsAddressBook(data: { ASMAY_Id: number; flag: string; ASMCL_Id: number }) {
    return await api.post<any>('admission', '/StudentAddressBook2/classchangenew', data);
}

export async function changeSectionSrkvsAddressBook(data: { ASMAY_Id: number; flag: string; ASMCL_Id: number; ASMC_Id: number }) {
    return await api.post<any>('admission', '/StudentAddressBook2/sectionchangenew', data);
}

export async function getSrkvsAddressBookReport(data: {
    asmaY_Id: number;
    asmcL_Id: number;
    asmC_Id: number;
    amsT_Id?: number;
    flag: string;
    sall: string;
    studentlisttemp: any[];
}) {
    return await api.post<any>('admission', '/StudentAddressBook2/getdetailsnew', data);
}
