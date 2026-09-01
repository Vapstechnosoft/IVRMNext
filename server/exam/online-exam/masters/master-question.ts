'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IQuestionOption } from '@/types/exam/online-exam/masters';

function extractArray(obj: any): any[] {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

// Get Initial dropdowns and Question list
export async function getMasterQuestionInitialData(searchParams?: ApiSearchparams) {
    const session = await auth();
    let miId = 4;
    if (searchParams?.MI_Id) {
        miId = Number(searchParams.MI_Id);
    } else if (session?.mi_id) {
        miId = Number(session.mi_id);
    }

    const url = '/LP_OnlineExamFacade/getloaddata';
    try {
        const res = await api.post<any>('exam', url, { MI_Id: miId });
        return res?.data || res;
    } catch (error: any) {
        console.error('[Server] getMasterQuestionInitialData error:', error);
        return { success: false, message: error?.message || String(error) };
    }
}

// Get Question listing
export async function getMasterQuestionList(searchParams?: ApiSearchparams) {
    const urlParams = getSearchParamsUrl(searchParams ?? {});
    const url = `/LP_OnlineExamFacade/getQuestionList?${urlParams}`;
    const res = await api.get<any>('exam', url);
    if (res?.data) {
        return {
            ...res,
            data: extractArray(res.data)
        };
    }
    return res;
}

// Save or Update Question details (Tab 1)
export async function saveMasterQuestion(data: any) {
    const session = await auth();
    const miId = data.MI_Id ? Number(data.MI_Id) : session?.mi_id || 30;
    const userId = session?.user?.roleId || session?.roleId || 231;
    const url = '/LP_OnlineExamFacade/SaveMasterQuestionDetails';
    const payload = {
        MI_Id: miId,
        Userid: userId,
        LPMOEQ_Id: data.LPMOEQ_Id ?? data.LMSMOEQ_Id ?? data.lmsmoeQ_Id ?? data.lpmoeQ_Id ?? 0,
        ISMS_Id: data.ISMS_Id ?? data.ismS_Id ?? data.isms_Id ?? 0,
        ASMCL_Id: data.ASMCL_Id ?? data.asmcL_Id ?? data.asmcl_Id ?? 397,
        LPMT_Id: data.LPMT_Id ?? data.lpmT_Id ?? 16,
        LPMCOMP_Id: data.LPMCOMP_Id ?? data.LMSMOECX_Id ?? data.lmsmoecX_Id ?? data.lpmcomP_Id ?? data.lpmcomp_Id ?? 1,
        LPMOEQ_Question: data.LPMOEQ_Question ?? data.LMSMOEQ_Question ?? data.lmsmoeQ_Question ?? data.lpmoeQ_Question ?? '',
        LPMOEQ_QuestionDesc: data.LPMOEQ_QuestionDesc ?? data.LMSMOEQ_QuestionDesc ?? data.lmsmoeQ_QuestionDesc ?? '',
        LPMOEQ_Marks: Number(data.LPMOEQ_Marks ?? data.LMSMOEQ_Marks ?? data.lmsmoeQ_Marks ?? 1),
        LPMOEQ_SubjectiveFlg: Boolean(data.LPMOEQ_SubjectiveFlg ?? data.lmsmoeQ_SubjectiveFlg ?? false),
        LPMOEQ_MatchTheFollowingFlg: Boolean(data.LPMOEQ_MatchTheFollowingFlg ?? false),
        LPMOEQ_StructuralFlg: data.LPMOEQ_StructuralFlg || '',
        LPMOEQ_Answer: data.LPMOEQ_Answer || '',
        LPMOEQ_NoOfOptions: Number(data.LPMOEQ_NoOfOptions || 0),
        LPMOEQ_MFRowCount: 0,
        LPMOEQ_MFColumnCount: 0,
        classlist: (data.classlist || data.clssids || [{ ASMCL_Id: data.ASMCL_Id ?? data.asmcL_Id ?? 397 }]).map((c: any) => ({
            ASMCL_Id: typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 0)
        })),
        tempoptionsDTO: (data.tempoptionsDTO || data.questionOptions || []).map((opt: any, idx: number) => ({
            LPMOEQOA_Id: opt.LPMOEQOA_Id ?? opt.lmsmoeqoA_Id ?? 0,
            LPMOEQOA_Option: opt.LPMOEQOA_Option ?? opt.lmsmoeqoA_Option ?? opt.LMSMOEQOA_Option ?? opt.option ?? '',
            LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode ?? String.fromCharCode(65 + idx),
            LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag ?? opt.lmsmoeqoA_AnswerFlag ?? opt.LMSMOEQOA_AnswerFlag ?? false),
            LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks ?? opt.lmsmoeqoA_Marks ?? opt.LMSMOEQOA_Marks ?? 1),
            LPMOEQOA_Order: idx + 1
        })),
        tempfilesDTO: (data.tempfilesDTO || data.questionFiles || []).map((file: any) => ({
            LPMOEQF_Id: file.LPMOEQF_Id ?? 0,
            LPMOEQF_FileName: file.LPMOEQF_FileName ?? file.fileName ?? '',
            LPMOEQF_FilePath: file.LPMOEQF_FilePath ?? file.filePath ?? '',
            LPMOEQF_ActiveFlag: true
        }))
    };
    return await api.post<any>('exam', url, payload);
}

// Save Class Question Mapping (Tab 2)
export async function saveClassQuestionMapping(data: any) {
    const session = await auth();
    const miId = data.MI_Id ? Number(data.MI_Id) : session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/SaveMasterQuestionDetails';
    const payload = {
        MI_Id: miId,
        LPMOEQ_Id: data.LPMOEQ_Id ?? data.LMSMOEQ_Id ?? data.lmsmoeQ_Id ?? 0,
        classlist: (data.clssids || data.classIds || data.selectedClassIds || []).map((c: any) => ({
            ASMCL_Id: typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 0)
        }))
    };
    return await api.post<any>('exam', url, payload);
}

// Save / Update Question Options (Tab 3)
export async function saveQuestionOptions(data: any) {
    const session = await auth();
    const miId = data.MI_Id ? Number(data.MI_Id) : session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/SaveMasterQuestionDetails';
    const payload = {
        MI_Id: miId,
        ...data
    };
    return await api.post<any>('exam', url, payload);
}

// Get Options for a specific Question
export async function getQuestionOptions(questionId: number) {
    const session = await auth();
    const miId = session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/ViewMasterQuesOptions';
    return await api.post<IQuestionOption[]>('exam', url, { MI_Id: miId, LPMOEQ_Id: questionId });
}

// Toggle Question status (Activate / Deactivate)
export async function toggleMasterQuestion(questionId: number) {
    const session = await auth();
    const miId = session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/DeactivateActivateQuestion';
    return await api.post<any>('exam', url, { MI_Id: miId, LPMOEQ_Id: questionId });
}

// Delete Question
export async function deleteMasterQuestion(questionId: number) {
    const session = await auth();
    const miId = session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/DeactivateActivateQuestion';
    return await api.post<any>('exam', url, { MI_Id: miId, LPMOEQ_Id: questionId });
}
