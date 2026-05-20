'use server';

import Groq from 'groq-sdk';
import pdf from 'pdf-parse';


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
        // Mammoth removed as requested. .docx JD text extraction skipped locally.
        // The backend API still receives the file and handles parsing.
        return '';
    } else if (fileName.endsWith('.doc')) {
        // Simple fallback for older .doc if needed, otherwise treat as text
        return buffer.toString('utf-8');
    } else {
        return buffer.toString('utf-8');
    }
}

async function extractMinExperienceFromJD(jdText: string): Promise<number> {
    try {
        // 1. Try simple regex first for common patterns like "2+ years", "5 years", "experience - 3 years"
        const regexMatch = jdText.match(/(?:experience|required|min|minimum)?\s*[:\-\s]*(\d+)\+?\s*(?:years?|yrs?)/i);
        if (regexMatch && regexMatch[1]) {
            return parseInt(regexMatch[1], 10);
        }

        // 2. Fallback to AI for complex phrasing
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Extract the minimum years of experience required from the JD. Return ONLY the number. If not mentioned, return 0.'
                },
                {
                    role: 'user',
                    content: jdText
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.1,
            max_tokens: 5
        });

        const content = response.choices[0]?.message?.content || '0';
        const match = content.match(/\d+/);
        return match ? Number.parseInt(match[0], 10) : 0;
    } catch (error) {
        console.error('Error extracting experience from JD:', error);
        return 0;
    }
}

async function extractCandidateFallback(resumeText: string): Promise<any> {
    try {
        // 1. Try a quick regex first for direct mentions like "Total Experience: 5 years"
        const expMatch = resumeText.match(/(?:total|overall|work)?\s*experience\s*[:\-\s]*(\d+)\+?\s*(?:years?|yrs?)/i);
        const regexYears = expMatch ? parseInt(expMatch[1], 10) : 0;

        // 2. Use AI for a deep scan of roles, dates, and durations
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'Extract candidate details from resume text in JSON format: {"name": string, "years": number, "education": string}. For "years", calculate total professional experience years. If fresher/student, return 0.'
                },
                {
                    role: 'user',
                    content: resumeText.substring(0, 4000)
                }
            ],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' },
            temperature: 0.1
        });
        const fallback = JSON.parse(response.choices[0]?.message?.content || '{}');
        
        return {
            name: fallback.name,
            years: Math.max(regexYears, fallback.years || 0),
            education: fallback.education
        };
    } catch (e) {
        console.error('Local fallback extraction failed:', e);
        return null;
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
        console.log('Backend response received:', !!data.candidate);

        // --- Aggressive Normalization & Fallback Layer ---
        // 1. Ensure data.candidate exists even if backend failed completely
        if (!data.candidate) {
            data.candidate = { name: 'Unknown Candidate', experience_years: 0, skills: { technical: [], soft: [] } };
        }

        const c = data.candidate;

        // 2. Determine if we need local fallback
        const isUnknownName = !c.name || c.name.toLowerCase().includes('unknown');
        const isZeroExp = (c.experience_years ?? c.years_of_experience ?? c.total_experience ?? 0) === 0;
        const isGenericEdu = !c.education || 
                             (typeof c.education === 'string' && c.education.toLowerCase().includes('knowledge')) || 
                             (c.education.field && c.education.field.toLowerCase().includes('knowledge'));

        if (isUnknownName || isZeroExp || isGenericEdu) {
            try {
                console.log('Triggering aggressive local fallback...');
                const resumeText = await extractTextFromFile(resumeFile);
                console.log(`Extracted PDF text length: ${resumeText?.length || 0}`);
                
                if (resumeText && resumeText.length > 50) {
                    const fallback = await extractCandidateFallback(resumeText);
                    if (fallback) {
                        if (isUnknownName && fallback.name) c.name = fallback.name;
                        if (isZeroExp && fallback.years > 0) c.experience_years = fallback.years;
                        if (isGenericEdu && fallback.education) c.education = { field: fallback.education };
                        console.log('Local fallback applied successfully:', c.name, c.experience_years);
                    }
                }
            } catch (e) {
                console.error('Aggressive fallback failed:', e);
            }
        }

        // 3. Final Normalization
        c.name = c.name || c.full_name || c.candidate_name || 'Unknown Candidate';
            
            // Normalize Contact
            c.email = c.email || c.email_address || 'Not extracted';
            c.phone = c.phone || c.phone_number || c.contact || 'Not extracted';
            
            // Normalize Experience
            let exp = c.experience_years ?? c.years_of_experience ?? c.total_experience ?? 0;
            if (typeof exp === 'string') {
                exp = Number.parseInt(exp.replace(/[^0-9.]/g, ''), 10) || 0;
            }
            c.experience_years = Number(exp);
            
            // Normalize Education
            if (typeof c.education === 'string') {
                c.education = { field: c.education };
            } else if (!c.education) {
                c.education = { field: 'Not specified' };
            }

            // Normalize Skills (Handle array vs object)
            if (Array.isArray(c.skills)) {
                c.skills = { technical: c.skills, soft: [] };
            } else if (!c.skills) {
                c.skills = { technical: [], soft: [] };
            } else {
                // Technical
                if (!c.skills.technical && c.skills.technical_skills) {
                    c.skills.technical = c.skills.technical_skills;
                } else if (!c.skills.technical) {
                    c.skills.technical = [];
                }
                // Soft
                if (!c.skills.soft && c.skills.soft_skills) {
                    c.skills.soft = c.skills.soft_skills;
                } else if (!c.skills.soft) {
                    c.skills.soft = [];
                }
            }

        // 4. Augment backend response with our accurately extracted experience
        if (!data.job) data.job = {};
        if (extractedMinExp > 0 || !data.job.min_experience) {
            data.job.min_experience = extractedMinExp;
        }

        const finalMinExp = data.job.min_experience || 0;
        
        // Ensure job has required_skills structure for summary
        if (!data.job.required_skills) {
            data.job.required_skills = { technical: [], soft: [] };
        }

        // Update experience breakdown
        if (!data.score) data.score = { value: 0, decision: 'NEEDS REVIEW', breakdown: {} };
        if (!data.score.breakdown) data.score.breakdown = {};
        
        data.score.breakdown.experience = {
            required: finalMinExp,
            meets: (data.candidate?.experience_years || 0) >= finalMinExp,
            note: finalMinExp === 0 ? "No minimum specified" : `${finalMinExp}+ years required`
        };

        // 5. Handle Report/Summary Fallback
        if ((!data.report?.text || data.report?.error) && groq.apiKey) {
            try {
                console.log('Backend report failed or missing, generating local AI summary...');
                const summaryPrompt = `
                    Provide a deep, 3-part analysis of this candidate's suitability for the role:
                    
                    1. EXECUTIVE SUMMARY: A professional overview of the match.
                    2. KEY STRENGTHS: List the top 2-3 technical or soft skills they possess that align with the JD.
                    3. CRITICAL GAPS: List the specific skills or experience they are missing.

                    CANDIDATE DATA:
                    Score: ${data.score?.value}/100
                    Name: ${data.candidate?.name}
                    Skills: ${data.candidate?.skills?.technical?.join(', ') || 'None listed'}
                    JD Requirements: ${data.job?.required_skills?.technical?.join(', ') || 'None listed'}
                    Experience: ${data.candidate?.experience_years || 0} years vs ${finalMinExp} years required.
                `;

                const reportResponse = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an Elite AI Recruitment Analyst. Provide a structured report with three sections: EXECUTIVE SUMMARY, KEY STRENGTHS, and CRITICAL GAPS. Be direct and professional. Use simple capital headers for sections. Do not use asterisks or hashes.'
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

        // Clean up any markdown artifacts from the report text
        if (data.report?.text) {
            data.report.text = data.report.text.replace(/\*\*/g, '').replace(/#/g, '').trim();
        }

        return { success: true, data };
    } catch (error: any) {

        console.error('Server action error:', error);
        return { success: false, error: error.message || 'Failed to connect to the analysis server.' };
    }
}

