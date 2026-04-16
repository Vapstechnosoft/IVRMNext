'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ListChecks } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface StudentStatusGridProps {
    data: any[];
}

export function StudentStatusGrid({ data }: StudentStatusGridProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((item) =>
        Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const getStatusIcon = (status: any) => {
        const s = String(status).toLowerCase();
        if (status === 1 || s === '1' || status === true || s === 'true') return '✅';
        if (status === 0 || s === '0' || status === false || s === 'false') return '❌';
        return '⏳';
    };

    const getStatusText = (status: any) => {
        const s = String(status).toLowerCase();
        if (status === 1 || s === '1' || status === true || s === 'true') return 'Approved';
        if (status === 0 || s === '0' || status === false || s === 'false') return 'Rejected';
        return 'Pending';
    };

    return (
        <Card className="border-slate-200 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/90 backdrop-blur-xl">
            <CardHeader className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                        <ListChecks className="w-8 h-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">STUDENT STATUS REPORT</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1">
                                {data.length} TOTAL RECORDS
                            </Badge>
                            {searchTerm && (
                                <Badge variant="outline" className="text-slate-500 font-bold px-3 py-1">
                                    {filteredData.length} FOUND
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <Input
                        placeholder="Search student profile..."
                        className="pl-12 h-14 rounded-full border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-b border-slate-100 h-16">
                                <TableHead className="w-20 text-center font-black text-slate-700 uppercase tracking-tighter">SL.NO</TableHead>
                                <TableHead className="font-black text-slate-700 uppercase tracking-tighter">Student Name</TableHead>
                                <TableHead className="font-black text-slate-700 uppercase tracking-tighter">Class</TableHead>
                                <TableHead className="font-black text-slate-700 uppercase tracking-tighter">Section</TableHead>
                                <TableHead className="text-center font-black text-slate-700 uppercase tracking-tighter">Student Status</TableHead>
                                <TableHead className="text-center font-black text-slate-700 uppercase tracking-tighter">Father Status</TableHead>
                                <TableHead className="text-center font-black text-slate-700 uppercase tracking-tighter">Mother Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow key={index} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                                    <TableCell className="text-center font-bold text-slate-500">{index + 1}</TableCell>
                                    <TableCell className="font-black text-slate-800 tracking-tight text-lg">{row.StudentName || row.name || row.amsT_FirstName}</TableCell>
                                    <TableCell className="font-bold text-slate-600 uppercase">{row.ASMCL_ClassName}</TableCell>
                                    <TableCell className="font-bold text-slate-600 uppercase">{row.ASMC_SectionName}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-2xl" title={getStatusText(row.ASTUREQ_ConformFlg)}>
                                                {getStatusIcon(row.ASTUREQ_ConformFlg)}
                                            </span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                {getStatusText(row.ASTUREQ_ConformFlg)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-2xl" title={getStatusText(row.ASTUREQ_ConformFlgF)}>
                                                {getStatusIcon(row.ASTUREQ_ConformFlgF)}
                                            </span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                {getStatusText(row.ASTUREQ_ConformFlgF)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-2xl" title={getStatusText(row.ASTUREQ_ConformFlgM)}>
                                                {getStatusIcon(row.ASTUREQ_ConformFlgM)}
                                            </span>
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                {getStatusText(row.ASTUREQ_ConformFlgM)}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {filteredData.length === 0 && (
                    <div className="p-20 text-center">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">No matching records found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
