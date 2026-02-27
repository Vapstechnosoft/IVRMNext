'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    Users,
    UserCircle,
    BookOpen,
    Calendar,
    Award,
    Wallet,
    Bus,
    Library,
    Settings,
    ChevronLeft,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/layout/navigation/logo';

const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '/school-admin' },
    { title: 'Students', icon: Users, url: '/school-admin/students' },
    { title: 'Teachers', icon: UserCircle, url: '/school-admin/teachers' },
    { title: 'Classes', icon: BookOpen, url: '/school-admin/classes' },
    { title: 'Attendance', icon: Calendar, url: '/school-admin/attendance' },
    { title: 'Exams & Results', icon: Award, url: '/school-admin/exams' },
    { title: 'Fees Management', icon: Wallet, url: '/school-admin/fees' },
    { title: 'Transport', icon: Bus, url: '/school-admin/transport' },
    { title: 'Library', icon: Library, url: '/school-admin/library' },
    { title: 'Settings', icon: Settings, url: '/school-admin/settings' }
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 bg-white border-r border-slate-200 transition-all duration-500 flex flex-col z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
                {!collapsed && <Logo className="h-8 transition-opacity duration-300" />}
                {collapsed && <div className="h-8 w-8 bg-indigo-600 rounded-lg mx-auto" />}
            </div>

            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                        <Link
                            key={item.title}
                            href={item.url}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                            )}
                        >
                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-indigo-600")} />
                            {!collapsed && (
                                <span className="truncate">{item.title}</span>
                            )}
                            {isActive && !collapsed && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                            {collapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    {item.title}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-all font-bold group"
                >
                    <LogOut size={22} className="shrink-0 group-hover:rotate-12 transition-transform" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
