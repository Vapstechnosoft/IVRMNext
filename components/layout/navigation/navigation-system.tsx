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
import { useEffect, useState } from 'react';
import { setNavigationContext } from './navigation-context';

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
    const [hoveredSubMenu, setHoveredSubMenu] = useState<{ menuName: string, subMenuName: string, pages: any[] } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    const { data: accessibleModule } = useUserAccessibleModules();

    const handleModuleClick = (moduleName: string) => {
        if (activeDrawer === moduleName) {
            setActiveDrawer(null);
        } else {
            setActiveDrawer(moduleName);
            setActiveModule(moduleName);
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
            router.push(firstPageUrl);
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

    // Add this after the existing useEffect
    useEffect(() => {
        // Restore navigation context from sessionStorage on mount
        if (typeof window !== 'undefined') {
            const savedNav = sessionStorage.getItem('activeNavigation');
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

    if (activeModule !== null && activeDrawer === null && (pathname === '/' || pathname === null)) {
        setActiveDrawer(null);
        setActiveModule(null);
        return null;
    }

    const handleMouseEnter = (moduleName: string) => {
        setActiveDrawer(moduleName);
        setActiveModule(moduleName);
    };

    const handleMouseLeave = () => {
        setActiveDrawer(null);
        setActiveModule(null);
        setHoveredSubMenu(null);
    };

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
        router.push(page.url);
    };

    return (
        <div className='flex flex-1 items-center justify-start overflow-hidden' onMouseLeave={handleMouseLeave}>
            <div className='w-[100%] overflow-hidden'>
                <nav className='flex items-center overflow-x-auto py-2 scroll-smooth'>
                    <div className='flex items-center space-x-1 min-w-max'>
                        {accessibleModule?.data?.map((module) => {
                            const IconComponent = getIconByName(module.icon);
                            const isActive = activeModule === module.name;

                            return (
                                <Button
                                    key={module.id}
                                    variant='ghost'
                                    className={cn(
                                        'nav-button group relative inline-flex items-center gap-1.5 rounded-none px-4 py-2 transition-all duration-300',
                                        'hover:bg-transparent',
                                        isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
                                    )}
                                    onMouseEnter={() => handleMouseEnter(module.name)}
                                    onClick={() => handleModuleClick(module.name)}>
                                    <span className='z-10 text-[14px] tracking-tight whitespace-nowrap'>{module.name}</span>
                                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300 opacity-40', isActive && 'rotate-180 text-primary opacity-100')} />
                                    {isActive && (
                                        <motion.div
                                            layoutId='activeModuleNav'
                                            className='absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(var(--primary-rgb),0.3)]'
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Dropdown Drawer */}
            <AnimatePresence>
                {activeDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]'
                            onClick={() => setActiveDrawer(null)}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25
                            }}
                            className='navigation-drawer absolute top-[calc(100%+8px)] left-0 right-0 z-50 mx-auto w-full max-w-[1400px] px-4' >
                            <div className='relative w-full rounded-[2.5rem] border border-gray-100 bg-white shadow-[0_30px_90px_-20px_rgba(0,0,0,0.18)] overflow-hidden'>
                                <div className='max-h-[85vh] flex flex-col'>
                                    {/* Scrollable content area */}
                                    <div className='flex flex-1 overflow-hidden py-12 px-14'>
                                        {/* Main content with vertical scroll */}
                                        <motion.div
                                            className='flex-1 overflow-y-auto pr-8'
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
                                                                "group-hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] group-hover:-translate-y-1 group-hover:border-transparent",
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
                                                                                onClick={() =>
                                                                                    handleSubMenuClick(
                                                                                        accessibleModule?.data?.find((m) => m.name === activeDrawer)!,
                                                                                        menu,
                                                                                        subMenu
                                                                                    )
                                                                                }
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

                                        {/* Dynamic Page Detail Panel */}
                                        <div className='hidden xl:flex w-[380px] flex-shrink-0 flex-col bg-white border-l border-gray-100/80 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.01)]'>
                                            <div className='p-8 border-b border-gray-100 bg-gray-50/30'>
                                                <h5 className='text-[10px] font-black text-orange-500 uppercase tracking-[0.25em] mb-2'>
                                                    {hoveredSubMenu ? 'Quick Access' : 'Explorer'}
                                                </h5>
                                                <p className='text-md font-bold text-purple-600 tracking-tight leading-none truncate'>
                                                    {hoveredSubMenu ? hoveredSubMenu.subMenuName : `All ${activeDrawer} Modules`}
                                                </p>
                                            </div>
                                            <div className='flex-1 overflow-y-auto p-5'>
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