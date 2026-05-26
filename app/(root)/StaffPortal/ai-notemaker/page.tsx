'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, BookOpen, Check, Clipboard, Download, FileText, Layout, Loader2, StickyNote, Upload } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export default function AINotemaker() {
    // State
    const [file, setFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [chapter, setChapter] = useState<string>('1');
    const [generateSummary, setGenerateSummary] = useState<boolean>(true);
    const [generateNotes, setGenerateNotes] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ summary?: string; notes?: string; chapter?: string } | null>(null);
    const [_errorLog, setErrorLog] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            const ext = selectedFile.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf' && ext !== 'txt') {
                toast.error('Currently only PDF and TXT files are supported');
                return;
            }
            setFile(selectedFile);
            toast.success('File uploaded successfully');
        }
    };

    const handleGenerate = async () => {
        if (!file) {
            toast.error('Please upload a file first');
            return;
        }

        if (!chapter.trim()) {
            toast.error('Please specify a chapter');
            return;
        }

        setIsLoading(true);
        setResult(null);
        setErrorLog(null);
        setErrorMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('chapter', chapter);

            let mode = 'both';
            if (generateSummary && !generateNotes) mode = 'summary';
            if (!generateSummary && generateNotes) mode = 'notes';

            formData.append('mode', mode);

            const response = await fetch('/api/exam/create-notemaker', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate notes');
            }

            const data = await response.json();
            setResult(data);
            setActiveTab('preview');

            let successMsg = 'Content generated successfully';
            if (generateSummary && generateNotes) successMsg = 'Summary and Notes successfully generated';
            else if (generateSummary) successMsg = 'Summary successfully generated';
            else if (generateNotes) successMsg = 'Notes successfully generated';

            toast.success(successMsg);
        } catch (error: any) {
            console.error('Notemaker Error:', error);
            const displayMessage = error.message || 'Error generating notes. Please try again.';
            setErrorMessage(displayMessage);
            toast.error(displayMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyContent = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const handleDownloadPDF = () => {
        if (!result) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxWidth = pageWidth - margin * 2;
        let yPos = 20;

        const addNewPage = () => {
            doc.addPage();
            yPos = 20;
        };

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('AI NOTEMAKER', pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Chapter: ${result.chapter || 'Entire Document'}`, pageWidth / 2, yPos, { align: 'center' });
        yPos += 10;
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        const printLargeText = (title: string, content: string) => {
            if (yPos > pageHeight - margin - 20) addNewPage();

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            // Clean markdown markers for PDF
            const cleanedContent = content
                .replace(/\r/g, '') // Remove carriage returns first to avoid CRLF issues
                .replace(/\*\*([\s\S]*?)\*\*/g, '$1') // Remove bold markers (multiline-safe)
                .replace(/\*([\s\S]*?)\*/g, '$1') // Remove italic markers (multiline-safe)
                .replace(/^\s*#+\s+/gm, '') // Remove heading markers (even with leading spaces)
                .replace(/^\s*[\*\-\+]\s+/gm, '• '); // Replace bullets with a clean dot

            const lines = doc.splitTextToSize(cleanedContent, maxWidth);

            for (const line of lines) {
                if (yPos > pageHeight - margin) {
                    addNewPage();
                }
                doc.text(line, margin, yPos);
                yPos += 7;
            }
            yPos += 10;
        };

        if (result.summary) {
            printLargeText('AI SUMMARY', result.summary);
        }

        if (result.notes) {
            printLargeText('STRUCTURED NOTES', result.notes);
        }

        doc.save(`notes-${Date.now()}.pdf`);
        toast.success('PDF Downloaded');
    };

    const renderWithBold = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={index} className='font-bold text-primary'>
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4 md:p-6'>
                {errorMessage && (
                    <Alert variant='destructive' className='mb-6'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Operation Failed</AlertTitle>
                        <AlertDescription className='mt-2 font-medium text-sm'>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
                    <TabsList className='bg-muted/50 p-1'>
                        <TabsTrigger value='upload' className='px-8 font-bold'>
                            Configuration
                        </TabsTrigger>
                        <TabsTrigger value='preview' disabled={!result} className='px-8 font-bold'>
                            Preview Notes
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='upload' className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-12'>
                            {/* Left: Source */}
                            <div className='col-span-12 md:col-span-5'>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Upload className='h-5 w-5 text-primary' />
                                            Source Material
                                        </CardTitle>
                                        <CardDescription>Upload textbooks (PDF/TXT) to analyze.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='grid w-full items-center gap-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            <Label htmlFor='file-upload'>
                                                Document (PDF/TXT) <span className='text-destructive'>*</span>
                                            </Label>
                                            {file ? (
                                                <div className='flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <FileText className='h-5 w-5 text-primary' />
                                                        <div className='flex flex-col'>
                                                            <span className='line-clamp-1 font-bold text-slate-900 text-sm'>
                                                                {file.name}
                                                            </span>
                                                            <span className='text-[10px] text-muted-foreground'>
                                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() => setFile(null)}
                                                        className='h-8 text-destructive hover:bg-destructive/10 hover:text-destructive'>
                                                        Change
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Input
                                                    id='file-upload'
                                                    type='file'
                                                    accept='.pdf,.txt'
                                                    onChange={handleFileChange}
                                                    className='cursor-pointer file:font-semibold file:text-primary'
                                                />
                                            )}
                                        </div>

                                        <div className='grid w-full items-center gap-1.5 pt-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                                            <Label htmlFor='chapter'>
                                                Specific Chapter <span className='text-destructive'>*</span>
                                            </Label>
                                            <Input
                                                id='chapter'
                                                type='number'
                                                placeholder='e.g. 1'
                                                value={chapter}
                                                onChange={(e) => setChapter(e.target.value)}
                                                className='h-10'
                                                min='1'
                                            />
                                            <p className='font-normal text-[10px] text-muted-foreground normal-case'>
                                                Please enter chapter numbers only
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right: Settings */}
                            <div className='col-span-12 md:col-span-7'>
                                <Card className='flex h-full flex-col'>
                                    <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                            <Layout className='h-5 w-5 text-primary' />
                                            Notemaker Settings
                                        </CardTitle>
                                        <CardDescription>Define how you want your notes to be structured.</CardDescription>
                                    </CardHeader>
                                    <CardContent className='flex-1 space-y-4 pt-4'>
                                        <div className='space-y-4'>
                                            <div
                                                className={`flex cursor-pointer items-start space-x-4 rounded-xl border p-5 transition-all ${generateSummary ? 'border-primary/20 bg-muted/30' : 'bg-background opacity-60'}`}
                                                onClick={() => setGenerateSummary(!generateSummary)}>
                                                <Checkbox
                                                    id='gen-summary'
                                                    checked={generateSummary}
                                                    onCheckedChange={(checked) => setGenerateSummary(!!checked)}
                                                    className='mt-1'
                                                />
                                                <div className='grid gap-1.5 leading-none'>
                                                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                                    <label className='flex items-center gap-2 font-bold text-sm'>
                                                        <StickyNote className='h-4 w-4' />
                                                        Generate Summary
                                                    </label>
                                                    <p className='text-muted-foreground text-xs leading-relaxed'>
                                                        Creates a high-level academic overview capturing the core message and primary
                                                        concepts.
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className={`flex cursor-pointer items-start space-x-4 rounded-xl border p-5 transition-all ${generateNotes ? 'border-primary/20 bg-muted/30' : 'bg-background opacity-60'}`}
                                                onClick={() => setGenerateNotes(!generateNotes)}>
                                                <Checkbox
                                                    id='gen-notes'
                                                    checked={generateNotes}
                                                    onCheckedChange={(checked) => setGenerateNotes(!!checked)}
                                                    className='mt-1'
                                                />
                                                <div className='grid gap-1.5 leading-none'>
                                                    {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                                                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                                    <label className='text-sm font-bold flex items-center gap-2'>
                                                        <BookOpen className='h-4 w-4' />
                                                        Generate Exhaustive Notes
                                                    </label>
                                                    <p className='text-muted-foreground text-xs leading-relaxed'>
                                                        Creates deep-dive study material with exhaustive explanations and examples.
                                                    </p>
                                                </div>
                                            </div>

                                            {!generateSummary && !generateNotes && (
                                                <Alert variant='destructive' className='rounded-xl px-4 py-3'>
                                                    <AlertCircle className='h-4 w-4' />
                                                    <AlertDescription className='text-sm'>
                                                        Please select at least one option to proceed.
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className='flex items-center justify-between border-t bg-muted/10 p-4'>
                                        <div />
                                        <Button
                                            size='lg'
                                            onClick={handleGenerate}
                                            disabled={isLoading || !file || !chapter.trim() || (!generateSummary && !generateNotes)}
                                            className='min-w-[150px]'>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className='mr-2 h-4 w-4' /> Generate
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value='preview' className='space-y-6'>
                        {result && (
                            <div className='mb-4 flex justify-end gap-2'>
                                <Button onClick={handleDownloadPDF} variant='outline'>
                                    <Download className='mr-2 h-4 w-4' /> Download PDF
                                </Button>
                            </div>
                        )}

                        {result ? (
                            <div className='fade-in mx-auto max-w-5xl animate-in space-y-8 duration-500'>
                                {/* Summary Card */}
                                {result.summary && (
                                    <Card className='overflow-hidden'>
                                        <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/30'>
                                            <div>
                                                <CardTitle className='text-xl'>Summary</CardTitle>
                                                <CardDescription>Overview of the material.</CardDescription>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleCopyContent(result.summary || '')}
                                                className='h-8 w-8 text-muted-foreground hover:text-primary'>
                                                <Clipboard className='h-4 w-4' />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className='p-8'>
                                            <div className='prose prose-slate max-w-none text-lg text-muted-foreground leading-relaxed'>
                                                {result.summary.split('\n').map((line, i) => {
                                                    const trimmedLine = line.trim();
                                                    if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                                                        return (
                                                            <div key={i} className='mb-2 ml-4 flex items-start'>
                                                                <span className='mt-1.5 mr-3 text-primary'>•</span>
                                                                <span className='flex-1'>
                                                                    {renderWithBold(trimmedLine.substring(1).trim())}
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <p key={i} className='mb-3'>
                                                            {renderWithBold(line)}
                                                        </p>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Notes Card */}
                                {result.notes && (
                                    <Card className='overflow-hidden'>
                                        <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/30'>
                                            <div>
                                                <CardTitle className='flex items-center gap-2 text-xl'>
                                                    <StickyNote className='h-5 w-5 text-primary' />
                                                    Structured Topic-wise Notes
                                                </CardTitle>
                                                <CardDescription>Detailed breakdown and key points.</CardDescription>
                                            </div>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleCopyContent(result.notes || '')}
                                                className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-primary'>
                                                <Clipboard className='h-4 w-4' />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className='bg-white p-8'>
                                            <div className='prose prose-blue max-w-none'>
                                                <div className='whitespace-pre-wrap font-sans text-slate-800'>
                                                    {result.notes.split('\n').map((line, i) => {
                                                        const trimmedLine = line.trim();
                                                        if (
                                                            trimmedLine.startsWith('#') ||
                                                            (trimmedLine.toUpperCase() === trimmedLine &&
                                                                trimmedLine.length > 3 &&
                                                                !trimmedLine.includes(' '))
                                                        ) {
                                                            return (
                                                                <h3
                                                                    key={i}
                                                                    className='mt-6 mb-3 border-b pb-2 font-bold text-primary text-xl'>
                                                                    {renderWithBold(trimmedLine.replace(/^#+\s*/, ''))}
                                                                </h3>
                                                            );
                                                        }
                                                        if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
                                                            return (
                                                                <li key={i} className='mb-2 ml-4 flex list-none items-start'>
                                                                    <span className='mt-1.5 mr-2 text-primary'>•</span>
                                                                    <span className='flex-1'>
                                                                        {renderWithBold(trimmedLine.substring(1).trim())}
                                                                    </span>
                                                                </li>
                                                            );
                                                        }
                                                        return (
                                                            <p key={i} className='mb-2 leading-relaxed'>
                                                                {renderWithBold(line)}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className='justify-center border-t bg-muted/30 py-4'>
                                            <p className='text-muted-foreground text-xs'>Generated by AI Notemaker • Optimized for Exams</p>
                                        </CardFooter>
                                    </Card>
                                )}
                            </div>
                        ) : (
                            <div className='flex h-[500px] flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/5'>
                                <FileText className='mb-4 h-16 w-16 text-muted-foreground/20' />
                                <p className='text-muted-foreground'>Ready to process your content...</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
