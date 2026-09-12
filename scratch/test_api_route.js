const axios = require('axios');

async function testApiRoute() {
    try {
        const res = await axios.get('http://localhost:3000/api/exam/master-question?MI_Id=30');
        console.log('Success:', res.data.success);
        console.log('Keys in data:', Object.keys(res.data?.data || {}));
        const questions = res.data?.data?.getMasterQuestiondetails?.$values || res.data?.data?.getMasterQuestiondetails || [];
        const subjects = res.data?.data?.getsubjectlist?.$values || res.data?.data?.getsubjectlist || [];
        console.log('Questions count from API route:', questions.length);
        console.log('Subjects count from API route:', subjects.length);
        console.log('Sample question:', questions[0]?.lpmoeQ_Question);
    } catch (e) {
        console.log('API Route error:', e.response?.status, e.message);
    }
}

testApiRoute();
