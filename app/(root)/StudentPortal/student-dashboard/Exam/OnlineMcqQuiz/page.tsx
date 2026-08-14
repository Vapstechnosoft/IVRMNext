"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Sparkles, Clock, CheckCircle2, 
    PlayCircle, ArrowRight, BarChart3, AlertCircle,
    Brain, ChevronRight, X, FileText, ChevronLeft,
    TrendingUp, TrendingDown, Target, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function StudentOnlineMcqQuizPage() {
    // Current student ID (Mocked for now, usually from session)
    const [studentId] = useState('student-demo');
    
    // View States: 'dashboard' | 'taking-quiz' | 'result'
    const [viewMode, setViewMode] = useState<'dashboard' | 'taking-quiz' | 'result'>('dashboard');
    
    // Data States
    const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
    const [studentAnalytics, setStudentAnalytics] = useState<any>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Quiz Execution State
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);
    const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
    const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // 1. Load Published Quizzes
                const saved = localStorage.getItem('ai_published_quizzes');
                const quizzes = saved ? JSON.parse(saved) : [];
                
                // Filter by availability window (Only show if current time is within [activeFrom, activeTo])
                const now = new Date();
                const filteredQuizzes = quizzes.filter((quiz: any) => {
                    if (!quiz.activeFrom || !quiz.activeTo) return true; // Show if no window specified
                    const from = new Date(quiz.activeFrom);
                    const to = new Date(quiz.activeTo);
                    return now >= from && now <= to;
                });
                
                setAvailableQuizzes(filteredQuizzes);

                // 2. Load Student Analytics (To check attempts)
                const res = await fetch(`/api/exam/student-analytics/${studentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setStudentAnalytics(data);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load portal data');
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
        
        // Refresh filter every minute
        const interval = setInterval(loadDashboard, 60000);
        return () => clearInterval(interval);
    }, [studentId]);

    const handleStartQuiz = async (quiz: any) => {
        // 1. Check if already answered
        const attempts = Array.isArray(studentAnalytics?.attempts) ? studentAnalytics.attempts : [];
        const hasAttempted = attempts.some((a: any) => a.exam_id === quiz.id);

        if (hasAttempted) {
            toast.error('You have already attended this assessment');
            return;
        }

        // 2. Strict Availability Window Check
        const now = new Date();
        if (quiz.activeTo && now > new Date(quiz.activeTo)) {
            toast.error('This assessment window has closed and is no longer accessible.');
            // Re-filter list
            setAvailableQuizzes(prev => prev.filter(q => q.id !== quiz.id));
            return;
        }

        if (quiz.activeFrom && now < new Date(quiz.activeFrom)) {
            toast.error('This assessment is not yet active.');
            return;
        }

        setSelectedQuiz(quiz);
        setLoading(true);

        try {
            const res = await fetch(`/api/exam/get-quiz-details/${quiz.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSelectedQuiz({ ...quiz, ...data });
            setViewMode('taking-quiz');
            setCurrentQuestionIdx(0);
            setUserAnswers({});
        } catch (err: any) {
            toast.error('Cannot load quiz: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);
        try {
            const formattedAnswers = selectedQuiz.questions.map((q: any, idx: number) => ({
                question_id: q.id || idx + 1,
                selected: userAnswers[idx] || ""
            }));

            const res = await fetch('/api/exam/submit-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam_id: selectedQuiz.id,
                    student_id: studentId,
                    answers: formattedAnswers,
                    time_taken: 120 // Mock value
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setSubmissionResult(data);
            setViewMode('result');
            toast.success('Quiz submitted successfully!');
        } catch (err: any) {
            toast.error('Submission failed: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetDetailedAnalysis = async () => {
        setIsFetchingAnalysis(true);
        try {
            const res = await fetch(`/api/exam/student-analytics/${studentId}`);
            if (!res.ok) throw new Error('Failed to fetch detailed analytics');
            const data = await res.json();
            setDetailedAnalysis(data);
            setShowAnalysisModal(true);
        } catch (err: any) {
            toast.error(err.message || 'Analysis unavailable at the moment');
        } finally {
            setIsFetchingAnalysis(false);
        }
    };

    if (loading && viewMode === 'dashboard') {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Syncing Active Assessments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] lg:p-8 font-outfit">
            <div className="container mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Student Quiz Portal</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Verify your knowledge and track your AI-driven performance.</p>
                    </div>
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
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Active', value: availableQuizzes.length.toString(), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                                    { label: 'Completed', value: studentAnalytics?.total_attempts || '0', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                    { label: 'Avg score', value: (studentAnalytics?.average_score || 0).toFixed(1) + '%', color: 'text-blue-500', bg: 'bg-blue-50' },
                                    { label: 'Global Rank', value: '#12', color: 'text-orange-500', bg: 'bg-orange-50' },
                                ].map((stat, i) => (
                                    <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white group hover:shadow-xl transition-all">
                                        <CardContent className="p-8">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                            <p className={cn("text-3xl font-black mt-1", stat.color)}>{stat.value}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Quiz Feed */}
                                <div className="lg:col-span-2 space-y-6">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <PlayCircle className="w-5 h-5 text-indigo-500" />
                                        Active Assessments
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {availableQuizzes.map((quiz, i) => {
                                            // Check if this quiz was already attempted
                                            const attempts = Array.isArray(studentAnalytics?.attempts) ? studentAnalytics.attempts : [];
                                            const attempt = attempts.find((a: any) => a.exam_id === quiz.id);
                                            const isAnswered = !!attempt;

                                            return (
                                                <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                                                    <div className={cn("h-2 w-full", isAnswered ? "bg-emerald-500" : "bg-indigo-500")} />
                                                    <CardContent className="p-8 space-y-6">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Badge variant="outline" className="rounded-full bg-slate-50 border-none text-[10px] font-black uppercase text-slate-400 px-3 py-1">
                                                                    {quiz.duration} Mins
                                                                </Badge>
                                                                {isAnswered && (
                                                                    <Badge className="rounded-full bg-emerald-100 text-emerald-700 border-none text-[10px] font-black uppercase px-3 py-1">
                                                                        Completed
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <h4 className="text-xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                                {quiz.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                                                            <div className="flex items-center gap-1.5">
                                                                <FileText className="w-3.5 h-3.5" />
                                                                {quiz.questionsCount || 5} MCQs
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {quiz.date || 'Today'}
                                                            </div>
                                                        </div>
                                                        
                                                        {isAnswered ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 p-3 rounded-xl justify-center">
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                    Already Attended
                                                                </div>
                                                                <Button 
                                                                    onClick={() => {
                                                                        setSubmissionResult(attempt);
                                                                        setViewMode('result');
                                                                    }}
                                                                    variant="outline"
                                                                    className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-2xl h-14 font-black uppercase tracking-widest text-xs transition-all"
                                                                >
                                                                    View Results
                                                                    <BarChart3 className="ml-2 w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button 
                                                                onClick={() => handleStartQuiz(quiz)}
                                                                className="w-full bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 group-hover:shadow-indigo-200 transition-all"
                                                            >
                                                                Start Assessment
                                                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Results History / Side Panel */}
                                <div className="space-y-6">
                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                                        Recent Performance
                                    </h3>
                                    <div className="space-y-4">
                                        {Array.isArray(studentAnalytics?.attempts) && studentAnalytics.attempts.length > 0 ? (
                                            studentAnalytics.attempts.slice(0, 5).map((attempt: any, i: number) => (
                                                <Card key={i} className="border-none shadow-sm rounded-2xl bg-white p-4 hover:shadow-md transition-all cursor-pointer"
                                                onClick={() => {
                                                    setSubmissionResult(attempt);
                                                    setViewMode('result');
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-slate-800 truncate">{attempt.quiz_title || 'General Quiz'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date().toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-emerald-600">{((attempt.score / attempt.total_questions) * 100).toFixed(0)}%</p>
                                                        <p className="text-[10px] font-bold text-slate-300 uppercase">Score</p>
                                                    </div>
                                                </div>
                                            </Card>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Past Records</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : viewMode === 'taking-quiz' ? (
                        <motion.div
                            key="quiz-session"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto"
                        >
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{selectedQuiz.title}</p>
                                        <h3 className="text-xl font-black tracking-tight">Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}</h3>
                                    </div>
                                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl border border-white/10 text-indigo-400">
                                        {Math.round(((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100)}%
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-slate-800">
                                    <motion.div 
                                        className="h-full bg-indigo-500" 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentQuestionIdx + 1) / selectedQuiz.questions.length) * 100}%` }}
                                    />
                                </div>
                                <CardContent className="p-12 space-y-8">
                                    <p className="text-2xl font-black text-slate-800 leading-tight">
                                        {selectedQuiz.questions[currentQuestionIdx].question_text || selectedQuiz.questions[currentQuestionIdx].text}
                                    </p>

                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedQuiz.questions[currentQuestionIdx].options.map((option: string, oIdx: number) => {
                                            const isSelected = userAnswers[currentQuestionIdx] === option;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestionIdx]: option }))}
                                                    className={cn(
                                                        "group flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300",
                                                        isSelected 
                                                            ? "bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100" 
                                                            : "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "h-8 w-8 rounded-lg flex items-center justify-center font-black transition-colors shrink-0",
                                                        isSelected ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                                    )}>
                                                        {String.fromCharCode(65 + oIdx)}
                                                    </div>
                                                    <span className={cn("font-bold text-lg", isSelected ? "text-indigo-900" : "text-slate-600")}>
                                                        {option}
                                                    </span>
                                                    {isSelected && <CheckCircle2 className="ml-auto w-6 h-6 text-indigo-500" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-12 pt-0 flex justify-between gap-4">
                                    <Button
                                        variant="ghost"
                                        disabled={currentQuestionIdx === 0}
                                        onClick={() => setCurrentQuestionIdx(idx => idx - 1)}
                                        className="h-16 px-8 rounded-2xl font-black text-slate-400 uppercase tracking-widest"
                                    >
                                        <ChevronLeft className="mr-2 h-5 w-5" />
                                        Back
                                    </Button>
                                    
                                    {currentQuestionIdx === selectedQuiz.questions.length - 1 ? (
                                        <Button
                                            onClick={handleSubmitQuiz}
                                            disabled={isSubmitting || !userAnswers[currentQuestionIdx]}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-12 h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-emerald-100"
                                        >
                                            {isSubmitting ? "Submitting..." : "Submit Answers"}
                                            {!isSubmitting && <Sparkles className="ml-2 w-5 h-5" />}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setCurrentQuestionIdx(idx => idx + 1)}
                                            disabled={!userAnswers[currentQuestionIdx]}
                                            className="bg-slate-900 hover:bg-black text-white rounded-2xl px-12 h-16 text-lg font-black uppercase tracking-widest shadow-xl shadow-slate-200"
                                        >
                                            Next Question
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result-view"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-3xl mx-auto text-center"
                        >
                            <Card className="border-none shadow-2xl bg-white rounded-[4rem] overflow-hidden">
                                <div className="h-3 bg-emerald-500 w-full" />
                                <CardContent className="p-16 space-y-10">
                                    <div className="relative mx-auto w-40 h-40">
                                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                                        <div className="relative z-10 w-40 h-40 bg-emerald-50 border-8 border-white shadow-2xl rounded-full flex items-center justify-center">
                                            <Trophy className="w-20 h-20 text-emerald-500" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Assessment Success!</h2>
                                        <p className="text-slate-500 text-xl font-medium">Your score has been recorded and AI will now analyze your gaps.</p>
                                    </div>

                                    <div className="flex justify-center gap-12 py-6 border-y border-slate-50">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Performance</p>
                                            <p className="text-6xl font-black text-emerald-500 tracking-tighter">
                                                {submissionResult?.correct_answers || '0'}<span className="text-slate-200 text-3xl font-light">/</span>{submissionResult?.total_questions || '5'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Reward</p>
                                            <div className="flex items-center justify-center gap-2 text-indigo-500">
                                                <Sparkles className="w-6 h-6" />
                                                <span className="text-4xl font-black">+45 XP</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <Button 
                                            onClick={handleGetDetailedAnalysis}
                                            disabled={isFetchingAnalysis}
                                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl transition-all"
                                        >
                                            {isFetchingAnalysis ? "Analyzing..." : "Get detailed performance analysis"}
                                            {!isFetchingAnalysis && <Brain className="ml-2 w-5 h-5" />}
                                        </Button>

                                        <Button 
                                            onClick={() => setViewMode('dashboard')}
                                            variant="ghost"
                                            className="w-full h-16 text-slate-400 hover:text-slate-900 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all"
                                        >
                                            Return to Portal Dashboard
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detailed Analysis Modal */}
                <AnimatePresence>
                    {showAnalysisModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden"
                            >
                                <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                            <Brain className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black">AI Performance Report</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Student ID: {studentId}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => setShowAnalysisModal(false)}
                                        className="h-12 w-12 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>

                                <div className="p-10 space-y-8">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-emerald-50 rounded-[2rem] space-y-1">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Average Score</p>
                                            <p className="text-3xl font-black text-emerald-700">{detailedAnalysis?.average_score?.toFixed(1)}%</p>
                                        </div>
                                        <div className="p-6 bg-indigo-50 rounded-[2rem] space-y-1">
                                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Attempts</p>
                                            <p className="text-3xl font-black text-indigo-700">{detailedAnalysis?.attempts}</p>
                                        </div>
                                    </div>

                                    {/* Topics Analysis */}
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                                Strong Proficiency
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {detailedAnalysis?.strong_topics?.length > 0 ? (
                                                    detailedAnalysis.strong_topics.map((topic: string, i: number) => (
                                                        <Badge key={i} className="bg-emerald-100 text-emerald-700 border-none px-4 py-2 rounded-xl font-bold">
                                                            {topic}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-400 italic">No strong topics identified yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                                                <TrendingDown className="w-4 h-4 text-rose-500" />
                                                Improvement Areas
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {detailedAnalysis?.weak_topics?.length > 0 ? (
                                                    detailedAnalysis.weak_topics.map((topic: string, i: number) => (
                                                        <Badge key={i} className="bg-rose-100 text-rose-700 border-none px-4 py-2 rounded-xl font-bold">
                                                            {topic}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-xs font-bold text-slate-400 italic">No significant gaps found. Keep it up!</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="bg-slate-50 p-6 rounded-[2rem] flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-xl shadow-sm">
                                                <Target className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1">AI Recommendation</p>
                                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                                    Based on your performance, we recommend focusing on <span className="text-indigo-600 font-bold">{detailedAnalysis?.weak_topics?.[0] || 'general revision'}</span>. 
                                                    Your proficiency in {detailedAnalysis?.strong_topics?.[0] || 'core concepts'} is excellent.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => setShowAnalysisModal(false)}
                                        className="w-full h-16 bg-slate-900 hover:bg-black text-white rounded-[1.5rem] font-black uppercase tracking-widest"
                                    >
                                        Close Report
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
