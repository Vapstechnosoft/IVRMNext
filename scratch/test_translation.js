const query = 'ಪರೀಕ್ಷೆ'; // Kannada for Exam

async function translateText(query) {
    if (!query || !query.trim()) return { text: '' };

    try {
        const normalized = query.normalize('NFC').trim();
        const key = 'ae1549ade3594811b31d5b7eedf42758';
        const endpoint = 'https://api.cognitive.microsofttranslator.com';
        const location = 'centralindia';
        const url = `${endpoint}/translate?api-version=3.0&to=en`;
        const body = [{ Text: normalized }];

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            const translatedText = jsonResponse?.[0]?.translations?.[0]?.text;
            return { success: true, text: translatedText };
        } else {
            return { success: false, text: normalized };
        }
    } catch (error) {
        return { success: false, text: query };
    }
}

async function test() {
    const res = await translateText(query);
    console.log('Result:', res);
}

test();
