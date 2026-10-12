'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getExamSubjectWizard(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_subject_mapping?${urlParams}`;
    console.info(url);
    return await api.get<IExamSubjectWizard>('exam', url);
}

// --------------------------------------------
// Get Categories For Exam Subject Wizard
// --------------------------------------------
export async function getExamSubjectWizardCategories(asmay_id: number) {
    if (!asmay_id) return { success: true, data: [] };

    const extractArray = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.$values)) return res.data.$values;
        if (Array.isArray(res?.$values)) return res.$values;

        const candidateKeys = [
            'category_list',
            'categorylist',
            'categoryList',
            'catlist',
            'exam_category_list',
            'exam_category_drop_down_list',
            'mastercategorylist',
            'master_category_list',
            'year_category_list',
            'year_categorylist',
            'get_category',
            'category_dropdown'
        ];

        for (const k of candidateKeys) {
            if (Array.isArray(res?.[k])) return res[k];
            if (Array.isArray(res?.[k]?.$values)) return res[k].$values;
            if (Array.isArray(res?.data?.[k])) return res.data[k];
            if (Array.isArray(res?.data?.[k]?.$values)) return res.data[k].$values;
        }

        const target = res?.data ?? res;
        if (target && typeof target === 'object') {
            for (const key of Object.keys(target)) {
                const val = target[key];
                if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
                    if (
                        val[0]?.emcA_CategoryName ||
                        val[0]?.EMCA_CategoryName ||
                        val[0]?.eyC_CategoryName ||
                        val[0]?.categoryName ||
                        val[0]?.emcA_Id ||
                        val[0]?.eyC_Id
                    ) {
                        return val;
                    }
                }
            }
        }
        return [];
    };

    // Query all relevant endpoints in parallel so that categories created anywhere
    // (Master Category, Category Class Mapping, Yearly Category Dates Mapping) are all available
    const [res1, res2, res3, res4] = await Promise.allSettled([
        api.get('exam', `/exam_master_category/exam_category_drop_down_by_academic_year_list/${asmay_id}`),
        api.get('exam', `/exam_master_category/category_drop_down_by_exam_year_category_list/${asmay_id}`),
        api.get('exam', '/exam_master_category/exam_master_category_drop_down_list/'),
        api.get('exam', '/exam_master_category/exam_category_list')
    ]);

    const list1 = res1.status === 'fulfilled' ? extractArray(res1.value) : [];
    const list2 = res2.status === 'fulfilled' ? extractArray(res2.value) : [];
    const list3 = res3.status === 'fulfilled' ? extractArray(res3.value) : [];
    const list4 = res4.status === 'fulfilled' ? extractArray(res4.value) : [];

    // Order matters: yearly mapped categories first (they have real eyC_Id), followed by year categories, then masters
    const combinedRaw = [...list2, ...list1, ...list3, ...list4];

    const categoryMap = new Map<string, { eyC_Id: number; emcA_Id: number; emcA_CategoryName: string }>();

    for (const c of combinedRaw) {
        const rawEmcaId = Number(c.emcA_Id ?? c.emcA_ID ?? c.EMCA_Id ?? 0);
        const rawEycId = Number(c.eyC_Id ?? c.eyc_Id ?? c.EYC_Id ?? 0);
        const name = String(
            c.emcA_CategoryName ??
                c.EMCA_CategoryName ??
                c.eyC_CategoryName ??
                c.EYC_CategoryName ??
                c.categoryName ??
                c.CategoryName ??
                c.category_name ??
                c.name ??
                ''
        ).trim();

        if (!name) continue;

        const emcaId = rawEmcaId || rawEycId;
        const eycId = rawEycId || rawEmcaId;
        if (emcaId <= 0 && eycId <= 0) continue;

        const nameKey = name.toLowerCase();
        const idKey = emcaId > 0 ? `id_${emcaId}` : `eyc_${eycId}`;

        // Find existing by name or emcaId
        const existingKey = categoryMap.has(idKey)
            ? idKey
            : Array.from(categoryMap.keys()).find((k) => categoryMap.get(k)?.emcA_CategoryName.toLowerCase() === nameKey);

        if (existingKey) {
            const existing = categoryMap.get(existingKey)!;
            // Upgrade with more specific eyC_Id or emcA_Id if available
            if (rawEycId > 0 && existing.eyC_Id <= 0) {
                existing.eyC_Id = rawEycId;
            }
            if (rawEmcaId > 0 && existing.emcA_Id <= 0) {
                existing.emcA_Id = rawEmcaId;
            }
        } else {
            categoryMap.set(idKey, {
                eyC_Id: eycId,
                emcA_Id: emcaId,
                emcA_CategoryName: name
            });
        }
    }

    const normalized = Array.from(categoryMap.values());
    return { success: true, data: normalized };
}

// --------------------------------------------
// Get Exam Subject Wizard Details By ID
// --------------------------------------------

export async function getExamSubjectWizardDetails(ecycE_Id: number) {
    if (!ecycE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_mapping/grade_and_exam_subject_mapping_list/${ecycE_Id}`;
    return await api.get<IExamSubjectWizard>('exam', url);
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

import { auth } from '@/lib/auth';

export async function addOrUpdateExamSubjectWizard(data: any) {
    const session = await auth();
    const payload = {
        ...data,
        MI_Id: data.MI_Id || (session?.mi_id ? Number(session.mi_id) : 0),
        UserId: data.UserId || (session?.user_id ? Number(session.user_id) : 0)
    };
    const url = 'exam_subject_mapping';
    return await api.post<any>('exam', url, payload);
}

export async function deleteExamSubjectWizard(ecysE_Id: number) {
    if (!ecysE_Id) throw new Error('Exam Subject Wizard ID is required');
    const url = `exam_subject_wizard/delete/${ecysE_Id}`;
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

export async function getSubjectsByCategory(emCA_Id: number, alternativeId?: number) {
    if (!emCA_Id && !alternativeId) return { success: true, data: [] };
    const primaryId = emCA_Id || alternativeId!;
    try {
        const url = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${primaryId}`;
        const res: any = await api.get('exam', url);
        const data = res?.data ?? res;
        const hasData = Array.isArray(data)
            ? data.length > 0
            : Boolean(
                  data?.subject_list?.length ||
                      data?.subjectlist?.length ||
                      data?.subjects?.length ||
                      data?.$values?.length ||
                      data?.data?.$values?.length
              );
        if (hasData || !alternativeId || alternativeId === primaryId) {
            return res;
        }
    } catch (e) {
        if (!alternativeId || alternativeId === primaryId) throw e;
    }

    if (alternativeId && alternativeId !== primaryId) {
        const altUrl = `exam_subject_mapping/subjects_by_yearly_exam_category_list/${alternativeId}`;
        return await api.get('exam', altUrl);
    }
}

export async function getSubSubjectSubExamList() {
    const url = 'exam_subject_mapping/sub_subjects_and_sub_exam_list';
    return await api.get('exam', url);
}

export async function getExamDropdownForWizardSubjectMapping(eyC_Id: number, alternativeId?: number) {
    if (!eyC_Id && !alternativeId) return { success: true, data: [] };
    const primaryId = eyC_Id || alternativeId!;
    try {
        const url = `exam_subject_mapping/exam_drop_down_for_wizard_subject_mapping/${primaryId}`;
        const res: any = await api.get<any>('exam', url);
        const data = res?.data ?? res;
        const hasData = Array.isArray(data)
            ? data.length > 0
            : Boolean(data?.exam_list?.length || data?.exams?.length || data?.$values?.length || data?.data?.$values?.length);
        if (hasData || !alternativeId || alternativeId === primaryId) {
            return res;
        }
    } catch (e) {
        if (!alternativeId || alternativeId === primaryId) throw e;
    }

    if (alternativeId && alternativeId !== primaryId) {
        const altUrl = `exam_subject_mapping/exam_drop_down_for_wizard_subject_mapping/${alternativeId}`;
        return await api.get<any>('exam', altUrl);
    }
}
// --------------------------------------------
// Get Sub Subjects Mapped List
// --------------------------------------------
export async function getSubSubjectsMappedList(eyceS_Id: number) {
    const url = `exam_subject_mapping/sub_subjects_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}
// --------------------------------------------
// Get Sub Exams Mapped List
// --------------------------------------------
export async function getSubExamsMappedList(eyceS_Id: number) {
    console.info('subexams', eyceS_Id);
    const url = `exam_subject_mapping/sub_exams_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

// --------------------------------------------
// Get Sub Subjects and Sub Exams Mapped List
// --------------------------------------------
export async function getSubSubjectsAndSubExamsMappedList(eyceS_Id: number) {
    const url = `exam_subject_mapping/sub_subjects_and_sub_exams_mapped_popup_list/${eyceS_Id}`;
    return await api.get<any>('exam', url);
}

export async function toggleMappedSubSubjectOrSubExam(eycesssId: number) {
    if (!eycesssId) throw new Error('Mapped SubSubject/SubExam ID is required');

    const url = `exam_subject_mapping/toggle_sub_subjects_or_sub_exam_mapped_popup/${eycesssId}`;
    return await api.put<{ success: boolean; message: string }>('exam', url);
}
