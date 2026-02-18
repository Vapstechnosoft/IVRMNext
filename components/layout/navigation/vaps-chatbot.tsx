'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Bot, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WEBHOOK_URL = "https://n8n.srv937206.hstgr.cloud/webhook/vapstech-website-chatbot";

interface Message {
    type: 'bot' | 'user';
    content: string;
    isHTML?: boolean;
}

const linkify = (text: string) => {
    return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="underline font-bold hover:text-blue-400">$1</a>');
};

export function VapsChatWindow({ onClose }: { onClose?: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId, setSessionId] = useState('');

    const bodyRef = useRef<HTMLDivElement>(null);

    // Initialize session and history
    useEffect(() => {
        let sid = localStorage.getItem("chatbot_sessionId");
        if (!sid) {
            sid = `sess_${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
            localStorage.setItem("chatbot_sessionId", sid);
        }
        setSessionId(sid);

        setMessages([
            { type: 'bot', content: 'Hey there! 👋' },
            { type: 'bot', content: 'Welcome to Vaps Technosoft Pvt Ltd! How can we help you today?' }
        ]);
    }, []);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async (msg: string) => {
        if (!msg.trim()) return;

        const userMessage: Message = { type: 'user', content: msg };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg, sessionId })
            });
            const data = await response.json();

            setIsTyping(false);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: data.reply || "⚠️ Sorry, no reply from server.",
                isHTML: true
            }]);
        } catch (error) {
            setIsTyping(false);
            setMessages(prev => [...prev, { type: 'bot', content: "⚠️ Error connecting to server" }]);
        }
    };

    return (
        <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/80 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] backdrop-blur-3xl flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-purple-600 p-4 flex items-center justify-between text-white shadow-md">
                <div className="flex items-center gap-3">
                    <img
                        src="https://vapstech.com/wp-content/uploads/2026/01/VAPS-logo.jpg"
                        alt="bot"
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                    />
                    <div>
                        <h3 className="font-bold text-sm">Vapstech Support</h3>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest font-black">Customer Support</p>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="hover:rotate-90 transition-transform p-1 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Body */}
            <div
                ref={bodyRef}
                className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-transparent to-white/30"
            >
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.type === 'bot' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "p-3.5 rounded-2xl text-[13px] max-w-[85%] break-words shadow-sm",
                            msg.type === 'bot' ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white self-start" : "bg-white text-gray-800 self-end border border-black/5"
                        )}
                    >
                        <div dangerouslySetInnerHTML={{ __html: msg.isHTML ? linkify(msg.content) : msg.content }} />
                        {msg.type === 'bot' && i === 1 && (
                            <div className="mt-3.5 flex flex-col gap-2">
                                {['About Vaps Tech', 'About AI Vrm', 'Contact sales'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => sendMessage(opt)}
                                        className="w-full py-2.5 bg-black/10 hover:bg-black/25 text-white rounded-xl transition-all text-xs font-bold active:scale-95"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="bg-black/5 p-3 rounded-2xl text-[12px] self-start animate-pulse text-gray-500 font-medium">
                        Bot is typing...
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/5 bg-white/40">
                <div className="flex gap-2.5 p-1 bg-white rounded-2xl shadow-inner border border-black/5">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none px-3 py-2 text-sm focus:outline-none placeholder:text-gray-400"
                    />
                    <button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "p-2.5 rounded-xl transition-all shadow-md active:scale-90",
                            inputValue.trim() ? "bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:opacity-90" : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                    >
                        ➤
                    </button>
                </div>
                <div className="mt-3.5 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                    Provided by <a href="https://vapstech.com" target="_blank" className="text-orange-600 hover:underline">Vaps Tech</a>
                </div>
            </div>
        </div>
    );
}

export function VapsChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize session and history
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="fixed bottom-5 right-5 z-[10000]" ref={containerRef}>
            {/* Toggle Button */}
            <button
                onClick={() => {
                    const nextState = !isOpen;
                    setIsOpen(nextState);
                    if (nextState) setUnreadCount(0);
                }}
                className={cn(
                    "w-[60px] h-[60px] bg-gradient-to-tr from-orange-500 to-purple-600 text-white border-2 border-white rounded-full text-2xl cursor-pointer shadow-[0_4px_15px_rgba(255,100,0,0.3)] flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 z-[10001]",
                    !isOpen && "animate-bounce"
                )}
            >
                {isOpen ? <X className="h-7 w-7 transition-all duration-300 rotate-0" /> : "💬"}
                {!isOpen && unreadCount > 0 && (
                    <span className="absolute -top-[5px] -right-[5px] w-5 h-5 bg-orange-600 text-white text-[12px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {unreadCount}
                    </span>
                )}
                {!isOpen && (
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-1 -right-1"
                    >
                        <Sparkles className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                    </motion.div>
                )}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-[80px] right-0 z-[9999] w-[350px] md:w-[380px] h-[520px] origin-bottom-right"
                    >
                        <VapsChatWindow onClose={() => setIsOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce {
                    animation: bounce 1.5s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
