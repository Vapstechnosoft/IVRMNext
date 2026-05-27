'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SectionSummaryProps {
    data: any[];
}

export const SectionSummaryTable = ({ data }: SectionSummaryProps) => {
    return (
        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-[#337ab7]">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[60px] text-center font-bold text-white">SL.NO</TableHead>
                        <TableHead className="font-bold text-white">Class</TableHead>
                        <TableHead className="font-bold text-white">Section</TableHead>
                        <TableHead className="text-center font-bold text-white">Male</TableHead>
                        <TableHead className="text-center font-bold text-white">Female</TableHead>
                        <TableHead className="text-center font-bold text-white border-l border-white/20">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => {
                        const isTotalRow = row.asmc_sectionname?.toUpperCase() === 'TOTAL';
                        return (
                            <TableRow
                                key={index}
                                className={cn(
                                    "hover:bg-slate-50/50",
                                    isTotalRow && "bg-slate-100/80 font-bold hover:bg-slate-100"
                                )}
                            >
                                <TableCell className="text-center text-slate-400 ">{index + 1}</TableCell>
                                <TableCell className={cn(isTotalRow && "text-sky-700")}>{row.asmcl_classname}</TableCell>
                                <TableCell>
                                    {isTotalRow ? (
                                        <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                                            {row.asmc_sectionname}
                                        </Badge>
                                    ) : (
                                        row.asmc_sectionname
                                    )}
                                </TableCell>
                                <TableCell className="text-center font-medium">{row.male}</TableCell>
                                <TableCell className="text-center font-medium">{row.female}</TableCell>
                                <TableCell className="text-center font-bold border-l">{row.totalcount}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

interface ReligionSummaryProps {
    data: any[];
}

export const ReligionSummaryTable = ({ data }: ReligionSummaryProps) => {
    return (
        <ScrollArea className="w-full whitespace-nowrap rounded-md border bg-white shadow-sm">
            <Table className="relative min-w-[2000px]">
                <TableHeader className="bg-[#337ab7]">
                    <TableRow className="border-b border-white/20 hover:bg-transparent">
                        <TableHead rowSpan={2} className="w-[60px] text-center font-bold border-r border-white/20 text-white">SL.NO</TableHead>
                        <TableHead rowSpan={2} className="min-w-[120px] font-bold border-r border-white/20 text-white">Class</TableHead>
                        <TableHead rowSpan={2} className="min-w-[120px] font-bold border-r border-white/20 text-white">Section</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">General</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">OBC</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">SC</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">ST</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/5">Hindu</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/5">Christian</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/5">Islam</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/5">Other</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">Gender</TableHead>
                        <TableHead colSpan={2} className="text-center font-bold border-r border-white/20 text-white bg-white/10">Enrollment</TableHead>
                        <TableHead rowSpan={2} className="text-center font-bold bg-[#286090] text-white min-w-[100px]">Total</TableHead>
                    </TableRow>
                    <TableRow className="bg-[#3c8dbc]/90 hover:bg-[#3c8dbc]/90">
                        {/* Sub-headers for Category */}
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        {/* Sub-headers for Religion */}
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        {/* Sub-headers for Gender */}
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">M</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">F</TableHead>
                        {/* Sub-headers for Enrollment */}
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">New</TableHead>
                        <TableHead className="text-center text-[10px] uppercase font-bold border-r border-white/10 text-white">Old</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50">
                            <TableCell className="text-center text-slate-400 border-r">{index + 1}</TableCell>
                            <TableCell className="font-bold border-r">{row.asmcl_classname}</TableCell>
                            <TableCell className="border-r">{row.asmc_sectionname}</TableCell>
                            {/* Category Data */}
                            <TableCell className="text-center border-r font-medium text-blue-600">{row.male_general}</TableCell>
                            <TableCell className="text-center border-r font-medium text-blue-600">{row.female_general}</TableCell>
                            <TableCell className="text-center border-r font-medium text-emerald-600">{row.male_obc}</TableCell>
                            <TableCell className="text-center border-r font-medium text-emerald-600">{row.female_obc}</TableCell>
                            <TableCell className="text-center border-r font-medium text-amber-600">{row.male_sc}</TableCell>
                            <TableCell className="text-center border-r font-medium text-amber-600">{row.female_sc}</TableCell>
                            <TableCell className="text-center border-r font-medium text-purple-600">{row.male_st}</TableCell>
                            <TableCell className="text-center border-r font-medium text-purple-600">{row.female_st}</TableCell>
                            {/* Religion Data */}
                            <TableCell className="text-center border-r font-medium">{row.male_hindu}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.female_hindu}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.male_christian}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.female_christian}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.male_islam}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.female_islam}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.male_other}</TableCell>
                            <TableCell className="text-center border-r font-medium">{row.female_other}</TableCell>
                            {/* Gender Total */}
                            <TableCell className="text-center border-r font-bold text-sky-700">{row.male}</TableCell>
                            <TableCell className="text-center border-r font-bold text-pink-700">{row.female}</TableCell>
                            {/* Enrollment */}
                            <TableCell className="text-center border-r font-bold text-indigo-600">{row.newst_totalcount}</TableCell>
                            <TableCell className="text-center border-r font-bold text-indigo-400">{row.oldst_totalcount}</TableCell>
                            {/* Total */}
                            <TableCell className="text-center font-bold bg-slate-50 border-l-2">{row.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
};
