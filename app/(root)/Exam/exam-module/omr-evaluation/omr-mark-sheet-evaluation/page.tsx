'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Upload, FileCheck, ClipboardCheck, PlayCircle, Eye, Download, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { evaluateOmr } from '@/server/omr-evaluation';

// Helper to convert images to PNG and get dimensions for validation
const convertToPng = async (file: File): Promise<{ file: File; width: number; height: number }> => {
    if (!file.type.startsWith('image/')) {
        // Return original file if it's not an image (like PDF), width/height 0
        return { file, width: 0, height: 0 };
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context failed');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".png";
                        resolve({
                            file: new File([blob], newName, { type: 'image/png' }),
                            width: img.width,
                            height: img.height
                        });
                    } else reject('Blob conversion failed');
                }, 'image/png');
            };
            img.onerror = () => reject('Image load failed');
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject('File read failed');
        reader.readAsDataURL(file);
    });
};

export default function OmrMarkSheetEvaluationPage() {
    const [studentFile, setStudentFile] = useState<File | null>(null);
    const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
    const [questionCount, setQuestionCount] = useState('150');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleEvaluation = async () => {
        if (!studentFile || !answerKeyFile) {
            toast.error('Please upload both Student Sheet and Answer Key');
            return;
        }

        // Quality Check: Prevent highly compressed/low-quality images (<100KB)
        if (studentFile.size < 100 * 1024 || answerKeyFile.size < 100 * 1024) {
            toast.error('The image quality is too low (less than 100KB). Please upload a higher-quality scan for accurate OMR evaluation.');
            return;
        }

        setIsEvaluating(true);

        try {
            // Ensure both files are PNG for the backend API and get metadata for validation
            const studentInfo = await convertToPng(studentFile);
            const answerKeyInfo = await convertToPng(answerKeyFile);

            // Robust validation: Check if they are the same image content 
            // (Same dimensions and same base filename even if format differs)
            const base1 = studentFile.name.replace(/\.[^/.]+$/, "");
            const base2 = answerKeyFile.name.replace(/\.[^/.]+$/, "");

            if (
                (studentInfo.width === answerKeyInfo.width && studentInfo.height === answerKeyInfo.height && base1 === base2) ||
                (studentFile.name === answerKeyFile.name && studentFile.size === answerKeyFile.size)
            ) {
                toast.error('The Student Sheet and Answer Key appear to be the same image. Please provide different sheets.');
                setIsEvaluating(false);
                return;
            }

            toast.info('Processing OMR evaluation... this may take a moment.');

            const formData = new FormData();
            formData.append('student_file', studentInfo.file);
            formData.append('answer_key_file', answerKeyInfo.file);
            formData.append('question_count', questionCount);
            formData.append('options', '["A","B","C","D"]');

            const result = await evaluateOmr(formData);

            if (!result.success || !result.data) {
                throw new Error(result.message || 'Error occurred during server-side evaluation.');
            }

            // Convert base64 back to Blob
            const binaryString = window.atob(result.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: result.contentType });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
            toast.success('Evaluation completed! You can now preview the result.');
        } catch (error: any) {
            console.error('OMR Error:', error);
            toast.error(error.message || 'Error occurred during processing.');
        } finally {
            setIsEvaluating(false);
        }
    };

    const clearFiles = () => {
        setStudentFile(null);
        setAnswerKeyFile(null);
        setPdfUrl(null);
        toast.info('Cleared uploads and results');
    };

    const downloadPdf = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'omr_evaluation_result.pdf';
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-outfit text-slate-900 tracking-tight">OMR AI Evaluator</h1>
                        <p className="text-slate-500 mt-1">Industrial-grade OMR evaluation powered by AI VRM Engine.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={clearFiles} disabled={isEvaluating} className="rounded-xl border-slate-200">
                            <Trash2 className="w-4 h-4 mr-2 text-slate-400" />
                            Clear All
                        </Button>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all active:scale-95 rounded-xl px-8"
                            onClick={handleEvaluation}
                            disabled={!studentFile || !answerKeyFile || isEvaluating}
                        >
                            {isEvaluating ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    Generate Result
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Input Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-3xl">
                            <div className="h-1.5 bg-indigo-600" />
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                                    Source Sheets
                                </CardTitle>
                                <CardDescription>Provide the scanned OMR images for processing.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Student File */}
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold px-1">Student Answer Sheet</Label>
                                    <div className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all ${studentFile ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setStudentFile(e.target.files?.[0] || null)}
                                            accept="image/*,application/pdf"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${studentFile ? 'bg-emerald-500 text-white' : 'bg-white shadow-sm text-indigo-600 group-hover:scale-110'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{studentFile ? studentFile.name : 'Choose Student Sheet'}</p>
                                                <p className="text-[11px] text-slate-500">{studentFile ? (studentFile.size / 1024).toFixed(1) + ' KB' : 'Max size 20MB'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Answer Key File */}
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-semibold px-1">Official Answer Key</Label>
                                    <div className={`relative group border-2 border-dashed rounded-2xl p-4 transition-all ${answerKeyFile ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => setAnswerKeyFile(e.target.files?.[0] || null)}
                                            accept="image/*,application/pdf"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl ${answerKeyFile ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm text-indigo-600 group-hover:scale-110'}`}>
                                                <ClipboardCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{answerKeyFile ? answerKeyFile.name : 'Choose Answer Key'}</p>
                                                <p className="text-[11px] text-slate-500">{answerKeyFile ? (answerKeyFile.size / 1024).toFixed(1) + ' KB' : 'Reference Key'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>

                    </div>

                    {/* Result Preview Panel */}
                    <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
                        <Card className="flex-1 border-none shadow-2xl bg-slate-900 overflow-hidden rounded-[2.5rem] flex flex-col">
                            <CardHeader className="bg-slate-800/50 border-b border-slate-700/50 flex flex-row items-center justify-between px-8 py-5">
                                <div className="space-y-0.5">
                                    <CardTitle className="text-lg text-white flex items-center">
                                        <Eye className="w-5 h-5 mr-2 text-indigo-400" />
                                        Evaluation Preview
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">Real-time PDF rendering of results.</CardDescription>
                                </div>
                                {pdfUrl && (
                                    <Button onClick={downloadPdf} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl shadow-indigo-900/40 border-none transition-all active:scale-95">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 p-0 relative">
                                {pdfUrl ? (
                                    <iframe
                                        src={`${pdfUrl}#toolbar=0`}
                                        className="w-full h-full border-none"
                                        title="Evaluation Result"
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                                        <div className="w-24 h-24 bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6 animate-pulse">
                                            <FileText className="w-10 h-10 text-slate-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-300">Ready for Evaluation</h3>
                                        <p className="text-slate-500 text-sm max-w-sm mt-2">
                                            Upload your sheets on the left and click "Generate Result" to view the evaluated PDF here.
                                        </p>
                                    </div>
                                )}

                                {isEvaluating && (
                                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
                                        <div className="relative w-20 h-20 mb-6">
                                            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                                            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <FileText className="absolute inset-0 m-auto w-8 h-8 text-indigo-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Analyzing OMR Bubbles...</h3>
                                        <div className="w-64 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes loading {
                    0% { width: 0; transform: translateX(-100%); }
                    50% { width: 100%; transform: translateX(0); }
                    100% { width: 0; transform: translateX(100%); }
                }

                /* Add outfit font if not loaded */
                .font-outfit { font-family: var(--font-outfit, sans-serif); }
            `}</style>
        </div>
    );
}
