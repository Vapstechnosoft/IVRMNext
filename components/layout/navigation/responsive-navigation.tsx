'use client';

import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUserAccessiblePages } from '@/hooks/common';
import { getIconByName } from '@/lib/lucide-icon-registry';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';
import { Menu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface MobileNavigationProps {
    navItems: NavItem[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function MobileNavigation({ navItems, open, onOpenChange }: MobileNavigationProps) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side='left' className='w-[300px] overflow-auto'>
                <SheetHeader>
                    <SheetTitle className='flex items-center gap-2 text-left'>
                        <Sparkles className='h-5 w-5 text-primary' />
                        Navigation
                    </SheetTitle>
                </SheetHeader>

                <div className='mt-3 space-y-2'>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href || '#'}
                            className={cn(
                                'flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground',
                                isActive(item.href || '') && 'btn-gradient border-0 font-medium text-white'
                            )}
                            onClick={() => onOpenChange(false)}>
                            {item.icon &&
                                (() => {
                                    const IconComponent = getIconByName(item.icon);
                                    return IconComponent ? <IconComponent className='h-4 w-4' /> : null;
                                })()}
                            {item.name}
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

const NavigationMenuDemo = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
    ({ className, title, children, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            'group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                            className
                        )}
                        {...props}>
                        <div className='font-medium text-sm leading-none transition-colors group-hover:text-primary'>{title}</div>
                        <p className='line-clamp-2 text-muted-foreground text-sm leading-snug'>{children}</p>
                    </a>
                </NavigationMenuLink>
            </li>
        );
    }
);
NavigationMenuDemo.displayName = 'NavigationMenuDemo';

export function ResponsiveNavigation() {
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    const { data: pages } = useUserAccessiblePages();

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    useEffect(() => {
        if (pages?.data && pages.data.length > 0) {
            const updatedNavItems: NavItem[] = [];

            // Add valid menus (excluding 'N.A')
            pages.data.forEach((menu, index) => {
                if (menu.menu_name !== 'N.A') {
                    updatedNavItems.push({
                        id: index + 1,
                        name: menu.menu_name,
                        href: '#',
                        description: '',
                        icon: menu.icon,
                        items: menu.pages.map((page, subIndex) => ({
                            id: subIndex + 1,
                            name: page.name,
                            href: page.url,
                            description: ''
                        }))
                    });
                }
            });

            // Add 'N.A' menu pages as direct items
            pages.data.forEach((menu, index) => {
                if (menu.menu_name === 'N.A') {
                    menu.pages.forEach((page, subIndex) => {
                        updatedNavItems.push({
                            id: index * 100 + subIndex + 1,
                            name: page.name,
                            href: page.url,
                            description: '',
                            icon: undefined,
                            items: undefined
                        });
                    });
                }
            });

            setNavItems(updatedNavItems);
        }
    }, [pages]);

    return (
        <div className='flex items-center'>
            {/* Desktop Navigation */}
            <div className='hidden items-center lg:flex'>
                <NavigationMenu>
                    <NavigationMenuList className='flex items-center space-x-4'>
                        {/* All navigation items as simple links */}
                        {navItems.map((item) => (
                            <NavigationMenuItem key={item.name}>
                                <Link href={item.href || '#'} legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={cn(
                                            'group relative inline-flex h-9 w-max items-center justify-center overflow-hidden rounded-md border border-border/90 bg-background px-4 py-2 font-medium text-sm transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
                                            isActive(item.href || '') && 'btn-gradient border-0 text-white shadow-lg'
                                        )}>
                                        <span className='relative z-10 flex items-center gap-2'>
                                            {item.icon &&
                                                (() => {
                                                    const IconComponent = getIconByName(item.icon);
                                                    return IconComponent ? <IconComponent className='h-4 w-4' /> : null;
                                                })()}
                                            {item.name}
                                            {isActive(item.href || '') && (
                                                <div className='-bottom-1 absolute right-0 left-0 h-0.5 rounded-full bg-secondary' />
                                            )}
                                        </span>
                                        <div className='absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            {/* Mobile Navigation */}
            <div className='lg:hidden'>
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant='outline'
                            size='icon'
                            className='relative overflow-hidden border-2 border-primary/20 transition-all duration-200 hover:scale-105 hover:border-primary/50'>
                            <Menu className='h-4 w-4' />
                            <div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 transition-opacity duration-200 hover:opacity-100' />
                        </Button>
                    </SheetTrigger>
                    <MobileNavigation navItems={navItems} open={mobileOpen} onOpenChange={setMobileOpen} />
                </Sheet>
            </div>
        </div>
    );
}
