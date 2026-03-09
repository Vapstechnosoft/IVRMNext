'use client';

import { useUserAccessibleModules } from '@/hooks/common';
import { Search, X, Command, Database, FileText, Globe, Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { blobToFile, enhanceAndConvertToWav } from "@/lib/audio-utils";
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { setNavigationContext } from './navigation-context';
import { searchDatabase } from '@/server/search-action';
import type { IUserAccessibleModules } from '@/types';

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
}

interface DbResult {
    source: string;
    data: any;
}

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
    const [selectedIndex, setSelectedIndex] = useState(-1);

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
            } else {
                performSearch(query);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    // Flatten accessible modules into searchable pages
    const getAllPages = () => {
        const visualsModule: IUserAccessibleModules = {
            id: 9999,
            name: "Visual Insights",
            icon: "BarChart3",
            menu: [
                {
                    id: 9991,
                    name: "Dashboard",
                    icon: "LayoutDashboard",
                    sub_menu: [
                        {
                            id: 9992,
                            name: "Statistics & Graphs",
                            icon: "BarChart",
                            pages: [
                                {
                                    id: 9993,
                                    name: "Statistics",
                                    icon: "BarChart",
                                    url: "/visual-insights/statistics-graphs",
                                    title: "Statistics & Graphs",
                                    description: "Visual analytics and reports"
                                }
                            ]
                        },
                        {
                            id: 9994,
                            name: "Templates",
                            icon: "LayoutTemplate",
                            pages: [
                                {
                                    id: 9995,
                                    name: "Custom Templates",
                                    icon: "LayoutTemplate",
                                    url: "/visual-insights/custom-templates",
                                    title: "Custom Templates",
                                    description: "Create and manage report templates"
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        const baseModules = accessibleModule?.data || [];
        const combinedModules = [...baseModules, visualsModule];

        const pages: SearchResult[] = [];

        combinedModules.forEach((module) => {
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
                            subMenusPages: subMenu.pages
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
                setQuery("Transcribing...");

                try {
                    const wavBlob = await enhanceAndConvertToWav(blob);
                    const file = blobToFile(wavBlob, 'header-search-voice.wav');

                    const formData = new FormData();
                    formData.append('audio', file);

                    const res = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await res.json();

                    if (res.ok && result.text?.trim()) {
                        const transcript = result.text.trim();
                        setQuery(transcript);
                        setIsOpen(true);
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
            setQuery("Listening...");
            setIsOpen(true);

            // Longer timeout for header search (5 seconds)
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    stopRecording();
                }
            }, 5000);

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

    const performSearch = async (searchTerm: string) => {
        if (!searchTerm.trim() || searchTerm === "Listening...") {
            if (searchTerm !== "Listening...") {
                setResults([]);
                setDbResults([]);
                setIsSearching(false);
            }
            return;
        }

        setIsSearching(true);

        // 1. Search Pages (Client-side)
        const allPages = getAllPages();
        const searchTerms = searchTerm.toLowerCase().split(' ');
        const filteredPages = allPages.filter(item => {
            const text = `${item.title} ${item.subtitle}`.toLowerCase();
            return searchTerms.every(term => text.includes(term));
        }).slice(0, 6); // Limit 6 suggestions
        setResults(filteredPages);

        try {
            // 2. Search Database (Python Backend)
            // Debounce DB search to avoid spamming the Python script
            if (debounceRef.current) clearTimeout(debounceRef.current);

            debounceRef.current = setTimeout(async () => {
                const response = await searchDatabase(searchTerm);
                if (response?.results) {
                    setDbResults(response.results.slice(0, 6).map((r: any) => ({
                        source: r.table || 'Database',
                        data: r.data
                    })));
                }
                setIsSearching(false);
            }, 800);

        } catch (error) {
            console.error("DB Search failed", error);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
            setDbResults([]);
            setIsSearching(false);
            return;
        }

        // Only search on type if query length > 2 and not "Listening..."
        if (query.length > 2 && query !== "Listening...") {
            performSearch(query);
        }
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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
        setQuery('');
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
            setQuery('');
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
                        if (query) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    className='w-[300px] pl-9 pr-9 transition-all focus:w-[400px] focus:ring-2 focus:ring-primary/20 bg-background'
                />
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isRecording
                        ? "bg-red-100 text-red-600 animate-pulse"
                        : "hover:bg-accent text-muted-foreground"
                        } ${isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
                    title={isRecording ? "Stop recording" : "Voice search"}
                >
                    {isTranscribing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : isRecording ? (
                        <MicOff className="h-4 w-4" />
                    ) : (
                        <Mic className="h-4 w-4" />
                    )}
                </button>
            </div>

            {isOpen && (results.length > 0 || dbResults.length > 0 || isSearching) && (
                <div className='absolute top-full left-0 mt-2 w-full min-w-[400px] max-w-[600px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50'>
                    <div className='max-h-[70vh] overflow-y-auto p-1'>
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
