'use server';

import { api } from '@/lib/apiService';
import type { IMasterRegistrationList } from '@/types/admission/preadmission/configaration';

export async function getRegistration() {
    const url = '/transaction_numbering/Registration';
    return await api.get<IMasterRegistrationList[]>('preadmission', url);
}

export async function getRegistration1() {
    try {
        const url = '/transaction_numbering/Registration';
        const response = await api.get<IMasterRegistrationList[]>('preadmission', url);
        console.log('API Response:', response);
        return response;
    } catch (error) {
        console.error('Registration API Error:', error);
        throw error;
    }
}

export async function addOrUpdateRegistration(data: any) {
    const url = 'transaction_numbering';
    return await api.post<any>('preadmission', url, data);
}
export async function togglePreAdmissionAcademicYear(id: number) {
    const url = `/academic_year/toggle/${id}`;
    return await api.put('preadmission', url);
}
