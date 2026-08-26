'use server';

import { api, getSearchParamsUrl } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { ApiSearchparams } from '@/types';
import type { IMasterQuestionInitialData, IQuestionOption } from '@/types/exam/online-exam/masters';

function extractArray(obj: any): any[] {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

// Get Initial dropdowns and Question list
export async function getMasterQuestionInitialData(searchParams?: ApiSearchparams) {
    const session = await auth();
    const miId = searchParams?.MI_Id ? Number(searchParams.MI_Id) : session?.mi_id || 30;
    const url = '/LP_OnlineExamFacade/getloaddata';
    const res = await api.post<any>('exam', url, { MI_Id: miId });
    if (res?.data) {
        const raw = res.data;
        const normalizedData: IMasterQuestionInitialData = {
            getSubjects: extractArray(raw.getSubjects || raw.getsubjectlist || raw.getsubjects || raw.getsubjectlistarray).map(
                (s: any) => ({
                    ismS_Id: s.ismS_Id ?? s.isms_Id ?? s.ISMS_Id ?? 0,
                    ismS_SubjectName: s.ismS_SubjectName ?? s.isms_SubjectName ?? s.ISMS_SubjectName ?? ''
                })
            ),
            getClass: extractArray(raw.getClass || raw.getclasslist || raw.getclass).map((c: any) => ({
                asmcL_Id: c.asmcL_Id ?? c.asmcl_Id ?? c.ASMCL_Id ?? 0,
                asmcL_ClassName: c.asmcL_ClassName ?? c.asmcl_ClassName ?? c.ASMCL_ClassName ?? ''
            })),
            getSection: extractArray(raw.getSection || raw.getsectionlist),
            getComplexity: extractArray(raw.getComplexity || raw.getarratcomplexities || raw.arrayComplexity).map((c: any) => ({
                lmsmoecX_Id: c.lmsmoecX_Id ?? c.lpmcomP_Id ?? c.lpmcomp_Id ?? c.LPMCOMP_Id ?? 0,
                lmsmoecX_ComplexityName:
                    c.lmsmoecX_ComplexityName ??
                    c.lpmcomP_ComplexityName ??
                    c.lpmcomp_ComplexityName ??
                    c.LPMCOMP_ComplexityName ??
                    'Standard'
            })),
            questionList: extractArray(raw.questionList || raw.getMasterQuestiondetails || raw.masterQuestiondetails).map((q: any) => ({
                lmsmoeQ_Id: q.lmsmoeQ_Id ?? q.lpmoeQ_Id ?? q.LPMOEQ_Id ?? 0,
                lmsmoeQ_Question: q.lmsmoeQ_Question ?? q.lpmoeQ_Question ?? q.LPMOEQ_Question ?? '',
                lmsmoeQ_QuestionDesc: q.lmsmoeQ_QuestionDesc ?? q.lpmoeQ_QuestionDesc ?? q.LPMOEQ_QuestionDesc ?? '',
                ismS_Id: q.ismS_Id ?? q.isms_Id ?? q.ISMS_Id ?? 0,
                ismS_SubjectName: q.ismS_SubjectName ?? q.isms_SubjectName ?? q.ISMS_SubjectName ?? '',
                asmcL_Id: q.asmcL_Id ?? q.asmcl_Id ?? q.ASMCL_Id ?? 0,
                asmcL_ClassName: q.asmcL_ClassName ?? q.asmcl_ClassName ?? q.ASMCL_ClassName ?? '',
                lmsmoeQ_Marks: q.lmsmoeQ_Marks ?? q.lpmoeQ_Marks ?? q.LPMOEQ_Marks ?? 1,
                lmsmoecX_Id: q.lmsmoecX_Id ?? q.lpmcomP_Id ?? q.lpmcomp_Id ?? q.LPMCOMP_Id ?? 0,
                lmsmoecX_ComplexityName:
                    q.lmsmoecX_ComplexityName ??
                    q.lpmcomP_ComplexityName ??
                    q.lpmcomp_ComplexityName ??
                    q.LPMCOMP_ComplexityName ??
                    'Standard',
                lmsmoeQ_ActiveFlg: q.lmsmoeQ_ActiveFlg ?? q.lpmoeQ_ActiveFlg ?? q.LPMOEQ_ActiveFlg ?? true,
                countoption: q.countoption ?? q.countOption ?? 0,
                countdoc: q.countdoc ?? q.countDoc ?? 0
            }))
        };
        return {
            ...res,
            data: normalizedData
        };
    }
    return res;
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
    const url = '/LP_OnlineExamFacade/savedetails';
    const payload = {
        LPMOEQ_Id: data.LPMOEQ_Id ?? data.LMSMOEQ_Id ?? data.lmsmoeQ_Id ?? data.lpmoeQ_Id ?? 0,
        ISMS_Id: data.ISMS_Id ?? data.ismS_Id ?? data.isms_Id ?? 0,
        ASMCL_Id: data.ASMCL_Id ?? data.asmcL_Id ?? data.asmcl_Id ?? 0,
        LPMT_Id: data.LPMT_Id ?? data.lpmT_Id ?? 0,
        LPMCOMP_Id: data.LPMCOMP_Id ?? data.LMSMOECX_Id ?? data.lmsmoecX_Id ?? data.lpmcomP_Id ?? data.lpmcomp_Id ?? 1,
        LPMOEQ_Question: data.LPMOEQ_Question ?? data.LMSMOEQ_Question ?? data.lmsmoeQ_Question ?? data.lpmoeQ_Question ?? '',
        LPMOEQ_QuestionDesc: data.LPMOEQ_QuestionDesc ?? data.LMSMOEQ_QuestionDesc ?? data.lmsmoeQ_QuestionDesc ?? '',
        LPMOEQ_Marks: Number(data.LPMOEQ_Marks ?? data.LMSMOEQ_Marks ?? data.lmsmoeQ_Marks ?? 1),
        LPMOEQ_SubjectiveFlg: Boolean(data.LPMOEQ_SubjectiveFlg ?? data.lmsmoeQ_SubjectiveFlg ?? false),
        LPMOEQ_MatchTheFollowingFlg: Boolean(data.LPMOEQ_MatchTheFollowingFlg ?? false),
        LPMOEQ_StructuralFlg: data.LPMOEQ_StructuralFlg || '',
        LPMOEQ_Answer: data.LPMOEQ_Answer || '',
        tempoptionsDTO: (data.tempoptionsDTO || data.questionOptions || []).map((opt: any, idx: number) => ({
            LPMOEQOA_Id: opt.LPMOEQOA_Id ?? opt.lmsmoeqoA_Id ?? 0,
            LPMOEQOA_Option: opt.LPMOEQOA_Option ?? opt.lmsmoeqoA_Option ?? opt.option ?? '',
            LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode ?? String.fromCharCode(65 + idx),
            LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag ?? opt.lmsmoeqoA_AnswerFlag ?? false),
            LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks ?? opt.lmsmoeqoA_Marks ?? 1),
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
    const url = '/LP_OnlineExamFacade/savedataclass';
    const payload = {
        LPMOEQ_Id: data.LPMOEQ_Id ?? data.LMSMOEQ_Id ?? data.lmsmoeQ_Id ?? 0,
        clssids: (data.clssids || data.classIds || data.selectedClassIds || []).map((c: any) => ({
            ASMCL_Id: typeof c === 'number' ? c : (c.ASMCL_Id ?? c.asmcL_Id ?? 0)
        }))
    };
    return await api.post<any>('exam', url, payload);
}

// Save / Update Question Options (Tab 3)
export async function saveQuestionOptions(data: any) {
    const url = '/LP_OnlineExamFacade/savedetails1';
    return await api.post<any>('exam', url, data);
}

// Get Options for a specific Question
export async function getQuestionOptions(questionId: number) {
    const url = '/LP_OnlineExamFacade/optiondetails';
    return await api.post<IQuestionOption[]>('exam', url, { LPMOEQ_Id: questionId, LMSMOEQ_Id: questionId });
}

// Toggle Question status (Activate / Deactivate)
export async function toggleMasterQuestion(questionId: number) {
    const url = '/LP_OnlineExamFacade/deactiveparticulars';
    return await api.post<any>('exam', url, { LPMOEQ_Id: questionId, LMSMOEQ_Id: questionId });
}

// Delete Question
export async function deleteMasterQuestion(questionId: number) {
    const url = '/LP_OnlineExamFacade/Deletedetails';
    return await api.post<any>('exam', url, { LPMOEQ_Id: questionId, LMSMOEQ_Id: questionId });
}
