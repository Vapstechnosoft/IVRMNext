'use server';

import Groq from 'groq-sdk';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || process.env.note_Groq_api_key || ''
});

async function extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
        const data = await pdf(buffer);
        return data.text;
    } else if (fileName.endsWith('.docx')) {
        const data = await mammoth.extractRawText({ buffer });
        return data.value;
    } else if (fileName.endsWith('.doc')) {
        // Simple fallback for older .doc if needed, otherwise treat as text
        return buffer.toString('utf-8');
    } else {
        return buffer.toString('utf-8');
    }
}

async function extractMinExperienceFromJD(jdText: string): Promise<number> {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert recruiter. Extract the minimum years of experience required from the following job description. Return ONLY a single number. If a range is given (e.g., 3-5 years), return the lower number. If no experience is mentioned, return 0.'
                },
                {
                    role: 'user',
                    content: jdText
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
            max_tokens: 10
        });

        const content = response.choices[0]?.message?.content || '0';
        const years = Number.parseInt(content.replace(/[^0-9]/g, ''), 10);
        return isNaN(years) ? 0 : years;
    } catch (error) {
        console.error('Error extracting experience from JD:', error);
        return 0;
    }
}

export async function analyzeResume(formData: FormData) {
    try {
        const resumeFile = formData.get('resume') as File | null;
        const jdFile = formData.get('jd_file') as File | null;
        const jdText = formData.get('jd_text') as string | null;

        if (!resumeFile) {
            return { success: false, error: 'Resume file is required.' };
        }

        // 1. Extract JD Text for our local AI pre-processing
        let finalJdText = jdText || '';
        if (jdFile && jdFile.size > 0) {
            try {
                finalJdText = await extractTextFromFile(jdFile);
            } catch (err) {
                console.error('Error parsing JD file:', err);
            }
        }

        // 2. Use local AI to extract min_experience accurately
        const extractedMinExp = await extractMinExperienceFromJD(finalJdText);
        console.log(`AI Extracted Min Experience from JD: ${extractedMinExp} years`);

        // 3. Prepare for Backend API call
        const backendFormData = new FormData();
        backendFormData.append('resume', resumeFile);
        
        if (jdFile && jdFile.size > 0) {
            backendFormData.append('jd', jdFile);
        } else {
            const jdContent = finalJdText || 'No job description provided.';
            const jdBlob = new Blob([jdContent], { type: 'text/plain' });
            backendFormData.append('jd', jdBlob, 'jd.txt');
        }

        console.log('Sending request to ATS backend...');
        
        const response = await fetch('https://ats-aivrm.onrender.com/analyze', {
            method: 'POST',
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            return { success: false, error: `Backend API error: ${response.status}` };
        }

        const data = await response.json();

        // 4. Augment backend response with our accurately extracted experience
        if (data.job) {
            data.job.min_experience = extractedMinExp;
        }
        
        // Update experience breakdown
        if (data.score?.breakdown?.experience) {
            data.score.breakdown.experience.required = extractedMinExp;
            data.score.breakdown.experience.meets = (data.candidate?.experience_years || 0) >= extractedMinExp;
            data.score.breakdown.experience.note = extractedMinExp === 0 ? "No minimum specified" : `${extractedMinExp}+ years required`;
        }

        // 5. Handle Report/Summary Fallback
        // The backend sometimes returns an error in the report object (e.g. proxy initialization error)
        if ((!data.report?.text || data.report?.error) && groq.apiKey) {
            try {
                console.log('Backend report failed or missing, generating local AI summary...');
                const summaryPrompt = `
                    Analyze this candidate match and provide a 3-sentence professional summary.
                    Score: ${data.score?.value}/100
                    Candidate Skills: ${data.candidate?.skills?.technical?.join(', ')}
                    JD Skills Required: ${data.job?.required_skills?.technical?.join(', ')}
                    Experience: ${data.candidate?.experience_years} years vs ${extractedMinExp} years required.
                `;

                const reportResponse = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an Elite AI Recruitment Analyst. Provide a sharp, executive summary of the candidate suitability. Be direct and professional.'
                        },
                        {
                            role: 'user',
                            content: summaryPrompt
                        }
                    ],
                    model: 'llama-3.1-8b-instant',
                    temperature: 0.7,
                    max_tokens: 200
                });

                data.report = {
                    text: reportResponse.choices[0]?.message?.content || 'Summary generation failed.',
                    model: 'llama-3.1-8b-local-fallback',
                    success: true
                };
            } catch (err) {
                console.error('Failed to generate local report:', err);
            }
        }

        return { success: true, data };
    } catch (error: any) {

        console.error('Server action error:', error);
        return { success: false, error: error.message || 'Failed to connect to the analysis server.' };
    }
}

