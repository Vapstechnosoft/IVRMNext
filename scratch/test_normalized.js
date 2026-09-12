const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function testNormalized() {
    const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
    const raw = res?.data?.data || res?.data || res || {};
    
    console.log('raw keys:', Object.keys(raw));
    console.log('getsubjectlist in raw:', raw.getsubjectlist);
    
    const normalizedData = {
        getSubjects: extractArray(raw.getSubjects || raw.getsubjectlist || raw.getsubjects || raw.getsubjectlistarray).map(
            (s) => ({
                ismS_Id: s.ismS_Id ?? s.isms_Id ?? s.ISMS_Id ?? 0,
                ismS_SubjectName: s.ismS_SubjectName ?? s.isms_SubjectName ?? s.ISMS_SubjectName ?? ''
            })
        ),
        getClass: extractArray(raw.getClass || raw.getclasslist || raw.getclass).map((c) => ({
            asmcL_Id: c.asmcL_Id ?? c.asmcl_Id ?? c.ASMCL_Id ?? 0,
            asmcL_ClassName: c.asmcL_ClassName ?? c.asmcl_ClassName ?? c.ASMCL_ClassName ?? ''
        })),
        getComplexity: extractArray(raw.getComplexity || raw.getarratcomplexities || raw.arrayComplexity).map((c) => ({
            lmsmoecX_Id: c.lmsmoecX_Id ?? c.lpmcomP_Id ?? c.lpmcomp_Id ?? c.LPMCOMP_Id ?? 0,
            lmsmoecX_ComplexityName:
                c.lmsmoecX_ComplexityName ??
                c.lpmcomP_ComplexityName ??
                c.lpmcomp_ComplexityName ??
                c.LPMCOMP_ComplexityName ??
                'Standard'
        })),
        questionList: extractArray(raw.questionList || raw.getMasterQuestiondetails || raw.masterQuestiondetails).map((q) => ({
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
    
    console.log('Normalized getSubjects length:', normalizedData.getSubjects.length, 'sample:', normalizedData.getSubjects.slice(0, 3));
    console.log('Normalized getClass length:', normalizedData.getClass.length);
    console.log('Normalized questionList length:', normalizedData.questionList.length, 'sample:', normalizedData.questionList);
}

testNormalized();
