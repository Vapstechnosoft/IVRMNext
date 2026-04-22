'use server';

export async function evaluateOmr(formData: FormData) {
    try {
        const response = await fetch('https://omrivrm.vercel.app/evaluate/pdf', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `External API returned status ${response.status}`);
        }

        const buffer = await response.arrayBuffer();

        // Return as base64 or similar if needed, but since we want a file, 
        // we'll return the arrayBuffer as a base64 string for the client to convert back to a blob
        return {
            success: true,
            data: Buffer.from(buffer).toString('base64'),
            contentType: response.headers.get('content-type') || 'application/pdf'
        };
    } catch (error: any) {
        console.error('OMR Server Action Error:', error);
        return {
            success: false,
            message: error.message || 'Failed to communicate with the OMR evaluation server.'
        };
    }
}

export async function validateOmrMarkings(file: File) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        
        const { Groq } = await import('groq-sdk');
        const client = new Groq({ apiKey: process.env.omr_groq_key });

        const response = await client.chat.completions.create({
            model: "llama-3.2-11b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { 
                            type: "text", 
                            text: "CRITICAL TASK: Look at the student's marks on this OMR sheet. Are they using standard filled/colored circles? Or are they using thin pen strokes like tick marks (✓) or crosses (x)? If you see ANY tick marks or crosses instead of fully colored bubbles, you MUST return isValidStyle: false. Return ONLY this JSON: {\"isValidStyle\": boolean, \"hasTicks\": boolean}" 
                        },
                        {
                            type: "image_url",
                            image_url: { url: `data:image/jpeg;base64,${base64}` }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content || '{"isValidStyle": true}';
        return JSON.parse(content);
    } catch (error) {
        console.error('Validation Error:', error);
        return { isValidStyle: true }; 
    }
}
