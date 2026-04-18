'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    DollarSign,
    Award,
    Building,
    Calendar,
    MoreHorizontal,
    ChevronRight,
    Bell,
    Layers,
    Activity,
    Mail,
    MessageSquare,
    UserMinus,
    Wallet,
    TrendingDown,
    Search,
    Filter,
    Download,
    Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import dynamic from 'next/dynamic';

const StudentStrengthChart = dynamic(() => import('./_components/dashboard-charts').then(mod => mod.StudentStrengthChart), { ssr: false });
const EmployeeStrengthChart = dynamic(() => import('./_components/dashboard-charts').then(mod => mod.EmployeeStrengthChart), { ssr: false });
const FeeDetailsChart = dynamic(() => import('./_components/dashboard-charts').then(mod => mod.FeeDetailsChart), { ssr: false });
import { cn } from '@/lib/utils';
import { GetChairmanDashBoardFeesdata, getDashboardCounts } from '@/server/dashboards/chairman-dashboard';
// --- Data from Reference Images ---

const studentStrengthData = [
    { name: 'PCMB', value: 280, color: '#06b6d4' },
    { name: 'PCMC', value: 290, color: '#ef4444' },
    { name: 'CEBA', value: 245, color: '#8b5cf6' },
    { name: 'SEBA', value: 232, color: '#84cc16' },
    { name: 'HEBA', value: 218, color: '#22d3ee' },
    { name: 'SBAC', value: 202, color: '#f59e0b' },
    { name: 'MSBA', value: 188, color: '#ec4899' },
    { name: 'I PUC MSBA', value: 85, color: '#6366f1' },
    { name: 'II PUC PCMC', value: 92, color: '#4f46e5' },
];

const employeeStrengthData = [
    { name: 'Lecturer', value: 148, color: '#3b82f6' },
    { name: 'Office Admin', value: 28, color: '#8b5cf6' },
    { name: 'Accountant', value: 12, color: '#06b6d4' },
    { name: 'Principal', value: 8, color: '#10b981' },
    { name: 'Receptionist', value: 5, color: '#ec4899' },
    { name: 'Staff', value: 45, color: '#f59e0b' },
    { name: 'SDA', value: 15, color: '#6366f1' },
    { name: 'Attender', value: 10, color: '#ef4444' },
];



const eventDetails = [
    { id: 1, event: 'Annual Sports Meet', month: 'February', start: '2026-02-24', end: '2026-02-26' },
    { id: 2, event: 'Science Exhibition', month: 'February', start: '2026-02-28', end: '2026-03-01' },
];

// --- Sub-Components ---

const StatCard = ({ item }: { item: any }) => (
    <Card className={cn(
        "border-none shadow-xl rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-500 card-premium relative",
        item.glow
    )}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className={cn("p-4 rounded-2xl", item.bg)}>
                    <item.icon className={item.color} size={24} />
                </div>
                <div className="flex flex-col items-end">
                    {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                    <button className='group/btn flex items-center gap-1 font-black text-[10px] text-slate-400 uppercase tracking-widest transition-colors hover:text-primary'>
                        More info <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
            <div>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.15em] mb-1">{item.title}</p>
                {item.subtitle && <p className="text-[9px] font-black text-slate-400 mb-2 uppercase">{item.subtitle}</p>}
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</h3>
            </div>

            {/* Background Decorative Element */}
            <div className={cn("absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700", item.color)}>
                <item.icon size={120} />
            </div>
        </CardContent>
    </Card>
);

const ChartCard = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => (
    <Card className={cn("border-none shadow-premium rounded-[32px] bg-white card-premium", className)}>
        <CardHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-black text-slate-900 tracking-[0.1em] uppercase">{title}</CardTitle>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50">
                        <Download size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-600 bg-slate-50">
                        <MoreHorizontal size={14} />
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
            {children}
        </CardContent>
    </Card>
);

export default function ChairmanDashboard() {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [feeDetailsData, setFeeDetailsData] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            console.log('fetching preadmission data');
            try {
                const response = await getDashboardCounts();
                const feesResponse = await GetChairmanDashBoardFeesdata(231);
                console.log('preadmission data raw response', response);

                // If the response has a data property (nested wrapper), use it, otherwise use the response itself
                const finalData = response?.data ? response.data : response;

                console.log('preadmission final data', finalData);
                setDashboardData(finalData);

                // Format fees data specifically for the FeeDetailsChart
                const feesDataArray = feesResponse?.data || [];
                if (Array.isArray(feesDataArray)) {
                    console.log('feesDataArray', feesDataArray);
                    const mappedFees = feesDataArray.map((item: any) => ({
                        name: item.classname || 'Unknown',
                        Collected: item.callected || 0,
                        Receivable: item.receivable || 0,
                        Balance: item.ballance || 0
                    }));
                    setFeeDetailsData(mappedFees);
                    console.log('mappedFees', mappedFees);
                }
            } catch (error) {
                console.error('Error fetching dashboard counts:', error);
            }
        };

        fetchData();
    }, []);

    const statsCards = [
        { title: 'SMS SENT FROM PRINCIPAL', value: '0', icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/20' },
        { title: 'EMAIL SENT FROM PRINCIPAL', value: '0', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/20' },
        { title: 'Total Collected Fee', value: '₹ 19,54,75,970', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/20' },

        {
            title: 'Total Student',
            value: dashboardData?.studentCount ?? '0',
            icon: Users,
            color: 'text-rose-600',
            bg: 'bg-rose-500/10',
            glow: 'shadow-rose-500/20'
        },

        { title: 'Over All Institution Collected Fee', value: '₹ 25.4M', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-500/10', glow: 'shadow-indigo-500/20' },
        { title: 'STUDENT ABSENT', subtitle: '(Feb 21, 2026)', value: '142', icon: UserMinus, color: 'text-green-700', bg: 'bg-green-600/10', glow: 'shadow-green-500/20' },
    ];

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                        Chairman <span className="text-primary italic">Dashboard</span>
                    </h1>
                    <div className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                        Institutional Strategic Overview <div className="h-1 w-1 rounded-full bg-slate-300" /> Feb 21, 2026
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl backdrop-blur-sm shadow-sm border border-white/50">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-black text-slate-600 shadow-sm">
                                {`U${i}`}
                            </div>
                        ))}
                    </div>
                    <Button className="rounded-xl h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Bell size={18} className="text-amber-400" /> Notifications
                    </Button>
                </div>
            </div>

            {/* Top Stats Grid (6 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {statsCards.map((stat, i) => <StatCard key={i} item={stat} />)}
            </div>

            {/* Middle Section: Strength Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Strength */}
                <ChartCard title="Student Strength Academic Year 2025-2026">
                    <div className="h-[380px] mt-6">
                        <StudentStrengthChart data={studentStrengthData} />
                    </div>
                </ChartCard>

                {/* Employee Strength */}
                <ChartCard title="Employee Role-wise Strength">
                    <div className="h-[380px] mt-6">
                        <EmployeeStrengthChart data={employeeStrengthData} />
                    </div>
                </ChartCard>
            </div>

            {/* Lower Section: Fee Details & Events */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Fee Details Grouped Bar Chart */}
                <ChartCard title="Classwise Fee Details 2025-2026" className="lg:col-span-8">
                    <div className="h-[400px] mt-8">
                        <FeeDetailsChart data={feeDetailsData} />
                    </div>
                </ChartCard>

                {/* Event Details Table */}
                <ChartCard title="Current Month Event Details" className="lg:col-span-4 overflow-hidden">
                    <div className="mt-6 overflow-hidden border border-slate-100 rounded-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">SL.NO</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Event</th>
                                    <th className="px-5 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eventDetails.map((event, idx) => (
                                    <tr key={event.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-5 py-4 text-xs font-black text-slate-400">0{idx + 1}</td>
                                        <td className="px-5 py-4 text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{event.event}</td>
                                        <td className="px-5 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Feb {event.start.split('-')[2]}</td>
                                    </tr>
                                ))}
                                {eventDetails.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center text-slate-400 font-bold text-sm italic">
                                            No events scheduled for this month
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase">Upcoming Audit</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">March 05, 2026</p>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 rounded-full text-primary hover:bg-primary/10">
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
}
