'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BirthdayTemplateProps {
    participant: any;
    type: string;
    variant?: 'classic' | 'premium';
}

export default function BirthdayTemplate({ participant, type, variant = 'classic' }: BirthdayTemplateProps) {
    const name = type === 'Staff' ? participant.employeeName : participant.studentName;
    const photo = type === 'Staff' ? participant.PhotoPath : participant.photoPath;
    const id = type === 'Staff' ? participant.hrmE_Id : participant.amsT_Id;

    // Template 1 (Classic)
    if (variant === 'classic') {
        return (
            <div id={`birthday-card-classic-${id}`} className="relative h-[300px] w-[238px] overflow-hidden rounded-lg shadow-xl bg-white group border border-slate-200">
                <div className="relative h-full w-full">
                    {/* Background Image */}
                    <Image
                        src="https://vapsclg.blob.core.windows.net/files/Jan 23 A-01.jpg"
                        alt="Birthday Frame"
                        fill
                        className="object-cover"
                        crossOrigin="anonymous"
                        unoptimized
                    />
                    
                    {/* Overlay Student Image */}
                    <div className="absolute top-[76px] left-[70px] w-[97px] h-[83px] border-2 border-white/50 shadow-md overflow-hidden bg-slate-100">
                        {photo ? (
                            <Image 
                                src={photo} 
                                alt={name} 
                                fill 
                                className="object-cover" 
                                crossOrigin="anonymous"
                                unoptimized
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-300">
                                <span className="text-2xl">👤</span>
                            </div>
                        )}
                    </div>

                    {/* Student Name Overlay */}
                    <div className="absolute bottom-[20%] left-0 w-full text-center px-2">
                        <span className="text-[14px] font-bold text-[#df4a00] drop-shadow-sm line-clamp-1">
                            {name}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Template 2 (Premium / With Template)
    return (
        <div id={`birthday-card-premium-${id}`} className="relative h-[300px] w-[300px] overflow-hidden rounded-2xl shadow-2xl bg-white border border-slate-100">
            <div className="relative h-full w-full">
                {/* Background Image */}
                <Image
                    src="https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/b1a74104-2e6f-4b4d-962f-bb22ebfb8677.jpg"
                    alt="Premium Frame"
                    fill
                    className="object-cover"
                    crossOrigin="anonymous"
                    unoptimized
                />
                
                {/* Overlay Student Image */}
                <div className="absolute top-[78px] left-[101px] w-[97px] h-[83px] rounded-sm border-2 border-white shadow-lg overflow-hidden bg-slate-100">
                    {photo ? (
                        <Image 
                            src={photo} 
                            alt={name} 
                            fill 
                            className="object-cover opacity-90 hover:opacity-100 transition-opacity" 
                            crossOrigin="anonymous"
                            unoptimized
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                            <span className="text-4xl">🎂</span>
                        </div>
                    )}
                </div>

                {/* Student Name Overlay */}
                <div className="absolute bottom-[25px] left-0 w-full text-center px-4">
                    <h4 className="text-[16px] font-black text-slate-800 drop-shadow-sm uppercase tracking-tight">
                        {name}
                    </h4>
                </div>
            </div>
        </div>
    );
}
