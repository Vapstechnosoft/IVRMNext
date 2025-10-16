'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUserAccessibleModules } from '@/hooks/common';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import type { IUserAccessibleModules } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setNavigationContext } from './navigation-context';

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
            const navData = {
                module: module.name,
                menu: menu.name,
                subMenu: subMenu.name,
                pages: subMenu.pages,
                title: subMenu.pages[0]?.title,
                description: subMenu.pages[0]?.description
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

    return (
        <div className='flex flex-1 items-center justify-start'>
            <nav className='flex items-center space-x-1'>
                {accessibleModule?.data?.map((module) => {
                    const IconComponent = getIconByName(module.icon);
                    const isActive = activeModule === module.name;

                    return (
                        <Button
                            key={module.id}
                            variant={isActive ? 'default' : 'ghost'}
                            className={cn(
                                'nav-button flex items-center gap-2 rounded-lg px-4 py-2 transition-all duration-200',
                                'hover:bg-accent hover:text-accent-foreground',
                                isActive && 'bg-primary text-primary-foreground shadow-md'
                            )}
                            onClick={() => handleModuleClick(module.name)}>
                            {IconComponent && <IconComponent className='h-4 w-4' />}
                            <span className='hidden font-medium sm:inline-block'>{module.name}</span>
                            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isActive && 'rotate-180')} />
                        </Button>
                    );
                })}
            </nav>

            {/* Dropdown Drawer */}
            <AnimatePresence>
                {activeDrawer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='fixed inset-0 z-40 bg-black/20'
                            onClick={() => setActiveDrawer(null)}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className='navigation-drawer absolute top-full right-0 left-0 z-50 mx-4 mt-2 rounded-2xl border bg-card shadow-2xl'>
                            <div className='max-h-96 overflow-y-auto p-6'>
                                <div className='mb-4 flex items-center justify-between'>
                                    <h3 className='font-semibold text-foreground text-lg'>{activeDrawer} Modules</h3>
                                    <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => setActiveDrawer(null)}
                                        className='h-8 w-8 p-0 hover:bg-accent'>
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                                <div className='flex gap-4'>
                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {accessibleModule?.data
                                            ?.find((m) => m.name === activeDrawer)
                                            ?.menu.map((menu) => (
                                                <Card key={menu.id} className='transition-shadow duration-200 hover:shadow-md'>
                                                    <CardContent className='p-4'>
                                                        <div className='mb-3 flex items-center gap-3'>
                                                            {getIconByName(menu.icon) && (
                                                                <div className='rounded-lg bg-primary/10 p-2'>
                                                                    {(() => {
                                                                        const IconComp = getIconByName(menu.icon);
                                                                        return IconComp ? (
                                                                            <IconComp className='h-4 w-4 text-primary' />
                                                                        ) : null;
                                                                    })()}
                                                                </div>
                                                            )}
                                                            <h4 className='font-medium text-foreground'>{menu.name}</h4>
                                                        </div>

                                                        <div className='space-y-2'>
                                                            {menu.sub_menu.map((subMenu) => (
                                                                <Button
                                                                    key={subMenu.id}
                                                                    variant='ghost'
                                                                    className='h-auto w-full justify-start p-2 text-sm hover:bg-accent/50'
                                                                    onClick={() =>
                                                                        handleSubMenuClick(
                                                                            accessibleModule?.data?.find((m) => m.name === activeDrawer)!,
                                                                            menu,
                                                                            subMenu
                                                                        )
                                                                    }>
                                                                    <div className='flex items-center gap-2'>
                                                                        {getIconByName(subMenu.icon) &&
                                                                            (() => {
                                                                                const IconComp = getIconByName(subMenu.icon);
                                                                                return IconComp ? <IconComp className='h-3 w-3' /> : null;
                                                                            })()}
                                                                        <span>{subMenu.name}</span>
                                                                        <span className='ml-auto text-muted-foreground text-xs'>
                                                                            ({subMenu.pages.length} pages)
                                                                        </span>
                                                                    </div>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                    <img src='/assets/student_academic.png' alt='Hero Illustration' className='mt-4 w-[250px]' />
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
