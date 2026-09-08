const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function testExtraction() {
    const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
    const raw = res.data?.data || res.data || {};
    
    console.log('getMasterQuestiondetails:', extractArray(raw.getMasterQuestiondetails));
    console.log('getsubjectlist:', extractArray(raw.getsubjectlist));
    console.log('getclasslist:', extractArray(raw.getclasslist));
    console.log('getarratcomplexities:', extractArray(raw.getarratcomplexities));
}

testExtraction();
