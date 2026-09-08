const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function testLogin(envName, baseUrl, username, password) {
    const url = `${baseUrl}/configuration/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    console.log(`\nTesting [${envName}]: ${url}`);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            // @ts-ignore
            agent
        });
        const data = await res.json();
        console.log(`Response status: ${res.status}`);
        console.log(`Response data:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`Error on ${envName}:`, e.message);
    }
}

async function run() {
    await testLogin('UAT1 Preadmission (21242)', 'https://aivrmuat1.vapssmartecampus.com:21242/api', 'alsadmin', 'password@123');
    await testLogin('UAT1 Azure AI', 'https://ivrmai.azurewebsites.net/api', 'alsadmin', 'password@123');
    await testLogin('DEV Preadmission', 'https://localhost:44325/api', 'alsadmin', 'password@123');
}

run();
