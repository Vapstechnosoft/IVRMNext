'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Users, TrendingUp, Lightbulb, Activity, X, ChevronRight } from 'lucide-react';
import { fetchAdmissionAnalytics } from './actions';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';

interface AnalyticsData {
    total_admissions: number;
    year_wise: { academic_year: string; total: number }[];
    class_wise: { ASMCL_ClassName: string; total: number }[];
    historical_admissions: { academic_year: string; total: number }[];
    funnel_analysis: { status: string }[];
    regression_values: number[];
    predicted_admissions: number;
    growth_status: string;
    ai_insight: string;
}

const COLORS = ['#6366f1', '#14b8a6', '#0ea5e9', '#f59e0b', '#84cc16', '#64748b'];
const FUNNEL_COLORS = ['bg-green-600', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-600', 'bg-red-500'];

const SectionHeader = ({ title, showViewAll = true }: { title: string, showViewAll?: boolean }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
        {showViewAll && (
            <Button variant="ghost" size="sm" className="text-slate-400 font-bold hover:bg-slate-50 hover:text-slate-600 rounded-lg px-2 h-7 text-[10px]">
                View All <ChevronRight size={10} className="ml-0.5" />
            </Button>
        )}
    </div>
);

export function AdmissionAnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showHistoricalModal, setShowHistoricalModal] = useState(false);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const result = await fetchAdmissionAnalytics();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch admission analytics", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (isLoading || !data) {
        return <div className="h-64 flex items-center justify-center">Loading Analytics...</div>;
    }

    const lineChartData = data.year_wise.map((item, index) => ({
        name: item.academic_year,
        'Actual Admissions': item.total,
        'Predicted Admissions': Math.round(data.regression_values[index] || 0)
    }));

    // For Pie Chart, showing top 5 and grouping others to match screenshot style
    const sortedClasses = [...data.class_wise].sort((a, b) => b.total - a.total);
    const top5 = sortedClasses.slice(0, 5);
    const othersTotal = sortedClasses.slice(5).reduce((acc, curr) => acc + curr.total, 0);

    const pieData = [
        ...top5.map(item => ({ name: item.ASMCL_ClassName, value: item.total })),
        ...(othersTotal > 0 ? [{ name: 'Others', value: othersTotal }] : [])
    ];

    const formatPercentage = (value: number) => {
        return ((value / data.total_admissions) * 100).toFixed(1) + '%';
    };

    return (
        <div className="space-y-6 mt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Dashboard Analytics</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Comprehensive overview of admissions and trends</p>
                </div>
            </div>

            {/* 4 Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 card-premium">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                        <Users size={16} className="text-slate-700" />
                    </div>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Total Admissions</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data.total_admissions.toLocaleString()}</h3>
                    <p className="text-slate-400 font-bold text-[10px] mt-4">All academic years</p>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 card-premium">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                        <TrendingUp size={16} className="text-red-500" />
                    </div>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Predicted Admissions</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data.predicted_admissions}</h3>
                    <p className="text-teal-500 font-bold text-[10px] mt-4">2027-2028</p>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-5 card-premium">
                    <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center mb-4">
                        <Activity size={16} className="text-orange-500" />
                    </div>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Growth Status</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{data.growth_status}</h3>
                    <p className="text-slate-400 font-bold text-[10px] mt-4">Compared to current trend</p>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-sky-50 border border-sky-100 p-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-amber-500" />
                        <span className="font-bold text-slate-900 text-sm">AI Insight</span>
                    </div>
                    <p className="text-slate-700 text-sm font-medium leading-relaxed mt-2">{data.ai_insight}</p>
                </Card>
            </div>

            {/* Middle Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Linear Regression */}
                <Card className="lg:col-span-8 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Linear Regression Prediction" showViewAll={true} />
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} interval="preserveStartEnd" minTickGap={30} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', backgroundColor: '#1e293b', color: 'white' }} itemStyle={{ color: 'white' }} />
                                <Line type="monotone" dataKey="Actual Admissions" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Predicted Admissions" stroke="#0f172a" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4">
                        <button onClick={() => setShowHistoricalModal(true)} className="text-indigo-500 font-bold text-[11px] hover:underline">
                            View historical admissions &rarr;
                        </button>
                    </div>
                </Card>

                {/* Pie Chart */}
                <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Class-wise Distribution" showViewAll={false} />
                    <div className="flex flex-col items-center">
                        <div className="relative h-48 w-48 mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-black text-slate-900">{data.total_admissions.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-slate-400">Total</span>
                            </div>
                        </div>
                        <div className="w-full space-y-2">
                            {pieData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="font-bold text-slate-600">{item.name}</span>
                                    </div>
                                    <div className="text-slate-900 font-black">
                                        {item.value.toLocaleString()} <span className="text-slate-400 font-semibold">({formatPercentage(item.value)})</span>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2 font-black text-sm">
                                <span>Total</span>
                                <span>{data.total_admissions.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="w-full mt-4">
                            <button className="text-indigo-500 font-bold text-[11px] hover:underline">
                                View all {data.class_wise.length} classes &rarr;
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Funnel */}
            <Card className="border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                <SectionHeader title="Admission Funnel" showViewAll={false} />
                <div className="space-y-4 pr-10">
                    {data.funnel_analysis.map((item, index) => {
                        const widthPercent = Math.max(100 - (index * 20), 20); // 100%, 80%, 60%, 40%, 20%
                        const color = FUNNEL_COLORS[index % FUNNEL_COLORS.length];
                        return (
                            <div key={index} className="flex items-center gap-4">
                                <span className="w-28 text-right font-black text-xs text-slate-700 tracking-wide uppercase">{item.status}</span>
                                <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden">
                                    <div className={`h-full ${color} rounded-lg transition-all duration-1000`} style={{ width: `${widthPercent}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-6 pt-4 border-t border-slate-50">Powered by ML & AI insights v1.0.0</p>
            </Card>

            {/* Historical Admissions Modal */}
            {showHistoricalModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Historical Admissions</h3>
                                <p className="text-xs font-bold text-slate-400">Admissions recorded per academic year</p>
                            </div>
                            <button onClick={() => setShowHistoricalModal(false)} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.historical_admissions} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="academic_year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} minTickGap={30} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
