'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import type { ApiSearchparams } from '@/types';
import type { IMasterQuestionCollegeInitialData, IQuestionOption } from '@/types/exam/online-exam/masters';

// Get Initial dropdowns and College Question list
export async function getMasterQuestionCollegeInitialData(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/MasterQuestionCollege/getloaddata?${urlParams}`;
    const res = await api.get<any>('exam', url);
    if (res && res.data) {
        const raw = res.data;
        const normalizedData: IMasterQuestionCollegeInitialData = {
            getCourse: raw.getCourse || raw.getcourselist || [],
            getBranch: raw.getBranch || raw.getbranchlist || [],
            getSemester: raw.getSemester || raw.getsemesterlist || [],
            getSubjects: raw.getSubjects || raw.getsubjectlist || raw.getsubjects || [],
            getComplexity: raw.getComplexity || raw.getarratcomplexities || raw.arrayComplexity || [],
            questionList: raw.questionList || raw.getMasterQuestiondetails || raw.masterQuestiondetails || []
        };
        return {
            ...res,
            data: normalizedData
        };
    }
    return res;
}

// Save or Update College Question details (Tab 1)
export async function saveMasterQuestionCollege(data: any) {
    const url = '/MasterQuestionCollege/savedetails';
    return await api.post<any>('exam', url, data);
}

// Save Branch Question Mapping (Tab 2)
export async function saveBranchQuestionMapping(data: any) {
    const url = '/MasterQuestionCollege/savedataclass';
    return await api.post<any>('exam', url, data);
}

// Save / Update College Question Options (Tab 3)
export async function saveQuestionOptionsCollege(data: any) {
    const url = '/MasterQuestionCollege/savedetails1';
    return await api.post<any>('exam', url, data);
}

// Get Options for a specific College Question
export async function getQuestionOptionsCollege(questionId: number) {
    const url = '/MasterQuestionCollege/optiondetails';
    return await api.post<IQuestionOption[]>('exam', url, { LMSMCQ_Id: questionId });
}

// Toggle College Question status
export async function toggleMasterQuestionCollege(questionId: number) {
    const url = '/MasterQuestionCollege/Deletedetails';
    return await api.post<any>('exam', url, { LMSMCQ_Id: questionId });
}
