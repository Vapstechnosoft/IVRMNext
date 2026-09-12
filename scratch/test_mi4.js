const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function testMi4() {
    const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 4 });
    const raw = res.data?.data || res.data || {};
    console.log('MI_Id: 4 getsubjectlist count:', extractArray(raw.getsubjectlist).length);
    console.log('MI_Id: 4 getclasslist count:', extractArray(raw.getclasslist).length);
    console.log('MI_Id: 4 getMasterQuestiondetails count:', extractArray(raw.getMasterQuestiondetails).length);
    console.log('MI_Id: 4 sample subjects:', extractArray(raw.getsubjectlist).slice(0, 5));
}

testMi4();
