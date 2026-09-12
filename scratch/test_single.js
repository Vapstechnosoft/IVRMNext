const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function testSingle() {
    const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
    const raw = res.data?.data || res.data || {};
    const questions = extractArray(raw.getMasterQuestiondetails);
    console.log('Result for MI_Id 30 -> questions count:', questions.length);
    console.log('Sample question:', questions[0]);
}

testSingle();
