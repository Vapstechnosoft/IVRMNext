'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamLoginPrivileges, ILoginPrivilegeDetails } from '@/types/exam/exam-module/exam-mapping';

export async function getExamLoginPrivileges(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_login_privileges/30?${urlParams}`;
    console.log(url);
    return await api.get<IExamLoginPrivileges>('exam', url);
}

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
        console.error('API Failed → Returning static fallback data', error);
        const fallback: ILoginPrivilegeDetails[] = Array.from({ length: 10 }).map((_, i) => ({
            slno: i + 1,

            classId: 100 + i,
            className: `Class ${i + 1}`,

            sectionId: 200 + i,
            sectionName: `Section ${String.fromCharCode(65 + (i % 5))}`,

            subjectId: 300 + i,
            subjectName: `Subject ${i + 1}`,

            subSubjectId: 400 + i,
            subSubjectName: `SubSubject ${i + 1}`
        }));

        return {
            success: true,
            message: 'API failed, static data returned instead',
            data: fallback
        };
    }
}

export async function addorUpdateExamLoginPrivileges(data: any) {
    const url = '/exam_master/add_or_update_exam_master_paper_type';
    return await api.post<any>('exam', url, data);
}
