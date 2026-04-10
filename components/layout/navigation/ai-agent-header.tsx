'use client';

import * as React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setRequestedModule, setModuleFilter } from './navigation-context';

export function AIAgentHeader() {
    const handleAction = (e: React.MouseEvent) => {
        // Prevent default and trigger module drawer instead
        e.preventDefault();
        e.stopPropagation();
        setModuleFilter("AI Edge");
        setRequestedModule("AI Edge");
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                className="group flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 transition-all hover:bg-purple-50 hover:text-purple-600 active:scale-95"
                onClick={handleAction}
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-purple-100 group-hover:text-purple-600 relative">
                    <Bot className="h-4 w-4" />
                    <Sparkles className="h-2 w-2 text-purple-500 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="text-sm font-bold tracking-tight">AI Edge</span>
            </Button>
        </div>
    );
}
