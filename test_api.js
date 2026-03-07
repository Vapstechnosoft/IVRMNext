const axios = require('axios');

async function testApi() {
    const payload = {
        asmaY_Id: 231,
        ivrmrT_Id: 18,
        hrmE_Id: 0,
        userflag: 'ClassTeacher',
        amsT_Id: 24400,
        userhrmE_Id: 0,
        asmS_Id: 0,
        asmsid: 0,
        asmclid: 0,
        rolename: 'Student',
        roleflg: 'Student'
    };

    try {
        const res = await axios.post('https://ivrm-dev-portal-api.azurewebsites.net/api/IVRM_Interactions/get-details-of-interaction', payload);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.log(error);
    }
}

testApi();
