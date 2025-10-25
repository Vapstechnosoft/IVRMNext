'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    ICasteDropdown,
    ICountryDropdown,
    IGenderDropdown,
    IInitiatePaymentResponse,
    IPreadmissionClassDropdown,
    IPreadmissionDocumentDropdown,
    IPreadmissionStudentApplicationList,
    IReferenceDropdown,
    IReligionDropdown,
    ISourceDropdown,
    IStateDropdown
} from '@/types/admission/preadmission/transactions';

export async function getReligionDropdown() {
    const url = '/student_application_form/religion_drop_down_list';
    return await api.get<IReligionDropdown[]>('preadmission', url);
}

export async function getCasteDropdown(religion_id: number) {
    const url = `/student_application_form/caste_drop_down_list?mi_id=30&religion_id=${religion_id}`;
    return await api.get<ICasteDropdown[]>('preadmission', url);
}

export async function getCountryDropdown() {
    const url = '/student_application_form/country_drop_down_list';
    return await api.get<ICountryDropdown[]>('preadmission', url);
}

export async function getStateDropdown(country_id: number) {
    const url = `/student_application_form/state_drop_down_list?country_id=${country_id}`;
    return await api.get<IStateDropdown[]>('preadmission', url);
}

export async function getGenderDropdown() {
    const url = '/student_application_form/gender_drop_down_list?mi_id=30';
    return await api.get<IGenderDropdown[]>('preadmission', url);
}

export async function getSourceDropdown() {
    const url = '/student_application_form/source_drop_down_list';
    return await api.get<ISourceDropdown[]>('preadmission', url);
}

export async function getReferenceDropdown() {
    const url = '/student_application_form/reference_drop_down_list';
    return await api.get<IReferenceDropdown[]>('preadmission', url);
}

export async function getPreadmissionDocumentDropdown(mi_id: number) {
    const url = `/student_application_form/required_document_drop_down_list?mi_id=${mi_id}`;
    return await api.get<IPreadmissionDocumentDropdown[]>('preadmission', url);
}

export async function getPreadmissionClassDropdown() {
    const url = '/student_application_form/master_class_drop_down_list?mi_id=30';
    return await api.get<IPreadmissionClassDropdown[]>('preadmission', url);
}

export async function addStudentApplicationForm(data: any) {
    const url = '/student_application_form/add_student_application';
    return await api.post<any>('preadmission', url, data);
}

export async function getStudentApplicationList(asmay_id: number, searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {}, 'PASR_RegistrationNo,student_name,PASR_Sex,applied_class_name');
    const url = `/student_application_form/student_application_list?asmay_id=${asmay_id}&${urlParams}`;

    return await api.get<IPreadmissionStudentApplicationList[]>('preadmission', url);
}

export async function applicationFormInitiatePayment(pasr_id: number) {
    const url = `/payment/initiate_payment/${pasr_id}`;
    return await api.post<IInitiatePaymentResponse>('preadmission', url);
}

export async function updateApplicationPaymentStatus(status: string, transaction_id: string) {
    try {
        console.log('=== SERVER ACTION: updateApplicationPaymentStatus ===');
        console.log('Status:', status);
        console.log('Transaction ID:', transaction_id);

        const url = `/payment/update_payment_status?status=${status}&transaction_id=${transaction_id}`;
        console.log('API URL:', url);

        const response = await api.post<any>('preadmission', url);

        console.log('API Response:', response);
        console.log('=== END SERVER ACTION ===');

        // ✅ Ensure we always return a proper response
        return response || { success: false, message: 'No response from server' };
    } catch (error: any) {
        console.error('=== SERVER ACTION ERROR ===');
        console.error('Error in updateApplicationPaymentStatus:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('=== END ERROR ===');

        // ✅ Return error response instead of throwing
        return {
            success: false,
            message: error?.message || 'Failed to update payment status',
            error: error?.toString()
        };
    }
}
