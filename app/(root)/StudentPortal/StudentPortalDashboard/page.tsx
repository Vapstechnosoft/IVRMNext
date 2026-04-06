'use client';

import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    GraduationCap,
    Library,
    MessageCircle,
    Trophy,
    Wallet,
    ClipboardCheck,
    Languages,
    Atom,
    Calculator,
    Globe,
    BookMarked
} from 'lucide-react';
import React, { useState } from 'react';
import {
    DashboardStatCard,
    AnnouncementItem,
    SectionHeader,
    TimetableRow,
    AssignmentItem,
    EventCard,
    LibraryStatus,
    RecentResultsTable,
    ReservationHistoryModal
} from './_components/dashboard-widgets';
import {
    PerformanceDonut,
    SubjectRadarChart,
    PerformanceSparkline
} from './_components/dashboard-charts';

// Mock Data
const announcements: any[] = [
    { title: 'Pre-Board Examination', date: 'Due in 3 days', status: 'Due', icon: <FileText className="h-5 w-5" />, color: 'bg-rose-500' },
    { title: 'New Study Materials', date: 'April 20, 2024', status: 'New', icon: <BookOpen className="h-5 w-5" />, color: 'bg-indigo-600' },
    { title: 'Annual Sports Meet', date: 'April 16, 2024', status: 'Released', icon: <Trophy className="h-5 w-5" />, color: 'bg-orange-500' },
];

const myHomework = [
    { subject: 'Math', task: 'Quadratic Equations Worksheet', dueDate: 'Tomorrow', progress: 85, color: 'bg-indigo-600' },
    { subject: 'Science', task: 'Photosynthesis Lab Report', dueDate: 'April 28', progress: 40, color: 'bg-teal-600' },
    { subject: 'English', task: 'Poetry Analysis Essay', dueDate: 'May 02', progress: 10, color: 'bg-orange-500' },
];

const todayClasses = [
    { time: '09:00 AM', subject: 'Mathematics', teacher: 'Ananya Sharma', icon: <Calculator className="h-5 w-5" />, color: 'bg-indigo-600' },
    { time: '10:30 AM', subject: 'Physics', teacher: 'Prof. Rajesh Kumar', icon: <Atom className="h-5 w-5" />, color: 'bg-teal-600' },
    { time: '12:00 PM', subject: 'English', teacher: 'Ms. Priya Varma', icon: <Languages className="h-5 w-5" />, color: 'bg-orange-500' },
    { time: '02:00 PM', subject: 'History', teacher: 'Mr. Amit Patel', icon: <Globe className="h-5 w-5" />, color: 'bg-rose-500' },
];

const recentResults = [
    { subject: 'Mathematics', exam: 'Mid-Term', marks: 88, total: 100, grade: 'A' },
    { subject: 'Science', exam: 'Mid-Term', marks: 95, total: 100, grade: 'A+' },
    { subject: 'History', exam: 'Unit Test 2', marks: 45, total: 50, grade: 'A' },
];

const libraryBooks = [
    { title: 'Advanced Calculus', dueDate: 'April 30, 2024' },
];

export default function StudentPortalDashboard() {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9ff] p-8 space-y-8">
            {/* Student Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Dashboard</h1>
                    <p className="text-slate-500 font-medium">Academic Year 2024-25 | Class 10-A</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <div className="text-lg font-bold text-slate-800">Abhiram H B</div>
                        <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">ID: 2024001</div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* My Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard
                    title="My Attendance"
                    value="92.4%"
                    icon={<ClipboardCheck className="h-6 w-6" />}
                    color="bg-indigo-600"
                    secondaryIcon={<CheckCircle2 className="h-24 w-24" />}
                />
                <DashboardStatCard
                    title="Current Rank"
                    value="04 / 45"
                    icon={<Trophy className="h-6 w-6" />}
                    color="bg-orange-500"
                    secondaryIcon={<Trophy className="h-24 w-24" />}
                />
                <DashboardStatCard
                    title="Average Grade"
                    value="A+ (9.2)"
                    icon={<GraduationCap className="h-6 w-6" />}
                    color="bg-teal-600"
                    secondaryIcon={<Trophy className="h-24 w-24" />}
                />
                <DashboardStatCard
                    title="Fee Balance"
                    value="₹12,500"
                    icon={<Wallet className="h-6 w-6" />}
                    color="bg-rose-500"
                    secondaryIcon={<Wallet className="h-24 w-24" />}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Schedule & Performance */}
                <div className="lg:col-span-8 space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Attendance Trend */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <SectionHeader title="Attendance Overview" />
                            <PerformanceDonut />
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Attendance</span>
                                    <span className="text-[10px] text-slate-300">April 2024</span>
                                </div>
                                <PerformanceSparkline />
                            </div>
                        </div>

                        {/* Subject Performance */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <SectionHeader title="Subject Proficiency" />
                            <SubjectRadarChart />
                            <div className="mt-2 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-wrap">Proficiency levels across core subjects</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Timetable */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <SectionHeader title="Today's Timetable" onActionClick={() => { }} actionLabel="Full Schedule" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {todayClasses.map((cls, idx) => (
                                <TimetableRow key={idx} {...cls} />
                            ))}
                        </div>
                    </div>

                    {/* Lower Left Combined Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Recent Exam Results */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <SectionHeader title="Recent Results" onActionClick={() => { }} />
                            <RecentResultsTable data={recentResults} />
                        </div>

                        {/* Upcoming Events (Moved here from Right) */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <SectionHeader title="Upcoming Events" onActionClick={() => { }} />
                            <div className="space-y-3">
                                <EventCard dateRange="April 25 - 29" title="Inter-School Tech Fest" isNew />
                                <EventCard dateRange="May 05" title="Annual Parents Day" />
                                <EventCard dateRange="May 12" title="Summer Camp Registration" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Homework & Alerts */}
                <div className="lg:col-span-4 space-y-8">

                    {/* My Homework */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <SectionHeader title="My Assignments" onActionClick={() => { }} />
                        <div className="space-y-4">
                            {myHomework.map((hw, idx) => (
                                <AssignmentItem key={idx} {...hw} />
                            ))}
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <SectionHeader title="Recent Alerts" onActionClick={() => { }} />
                        <div className="space-y-4">
                            {announcements.map((ann, idx) => (
                                <AnnouncementItem key={idx} {...ann} />
                            ))}
                        </div>
                    </div>

                    {/* Library Resources (New Section) */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <SectionHeader title="Library Status" onActionClick={() => { }} actionLabel="Explore" />
                        <div className="space-y-3">
                            {libraryBooks.map((book, idx) => (
                                <LibraryStatus key={idx} {...book} />
                            ))}
                            <div className="pt-4 border-t border-slate-50">
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    <span>Library Hours</span>
                                    <span className="text-indigo-600">Open Now</span>
                                </div>
                                <div
                                    onClick={() => setIsReservationModalOpen(true)}
                                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                                >
                                    <span className="text-xs font-bold text-slate-700 underline group-hover:text-indigo-600">View Reservation History</span>
                                    <BookMarked className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:rotate-12 transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Modals */}
            <ReservationHistoryModal
                isOpen={isReservationModalOpen}
                onClose={() => setIsReservationModalOpen(false)}
            />
        </div>
    );
}
