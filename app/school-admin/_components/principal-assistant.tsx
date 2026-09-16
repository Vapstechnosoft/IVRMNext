'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type AssistantResponse, getPrincipalAssistantResponse } from '@/server/dashboards/principal-assistant';
import { ArrowUpRight, Bot, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, Lightbulb, RefreshCw, Send, Sparkles, X } from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const SIXTEEN_QUESTIONS = [
    { id: 'fail_risk', text: 'Which students might fail this term?', category: 'Academics' },
    { id: 'attendance_alert', text: 'Which classes have attendance problems?', category: 'Attendance' },
    { id: 'fee_projection', text: 'How much fee will we collect this year?', category: 'Finance' },
    { id: 'teacher_load', text: 'Which teachers are overloaded?', category: 'Staff' },
    { id: 'admission_dropout', text: 'Which new admissions might drop out?', category: 'Admissions' },
    { id: 'subject_pass_rate', text: 'Which subjects have low pass rate?', category: 'Academics' },
    { id: 'top_students', text: 'Who are the top students?', category: 'Academics' },
    { id: 'teacher_performance', text: 'Which teachers get best results?', category: 'Staff' },
    { id: 'remedial_subjects', text: 'Which subjects need extra help?', category: 'Academics' },
    { id: 'transport_occupancy', text: 'Which bus routes are underused?', category: 'Operations' },
    { id: 'hostel_capacity', text: 'How full is the hostel?', category: 'Operations' },
    { id: 'library_overdue', text: 'Who has overdue library books?', category: 'Operations' },
    { id: 'inventory_shortage', text: 'What supplies are running low?', category: 'Operations' },
    { id: 'staff_lateness', text: 'Which staff come late often?', category: 'Staff' },
    { id: 'financial_summary', text: "Today's money summary?", category: 'Finance' },
    { id: 'school_health', text: 'Overall school health score?', category: 'Overview' }
];

const isGreetingQuery = (query: string): boolean => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    const greetings = [
        'hi',
        'hello',
        'hey',
        'heya',
        'howdy',
        'hola',
        'namaste',
        'vanakkam',
        'pranam',
        'good morning',
        'good afternoon',
        'good evening',
        'good day',
        'how are you',
        'who are you',
        'what are you',
        'what can you do',
        'help',
        'help me',
        'what do you do',
        'introduce yourself',
        'what is this',
        'commands',
        'menu',
        'options',
        'queries',
        'list',
        'thank you',
        'thanks',
        'bye',
        'goodbye',
        'welcome',
        'test'
    ];

    const metricKeywords = [
        'fail',
        'failing',
        'grade',
        'marks',
        'attendance',
        'absent',
        'bunk',
        'fee',
        'collect',
        'receivable',
        'teacher',
        'overload',
        'workload',
        'period',
        'dropout',
        'admission',
        'pass rate',
        'pass percentage',
        'top student',
        'topper',
        'remedial',
        'bus',
        'route',
        'transport',
        'hostel',
        'library',
        'overdue',
        'supply',
        'supplies',
        'inventory',
        'shortage',
        'late',
        'punch',
        'money',
        'financial',
        'health score',
        'health card',
        'kpi'
    ];

    const hasMetricKeyword = metricKeywords.some((kw) => q.includes(kw));
    if (hasMetricKeyword) return false;

    return greetings.some((g) => q === g || q.startsWith(`${g} `) || q.endsWith(` ${g}`) || q.includes(g));
};

const findBestMatch = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q || isGreetingQuery(q)) return null;

    // Find exact or substring match
    const bestMatch = SIXTEEN_QUESTIONS.find((item) => q.includes(item.text.toLowerCase()) || item.text.toLowerCase().includes(q));
    if (bestMatch) return bestMatch;

    // Otherwise match by keywords
    const keywords: Record<string, string[]> = {
        fail_risk: ['fail', 'risk', 'failed', 'failing', 'grade', 'marks', 'passing'],
        attendance_alert: ['attendance', 'absent', 'absence', 'bunk', 'problem', 'present'],
        fee_projection: ['fee', 'collect', 'receivable', 'money this year', 'yearly fee', 'outstanding'],
        teacher_load: ['teacher', 'overload', 'workload', 'period', 'hours', 'overloaded'],
        admission_dropout: ['dropout', 'admissions', 'drop', 'new student', 'withdraw'],
        subject_pass_rate: ['subject', 'pass rate', 'pass percentage', 'low pass'],
        top_students: ['top student', 'topper', 'best student', 'highest score', 'rank'],
        teacher_performance: ['teacher result', 'teacher performance', 'best result', 'highest rating'],
        remedial_subjects: ['extra help', 'remedial', 'weak subject', 'support'],
        transport_occupancy: ['bus', 'route', 'transport', 'underused', 'occupancy'],
        hostel_capacity: ['hostel', 'room', 'bed', 'occupancy', 'hostel capacity'],
        library_overdue: ['library', 'book', 'overdue', 'return', 'delayed'],
        inventory_shortage: ['supply', 'supplies', 'inventory', 'running low', 'stock', 'shortage'],
        staff_lateness: ['late', 'staff late', 'come late', 'punch late', 'delay'],
        financial_summary: ['money summary', 'collection today', 'financial today', 'today collection', 'income today'],
        school_health: ['health score', 'health card', 'overall school', 'report card', 'kpi']
    };

    for (const [id, list] of Object.entries(keywords)) {
        if (list.some((kw) => q.includes(kw))) {
            return SIXTEEN_QUESTIONS.find((item) => item.id === id);
        }
    }
    return null;
};

const CHART_COLORS = ['#8b5cf6', '#f97316', '#10b981', '#3b82f6', '#ec4899', '#f59e0b'];

export function PrincipalAssistant() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState<AssistantResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAllQuestions, setShowAllQuestions] = useState(false);

    const handleAsk = async (questionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPrincipalAssistantResponse(questionId);
            setResponse(data);
        } catch (e) {
            console.error(e);
            setError('Failed to fetch analysis from ERP system. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (!trimmed) return;

        if (isGreetingQuery(trimmed)) {
            handleAsk('greeting');
            return;
        }

        const match = findBestMatch(trimmed);
        if (match) {
            handleAsk(match.id);
        } else {
            handleAsk(trimmed);
        }
    };

    const handleClear = () => {
        setResponse(null);
        setQuery('');
        setError(null);
    };

    return (
        <Card className='card-premium mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white text-slate-900 shadow-sm'>
            <CardHeader className='relative border-slate-50 border-b pb-4'>
                <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-650'>
                        <Sparkles size={20} className='animate-pulse text-indigo-600' />
                    </div>
                    <div>
                        <CardTitle className='flex items-center gap-2 font-black text-lg text-slate-800 tracking-tight'>
                            Principal Assistant{' '}
                            <Badge className='border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 font-bold text-[9px] text-indigo-700'>
                                AI Insights
                            </Badge>
                        </CardTitle>
                        <CardDescription className='mt-0.5 font-bold text-slate-400 text-xs'>
                            Query key school performance metrics across academics, attendance, finance, and transport.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
                {/* Search Bar */}
                <form onSubmit={handleSubmit} className='flex gap-2'>
                    <div className='relative flex-1'>
                        <Bot className='absolute top-3.5 left-4 h-5 w-5 text-indigo-500' />
                        <Input
                            type='text'
                            placeholder="Ask me: 'How much fee will we collect?' or 'Which students might fail?'"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className='h-12 w-full rounded-2xl border border-slate-200 border-slate-205 bg-slate-50 pl-12 font-semibold text-slate-900 text-sm placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus-visible:ring-1 focus-visible:ring-indigo-500'
                        />
                    </div>
                    <Button
                        type='submit'
                        disabled={loading}
                        className='flex h-12 w-auto flex-shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-6 font-bold text-white shadow-indigo-600/10 shadow-lg hover:bg-indigo-500'>
                        <Send size={16} />
                        <span>Ask AI</span>
                    </Button>
                </form>

                {/* Error Banner */}
                {error && (
                    <div className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700 text-xs'>
                        <HelpCircle size={18} className='shrink-0 text-red-500' />
                        <div>{error}</div>
                    </div>
                )}

                {/* Quick Selection Chips */}
                {!response && (
                    <div className='space-y-3'>
                        <div className='flex items-center justify-between font-bold text-slate-400 text-xs uppercase tracking-wider'>
                            <span>Select an Administrative Query</span>
                            <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() => setShowAllQuestions(!showAllQuestions)}
                                className='flex h-auto items-center gap-1 p-0 font-bold text-indigo-600 hover:bg-slate-50 hover:text-indigo-700'>
                                {showAllQuestions ? 'Show Less' : 'Show All 16'}
                                {showAllQuestions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </Button>
                        </div>
                        <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                            {SIXTEEN_QUESTIONS.slice(0, showAllQuestions ? 16 : 6).map((q) => (
                                <button
                                    key={q.id}
                                    type='button'
                                    onClick={() => {
                                        setQuery(q.text);
                                        handleAsk(q.id);
                                    }}
                                    className='group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-left font-semibold text-slate-600 text-xs transition-all hover:border-indigo-100 hover:bg-slate-100/80 hover:text-indigo-700'>
                                    <span>{q.text}</span>
                                    <ArrowUpRight
                                        size={14}
                                        className='ml-2 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-600'
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className='flex flex-col items-center justify-center space-y-4 py-10'>
                        <RefreshCw className='h-8 w-8 animate-spin text-indigo-600' />
                        <div className='animate-pulse font-bold text-slate-400 text-xs uppercase tracking-widest'>
                            VAPS AI is analyzing ERP Databases...
                        </div>
                    </div>
                )}

                {/* AI Insights Response Section */}
                {response &&
                    !loading &&
                    (response.isGreeting ? (
                        <div className='fade-in zoom-in-95 animate-in space-y-6 rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 shadow-sm duration-500'>
                            {/* Greeting Header */}
                            <div className='flex items-start justify-between gap-4'>
                                <div className='flex items-start gap-3.5'>
                                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-600 text-white shadow-indigo-200 shadow-md'>
                                        <Sparkles className='h-6 w-6 animate-pulse' />
                                    </div>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span className='rounded-full border border-indigo-200 bg-indigo-100/70 px-2.5 py-0.5 font-black text-[10px] text-indigo-700 uppercase tracking-wider'>
                                                👋 AI Assistant Ready
                                            </span>
                                        </div>
                                        <h3 className='mt-1.5 font-black text-slate-800 text-xl tracking-tight'>
                                            {response.matchedQuestion || 'Welcome, Principal!'}
                                        </h3>
                                        <p className='mt-1 max-w-2xl font-medium text-slate-600 text-sm leading-relaxed'>
                                            {response.greetingMessage ||
                                                "Hello Principal! I am your AI Administrative Assistant. I'm ready to provide real-time analysis on your institution's academics, student attendance, fee collections, teacher workloads, and overall school health."}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleClear}
                                    className='h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-200/50 hover:text-slate-700'>
                                    <X size={18} />
                                </Button>
                            </div>

                            {/* Prompt Banner */}
                            <div className='flex items-center gap-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-indigo-900 text-xs shadow-xs'>
                                <Lightbulb size={16} className='shrink-0 text-amber-500' />
                                <span className='font-semibold'>
                                    Please select an administrative query from the list below to get instant insights and predictions:
                                </span>
                            </div>

                            {/* Query Selection Grid */}
                            <div className='space-y-3 pt-1'>
                                <div className='grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3'>
                                    {SIXTEEN_QUESTIONS.map((q) => (
                                        <button
                                            key={q.id}
                                            type='button'
                                            onClick={() => {
                                                setQuery(q.text);
                                                handleAsk(q.id);
                                            }}
                                            className='group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-3.5 text-left font-semibold text-slate-700 text-xs transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-xs'>
                                            <div className='flex items-center gap-2.5'>
                                                <span className='rounded-lg bg-slate-100 px-2 py-0.5 font-bold text-[9px] text-slate-500 uppercase tracking-wide group-hover:bg-indigo-100 group-hover:text-indigo-700'>
                                                    {q.category}
                                                </span>
                                                <span className='text-slate-700 group-hover:text-indigo-950'>{q.text}</span>
                                            </div>
                                            <ArrowUpRight
                                                size={14}
                                                className='group-hover:-translate-y-0.5 ml-2 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600'
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='fade-in zoom-in-95 animate-in space-y-6 rounded-3xl border border-slate-100 bg-slate-50/60 p-6 duration-500'>
                            {/* Title Header */}
                            <div className='flex items-start justify-between'>
                                <div>
                                    <span className='rounded-full border border-emerald-200/50 bg-emerald-50 px-2 py-0.5 font-black text-[9px] text-emerald-700 uppercase tracking-widest'>
                                        Resolved AI Query
                                    </span>
                                    <h3 className='mt-1.5 font-black text-lg text-slate-800'>{response.matchedQuestion}</h3>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setShowAllQuestions(!showAllQuestions)}
                                        className='h-8 rounded-xl border-slate-200 font-bold text-indigo-600 text-xs hover:bg-indigo-50 hover:text-indigo-700'>
                                        {showAllQuestions ? 'Hide Queries' : 'Explore Other Queries'}
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        onClick={handleClear}
                                        className='h-8 w-8 rounded-xl text-slate-450 hover:bg-slate-200/50 hover:text-slate-700'>
                                        <X size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Switch Queries dropdown if toggled */}
                            {showAllQuestions && (
                                <div className='fade-in animate-in rounded-2xl border border-indigo-100 bg-white p-4 duration-300'>
                                    <div className='mb-2.5 font-bold text-slate-400 text-xs uppercase tracking-wider'>
                                        Select Another Query
                                    </div>
                                    <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3'>
                                        {SIXTEEN_QUESTIONS.map((q) => (
                                            <button
                                                key={q.id}
                                                type='button'
                                                onClick={() => {
                                                    setQuery(q.text);
                                                    handleAsk(q.id);
                                                    setShowAllQuestions(false);
                                                }}
                                                className='group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left font-semibold text-slate-600 text-xs transition-all hover:border-indigo-100 hover:bg-indigo-50/50 hover:text-indigo-700'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='rounded bg-slate-200/60 px-1.5 py-0.5 font-bold text-[9px] text-slate-600 uppercase'>
                                                        {q.category}
                                                    </span>
                                                    <span>{q.text}</span>
                                                </div>
                                                <ArrowUpRight
                                                    size={13}
                                                    className='ml-1.5 shrink-0 text-slate-400 group-hover:text-indigo-600'
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stats Row */}
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                {response.numbers.map((num, i) => (
                                    <div
                                        key={i}
                                        className='flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
                                        <span className='font-bold text-[10px] text-slate-400 uppercase tracking-wider'>{num.label}</span>
                                        <div className='mt-2 flex items-baseline gap-2'>
                                            <span className='font-black text-2xl text-slate-900'>{num.value}</span>
                                            {num.change && (
                                                <span
                                                    className={cn(
                                                        'rounded-md px-1.5 py-0.5 font-black text-[10px]',
                                                        num.isPositive === undefined
                                                            ? 'bg-slate-100 text-slate-650'
                                                            : num.isPositive
                                                              ? 'bg-emerald-50 text-emerald-700'
                                                              : 'bg-red-50 text-red-600'
                                                    )}>
                                                    {num.change}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chart and Graph Rendering */}
                            <div className='grid grid-cols-1 items-center gap-6 lg:grid-cols-12'>
                                {/* Recharts Component */}
                                <div className='h-64 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7'>
                                    <ResponsiveContainer width='100%' height='100%'>
                                        {response.chartType === 'bar' ? (
                                            <BarChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                                <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                                <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e2e8f0',
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                                {response.chartData.length > 0 &&
                                                    Object.keys(response.chartData[0])
                                                        .filter((k) => k !== 'name')
                                                        .map((key, i) => (
                                                            <Bar
                                                                key={key}
                                                                dataKey={key}
                                                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                                radius={[4, 4, 0, 0]}
                                                            />
                                                        ))}
                                            </BarChart>
                                        ) : response.chartType === 'line' ? (
                                            <LineChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                                <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                                <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e2e8f0',
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                                {response.chartData.length > 0 &&
                                                    Object.keys(response.chartData[0])
                                                        .filter((k) => k !== 'name')
                                                        .map((key, i) => (
                                                            <Line
                                                                key={key}
                                                                type='monotone'
                                                                dataKey={key}
                                                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                                strokeWidth={3}
                                                                dot={{ r: 4 }}
                                                            />
                                                        ))}
                                            </LineChart>
                                        ) : response.chartType === 'area' ? (
                                            <AreaChart data={response.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                                                <XAxis dataKey='name' stroke='#64748b' fontSize={10} tickLine={false} />
                                                <YAxis stroke='#64748b' fontSize={10} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e2e8f0',
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                                {response.chartData.length > 0 &&
                                                    Object.keys(response.chartData[0])
                                                        .filter((k) => k !== 'name')
                                                        .map((key, i) => (
                                                            <Area
                                                                key={key}
                                                                type='monotone'
                                                                dataKey={key}
                                                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                                fillOpacity={0.1}
                                                                strokeWidth={2.5}
                                                            />
                                                        ))}
                                            </AreaChart>
                                        ) : response.chartType === 'radar' ? (
                                            <RadarChart
                                                cx='50%'
                                                cy='50%'
                                                data={response.chartData}
                                                outerRadius='75%'
                                                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                                <PolarGrid stroke='#e2e8f0' />
                                                <PolarAngleAxis dataKey='subject' stroke='#64748b' fontSize={9} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke='#94a3b8' fontSize={8} />
                                                {response.chartData.length > 0 &&
                                                    Object.keys(response.chartData[0])
                                                        .filter((k) => k !== 'subject')
                                                        .map((key, i) => (
                                                            <Radar
                                                                key={key}
                                                                name={key === 'A' ? 'Evaluated' : key === 'rating' ? 'Current Rating' : key}
                                                                dataKey={key}
                                                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                                                                fillOpacity={0.2}
                                                            />
                                                        ))}
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e2e8f0',
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                            </RadarChart>
                                        ) : (
                                            <PieChart>
                                                <Pie
                                                    data={response.chartData}
                                                    cx='50%'
                                                    cy='50%'
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={4}
                                                    dataKey='value'>
                                                    {response.chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#ffffff',
                                                        borderColor: '#e2e8f0',
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 12px -2px rgba(0,0,0,0.05)'
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign='bottom'
                                                    height={36}
                                                    iconSize={8}
                                                    iconType='circle'
                                                    wrapperStyle={{ fontSize: '10px' }}
                                                />
                                            </PieChart>
                                        )}
                                    </ResponsiveContainer>
                                </div>

                                {/* Recommendations Block */}
                                <div className='space-y-4 rounded-3xl border border-slate-100 bg-gradient-to-br from-indigo-50/20 to-slate-50 p-5 shadow-sm lg:col-span-5'>
                                    <div className='flex items-center gap-2 text-indigo-600'>
                                        <Lightbulb size={18} className='animate-bounce text-amber-500' />
                                        <h4 className='font-black text-xs uppercase tracking-wider'>AI Recommendations</h4>
                                    </div>
                                    <div className='space-y-3'>
                                        {response.recommendations.map((rec, i) => (
                                            <div key={i} className='flex items-start gap-2.5'>
                                                <CheckCircle2 size={14} className='mt-0.5 shrink-0 text-emerald-500' />
                                                <p className='font-semibold text-slate-600 text-xs leading-relaxed'>{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </CardContent>
        </Card>
    );
}
