'use server';

import { type ApiResponse, api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IAcademicYear, ICategory, ICategoryMapping, IClass, ISection } from '@/types/exam/exam-module/masters';

/* -------------------------------------------------
   GET EXAM MASTER CATEGORY (with class mapping)
-------------------------------------------------- */
export async function getExamMasterCategoryMapping(searchParams?: ApiSearchparams): Promise<ApiResponse<ICategoryMapping[]>> {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/master_category/30?${urlParams}`;

    try {
        const response = await api.getArray<ICategoryMapping>(url);

        return {
            ...response
        };
    } catch (error: any) {
        console.error('Error fetching Master Categories, returning mock data:', error);

        // ✅ Return mock data with all required fields
        const mockData: ICategoryMapping[] = Array.from({ length: 10 }).map((_, i) => ({
            ex_Id: i + 1,
            ex_AcademicYear: `202${i}-202${i + 1}`,
            ex_CategoryName: `Category ${i + 1}`,
            ex_ClassName: `Class ${i + 1}`,
            ex_CCEPromotionApplicableFlag: i % 2,
            ex_IsActiveFlag: i % 2 === 0
        }));

        return {
            success: true,
            message: 'Mock Category-Class Mappings Loaded Successfully',
            data: mockData
        };
    }
}

/* -------------------------------------------------
   ADD / UPDATE MASTER CATEGORY
-------------------------------------------------- */
export async function addOrUpdateExamMasterCategory(data: ICategoryMapping) {
    const url = '/master-category';
    return await api.post<any>(url, data);
}

/* -------------------------------------------------
   TOGGLE MASTER CATEGORY
-------------------------------------------------- */
export async function toggleMasterExamCategory(mi_id: number, id: number) {
    const url = `/master_category/toggle/${mi_id}/${id}`;
    return await api.put(url);
}

/* -------------------------------------------------
   GET ACADEMIC YEARS
-------------------------------------------------- */
export async function getAcademicYears(): Promise<IAcademicYear[]> {
    try {
        const res = await api.getArray<IAcademicYear>('/academic-years');
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
export async function getCategories(): Promise<ICategory[]> {
    try {
        const res = await api.getArray<ICategory>('/categories');
        return res?.data ?? [];
    } catch (error: any) {
        console.error('Error fetching Categories, returning mock data:', error);
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            name: `Category ${i + 1}`
        }));
    }
}

/* -------------------------------------------------
   GET CLASSES
-------------------------------------------------- */
export async function getClasses(): Promise<IClass[]> {
    try {
        const res = await api.getArray<IClass>('/classes');
        return res?.data ?? [];
    } catch (error: any) {
        console.error('Error fetching Classes, returning mock data:', error);
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            name: `Class ${i + 1}`
        }));
    }
}

/* -------------------------------------------------
   GET SECTIONS BY MAPPING with categoryId,academicYear,class
-------------------------------------------------- */
export async function getCategoryMappedSections(academicYear: string, category: string, className: string): Promise<ISection[]> {
    try {
        const res = await api.getArray<ISection>(`/sections?academicYear=${academicYear}&category=${category}&class=${className}`);
        return res?.data ?? [];
    } catch (error: any) {
        console.error('Error fetching sections, returning mock data:', error);
        return Array.from({ length: 5 }).map((_, i) => ({
            id: i + 1,
            name: `Section ${i + 1}`
        }));
    }
}

// Getting Assigned sections for Particular AcademicYear and Class

export async function getClassMappedSections(academicYear_Id: string, class_Id: string): Promise<ISection[]> {
    try {
        const res = await api.getArray<ISection>(`/category-class-mapping/${academicYear_Id}/${class_Id}/sections`);
        return res?.data ?? [];
    } catch (error: any) {
        console.error(`Error fetching assigned sections for Academic Year ${academicYear_Id} amd classId ${class_Id}:`, error);

        // Return 3 mock sections if API fails
        const mockData: ISection[] = Array.from({ length: 3 }).map((_, i) => ({
            id: i + 1,
            name: `Assigned Section ${i + 1}`
        }));

        return mockData;
    }
}

/* -------------------------------------------------
   ADD / UPDATE CATEGORY-CLASS MAPPING
-------------------------------------------------- */
export async function addOrUpdateCategoryClassMapping(data: any) {
    try {
        const res = await api.post<any>('/category-class-mapping', data);
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
