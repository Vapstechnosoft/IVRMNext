const axios = require('axios');

async function testRoute() {
    try {
        const res = await axios.get('http://localhost:3000/api/exam/master-complexity?MI_Id=30');
        console.log('Next.js API Route Status:', res.status);
        console.log('Response data:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('Error testing API route:', e.message, e.response?.data);
    }
}

testRoute();
