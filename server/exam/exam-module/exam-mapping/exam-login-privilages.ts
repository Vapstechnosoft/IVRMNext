'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamLoginPrivileges, ILoginPrivilegeDetails } from '@/types/exam/exam-module/exam-mapping';

/* ===================== LIST ===================== */

export async function getExamLoginPrivileges(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_login_privileges/30?${urlParams}`;
    return await api.get<IExamLoginPrivileges>('exam', url);
}

/* ===================== VIEW DETAILS ===================== */

export async function getLoginPrivilegesDetails(elp_id: number, asmcl_id: number, asms_id: number) {
    const url = `exam_login_privileges/exm_login_privilege_view_by_id/${elp_id}/${asmcl_id}/${asms_id}`;

    try {
        const response = await api.get<ILoginPrivilegeDetails[]>('exam', url);

        if (!response || !Array.isArray(response.data)) {
            throw new Error('Invalid API response');
        }

        return {
            success: true,
            message: 'API data loaded',
            data: response.data
        };
    } catch (error) {
        console.error('View API failed → fallback used', error);

        const fallback: ILoginPrivilegeDetails[] = Array.from({ length: 5 }).map((_, i) => ({
            slno: i + 1,

            asmcL_Id: 100 + i,
            asmcL_ClassName: `Class ${i + 1}`,

            asmS_Id: 200 + i,
            asmS_SectionName: `Section ${String.fromCharCode(65 + i)}`,

            ismS_Id: 300 + i,
            ismS_SubjectName: `Subject ${i + 1}`,

            ismsS_Id: 400 + i,
            ismsS_SubSubjectName: `SubSubject ${i + 1}`,

            subSubjectId: 500 + i,
            subSubjectName: `SubSubject ${i + 1}`,

            subjectId: 600 + i,
            subjectName: `Subject ${i + 1}`,

            sectionId: 700 + i,
            sectionName: `Section ${String.fromCharCode(65 + i)}`,

            classId: 800 + i,
            className: `Class ${i + 1}`
        }));

        return {
            success: true,
            message: 'API failed, static data returned instead',
            data: fallback
        };
    }
}

/* ===================== EDIT DETAILS ===================== */

export async function getExamLoginPrivilegesEditDetails(elpId: number, asmclId: number, asmsId: number) {
    const url = `exam_login_privileges/exm_login_privilege_edit_by_id/${elpId}/${asmclId}/${asmsId}`;

    try {
        const response = await api.get<ILoginPrivilegeDetails[]>('exam', url);

        if (!response || !Array.isArray(response.data)) {
            throw new Error('Invalid Edit API response');
        }

        return {
            success: true,
            message: 'Edit details fetched successfully',
            data: response.data
        };
    } catch (error) {
        console.error('Edit API failed → fallback used', error);

        const fallback: ILoginPrivilegeDetails[] = [
            {
                slno: 1,

                asmcL_Id: asmclId,
                asmcL_ClassName: 'Class A',

                asmS_Id: asmsId,
                asmS_SectionName: 'Section A',

                ismS_Id: 101,
                ismS_SubjectName: 'Subject 1',

                ismsS_Id: 201,
                ismsS_SubSubjectName: 'SubSubject 1',
                classId: 0,
                className: '',
                sectionId: 0,
                sectionName: '',
                subjectName: '',
                subSubjectId: 0,
                subSubjectName: ''
            }
        ];

        return {
            success: true,
            message: 'Edit API failed, fallback data returned',
            data: fallback
        };
    }
}

/* ===================== SAVE ===================== */

export async function addorUpdateExamLoginPrivileges(data: any) {
    const url = '/exam_login_privileges';
    return await api.post<any>('exam', url, data);
}

/* ===================== DROPDOWNS ===================== */

export async function getClassTeacherDropdwonList() {
    return await api.get<any>('exam', '/exam_login_privileges/exm_login_privilege_classteacher_list/30');
}

export async function getUserDropdwonList() {
    return await api.get<any>('exam', '/exam_login_privileges/exm_login_privilege_user_name/30');
}

export async function getEmployeeDropdwonList() {
    return await api.get<any>('exam', '/exam_login_privileges/exm_login_privilege_employee_list/30');
}
