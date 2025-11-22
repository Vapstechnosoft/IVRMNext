'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamWiseRemarksGrid, IExamWiseStudentRemarksStudent } from '@/types/exam/exam-module/exam-mapping';

// -------------------------------
// 1) GET – Student Data Grid
// -------------------------------
export async function getExamWiseRemarksDataGrid(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = 'exam_master_remark/studentdatagrid?MI_Id=30&User_Id=1&roleid=18';
    return await api.get<IExamWiseRemarksGrid>('exam', url);
}

// -------------------------------
// 2) GET – Search Student Details
// -------------------------------
export async function getStudentDetails(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `exam_master_remark/searchstudentdeatils?${urlParams}`;
    const response = await api.get<IExamWiseStudentRemarksStudent>('exam', url);

    return {
        ...response
    };
}

// -------------------------------
// 3) POST – Add or Update Exam Student Remarks
// -------------------------------
export async function addOrUpdateExamStudentRemarks(data: any) {
    const url = '/exam_master_remark/addorupdateexamstudentremarks';
    return await api.post<any>('exam', url, data);
}
