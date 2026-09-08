const axios = require('axios');

async function testPageHtml() {
    try {
        const res = await axios.get('http://localhost:3000/Exam/online-exam/masters/master-question?MI_Id=30');
        console.log('Page HTTP status:', res.status);
        console.log('Contains Master Question Bank:', res.data.includes('Master Question Bank'));
        console.log('Contains Kannada:', res.data.includes('Kannada'));
    } catch (e) {
        console.log('Page error:', e.response?.status || e.message);
    }
}

testPageHtml();
