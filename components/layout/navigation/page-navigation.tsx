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

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='sticky top-14 z-30 border-border border-b bg-accent/30 backdrop-blur-sm'>
                <div className='container py-2'>
                    {/* Breadcrumb */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <span className='font-medium text-foreground'>{activeNavigation.module}</span>
                        <ChevronRight className='w-4 h-4' />
                        <span>{activeNavigation.menu}</span>
                        <ChevronRight className='w-4 h-4' />
                        <span className='text-primary font-medium'>{activeNavigation.subMenu}</span>
                    </div>

                    {/* Page Navigation */}
                    <div className='relative'>
                        <div className='flex items-center gap-4'>
                            {/* Left Scroll Button */}
                            <Button
                                variant='outline'
                                size='sm'
                                className='flex-shrink-0 h-10 w-10 p-0 rounded-full shadow-md hover:shadow-lg transition-shadow'
                                onClick={() => scrollPages('left')}>
                                <ChevronLeft className='w-4 h-4' />
                            </Button>

                            {/* Scrollable Pages Container */}
                            <div
                                ref={pageScrollRef}
                                className='flex gap-3 overflow-x-auto scrollbar-hide flex-1 py-2 px-1'
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {activeNavigation.pages.map((page: any) => {
                                    const isCurrentPage = pathname === page.url;
                                    const IconComponent = getIconByName(page.icon);

                                    return (
                                        <Link key={page.id} href={page.url}>
                                            <Card
                                                className={cn(
                                                    'flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
                                                    'min-w-[150px] border-2',
                                                    isCurrentPage
                                                        ? 'border-primary bg-primary/10 shadow-md'
                                                        : 'border-border hover:border-primary/50'
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
                                                                'text-sm font-medium transition-colors',
                                                                isCurrentPage ? 'text-primary' : 'text-foreground'
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
                                className='flex-shrink-0 h-10 w-10 p-0 rounded-full shadow-md hover:shadow-lg transition-shadow'
                                onClick={() => scrollPages('right')}>
                                <ChevronRight className='w-4 h-4' />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
