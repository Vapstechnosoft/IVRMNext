'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';

// --------------------------------------------
// Get All Exam Subject Wizard Records
// --------------------------------------------
export async function getStudentsForSubjectMapping(params: {
    MI_Id: number;
    ASMAY_Id: number;
    ASMCL_Id: number;
    ASMS_Id: number;
    EME_Id: number;
    EMCA_Id: number;
    Left_Flag: boolean;
    Deactive_Flag: boolean;
    EMG_Id: number;
}) {
    const query = new URLSearchParams({
        MI_Id: String(params.MI_Id),
        ASMAY_Id: String(params.ASMAY_Id),
        ASMCL_Id: String(params.ASMCL_Id),
        ASMS_Id: String(params.ASMS_Id),
        EME_Id: String(params.EME_Id),
        EMCA_Id: String(params.EMCA_Id),
        Left_Flag: String(params.Left_Flag),
        Deactive_Flag: String(params.Deactive_Flag),
        EMG_Id: String(params.EMG_Id)
    }).toString();
    const url = `student_mapping/student_details?${query}`;
    // const url = `student_mapping/student_details?MI_Id=30&ASMAY_Id=231&ASMCL_Id=414&ASMS_Id=164&EME_Id=0&EMCA_Id=213&Left_Flag=true&Deactive_Flag=true&EMG_Id=118`;
    return await api.get<StudentSubjectData>('exam', url);
}
export interface StudentSubjectData {
    amsT_Id?: number;
    amsT_FirstName?: string;
    amsT_AdmNo?: string;
    amaY_RollNo?: number;
    sub_list?: SubjectItem[];
    xyz?: boolean;
    sub_list_view?: SubjectItem[];
    remove_flag?: number;
}

export interface SubjectItem {
    id?: number;
    name?: string;
    abc?: boolean;
}
