'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronRight,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNavigationContext } from './navigation-context';

// Page navigation row logic removed for "neat and clean" design

export function PageNavigation() {
    const [activeNavigation, setActiveNavigation] = useState(getNavigationContext().activeNavigation);
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
                className='no-print sticky top-14 z-20 w-full bg-background'
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}>
                {/* Horizontal page navigation row hidden for "neat and clean" design */}
                <PolygonBanner
                    title={pageTitle}
                    description={pageDescription || ''}
                />

                {/* Single Line Orange Breadcrumb Section - Integrated below Banner */}
                <div className='bg-gray-50/50 border-b border-gray-100'>
                    <div className='container mx-auto px-4 py-3'>
                        <div className='flex items-center gap-1.5 flex-wrap'>
                            <div className='flex items-center gap-1.5'>
                                <span className='text-[10px] uppercase font-black tracking-widest text-orange-400/80'>
                                    {activeNavigation.module}
                                </span>
                                <span className='text-orange-200 text-xs'>/</span>
                            </div>

                            <div className='flex items-center gap-1.5'>
                                <span className='text-[13px] font-bold text-orange-600'>
                                    {activeNavigation.menu}
                                </span>
                                <span className='text-orange-200 text-xs'>/</span>
                            </div>

                            <div className='flex items-center gap-1.5'>
                                <span className='text-[13px] font-semibold text-orange-500'>
                                    {activeNavigation.subMenu}
                                </span>
                                <span className='text-orange-200 text-xs'>/</span>
                            </div>

                            <div className='flex items-center gap-1.5'>
                                <span className='text-[14px] font-black text-orange-700 decoration-orange-300/30 decoration-2 underline-offset-4 underline'>
                                    {pageName}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
