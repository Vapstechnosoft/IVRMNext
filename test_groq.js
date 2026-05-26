const Groq = require('groq-sdk');

async function test() {
    const groq = new Groq({ apiKey: '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' });
    try {
        const _chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'hi' }],
            model: 'llama-3.1-70b-versatile',
            temperature: 0.2,
            max_tokens: 100
        });
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
