'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

import type { Session } from 'next-auth';
import { useSession } from 'next-auth/react';
import SignOut from './sign-out';

export function UserNav({ session: initialSession }: { session: Session | null }) {
    const { data: clientSession } = useSession();
    const session = clientSession || initialSession;

    const rawName = session?.name || session?.username || session?.email || '';
    const isDefaultName = !rawName || rawName.trim().toUpperCase() === 'DEFAULT USER' || rawName.trim().toUpperCase() === 'DEFAULTUSER';
    const displayName = isDefaultName ? session?.username || session?.email || '' : rawName;
    const initialLetter = displayName?.[0]?.toUpperCase() || 'U';

    const rawDesig = session?.designation || session?.role || '';
    const isActiveUserPlaceholder =
        !rawDesig || rawDesig.trim().toUpperCase() === 'ACTIVE USER' || rawDesig.trim().toUpperCase() === 'ACTIVEUSER';
    const displayRole = isActiveUserPlaceholder ? session?.role || 'MEMBER' : rawDesig;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='group relative flex items-center gap-2 px-1 transition-all duration-300 hover:bg-transparent'>
                    <div className='relative'>
                        <Avatar className='size-9 border-2 border-white shadow-sm ring-2 ring-orange-500/10'>
                            <AvatarImage src={session?.user_image ?? ''} alt={displayName} />
                            <AvatarFallback className='bg-orange-50 font-bold text-orange-600'>{initialLetter}</AvatarFallback>
                        </Avatar>
                        <div className='absolute inset-0 rounded-full bg-orange-500/0 blur-md transition-all duration-500 group-hover:bg-orange-500/10' />
                    </div>
                    <div className='hidden flex-col items-start gap-0.5 text-left md:flex'>
                        <p className='font-black text-[12px] text-gray-800 uppercase leading-none tracking-tight'>{displayName}</p>
                        <p className='font-bold text-[9px] text-orange-600/80 uppercase tracking-wider'>{displayRole}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className='w-64 rounded-2xl border-white/40 bg-white/80 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] backdrop-blur-2xl'
                align='end'
                forceMount>
                <div className='group/card relative mb-2 overflow-hidden rounded-xl border border-white/60 bg-white/50 p-4 shadow-[inset_0_1px_10px_rgba(255,255,255,0.7)]'>
                    <div className='absolute top-0 right-0 p-3 opacity-10'>
                        <Avatar className='size-12 rotate-12 grayscale transition-transform duration-500 group-hover/card:rotate-0'>
                            <AvatarImage src={session?.user_image ?? ''} />
                        </Avatar>
                    </div>
                    <div className='relative z-10 flex flex-col space-y-2'>
                        <span className='font-black text-[9px] text-orange-600 uppercase tracking-[0.2em]'>IDENTITY PROFILE</span>
                        <div>
                            <p className='font-bold text-base text-gray-900 leading-tight'>{displayName}</p>
                            {session?.email && <p className='font-medium text-[11px] text-gray-500'>{session?.email}</p>}
                        </div>
                        {displayRole && (
                            <div className='flex items-center gap-2 pt-1'>
                                <div className='rounded-full bg-orange-100 px-2 py-0.5 font-black text-[9px] text-orange-600 uppercase tracking-wider'>
                                    {displayRole}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <DropdownMenuSeparator className='my-2 bg-gray-100/50' />
                <SignOut />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
