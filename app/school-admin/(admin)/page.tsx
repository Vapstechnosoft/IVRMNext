'use client';

import * as React from 'react';
import {
    Users,
    GraduationCap,
    CreditCard,
    FileText,
    TrendingUp,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Award,
    Wallet,
    Bell,
    Calendar,
    ChevronRight,
    UserCircle,
    Building2,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { cn } from '@/lib/utils';

// --- Data & Constants ---

const statsData = [
    { title: 'Applications', value: '1,528', icon: FileText, gradient: 'from-blue-600 to-indigo-600', badgeIcon: Briefcase },
    { title: 'Students', value: '6,302', icon: Users, gradient: 'from-orange-500 to-amber-600', badgeIcon: UserCircle },
    { title: 'Teachers', value: '208', icon: GraduationCap, gradient: 'from-teal-500 to-emerald-600', badgeIcon: Building2 },
    { title: 'Fee Collection', value: '₹4,35,500', icon: Wallet, gradient: 'from-purple-600 to-violet-600', badgeIcon: CreditCard },
];

const performanceData = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 45 },
    { name: 'Wed', value: 65 },
    { name: 'Thu', value: 55 },
    { name: 'Fri', value: 85 },
];

const feeOverviewData = [
    { name: 'Jan 22', upcoming: 200, overdue: 150, unpaid: 100 },
    { name: 'Feb 22', upcoming: 180, overdue: 210, unpaid: 130 },
    { name: 'Mar 36', upcoming: 250, overdue: 190, unpaid: 170 },
    { name: 'Apr 35', upcoming: 220, overdue: 230, unpaid: 150 },
];

const miniFeeData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 450 },
    { name: 'Apr', value: 700 },
    { name: 'May', value: 550 },
    { name: 'Jun', value: 800 },
    { name: 'Jul', value: 650 },
    { name: 'Aug', value: 900 },
    { name: 'Sep', value: 750 },
];

const announcements = [
    { title: 'New Circulars', date: 'April 24, 2024', status: 'New', color: 'bg-indigo-600' },
    { title: 'Upcoming Exam Timetable', date: 'April 20, 2024', status: 'Released', color: 'bg-orange-500' },
    { title: 'Library Renovation', date: 'April 16, 2024', status: 'Completed', color: 'bg-emerald-500' },
];

const pendingApplications = [
    { name: 'Akash Verma', id: 'STU-02341', class: 'LKG', status: 'Pending', date: 'April 25, 2024' },
    { name: 'Kavya Jadhav', id: 'STU-01782', class: 'II STD', status: 'Pending', date: 'April 22, 2024' },
    { name: 'Sandeep Reddy', id: 'STU-02356', class: 'IV STD', status: 'Pending', date: 'April 21, 2024' },
];

const events = [
    { title: 'Parent-Teacher Meeting', date: 'April 25, 2024', scheduled: 'April 29, 2024' },
    { title: 'Annual Sports Day', date: 'April 30, 2024', status: 'New' },
    { title: 'Science Exhibition', date: 'May 05, 2024', scheduled: 'May 10, 2024' },
];

// --- Sub-Components ---

const StatCard = ({ item }: { item: typeof statsData[0] }) => (
    <Card className="border-none shadow-lg rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.01] transition-all duration-500 card-premium">
        <CardContent className="p-0 flex h-full">
            <div className={cn("w-14 flex items-center justify-center bg-gradient-to-b text-white", item.gradient)}>
                <item.icon size={22} strokeWidth={2.5} />
            </div>
            <div className="flex-1 p-4 flex items-center justify-between">
                <div>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{item.title}</p>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">{item.value}</h3>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-slate-100 transition-colors">
                    <item.badgeIcon size={16} className="text-slate-400 group-hover:text-slate-600" />
                </div>
            </div>
        </CardContent>
    </Card>
);

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

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-700">
            {/* Top Bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">System Overview</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">Metrics & Analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-200">
                        <Bell size={18} className="text-slate-500" />
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((item, i) => <StatCard key={i} item={item} />)}
            </div>

            {/* Middle Section: Overview & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Performance Overview */}
                <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Performance Overview" showViewAll={false} />
                    <div className="relative flex flex-col items-center justify-center mt-2">
                        <div className="h-48 w-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: 96.8 }, { value: 3.2 }]}
                                        innerRadius={60}
                                        outerRadius={75}
                                        startAngle={90}
                                        endAngle={450}
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        <Cell fill="url(#purpleGradient)" stroke="none" />
                                        <Cell fill="#f1f5f9" stroke="none" />
                                    </Pie>
                                    <defs>
                                        <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#f97316" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-slate-900">96.8%</span>
                            </div>
                        </div>
                        <div className="w-full h-16 mt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={performanceData}>
                                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Fee Collection Overview */}
                <Card className="lg:col-span-5 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Fee Trends" />
                    <div className="h-60 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={feeOverviewData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 12px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                                <Line type="monotone" dataKey="upcoming" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="overdue" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="unpaid" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-4 justify-center">
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-violet-500" /><span className="text-[10px] font-bold text-slate-500">Upcoming</span></div>
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-orange-500" /><span className="text-[10px] font-bold text-slate-500">Overdue</span></div>
                        <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-slate-500">Unpaid</span></div>
                    </div>
                </Card>

                {/* Announcements */}
                <Card className="lg:col-span-3 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Notices" />
                    <div className="space-y-4">
                        {announcements.map((item, i) => (
                            <div key={i} className="flex gap-3 group cursor-pointer">
                                <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-all shadow-md shadow-slate-100", item.color)}>
                                    <Bell size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-black text-slate-900 text-[11px] leading-tight truncate">{item.title}</p>
                                        <Badge variant="outline" className="text-[8px] h-4 px-1 font-black uppercase tracking-tighter border-slate-100 shrink-0">{item.status}</Badge>
                                    </div>
                                    <p className="text-slate-400 text-[9px] font-bold mt-0.5">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Pending Student Applications */}
                <Card className="lg:col-span-7 border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                    <SectionHeader title="Student Applications" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-3">Student</th>
                                    <th className="pb-3">Class</th>
                                    <th className="pb-3 text-center">Status</th>
                                    <th className="pb-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {pendingApplications.map((app, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3">
                                            <p className="font-black text-slate-900 text-xs">{app.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{app.id}</p>
                                        </td>
                                        <td className="py-3 text-xs font-bold text-slate-600">{app.class}</td>
                                        <td className="py-3 text-center">
                                            <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[9px] rounded-md px-2 py-0.5">
                                                {app.status}
                                            </Badge>
                                        </td>
                                        <td className="py-3 text-[10px] font-black text-slate-400">{app.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Right Side Widgets */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Staff Overview */}
                        <Card className="border-none shadow-sm rounded-3xl bg-white p-5 card-premium">
                            <SectionHeader title="Staff" showViewAll={false} />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-1.5">
                                        <Users size={14} />
                                    </div>
                                    <span className="text-xl font-black text-slate-900">35</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">On Duty</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl flex flex-col items-center">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 mb-1.5">
                                        <UserCircle size={14} />
                                    </div>
                                    <span className="text-xl font-black text-slate-900">5</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">On Leave</span>
                                </div>
                            </div>
                        </Card>

                        {/* Mini Fee Chart */}
                        <Card className="border-none shadow-sm rounded-3xl bg-white p-5 card-premium">
                            <SectionHeader title="Revenue" showViewAll={false} />
                            <div className="h-20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={miniFeeData}>
                                        <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-center text-[9px] font-bold text-slate-400 mt-2">Daily Fee Collection</p>
                        </Card>
                    </div>

                    {/* Upcoming Events */}
                    <Card className="border-none shadow-sm rounded-3xl bg-white p-6 card-premium">
                        <SectionHeader title="Calendar Events" />
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {events.map((ev, i) => (
                                <div key={i} className="min-w-[220px] p-4 bg-slate-50 rounded-[20px] border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <Badge variant="outline" className="text-[8px] font-black tracking-tighter uppercase px-1.5 py-0">Event</Badge>
                                            {ev.status && <Badge className="bg-indigo-600 text-white border-none text-[8px] px-1.5 py-0">New</Badge>}
                                        </div>
                                        <h4 className="font-black text-slate-900 text-sm leading-tight line-clamp-1">{ev.title}</h4>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-indigo-600" />
                                            <span className="text-[10px] font-black text-slate-400">{ev.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
