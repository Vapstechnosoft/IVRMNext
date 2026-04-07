'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye, FileText, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NdaStudentTcDetailsTableProps {
    data: any[];
    onViewPdf: (student: any) => void;
    onViewStatus: (student: any) => void;
}

export function NdaStudentTcDetailsTable({ data, onViewPdf, onViewStatus }: NdaStudentTcDetailsTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredData = data.filter(s => 
        s.StudentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.AMST_AdmNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ASMCL_ClassName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-indigo-950 uppercase tracking-tight">Approved TC Details</h4>
                        <p className="text-sm font-medium text-slate-500 italic">Listing official records of generated certificates.</p>
                    </div>
                </div>
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <Input 
                        placeholder="Search records..." 
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-11 h-12 rounded-2xl border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 focus:ring-indigo-500/20"
                    />
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-2xl ring-1 ring-slate-100">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-200">
                            <TableHead className="w-16 text-center font-bold text-slate-700">SL.</TableHead>
                            <TableHead className="font-bold text-slate-700">Student Name</TableHead>
                            <TableHead className="font-bold text-slate-700">Adm No.</TableHead>
                            <TableHead className="font-bold text-slate-700">Class (Section)</TableHead>
                            <TableHead className="w-32 text-center font-bold text-slate-700">View Status</TableHead>
                            <TableHead className="w-32 text-center font-bold text-slate-700">View PDF</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((s, index) => (
                                <TableRow key={s.AMST_Id} className="hover:bg-indigo-50/30 transition-colors border-b border-slate-100 last:border-none group">
                                    <TableCell className="text-center font-black text-slate-400">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </TableCell>
                                    <TableCell className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.StudentName}</TableCell>
                                    <TableCell className="font-bold text-indigo-700">{s.AMST_AdmNo}</TableCell>
                                    <TableCell className="text-slate-600 font-medium">{s.ASMCL_ClassName} ({s.ASMC_SectionName})</TableCell>
                                    <TableCell className="text-center">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => onViewStatus(s)}
                                            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all rounded-xl"
                                            title="View Approval Status"
                                        >
                                            <Info className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={() => onViewPdf(s)}
                                            className="border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all rounded-xl shadow-sm hover:shadow-indigo-100"
                                            title="View Certificate PDF"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                                        <FileText className="h-12 w-12" />
                                        <p className="font-bold text-lg">No records found Matching your search.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                        Page <span className="text-indigo-600">{currentPage}</span> of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === 1} 
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="rounded-xl border-slate-200 hover:bg-white shadow-sm"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon" 
                            disabled={currentPage === totalPages} 
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="rounded-xl border-slate-200 hover:bg-white shadow-sm"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
