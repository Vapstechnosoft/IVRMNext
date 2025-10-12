'use server';

import { api } from '@/lib/apiService';
import type {
    ICasteDropdown,
    ICountryDropdown,
    IGenderDropdown,
    IPreadmissionClassDropdown,
    IPreadmissionDocumentDropdown,
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
