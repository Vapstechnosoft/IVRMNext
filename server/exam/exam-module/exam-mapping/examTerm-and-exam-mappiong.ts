'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamTermAndExamMapping, IExamTermAndExamMappingDetails } from '@/types/exam/exam-module/exam-mapping';
// // import type { IExam, ITerm } from '@/types/exam/exam-module/masters';

// --------------------------------------------
// Get All Exam Term and Exam Mappings
// --------------------------------------------
export async function getExamTermAndExamMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_term_and_exam_mapping/30?${urlParams}`;
    const response = await api.get<IExamTermAndExamMapping>('exam', url);
    return { ...response };
}
export async function getExamTermAndExamMappingDetails(mi_id: number, asmay_id: number, emca_id: number, ect_id: number) {
    if (!ect_id) throw new Error('Term ID is required');
    const url = `/exam_term_and_exam_mapping/term_and_exam_mapping_details_view_by_ids/${mi_id}/${asmay_id}/${emca_id}/${ect_id}`;
    return await api.get<IExamTermAndExamMappingDetails>('exam', url);
}

// --------------------------------------------
// Add or Update Exam Term and Exam Mapping
// --------------------------------------------
export async function addOrUpdateExamTermAndExamMapping(data: any) {
    const url = '/exam_term_and_exam_mapping';
    return await api.post<any>('exam', url, data);
}

// // --------------------------------------------
// // Get Term Dropdown List
// // --------------------------------------------
// export async function getTermDropdownList(orgId: number, asmay_id: number) {
//     if (!asmay_id) throw new Error('Academic Year ID is required');
//     const url = `/exam_term_exam_mapping/term_drop_down_list/${orgId}/${asmay_id}`;
//     return await api.get<ITerm>('exam', url);
// }

// // --------------------------------------------
// // Get Exam Dropdown List
// // --------------------------------------------
// export async function getExamDropdownList(orgId: number, asmay_id: number) {
//     if (!asmay_id) throw new Error('Academic Year ID is required');
//     const url = `/exam_term_exam_mapping/exam_drop_down_list/${orgId}/${asmay_id}`;
//     return await api.get<IExam>('exam', url);
// }

// --------------------------------------------
// Get Mapped Exams by Term ID
// --------------------------------------------
export async function getMappedExamsByTerm(orgId: number, asmay_id: number, termId: number) {
    if (!termId) throw new Error('Term ID is required');
    const url = `/exam_term_exam_mapping/exam_term_mapping_details/${orgId}/${asmay_id}/${termId}`;
    return await api.get<IExamTermAndExamMapping>('exam', url);
}

// --------------------------------------------
// Toggle Active Status for Exam Term Mapping
// --------------------------------------------
export async function toggleExamTermAndExamMapping(orgId: number, asmay_id: number, emca_id: number, ect_id: number) {
    const url = `/exam_term_and_exam_mapping/toggle_term_and_exam_mapping/${orgId}/${asmay_id}/${emca_id}/${ect_id}`;
    return await api.put('exam', url);
}

export async function toggleExamTermAndExamMappingDetails(orgId: number, etem_id: number) {
    const url = `/exam_term_and_exam_mapping/toggle_exam_term_mapping/${orgId}/${etem_id}`;
    return await api.put('exam', url);
} // Not use

// --------------------------------------------
// Delete Exam Term Mapping
// --------------------------------------------
export async function deleteExamTermMapping(orgId: number, etem_id: number) {
    if (!etem_id) throw new Error('Mapping ID is required');
    const url = `/exam_term_exam_mapping/${orgId}/${etem_id}`;
    return await api.delete('exam', url);
}
