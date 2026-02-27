'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import type { Session } from 'next-auth';
import SignOut from './sign-out';

export function UserNav({ session }: { session: Session | null }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='group relative flex items-center gap-2 px-1 hover:bg-transparent transition-all duration-300'>
                    <div className="relative">
                        <Avatar className='size-9 border-2 border-white shadow-sm ring-2 ring-orange-500/10'>
                            <AvatarImage src={session?.user_image ?? ''} alt={session?.name ?? ''} />
                            <AvatarFallback className="bg-orange-50 text-orange-600 font-bold">{session?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 rounded-full bg-orange-500/0 group-hover:bg-orange-500/10 blur-md transition-all duration-500" />
                    </div>
                    <div className="hidden md:flex flex-col items-start text-left gap-0.5">
                        <p className='text-[12px] font-black tracking-tight leading-none text-gray-800 uppercase'>{session?.name}</p>
                        <p className="text-[9px] font-bold text-orange-600/80 uppercase tracking-wider">{session?.designation || 'Member'}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-64 p-3 bg-white/80 backdrop-blur-2xl border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-2xl' align='end' forceMount>
                <div className="relative p-4 rounded-xl bg-white/50 border border-white/60 mb-2 overflow-hidden shadow-[inset_0_1px_10px_rgba(255,255,255,0.7)] group/card">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Avatar className='size-12 grayscale rotate-12 transition-transform duration-500 group-hover/card:rotate-0'>
                            <AvatarImage src={session?.user_image ?? ''} />
                        </Avatar>
                    </div>
                    <div className='flex flex-col space-y-2 relative z-10'>
                        <span className='font-black text-[9px] text-orange-600 uppercase tracking-[0.2em]'>Identity Profile</span>
                        <div>
                            <p className='font-bold text-base leading-tight text-gray-900'>{session?.name}</p>
                            <p className='text-gray-500 text-[11px] font-medium'>{session?.email}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <div className="px-2 py-0.5 rounded-full bg-orange-100 text-[9px] font-black text-orange-600 uppercase tracking-wider">
                                {session?.designation || 'Active user'}
                            </div>
                        </div>
                    </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100/50 my-2" />
                <SignOut />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
