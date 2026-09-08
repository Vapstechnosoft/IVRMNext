const axios = require('axios');

async function testEndpoints() {
    console.log('--- Testing Localhost 50006 ---');
    try {
        const res1 = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Localhost 50006 POST status:', res1.status, 'data keys:', Object.keys(res1.data || {}));
    } catch (e) {
        console.log('Localhost 50006 error:', e.response?.status || e.message);
    }

    console.log('\n--- Testing Dev Server 21203 ---');
    try {
        const res2 = await axios.post('https://aivrmuat1.vapssmartecampus.com:21203/api/LP_OnlineExamFacade/getloaddata', { MI_Id: 30 }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Dev server 21203 POST status:', res2.status);
    } catch (e) {
        console.log('Dev server 21203 error:', e.response?.status || e.message);
    }
}

testEndpoints();
