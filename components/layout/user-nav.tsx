'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import type { Session } from 'next-auth';
import ThemeToggleSwitch from '../ui/theme-toggle';
import SignOut from './sign-out';

export function UserNav({ session }: { session: Session | null }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='px-0 md:px-2'>
                    <Avatar className='size-9'>
                        <AvatarImage src={session?.user_image ?? ''} alt={session?.name ?? ''} />
                        <AvatarFallback>{session?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <p className='hidden font-medium text-sm leading-none md:block'>{session?.name}</p>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align='end' forceMount>
                <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                        <p className='font-medium text-sm leading-none'>{session?.name}</p>
                        <p className='text-muted-foreground text-xs leading-none'>{session?.designation}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem className='flex-between gap-2'>
                        Theme <ThemeToggleSwitch />
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <SignOut />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
