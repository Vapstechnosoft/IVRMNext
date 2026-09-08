const axios = require('axios');

async function testNextServer() {
    try {
        console.log('Calling http://localhost:3000/api/test-exam ...');
        const res = await axios.get('http://localhost:3000/api/test-exam');
        console.log('Result:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.log('Error status:', e.response?.status);
        console.log('Error data:', JSON.stringify(e.response?.data, null, 2) || e.message);
    }
}

testNextServer();
