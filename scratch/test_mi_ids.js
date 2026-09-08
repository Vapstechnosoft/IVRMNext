const axios = require('axios');

async function testMiIds() {
    const miIds = [30, 4, 6, 231, 1, 2, 0];
    for (const miId of miIds) {
        try {
            const res = await axios.post('http://localhost:50006/api/LP_OnlineExamFacade/getloaddata', { MI_Id: miId });
            console.log(`MI_Id: ${miId} -> Status: ${res.status}, success: ${res.data?.success}, questions count: ${res.data?.data?.getMasterQuestiondetails?.length || 0}`);
        } catch (e) {
            console.log(`MI_Id: ${miId} -> Error: ${e.response?.status || e.message}`);
        }
    }
}

testMiIds();
