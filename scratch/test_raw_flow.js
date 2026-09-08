const axios = require('axios');

function extractArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

async function testRawFlow() {
    const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
    const directRes = res.data; // this is what api.post returns
    const loadData = directRes?.data || directRes;
    
    console.log('directRes.data keys:', Object.keys(directRes?.data || {}));
    console.log('loadData keys:', Object.keys(loadData));
    
    const subjects = extractArray(loadData.getsubjectlist || loadData.getSubjects);
    const classes = extractArray(loadData.getclasslist || loadData.getClass);
    const questions = extractArray(loadData.getMasterQuestiondetails || loadData.questionList);
    const complexities = extractArray(loadData.getarratcomplexities || loadData.getComplexity);
    
    console.log('Subjects found:', subjects.length, subjects.slice(0, 2));
    console.log('Classes found:', classes.length);
    console.log('Questions found:', questions.length, questions);
    console.log('Complexities found:', complexities.length, complexities);
}

testRawFlow();
