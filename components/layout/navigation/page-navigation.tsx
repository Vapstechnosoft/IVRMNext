'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getNavigationContext } from './navigation-context';

export function PageNavigation() {
    const [pageScrollPosition, setPageScrollPosition] = useState(0);
    const [activeNavigation, setActiveNavigation] = useState(getNavigationContext().activeNavigation);
    const pageScrollRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Listen for navigation context changes
    useEffect(() => {
        const interval = setInterval(() => {
            const context = getNavigationContext();
            if (context.activeNavigation !== activeNavigation) {
                setActiveNavigation(context.activeNavigation);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [activeNavigation]);

    const scrollPages = (direction: 'left' | 'right') => {
        if (pageScrollRef.current) {
            const scrollAmount = 200;
            const newPosition = direction === 'left' ? pageScrollPosition - scrollAmount : pageScrollPosition + scrollAmount;

            pageScrollRef.current.scrollTo({
                left: newPosition,
                behavior: 'smooth'
            });
            setPageScrollPosition(newPosition);
        }
    };

    if (!activeNavigation) {
        return null;
    }

    if (pathname === '/' || pathname === null) {
        setActiveNavigation(null);
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='sticky top-16 z-20 border-border backdrop-blur-sm'>
                <div className='container rounded-lg bg-gradient-blue-purple-indigo py-2'>
                    {/* Breadcrumb */}
                    <div className='flex items-center gap-2 text-muted text-sm'>
                        <span className='font-medium'>{activeNavigation.module}</span>
                        <ChevronRight className='h-4 w-4' />
                        <span>{activeNavigation.menu}</span>
                        <ChevronRight className='h-4 w-4' />
                        <div className='underline underline-offset-4'>
                            <span className='font-medium'>{activeNavigation.subMenu}</span>
                        </div>
                    </div>

                    {/* Page Navigation */}
                    <div className='relative'>
                        <div className='flex items-center gap-4'>
                            {/* Left Scroll Button */}
                            <Button
                                variant='outline'
                                size='sm'
                                className='h-10 w-10 flex-shrink-0 rounded-full p-0 shadow-md transition-shadow hover:shadow-lg'
                                onClick={() => scrollPages('left')}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>

                            {/* Scrollable Pages Container */}
                            <div
                                ref={pageScrollRef}
                                className='scrollbar-hide flex flex-1 gap-3 overflow-x-auto px-1 py-2'
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {activeNavigation.pages.map((page: any) => {
                                    const isCurrentPage = pathname === page.url;
                                    const IconComponent = getIconByName(page.icon);

                                    return (
                                        <Link key={page.id} href={page.url}>
                                            <Card
                                                className={cn(
                                                    'flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
                                                    'min-w-[150px] text-nowrap border-2',
                                                    isCurrentPage
                                                        ? 'border-border hover:border-primary/50'
                                                        : 'border border-accent/20 bg-primary/25'
                                                )}>
                                                <CardContent className='p-2 text-center'>
                                                    <div className='flex items-center gap-2'>
                                                        {IconComponent && (
                                                            <div
                                                                className={cn(
                                                                    'rounded-full p-2 transition-colors',
                                                                    isCurrentPage
                                                                        ? 'bg-primary text-primary-foreground'
                                                                        : 'bg-accent text-accent-foreground'
                                                                )}>
                                                                <IconComponent className='h-3 w-3' />
                                                            </div>
                                                        )}
                                                        <span
                                                            className={cn(
                                                                'font-medium text-sm transition-colors',
                                                                isCurrentPage ? 'text-foreground' : 'text-muted'
                                                            )}>
                                                            {page.name}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Right Scroll Button */}
                            <Button
                                variant='outline'
                                size='sm'
                                className='h-10 w-10 flex-shrink-0 rounded-full p-0 shadow-md transition-shadow hover:shadow-lg'
                                onClick={() => scrollPages('right')}>
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
