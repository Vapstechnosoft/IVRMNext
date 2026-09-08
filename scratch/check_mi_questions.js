const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function checkAllMiQuestions() {
    for (let mi = 1; mi <= 35; mi++) {
        try {
            const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: mi });
            const raw = res.data?.data || res.data || {};
            const questions = extractArray(raw.getMasterQuestiondetails);
            if (questions.length > 0) {
                console.log(`MI_Id: ${mi} HAS ${questions.length} QUESTIONS!`, questions.map(q => ({ id: q.lpmoeQ_Id, q: q.lpmoeQ_Question, mi: q.mI_Id })));
            }
        } catch (e) {}
    }
}

checkAllMiQuestions();
