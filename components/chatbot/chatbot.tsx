'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, X, Minus, Maximize2, Minimize2, MessageSquare, User, Loader2, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export const Chatbot = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Determine context based on URL
    const getContextInfo = () => {
        if (pathname.toLowerCase().includes('admission')) return { name: 'Admission', color: 'from-blue-500 to-indigo-600' };
        if (pathname.toLowerCase().includes('fees')) return { name: 'Fees & Finance', color: 'from-emerald-500 to-teal-600' };
        if (pathname.toLowerCase().includes('exam')) return { name: 'Assistant', color: 'from-purple-500 to-pink-600' };
        return { name: 'Assistant', color: 'from-[#9810FA] to-[#4F39F6]' };
    };

    const context = getContextInfo();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello! I am your AI VRM ${context.name} Expert. How can I help you today?`,
            role: 'assistant',
            timestamp: new Date()
        }
    ]);

    // Update welcome message when module changes
    useEffect(() => {
        if (messages.length === 1) {
            setMessages([{
                id: '1',
                text: `Hello! I am your AI VRM ${context.name} Expert. How can I help you today?`,
                role: 'assistant',
                timestamp: new Date()
            }]);
        }
    }, [pathname, context.name, messages.length]);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen, isMinimized, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            role: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.concat(userMessage).map(m => ({
                        role: m.role,
                        content: m.text
                    })),
                    context: context.name // Pass context to API
                })
            });

            const data = await response.json();

            if (data.text) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.text,
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages((prev) => [...prev, botMessage]);
            } else if (data.error) {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again later.",
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[2147483647] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && !isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                            width: isMaximized ? 'min(90vw, 900px)' : '400px',
                            height: isMaximized ? 'min(85vh, 800px)' : '550px'
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className={cn(
                            "bg-white dark:bg-zinc-900 border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden mb-4",
                            isMaximized && "fixed inset-4 m-auto z-[2147483647]"
                        )}
                    >
                        {/* Header */}
                        <div className={cn("p-4 flex items-center justify-between text-white bg-gradient-to-r", context.color)}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 relative">
                                    <Bot className="w-6 h-6 text-white" />
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                                        AI VRM {context.name}
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                    </h3>
                                    <p className="text-[11px] opacity-80 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                        Always here to help you
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                <button
                                    onClick={() => setIsMinimized(true)}
                                    className='rounded-md p-1.5 transition-colors hover:bg-white/10'
                                    title="Minimize"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                    title={isMaximized ? "Restore" : "Maximize"}
                                >
                                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                    title="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-zinc-800/30">
                            <ScrollArea className="h-full" ref={scrollRef}>
                                <div className="flex flex-col gap-4 p-5">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full flex-col gap-1.5",
                                                msg.role === 'user' ? "ml-auto items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "px-4 py-3 rounded-2xl text-[14px] shadow-sm leading-relaxed max-w-[85%] break-words whitespace-pre-wrap",
                                                msg.role === 'user'
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-white dark:bg-zinc-800 border border-border/50 rounded-tl-none text-foreground"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground px-1 uppercase tracking-wider font-semibold opacity-60">
                                                {msg.role === 'assistant' ? 'AI Assistant' : 'You'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-2">
                                            <div className="bg-white dark:bg-zinc-800 border border-border/50 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                                </div>
                                                <span className="text-xs text-muted-foreground ml-2">Thinking...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-border bg-white dark:bg-zinc-900">
                            <div className='flex items-center gap-2'>
                                <div className="flex-1 relative">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder={`Ask about ${context.name.toLowerCase()}...`}
                                        className='h-11 rounded-xl border-none bg-slate-100 pr-10 shadow-inner focus-visible:ring-2 focus-visible:ring-primary/20 dark:bg-zinc-800'
                                        disabled={isLoading}
                                    />
                                    <MessageSquare className='-translate-y-1/2 absolute top-1/2 right-3 h-4 w-4 text-muted-foreground/40' />
                                </div>
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className='h-11 w-11 shrink-0 rounded-xl bg-primary shadow-lg transition-all hover:bg-primary/90 active:scale-90'
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[9px] text-center text-muted-foreground mt-3 opacity-60">
                                AI responses are generated based on ERP knowledge and subject policy.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized Bar */}
            <AnimatePresence>
                {isOpen && isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={() => setIsMinimized(false)}
                        className={cn('mb-4 flex w-[300px] cursor-pointer items-center gap-3 rounded-t-xl border border-white/20 bg-gradient-to-r px-4 py-3 text-white shadow-2xl backdrop-blur-md', context.color)}
                    >
                        <Bot className="w-5 h-5" />
                        <span className='truncate font-bold text-xs tracking-tight'>Support: AI VRM {context.name}</span>
                        <Maximize2 className='ml-auto h-4 w-4 opacity-70' />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className="flex flex-col items-center gap-2">
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 5, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleChat}
                    className={cn(
                        'group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-4 ring-white/90 transition-all duration-500 dark:ring-zinc-800/90',
                        isOpen && !isMinimized ? "bg-red-500 ring-red-100" : cn("bg-gradient-to-tr", context.color)
                    )}
                >
                    <div className='absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20' />
                    {isOpen && !isMinimized ? (
                        <X className="w-6 h-6 text-white z-10" />
                    ) : (
                        <div className="relative">
                            <Bot className="w-8 h-8 text-white z-10 drop-shadow-lg" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                className='-top-1 -right-1 absolute z-20 flex h-3 w-3 items-center justify-center rounded-full bg-white'
                            >
                                <Sparkles className="w-2 h-2 text-primary" />
                            </motion.div>
                        </div>
                    )}
                </motion.button>
                <span className='rounded-full border border-border/50 bg-white/80 px-2 py-0.5 font-bold text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm dark:bg-black/50'>
                    AI VRM HELP
                </span>
            </div>
        </div>
    );
};
