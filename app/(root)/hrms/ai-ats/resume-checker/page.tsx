'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
    BrainCircuit, 
    UploadCloud, 
    FileText, 
    CheckCircle2, 
    AlertCircle, 
    Zap, 
    Search,
    ShieldCheck,
    Star,
    Sparkles
} from 'lucide-react';

export default function AIResumeCheckerPage() {
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setIsAnalyzed(true);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span>Powered by Advanced AI</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                            AI Resume Checker
                        </h1>
                        <p className="text-lg text-indigo-100/90 leading-relaxed">
                            Optimize your hiring workflow with our intelligent ATS analysis. 
                            Scan resumes against job descriptions, detect skill gaps, and identify top talent in seconds.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="h-32 w-32 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center animate-pulse">
                            <BrainCircuit className="h-16 w-16 text-white" />
                        </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden group">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UploadCloud className="h-5 w-5 text-indigo-600" />
                                Upload Resume
                            </CardTitle>
                            <CardDescription>
                                Supported formats: PDF, DOCX (Max 5MB)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50/50 group/upload cursor-pointer">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover/upload:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">Drop your resume here</p>
                                        <p className="text-sm text-slate-500">or click to browse files</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <Label className="text-slate-700 font-medium">Job Description (Optional)</Label>
                                <textarea 
                                    className="w-full min-h-[120px] rounded-xl border-slate-200 bg-white p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Paste job description for precise matching..."
                                />
                            </div>

                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 py-6 rounded-xl transition-all active:scale-95"
                                onClick={handleUpload}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Analyzing Profile...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Analyze with AI
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                System Integrity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-sm text-slate-300">Parsing Accuracy</span>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none">99.2%</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                <span className="text-sm text-slate-300">Processing Speed</span>
                                <Badge className="bg-blue-500/20 text-blue-400 border-none">&lt; 2s</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-2 space-y-6">
                    {!isAnalyzed && !isUploading ? (
                        <div className="h-[600px] flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-3xl border border-dashed border-slate-300">
                            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6 animate-bounce">
                                <Search className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Ready to Analyze</h3>
                            <p className="text-slate-500 max-w-md">
                                Upload a resume to see the AI magic. We'll extract skills, calculate scores, and provide detailed insights.
                            </p>
                        </div>
                    ) : isUploading ? (
                        <div className="h-[600px] flex flex-col items-center justify-center space-y-8 p-8 bg-white rounded-3xl shadow-xl">
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                                <BrainCircuit className="absolute inset-0 m-auto h-12 w-12 text-indigo-600 animate-pulse" />
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-bold text-slate-800">AI Engine Working</h3>
                                <p className="text-slate-500 italic">"Extracting entities, analyzing semantic patterns..."</p>
                            </div>
                            <div className="w-full max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full animate-progress-indeterminate" />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            {/* Score Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="border-none shadow-lg bg-white overflow-hidden">
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                        <div className="text-4xl font-black text-indigo-600">85<span className="text-lg text-slate-400">/100</span></div>
                                        <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Overall Match</div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-indigo-500 w-[85%]" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-lg bg-white overflow-hidden">
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                        <div className="text-4xl font-black text-emerald-600">92<span className="text-lg text-slate-400">%</span></div>
                                        <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Skill Relevance</div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[92%]" />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-lg bg-white overflow-hidden">
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                                        <div className="text-4xl font-black text-amber-600">High</div>
                                        <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">Growth Potential</div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                            <div className="h-full bg-amber-500 w-[78%]" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Analysis */}
                            <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
                                <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-indigo-600" />
                                            AI Insights
                                        </CardTitle>
                                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 px-3 py-1">Candidate Alpha</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[400px]">
                                        <div className="p-6 space-y-8">
                                            {/* Strengths */}
                                            <section className="space-y-4">
                                                <h4 className="flex items-center gap-2 font-bold text-slate-800">
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                    Key Strengths
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {[
                                                        "Extensive experience in React.js & Next.js",
                                                        "Strong architectural understanding of ERP systems",
                                                        "Proven track record in team leadership",
                                                        "Excellent problem-solving skills"
                                                    ].map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100">
                                                            <Star className="h-4 w-4 mt-0.5 fill-emerald-500" />
                                                            <span className="text-sm font-medium">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Skills Analysis */}
                                            <section className="space-y-4">
                                                <h4 className="flex items-center gap-2 font-bold text-slate-800">
                                                    <Zap className="h-5 w-5 text-indigo-500" />
                                                    Skills Breakdown
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'System Design', 'Agile'].map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-default">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </section>

                                            {/* Improvement areas */}
                                            <section className="space-y-4 pb-4">
                                                <h4 className="flex items-center gap-2 font-bold text-slate-800">
                                                    <AlertCircle className="h-5 w-5 text-amber-500" />
                                                    Areas for Discussion
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex gap-3">
                                                        <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                                                        <p className="text-sm font-medium">Limited exposure to mobile-native development (Flutter/React Native) which was mentioned in the stretch goals.</p>
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex gap-3">
                                                        <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                                                        <p className="text-sm font-medium">Career gap of 6 months in 2022 might require clarification during the interview process.</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
}
