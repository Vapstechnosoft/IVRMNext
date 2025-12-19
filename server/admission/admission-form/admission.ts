'use server';
import { api } from '@/lib/apiService';

export async function saveFirstTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savefirsttab';
    return await api.post<any>('admission', url, data);
}

export async function saveSecondTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savesecondtab';
    return await api.post<any>('admission', url, data);
}

export async function saveThirdTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savethirdtab';
    return await api.post<any>('admission', url, data);
}
export async function saveFourthTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savefourthtab';
    return await api.post<any>('admission', url, data);
}

export async function saveFifthTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savefifthtab';
    return await api.post<any>('admission', url, data);
}

export async function saveFinalTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savefinaltab';
    return await api.post<any>('admission', url, data);
}
