'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SchoolAssistantBot } from './school-assistant-bot';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingSchoolBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAuthPage = pathname?.toLowerCase().includes('login') || pathname?.toLowerCase().includes('sign-in');

    if (!mounted || isAuthPage) return null;

    return (
        <>
            <div className="fixed bottom-1 right-20 z-[2147483647] flex flex-col items-center gap-1 group">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-xl hover:bg-slate-50 transition-all ring-2 ring-indigo-600 p-1.5 overflow-hidden"
                >
                    <img
                        src="/chatbot/standing-robot-black.png"
                        alt="School Assistant"
                        className="w-full h-full object-contain"
                    />
                </motion.button>
                <div className="bg-white/50 backdrop-blur-sm px-1.5 h-[12px] flex items-center justify-center rounded-full shadow-sm border border-black/5">
                    <span className="text-[7.5px] font-bold text-black/80 whitespace-nowrap uppercase tracking-wider leading-none translate-y-[0px]">
                        School Assistant
                    </span>
                </div>
            </div>

            <SchoolAssistantBot open={isOpen} onOpenChange={setIsOpen} />
        </>
    );
}
