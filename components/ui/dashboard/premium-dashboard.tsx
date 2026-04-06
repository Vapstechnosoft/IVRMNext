'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    Users,
    BookOpen,
    Trophy,
    Calendar,
    Bell,
    ArrowUpRight,
    TrendingUp,
    Star,
    Sparkles,
    LayoutDashboard,
    GraduationCap,
    Clock,
    Search,
    ChevronRight,
    CircleCheck,
    Briefcase
} from 'lucide-react';

const stats = [
    {
        title: 'Total Students',
        value: '3,240',
        change: '+12.5%',
        icon: Users,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.1
    },
    {
        title: 'Avg. Attendance',
        value: '95.8%',
        change: '+1.2%',
        icon: CircleCheck,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.2
    },
    {
        title: 'Staff On Duty',
        value: '142',
        change: 'Stable',
        icon: Briefcase,
        gradient: 'from-[#EA580C] to-[#C2410C]',
        delay: 0.3
    },
    {
        title: 'Active Courses',
        value: '28',
        change: 'New!',
        icon: BookOpen,
        gradient: 'from-[#EA580C] to-[#D97706]',
        delay: 0.4
    }
];

export default function PremiumDashboard() {
    return (
        <div className="container-fluid py-8 px-6 bg-slate-50/50 min-h-screen">
            {/* Search & Welcome Row */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1"
                >
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
                        Welcome, <span className="text-[#EA580C]">Explorer</span>
                    </h1>
                    <p className="text-slate-500 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">
                        Friday, February 13, 2026
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative w-full md:w-[400px]"
                >
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search modules, features, or records..."
                        className="pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-3xl shadow-sm focus:border-[#EA580C]/50 focus:ring-4 focus:ring-[#EA580C]/10 transition-all font-medium text-slate-600 w-full"
                    />
                </motion.div>
            </div>

            {/* Hero Section */}
            <div className="row mb-10">
                <div className="col-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-premium relative overflow-hidden p-10 md:p-16 text-white border-none bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E40AF]"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-[50%] h-full bg-blue-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-indigo-500/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex-1 space-y-8 text-center lg:text-left">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                                >
                                    <Sparkles className="h-4 w-4 text-orange-300 fill-orange-300" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">Amber Core Enabled</span>
                                </motion.div>

                                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                                    Crystal <br />
                                    <span className="text-orange-400">Intelligence</span>
                                </h2>

                                <p className="text-white/80 text-lg max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0">
                                    A professional digital workspace built for institutional excellence.
                                    Powered by the VAPS Amber engine.
                                </p>

                                <div className="flex flex-wrap gap-5 justify-center lg:justify-start pt-6">
                                    <Button className="btn-premium-orange px-10 py-8 rounded-[1.5rem] text-lg shadow-2xl transition-all">
                                        Launch Explorer
                                    </Button>
                                    <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-8 rounded-[1.5rem] border border-white/20 backdrop-blur-sm">
                                        System Stats
                                    </Button>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 30, rotate: 2 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 80, delay: 0.5 }}
                                className="hidden lg:block relative"
                            >
                                <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl float-premium">
                                    <img
                                        src="/assets/registration.png"
                                        alt="UI Preview"
                                        className="h-[350px] w-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-12">
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-12 col-sm-6 col-xl-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: stat.delay }}
                            className="h-full"
                        >
                            <Card className="card-premium h-full border-none p-2 group">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`p-5 rounded-3xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <div className="px-3 py-1.5 rounded-full bg-orange-50 text-[10px] font-black uppercase text-orange-600 tracking-wider">
                                            {stat.change}
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                                    <div className="w-12 h-1.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] rounded-full mt-6 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Discover Section */}
            <div className="row g-6">
                <div className="col-lg-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Card className="card-premium border-none p-2">
                            <CardContent className="p-10">
                                <div className="flex items-center justify-between mb-12">
                                    <div>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Performance</h2>
                                        <p className="text-slate-500 font-medium mt-1">Real-time institutional metrics</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-2xl">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="group flex items-center gap-8 p-6 rounded-[2rem] hover:bg-slate-50 transition-all duration-300 cursor-pointer border border-transparent hover:border-orange-100">
                                            <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 shadow-sm flex items-center justify-center text-slate-400 group-hover:bg-[#EA580C] group-hover:text-white transition-all transform group-hover:rotate-6">
                                                <GraduationCap className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 text-xl tracking-tight">Active Module Deployment</h4>
                                                <p className="text-slate-500 font-medium">Session ID: #BS-9021-X</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-black text-[#EA580C] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                                                <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center group-hover:bg-[#EA580C] group-hover:text-white transition-colors">
                                                    <ChevronRight className="h-6 w-6" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="col-lg-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="h-full"
                    >
                        <Card className="h-full card-premium border-none bg-slate-900 text-white p-2">
                            <CardContent className="p-10 flex flex-col h-full bg-slate-900">
                                <div className="p-5 bg-[#EA580C] rounded-3xl w-fit mb-10 shadow-xl shadow-orange-500/20">
                                    <Bell className="h-6 w-6 animate-bell" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter mb-4 leading-none">Global <br />Network</h3>
                                <p className="text-white/40 font-medium mb-12">Live server status and connectivity status.</p>

                                <div className="space-y-4 flex-1">
                                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl hover:bg-white/10 transition-colors">
                                        <p className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-2">Live Node</p>
                                        <p className="font-bold leading-tight">Primary database shard optimized successfully.</p>
                                    </div>
                                    <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-3xl hover:bg-white/10 transition-colors opacity-60">
                                        <p className="text-amber-400 font-black text-[10px] uppercase tracking-widest mb-2">Sync Status</p>
                                        <p className="font-bold leading-tight">All regional hubs reporting 100% uptime.</p>
                                    </div>
                                </div>

                                <button className="btn-premium-orange w-full py-6 mt-12 bg-gradient-to-r from-[#EA580C] to-[#C2410C] rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-orange-500/25">
                                    Network Console
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
