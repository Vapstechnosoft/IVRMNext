'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Trash2 } from 'lucide-react';
import { Dispatch, SetStateAction, useState, useEffect } from 'react';
import type { PageDTO, MobilePageDTO, SavedMobilePageDTO, SavedPageDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import type { ApiSearchparams } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PageMappingGridsProps {
    webPages: PageDTO[];
    onWebPageUpdate: Dispatch<SetStateAction<PageDTO[]>>;
    webPageTotal: number;
    onWebPageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentWebPageParams: ApiSearchparams;
    isWebPageLoading: boolean;

    stagedWebPages: PageDTO[];
    onStagedWebPageUpdate: Dispatch<SetStateAction<PageDTO[]>>;

    savedGrid: SavedPageDTO[];
    onSavedGridUpdate: Dispatch<SetStateAction<SavedPageDTO[]>>;
    savedGridTotal: number;
    onSavedGridParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentSavedGridParams: ApiSearchparams;
    isSavedGridLoading: boolean;

    savedMobilePages: SavedMobilePageDTO[];
    onSavedMobileUpdate: Dispatch<SetStateAction<SavedMobilePageDTO[]>>;
    savedMobilePageTotal: number;
    onSavedMobilePageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentSavedMobilePageParams: ApiSearchparams;
    isSavedMobilePageLoading: boolean;

    mobilePages: MobilePageDTO[];
    onMobilePageUpdate: Dispatch<SetStateAction<MobilePageDTO[]>>;
    mobilePageTotal: number;
    onMobilePageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentMobilePageParams: ApiSearchparams;
    isMobilePageLoading: boolean;

    showInstitution?: boolean;
}

export default function PageMappingGrids({
    webPages,
    onWebPageUpdate,
    webPageTotal,
    onWebPageParamsChange,
    currentWebPageParams,
    isWebPageLoading,

    stagedWebPages,
    onStagedWebPageUpdate,

    savedGrid,
    onSavedGridUpdate,
    savedGridTotal,
    onSavedGridParamsChange,
    currentSavedGridParams,
    isSavedGridLoading,

    mobilePages,
    onMobilePageUpdate,
    mobilePageTotal,
    onMobilePageParamsChange,
    currentMobilePageParams,
    isMobilePageLoading,

    savedMobilePages,
    onSavedMobileUpdate,
    savedMobilePageTotal,
    onSavedMobilePageParamsChange,
    currentSavedMobilePageParams,
    isSavedMobilePageLoading,

    showInstitution = false
}: PageMappingGridsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchWeb, setSearchWeb] = useState(currentWebPageParams.search_query || '');
    const [searchMobile, setSearchMobile] = useState(currentMobilePageParams.search_query || '');
    const [searchSavedWeb, setSearchSavedWeb] = useState(currentSavedGridParams.search_query || '');
    const [searchSavedMobile, setSearchSavedMobile] = useState(currentSavedMobilePageParams.search_query || '');
    const [searchStaged, setSearchStaged] = useState(''); // Added for staged web pages
    const [stagedPage, setStagedPage] = useState(1);
    const stagedPageSize = 10;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleWebCheck = (index: number, field: keyof PageDTO, value: boolean) => {
        const updated = [...webPages];
        const page = updated[index];
        (page as any)[field] = value;

        if (field === 'checked') {
            if (value) {
                // Add to staged if not already there
                if (!stagedWebPages.some(p => p.pageMappingId === page.pageMappingId)) {
                    onStagedWebPageUpdate([...stagedWebPages, { ...page }]);
                }
            } else {
                // Remove from staged
                onStagedWebPageUpdate(stagedWebPages.filter(p => p.pageMappingId !== page.pageMappingId));
            }
        }
        onWebPageUpdate(updated);
    };

    const handleStagedCheck = (index: number, field: keyof PageDTO, value: boolean) => {
        // Need to find the actual index in the full stagedWebPages array, not just the paginated view
        const actualIndex = stagedWebPages.findIndex(p => p.pageMappingId === paginatedStaged[index].pageMappingId);
        if (actualIndex > -1) {
            const updated = [...stagedWebPages];
            (updated[actualIndex] as any)[field] = value;
            onStagedWebPageUpdate(updated);
        }
    };

    const handleRemoveStaged = (pageMappingId: number) => {
        onStagedWebPageUpdate(stagedWebPages.filter(p => p.pageMappingId !== pageMappingId));
        // Also uncheck in master list if present
        onWebPageUpdate(webPages.map(p => p.pageMappingId === pageMappingId ? { ...p, checked: false } : p));
    };

    const handleToggleAll = (field: keyof PageDTO, value: boolean) => {
        const updated = webPages.map((p) => ({ ...p, [field]: value }));
        onWebPageUpdate(updated);

        if (field === 'checked') {
            if (value) {
                // Add all to staged (avoiding duplicates)
                const newStaged = [...stagedWebPages];
                updated.forEach(p => {
                    if (!newStaged.some(s => s.pageMappingId === p.pageMappingId)) {
                        newStaged.push({ ...p });
                    }
                });
                onStagedWebPageUpdate(newStaged);
            } else {
                // Remove all from staged if they are in the current master page view
                const masterIds = new Set(webPages.map(p => p.pageMappingId));
                onStagedWebPageUpdate(stagedWebPages.filter(p => !masterIds.has(p.pageMappingId)));
            }
        }
    };

    const handleMobileToggleAll = (field: keyof MobilePageDTO, value: boolean) => {
        const updated = mobilePages.map((p) => ({ ...p, [field]: value }));
        onMobilePageUpdate(updated);
    };

    const handleMobileCheck = (index: number, field: keyof MobilePageDTO, value: boolean) => {
        const updated = [...mobilePages];
        (updated[index] as any)[field] = value;
        onMobilePageUpdate(updated);
    };

    const handleSavedCheck = (index: number, field: keyof SavedPageDTO, value: boolean) => {
        const updated = [...savedGrid];
        (updated[index] as any)[field] = value;
        onSavedGridUpdate(updated);
    };

    const handleSavedMobileCheck = (index: number, field: keyof SavedMobilePageDTO, value: boolean) => {
        const updated = [...savedMobilePages];
        (updated[index] as any)[field] = value;
        onSavedMobileUpdate(updated);
    };

    // Debounce search input for server-side search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchWeb !== (currentWebPageParams.search_query || '')) {
                onWebPageParamsChange((prev) => ({ ...prev, page: 1, search_query: searchWeb }));
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchWeb, onWebPageParamsChange, currentWebPageParams.search_query]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchMobile !== (currentMobilePageParams.search_query || '')) {
                onMobilePageParamsChange((prev) => ({ ...prev, page: 1, search_query: searchMobile }));
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchMobile, onMobilePageParamsChange, currentMobilePageParams.search_query]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchSavedWeb !== (currentSavedGridParams.search_query || '')) {
                onSavedGridParamsChange((prev) => ({ ...prev, page: 1, search_query: searchSavedWeb }));
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchSavedWeb, onSavedGridParamsChange, currentSavedGridParams.search_query]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchSavedMobile !== (currentSavedMobilePageParams.search_query || '')) {
                onSavedMobilePageParamsChange((prev) => ({ ...prev, page: 1, search_query: searchSavedMobile }));
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [searchSavedMobile, onSavedMobilePageParamsChange, currentSavedMobilePageParams.search_query]);

    const totalPagesWeb = Math.ceil(webPageTotal / (currentWebPageParams.page_size || 10));
    const totalPagesSaved = Math.ceil(savedGridTotal / (currentSavedGridParams.page_size || 10));
    const totalPagesMobile = Math.ceil(mobilePageTotal / (currentMobilePageParams.page_size || 10));
    const totalPagesSavedMobile = Math.ceil(savedMobilePageTotal / (currentSavedMobilePageParams.page_size || 10));

    const handleSort = (column: string, grid: 'web' | 'saved' | 'mobile' | 'savedMobile') => {
        const paramsMap = {
            web: { params: currentWebPageParams, set: onWebPageParamsChange },
            saved: { params: currentSavedGridParams, set: onSavedGridParamsChange },
            mobile: { params: currentMobilePageParams, set: onMobilePageParamsChange },
            savedMobile: { params: currentSavedMobilePageParams, set: onSavedMobilePageParamsChange }
        };
        const { params, set } = paramsMap[grid];
        const isAsc = params.sort_column === column && params.sort_direction === 'asc';
        set((prev) => ({
            ...prev,
            sort_column: column,
            sort_direction: isAsc ? 'desc' : 'asc'
        }));
    };

    // Pagination Component Helper
    const PaginationControls = ({ total, params, setParams, totalPages, isLoading }: { total: number, params: ApiSearchparams, setParams: (p: ApiSearchparams | ((prev: ApiSearchparams) => ApiSearchparams)) => void, totalPages: number, isLoading: boolean }) => {
        const currentPage = params.page || 1;

        const getRange = () => {
            if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1);
            }

            // Complex range logic
            if (currentPage <= 3) {
                return [1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages];
            } else if (currentPage >= totalPages - 2) {
                return [1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                return [1, 2, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1, totalPages];
            }
        };

        if (totalPages <= 1) return null;

        return (
            <div className="bg-slate-50/10 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between border-t border-white/20 gap-4">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest order-2 sm:order-1">
                    Showing <span className="text-slate-600">{(currentPage - 1) * (params.page_size || 10) + 1}</span>
                    - <span className="text-slate-600">{Math.min(currentPage * (params.page_size || 10), total)}</span>
                    / <span className="text-slate-600">{total}</span>
                </div>
                <div className="flex items-center space-x-1.5 order-1 sm:order-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/60 text-slate-500 border border-white/40"
                        onClick={() => setParams((prev) => ({ ...prev, page: 1 }))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/60 text-slate-500 border border-white/40"
                        onClick={() => setParams((prev) => ({ ...prev, page: currentPage - 1 }))}
                        disabled={currentPage === 1 || isLoading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1.5 px-2">
                        {getRange().map((page, i) => {
                            if (page === '...') {
                                return <span key={`dots-${i}`} className="text-[10px] text-slate-400 font-bold">...</span>;
                            }
                            const pageNum = page as number;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setParams((prev) => ({ ...prev, page: pageNum }))}
                                    className={cn(
                                        'h-8 min-w-[32px] rounded-xl text-[10px] font-black transition-all border',
                                        currentPage === pageNum
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                            : 'bg-white/20 text-slate-500 border-white/40 hover:bg-white/60'
                                    )}
                                    disabled={isLoading}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/60 text-slate-500 border border-white/40"
                        onClick={() => setParams((prev) => ({ ...prev, page: currentPage + 1 }))}
                        disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl bg-white/20 hover:bg-white/60 text-slate-500 border border-white/40"
                        onClick={() => setParams((prev) => ({ ...prev, page: totalPages }))}
                        disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    // For webPages, we use server-side search, others use client-side search (searchParams)
    // but the mobile master grid and saved grid are also server-side in this implementation
    const filteredWeb = webPages;

    // Client-side pagination for staged list
    const filteredStaged = stagedWebPages.filter(p =>
        p.pageName.toLowerCase().includes(searchStaged.toLowerCase()) ||
        p.moduleName.toLowerCase().includes(searchStaged.toLowerCase())
    );
    const totalPagesStaged = Math.ceil(filteredStaged.length / stagedPageSize);
    const paginatedStaged = filteredStaged.slice((stagedPage - 1) * stagedPageSize, stagedPage * stagedPageSize);

    const filteredMobile = mobilePages;
    const filteredSavedWeb = savedGrid;
    const filteredSavedMobile = savedMobilePages;

    if (!isMounted) return null;

    return (
        <div className="space-y-8">
            <Tabs defaultValue="web" className="w-full">
                <div className="glass-pane p-1.5 bg-slate-100/50 max-w-sm mx-auto mb-8">
                    <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 h-11">
                        <TabsTrigger value="web" className="rounded-2xl h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-black uppercase text-[10px] tracking-widest">Web Engine</TabsTrigger>
                        <TabsTrigger value="mobile" className="rounded-2xl h-full data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all font-black uppercase text-[10px] tracking-widest">Mobile App</TabsTrigger>
                    </TabsList>
                </div>
                {/* Web Mapping Tab */}
                <TabsContent value="web" className="space-y-10 pt-4 outline-none">
                    {/* Master Page List */}
                    <div className="card-bento relative group">
                        <div className="neon-glow-blue" />
                        <div className="bento-header p-6">
                            <h3 className="bento-title">Available Pages to Map</h3>
                            <div className="relative w-64 z-10">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="SCANNING PAGES..."
                                    className="h-10 pl-10 text-[10px] font-black tracking-widest bg-white/60 border-slate-200/60 rounded-full focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                                    value={searchWeb}
                                    onChange={(e) => setSearchWeb(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-64">
                            {isWebPageLoading ? (
                                <div className="p-4 space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="w-16 text-center text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ref#</TableHead>
                                            {showInstitution && (
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('institutionName', 'web')}>
                                                    Institution {currentWebPageParams.sort_column === 'institutionName' && (currentWebPageParams.sort_direction === 'asc' ? '▲' : '▼')}
                                                </TableHead>
                                            )}
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('moduleName', 'web')}>
                                                Module {currentWebPageParams.sort_column === 'moduleName' && (currentWebPageParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('pageName', 'web')}>
                                                Page Descriptor {currentWebPageParams.sort_column === 'pageName' && (currentWebPageParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">ADD</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleToggleAll('addFlag', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">DEL</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleToggleAll('deleteFlag', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">UPD</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleToggleAll('updateFlag', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">PRC</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleToggleAll('processFlag', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">REP</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleToggleAll('reportFlag', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-blue-600 uppercase">MAP</span><Checkbox className="rounded-md border-blue-400 data-[state=checked]:bg-blue-600" onCheckedChange={(v) => handleToggleAll('checked', !!v)} /></div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredWeb.map((page, idx) => (
                                            <TableRow key={page.pageMappingId} className="hover:bg-blue-50/10 border-slate-50 transition-colors group">
                                                <TableCell className="text-center font-bold text-[10px] text-slate-300 group-hover:text-blue-500 transition-colors">
                                                    {(currentWebPageParams.page! - 1) * currentWebPageParams.page_size! + idx + 1}
                                                </TableCell>
                                                {showInstitution && <TableCell className="text-xs py-4 font-semibold text-slate-500 tracking-tight">{page.institutionName}</TableCell>}
                                                <TableCell className="text-[11px] py-4 text-slate-400 font-medium">{page.moduleName}</TableCell>
                                                <TableCell className="text-xs py-4 font-black text-slate-700 tracking-tight uppercase">{page.pageName}</TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.addFlag} onCheckedChange={(v) => handleWebCheck(idx, 'addFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.deleteFlag} onCheckedChange={(v) => handleWebCheck(idx, 'deleteFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.updateFlag} onCheckedChange={(v) => handleWebCheck(idx, 'updateFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.processFlag} onCheckedChange={(v) => handleWebCheck(idx, 'processFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.reportFlag} onCheckedChange={(v) => handleWebCheck(idx, 'reportFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-6 w-6 rounded-lg border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm" checked={page.checked} onCheckedChange={(v) => handleWebCheck(idx, 'checked', !!v)} /></div></TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredWeb.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={showInstitution ? 10 : 9} className="text-center py-4 text-gray-500">No pages found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                        <PaginationControls
                            total={webPageTotal}
                            params={currentWebPageParams}
                            setParams={onWebPageParamsChange}
                            totalPages={totalPagesWeb}
                            isLoading={isWebPageLoading}
                        />
                    </div>

                    {/* Add New Pages Grid (staged) */}
                    {stagedWebPages.length > 0 && (
                        <div className="card-bento relative group">
                            <div className="neon-glow-orange" />
                            <div className="bento-header p-6">
                                <h3 className="bento-title text-orange-600">Staged Pages (Pending Persistence)</h3>
                                <div className="relative w-64 z-10">
                                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="FILTER STAGED..."
                                        className="h-10 pl-10 text-[10px] font-black tracking-widest bg-white/60 border-slate-200/60 rounded-full focus:ring-orange-500/20 transition-all placeholder:text-slate-300"
                                        value={searchStaged}
                                        onChange={(e) => { setSearchStaged(e.target.value); setStagedPage(1); }}
                                    />
                                </div>
                            </div>
                            <ScrollArea className="h-64">
                                {filteredStaged.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No matching staged entities found.</div>
                                ) : (
                                    <Table>
                                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                            <TableRow className="hover:bg-transparent border-none">
                                                <TableHead className="w-16 text-center text-[10px] font-black uppercase text-slate-400 tracking-tighter">IDX</TableHead>
                                                {showInstitution && (
                                                    <TableHead className="text-[10px] font-black uppercase text-slate-400">Institution</TableHead>
                                                )}
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Module</TableHead>
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400">Descriptor</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">ADD</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">DEL</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">UPD</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">PRC</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">REP</TableHead>
                                                <TableHead className="w-16 text-center text-[9px] font-black text-red-500 uppercase">Drop</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedStaged.map((page, idx) => (
                                                <TableRow key={page.pageMappingId} className="hover:bg-orange-50/10 border-slate-50 transition-colors group">
                                                    <TableCell className="text-center font-bold text-[10px] text-slate-300 group-hover:text-orange-500 transition-colors">
                                                        {(stagedPage - 1) * stagedPageSize + idx + 1}
                                                    </TableCell>
                                                    {showInstitution && <TableCell className="text-xs py-4 font-semibold text-slate-400/80 italic tracking-tight">{page.institutionName}</TableCell>}
                                                    <TableCell className="text-[11px] py-4 text-slate-400 font-medium">{page.moduleName}</TableCell>
                                                    <TableCell className="text-xs py-4 font-black text-slate-700 tracking-tight uppercase">{page.pageName}</TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-4 w-4 rounded" checked={page.addFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'addFlag', !!v)} /></div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-4 w-4 rounded" checked={page.deleteFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'deleteFlag', !!v)} /></div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-4 w-4 rounded" checked={page.updateFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'updateFlag', !!v)} /></div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-4 w-4 rounded" checked={page.processFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'processFlag', !!v)} /></div></TableCell>
                                                    <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-4 w-4 rounded" checked={page.reportFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'reportFlag', !!v)} /></div></TableCell>
                                                    <TableCell className="text-center">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all" onClick={() => handleRemoveStaged(page.pageMappingId)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </ScrollArea>
                            <PaginationControls
                                total={filteredStaged.length}
                                params={{ page: stagedPage, page_size: stagedPageSize } as any}
                                setParams={(p: any) => setStagedPage(p.page)}
                                totalPages={totalPagesStaged}
                                isLoading={false}
                            />
                        </div>
                    )}

                    {/* Saved List */}
                    <div className="card-bento relative group">
                        <div className="neon-glow-green" />
                        <div className="bento-header p-6">
                            <h3 className="bento-title text-green-600">Active Persistence Layer</h3>
                            <div className="relative w-64 z-10">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="ARCHIVE SEARCH..."
                                    className="h-10 pl-10 text-[10px] font-black tracking-widest bg-white/60 border-slate-200/60 rounded-full focus:ring-green-500/20 transition-all placeholder:text-slate-300"
                                    value={searchSavedWeb}
                                    onChange={(e) => setSearchSavedWeb(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-64">
                            {isSavedGridLoading ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="w-16 text-center text-[10px] font-black uppercase text-slate-400 tracking-tighter">REF</TableHead>
                                            {showInstitution && (
                                                <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => handleSort('institution', 'saved')}>
                                                    Institution {currentSavedGridParams.sort_column === 'institution' && (currentSavedGridParams.sort_direction === 'asc' ? '▲' : '▼')}
                                                </TableHead>
                                            )}
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => handleSort('module', 'saved')}>
                                                Module {currentSavedGridParams.sort_column === 'module' && (currentSavedGridParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600" onClick={() => handleSort('pageName', 'saved')}>
                                                Descriptor {currentSavedGridParams.sort_column === 'pageName' && (currentSavedGridParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">ADD</TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">DEL</TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">UPD</TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">PRC</TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-slate-400">REP</TableHead>
                                            <TableHead className="w-16 text-center text-[9px] font-black text-red-500 uppercase">OFF</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {savedGrid.map((page, idx) => (
                                            <TableRow key={page.ivrmstauP_Id} className="hover:bg-green-50/10 border-slate-50 transition-colors group">
                                                <TableCell className="text-center font-bold text-[10px] text-slate-300 group-hover:text-green-500 transition-colors">
                                                    {(currentSavedGridParams.page! - 1) * currentSavedGridParams.page_size! + idx + 1}
                                                </TableCell>
                                                {showInstitution && <TableCell className="text-xs py-4 px-4"></TableCell>}
                                                <TableCell className="text-xs py-4 px-4"></TableCell>
                                                <TableCell className="text-xs py-4 px-4 font-black text-slate-700 tracking-tight uppercase">{page.ivrmmP_PageName}</TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={page.ivrmrP_AddFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_AddFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={page.ivrmrP_DeleteFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_DeleteFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={page.ivrmrP_UpdateFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_UpdateFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={page.ivrmrP_ProcessFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_ProcessFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={page.ivrmrP_ReportFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_ReportFlag', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md border-red-200 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" checked={page.checked} onCheckedChange={(v) => handleSavedCheck(idx, 'checked', !!v)} /></div></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                        <PaginationControls
                            total={savedGridTotal}
                            params={currentSavedGridParams}
                            setParams={onSavedGridParamsChange}
                            totalPages={totalPagesSaved}
                            isLoading={isSavedGridLoading}
                        />
                    </div>
                </TabsContent>

                {/* Mobile Mapping Tab */}
                <TabsContent value="mobile" className="space-y-10 pt-4 outline-none">
                    {/* Mobile Master List */}
                    <div className="card-bento relative group">
                        <div className="neon-glow-purple" />
                        <div className="bento-header p-6">
                            <h3 className="bento-title text-purple-600">Mobile Ecosystem Pages</h3>
                            <div className="relative w-64 z-10">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="APP SCAN..."
                                    className="h-10 pl-10 text-[10px] font-black tracking-widest bg-white/60 border-slate-200/60 rounded-full focus:ring-purple-500/20 transition-all placeholder:text-slate-300"
                                    value={searchMobile}
                                    onChange={(e) => setSearchMobile(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-64">
                            {isMobilePageLoading ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="w-16 text-center text-[10px] font-black uppercase text-slate-400 tracking-tighter">IDX</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('pageName', 'mobile')}>
                                                Interface Name {currentMobilePageParams.sort_column === 'pageName' && (currentMobilePageParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">ADD</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_AddFlg', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">UPD</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_UpdateFlg', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-slate-400 uppercase">DEL</span><Checkbox className="rounded-md" onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_DeleteFlg', !!v)} /></div>
                                            </TableHead>
                                            <TableHead className="w-20 text-center">
                                                <div className="flex flex-col items-center gap-1.5"><span className="text-[9px] font-black text-purple-600 uppercase">MAP</span><Checkbox className="rounded-md border-purple-400 data-[state=checked]:bg-purple-600" onCheckedChange={(v) => handleMobileToggleAll('checked', !!v)} /></div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mobilePages.map((page, idx) => (
                                            <TableRow key={page.ivrmmaP_Id} className="hover:bg-purple-50/10 border-slate-50 transition-colors group">
                                                <TableCell className="text-center font-bold text-[10px] text-slate-300 group-hover:text-purple-500 transition-colors">
                                                    {(currentMobilePageParams.page! - 1) * currentMobilePageParams.page_size! + idx + 1}
                                                </TableCell>
                                                <TableCell className="text-xs py-4 font-black text-slate-700 tracking-tight uppercase px-4">{page.ivrmmaP_AppPageName}</TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.ivrmmaP_AddFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_AddFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.ivrmmaP_UpdateFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_UpdateFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md" checked={page.ivrmmaP_DeleteFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_DeleteFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center"><Checkbox className="h-6 w-6 rounded-lg border-purple-200 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 shadow-sm" checked={page.checked} onCheckedChange={(v) => handleMobileCheck(idx, 'checked', !!v)} /></div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                        <PaginationControls
                            total={mobilePageTotal}
                            params={currentMobilePageParams}
                            setParams={onMobilePageParamsChange}
                            totalPages={totalPagesMobile}
                            isLoading={isMobilePageLoading}
                        />
                    </div>

                    {/* Saved Mobile List */}
                    <div className="card-bento relative group">
                        <div className="neon-glow-orange" />
                        <div className="bento-header p-6">
                            <h3 className="bento-title text-orange-600">Archived Mobile Nodes</h3>
                            <div className="relative w-64 z-10">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="NODE QUERY..."
                                    className="h-10 pl-10 text-[10px] font-black tracking-widest bg-white/60 border-slate-200/60 rounded-full focus:ring-orange-600/20 transition-all placeholder:text-slate-300"
                                    value={searchSavedMobile}
                                    onChange={(e) => setSearchSavedMobile(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-64">
                            {isSavedMobilePageLoading ? (
                                <div className="p-8 space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <TableRow className="hover:bg-transparent border-none">
                                            <TableHead className="w-16 text-center text-[10px] font-black uppercase text-slate-400 tracking-tighter">IDX</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => handleSort('pageName', 'savedMobile')}>
                                                Interface Locator {currentSavedMobilePageParams.sort_column === 'pageName' && (currentSavedMobilePageParams.sort_direction === 'asc' ? '▲' : '▼')}
                                            </TableHead>
                                            <TableHead className="w-20 text-center text-[9px] font-black text-slate-400">ADD</TableHead>
                                            <TableHead className="w-20 text-center text-[9px] font-black text-slate-400">DEL</TableHead>
                                            <TableHead className="w-20 text-center text-[9px] font-black text-slate-400">UPD</TableHead>
                                            <TableHead className="w-20 text-center text-[9px] font-black text-red-500 uppercase">OFF</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {savedMobilePages.map((page, idx) => (
                                            <TableRow key={page.ivrmumalP_Id} className="hover:bg-orange-50/10 border-slate-50 transition-colors group">
                                                <TableCell className="text-center font-bold text-[10px] text-slate-300 group-hover:text-orange-500 transition-colors">
                                                    {(currentSavedMobilePageParams.page! - 1) * currentSavedMobilePageParams.page_size! + idx + 1}
                                                </TableCell>
                                                <TableCell className="text-xs py-4 font-black text-slate-700 tracking-tight uppercase px-4">{page.ivrmmaP_AppPageName}</TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={!!page.ivrmumalP_AddFlg} onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_AddFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={!!page.ivrmumalP_DeleteFlg} onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_DeleteFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="rounded" checked={!!page.ivrmumalP_UpdateFlg} onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_UpdateFlg', !!v)} /></div></TableCell>
                                                <TableCell className="text-center"><div className="flex justify-center"><Checkbox className="h-5 w-5 rounded-md border-red-200 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" checked={page.checked} onCheckedChange={(v) => handleSavedMobileCheck(idx, 'checked', !!v)} /></div></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </ScrollArea>
                        <PaginationControls
                            total={savedMobilePageTotal}
                            params={currentSavedMobilePageParams}
                            setParams={onSavedMobilePageParamsChange}
                            totalPages={totalPagesSavedMobile}
                            isLoading={isSavedMobilePageLoading}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
