'use server';

export async function analyzeResume(formData: FormData) {
    try {
        const resumeFile = formData.get('resume') as File | null;
        const jdFile = formData.get('jd_file') as File | null;
        const jdText = formData.get('jd_text') as string | null;

        if (!resumeFile) {
            return { success: false, error: 'Resume file is required.' };
        }

        const backendFormData = new FormData();
        backendFormData.append('resume', resumeFile);
        
        // If a JD file was uploaded, use it. Otherwise, use JD text or a fallback.
        if (jdFile && jdFile.size > 0) {
            backendFormData.append('jd', jdFile);
        } else {
            const jdContent = jdText && jdText.trim() !== '' ? jdText : 'No job description provided.';
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
        return { success: true, data };
    } catch (error: any) {
        console.error('Server action error:', error);
        return { success: false, error: error.message || 'Failed to connect to the analysis server.' };
    }
}
