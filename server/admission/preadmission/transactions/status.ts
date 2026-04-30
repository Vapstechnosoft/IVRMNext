'use server';

import { api } from '@/lib/apiService';
import type { IStatusInitialData, IStatusSearchResponse } from '@/types/admission/preadmission/status';

export async function getStatusInitialData() {
    const url = '/Status/getinitialdata/';
    return await api.get<IStatusInitialData>('preadmission', url);
}

export async function searchStatusData(data: any) {
    const url = '/Status/SearchData';
    return await api.post<IStatusSearchResponse>('preadmission', url, data);
}

export async function saveStatusData(data: any) {
    const url = '/Status/';
    return await api.post<any>('preadmission', url, data);
}

export async function forgotOTPForEmailval(data: any) {
    const url = '/Login/ForgotOTPForEmailval';
    return await api.post<any>('preadmission', url, data);
}

export async function verifyEmailOtpgen(data: any) {
    const url = '/Login/VerifyEmailOtpgen';
    return await api.post<any>('preadmission', url, data);
}
