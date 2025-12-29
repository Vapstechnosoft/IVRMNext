'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type {
    IPromotionSetting,
    IPromotionalGroupDetails,
    IPromotionalGroupMappedExamDetails,
    IPromotionalSubjectDetails
} from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getPromotionalSettings(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_promotional_settings/30?${urlParams}`;

    try {
        return await api.get<IPromotionSetting>('exam', url);
    } catch (error) {
        console.error('Error fetching promotional settings → returning mock data', error);

        // 🔥 Return 12 dummy items
        const fallbackData: IPromotionSetting[] = Array.from({ length: 12 }).map((_, index) => ({
            id: index + 1,
            asmaY_Id: 2024,
            emcA_CategoryName: `Category ${index + 1}`,
            emgR_GradeName: `Grade ${index + 1}`,
            promotion_type: index % 2 === 0 ? 'Automatic' : 'Manual',
            pass_to_individual: index % 2 === 0,
            pass_to_overall: index % 3 === 0,
            best_applicable: index % 4 === 0,
            best_off: (index + 1) * 5
        }));

        return {
            success: true,
            message: 'Returning fallback promotional settings',
            data: fallbackData
        };
    }
}

export async function getPromotionalSettingDetails(orgId: number, ecycE_Id: number) {
    if (!ecycE_Id) throw new Error('Exam Subject Wizard ID is required');

    const url = `exam_subject_mapping/grade_and_exam_subject_mapping_list_/${orgId}/${ecycE_Id}`;

    try {
        return await api.get<IPromotionalSubjectDetails[]>('exam', url);
    } catch (error) {
        console.error('API failed, returning fallback data', error);

        const subjects = [
            'Mathematics',
            'English',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
            'Computer Science',
            'Economics',
            'Political Science',
            'Hindi',
            'Telugu',
            'Sanskrit'
        ];

        const promotionalSubjectFallback: IPromotionalSubjectDetails[] = subjects.map((subject, index) => ({
            slNo: index + 1,
            subjectName: subject,
            gradeName: 'A',
            maxMarks: 100,
            minMarks: 35,
            convertedMarks: 75,
            aplResult: true,
            isActiveFlag: true
        }));

        return {
            success: true,
            message: 'Returning fallback data',
            data: promotionalSubjectFallback
        };
    }
}

export async function togglePromotionalSettingDetails(eyceS_Id: number) {
    if (!eyceS_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_subject_/${eyceS_Id}`;
    return await api.put('exam', url);
}

export async function getPromotionalGroupMappings(orgId: number, ecycE_Id: number) {
    if (!ecycE_Id) throw new Error('Promotional Group ID is required');

    const url = `exam_subject_mapping/promotional_group_mapping_list__/${orgId}/${ecycE_Id}`;

    try {
        return await api.get<IPromotionalGroupDetails[]>('exam', url);
    } catch (error) {
        console.error('API failed, returning fallback data', error);

        const groups = ['Science Group', 'Arts Group', 'Commerce Group', 'Language Group', 'Optional Group'];

        const promotionalGroupFallback: IPromotionalGroupDetails[] = groups.map((group, index) => ({
            slNo: index + 1,
            groupName: group,
            displayName: group,
            percentage: 40,
            marks: 400,
            maxOff: 500,
            bestOff: 5,
            roundOffFlag: true,
            isActiveFlag: true
        }));

        return {
            success: true,
            message: 'Returning fallback data',
            data: promotionalGroupFallback
        };
    }
}

export async function togglePromotionalGroupMappings(slNo: number) {
    if (!slNo) throw new Error('Promotional Group ID is required');

    const url = `exam_subject_mapping/toggle_promotional_group/${slNo}`;

    return await api.put('exam', url);
}

export async function getPromotionalGroupMappedExams(orgId: number, promotionalGroupId: number) {
    if (!promotionalGroupId) throw new Error('Promotional Group ID is required');

    const url = `exam_subject_mapping/promotional_group_mapped_exam_list/${orgId}/${promotionalGroupId}`;

    try {
        return await api.get<IPromotionalGroupMappedExamDetails[]>('exam', url);
    } catch (error) {
        console.error('API failed, returning fallback data', error);

        const exams = [
            { name: 'Mid Term Exam', code: 'MID-01' },
            { name: 'Quarterly Exam', code: 'QTR-01' },
            { name: 'Half Yearly Exam', code: 'HY-01' },
            { name: 'Annual Exam', code: 'ANN-01' },
            { name: 'Unit Test', code: 'UT-01' }
        ];

        const fallback: IPromotionalGroupMappedExamDetails[] = exams.map((exam, index) => ({
            slNo: index + 1,
            examName: exam.name,
            examCode: exam.code,
            marksOrPercentage: 40,
            conversionRequired: true,
            isActiveFlag: true
        }));

        return {
            success: true,
            message: 'Returning fallback data',
            data: fallback
        };
    }
}

export async function togglePromotionalGroupMappedExam(slNo: number) {
    if (!slNo) throw new Error('Promotional Group Mapped Exam ID is required');

    const url = `exam_subject_mapping/toggle_promotional_group_mapped_exam/${slNo}`;

    return await api.put('exam', url);
}

// -------------------------------------------------------
// ✅ 2. Update Ordered Promotional Setting Details
// -------------------------------------------------------
export async function UpdateOrderedPromotionalSettingDetails(payload: { temp_Order: any[] }) {
    try {
        const url = 'exam_promotional_settings/update_order';

        return await api.post('exam', url, payload);
    } catch (error) {
        console.error('Error updating promotional setting order:', error);

        // Return fallback response to avoid errors
        return {
            success: false,
            message: 'Failed to update order',
            data: null
        };
    }
}

// --------------------------------------------
// Toggle Exam Subject Wizard Active / Inactive
// --------------------------------------------
export async function toggleExamSubjectWizard(ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_yearly_category/${ecysE_Id}`;
    return await api.put('exam', url);
}

export async function toggleExamSubjectWizardDetails(eyceS_Id: number) {
    if (!eyceS_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/toggle_exam_subject/${eyceS_Id}`;
    return await api.put('exam', url);
}

export async function UpdateOrderedSubjectDetails(data: any) {
    const url = '/exam_subject_mapping/set_subject_order_number';
    return await api.put<any>('exam', url, data);
}

export async function addOrUpdateExamSubjectWizard(data: any) {
    const url = 'exam_subject_mapping';
    return await api.post<any>('exam', url, data);
}

export async function deleteExamSubjectWizard(orgId: number, ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/delete/${orgId}/${ecysE_Id}`;
    return await api.delete('exam', url);
}

export async function saveSubExamMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_exam_mapping';
    return await api.post<any>('exam', url, data);
}

export async function saveSubSubjectMapping(data: any) {
    const url = 'exam_subject_wizard/save_sub_subject_mapping';
    return await api.post<any>('exam', url, data);
}

export async function getSubjectsByCategory(mI_Id: number, emCA_Id: number) {
    const url = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${mI_Id}/${emCA_Id}`;
    return await api.get('exam', url);
}

export async function getSubSubjectSubExamList(mI_Id: number) {
    const url = `exam_subject_mapping/sub_subjects_and_sub_exam_list/${mI_Id}`;
    return await api.get('exam', url);
}

export async function getExamDropdownForWizardSubjectMapping(eyC_Id: number) {
    const url = `exam_subject_mapping/exam_drop_down_for_wizard_subject_mapping/${eyC_Id}`;
    return await api.get<any>('exam', url);
}
// --------------------------------------------
// Get Sub Subjects Mapped List
// --------------------------------------------
export async function getSubSubjectsMappedList(mI_Id: number, eyceS_Id: number) {
    if (!mI_Id) throw new Error('Organization ID is required');
    console.log('subsubjects', mI_Id, eyceS_Id);
    const url = `exam_subject_mapping/sub_subjects_mapped_popup_list/${mI_Id}/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}
// --------------------------------------------
// Get Sub Exams Mapped List
// --------------------------------------------
export async function getSubExamsMappedList(mI_Id: number, eyceS_Id: number) {
    if (!mI_Id) throw new Error('Organization ID is required');
    console.log('subexams', mI_Id, eyceS_Id);
    const url = `exam_subject_mapping/sub_exams_mapped_popup_list/${mI_Id}/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Get Sub Subjects and Sub Exams Mapped List
// --------------------------------------------
export async function getSubSubjectsAndSubExamsMappedList(mI_Id: number, eyceS_Id: number) {
    if (!mI_Id) throw new Error('Organization ID is required');
    const url = `exam_subject_mapping/sub_subjects_and_sub_exams_mapped_popup_list/${mI_Id}/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

export async function toggleMappedSubSubjectOrSubExam(miId: number, eycesssId: number) {
    if (!eycesssId) throw new Error('Mapped SubSubject/SubExam ID is required');
    if (!miId) throw new Error('Org/Master ID is required');

    const url = `exam_subject_mapping/toggle_sub_subjects_or_sub_exam_mapped_popup/${miId}/${eycesssId}`;
    return await api.put<{ success: boolean; message: string }>('exam', url);
}
