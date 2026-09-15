'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IESubject, IExamSubjectGroupMapping, IExamSubjectGroupingDetails } from '@/types/exam/exam-module/exam-mapping';
import type { ICategory } from '@/types/exam/exam-module/masters';

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE NORMALIZATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function extractArrayData(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.data?.$values)) return res.data.$values;
    if (Array.isArray(res?.data?.subjectlist)) return res.data.subjectlist;
    if (Array.isArray(res?.data?.subject_list)) return res.data.subject_list;
    if (Array.isArray(res?.data?.subjects)) return res.data.subjects;
    if (Array.isArray(res?.data?.getsubject)) return res.data.getsubject;
    if (Array.isArray(res?.data?.getsubjects)) return res.data.getsubjects;
    if (Array.isArray(res?.data?.examlist)) return res.data.examlist;
    if (Array.isArray(res?.data?.exam_list)) return res.data.exam_list;
    if (Array.isArray(res?.data?.getexam)) return res.data.getexam;
    if (Array.isArray(res?.data?.categorylist)) return res.data.categorylist;
    if (Array.isArray(res?.data?.category_list)) return res.data.category_list;
    if (Array.isArray(res?.data?.getcategory)) return res.data.getcategory;
    if (Array.isArray(res?.$values)) return res.$values;
    if (Array.isArray(res?.subjectlist)) return res.subjectlist;
    if (Array.isArray(res?.subject_list)) return res.subject_list;
    if (Array.isArray(res?.subjects)) return res.subjects;
    if (Array.isArray(res?.getsubject)) return res.getsubject;
    if (Array.isArray(res?.getsubjects)) return res.getsubjects;
    if (Array.isArray(res?.examlist)) return res.examlist;
    if (Array.isArray(res?.exam_list)) return res.exam_list;
    if (Array.isArray(res?.getexam)) return res.getexam;
    if (Array.isArray(res?.categorylist)) return res.categorylist;
    if (Array.isArray(res?.category_list)) return res.category_list;
    if (Array.isArray(res?.getcategory)) return res.getcategory;
    return [];
}

function normalizeCategoryList(items: any[]): ICategory[] {
    const map = new Map<number, ICategory>();
    for (const item of items) {
        const id = Number(item?.emcA_Id ?? item?.EMCA_Id ?? item?.emca_id ?? item?.id ?? item?.Id ?? 0);
        const name = String(
            item?.emcA_CategoryName ?? item?.EMCA_CategoryName ?? item?.categoryName ?? item?.category_name ?? item?.name ?? ''
        ).trim();
        if (id > 0 && name && !map.has(id)) {
            map.set(id, {
                ...item,
                emcA_Id: id,
                emcA_CategoryName: name
            });
        }
    }
    return Array.from(map.values());
}

function normalizeExamList(items: any[]): { emE_Id: number; emE_ExamName: string }[] {
    const map = new Map<number, { emE_Id: number; emE_ExamName: string }>();
    for (const item of items) {
        const id = Number(item?.emE_Id ?? item?.EME_Id ?? item?.eme_Id ?? item?.id ?? item?.Id ?? 0);
        const name = String(item?.emE_ExamName ?? item?.EME_ExamName ?? item?.examName ?? item?.exam_name ?? item?.name ?? '').trim();
        if (id > 0 && name && !map.has(id)) {
            map.set(id, {
                emE_Id: id,
                emE_ExamName: name
            });
        }
    }
    return Array.from(map.values());
}

function normalizeSubjectList(items: any[]): IESubject[] {
    const map = new Map<number, IESubject>();
    for (const item of items) {
        const id = Number(item?.ismS_Id ?? item?.ISMS_Id ?? item?.isms_id ?? item?.id ?? item?.Id ?? 0);
        const name = String(
            item?.ismS_SubjectName ??
                item?.ISMS_SubjectName ??
                item?.subjectName ??
                item?.subject_name ??
                item?.isms_subjectname ??
                item?.name ??
                ''
        ).trim();
        const order = Number(item?.ismS_OrderFlag ?? item?.ISMS_OrderFlag ?? item?.order ?? 0);
        const apl = Boolean(item?.eyceS_AplResultFlg ?? item?.EYCES_AplResultFlg ?? false);

        if (id > 0 && name && !map.has(id)) {
            map.set(id, {
                ismS_Id: id,
                ismS_SubjectName: name,
                ismS_OrderFlag: order,
                eyceS_AplResultFlg: apl
            });
        }
    }
    return Array.from(map.values());
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED SERVER ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Get all Exam Subject Group Mappings
export async function getExamSubjectGroupMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_subject_group_mapping/?${urlParams}`;
    const response = await api.get<IExamSubjectGroupMapping>('exam', url);
    return { ...response };
}

// Add or Update Yearly Category Dates Mapping
export async function addOrUpdateYearlyCategoryDatesMapping(data: any) {
    const url = '/exam_subject_group_mapping';
    return await api.post<any>('exam', url, data);
}

// Get Category Dropdown By Academic Year
export async function getCategoryDropDownByAcademicYearlist(asmay_id: number) {
    if (!asmay_id) throw new Error('Academic Year ID is required');
    try {
        const res: any = await api.get('exam', `/exam_master_category/exam_category_drop_down_by_academic_year_list/${asmay_id}`);
        const list = normalizeCategoryList(extractArrayData(res));
        if (list.length > 0) return { success: true, data: list };
    } catch (e) {
        console.warn('Primary category endpoint failed, trying fallback:', e);
    }

    try {
        const res2: any = await api.get('exam', `/exam_master_category/category_drop_down_by_exam_year_category_list/${asmay_id}`);
        const list2 = normalizeCategoryList(extractArrayData(res2));
        if (list2.length > 0) return { success: true, data: list2 };
    } catch {
        /* silent */
    }

    try {
        const res3: any = await api.get('exam', '/exam_master_category/exam_category_list');
        const list3 = normalizeCategoryList(extractArrayData(res3));
        return { success: true, data: list3 };
    } catch {
        return { success: false, data: [] };
    }
}

export async function getCategoryDropDowByExamYearCategoryList(asmay_id: number) {
    return await getCategoryDropDownByAcademicYearlist(asmay_id);
}

// Get Exam Master Category List
export async function getExamMasterCategories() {
    const url = '/exam_master_category/exam_category_list';
    const res: any = await api.get('exam', url);
    return { success: true, data: normalizeCategoryList(extractArrayData(res)) };
}

// Get Exam Groups By Category
export async function getExamGroupsByCategory(ASMAY_Id: number, emcA_Id: number) {
    if (!emcA_Id) throw new Error('Exam Category ID is required');

    try {
        const url = `/exam_subject_group_mapping/exam_drop_down_by_exam_category_list/${ASMAY_Id}/${emcA_Id}`;
        const res: any = await api.get('exam', url);
        const list = normalizeExamList(extractArrayData(res));
        if (list.length > 0) return { success: true, data: list };
    } catch (e) {
        console.warn('Primary exam dropdown failed, trying fallback:', e);
    }

    try {
        const url2 = `/exam_master/exam_drop_down_by_year_and_category_list/${ASMAY_Id}/${emcA_Id}`;
        const res2: any = await api.get('exam', url2);
        const list2 = normalizeExamList(extractArrayData(res2));
        if (list2.length > 0) return { success: true, data: list2 };
    } catch {
        /* silent */
    }

    try {
        const res3: any = await api.get('exam', '/exam_master/exam_master_order_list');
        const list3 = normalizeExamList(extractArrayData(res3));
        return { success: true, data: list3 };
    } catch {
        return { success: false, data: [] };
    }
}

// Get Subjects By Exam Group (Individual Exam)
export async function getSubjectsForIndividualExam(emE_Id: number, asmay_id: number, emcA_Id: number) {
    if (!emE_Id) throw new Error('Exam Group ID is required');

    // 1. Primary endpoint
    try {
        const url = `/exam_subject_group_mapping/subjects_drop_down_for_individual_exam_list/${emE_Id}/${asmay_id}/${emcA_Id}`;
        const res: any = await api.get('exam', url);
        const list = normalizeSubjectList(extractArrayData(res));
        if (list.length > 0) return { success: true, data: list };
    } catch (e) {
        console.warn('Individual exam subjects primary endpoint failed, trying fallback:', e);
    }

    // 2. Category-level subjects fallback
    try {
        const url2 = `/exam_subject_mapping/subjects_by_yearly_exam_category_list/${emcA_Id}`;
        const res2: any = await api.get('exam', url2);
        const list2 = normalizeSubjectList(extractArrayData(res2));
        if (list2.length > 0) return { success: true, data: list2 };
    } catch {
        /* silent */
    }

    // 3. Master subjects dropdown list fallback
    try {
        const url3 = '/master_subject/master_subject_drop_down_list';
        const res3: any = await api.get('exam', url3);
        const list3 = normalizeSubjectList(extractArrayData(res3));
        if (list3.length > 0) return { success: true, data: list3 };
    } catch {
        /* silent */
    }

    // 4. Master subjects general fallback
    try {
        const url4 = '/master_subject';
        const res4: any = await api.get('exam', url4);
        const list4 = normalizeSubjectList(extractArrayData(res4));
        if (list4.length > 0) return { success: true, data: list4 };
    } catch {
        /* silent */
    }

    // 5. Subject groups fallback
    try {
        const url5 = '/master_subject_group/subjects_group_drop_down_by_list';
        const res5: any = await api.get('exam', url5);
        const list5 = normalizeSubjectList(extractArrayData(res5));
        return { success: true, data: list5 };
    } catch {
        return { success: false, data: [] };
    }
}

// Get Subjects For Promotional Exam
export async function getSubjectsForPromotionalExam(asmay_id: number, emcA_Id: number) {
    if (!emcA_Id) throw new Error('Exam Category ID is required');

    // 1. Primary endpoint
    try {
        const url = `/exam_subject_group_mapping/subjects_drop_down_for_promotional_exam_list/${asmay_id}/${emcA_Id}`;
        const res: any = await api.get('exam', url);
        const list = normalizeSubjectList(extractArrayData(res));
        if (list.length > 0) return { success: true, data: list };
    } catch (e) {
        console.warn('Promotional exam subjects primary endpoint failed, trying fallback:', e);
    }

    // 2. Category-level subjects fallback
    try {
        const url2 = `/exam_subject_mapping/subjects_by_yearly_exam_category_list/${emcA_Id}`;
        const res2: any = await api.get('exam', url2);
        const list2 = normalizeSubjectList(extractArrayData(res2));
        if (list2.length > 0) return { success: true, data: list2 };
    } catch {
        /* silent */
    }

    // 3. Master subjects dropdown list fallback
    try {
        const url3 = '/master_subject/master_subject_drop_down_list';
        const res3: any = await api.get('exam', url3);
        const list3 = normalizeSubjectList(extractArrayData(res3));
        if (list3.length > 0) return { success: true, data: list3 };
    } catch {
        /* silent */
    }

    // 4. Master subjects general fallback
    try {
        const url4 = '/master_subject';
        const res4: any = await api.get('exam', url4);
        const list4 = normalizeSubjectList(extractArrayData(res4));
        if (list4.length > 0) return { success: true, data: list4 };
    } catch {
        /* silent */
    }

    return { success: false, data: [] };
}

export async function getExamSubjectGroupMappingDetails(compulsary_flag: string, asmay_id: number, esG_Id: number) {
    const url = `/exam_subject_group_mapping/exam_subjet_group_mapping_details_by_ids/${compulsary_flag}/${asmay_id}/${esG_Id}`;
    return await api.get<IExamSubjectGroupingDetails>('exam', url);
}

export async function toggleExamSubjectGroupMappingSubject(esgs_id: number) {
    const url = `/exam_subject_group_mapping/toggle_exam_subjet_group_mapping/${esgs_id}`;
    return await api.put('exam', url);
}
