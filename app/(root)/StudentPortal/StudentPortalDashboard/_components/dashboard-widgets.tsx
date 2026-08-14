'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, BookOpen, X, Book, Clock, MapPin } from 'lucide-react';
import React from 'react';

// --- Stat Card ---
export interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    secondaryIcon?: React.ReactNode;
}

export const DashboardStatCard: React.FC<StatCardProps> = ({ title, value, icon, color, secondaryIcon }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                "relative overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-300",
                "bg-white border border-white/20 backdrop-blur-xl",
                "group cursor-default"
            )}
        >
            <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10", color)} />

            <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col space-y-2">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
                    <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                </div>
                <div className={cn("p-4 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
                    {icon}
                </div>
            </div>

            {secondaryIcon && (
                <div className="absolute -bottom-4 -right-2 opacity-[0.08] group-hover:opacity-20 transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-12 z-0">
                    {secondaryIcon}
                </div>
            )}
        </motion.div>
    );
};

// --- Announcement Item ---
export interface AnnouncementProps {
    title: string;
    date: string;
    status: 'New' | 'Released' | 'Completed' | 'Due';
    icon: React.ReactNode;
    color: string;
}

export const AnnouncementItem: React.FC<AnnouncementProps> = ({ title, date, status, icon, color }) => {
    const statusColors = {
        New: 'bg-indigo-500 text-white',
        Released: 'bg-orange-500 text-white',
        Completed: 'bg-teal-500 text-white',
        Due: 'bg-rose-500 text-white',
    };

    return (
        <div className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 transition-colors">
            <div className={cn("p-3 rounded-xl text-white", color)}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{title}</h4>
                <p className="text-xs text-slate-400">{date}</p>
            </div>
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", statusColors[status])}>
                {status}
            </span>
        </div>
    );
};

// --- Action Header ---
export const SectionHeader: React.FC<{ title: string; onActionClick?: () => void; actionLabel?: string }> = ({
    title, onActionClick, actionLabel = 'View All'
}) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            {onActionClick && (
                <button
                    onClick={onActionClick}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-slate-100 hover:border-slate-200"
                >
                    {actionLabel} <ChevronRight className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

// --- Pending Application Table ---
export const ApplicationsTable: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-2">Student Name</th>
                        <th className="px-4 py-2">Applied Class</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Applied Date</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-medium">
                    {data.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors rounded-2xl">
                            <td className="px-4 py-3 bg-white first:rounded-l-2xl group-hover:bg-slate-50/50">
                                <div>
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                    <div className="text-[10px] text-slate-400">{item.id}</div>
                                </div>
                            </td>
                            <td className="px-4 py-3 bg-white group-hover:bg-slate-50/50 text-slate-600">{item.class}</td>
                            <td className="px-4 py-3 bg-white group-hover:bg-slate-50/50">
                                <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 bg-white last:rounded-r-2xl group-hover:bg-slate-50/50 text-slate-400 text-xs">
                                {item.date}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Reservation History Modal ---
export const ReservationHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const history = [
        { id: 1, title: 'Principles of Physics', author: 'Resnick Halliday', date: 'April 20, 2024', status: 'Approved', type: 'Hardcopy' },
        { id: 2, title: 'Introduction to Algorithms', author: 'Cormen et al.', date: 'April 15, 2024', status: 'Waiting', type: 'E-Book' },
        { id: 3, title: 'Modern Organic Chemistry', author: 'Maitland Jones', date: 'April 10, 2024', status: 'Rejected', type: 'Hardcopy' },
        { id: 4, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', date: 'March 25, 2024', status: 'Completed', type: 'Hardcopy' },
    ];

    const statusColors: any = {
        'Approved': 'bg-teal-100 text-teal-600',
        'Waiting': 'bg-orange-100 text-orange-600',
        'Rejected': 'bg-rose-100 text-rose-600',
        'Completed': 'bg-slate-100 text-slate-600',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[32px] shadow-2xl z-[101] overflow-hidden"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Reservation History</h3>
                                    <p className="text-sm font-medium text-slate-400">Track your book requests and status</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        whileHover={{ x: 5 }}
                                        className="p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <Book className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider", statusColors[item.status])}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <Clock className="h-3 w-3" />
                                                    {item.date}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                                    <MapPin className="h-3 w-3" />
                                                    {item.type}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
// --- Recent Results Table ---
export const RecentResultsTable: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                        <th className="pb-2">Subject</th>
                        <th className="pb-2">Exam</th>
                        <th className="pb-2">Marks</th>
                        <th className="pb-2">Grade</th>
                    </tr>
                </thead>
                <tbody className="text-sm font-medium">
                    {data.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                            <td className="py-3 font-bold text-slate-800">{item.subject}</td>
                            <td className="py-3 text-slate-500 text-xs">{item.exam}</td>
                            <td className="py-3">
                                <span className="font-black text-slate-800">{item.marks}</span>
                                <span className="text-slate-400 text-[10px]"> / {item.total}</span>
                            </td>
                            <td className="py-3">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-black",
                                    item.grade === 'A+' ? 'bg-teal-100 text-teal-600' : 'bg-indigo-100 text-indigo-600'
                                )}>
                                    {item.grade}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Library Status Item ---
export const LibraryStatus: React.FC<{ title: string; dueDate: string; isOverdue?: boolean }> = ({ title, dueDate, isOverdue }) => {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-50 hover:border-indigo-100 transition-all group">
            <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                isOverdue ? "bg-rose-100 text-rose-600" : "bg-indigo-100 text-indigo-600"
            )}>
                <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <div className="font-bold text-sm text-slate-800 line-clamp-1">{title}</div>
                <div className={cn("text-[10px] font-medium", isOverdue ? "text-rose-500" : "text-slate-400")}>
                    {isOverdue ? "Overdue" : "Due"}: {dueDate}
                </div>
            </div>
        </div>
    );
};


// --- Timetable Row ---
export const TimetableRow: React.FC<{ time: string; subject: string; teacher: string; icon: React.ReactNode; color: string }> = ({
    time, subject, teacher, icon, color
}) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-50 hover:border-indigo-100 hover:shadow-md transition-all group">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{time}</div>
                <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{subject}</div>
                <div className="text-xs text-slate-500">{teacher}</div>
            </div>
            <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-indigo-400" />
        </div>
    );
};

// --- Assignment Item ---
export const AssignmentItem: React.FC<{ subject: string; task: string; dueDate: string; progress: number; color: string }> = ({
    subject, task, dueDate, progress, color
}) => {
    return (
        <div className="p-4 bg-slate-50/50 rounded-2xl space-y-3 group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
            <div className="flex justify-between items-start">
                <div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md text-white mb-1 inline-block", color)}>
                        {subject}
                    </span>
                    <h4 className="font-bold text-slate-800 line-clamp-1">{task}</h4>
                </div>
                <div className="text-[10px] font-bold text-slate-400">Due: {dueDate}</div>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={cn("h-full rounded-full", color)}
                    />
                </div>
            </div>
        </div>
    );
};

// --- Event Card ---
export const EventCard: React.FC<{ dateRange: string; title: string; isNew?: boolean }> = ({ dateRange, title, isNew }) => {
    return (
        <div className="p-4 bg-white rounded-2xl flex flex-col gap-2 relative group hover:bg-indigo-50/50 transition-colors cursor-default border border-slate-50">
            <div className="text-xs font-bold text-indigo-500">{dateRange}</div>
            <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-700">{title}</div>
            {isNew && (
                <span className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-0.5 rounded text-[8px] font-bold italic uppercase">
                    New
                </span>
            )}
        </div>
    );
};

