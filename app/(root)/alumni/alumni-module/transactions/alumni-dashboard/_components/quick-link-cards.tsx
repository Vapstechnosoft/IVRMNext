'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    User,
    Heart,
    Cake,
    Image as ImageIcon,
    Bell,
    Calendar,
    UserPlus,
    ChevronRight
} from 'lucide-react';
import Image from 'next/image';

interface QuickLinkCardsProps {
    onProfile: () => void;
    onDonation: () => void;
    onBirthday: () => void;
    onGallery: () => void;
    onNotice: () => void;
    onEvents: () => void;
    onFriendRequest: () => void;
    totalCount?: number;
    donationAmount?: number;
}

export default function QuickLinkCards({
    onProfile,
    onDonation,
    onBirthday,
    onGallery,
    onNotice,
    onEvents,
    onFriendRequest,
    totalCount = 0,
    donationAmount = 0
}: QuickLinkCardsProps) {
    const cards = [
        {
            title: 'MY PROFILE',
            icon: '/images/pictureprofile.png',
            fallbackIcon: <User className='h-8 w-8 text-green-500' />,
            action: onProfile,
            detail: 'View your profile details',
            color: 'border-green-500/20'
        },
        {
            title: 'DONATION',
            icon: '/images/Donate.jpg',
            fallbackIcon: <Heart className='h-8 w-8 text-blue-500' />,
            action: onDonation,
            detail: `Total Donate: ₹${donationAmount}`,
            color: 'border-blue-500/20'
        },
        {
            title: 'BIRTHDAY',
            icon: '/images/Birthday.png',
            fallbackIcon: <Cake className='h-8 w-8 text-yellow-500' />,
            action: onBirthday,
            detail: 'Birthday Details',
            color: 'border-yellow-500/20'
        },
        {
            title: 'GALLERY',
            icon: '/images/Gallary.jpg',
            fallbackIcon: <ImageIcon className='h-8 w-8 text-orange-500' />,
            action: onGallery,
            detail: 'Photo & Video Gallery',
            color: 'border-orange-500/20'
        },
        {
            title: 'NOTICE',
            icon: '/images/Notice.png',
            fallbackIcon: <Bell className='h-8 w-8 text-purple-500' />,
            action: onNotice,
            detail: 'Important Notifications',
            color: 'border-purple-500/20'
        },
        {
            title: 'EVENTS',
            icon: '/images/Events2.png',
            fallbackIcon: <Calendar className='h-8 w-8 text-red-500' />,
            action: onEvents,
            detail: 'All Events',
            color: 'border-red-500/20'
        },
        {
            title: 'FRIEND REQUEST',
            icon: '/images/friendrequest.png',
            fallbackIcon: <UserPlus className='h-8 w-8 text-teal-500' />,
            action: onFriendRequest,
            detail: `Pending: ${totalCount}`,
            color: 'border-teal-500/20'
        }
    ];

    return (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {cards.map((card, idx) => (
                <Card
                    key={idx}
                    className={`cursor-pointer border-l-4 transition-all hover:scale-[1.02] hover:shadow-lg ${card.color}`}
                    onClick={card.action}
                >
                    <CardContent className='flex flex-col items-center justify-center space-y-3 p-6 text-center'>
                        <div className='relative h-16 w-24'>
                            {/* Assuming these images exist in the project, if not fallback is shown */}
                            <Image
                                src={card.icon}
                                alt={card.title}
                                fill
                                className='object-contain'
                                onError={(e) => {
                                    (e.target as any).style.display = 'none';
                                }}
                            />
                            <div className='flex h-full w-full items-center justify-center opacity-50 transition-opacity hover:opacity-100'>
                                {card.fallbackIcon}
                            </div>
                        </div>
                        <div className='space-y-1'>
                            <h3 className='font-bold text-primary'>{card.title}</h3>
                            <p className='text-xs text-muted-foreground'>{card.detail}</p>
                        </div>
                        <div className='flex w-full items-center justify-between border-t pt-3 text-xs font-medium text-muted-foreground'>
                            <span>Go to details</span>
                            <ChevronRight className='h-3 w-3' />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
