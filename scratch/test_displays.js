const CMS_URL = 'http://172.16.10.77:65501';
const CLIENT_ID = 'b95687d62ba696e7e3c74a42e8a35d4fa2d34ddb';
const CLIENT_SECRET =
    '8d1095453207f575f7cd94011c126fcf6900df023700e4b54bed92e7ea369cfe9728de52d765c1324926c512478c4d5b9bfa300f9cf7b14d2f050b13f6a1a5a513dde328f668bef8ee45cd3673bbf24e30fdcd5a8fbfd5d885d7dc73d850611f21e6a5a93105bcc7c9d6a569e070d49d9438947def3da7371149887f27a918';

async function getAccessToken() {
    console.log('Getting access token...');
    const res = await fetch(`${CMS_URL}/api/authorize/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        })
    });

    if (!res.ok) {
        throw new Error(`Xibo auth failed: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    return payload.access_token;
}

async function test() {
    try {
        const token = await getAccessToken();
        console.log('Token obtained:', token ? token.substring(0, 10) + '...' : 'none');

        const res = await fetch(`${CMS_URL}/api/display`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            }
        });

        if (!res.ok) {
            console.error('Failed to get displays:', res.status, await res.text());
            return;
        }

        const data = await res.json();
        console.log('Displays response structure (keys):', Object.keys(data));
        console.log('Is array?', Array.isArray(data));
        if (Array.isArray(data)) {
            console.log('Length:', data.length);
            if (data.length > 0) {
                console.log('First item sample:', JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log('Object preview:', JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
