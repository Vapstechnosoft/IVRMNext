'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { IMasterPageRecord } from '@/types/super-admin/configuration-setting/mobileroleprivileges';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';

interface MasterPagesGlobalGridProps {
    data: IMasterPageRecord[];
    totalCount: number;
    onSelect: (item: IMasterPageRecord, isChecked: boolean) => void;
    isLoading?: boolean;
}

export function MasterPagesGlobalGrid({
    data,
    totalCount,
    onSelect,
    isLoading
}: MasterPagesGlobalGridProps) {
    // These states are synced with page.tsx
    const [page, setPage] = useQueryState('mp_page', parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState('mp_page_size', parseAsInteger.withDefault(10));
    const [search, setSearch] = useQueryState('mp_search', parseAsString.withDefault(''));

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <Card className="w-full shadow-lg border-t-4 border-blue-500 hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-slate-50/50 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-xl font-bold flex items-center text-slate-800">
                        <div className="w-2 h-8 bg-blue-500 rounded-full mr-3" />
                        Master Pages
                    </CardTitle>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <InputText
                            placeholder="Search master pages..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset to first page on search
                            }}
                            className="pl-10 bg-white border-slate-200"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="w-20 font-bold text-slate-700">SL.NO</TableHead>
                                <TableHead className="font-bold text-slate-700">Page Name</TableHead>
                                <TableHead className="w-24 text-center font-bold text-slate-700">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={3} className="h-12 animate-pulse bg-slate-50/30" />
                                    </TableRow>
                                ))
                            ) : data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow key={item.ivrmmaP_Id} className="hover:bg-slate-50/40 transition-colors">
                                        <TableCell className="font-medium text-slate-600">
                                            {(page - 1) * pageSize + index + 1}
                                        </TableCell>
                                        <TableCell className="text-slate-700">{item.ivrmmaP_AppPageName}</TableCell>
                                        <TableCell className="flex justify-center">
                                            <Checkbox
                                                onCheckedChange={(checked) => onSelect(item, !!checked)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                                        No master pages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Custom Pagination */}
                <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                    <p className="text-sm text-slate-500 font-medium">
                        Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-bold text-slate-700 px-2">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages || totalPages === 0}
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
