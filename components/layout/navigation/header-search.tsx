'use client';

import { useUserAccessibleModules } from '@/hooks/common';
import { Search, X, Command, Database, FileText, Globe, Mic, MicOff, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { blobToFile, enhanceAndConvertToWav } from "@/lib/audio-utils";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { setNavigationContext } from './navigation-context';
import { searchDatabase } from '@/server/search-action';
import type { IUserAccessibleModules } from '@/types';
import { translateText } from '@/server/translate-action';
import { getKeywordsForPage } from '@/lib/page-keywords';

interface SearchResult {
    type: 'page';
    title: string;
    subtitle: string;
    url: string;
    module: string;
    menu: string;
    subMenu: string;
    pageData: any; // Full page object for context
    subMenusPages: any[]; // Full sibling pages
    keywords?: string;
    description?: string;
}

interface DbResult {
    source: string;
    data: any;
}

// Cookie helpers
const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
};

const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export function HeaderSearch() {
    const router = useRouter();
    const { data: accessibleModule } = useUserAccessibleModules();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [dbResults, setDbResults] = useState<DbResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const activeSearchRef = useRef('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // Load history on mount
    useEffect(() => {
        const loadHistory = () => {
            try {
                let historyData = getCookie('search_history');
                if (!historyData) {
                    historyData = localStorage.getItem('search_history');
                }
                
                if (historyData) {
                    let parsed;
                    try {
                        parsed = JSON.parse(decodeURIComponent(historyData));
                    } catch {
                        parsed = JSON.parse(historyData);
                    }
                    if (Array.isArray(parsed)) {
                        setSearchHistory(parsed);
                    }
                }
            } catch (e) {
                console.error('Failed to load search history', e);
            }
        };
        loadHistory();
    }, []);

    const saveToHistory = (term: string) => {
        if (!term || !term.trim() || term.length < 2 || term === "Listening..." || term === "Transcribing...") return;
        const trimmed = term.trim();
        
        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
            const next = [trimmed, ...filtered].slice(0, 15);
            
            const stringified = JSON.stringify(next);
            try {
                setCookie('search_history', encodeURIComponent(stringified), 30);
                localStorage.setItem('search_history', stringified);
            } catch (e) {
                console.error('Failed to save search history', e);
            }
            return next;
        });
    };

    const deleteFromHistory = (e: React.MouseEvent, term: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchHistory(prev => {
            const next = prev.filter(item => item.trim().toLowerCase() !== term.trim().toLowerCase());
            const stringified = JSON.stringify(next);
            try {
                setCookie('search_history', encodeURIComponent(stringified), 30);
                localStorage.setItem('search_history', stringified);
            } catch (err) {
                console.error('Failed to delete from history', err);
            }
            return next;
        });
    };

    const clearHistory = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchHistory([]);
        try {
            setCookie('search_history', encodeURIComponent(JSON.stringify([])), 30);
            localStorage.setItem('search_history', JSON.stringify([]));
        } catch (e) {
            console.error('Failed to clear search history', e);
        }
    };

    useEffect(() => {
        setSelectedIndex(-1);
    }, [query, results, dbResults]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const totalItems = results.length + dbResults.length;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (isOpen && totalItems > 0) {
                setSelectedIndex(prev => {
                    const next = prev < totalItems - 1 ? prev + 1 : -1;
                    document.getElementById(`search-result-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                });
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen && totalItems > 0) {
                setSelectedIndex(prev => {
                    const next = prev > 0 ? prev - 1 : totalItems - 1;
                    document.getElementById(`search-result-${next}`)?.scrollIntoView({ block: 'nearest' });
                    return next;
                });
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (isOpen && selectedIndex >= 0 && selectedIndex < totalItems) {
                if (selectedIndex < results.length) {
                    handleSelect(results[selectedIndex]);
                } else {
                    handleDbSelect(dbResults[selectedIndex - results.length]);
                }
            } else if (query.trim()) {
                saveToHistory(query);
                performSearch(query);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Flatten accessible modules into searchable pages
    const getAllPages = () => {
        const baseModules = accessibleModule?.data || [];
        const pages: SearchResult[] = [];

        baseModules.forEach((module) => {
            module.menu.forEach((menu) => {
                menu.sub_menu.forEach((subMenu) => {
                    subMenu.pages.forEach((page) => {
                        pages.push({
                            type: 'page',
                            title: page.name,
                            subtitle: `${module.name} > ${menu.name} > ${subMenu.name}`,
                            url: page.url,
                            module: module.name,
                            menu: menu.name,
                            subMenu: subMenu.name,
                            pageData: page,
                            subMenusPages: subMenu.pages,
                            keywords: getKeywordsForPage(page.name),
                            description: page.description
                        });
                    });
                });
            });
        });
        return pages;
    };

    // Custom Transcription API Integration
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach((t) => t.stop());

                if (blob.size < 1000) {
                    toast.error('No audio detected. Please speak louder.');
                    setIsTranscribing(false);
                    return;
                }

                setIsTranscribing(true);

                try {
                    const wavBlob = await enhanceAndConvertToWav(blob);
                    const file = blobToFile(wavBlob, 'header-search-voice.wav');

                    const formData = new FormData();
                    formData.append('audio', file);

                    const res = await fetch('/api/header-voice', {
                        method: 'POST',
                        body: formData
                    });

                    if (!res.ok) {
                        const errorText = await res.text();
                        try {
                            const errorJson = JSON.parse(errorText);
                            toast.error(errorJson.error || 'Server error');
                        } catch {
                            toast.error(`Server error: ${res.status}`);
                        }
                        return;
                    }

                    const result = await res.json();

                    if (result.text?.trim()) {
                        const transcript = result.text.trim();
                        setQuery(transcript);
                        setIsOpen(true);
                        saveToHistory(transcript);
                        performSearch(transcript);
                    } else {
                        toast.error('Speech not recognized. Please try again.');
                        setQuery("");
                    }
                } catch (err: any) {
                    console.error("Transcription error:", err);
                    toast.error(`Transcription failed: ${err.message}`);
                    setQuery("");
                } finally {
                    setIsTranscribing(false);
                }
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setIsOpen(true);

            // Longer timeout for header search (10 seconds)
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    stopRecording();
                }
            }, 10000);

        } catch (err: any) {
            console.error("Microphone error:", err);
            toast.error(`Microphone access denied: ${err.message}`);
        }
    };

    const stopRecording = () => {
        if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Clean up recording on unmount
    useEffect(() => {
        return () => {
            if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current);
        };
    }, []);

    const performSearch = async (originalSearchTerm: string) => {
        if (!originalSearchTerm.trim() || originalSearchTerm === "Listening") {
            if (originalSearchTerm !== "Listening") {
                setResults([]);
                setDbResults([]);
                setIsSearching(false);
            }
            return;
        }

        setIsSearching(true);

        let initialSearchTerm = originalSearchTerm;

        // Immediately update what string is currently active
        // This prevents race conditions from slow backend translation
        activeSearchRef.current = originalSearchTerm;

        // 1. Immediate Search Pages (Client-side)
        // We do this immediately for instant feedback
        const allPages = getAllPages();
        const searchTerms = initialSearchTerm.toLowerCase().split(' ');
        const filteredPages = allPages.filter(item => {
            const text = `${item.title} ${item.subtitle} ${item.description || ''} ${item.keywords || ''}`.toLowerCase();
            return searchTerms.every(term => text.includes(term));
        }).slice(0, 7); // Limit suggestions
        setResults(filteredPages);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            try {
                let searchTerm = originalSearchTerm;

                // Fast path: if starts with English alphabet, don't run heavy translation
                const isEnglish = /^[a-zA-Z]/.test(searchTerm);

                if (!isEnglish) {
                    try {
                        const translateResponse = await translateText(originalSearchTerm);
                        // Abort if the user typed something else while we were translating
                        if (activeSearchRef.current !== originalSearchTerm) return;

                        if (translateResponse?.text) {
                            searchTerm = translateResponse.text;

                            // Re-filter client pages using translated string
                            const translatedTerms = searchTerm.toLowerCase().split(' ');
                            const newFilteredPages = allPages.filter(item => {
                                const text = `${item.title} ${item.subtitle}`.toLowerCase();
                                return translatedTerms.every(term => text.includes(term));
                            }).slice(0, 7);
                            setResults(newFilteredPages);
                        }
                    } catch (err) {
                        console.warn('Translation step failed', err);
                    }
                }

                // Abort if the user typed something else before DB fetch
                if (activeSearchRef.current !== originalSearchTerm) return;

                // 2. Search Database (Python Backend)
                const response = await searchDatabase(searchTerm);

                // Abort if the user typed something else during DB fetch
                if (activeSearchRef.current !== originalSearchTerm) return;

                if (response?.results) {
                    setDbResults(response.results.slice(0, 6).map((r: any) => ({
                        source: r.table || 'Database',
                        data: r.data
                    })));
                } else {
                    setDbResults([]);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                // Only clear searching state if this is the active search
                if (activeSearchRef.current === originalSearchTerm) {
                    setIsSearching(false);
                }
            }
        }, 800);
    };

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            setDbResults([]);
            setIsSearching(false);
            return;
        }

        // Only search on type if query length > 1 and not "Listening"
        if (query.length > 1 && query !== "Listening") {
            performSearch(query);
        }
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // If the target is no longer in the DOM, it was likely removed during the click 
            // (e.g. deleting a history item). We don't want to close the dropdown in this case.
            if (target && !document.body.contains(target)) return;

            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (result: SearchResult) => {
        setNavigationContext({
            module: result.module,
            menu: result.menu,
            subMenu: result.subMenu,
            pages: result.subMenusPages,
            title: result.pageData.title || '',
            description: result.pageData.description || ''
        });

        setIsOpen(false);
        if (query.trim()) saveToHistory(query);
        router.push(result.url);
    };

    const pathname = usePathname();

    const guessModuleRoute = (source: string) => {
        const lower = source.toLowerCase();

        // Handle environment/portal prefix
        const prefix = pathname?.startsWith('/StaffPortal') ? '/StaffPortal' :
            pathname?.startsWith('/StudentPortal') ? '/StudentPortal' :
                pathname?.startsWith('/SuperAdmin') ? '/SuperAdmin' : '';

        if (lower.includes('preadmission')) return `${prefix}/admission/preadmission`;
        if (lower.includes('adm_')) return `${prefix}/admission`;
        if (lower.includes('fee')) return `${prefix}/fees-management`;
        if (lower.includes('exm_') || lower.includes('exam')) return `${prefix}/exam`;
        if (lower.includes('hr_') || lower.includes('hrms')) return `${prefix}/hrms`;
        if (lower.includes('inv_') || lower.includes('inventory')) return `${prefix}/inventory`;
        return prefix || '/';
    };

    const handleDbSelect = (dbResult: DbResult) => {
        const source = dbResult.source.toLowerCase();
        const allPages = getAllPages();

        // Try to find a real page in the current user's accessible modules that matches the source
        // This ensures the navigation context (breadcrumbs/sidebar) updates correctly in all environments
        const matchedPage = allPages.find(p => {
            const url = p.url.toLowerCase();
            const subtitle = p.subtitle.toLowerCase();
            const sourcePrefix = source.split('_')[0]; // e.g. 'adm' from 'adm_m_student'

            if (sourcePrefix === 'adm' || source.includes('admission')) return url.includes('admission');
            if (sourcePrefix === 'exm' || source.includes('exam')) return url.includes('exam');
            if (sourcePrefix === 'fee' || source.includes('fees')) return url.includes('fee');
            if (sourcePrefix === 'hr' || source.includes('hrms')) return url.includes('hrms') || url.includes('salary');
            if (sourcePrefix === 'inv' || source.includes('inventory')) return url.includes('inventory');
            if (source.includes('preadmission')) return url.includes('preadmission');

            return false;
        });

        if (matchedPage) {
            handleSelect(matchedPage);
        } else {
            // Fallback for cases where no specific page matches the data source
            const route = guessModuleRoute(dbResult.source);
            setIsOpen(false);
            if (query.trim()) saveToHistory(query);
            router.push(route);
        }
    };

    return (
        <div className='relative' ref={containerRef}>
            <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    <Search size={16} />
                </span>
                <Input
                    placeholder='Search pages or data...'
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                    }}
                    onClick={() => {
                        setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        'pl-9 transition-all focus:ring-2 focus:ring-primary/20 bg-background',
                        query ? 'pr-20' : 'pr-12',
                        isOpen || query ? 'w-[400px]' : 'w-[300px]'
                    )}
                />
                {query && (
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQuery('');
                            setResults([]);
                            setDbResults([]);
                        }}
                        className="absolute right-11 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
                        title="Clear search"
                    >
                        <X size={14} />
                    </button>
                )}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300",
                        isRecording
                            ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] scale-110 z-10 animate-bounce"
                            : "hover:bg-purple-50 text-muted-foreground hover:text-purple-600 group/mic"
                    )}
                    title={isRecording ? "Stop recording" : "Voice search"}
                >
                    {isTranscribing ? (
                        <div className="flex gap-1 items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-bounce" />
                        </div>
                    ) : isRecording ? (
                        <Mic className="h-5 w-5 text-white animate-pulse" />
                    ) : (
                        <Mic className="h-5 w-5 text-purple-600 transition-colors" />
                    )}
                </button>
            </div>

            <style jsx>{`
                @keyframes purple-dot {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
                .animate-purple-dot-1 { animation: purple-dot 0.8s ease-in-out infinite; animation-delay: 0s; }
                .animate-purple-dot-2 { animation: purple-dot 0.8s ease-in-out infinite; animation-delay: 0.1s; }
                .animate-purple-dot-3 { animation: purple-dot 0.8s ease-in-out infinite; animation-delay: 0.2s; }
                .animate-purple-dot-4 { animation: purple-dot 0.8s ease-in-out infinite; animation-delay: 0.3s; }
            `}</style>

            {isOpen && (results.length > 0 || dbResults.length > 0 || isSearching || (query === '' && searchHistory.length > 0)) && (
                <div className='absolute top-full left-0 mt-2 w-full min-w-[400px] max-w-[600px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50'>
                    <div className='max-h-[70vh] overflow-y-auto p-1'>
                        {/* Recent Searches */}
                        {query === '' && searchHistory.length > 0 && (
                            <div className="mb-2">
                                <div className="flex items-center justify-between px-2 py-1.5 bg-muted/30">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Recent Searches</span>
                                    <button 
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            clearHistory(e);
                                        }}
                                        className="text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                </div>
                                {searchHistory.map((item) => (
                                    <div
                                        key={item}
                                        className="group flex items-center justify-between px-2 py-1 hover:bg-accent cursor-pointer rounded-sm transition-colors"
                                    >
                                        <div
                                            className="flex items-center flex-1 overflow-hidden py-1 px-1"
                                            onClick={() => {
                                                setQuery(item);
                                                performSearch(item);
                                            }}
                                        >
                                            <Clock className="h-3.5 w-3.5 mr-3 text-muted-foreground shrink-0" />
                                            <span className="text-sm truncate">{item}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                deleteFromHistory(e, item);
                                            }}
                                            className="delete-history-btn p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 rounded-md transition-all relative z-10 mr-1"
                                            title="Remove from history"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Page Results */}
                        {results.length > 0 && (
                            <div className="mb-2">
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/30">Application Pages</div>
                                {results.map((result, index) => (
                                    <button
                                        id={`search-result-${index}`}
                                        key={`page-${index}`}
                                        onClick={() => handleSelect(result)}
                                        className={cn(
                                            'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left group',
                                            selectedIndex === index && 'bg-accent text-accent-foreground'
                                        )}
                                    >
                                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/50 mr-3 group-hover:bg-background'>
                                            <FileText className='h-4 w-4 text-muted-foreground' />
                                        </div>
                                        <div className='flex flex-col flex-1 overflow-hidden'>
                                            <span className='font-medium truncate'>{result.title}</span>
                                            <span className='text-xs text-muted-foreground truncate'>{result.subtitle}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Database Results */}
                        {dbResults.length > 0 && (
                            <div>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/30 border-t mt-2 pt-2">Data Records</div>
                                {dbResults.map((result, index) => {
                                    const actualIndex = results.length + index;
                                    return (
                                        <button
                                            id={`search-result-${actualIndex}`}
                                            key={`db-${index}`}
                                            onClick={() => handleDbSelect(result)}
                                            className={cn(
                                                'relative flex flex-col w-full px-4 py-3 text-sm border-b last:border-0 hover:bg-accent/50 text-left transition-colors',
                                                selectedIndex === actualIndex && 'bg-accent/50'
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Database className="h-3 w-3 text-blue-500" />
                                                <span className="text-xs font-semibold text-blue-600 truncate">{result.source}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                {/* Render first 4 key-value pairs ignoring nulls */}
                                                {Object.entries(result.data || {})
                                                    .filter(([_, v]) => v !== null && v !== '')
                                                    .slice(0, 4)
                                                    .map(([k, v]) => (
                                                        <div key={k} className="flex gap-1 overflow-hidden">
                                                            <span className="font-semibold shrink-0">{k}:</span>
                                                            <span className="truncate" title={String(v)}>{String(v)}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Loading State */}
                        {isSearching && dbResults.length === 0 && (
                            <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
                                Searching database...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isOpen && query && !isSearching && results.length === 0 && dbResults.length === 0 && query !== "Listening..." && (
                <div className='absolute top-full left-0 mt-2 w-[300px] p-4 text-center text-sm text-muted-foreground rounded-md border bg-popover shadow-md z-50'>
                    No results found.
                </div>
            )}
        </div>
    );
}
