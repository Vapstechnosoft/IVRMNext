'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

const WEBHOOK_URL = "https://n8n.srv937206.hstgr.cloud/webhook/aivrm-chatbot";

interface Message {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    options?: string[];
}

export function SchoolAssistantBot({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const bodyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) {
            // Clear history from state and localStorage when closed
            localStorage.removeItem("chat_history");
            setMessages([]);
            setInput('');
            return;
        }

        // Initialize session on open
        let sid = localStorage.getItem("chatbot_sessionId");
        if (!sid) {
            sid = `sess_${Math.random().toString(36).substr(2, 9)}${Date.now()}`;
            localStorage.setItem("chatbot_sessionId", sid);
        }
        setSessionId(sid);

        // Version check
        if (localStorage.getItem("chat_version") !== "2.0") {
            localStorage.setItem("chat_version", "2.0");
        }

        // Always show initial messages when reopened
        setMessages([
            { id: '1', text: "Hey there! 👋", role: 'assistant' },
            {
                id: '2',
                text: "This is your assistant here! How can we help you today?",
                role: 'assistant',
                options: ['Admission', 'Fees', 'Examination', 'Need More Help?']
            }
        ]);
    }, [open]);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("chat_history", JSON.stringify(messages));
            localStorage.setItem("chat_last_time", Date.now().toString());

            if (bodyRef.current) {
                bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            role: 'user'
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, sessionId })
            });
            const data = await res.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "⚠️ Sorry, no reply from server.",
                role: 'assistant'
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "⚠️ Error connecting to server",
                role: 'assistant'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const linkify = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:opacity-80 transition-colors">{part}</a>;
            }
            return part;
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-transparent shadow-2xl [&>button]:hidden">
                <div id="chatbot-widget" className="w-full h-[600px] bg-white rounded-[24px] border border-black/10 flex flex-col overflow-hidden shadow-2xl">
                    {/* Header - Purple Branding */}
                    <div id="chatbot-header" className="bg-gradient-to-r from-primary to-[#6d28d9] p-5 flex items-center justify-between text-white shrink-0 shadow-lg">
                        <div className="title flex items-center gap-3 font-bold text-base tracking-tight">
                            <div className="p-1 bg-white rounded-full">
                                <img
                                    src="/chatbot/standing-robot.png"
                                    alt="bot"
                                    className="bot-logo w-[32px] h-[32px] rounded-full object-cover"
                                />
                            </div>
                            <span>School Assistant Bot</span>
                        </div>
                        <button
                            id="chatbot-close"
                            onClick={() => onOpenChange(false)}
                            className="text-white/80 hover:text-white text-2xl hover:rotate-90 transition-all p-1 leading-none"
                        >
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div
                        id="chatbot-body"
                        ref={bodyRef}
                        className="flex-1 p-4 overflow-y-auto bg-slate-50/50 flex flex-col transition-all"
                    >
                        {messages.map((msg) => (
                            <div key={msg.id} className="mb-4 flex flex-col">
                                <div
                                    className={cn(
                                        "message p-3 px-4 rounded-[18px] leading-relaxed max-w-[85%] text-[14px] shadow-sm animate-in fade-in duration-300",
                                        msg.role === 'assistant'
                                            ? "bot-message bg-white text-black self-start border border-primary/10 shadow-sm rounded-tl-none"
                                            : "user-message bg-secondary/10 text-black self-end border border-secondary/10 rounded-tr-none"
                                    )}
                                >
                                    {msg.role === 'assistant' ? linkify(msg.text) : msg.text}

                                    {msg.options && (
                                        <div className="options mt-4 flex flex-col gap-2">
                                            {msg.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => sendMessage(opt)}
                                                    className="option-btn w-full p-3 bg-white hover:bg-black/5 text-black border border-black/10 rounded-xl text-[13px] font-bold transition-all shadow-sm active:translate-y-px hover:translate-x-1"
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="typing italic text-[13px] text-muted-foreground bg-muted p-[6px_12px] rounded-[10px] self-start mb-2 animate-in fade-in">
                                Typing...
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div id="chatbot-footer" className="flex gap-2 border-t border-border p-2 bg-white shrink-0">
                        <input
                            type="text"
                            id="chatbot-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                            placeholder="Type your message..."
                            className="flex-1 p-2 border border-input outline-none text-[13px] rounded-[10px] bg-white text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 transition-all"
                        />
                        <button
                            id="chatbot-send"
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className={cn(
                                "rounded-[10px] p-2 px-3 transition-all",
                                !input.trim() || isLoading
                                    ? "bg-primary/20 text-white cursor-default"
                                    : "bg-primary text-white hover:opacity-90 shadow-md"
                            )}
                        >
                            ➤
                        </button>
                    </div>

                    {/* Branding */}
                    <div id="chatbot-branding" className="p-1.5 text-[11px] text-muted-foreground text-center border-t border-border bg-muted/30">
                        Provided by <a href="https://vapstech.com/" target="_blank" rel="noopener noreferrer" className="text-secondary font-bold hover:underline">VapsTechnosoft Pvt Ltd</a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
