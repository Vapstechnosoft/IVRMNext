'use client';

import { Phone, Globe, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='sticky bottom-0 z-50 w-full border-t border-slate-200 bg-white/80 py-4 backdrop-blur-md'>
            <div className='container mx-auto px-6'>
                <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                    {/* Copyright Section */}
                    <div className='flex items-center gap-2 text-slate-500 text-sm font-medium'>
                        <Shield className='h-4 w-4 text-[#EA580C]' />
                        <p>© VAPS {currentYear === 2019 ? '2019' : `2019 - ${currentYear}`}. All rights reserved.</p>
                    </div>

                    {/* Branding/Links Section */}
                    <div className='flex items-center gap-6'>
                        <div className='flex items-center gap-2 text-slate-600 text-sm font-bold tracking-tight'>
                            <Globe className='h-4 w-4 text-[#4F39F6]' />
                            <span>VAPS DIGITAL CAMPUS</span>
                        </div>
                        <div className='hidden h-4 w-px bg-slate-200 md:block' />
                        <div className='flex items-center gap-2 text-slate-600 text-sm font-bold'>
                            <Phone className='h-4 w-4 text-[#10B981]' />
                            <span>Toll Free No: 01206901888</span>
                        </div>
                    </div>

                    {/* Subtle Accent */}
                    <div className='absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#EA580C]/20 to-transparent' />
                </div>
            </div>
        </footer>
    );
}
