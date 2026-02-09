'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { IMobileMasterPage } from '@/types/super-admin/configuration-setting/mobilemasterpage';

interface MobileMasterPageGridProps {
    data: IMobileMasterPage[];
    total: number;
    currentPage: number;
    pageSize: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onPageChange: (page: number) => void;
    onEdit: (row: IMobileMasterPage) => void;
    onDelete: (row: IMobileMasterPage) => void;
}

export function MobileMasterPageGrid({
    data,
    total,
    currentPage,
    pageSize,
    searchTerm,
    onSearchChange,
    onPageChange,
    onEdit,
    onDelete
}: MobileMasterPageGridProps) {
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-[#7C3AED]">
                    Mobile App Master Pages
                </CardTitle>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search here..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 border-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-[#7C3AED]/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-[#7C3AED] hover:bg-[#7C3AED]">
                            <TableRow>
                                <TableHead className="w-20 text-center text-white font-bold">SL.NO</TableHead>
                                <TableHead className="text-white font-bold">Page Name</TableHead>
                                <TableHead className="text-white font-bold">Page Displayname</TableHead>
                                <TableHead className="w-32 text-center text-white font-bold">Edit/Delete</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((row, index) => (
                                    <TableRow key={row.ivrmmaP_Id} className="hover:bg-[#F3E8FF]/50 border-b border-[#7C3AED]/5">
                                        <TableCell className="text-center font-medium">
                                            {startIndex + index + 1}
                                        </TableCell>
                                        <TableCell className="font-medium text-[#1E293B]">
                                            {row.ivrmmaP_AppPageName}
                                        </TableCell>
                                        <TableCell className="text-[#475569]">
                                            {row.ivrmmaP_Displayname}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(row)}
                                                    className="h-8 w-8 text-[#7C3AED] hover:text-[#6D28D9] hover:bg-[#F3E8FF]"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(row)}
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No master pages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1} to {Math.min(startIndex + data.length, total)} of {total} entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF]"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Basic pagination window logic
                                    let pageNum = currentPage;
                                    if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;

                                    if (pageNum <= 0 || pageNum > totalPages) return null;

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => onPageChange(pageNum)}
                                            className={
                                                currentPage === pageNum
                                                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                                                    : 'border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF]'
                                            }
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="border-[#7C3AED] text-[#7C3AED] hover:bg-[#F3E8FF]"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
