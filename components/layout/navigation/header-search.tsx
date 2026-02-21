'use client';

import { useUserAccessibleModules } from '@/hooks/common';
import { SearchIcon, FileText, LayoutGrid, Hash, Mic, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { setNavigationContext } from './navigation-context';
import { searchDatabase } from '@/server/search-action';

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

    // Flatten accessible modules into searchable pages
    const getAllPages = () => {
        if (!accessibleModule?.data) return [];
        const pages: SearchResult[] = [];

        accessibleModule.data.forEach((module) => {
            module.menu.forEach((menu) => {
                menu.sub_menu.forEach((subMenu) => {
                    subMenu.pages.forEach((page) => {
                        pages.push({
                            type: 'page',
                            title: page.name, // Usually page name
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

    // Voice Search
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support voice search.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Default to English, Python backend translates if needed
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        try {
            recognition.start();
            setQuery("Listening..."); // Visual feedback
            setIsOpen(true);
        } catch (err) {
            console.error("Failed to start recognition:", err);
            return;
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            setIsOpen(true);
            // Trigger search immediately
            performSearch(transcript);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                // Common error, don't spam console
                setQuery(""); // Reset
                setIsOpen(false);
                return;
            }

            console.error("Speech recognition error:", event.error);

            if (event.error === 'not-allowed') {
                alert("Microphone access blocked. Please check browser permissions (click lock icon in URL bar).");
            } else if (event.error === 'network') {
                alert("Voice search requires an internet connection.");
            } else if (event.error === 'audio-capture') {
                alert("No microphone was found. Ensure it is plugged in and set up.");
            }

            // Reset if showing placeholder
            setQuery(prev => prev === "Listening..." ? "" : prev);
        };

        recognition.onend = () => {
            if (query === "Listening...") setQuery("");
        };
    };

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

    const guessModuleRoute = (source: string) => {
        const lower = source.toLowerCase();
        if (lower.includes('preadmission')) return '/admission/preadmission';
        if (lower.includes('adm_')) return '/admission';
        if (lower.includes('fee')) return '/fees-management';
        if (lower.includes('exm_') || lower.includes('exam')) return '/exam';
        if (lower.includes('hr_') || lower.includes('hrms')) return '/hrms';
        if (lower.includes('inv_') || lower.includes('inventory')) return '/inventory';
        return '/';
    };

    const handleDbSelect = (result: DbResult) => {
        const route = guessModuleRoute(result.source);
        setIsOpen(false);
        setQuery('');
        router.push(route);
    };

    return (
        <div className='relative' ref={containerRef}>
            <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
                    <SearchIcon size={16} />
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            performSearch(query);
                        }
                    }}
                    className='w-[300px] pl-9 pr-9 transition-all focus:w-[400px] focus:ring-2 focus:ring-primary/20 bg-background'
                />
                <button
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors'
                    onClick={startListening}
                    type="button"
                    title="Voice Search"
                >
                    <Mic size={16} />
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
                                        key={`page-${index}`}
                                        onClick={() => handleSelect(result)}
                                        className='relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left group'
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
                                {dbResults.map((result, index) => (
                                    <button
                                        key={`db-${index}`}
                                        onClick={() => handleDbSelect(result)}
                                        className='relative flex flex-col w-full px-4 py-3 text-sm border-b last:border-0 hover:bg-accent/50 text-left transition-colors'
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
                                ))}
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
