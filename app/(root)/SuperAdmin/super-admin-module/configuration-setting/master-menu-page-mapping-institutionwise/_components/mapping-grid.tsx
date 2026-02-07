'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { GridDetailDTO } from "@/types/super-admin/configuration-setting/master-menu-page-mapping-institutionwise";

interface MappingGridProps {
    data: GridDetailDTO[];
    onToggleRow: (row: GridDetailDTO) => void;
    onToggleAll: (checked: boolean) => void;
    isLoading?: boolean;
    totalItems: number;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    onSearchChange: (search: string) => void;
    initialSearch?: string;
}

export default function MappingGrid({
    data,
    onToggleRow,
    onToggleAll,
    isLoading,
    totalItems,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    initialSearch = ""
}: MappingGridProps) {
    const [localSearch, setLocalSearch] = useState(initialSearch);

    // Sync local search with prop
    useEffect(() => {
        setLocalSearch(initialSearch);
    }, [initialSearch]);

    const handleSearchSubmit = (val: string) => {
        setLocalSearch(val);
        onSearchChange(val);
        onPageChange(1); // Reset to first page on search
    };

    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;

    const isAllSelected = data.length > 0 && data.every(item => item.checked);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-xl font-bold text-primary">Master Menu/Sub Menu Mapping</h3>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="search here..."
                        className="pl-8"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearchSubmit(localSearch);
                        }}
                    />
                    {localSearch !== initialSearch && (localSearch.length > 2 || localSearch === '') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-2 text-xs text-primary font-semibold hover:bg-transparent"
                            onClick={() => handleSearchSubmit(localSearch)}
                        >
                            Apply
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border shadow-sm overflow-hidden relative min-h-[200px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}
                <Table>
                    <TableHeader className="bg-slate-50 font-bold">
                        <TableRow>
                            <TableHead className="w-12 text-center">
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(checked) => onToggleAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead className="w-16 text-center text-primary font-bold">SL.NO</TableHead>
                            <TableHead className="text-primary font-bold">Institution Name</TableHead>
                            <TableHead className="text-primary font-bold">Module Name</TableHead>
                            <TableHead className="text-primary font-bold">Main Menu Name</TableHead>
                            <TableHead className="text-primary font-bold">Sub Menu Name</TableHead>
                            <TableHead className="text-primary font-bold">Page Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <TableRow key={item.ivrmmmpmI_Id}>
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={!!item.checked}
                                            onCheckedChange={() => onToggleRow(item)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">{startIndex + index + 1}</TableCell>
                                    <TableCell>{item.mI_Name}</TableCell>
                                    <TableCell>{item.modulename}</TableCell>
                                    <TableCell>{item.menuname}</TableCell>
                                    <TableCell>{item.submenuname}</TableCell>
                                    <TableCell>{item.pagename}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground italic">
                                    {isLoading ? "Fetching records..." : "No records found."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1">
                <div className="text-sm text-muted-foreground">
                    Showing {totalItems > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select value={pageSize.toString()} onValueChange={(val) => {
                            onPageSizeChange(Number(val));
                            onPageChange(1);
                        }}>
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize.toString()} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[5, 10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 lg:flex"
                            onClick={() => onPageChange(1)}
                            disabled={page === 1 || isLoading}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(Math.max(page - 1, 1))}
                            disabled={page === 1 || isLoading}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center justify-center text-sm font-medium mx-2 italic">
                            Page {page} of {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                            disabled={page === totalPages || totalPages === 0 || isLoading}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 lg:flex"
                            onClick={() => onPageChange(totalPages)}
                            disabled={page === totalPages || totalPages === 0 || isLoading}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
