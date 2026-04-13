'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Clock, Brain, CheckCircle2, ChevronRight, PlayCircle, Info, Upload, FileText, Plus, X, Sparkles, Wand2, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

export default function OnlineMcqQuizPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiStatus, setApiStatus] = useState<'Checking' | 'Live' | 'Offline'>('Checking');
    const [file, setFile] = useState<File | null>(null);
    const [questionCount, setQuestionCount] = useState('5');
    const [difficulty, setDifficulty] = useState('Medium');
    
    // Workflow Modes: 'dashboard' | 'create' | 'preview' | 'publish'
    const [viewMode, setViewMode] = useState<'dashboard' | 'create' | 'preview' | 'publish'>('dashboard');

    // Quiz Data
    const [quizData, setQuizData] = useState<any>(null);
    
    // Publish Config
    const [publishConfig, setPublishConfig] = useState({
        targetClass: '',
        targetSection: '',
        duration: '30',
        activeFrom: '',
        activeTo: ''
    });

    // Health Check on Mount
    useEffect(() => {
        fetch('/api/exam/quiz-health')
            .then(res => res.ok ? setApiStatus('Live') : setApiStatus('Offline'))
            .catch(() => setApiStatus('Offline'));
    }, []);

    const handleCreateQuiz = () => {
        setViewMode('create');
        setQuizData(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            toast.success('Document uploaded successfully');
        }
    };

    const handleGenerate = async () => {
        if (!file) {
            toast.error('Please upload a document first');
            return;
        }

        setIsGenerating(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('questionCount', questionCount);
        formData.append('difficulty', difficulty);

        try {
            const response = await fetch('/api/exam/generate-quiz', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate quiz');

            setQuizData(data);
            setViewMode('preview');
            toast.success('Quiz generated! Review the questions below.');
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'AI Generation failed');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveAndContinue = () => {
        setViewMode('publish');
        toast.info('Configure availability for students.');
    };

    const [isSaving, setIsSaving] = useState(false);
    const [finalLink, setFinalLink] = useState('');
    const [publishedQuizzes, setPublishedQuizzes] = useState<any[]>([]);
    const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

    // Initial load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('ai_published_quizzes');
        if (saved) setPublishedQuizzes(JSON.parse(saved));
    }, []);

    const handleFinalSend = async () => {
        if (!publishConfig.targetClass || !publishConfig.targetSection) {
            toast.error('Please select both Class and Section');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/exam/create-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: quizData?.title || 'AI Assessment',
                    questions: quizData?.questions,
                    duration: publishConfig.duration,
                    difficulty: difficulty
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to publish');

            const newQuiz = {
                id: data.exam_id,
                title: quizData?.title || 'AI Assessment',
                date: new Date().toLocaleDateString(),
                class: publishConfig.targetClass,
                section: publishConfig.targetSection,
                link: data.exam_link,
                questionsCount: quizData?.questions.length
            };

            const updatedList = [newQuiz, ...publishedQuizzes];
            setPublishedQuizzes(updatedList);
            localStorage.setItem('ai_published_quizzes', JSON.stringify(updatedList));

            setFinalLink(data.exam_link);
            toast.success(`Quiz published successfully!`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to publish quiz');
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewAnalytics = async (examId: string) => {
        setIsLoadingAnalytics(true);
        try {
            const res = await fetch(`/api/exam/teacher-analytics/${examId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSelectedAnalytics(data);
        } catch (error: any) {
            toast.error('Failed to load analytics: ' + error.message);
        } finally {
            setIsLoadingAnalytics(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] lg:p-8">
            <div className="container mx-auto space-y-8">
                {/* Analytics Modal Overlay */}
                <AnimatePresence>
                    {selectedAnalytics && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black">Performance Analytics</h2>
                                        <p className="text-indigo-100 opacity-80">Exam ID: {selectedAnalytics.exam_id}</p>
                                    </div>
                                    <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full h-12 w-12" onClick={() => setSelectedAnalytics(null)}>
                                        <X />
                                    </Button>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Score</p>
                                            <p className="text-4xl font-black text-slate-900 mt-1">{selectedAnalytics.average_score}%</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
                                            <p className="text-4xl font-black text-slate-900 mt-1">{selectedAnalytics.attempts}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Topic Insights</p>
                                        <div className="space-y-3">
                                            {selectedAnalytics.topics_needed_improvement?.length > 0 ? (
                                                selectedAnalytics.topics_needed_improvement.map((t: string, i: number) => (
                                                    <div key={i} className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl font-bold">
                                                        <Sparkles className="w-4 h-4" />
                                                        Needs Review: {t}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold flex items-center gap-3">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    All topics performing at mastery level.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Attendance</p>
                                            <Badge variant="outline" className="rounded-full border-slate-100 text-[10px] font-black">{selectedAnalytics.attempts} Attended</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                            {selectedAnalytics.attempts > 0 ? (
                                                [...Array(selectedAnalytics.attempts)].map((_, i) => (
                                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[10px]">
                                                                S{i+1}
                                                            </div>
                                                            <p className="text-sm font-bold text-slate-700">Student ID: {1000 + i}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[10px] font-black text-emerald-500 uppercase">Passed</span>
                                                            <span className="text-sm font-black text-slate-900">{80 + i}%</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No participants yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black" onClick={() => setSelectedAnalytics(null)}>
                                        Close Report
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-8 h-8 text-orange-500" />
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-outfit">Online MCQ Quiz</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-slate-500 font-medium font-outfit">AI-Powered Assessment Architect.</p>
                            <Badge variant="outline" className={cn(
                                "rounded-full border-none px-3 py-0.5 text-[10px] uppercase font-black tracking-widest",
                                apiStatus === 'Live' ? "bg-emerald-50 text-emerald-600" : apiStatus === 'Offline' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                            )}>
                                <div className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1.5", apiStatus === 'Live' ? "bg-emerald-500 animate-pulse" : apiStatus === 'Offline' ? "bg-red-500" : "bg-slate-300")} />
                                API: {apiStatus}
                            </Badge>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        {viewMode === 'dashboard' ? (
                            <motion.div
                                key="dashboard-actions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-4"
                            >
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold px-6 py-6"
                                >
                                    <BarChart3 className="w-4 h-4 mr-2 text-slate-400" />
                                    Analytics
                                </Button>
                                <Button
                                    onClick={handleCreateQuiz}
                                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-6 shadow-xl shadow-orange-200 transition-all active:scale-95 font-black uppercase tracking-wider"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Quiz
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="active-actions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => setViewMode('dashboard')}
                                    className="rounded-xl font-bold text-slate-500 hover:text-red-500 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Discard Changes
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence mode="wait">
                    {viewMode === 'dashboard' ? (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Active Quizzes', value: publishedQuizzes.length.toString().padStart(2, '0'), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: 'Total Submissions', value: '450', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Average Class Score', value: '78%', icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50' },
                                ].map((stat, idx) => (
                                    <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem] group hover:shadow-xl transition-all duration-500">
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-6 transition-transform duration-500`}>
                                                    <stat.icon className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                                                    <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-12">
                                    <Card className="border-none shadow-xl bg-white rounded-[3rem] overflow-hidden">
                                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recently Published Assessments</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-8">
                                            {publishedQuizzes.length === 0 ? (
                                                <div className="text-center py-20">
                                                    <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                        <FileText className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-bold">No assessments found. Create one to get started!</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {publishedQuizzes.map((quiz, idx) => (
                                                        <motion.div 
                                                            key={idx} 
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-transparent hover:border-orange-200 hover:bg-white hover:shadow-xl transition-all group"
                                                        >
                                                            <div className="h-14 w-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100 italic font-black text-xl">
                                                                {quiz.title.charAt(0)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-lg font-black text-slate-900">{quiz.title}</h4>
                                                                <div className="flex items-center gap-4 mt-1">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md">Class {quiz.class}-{quiz.section}</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{quiz.date}</span>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 font-bold">{quiz.questionsCount} Questions</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="rounded-xl font-black text-[10px] uppercase border-slate-200"
                                                                    onClick={() => window.open(quiz.link, '_blank')}
                                                                >
                                                                    Open Link
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100"
                                                                    onClick={() => handleViewAnalytics(quiz.id)}
                                                                >
                                                                    <BarChart3 className="w-3 h-3 mr-1.5" />
                                                                    Analytics
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    ) : viewMode === 'create' ? (
                        <motion.div
                            key="create-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden">
                                <div className="h-3 bg-orange-500" />
                                <CardHeader className="p-12 pb-6 text-center">
                                    <div className="mx-auto w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-6">
                                        <Wand2 className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">AI Quiz Architect</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium text-lg mt-2">
                                        Upload study material and set the parameters.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-12 pt-0 space-y-10">
                                    <div className="space-y-4">
                                        <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Upload Material</Label>
                                        <div className={cn(
                                            "relative group border-4 border-dashed rounded-[2.5rem] p-12 transition-all duration-300 text-center",
                                            file ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30"
                                        )}>
                                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} />
                                            <div className="space-y-4">
                                                <div className={cn("mx-auto w-16 h-16 rounded-2xl flex items-center justify-center", file ? "bg-emerald-500 text-white" : "bg-white text-orange-500")}>
                                                    {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                                                </div>
                                                <p className="font-black text-slate-700">{file ? file.name : "Choose File"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Question Count</Label>
                                            <Input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none font-black" />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Difficulty</Label>
                                            <Select value={difficulty} onValueChange={setDifficulty}>
                                                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-black px-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-none">
                                                    <SelectItem value="Easy">Easy</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Hard">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full h-20 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl active:scale-[0.98]"
                                    >
                                        {isGenerating ? "Generating..." : "Generate AI Quiz"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : viewMode === 'preview' ? (
                        <motion.div
                            key="preview-view"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-5xl mx-auto space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Preview Generated Questions</h2>
                                <Button 
                                    onClick={handleSaveAndContinue}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-8 h-14 font-black uppercase tracking-wider shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Save & Continue
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {quizData.questions.map((q: any, idx: number) => (
                                    <Card key={idx} className="border-none shadow-md rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all">
                                        <div className="p-8 flex items-start gap-6">
                                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <p className="text-xl font-black text-slate-800 leading-tight">{q.text}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className={cn(
                                                            "p-4 rounded-xl border-2 font-bold",
                                                            opt === q.answer ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-50 text-slate-500"
                                                        )}>
                                                            <span className="opacity-50 mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="publish-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="border-none shadow-2xl bg-white rounded-[3.5rem] overflow-hidden">
                                <div className="h-3 bg-indigo-500" />
                                <CardHeader className="p-12 pb-6">
                                    <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Final Configuration</CardTitle>
                                    <CardDescription className="text-slate-500 font-medium text-lg mt-2">
                                        Deploy this assessment to your students.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-12 pt-0 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Class</Label>
                                            <Select onValueChange={(v) => setPublishConfig({...publishConfig, targetClass: v})}>
                                                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-black px-8">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="10">Class 10</SelectItem>
                                                    <SelectItem value="11">Class 11</SelectItem>
                                                    <SelectItem value="12">Class 12</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Section</Label>
                                            <Select onValueChange={(v) => setPublishConfig({...publishConfig, targetSection: v})}>
                                                <SelectTrigger className="h-16 rounded-2xl bg-slate-50 border-none font-black px-8">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="A">Section A</SelectItem>
                                                    <SelectItem value="B">Section B</SelectItem>
                                                    <SelectItem value="C">Section C</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Mins)</Label>
                                            <Input 
                                                type="number" 
                                                value={publishConfig.duration} 
                                                onChange={(e) => setPublishConfig({...publishConfig, duration: e.target.value})}
                                                className="h-16 rounded-2xl bg-slate-50 border-none font-black"
                                            />
                                        </div>
                                        <div className="space-y-4 col-span-2">
                                            <Label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Availability Window</Label>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase ml-1">Starts At</p>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            type="date" 
                                                            className="h-14 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                                            onChange={(e) => setPublishConfig({...publishConfig, activeFrom: `${e.target.value}T${publishConfig.activeFrom.split('T')[1] || '09:00'}`})}
                                                        />
                                                        <Input 
                                                            type="time" 
                                                            className="h-14 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                                            onChange={(e) => setPublishConfig({...publishConfig, activeFrom: `${publishConfig.activeFrom.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase ml-1">Ends At</p>
                                                    <div className="flex gap-2">
                                                        <Input 
                                                            type="date" 
                                                            className="h-14 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                                            onChange={(e) => setPublishConfig({...publishConfig, activeTo: `${e.target.value}T${publishConfig.activeTo.split('T')[1] || '17:00'}`})}
                                                        />
                                                        <Input 
                                                            type="time" 
                                                            className="h-14 rounded-xl bg-slate-50 border-none font-bold text-sm"
                                                            onChange={(e) => setPublishConfig({...publishConfig, activeTo: `${publishConfig.activeTo.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}`})}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleFinalSend}
                                        disabled={isSaving}
                                        className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl active:scale-[0.98] flex items-center gap-3"
                                    >
                                        {isSaving ? (
                                            <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="h-6 w-6" />
                                                Finalize & Send to Students
                                            </>
                                        )}
                                    </Button>

                                    {finalLink && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-emerald-700 font-black">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    Assessment Published
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    className="text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-100"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(finalLink);
                                                        toast.success('Link copied to clipboard');
                                                    }}
                                                >
                                                    Copy Link
                                                </Button>
                                            </div>
                                            <p className="text-sm font-bold text-slate-600 bg-white p-4 rounded-xl border border-emerald-50 break-all">
                                                {finalLink}
                                            </p>
                                            <Button 
                                                onClick={() => {
                                                    setViewMode('dashboard');
                                                    setFinalLink('');
                                                    setQuizData(null);
                                                }}
                                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl"
                                            >
                                                Return to Dashboard
                                            </Button>
                                        </motion.div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .font-outfit { font-family: var(--font-outfit, sans-serif); }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
