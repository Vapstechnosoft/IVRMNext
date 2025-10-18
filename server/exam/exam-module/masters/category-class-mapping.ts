'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IAcademicYear, ICategory, ICategoryMapping, IClass, ISection } from '@/types/exam/exam-module/masters';

/* -------------------------------------------------
   GET EXAM MASTER CATEGORY (with class mapping)
-------------------------------------------------- */
export async function getExamMasterCategoryMapping(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_master_category/exam_category_class_list/30?${urlParams}`;
    const response = await api.get<ICategoryMapping>('exam', url);

    return {
        ...response
    };
}

/* -------------------------------------------------
   ADD / UPDATE MASTER CATEGORY
-------------------------------------------------- */
export async function addOrUpdateExamMasterCategory(data: ICategoryMapping) {
    const url = '/master-category';
    return await api.post<any>('exam', url, data);
}

/* -------------------------------------------------
   TOGGLE MASTER CATEGORY
-------------------------------------------------- */
export async function toggleMasterExamCategory(mi_id: number, id: number) {
    const url = `/master_category/toggle/${mi_id}/${id}`;
    return await api.put('exam', url);
}

/* -------------------------------------------------
   GET ACADEMIC YEARS
-------------------------------------------------- */
export async function getAcademicYears(): Promise<IAcademicYear[]> {
    try {
        const res = await api.getArray<IAcademicYear>('exam', '/academic-years');
        return res?.data ?? [];
    } catch (error: any) {
        console.error('Error fetching Academic Years, returning mock data:', error);
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            year: `202${i}-202${i + 1}`
        }));
    }
}
/* -------------------------------------------------
   GET CATEGORIES
-------------------------------------------------- */
export async function getCategories() {
    const res = await api.get<ICategory>('exam', '/exam_master_category/exam_master_category_drop_down_list/30');
    return res;
}
/* -------------------------------------------------
   GET CLASSES
-------------------------------------------------- */
export async function getClasses() {
    const url = 'student_application_form/master_class_drop_down_list?mi_id=30';
    return await api.get<IClass>('preadmission', url);
}

export async function getCategoryMappedSections(academicYear: string, category: string, className: string) {
    const res = await api.get<ISection>('exam', `/sections?academicYear=${academicYear}&category=${category}&class=${className}`);
    return res?.data ?? [];
}

// Getting Assigned sections for Particular AcademicYear and Class

export async function getClassMappedSections(academicYear_Id: string, category_Id: string, class_Id: string) {
    const url = `/exam_master_category/exam_category_class_section_view_by_ids/30/${category_Id}/${academicYear_Id}/${class_Id}/sections`;
    return await api.get<ISection>('exam', url);
}

/* -------------------------------------------------
   ADD / UPDATE CATEGORY-CLASS MAPPING
-------------------------------------------------- */
export async function addOrUpdateCategoryClassMapping(data: any) {
    try {
        const res = await api.post<any>('exam', '/category-class-mapping', data);
        return res;
    } catch (error: any) {
        console.error('Error adding/updating mapping, returning mock success:', error);
        return {
            success: true,
            message: 'Mock mapping added successfully',
            data
        };
    }
}
