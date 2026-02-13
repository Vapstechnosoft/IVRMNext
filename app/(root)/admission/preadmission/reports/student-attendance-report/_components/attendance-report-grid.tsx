'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReactToPrint } from 'react-to-print';
import { AttendanceReportPrint } from './attendance-report-print';

interface AttendanceReportGridProps {
    data: any;
    isDateWise: boolean;
}

const AttendanceReportGrid: React.FC<AttendanceReportGridProps> = ({ data, isDateWise }) => {
    const [search, setSearch] = useState('');
    const printRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Student Attendance Report'
    });

    const rows = data?.studentAttendanceList ?? [];
    const monthList = data?.monthList ?? [];
    const countClass = data?.countClass ?? 0;
    const institution = data?.institutionDetails?.[0];

    const filteredRows = rows.filter((row: any) =>
        row.name?.toLowerCase().includes(search.toLowerCase()) ||
        row.AMST_AdmNo?.toLowerCase().includes(search.toLowerCase()) ||
        row.AMAY_RollNo?.toString().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Institution Header Display */}
            {institution && (
                <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-dashed border-primary/20 mb-4 animate-in fade-in slide-in-from-top-4">
                    {institution.mI_Logo && (
                        <div className="h-16 w-16 rounded-lg overflow-hidden border bg-white flex items-center justify-center p-1">
                            <img src={institution.mI_Logo} alt="Logo" className="max-h-full max-w-full object-contain" />
                        </div>
                    )}
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-primary">{institution.mI_Name}</h2>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {institution.mI_Address1}, {institution.mI_Address2}, {institution.mI_Address3}
                        </p>
                    </div>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handlePrint}
                        className="bg-primary hover:bg-primary/90 shadow-md"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Print Report
                    </Button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Total Records:</span>
                        <Badge variant="outline">{rows.length}</Badge>
                    </div>
                    {search && (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Filtered:</span>
                            <Badge variant="secondary">{filteredRows.length}</Badge>
                        </div>
                    )}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-16 text-center">SL. NO.</TableHead>
                            <TableHead className="min-w-[200px]">Student Name</TableHead>
                            <TableHead>Adm. No.</TableHead>
                            <TableHead className="text-center">Roll No.</TableHead>

                            {isDateWise ? (
                                <>
                                    {monthList.map((col: any, idx: number) => (
                                        <TableHead key={idx} className="text-center min-w-[40px] px-1">
                                            {col.day}
                                        </TableHead>
                                    ))}
                                    <TableHead className="text-center font-bold bg-muted/80">Held</TableHead>
                                    <TableHead className="text-center font-bold bg-muted/80">Attd</TableHead>
                                    <TableHead className="text-center font-bold bg-muted/80">%</TableHead>
                                </>
                            ) : (
                                <>
                                    <TableHead className="text-center">Class Held</TableHead>
                                    <TableHead className="text-center">Attendance</TableHead>
                                    <TableHead className="text-center">Percentage (%)</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRows.length > 0 ? (
                            filteredRows.map((row: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="font-medium text-primary">{row.name}</TableCell>
                                    <TableCell>{row.AMST_AdmNo}</TableCell>
                                    <TableCell className="text-center">{row.AMAY_RollNo}</TableCell>

                                    {isDateWise ? (
                                        <>
                                            {monthList.map((col: any, idx: number) => {
                                                const val = row[col.day];
                                                let colorClass = "";
                                                if (val === 'A') colorClass = "text-destructive font-bold";
                                                if (val === 'P') colorClass = "text-green-600 font-bold";
                                                if (val === 'HO') colorClass = "text-amber-500 font-bold";

                                                return (
                                                    <TableCell key={idx} className={cn("text-center text-xs px-1", colorClass)}>
                                                        {val}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-bold bg-muted/20">{countClass}</TableCell>
                                            <TableCell className="text-center font-bold bg-muted/20">{row.total ?? 0}</TableCell>
                                            <TableCell className="text-center font-bold bg-muted/20">{(row.Percentage || row.percentage)?.toFixed(2)}%</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-center">{row.ASA_ClassHeld?.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">{row.ASA_Class_Attended?.toFixed(2)}</TableCell>
                                            <TableCell className="text-center font-bold">{row.Percentage?.toFixed(2)}%</TableCell>
                                            <TableCell className="text-xs">{row.Remarks}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={isDateWise ? 7 + monthList.length : 8} className="h-24 text-center">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {isDateWise && (
                <div className="p-4 bg-muted/20 rounded-lg text-xs space-x-4 flex items-center">
                    <span className="font-bold">Legend:</span>
                    <span className="text-green-600 font-bold">P: Present</span>
                    <span className="text-destructive font-bold">A: Absent</span>
                    <span className="text-amber-500 font-bold">HO: Holiday</span>
                    <span className="text-muted-foreground">NE: Not Entered</span>
                </div>
            )}

            {/* Hidden Print Component */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10000px',
                    left: '-10000px',
                    opacity: 0,
                    pointerEvents: 'none'
                }}>
                <AttendanceReportPrint
                    ref={printRef}
                    data={data}
                    isDateWise={isDateWise}
                />
            </div>
        </div>
    );
};

export default AttendanceReportGrid;
