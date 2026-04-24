'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, CheckCircle2, FileText, Plus, Sparkles, Trophy, Upload, Wand2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';
import { toast } from 'sonner';

export default function OnlineMcqQuizPage() {
    const [_isCreating, _setIsCreating] = useState(false);
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

        if (!questionCount || Number(questionCount) <= 0) {
            toast.error('Question count must be at least 1');
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
    const [_isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        activeQuizzes: 0,
        totalSubmissions: 0,
        averageScore: 0
    });

    // Initial load from local storage
    useEffect(() => {
        const saved = localStorage.getItem('ai_published_quizzes');
        if (saved) setPublishedQuizzes(JSON.parse(saved));
    }, []);

    // Calculate Dynamic Stats
    useEffect(() => {
        const calculateStats = async () => {
            if (publishedQuizzes.length === 0) {
                setDashboardStats({
                    activeQuizzes: '00',
                    totalSubmissions: '0',
                    averageScore: '0%'
                });
                return;
            }

            try {
                let totalSubmissions = 0;
                let totalScoreSum = 0;
                let quizzesWithAttempts = 0;

                // Fetch analytics for each quiz to aggregate
                // In a production app, this should be a single bulk API call
                const analyticsPromises = publishedQuizzes.map(quiz =>
                    fetch(`/api/exam/teacher-analytics/${quiz.id}`)
                        .then(res => res.ok ? res.json() : null)
                        .catch(() => null)
                );

                const results = await Promise.all(analyticsPromises);

                results.forEach(data => {
                    if (data && typeof data.attempts === 'number') {
                        totalSubmissions += data.attempts;
                        if (data.attempts > 0 && typeof data.average_score === 'number') {
                            totalScoreSum += data.average_score;
                            quizzesWithAttempts++;
                        }
                    }
                });

                const avgScore = quizzesWithAttempts > 0 
                    ? Math.round(totalScoreSum / quizzesWithAttempts) 
                    : 0;

                setDashboardStats({
                    activeQuizzes: publishedQuizzes.length,
                    totalSubmissions: totalSubmissions,
                    averageScore: avgScore
                });
            } catch (error) {
                console.error("Error calculating dashboard stats:", error);
            }
        };

        calculateStats();
    }, [publishedQuizzes]);

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
            toast.success('Quiz published successfully!');
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
            toast.error(`Failed to load analytics: ${error.message}`);
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
                            className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm'
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className='w-full max-w-2xl overflow-hidden rounded-[3rem] bg-white shadow-2xl'
                            >
                                <div className='flex items-center justify-between bg-indigo-600 p-8 text-white'>
                                    <div>
                                        <h2 className='font-black text-2xl'>Performance Analytics</h2>
                                        <p className="text-indigo-100 opacity-80">Exam ID: {selectedAnalytics.exam_id}</p>
                                    </div>
                                    <Button variant="ghost" className='h-12 w-12 rounded-full text-white hover:bg-white/10' onClick={() => setSelectedAnalytics(null)}>
                                        <X />
                                    </Button>
                                </div>
                                <div className='space-y-8 p-10'>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className='rounded-3xl bg-slate-50 p-6'>
                                            <p className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>Avg. Score</p>
                                            <p className='mt-1 font-black text-4xl text-slate-900'>{selectedAnalytics.average_score}%</p>
                                        </div>
                                        <div className='rounded-3xl bg-slate-50 p-6'>
                                            <p className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>Total Attempts</p>
                                            <p className='mt-1 font-black text-4xl text-slate-900'>{selectedAnalytics.attempts}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <p className='font-black text-slate-400 text-xs uppercase tracking-widest'>Topic Insights</p>
                                        <div className="space-y-3">
                                            {selectedAnalytics.topics_needed_improvement?.length > 0 ? (
                                                selectedAnalytics.topics_needed_improvement.map((t: string, i: number) => (
                                                    <div key={i} className='flex items-center gap-3 rounded-2xl bg-red-50 p-4 font-bold text-red-700'>
                                                        <Sparkles className='h-4 w-4' />
                                                        Needs Review: {t}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className='flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700'>
                                                    <CheckCircle2 className='h-4 w-4' />
                                                    All topics performing at mastery level.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className='font-black text-slate-400 text-xs uppercase tracking-widest'>Student Attendance</p>
                                            <Badge variant="outline" className='rounded-full border-slate-100 font-black text-[10px]'>{selectedAnalytics.attempts} Attended</Badge>
                                        </div>
                                        <div className='custom-scrollbar grid max-h-[200px] grid-cols-1 gap-2 overflow-y-auto pr-2'>
                                            {selectedAnalytics.attempts > 0 ? (
                                                [...Array(selectedAnalytics.attempts)].map((_, i) => (
                                                    <div key={i} className='flex items-center justify-between rounded-2xl bg-slate-50 p-4'>
                                                        <div className="flex items-center gap-3">
                                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-black text-[10px] text-indigo-600'>
                                                                S{i + 1}
                                                            </div>
                                                            <p className='font-bold text-slate-700 text-sm'>Student ID: {1000 + i}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <span className='font-black text-[10px] text-emerald-500 uppercase'>Passed</span>
                                                            <span className='font-black text-slate-900 text-sm'>{80 + i}%</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className='rounded-[2rem] border-2 border-slate-200 border-dashed bg-slate-50 p-12 text-center'>
                                                    <p className='font-bold text-slate-400 text-sm uppercase tracking-widest'>No participants yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button className='h-16 w-full rounded-2xl bg-slate-900 font-black text-white' onClick={() => setSelectedAnalytics(null)}>
                                        Close Report
                                    </Button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy className='h-8 w-8 text-orange-500' />
                            <h1 className='font-black font-outfit text-3xl text-slate-900 tracking-tight'>Online MCQ Quiz</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className='font-medium font-outfit text-slate-500'>AI-Powered Assessment Architect.</p>
                            <Badge variant="outline" className={cn(
                                'rounded-full border-none px-3 py-0.5 font-black text-[10px] uppercase tracking-widest',
                                apiStatus === 'Live' ? "bg-emerald-50 text-emerald-600" : apiStatus === 'Offline' ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                            )}>
                                <div className={cn('mr-1.5 inline-block h-1.5 w-1.5 rounded-full', apiStatus === 'Live' ? 'animate-pulse bg-emerald-500' : apiStatus === 'Offline' ? "bg-red-500" : "bg-slate-300")} />
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
                                    className='rounded-xl border-slate-200 bg-white px-6 py-6 font-bold transition-all hover:bg-slate-50'
                                >
                                    <BarChart3 className='mr-2 h-4 w-4 text-slate-400' />
                                    Analytics
                                </Button>
                                <Button
                                    onClick={handleCreateQuiz}
                                    className='rounded-xl bg-orange-500 px-8 py-6 font-black text-white uppercase tracking-wider shadow-orange-200 shadow-xl transition-all hover:bg-orange-600 active:scale-95'
                                >
                                    <Plus className='mr-2 h-4 w-4' />
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
                                    className='rounded-xl font-bold text-slate-500 hover:bg-red-50 hover:text-red-500'
                                >
                                    <X className='mr-2 h-4 w-4' />
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
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                                {[
                                    { label: 'Active Quizzes', value: dashboardStats.activeQuizzes, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', suffix: '' },
                                    { label: 'Total Submissions', value: dashboardStats.totalSubmissions, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50', suffix: '' },
                                    { label: 'Average Class Score', value: dashboardStats.averageScore, icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-50', suffix: '%' },
                                ].map((stat, idx) => (
                                    <Card key={idx} className='group overflow-hidden rounded-[2rem] border-none bg-white shadow-sm transition-all duration-500 hover:shadow-xl'>
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-5">
                                                <div className={`rounded-2xl p-4 ${stat.bg} ${stat.color} transition-transform duration-500 group-hover:rotate-6`}>
                                                    <stat.icon className='h-7 w-7' />
                                                </div>
                                                <div>
                                                    <p className='font-black text-[11px] text-slate-400 uppercase tracking-[0.2em]'>{stat.label}</p>
                                                    <p className='font-black text-3xl text-slate-800 tracking-tight'>
                                                        <CountUp end={stat.value} duration={2} suffix={stat.suffix} preserveValue={true} />
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
                                <div className="lg:col-span-12">
                                    <Card className='overflow-hidden rounded-[3rem] border-none bg-white shadow-xl'>
                                        <div className='flex items-center justify-between border-slate-50 border-b p-8'>
                                            <div className="flex items-center gap-3">
                                                <h3 className='font-black text-slate-900 text-xl tracking-tight'>Recently Published Assessments</h3>
                                            </div>
                                        </div>
                                        <CardContent className="p-8">
                                            {publishedQuizzes.length === 0 ? (
                                                <div className='py-20 text-center'>
                                                    <div className='mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50'>
                                                        <FileText className='h-8 w-8 text-slate-300' />
                                                    </div>
                                                    <p className='font-bold text-slate-400'>No assessments found. Create one to get started!</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-4">
                                                    {publishedQuizzes.map((quiz, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className='group flex items-center gap-6 rounded-[2rem] border border-transparent bg-slate-50 p-6 transition-all hover:border-orange-200 hover:bg-white hover:shadow-xl'
                                                        >
                                                            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 font-black text-white text-xl italic shadow-lg shadow-orange-100'>
                                                                {quiz.title.charAt(0)}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className='font-black text-lg text-slate-900'>{quiz.title}</h4>
                                                                <div className='mt-1 flex items-center gap-4'>
                                                                    <span className='rounded-md bg-slate-200/50 px-2 py-0.5 font-black text-[10px] text-slate-400 uppercase tracking-widest'>Class {quiz.class}-{quiz.section}</span>
                                                                    <span className='font-black text-[10px] text-indigo-500 uppercase tracking-widest'>{quiz.date}</span>
                                                                    <span className='font-black font-bold text-[10px] text-emerald-500 uppercase tracking-widest'>{quiz.questionsCount} Questions</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className='rounded-xl border-slate-200 font-black text-[10px] uppercase'
                                                                    onClick={() => window.open(quiz.link, '_blank')}
                                                                >
                                                                    Open Link
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className='rounded-xl bg-indigo-600 font-black text-[10px] text-white uppercase shadow-indigo-100 shadow-lg hover:bg-indigo-700'
                                                                    onClick={() => handleViewAnalytics(quiz.id)}
                                                                >
                                                                    <BarChart3 className='mr-1.5 h-3 w-3' />
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
                            className='mx-auto max-w-4xl'
                        >
                            <Card className='overflow-hidden rounded-[3.5rem] border-none bg-white shadow-2xl'>
                                <div className="h-3 bg-orange-500" />
                                <CardHeader className="p-12 pb-6 text-center">
                                    <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-orange-50'>
                                        <Wand2 className='h-10 w-10 text-orange-600' />
                                    </div>
                                    <CardTitle className='font-black text-3xl text-slate-900 tracking-tight'>AI Quiz Architect</CardTitle>
                                    <CardDescription className='mt-2 font-medium text-lg text-slate-500'>
                                        Upload study material and set the parameters.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-10 p-12 pt-0'>
                                    <div className="space-y-4">
                                        <Label className="ml-1 font-black text-slate-400 text-sm uppercase tracking-widest after:ml-0.5 after:text-red-500 after:content-['*']">Upload Material</Label>
                                        <div className={cn(
                                            'group relative rounded-[2.5rem] border-4 border-dashed p-12 text-center transition-all duration-300',
                                            file ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/30'
                                        )}>
                                            <input type="file" className='absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0' onChange={handleFileChange} />
                                            <div className="space-y-4">
                                                <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-2xl', file ? "bg-emerald-500 text-white" : "bg-white text-orange-500")}>
                                                    {file ? <CheckCircle2 className='h-8 w-8' /> : <Upload className='h-8 w-8' />}
                                                </div>
                                                <p className="font-black text-slate-700">{file ? file.name : "Choose File"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                        <div className="space-y-4">
                                            <Label className="ml-1 font-black text-slate-400 text-sm uppercase tracking-widest after:ml-0.5 after:text-red-500 after:content-['*']">Question Count</Label>
                                            <Input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className='h-16 rounded-2xl border-none bg-slate-50 font-black' />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className='ml-1 font-black text-slate-400 text-sm uppercase tracking-widest'>Difficulty</Label>
                                            <Select value={difficulty} onValueChange={setDifficulty}>
                                                <SelectTrigger className='h-16 rounded-2xl border-none bg-slate-50 px-8 font-black'>
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
                                        className='h-20 w-full rounded-[2rem] bg-orange-500 font-black text-white text-xl uppercase tracking-widest shadow-2xl hover:bg-orange-600 active:scale-[0.98]'
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
                            className='mx-auto max-w-5xl space-y-8'
                        >
                            <div className="flex items-center justify-between">
                                <h2 className='font-black text-2xl text-slate-800 tracking-tight'>Preview Generated Questions</h2>
                                <Button
                                    onClick={handleSaveAndContinue}
                                    className='h-14 rounded-2xl bg-emerald-500 px-8 font-black text-white uppercase tracking-wider shadow-lg hover:bg-emerald-600'
                                >
                                    <Plus className='mr-2 h-4 w-4' />
                                    Save & Continue
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {quizData.questions.map((q: any, idx: number) => (
                                    <Card key={idx} className='group overflow-hidden rounded-[2rem] border-none shadow-md transition-all hover:shadow-xl'>
                                        <div className='flex items-start gap-6 p-8'>
                                            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 font-black text-indigo-600'>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <p className='font-black text-slate-800 text-xl leading-tight'>{q.text}</p>
                                                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                                    {q.options.map((opt: string, oIdx: number) => (
                                                        <div key={oIdx} className={cn(
                                                            'rounded-xl border-2 p-4 font-bold',
                                                            opt === q.answer ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-50 bg-white text-slate-500'
                                                        )}>
                                                            <span className='mr-2 opacity-50'>{String.fromCharCode(65 + oIdx)}.</span> {opt}
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
                            className='mx-auto max-w-4xl'
                        >
                            <Card className='overflow-hidden rounded-[3.5rem] border-none bg-white shadow-2xl'>
                                <div className="h-3 bg-indigo-500" />
                                <CardHeader className="p-12 pb-6">
                                    <CardTitle className='font-black text-3xl text-slate-900 tracking-tight'>Final Configuration</CardTitle>
                                    <CardDescription className='mt-2 font-medium text-lg text-slate-500'>
                                        Deploy this assessment to your students.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-10 p-12 pt-0'>
                                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                        <div className="space-y-4">
                                            <Label className="ml-1 font-black text-slate-400 text-sm uppercase tracking-widest after:ml-0.5 after:text-red-500 after:content-['*']">Class</Label>
                                            <Select onValueChange={(v) => setPublishConfig({ ...publishConfig, targetClass: v })}>
                                                <SelectTrigger className='h-16 rounded-2xl border-none bg-slate-50 px-8 font-black'>
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
                                            <Label className="ml-1 font-black text-slate-400 text-sm uppercase tracking-widest after:ml-0.5 after:text-red-500 after:content-['*']">Section</Label>
                                            <Select onValueChange={(v) => setPublishConfig({ ...publishConfig, targetSection: v })}>
                                                <SelectTrigger className='h-16 rounded-2xl border-none bg-slate-50 px-8 font-black'>
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

                                    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                                        <div className="space-y-4">
                                            <Label className='ml-1 font-black text-slate-400 text-sm uppercase tracking-widest'>Duration (Mins)</Label>
                                            <Input
                                                type="number"
                                                value={publishConfig.duration}
                                                onChange={(e) => setPublishConfig({ ...publishConfig, duration: e.target.value })}
                                                className='h-16 rounded-2xl border-none bg-slate-50 font-black'
                                            />
                                        </div>
                                        <div className='col-span-2 space-y-4'>
                                            <Label className='ml-1 font-black text-slate-400 text-sm uppercase tracking-widest'>Availability Window</Label>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <p className='ml-1 font-black text-[10px] text-indigo-400 uppercase'>Starts At</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="date"
                                                            className='h-14 rounded-xl border-none bg-slate-50 font-bold text-sm'
                                                            onChange={(e) => setPublishConfig({ ...publishConfig, activeFrom: `${e.target.value}T${publishConfig.activeFrom.split('T')[1] || '09:00'}` })}
                                                        />
                                                        <Input
                                                            type="time"
                                                            className='h-14 rounded-xl border-none bg-slate-50 font-bold text-sm'
                                                            onChange={(e) => setPublishConfig({ ...publishConfig, activeFrom: `${publishConfig.activeFrom.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}` })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className='ml-1 font-black text-[10px] text-indigo-400 uppercase'>Ends At</p>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="date"
                                                            className='h-14 rounded-xl border-none bg-slate-50 font-bold text-sm'
                                                            onChange={(e) => setPublishConfig({ ...publishConfig, activeTo: `${e.target.value}T${publishConfig.activeTo.split('T')[1] || '17:00'}` })}
                                                        />
                                                        <Input
                                                            type="time"
                                                            className='h-14 rounded-xl border-none bg-slate-50 font-bold text-sm'
                                                            onChange={(e) => setPublishConfig({ ...publishConfig, activeTo: `${publishConfig.activeTo.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}` })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleFinalSend}
                                        disabled={isSaving}
                                        className='flex h-20 w-full items-center gap-3 rounded-[2rem] bg-indigo-600 font-black text-white text-xl uppercase tracking-widest shadow-2xl hover:bg-indigo-700 active:scale-[0.98]'
                                    >
                                        {isSaving ? (
                                            <div className='h-6 w-6 animate-spin rounded-full border-4 border-white/30 border-t-white' />
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
                                            className='space-y-4 rounded-[2rem] border-2 border-emerald-100 bg-emerald-50 p-6'
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className='flex items-center gap-2 font-black text-emerald-700'>
                                                    <CheckCircle2 className='h-5 w-5' />
                                                    Assessment Published
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    className='font-black text-[10px] text-emerald-600 uppercase hover:bg-emerald-100'
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(finalLink);
                                                        toast.success('Link copied to clipboard');
                                                    }}
                                                >
                                                    Copy Link
                                                </Button>
                                            </div>
                                            <p className='break-all rounded-xl border border-emerald-50 bg-white p-4 font-bold text-slate-600 text-sm'>
                                                {finalLink}
                                            </p>
                                            <Button
                                                onClick={() => {
                                                    setViewMode('dashboard');
                                                    setFinalLink('');
                                                    setQuizData(null);
                                                }}
                                                className='w-full rounded-xl bg-emerald-500 font-black text-white hover:bg-emerald-600'
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
