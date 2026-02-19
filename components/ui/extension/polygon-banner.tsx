'use client';

import { EditIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PolygonBannerProps {
    title?: string;
    description?: string;
    breadcrumb?: ReactNode;
}

export function PolygonBanner({ title = 'Welcome Back', description = 'Access your dashboard' }: PolygonBannerProps) {
    return (
        <div className='relative w-full overflow-hidden bg-primary py-2.5'>
            {/* Background Image */}
            <div className='absolute inset-0'>
                <img src='/assets/Polygon_Mask.png' alt='Polygon' className='h-full w-full object-cover' />
            </div>

            {/* Content */}
            <div className='container relative z-10 mx-auto px-4'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-3'>
                        <div className='p-1.5 rounded-lg bg-white/10 backdrop-blur-sm'>
                            <EditIcon className='text-white h-4 w-4' />
                        </div>
                        <p className='font-black text-xl md:text-2xl text-white tracking-tight uppercase'>{title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
