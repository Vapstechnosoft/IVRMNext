const Groq = require('groq-sdk');

async function test() {
    const groq = new Groq({ apiKey: process.env.chat_Groq_api_key || process.env.GROQ_API_KEY || '' });
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'hi' }],
            model: 'openai/gpt-oss-120b',
            temperature: 0.2,
            max_tokens: 100
        });
        console.log('Success:', chatCompletion.choices[0]?.message?.content);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
