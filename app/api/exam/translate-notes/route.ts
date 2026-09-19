import { standardizeNoteMarkdown } from '@/lib/notemaker-cleaner';
import Groq from 'groq-sdk';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const groq = new Groq({
    apiKey: process.env.note_Groq_api_key || process.env.assistant_groq_key || ''
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { summary, notes, targetLanguage } = body;

        if (!targetLanguage || targetLanguage === 'English') {
            return NextResponse.json({ summary, notes });
        }

        if (!summary && !notes) {
            return NextResponse.json({ error: 'No content provided for translation' }, { status: 400 });
        }

        const prompt = `
You are an expert academic translator.
Translate the following academic study content into ${targetLanguage}.

CRITICAL REQUIREMENTS:
1. Maintain exact Markdown formatting: preserve all bold markers (**bold**), bullet points (- or •), section headers (# or capitalized headings), and line breaks.
2. Translate technical terms and explanations clearly and fluently into ${targetLanguage}.
3. Return the output in the EXACT structure:

---SUMMARY---
<translated summary here>

---NOTES---
<translated notes here>

Content to Translate:
${summary ? `---SUMMARY---\n${summary}\n` : ''}
${notes ? `---NOTES---\n${notes}\n` : ''}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are a professional academic translator. You translate educational content into ${targetLanguage} while strictly preserving Markdown formatting (**bold**, list markers, headers).`
                },
                { role: 'user', content: prompt }
            ],
            model: 'openai/gpt-oss-120b',
            temperature: 0.3,
            max_tokens: 4096
        });

        const content = chatCompletion.choices[0]?.message?.content || '';
        let translatedSummary = '';
        let translatedNotes = '';

        if (summary && notes) {
            const parts = content.split(/---NOTES---/i);
            translatedSummary = standardizeNoteMarkdown(parts[0].replace(/---SUMMARY---/i, '').trim());
            translatedNotes = standardizeNoteMarkdown(parts[1]?.trim() || '');
        } else if (summary) {
            translatedSummary = standardizeNoteMarkdown(content.replace(/---SUMMARY---/i, '').trim());
        } else {
            translatedNotes = standardizeNoteMarkdown(content.replace(/---NOTES---/i, '').trim());
        }

        return NextResponse.json({
            summary: translatedSummary || standardizeNoteMarkdown(summary),
            notes: translatedNotes || standardizeNoteMarkdown(notes),
            language: targetLanguage
        });
    } catch (error: any) {
        console.error('Translation Error:', error);
        return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 });
    }
}
