'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import type { IUserAccessibleModules } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
}

export function NavigationSystem() {
    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
    const router = useRouter();

    // Mock data - replace with your hook
    const accessibleModule: IUserAccessibleModules = {
        id: 1,
        name: 'Admission',
        icon: 'Settings',
        menu: [
            {
                id: 1,
                name: 'Preadmission',
                icon: 'Settings',
                sub_menu: [
                    {
                        id: 1,
                        name: 'Masters',
                        icon: 'Settings',
                        pages: [
                            {
                                id: 1,
                                name: 'Master Class',
                                icon: 'Settings',
                                url: '/admission/preadmission/masters/class'
                            },
                            {
                                id: 2,
                                name: 'Master Section',
                                icon: 'Settings',
                                url: '/admission/masters/section'
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: 'Transactions',
                        icon: 'Settings',
                        pages: [
                            {
                                id: 1,
                                name: 'Master Class',
                                icon: 'Settings',
                                url: '/admission/preadmission/transactions/class'
                            },
                            {
                                id: 2,
                                name: 'Master Section',
                                icon: 'Settings',
                                url: '/admission/transactions/section'
                            }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: 'Enrollment',
                icon: 'Settings',
                sub_menu: [
                    {
                        id: 2,
                        name: 'Transactions',
                        icon: 'Settings',
                        pages: [
                            {
                                id: 3,
                                name: 'Student Enrollment',
                                icon: 'Settings',
                                url: '/enrollment/transactions/student'
                            },
                            {
                                id: 4,
                                name: 'Student TC',
                                icon: 'Settings',
                                url: '/enrollment/transactions/student_tc'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    // Additional modules for demo
    const allModules = [
        accessibleModule,
        {
            id: 2,
            name: 'Academic',
            icon: 'BookOpen',
            menu: [
                {
                    id: 3,
                    name: 'Curriculum',
                    icon: 'Book',
                    sub_menu: [
                        {
                            id: 3,
                            name: 'Subjects',
                            icon: 'FileText',
                            pages: [
                                { id: 5, name: 'Subject Master', icon: 'Plus', url: '/academic/subjects/master' },
                                { id: 6, name: 'Subject Mapping', icon: 'Link', url: '/academic/subjects/mapping' }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 3,
            name: 'Finance',
            icon: 'DollarSign',
            menu: [
                {
                    id: 4,
                    name: 'Fees',
                    icon: 'CreditCard',
                    sub_menu: [
                        {
                            id: 4,
                            name: 'Management',
                            icon: 'Settings',
                            pages: [
                                { id: 7, name: 'Fee Structure', icon: 'List', url: '/finance/fees/structure' },
                                { id: 8, name: 'Fee Collection', icon: 'Wallet', url: '/finance/fees/collection' }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    const handleModuleClick = (moduleName: string) => {
        if (activeDrawer === moduleName) {
            setActiveDrawer(null);
        } else {
            setActiveDrawer(moduleName);
        }
    };

    const handleSubMenuClick = (module: IUserAccessibleModules, menu: Menu, subMenu: SubMenu) => {
        const firstPageUrl = subMenu.pages[0]?.url;
        if (firstPageUrl) {
            setNavigationContext({
                module: module.name,
                menu: menu.name,
                subMenu: subMenu.name,
                pages: subMenu.pages
            });
            setActiveDrawer(null);
            router.push(firstPageUrl);
        }
    };

    // Close drawer on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.navigation-drawer') && !target.closest('.nav-button')) {
                setActiveDrawer(null);
            }
        };

        if (activeDrawer) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [activeDrawer]);

    return (
        <div className='flex items-center justify-center flex-1'>
            <nav className='flex items-center space-x-1'>
                {allModules.map((module) => {
                    const IconComponent = getIconByName(module.icon);
                    const isActive = activeDrawer === module.name;

                    return (
                        <Button
                            key={module.id}
                            variant={isActive ? 'default' : 'ghost'}
                            className={cn(
                                'nav-button flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
                                'hover:bg-accent hover:text-accent-foreground',
                                isActive && 'bg-primary text-primary-foreground shadow-md'
                            )}
                            onClick={() => handleModuleClick(module.name)}>
                            {IconComponent && <IconComponent className='w-4 h-4' />}
                            <span className='hidden sm:inline-block font-medium'>{module.name}</span>
                            <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isActive && 'rotate-180')} />
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
                            className='fixed inset-0 bg-black/20 z-40'
                            onClick={() => setActiveDrawer(null)}
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className='navigation-drawer absolute top-full right-0 left-0 z-50 mx-4 mt-2 rounded-2xl border bg-background shadow-2xl'>
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

                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {allModules
                                        .find((m) => m.name === activeDrawer)
                                        ?.menu.map((menu) => (
                                            <Card key={menu.id} className='hover:shadow-md transition-shadow duration-200'>
                                                <CardContent className='p-4'>
                                                    <div className='flex items-center gap-3 mb-3'>
                                                        {getIconByName(menu.icon) && (
                                                            <div className='p-2 bg-primary/10 rounded-lg'>
                                                                {(() => {
                                                                    const IconComp = getIconByName(menu.icon);
                                                                    return IconComp ? <IconComp className='w-4 h-4 text-primary' /> : null;
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
                                                                className='w-full justify-start p-2 h-auto text-sm hover:bg-accent/50'
                                                                onClick={() =>
                                                                    handleSubMenuClick(
                                                                        allModules.find((m) => m.name === activeDrawer)!,
                                                                        menu,
                                                                        subMenu
                                                                    )
                                                                }>
                                                                <div className='flex items-center gap-2'>
                                                                    {getIconByName(subMenu.icon) &&
                                                                        (() => {
                                                                            const IconComp = getIconByName(subMenu.icon);
                                                                            return IconComp ? <IconComp className='w-3 h-3' /> : null;
                                                                        })()}
                                                                    <span>{subMenu.name}</span>
                                                                    <span className='ml-auto text-xs text-muted-foreground'>
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
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
