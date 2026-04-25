'use client';

import * as React from 'react';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    BrainCircuit, 
    UploadCloud, 
    CheckCircle2, 
    AlertCircle, 
    Zap, 
    Search,
    Target,
    FileText,
    Sparkles,
    User,
    Briefcase,
    GraduationCap,
    XCircle,
    Info,
    Mail,
    Phone
} from 'lucide-react';
import { analyzeResume } from './actions';

export default function AIResumeCheckerPage() {
    const [isUploading, setIsUploading] = React.useState(false);
    const [isAnalyzed, setIsAnalyzed] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [resumeFile, setResumeFile] = React.useState<File | null>(null);
    const [jdText, setJdText] = React.useState('');
    const [jdFile, setJdFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = React.useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedExtensions = ['.pdf', '.docx', '.doc'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                setError('Format Not Accepted. Please upload only PDF or Word documents (.pdf, .docx, .doc).');
                setResumeFile(null);
                e.target.value = ''; 
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit.');
                setResumeFile(null);
                e.target.value = '';
                return;
            }

            setResumeFile(file);
            setError(null);
            setIsAnalyzed(false);
            setAnalysisResult(null);
        }
    };

    const handleUpload = async () => {
        if (!resumeFile) {
            setError('Please upload a resume file.');
            return;
        }

        if (!jdFile && !jdText.trim()) {
            setError('Please provide a Job Description (paste text or upload file).');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError(null);
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 300);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            
            if (jdFile) {
                formData.append('jd_file', jdFile);
            } else if (jdText.trim()) {
                formData.append('jd_text', jdText);
            }

            const response = await analyzeResume(formData);

            clearInterval(interval);
            setUploadProgress(100);

            if (response.success) {
                setAnalysisResult(response.data);
                setIsAnalyzed(true);
            } else {
                setError(response.error || 'Failed to analyze resume.');
            }
        } catch (err: any) {
            clearInterval(interval);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setTimeout(() => setIsUploading(false), 500); 
        }
    };

    const getScoreColor = (score: number | string, decision: string) => {
        if (decision === 'HIGHLY SUITABLE' || decision === 'SUITABLE') return 'text-emerald-600';
        if (decision === 'MAYBE') return 'text-amber-500';
        return 'text-red-500';
    };

    const getScoreBg = (decision: string) => {
        if (decision === 'HIGHLY SUITABLE' || decision === 'SUITABLE') return 'bg-emerald-50 border-emerald-200';
        if (decision === 'MAYBE') return 'bg-amber-50 border-amber-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Info className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">How to Use AI Resume Checker</h2>
                        <p className="text-slate-500 text-xs">Evaluate your profile against industry standards in two simple steps</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4">
                    <div className="flex gap-4">
                        <div className="flex-none">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-100">1</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-slate-800">Upload & Define</p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Upload your resume (PDF/DOCX) and provide the Job Description (text or file).
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-none">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-100">2</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-base font-bold text-slate-800">Get AI Insights</p>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Receive instant ATS score, detailed skills breakdown, and AI executive report.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden group">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-indigo-600" />
                                Upload Document
                            </CardTitle>
                            <CardDescription>
                                PDF, DOCX supported. Max 5MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/50 group/upload cursor-pointer text-center bg-white">
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                />
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/upload:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        {resumeFile ? (
                                            <p className="font-bold text-indigo-700 truncate max-w-[200px] mx-auto">{resumeFile.name}</p>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-slate-700">Drop your resume here</p>
                                                <p className="text-sm text-slate-500">or click to browse</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-3">
                                <Label className="text-slate-700 font-bold flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Job Description
                                </Label>
                                <Tabs defaultValue="text" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-2 bg-slate-100/50 p-1">
                                        <TabsTrigger value="text" className="text-[10px] uppercase font-bold tracking-wider">Paste Text</TabsTrigger>
                                        <TabsTrigger value="file" className="text-[10px] uppercase font-bold tracking-wider">Upload File</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="text" className="mt-0">
                                        <textarea 
                                            className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-3 text-[11px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none shadow-inner"
                                            placeholder="Paste job description for precise ATS matching..."
                                            value={jdText}
                                            onChange={(e) => {
                                                setJdText(e.target.value);
                                                if (e.target.value) setJdFile(null);
                                            }}
                                        />
                                    </TabsContent>
                                    <TabsContent value="file" className="mt-0">
                                        <div className="relative border border-dashed border-slate-200 rounded-xl p-6 hover:bg-slate-50 transition-all text-center bg-white">
                                            <input 
                                                type="file" 
                                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                                                        if (['.pdf', '.docx', '.doc'].includes(ext)) {
                                                            setJdFile(file);
                                                            setJdText('');
                                                        } else {
                                                            setError('JD format not accepted. PDF/Word only.');
                                                        }
                                                    }
                                                }}
                                                accept=".pdf,.doc,.docx"
                                            />
                                            <div className="space-y-2">
                                                <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                                                    <FileText className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <p className="text-[11px] font-medium text-slate-700">
                                                    {jdFile ? jdFile.name : 'Click to upload JD File (PDF/Word)'}
                                                </p>
                                                {jdFile && <p className="text-[10px] text-emerald-600 font-bold">File Loaded Successfully</p>}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 py-6 rounded-xl transition-all active:scale-95 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleUpload}
                                disabled={isUploading || !resumeFile || (!jdFile && !jdText.trim())}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                        Analyzing Profile...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-5 w-5 mr-2" />
                                        Analyze with AI
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2">
                    <Card className="h-full border-none shadow-xl bg-white overflow-hidden flex flex-col">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50 flex-none">
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    <span className="text-indigo-600">Analysis Report</span>
                                </div>
                                {isAnalyzed && analysisResult?.score?.decision && (
                                    <Badge variant="outline" className={`px-3 py-1 ${
                                        analysisResult.score.decision === 'HIGHLY SUITABLE' || analysisResult.score.decision === 'SUITABLE' ? 'border-emerald-500 text-emerald-700' :
                                        analysisResult.score.decision === 'MAYBE' ? 'border-amber-500 text-amber-700' : 'border-red-500 text-red-700'
                                    }`}>
                                        {analysisResult.score.decision}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 relative">
                            <ScrollArea className="h-[700px] w-full">
                                <div className="p-6">
                                    {isUploading ? (
                                        <div className="h-full flex flex-col items-center justify-center space-y-8 py-32">
                                            <div className="relative">
                                                <div className="h-32 w-32 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                                                <BrainCircuit className="absolute inset-0 m-auto h-12 w-12 text-indigo-600 animate-pulse" />
                                            </div>
                                            <div className="space-y-2 text-center">
                                                <h3 className="text-2xl font-bold text-slate-800">AI Engine Processing</h3>
                                                <p className="text-slate-500 italic">"Extracting entities, calculating TF-IDF, running LLM analysis..."</p>
                                            </div>
                                            <div className="w-full max-w-md">
                                                <Progress value={uploadProgress} className="h-2" />
                                            </div>
                                        </div>
                                    ) : isAnalyzed && analysisResult ? (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            
                                            {/* Top Metrics Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className={`col-span-1 p-6 rounded-2xl border flex flex-col justify-center items-center text-center shadow-sm ${getScoreBg(analysisResult?.score?.decision || '')}`}>
                                                    <p className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">ATS Score</p>
                                                    <div className={`text-5xl font-black tracking-tighter ${getScoreColor(0, analysisResult?.score?.decision || '')}`}>
                                                        {analysisResult?.score?.value ?? "N/A"}
                                                    </div>
                                                </div>
                                                
                                                <div className="col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-center space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Briefcase className="h-5 w-5 text-indigo-500" />
                                                            <span className="font-semibold">Experience</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="font-bold text-slate-900">{analysisResult?.candidate?.experience_years || 0} years</span>
                                                            <span className="text-xs text-slate-500 block">Req: {analysisResult?.job?.min_experience || 0} years</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <GraduationCap className="h-5 w-5 text-indigo-500" />
                                                            <span className="font-semibold">Education</span>
                                                        </div>
                                                        <div className="text-right flex items-center gap-2">
                                                            {analysisResult?.score?.breakdown?.education?.meets ? 
                                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : 
                                                                <XCircle className="h-5 w-5 text-red-500" />
                                                            }
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {analysisResult?.score?.breakdown?.education?.note || 'Checked'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Report / Insights */}
                                            {analysisResult?.report?.text && (
                                                <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                                    <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-indigo-500/10" />
                                                    <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                                        <BrainCircuit className="h-5 w-5" />
                                                        AI Executive Summary
                                                    </h3>
                                                    <p className="text-slate-700 leading-relaxed text-sm relative z-10 whitespace-pre-wrap">
                                                        {analysisResult.report.text}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Fallback if report failed */}
                                            {analysisResult?.report?.error && !analysisResult?.report?.text && (
                                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="font-bold text-amber-800 text-sm">LLM Summary Unavailable</p>
                                                        <p className="text-xs text-amber-700 mt-1">The system successfully parsed the resume and generated scores, but the detailed text summary encountered a backend LLM error.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <Tabs defaultValue="skills" className="w-full">
                                                <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl">
                                                    <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Skills Analysis</TabsTrigger>
                                                    <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Extracted Profile</TabsTrigger>
                                                </TabsList>
                                                
                                                <TabsContent value="skills" className="mt-6 space-y-6">
                                                    {/* Matched Terms Overview */}
                                                    {analysisResult?.score?.top_matched_terms?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Top Keyword Matches</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {analysisResult.score.top_matched_terms.map((term: string, i: number) => (
                                                                    <Badge key={i} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-3 py-1 text-sm font-medium">
                                                                        {term}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Technical Skills */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between border-b pb-2">
                                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                    <Target className="h-4 w-4 text-emerald-500" />
                                                                    Matched Technical
                                                                </h4>
                                                                <Badge variant="outline">{analysisResult?.score?.breakdown?.required_technical_skills?.match_pct || 0}%</Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {analysisResult?.score?.breakdown?.required_technical_skills?.matched?.length > 0 
                                                                    ? analysisResult.score.breakdown.required_technical_skills.matched.map((s: string, i: number) => (
                                                                        <Badge key={i} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">{s}</Badge>
                                                                    ))
                                                                    : <span className="text-sm text-slate-400 italic">No matches found</span>
                                                                }
                                                            </div>
                                                        </div>

                                                        {/* Missing Skills */}
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between border-b pb-2">
                                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                                                    Missing Skills
                                                                </h4>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {analysisResult?.score?.breakdown?.required_technical_skills?.missing?.length > 0 
                                                                    ? analysisResult.score.breakdown.required_technical_skills.missing.map((s: string, i: number) => (
                                                                        <Badge key={i} variant="outline" className="border-red-200 text-red-600 bg-red-50">{s}</Badge>
                                                                    ))
                                                                    : <span className="text-sm text-emerald-600 font-medium">All required skills met!</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                
                                                <TabsContent value="profile" className="mt-6">
                                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                                        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start gap-4">
                                                            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                                <User className="h-8 w-8" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className="text-xl font-bold text-slate-900">{analysisResult?.candidate?.name || 'Unknown Candidate'}</h3>
                                                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                                                                    {analysisResult?.candidate?.email && (
                                                                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {analysisResult.candidate.email}</span>
                                                                    )}
                                                                    {analysisResult?.candidate?.phone && (
                                                                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {analysisResult.candidate.phone}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-6">
                                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Extracted Details</h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                                                <div>
                                                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Experience</p>
                                                                    <p className="font-medium text-slate-900">{analysisResult?.candidate?.experience_years} Years Total</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Education Focus</p>
                                                                    <p className="font-medium text-slate-900 capitalize">{analysisResult?.candidate?.education?.field || 'Not specified'}</p>
                                                                </div>
                                                                <div className="md:col-span-2">
                                                                    <p className="text-sm text-slate-500 mb-2 flex items-center gap-1.5"><Zap className="h-4 w-4" /> All Extracted Technical Skills</p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {analysisResult?.candidate?.skills?.technical?.length > 0 
                                                                            ? analysisResult.candidate.skills.technical.map((s: string, i: number) => (
                                                                                <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">{s}</Badge>
                                                                            ))
                                                                            : <span className="text-sm text-slate-400">None detected</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            </Tabs>

                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center py-32 text-slate-400">
                                            <Search className="mx-auto h-20 w-20 opacity-20 mb-6" />
                                            <h3 className="text-xl font-bold text-slate-700 mb-2">Awaiting Document</h3>
                                            <p className="max-w-md text-slate-500">
                                                Upload a resume and click 'Analyze with AI' to generate a comprehensive ATS compatibility report.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
