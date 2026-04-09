'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Trophy, Clock, Brain, CheckCircle2, ChevronRight, PlayCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function OnlineMcqQuizPage() {
    const [isStarted, setIsStarted] = useState(false);

    const quizStats = [
        { label: 'Total Questions', value: '25', icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Time Limit', value: '30 Mins', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Passing Mark', value: '40%', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const handleStartQuiz = () => {
        setIsStarted(true);
        toast.success('Quiz started! Good luck.');
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] p-4 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-500 rounded-2xl shadow-lg shadow-orange-100">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900 font-outfit">Online MCQ Quiz</h1>
                        </div>
                        <p className="text-slate-500 font-medium">Interactive assessment platform for students.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all font-bold"
                        >
                            <Info className="w-4 h-4 mr-2" />
                            Instructions
                        </Button>
                        {!isStarted && (
                            <Button
                                onClick={handleStartQuiz}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 shadow-lg shadow-orange-200 transition-all active:scale-95 font-bold"
                            >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Start New Quiz
                            </Button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quizStats.map((stat, idx) => (
                        <Card key={idx} className="border-none shadow-sm bg-white overflow-hidden rounded-3xl group hover:shadow-xl transition-all duration-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500" />
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-4 py-1 rounded-full font-bold uppercase tracking-wider text-[10px]">
                                        Available Quiz
                                    </Badge>
                                    <span className="text-sm font-bold text-slate-400">Physics Section A</span>
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-800 mt-4">General Relativity & Quantum Mechanics</CardTitle>
                                <CardDescription className="text-slate-500 font-medium">
                                    Testing fundamental concepts of space-time and sub-atomic particles.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">Advanced Mechanics Quiz</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase">Score: 85/100 • Completed</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 group cursor-pointer hover:bg-white hover:shadow-md transition-all">
                                        <div className="h-10 w-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800">Thermodynamics Basics</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase">20 Questions • Not Started</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar / Leaderboard */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="border-none shadow-xl bg-indigo-900 rounded-[2.5rem] overflow-hidden text-white">
                            <CardHeader className="p-8">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-400" />
                                    Top Performers
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                {[
                                    { name: 'Sameer Kumar', score: '98%', rank: 1 },
                                    { name: 'Anjali Sharma', score: '95%', rank: 2 },
                                    { name: 'Rahul V.', score: '92%', rank: 3 },
                                ].map((user, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group cursor-default">
                                        <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white/50 group-hover:bg-white/20 transition-all">
                                            {user.rank}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white/90">{user.name}</p>
                                            <div className="h-1 w-full bg-white/5 rounded-full mt-1.5 overflow-hidden">
                                                <div className="h-full bg-amber-400 rounded-full" style={{ width: user.score }} />
                                            </div>
                                        </div>
                                        <span className="font-black text-amber-400">{user.score}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .font-outfit { font-family: var(--font-outfit, sans-serif); }
            `}</style>
        </div>
    );
}
