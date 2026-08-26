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
    try {
        const session = await auth();
        let miId = 4;
        if (searchParams?.MI_Id) {
            miId = Number(searchParams.MI_Id);
        } else if (session?.mi_id) {
            miId = Number(session.mi_id);
        }

        console.log(`[OnlineExam] Fetching master question initial data for MI_Id: ${miId}`);
        const url = '/LP_OnlineExamFacade/getloaddata';
        const res = await api.post<any>('exam', url, { MI_Id: miId });
        const raw = res?.data?.data || res?.data || res || {};

        const rawSubjects = extractArray(raw.getSubjects || raw.getsubjectlist || raw.getsubjects || raw.getsubjectlistarray);
        const rawClasses = extractArray(raw.getClass || raw.getclasslist || raw.getclass);
        const rawComplexities = extractArray(raw.getComplexity || raw.getarratcomplexities || raw.arrayComplexity);
        const rawQuestions = extractArray(
            raw.questionList || raw.getMasterQuestiondetails || raw.masterQuestiondetails || raw.getmasterquestiondetails
        );

        const normalizedData: IMasterQuestionInitialData = {
            getSubjects: rawSubjects.map((s: any) => ({
                ismS_Id: Number(s.ismS_Id ?? s.isms_Id ?? s.ISMS_Id ?? s.id ?? 0),
                ismS_SubjectName: String(s.ismS_SubjectName ?? s.isms_SubjectName ?? s.ISMS_SubjectName ?? s.subjectName ?? s.name ?? '')
            })),
            getClass: rawClasses.map((c: any) => ({
                asmcL_Id: Number(c.asmcL_Id ?? c.asmcl_Id ?? c.ASMCL_Id ?? c.id ?? 0),
                asmcL_ClassName: String(c.asmcL_ClassName ?? c.asmcl_ClassName ?? c.ASMCL_ClassName ?? c.className ?? c.name ?? '')
            })),
            getSection: extractArray(raw.getSection || raw.getsectionlist),
            getComplexity: rawComplexities.map((c: any) => ({
                lmsmoecX_Id: Number(c.lmsmoecX_Id ?? c.lpmcomP_Id ?? c.lpmcomp_Id ?? c.LPMCOMP_Id ?? c.id ?? 0),
                lmsmoecX_ComplexityName: String(
                    c.lmsmoecX_ComplexityName ??
                        c.lpmcomP_ComplexityName ??
                        c.lpmcomp_ComplexityName ??
                        c.LPMCOMP_ComplexityName ??
                        c.name ??
                        'Standard'
                )
            })),
            questionList: rawQuestions.map((q: any) => ({
                lmsmoeQ_Id: Number(q.lmsmoeQ_Id ?? q.lpmoeQ_Id ?? q.LPMOEQ_Id ?? q.id ?? 0),
                lmsmoeQ_Question: String(q.lmsmoeQ_Question ?? q.lpmoeQ_Question ?? q.LPMOEQ_Question ?? q.question ?? ''),
                lmsmoeQ_QuestionDesc: String(
                    q.lmsmoeQ_QuestionDesc ?? q.lpmoeQ_QuestionDesc ?? q.LPMOEQ_QuestionDesc ?? q.questionDesc ?? ''
                ),
                ismS_Id: Number(q.ismS_Id ?? q.isms_Id ?? q.ISMS_Id ?? 0),
                ismS_SubjectName: String(q.ismS_SubjectName ?? q.isms_SubjectName ?? q.ISMS_SubjectName ?? ''),
                asmcL_Id: Number(q.asmcL_Id ?? q.asmcl_Id ?? q.ASMCL_Id ?? 0),
                asmcL_ClassName: String(q.asmcL_ClassName ?? q.asmcl_ClassName ?? q.ASMCL_ClassName ?? ''),
                lmsmoeQ_Marks: Number(q.lmsmoeQ_Marks ?? q.lpmoeQ_Marks ?? q.LPMOEQ_Marks ?? 1),
                lmsmoecX_Id: Number(q.lmsmoecX_Id ?? q.lpmcomP_Id ?? q.lpmcomp_Id ?? q.LPMCOMP_Id ?? 0),
                lmsmoecX_ComplexityName: String(
                    q.lmsmoecX_ComplexityName ??
                        q.lpmcomP_ComplexityName ??
                        q.lpmcomp_ComplexityName ??
                        q.LPMCOMP_ComplexityName ??
                        'Standard'
                ),
                lmsmoeQ_ActiveFlg: Boolean(q.lmsmoeQ_ActiveFlg ?? q.lpmoeQ_ActiveFlg ?? q.LPMOEQ_ActiveFlg ?? true),
                countoption: Number(q.countoption ?? q.countOption ?? 0),
                countdoc: Number(q.countdoc ?? q.countDoc ?? 0)
            }))
        };

        console.log(
            `[OnlineExam] Loaded: ${normalizedData.getSubjects.length} subjects, ${normalizedData.getClass.length} classes, ${normalizedData.questionList.length} questions`
        );

        return {
            success: true,
            data: normalizedData
        };
    } catch (err: any) {
        console.error('[OnlineExam] Error in getMasterQuestionInitialData:', err);
        return {
            success: false,
            message: err?.message || 'Error loading master question data',
            data: {
                getSubjects: [],
                getClass: [],
                getSection: [],
                getComplexity: [],
                questionList: []
            }
        };
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
    const url = '/LP_OnlineExamFacade/savedetails';
    const payload = {
        MI_Id: miId,
        UserId: userId,
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
