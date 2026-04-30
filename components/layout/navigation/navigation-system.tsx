'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserAccessibleModules } from '@/hooks/common';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import type { IUserAccessibleModules } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Settings, BarChart3, ReceiptText } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getNavigationContext, setNavigationContext } from './navigation-context';

// Premium Border Beam Component for "Running Border" effect
const BorderBeam = ({
    size = 150,
    duration = 3,
    colorFrom = "#ff8c00",
    colorTo = "#ff4500"
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-100%] z-0"
                style={{
                    background: `conic-gradient(from 0deg, transparent 70%, ${colorFrom}, ${colorTo}, transparent)`
                }}
            />
            {/* Inner mask to create border effect */}
            <div className="absolute inset-[2px] bg-white rounded-[calc(inherit-2px)] z-10" />
        </div>
    );
};

// Aura Glow Component for the active state
const AuraGlow = () => (
    <motion.div
        layoutId="aura-glow"
        className="absolute inset-0 z-0 bg-orange-500/15 blur-[12px] rounded-full"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
    />
);

// Helper function to get icon with fallback for known module names
const getIconWithFallback = (iconName: string | null | undefined, moduleName: string): any => {
    if (iconName) {
        const icon = getIconByName(iconName);
        if (icon) return icon;
    }

    // Fallback icons for known modules
    const fallbackIcons: Record<string, any> = {
        'HRMS Config': Settings,
        'HRMS Config Report': Settings,
        'Reports': BarChart3,
        'Report': BarChart3,
        'Transactions': ReceiptText,
        'Transaction': ReceiptText
    };

    return fallbackIcons[moduleName] || null;
};

interface SubMenu {
    id: number;
    name: string;
    icon: string;
    pages: {
        id: number;
        name: string;
        icon: string;
        url: string;
        title?: string;
        description?: string;
    }[];
}

interface Menu {
    id: number;
    name: string;
    icon: string;
    sub_menu: SubMenu[];
}

export interface ActiveNavigation {
    module: string;
    menu: string;
    subMenu: string;
    pages: SubMenu['pages'];
    title?: string;
    description?: string;
}

export function NavigationSystem() {
    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [hoveredModule, setHoveredModule] = useState<string | null>(null);
    const [hoveredSubMenu, setHoveredSubMenu] = useState<{ menuName: string, subMenuName: string, pages: any[] } | null>(null);
    const [moduleFilter, setModuleFilterState] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const { data: accessibleModule } = useUserAccessibleModules();
    useEffect(() => {
        console.log('accessibleModule', accessibleModule);
    }, [accessibleModule])

    const handleModuleClick = (moduleName: string) => {
        if (activeDrawer === moduleName) {
            setActiveDrawer(null);
            setActiveModule(null);
        } else {
            setActiveDrawer(moduleName);
            setActiveModule(moduleName);
            // Reset sub-menu state when switching modules to avoid seeing previous module's content
            setHoveredSubMenu(null);
        }
    };

    const handleSubMenuClick = (module: IUserAccessibleModules, menu: Menu, subMenu: SubMenu) => {
        const firstPageUrl = subMenu.pages[0]?.url;
        if (firstPageUrl) {
            const firstPage = subMenu.pages[0];
            const navData = {
                module: module.name,
                menu: menu.name,
                subMenu: subMenu.name,
                pages: subMenu.pages,
                title: firstPage?.title || '',
                description: firstPage?.description || ''
            };
            setNavigationContext(navData);

            if (typeof window !== 'undefined') {
                sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
            }

            setActiveDrawer(null);
            setActiveModule(module.name);

            // Make AI Edge links portal-aware
            let targetUrl = firstPageUrl;
            if (targetUrl.includes('ai-notemaker') || targetUrl.includes('ai-performance-analysis') || targetUrl.includes('ai-question-paper-generator') || targetUrl.includes('ai-mcq-quiz')) {
                if (pathname.includes('/StaffPortal/')) {
                    if (targetUrl.includes('ai-notemaker')) targetUrl = '/StaffPortal/ai-notemaker';
                    else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StaffPortal/ai-performance-analysis';
                    else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StaffPortal/ai-question-paper-generator';
                    else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StaffPortal/ai-mcq-quiz';
                } else if (pathname.includes('/StudentPortal/')) {
                    if (targetUrl.includes('ai-notemaker')) targetUrl = '/StudentPortal/ai-notemaker';
                    else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StudentPortal/ai-performance-analysis';
                    else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StudentPortal/ai-question-paper-generator';
                    else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StudentPortal/ai-mcq-quiz';
                }
            }

            router.push(targetUrl);
        }
    };

    // Close drawer on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.navigation-drawer') && !target.closest('.nav-button')) {
                setActiveDrawer(null);
                setActiveModule(null);
            }
        };

        if (activeDrawer) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [activeDrawer]);

    // Handle external navigation requests (opening modules and filtering)
    useEffect(() => {
        const handleExternalRequest = (event: any) => {
            const moduleName = event.detail;
            if (moduleName && accessibleModule?.data) {
                const moduleExists = accessibleModule.data.some(m => m.name === moduleName);
                if (moduleExists) {
                    handleModuleClick(moduleName);
                }
            }
        };

        const handleFilterRequest = (event: any) => {
            setModuleFilterState(event.detail);
            if (typeof window !== 'undefined' && event.detail) {
                sessionStorage.setItem('moduleFilter', event.detail);
            } else if (typeof window !== 'undefined') {
                sessionStorage.removeItem('moduleFilter');
            }
        };

        window.addEventListener('module-request', handleExternalRequest);
        window.addEventListener('module-filter', handleFilterRequest);
        return () => {
            window.removeEventListener('module-request', handleExternalRequest);
            window.removeEventListener('module-filter', handleFilterRequest);
        };
    }, [accessibleModule?.data]);

    useEffect(() => {
        // Restore navigation context and filters from sessionStorage on mount
        if (typeof window !== 'undefined') {
            const savedNav = sessionStorage.getItem('activeNavigation');
            const savedFilter = sessionStorage.getItem('moduleFilter');

            if (savedFilter) setModuleFilterState(savedFilter);

            if (savedNav) {
                try {
                    const navData = JSON.parse(savedNav);
                    setNavigationContext(navData);
                    setActiveModule(navData.module);
                } catch (e) {
                    console.error('Failed to restore navigation context', e);
                }
            }
        }
    }, []);

    // Auto-sync navigation context with current URL
    useEffect(() => {
        if (!accessibleModule?.data || !pathname || pathname === '/') return;

        const currentNav = getNavigationContext().activeNavigation;

        // If current navigation already contains this page, just ensure module is active
        if (currentNav?.pages?.some(p => p.url === pathname)) {
            if (activeModule !== currentNav.module) {
                setActiveModule(currentNav.module);
            }
            return;
        }

        // Search for the page in all modules to sync context
        for (const module of accessibleModule.data) {
            for (const menu of module.menu) {
                for (const subMenu of menu.sub_menu) {
                    const matchedPage = subMenu.pages.find(p => p.url === pathname);
                    if (matchedPage) {
                        const navData: ActiveNavigation = {
                            module: module.name,
                            menu: menu.name,
                            subMenu: subMenu.name,
                            pages: subMenu.pages,
                            title: matchedPage.title || '',
                            description: matchedPage.description || ''
                        };
                        setNavigationContext(navData);
                        if (typeof window !== 'undefined') {
                            sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
                        }
                        setActiveModule(module.name);
                        return;
                    }
                }
            }
        }
    }, [accessibleModule, pathname, activeModule]);

    if (activeModule !== null && activeDrawer === null && (pathname === '/' || pathname === null)) {
        setActiveDrawer(null);
        setActiveModule(null);
        return null;
    }



    const handlePageClick = (page: any, module: any, menu: any, subMenu: any) => {
        const navData = {
            module: module.name,
            menu: menu.name,
            subMenu: subMenu.name,
            pages: subMenu.pages,
            title: page.title || '',
            description: page.description || ''
        };
        setNavigationContext(navData);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('activeNavigation', JSON.stringify(navData));
        }
        setActiveDrawer(null);

        // Make AI Edge links portal-aware
        let targetUrl = page.url;
        if (targetUrl.includes('ai-notemaker') || targetUrl.includes('ai-performance-analysis') || targetUrl.includes('ai-question-paper-generator') || targetUrl.includes('ai-mcq-quiz')) {
            if (pathname.includes('/StaffPortal/')) {
                // If in Staff Portal, force Staff Portal routes
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StaffPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StaffPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StaffPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StaffPortal/ai-mcq-quiz';
            } else if (pathname.includes('/StudentPortal/')) {
                // If in Student Portal, force Student Portal routes
                if (targetUrl.includes('ai-notemaker')) targetUrl = '/StudentPortal/ai-notemaker';
                else if (targetUrl.includes('ai-performance-analysis')) targetUrl = '/StudentPortal/ai-performance-analysis';
                else if (targetUrl.includes('ai-question-paper-generator')) targetUrl = '/StudentPortal/ai-question-paper-generator';
                else if (targetUrl.includes('ai-mcq-quiz')) targetUrl = '/StudentPortal/ai-mcq-quiz';
            }
        }

        router.push(targetUrl);
    };

    return (
        <div className='flex flex-1 items-center justify-center overflow-hidden py-2'>
            {/* Centered Floating Island Container */}
            <motion.div
                className='relative flex items-center bg-white/40 backdrop-blur-xl border border-white/40 rounded-full px-2 py-1.5 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05),0_5px_15px_-5px_rgba(0,0,0,0.02)] overflow-hidden'
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>

                {/* Horizontal Navigation Bar - Now hidden by default to keep header clean */}
                <nav className='hidden items-center overflow-x-auto scroll-smooth scrollbar-hide' onMouseLeave={() => setHoveredModule(null)}>
                    <div className='flex items-center space-x-1 px-2 min-w-max relative'>
                        {/* Clear Filter Button if active */}
                        {moduleFilter && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setModuleFilterState(null);
                                    if (typeof window !== 'undefined') sessionStorage.removeItem('moduleFilter');
                                }}
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 transition-all font-bold text-[10px] uppercase tracking-wider border border-orange-200/50"
                            >
                                <X className="h-3 w-3" />
                                All Modules
                            </Button>
                        )}

                        {accessibleModule?.data
                            ?.filter(module => !moduleFilter || module.name === moduleFilter)
                            ?.map((module) => {
                                const IconComponent = getIconByName(module.icon);
                                const isActive = activeModule === module.name;

                                return (
                                    <div key={module.id} className="relative py-0.5">
                                        <Button
                                            variant='ghost'
                                            className={cn(
                                                'nav-button group relative inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-500 z-10',
                                                'hover:bg-transparent active:scale-95',
                                                isActive
                                                    ? 'text-orange-600'
                                                    : 'text-gray-500 hover:text-orange-600'
                                            )}
                                            onMouseEnter={() => setHoveredModule(module.name)}
                                            onClick={() => handleModuleClick(module.name)}>

                                            {isActive && <AuraGlow />}

                                            <motion.div
                                                whileHover={{ scale: 1.2, x: 2 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                className={cn(
                                                    "flex items-center justify-center p-1.5 rounded-full transition-all duration-500",
                                                    isActive
                                                        ? "bg-orange-500 text-white shadow-[0_4px_12px_rgba(255,100,0,0.3)]"
                                                        : "bg-gray-100/50 text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500"
                                                )}>
                                                {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
                                            </motion.div>

                                            <span className={cn(
                                                'text-[12px] font-bold tracking-[0.05em] uppercase whitespace-nowrap transition-colors duration-500 relative z-10',
                                                isActive ? 'text-orange-600' : 'text-gray-600 group-hover:text-orange-600'
                                            )}>
                                                {module.name}
                                            </span>

                                            <ChevronDown className={cn(
                                                'h-3 w-3 transition-transform duration-500 ease-out opacity-40 ml-1 relative z-10',
                                                isActive && 'rotate-180 text-orange-600 opacity-100'
                                            )} />
                                        </Button>
                                    </div>
                                );
                            })}
                    </div>
                </nav>
            </motion.div>

            {/* Dropdown Drawer */}
            <AnimatePresence>
                {activeDrawer && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]'
                            onClick={() => setActiveDrawer(null)}
                        />

                        {/* Drawer Content - Luxury Curved Responsive Design */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 280,
                                damping: 24,
                                mass: 1.2
                            }}
                            className='navigation-drawer absolute top-[calc(100%+12px)] left-0 right-0 z-50 mx-auto w-[96vw] max-w-[1400px]' >

                            <div className='relative w-full p-2.5 rounded-[3.5rem] bg-gradient-to-br from-white via-white/95 to-white/90 shadow-[0_80px_160px_-30px_rgba(140,107,211,0.35),0_50px_100px_-25px_rgba(255,122,24,0.3)] border border-white/50 backdrop-blur-3xl overflow-hidden' >

                                {/* Crystalline Shine Overlay */}
                                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-500/5 via-transparent to-orange-500/5" />

                                <div className='relative w-full rounded-[2.8rem] bg-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row'>
                                    {/* Responsive Header for Mobile */}
                                    <div className="md:hidden flex items-center justify-between p-6 border-b border-gray-50">
                                        <h3 className="text-lg font-black text-gray-800 tracking-tight">{activeDrawer}</h3>
                                        <Button variant="ghost" size="icon" onClick={() => setActiveDrawer(null)} className="rounded-full bg-gray-50">
                                            <X className="h-5 w-5 text-gray-400" />
                                        </Button>
                                    </div>

                                    <div className='h-[80vh] md:h-[75vh] flex flex-col w-full overflow-hidden'>
                                        {/* Content area with split scrolling */}
                                        <div className='flex flex-1 flex-col xl:flex-row py-0 px-0 gap-0 overflow-hidden'>
                                            {/* Left Panel: Menu Categories with vertical scroll */}
                                            <motion.div
                                                className='flex-1 overflow-y-auto p-6 md:p-10 scrollbar-hide'
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                    visible: {
                                                        transition: {
                                                            staggerChildren: 0.04
                                                        }
                                                    }
                                                }}
                                            >
                                                <div className='flex flex-wrap gap-8 items-start'>
                                                    {accessibleModule?.data
                                                        ?.find((m) => m.name === activeDrawer)
                                                        ?.menu.map((menu) => (
                                                            <motion.div
                                                                key={menu.id}
                                                                variants={{
                                                                    hidden: { opacity: 0, scale: 0.95 },
                                                                    visible: { opacity: 1, scale: 1 }
                                                                }}
                                                                className='relative group flex flex-col min-w-[240px]'
                                                            >
                                                                {/* Interactive Glowing Card */}
                                                                <div className={cn(
                                                                    "relative p-6 rounded-2xl bg-white border border-gray-100/50 shadow-sm transition-all duration-300",
                                                                    "group-hover:shadow-[0_20px_40px_-15px_rgba(255,100,0,0.18)] group-hover:-translate-y-1 group-hover:border-transparent",
                                                                    "overflow-hidden"
                                                                )}>
                                                                    {/* Running Border Glow */}
                                                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                                        <BorderBeam duration={3} colorFrom="#8b5cf6" colorTo="#d946ef" />
                                                                    </div>

                                                                    {/* Card Content */}
                                                                    <div className="relative z-20">
                                                                        <h4 className='font-black text-purple-600 text-[11px] uppercase tracking-[0.2em] mb-4 pb-2 border-b border-purple-50 flex items-center justify-between'>
                                                                            {menu.name}
                                                                            <div className="h-1 w-1 rounded-full bg-purple-500/50 group-hover:scale-150 transition-transform" />
                                                                        </h4>

                                                                        {/* Submenu items list style */}
                                                                        <div className='flex flex-col space-y-3.5'>
                                                                            {menu.sub_menu.map((subMenu) => (
                                                                                <button
                                                                                    key={subMenu.id}
                                                                                    className={cn(
                                                                                        'text-left text-[14px] text-[#555] hover:text-orange-600 hover:font-bold transition-all group/item flex items-center justify-between gap-2 pr-2',
                                                                                        hoveredSubMenu?.subMenuName === subMenu.name && 'text-orange-600 font-bold'
                                                                                    )}
                                                                                    onMouseEnter={() => setHoveredSubMenu({
                                                                                        menuName: menu.name,
                                                                                        subMenuName: subMenu.name,
                                                                                        pages: subMenu.pages
                                                                                    })}
                                                                                    onClick={() => {
                                                                                        // For mobile/touch: If this sub-menu isn't active, show it first
                                                                                        if (hoveredSubMenu?.subMenuName !== subMenu.name) {
                                                                                            setHoveredSubMenu({
                                                                                                menuName: menu.name,
                                                                                                subMenuName: subMenu.name,
                                                                                                pages: subMenu.pages
                                                                                            });
                                                                                        } else {
                                                                                            // If already active, then navigate
                                                                                            handleSubMenuClick(
                                                                                                accessibleModule?.data?.find((m) => m.name === activeDrawer)!,
                                                                                                menu,
                                                                                                subMenu
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <span>{subMenu.name}</span>
                                                                                    <ChevronRight className={cn(
                                                                                        'h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100',
                                                                                        hoveredSubMenu?.subMenuName === subMenu.name && 'opacity-100'
                                                                                    )} />
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                </div>
                                            </motion.div>

                                            {/* Right Panel: Dynamic Page Detail Panel - Sticky Header with Scrollable List */}
                                            <div className={cn(
                                                'w-full xl:w-[380px] flex-shrink-0 flex flex-col bg-white border-t xl:border-t-0 xl:border-l border-gray-100/80 shadow-[inset_0_1px_0_0_rgba(0,0,0,0.01),inset_1px_0_0_0_rgba(0,0,0,0.01)] h-full overflow-hidden',
                                                !hoveredSubMenu && 'hidden xl:flex'
                                            )}>
                                                <div className='p-8 border-b border-gray-100 bg-gray-50/10 sticky top-0 z-30 backdrop-blur-md'>
                                                    <h5 className='text-[10px] font-black text-orange-500 uppercase tracking-[0.25em] mb-2'>
                                                        {hoveredSubMenu ? 'Quick Access' : 'Explorer'}
                                                    </h5>
                                                    <p className='text-md font-bold text-purple-600 tracking-tight leading-none truncate'>
                                                        {hoveredSubMenu ? hoveredSubMenu.subMenuName : `All ${activeDrawer} Modules`}
                                                    </p>
                                                </div>
                                                <div className='flex-1 overflow-y-auto p-5 scrollbar-hide'>
                                                    <AnimatePresence mode='wait'>
                                                        {hoveredSubMenu ? (
                                                            <motion.div
                                                                key={hoveredSubMenu.subMenuName}
                                                                initial={{ opacity: 0, scale: 0.98, x: 10 }}
                                                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                exit={{ opacity: 0, scale: 0.98, x: -10 }}
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                                className='space-y-1.5'
                                                            >
                                                                {hoveredSubMenu.pages.map((page, idx) => (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => handlePageClick(
                                                                            page,
                                                                            accessibleModule?.data?.find((m) => m.name === activeDrawer)!,
                                                                            { name: hoveredSubMenu.menuName },
                                                                            { name: hoveredSubMenu.subMenuName, pages: hoveredSubMenu.pages }
                                                                        )}
                                                                        className='w-full text-left px-5 py-3 rounded-2xl text-[14px] text-[#4a4a4a] hover:bg-orange-50/50 hover:text-orange-600 border border-transparent hover:border-orange-100/50 transition-all flex items-center gap-3 group/page'
                                                                    >
                                                                        <div className='h-1.5 w-1.5 rounded-full bg-orange-500/20 group-hover/page:bg-orange-500 transition-colors' />
                                                                        <span className='group-hover/page:translate-x-0.5 transition-transform'>{page.title}</span>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        ) : (
                                                            <div className='h-full flex flex-col items-center justify-center text-center px-10'>
                                                                <div className='p-10 rounded-[3rem] bg-orange-50/30 mb-6'>
                                                                    <img
                                                                        src='/assets/student_academic.png'
                                                                        alt='Navigation'
                                                                        className='h-32 w-auto grayscale opacity-25 mix-blend-multiply'
                                                                    />
                                                                </div>
                                                                <p className='text-[13px] font-medium text-muted-foreground/80 leading-relaxed'>
                                                                    Select a sub-module to explore <br /> available categories
                                                                </p>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Custom scrollbar styling */}
            <style jsx global>{`
                /* Custom scrollbar styling for the entire component */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 3px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                }

                /* For Firefox */
                .overflow-y-auto {
                    scrollbar-width: thin;
                    scrollbar-color: #c1c1c1 transparent;
                }

                /* Hide scrollbar utility - must be at the bottom for priority */
                .scrollbar-hide::-webkit-scrollbar {
                    display: none !important;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none !important;  /* IE and Edge */
                    scrollbar-width: none !important;  /* Firefox */
                }

                /* Horizontal scroll for main nav */
                nav.overflow-x-auto::-webkit-scrollbar {
                    height: 4px;
                }

                nav.overflow-x-auto::-webkit-scrollbar-track {
                    background: transparent;
                }

                nav.overflow-x-auto::-webkit-scrollbar-thumb {
                    background: #d4d4d4;
                    border-radius: 2px;
                }

                nav.overflow-x-auto::-webkit-scrollbar-thumb:hover {
                    background: #a3a3a3;
                }
            `}</style>
        </div>
    );
}