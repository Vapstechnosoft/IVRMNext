'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IadmissionStudentApplicationList } from '@/types/admission/admission';

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

export async function saveGaurdianApi(data: any) {
    const url = '/StudentAdmissionFacade/saveguardian';
    // If the caller provided a FormData instance, send it as multipart/form-data
    try {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        // Fallback check for server-side environments where instanceof FormData may not hold
        const looksLikeFormData = !isFormData && data && typeof (data as any).get === 'function';

        if (isFormData || looksLikeFormData) {
            return await api.postMultipart<any>('admission', url, data as FormData);
        }
    } catch (_err) {
        // If any detection fails, fall back to JSON post
    }

    return await api.post<any>('admission', url, data);
}

export async function saveStudentPhotoApi(data: any) {
    const url = '/StudentAdmissionFacade/upload-student-photo';
    // If the caller provided a FormData instance, send it as multipart/form-data
    try {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        // Fallback check for server-side environments where instanceof FormData may not hold
        const looksLikeFormData = !isFormData && data && typeof (data as any).get === 'function';

        if (isFormData || looksLikeFormData) {
            return await api.postMultipart<any>('admission', url, data as FormData);
        }
    } catch (_err) {
        // If any detection fails, fall back to JSON post
    }

    return await api.post<any>('admission', url, data);
}

export async function saveFinalTabApi(data: any) {
    const url = '/StudentAdmissionFacade/savelasttab';
    // If the caller provided a FormData instance, send it as multipart/form-data
    try {
        const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
        // Fallback check for server-side environments where instanceof FormData may not hold
        const looksLikeFormData = !isFormData && data && typeof (data as any).get === 'function';

        if (isFormData || looksLikeFormData) {
            return await api.postMultipart<any>('admission', url, data as FormData);
        }
    } catch (_err) {
        // If any detection fails, fall back to JSON post
    }

    return await api.post<any>('admission', url, data);
}

export async function getAllAdmissionLists(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, '');
    const url = `/StudentAdmissionFacade/get-student-list${urlParams ? `?${urlParams}` : ''}`;
    return await api.get<[IadmissionStudentApplicationList]>('admission', url);
}

export async function getStudentAdmissionForm(id: number) {
    const url = `/StudentAdmissionFacade/get-all-tabs-by-amst-id/${id}`;
    return await api.post<any>('admission', url);
}

export async function getStudentAdmissionFormById(id: number) {
    const url = `/StudentAdmissionFacade/get-all-tabs-by-amst-id/${id}`;
    return await api.get<any>('admission', url);
}
