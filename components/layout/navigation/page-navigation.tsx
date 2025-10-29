'use client';

import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
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
    const [pageName, setPageName] = useState('');
    const [pageTitle, setPageTitle] = useState('');
    const [pageDescription, setPageDescription] = useState('');

    // Listen for navigation context changes and update page details
    useEffect(() => {
        const interval = setInterval(() => {
            const context = getNavigationContext();
            if (context.activeNavigation !== activeNavigation) {
                setActiveNavigation(context.activeNavigation);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [activeNavigation]);

    // Update page details when activeNavigation or pathname changes
    useEffect(() => {
        if (activeNavigation?.pages) {
            const currentPage = activeNavigation.pages.find((page: any) => page.url === pathname);
            if (currentPage) {
                setPageName(currentPage.name);
                setPageTitle(currentPage.title || '');
                setPageDescription(currentPage.description || '');
            }
        }
    }, [activeNavigation, pathname]);

    // Update navigation context when navigating between pages
    useEffect(() => {
        if (activeNavigation?.pages) {
            const currentPage = activeNavigation.pages.find((page: any) => page.url === pathname);
            if (currentPage && (activeNavigation.title !== currentPage.title || activeNavigation.description !== currentPage.description)) {
                const updatedNavData = {
                    ...activeNavigation,
                    title: currentPage.title || '',
                    description: currentPage.description || ''
                };

                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('activeNavigation', JSON.stringify(updatedNavData));
                }
            }
        }
    }, [pathname, activeNavigation]);

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
                transition={{ duration: 0.3, ease: 'easeInOut' }}>
                <div className='container flex flex-col bg-card py-2'>
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
                                        <Link
                                            key={page.id}
                                            href={page.url}
                                            onClick={() => {
                                                setPageName(page.name);
                                                setPageTitle(page.title);
                                                setPageDescription(page.description);
                                            }}>
                                            <div
                                                className={cn(
                                                    'min-w-[150px] flex-shrink-0 cursor-pointer text-nowrap border-0 transition-all duration-200 hover:scale-105 hover:shadow-lg',
                                                    isCurrentPage ? 'border-primary/70 border-b' : ''
                                                )}>
                                                <CardContent className='p-2 text-center'>
                                                    <div className='flex items-center'>
                                                        {IconComponent && (
                                                            <div
                                                                className={cn(
                                                                    'rounded-full p-2 transition-colors',
                                                                    isCurrentPage ? 'text-primary' : 'text-black'
                                                                )}>
                                                                <IconComponent className='h-3 w-3' />
                                                            </div>
                                                        )}
                                                        <span
                                                            className={cn(
                                                                'font-medium text-sm',
                                                                isCurrentPage ? 'text-primary' : 'text-black'
                                                            )}>
                                                            {page.name}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </div>
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
                {/* PolygonBanner with Breadcrumb */}
                <PolygonBanner
                    title={pageTitle}
                    description={pageDescription || ''}
                    breadcrumb={
                        <div className='flex items-center gap-2 text-sm text-white/80'>
                            <span className='font-medium'>{activeNavigation.module}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span>{activeNavigation.menu}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span className='font-medium'>{activeNavigation.subMenu}</span>
                            <ChevronRight className='h-4 w-4' />
                            <span className='font-bold text-white'>{pageName}</span>
                        </div>
                    }
                />
            </motion.div>
        </AnimatePresence>
    );
}
