'use client';

import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    SearchIcon,
    ArrowUpRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-6 flex-1">
                <Button variant="ghost" size="icon" className="text-slate-500" onClick={onMenuClick}>
                    <Menu size={24} />
                </Button>

                <div className="hidden md:flex items-center relative max-w-md w-full group">
                    <Search className="absolute left-4 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                        placeholder="Search for students, subjects, staff..."
                        className="pl-12 h-12 bg-slate-100 border-none rounded-2xl focus-visible:ring-4 focus-visible:ring-indigo-100 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative group">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 relative">
                        <Bell size={22} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                        <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </Button>
                </div>

                <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all">
                            <Avatar className="h-11 w-11 rounded-xl ring-2 ring-white shadow-sm">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-indigo-600 text-white font-black">AD</AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden sm:block pr-2">
                                <p className="text-sm font-black text-slate-900 leading-none">Admin Jack</p>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                    Principal <ArrowUpRight size={10} className="text-emerald-500" />
                                </p>
                            </div>
                            <ChevronDown size={14} className="text-slate-400 mr-1" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-200 mt-2">
                        <DropdownMenuLabel className="p-3 font-black text-slate-900">Workspace</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem className="p-3 rounded-xl font-bold text-slate-600 hover:text-indigo-600 focus:bg-indigo-50 cursor-pointer">Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem className="p-3 rounded-xl font-bold text-slate-600 hover:text-indigo-600 focus:bg-indigo-50 cursor-pointer">School Profile</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                            onSelect={() => window.location.href = '/school-admin/login'}
                            className="p-3 rounded-xl font-black text-red-600 hover:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
