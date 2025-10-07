'use client';

interface PolygonBannerProps {
    title?: string;
    description?: string;
}

export function PolygonBanner({ title = 'Welcome Back', description = 'Access your dashboard' }: PolygonBannerProps) {
    return (
        <div className='relative w-full overflow-hidden bg-primary py-4'>
            {/* Background Image */}
            <div className='absolute inset-0'>
                <img src='/assets/Polygon_Mask.png' alt='Polygon' className='h-full w-full object-cover' />
            </div>

            {/* Content */}
            <div className='container relative z-10 mx-auto flex flex-col items-start px-4'>
                <p className='font-bold text-3xl text-white'>{title}</p>
                {description && <p className='mt-1 text-sm text-white/90'>{description}</p>}
            </div>
        </div>
    );
}
