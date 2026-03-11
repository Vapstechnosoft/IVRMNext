import type { NextRequest } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

// Force JSON response even for global errors
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    let tempFilePath = '';
    try {
        const formData = await req.formData();
        const file = formData.get('audio') as File | null;

        if (!file) {
            return Response.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Use the received file buffer directly
        const buffer = Buffer.from(await file.arrayBuffer());
        tempFilePath = path.join(os.tmpdir(), `header_voice_${Date.now()}.wav`);
        await fs.writeFile(tempFilePath, buffer);

        // Execute the Python script
        const scriptPath = path.join(process.cwd(), 'server', 'voice_processor.py');
        console.log('[Header Voice] Executing Python script:', scriptPath);

        try {
            const { stdout, stderr } = await execAsync(`python "${scriptPath}" "${tempFilePath}"`);

            const match = stdout.match(/RESULTJSON:(.*?):ENDJSON/);
            if (!match) {
                console.error('[Header Voice] Could not find JSON in Python output. Output was:', stdout);
                return Response.json({ error: 'Invalid output from speech processor' }, { status: 500 });
            }

            const result = JSON.parse(match[1]);

            // Clean up
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => { });

            if (!result.success) {
                return Response.json({ error: result.error }, { status: 500 });
            }

            return Response.json({
                success: true,
                text: result.text,
                original: result.original_text,
                language: result.detected_lang
            });

        } catch (execError: any) {
            console.error('[Header Voice] Execution error:', execError);
            const errorOutput = execError.stdout || execError.message || 'Python execution failed';
            return Response.json({
                error: 'Python processing failed',
                details: errorOutput
            }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error('Header Voice API error:', error);
        if (tempFilePath) await fs.unlink(tempFilePath).catch(() => { });
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ error: 'Server error', details: errorMessage }, { status: 500 });
    }
}
