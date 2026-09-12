// Simulate getMasterQuestionInitialData
require('dotenv').config({ path: '.env.dev' });
const { api } = require('./lib/apiService');

async function test() {
    console.log('NEXT_PUBLIC_EXAM_API_BASE_URL:', process.env.NEXT_PUBLIC_EXAM_API_BASE_URL);
    try {
        const res = await api.post('exam', '/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 });
        console.log('Result status:', res.status || 'OK', 'has data:', Boolean(res.data));
        console.log('Data keys:', Object.keys(res.data || {}));
    } catch (e) {
        console.log('Error:', e);
    }
}

test();
