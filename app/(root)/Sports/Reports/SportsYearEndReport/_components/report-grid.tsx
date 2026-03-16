'use client';
import { Printer, FileSpreadsheet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

import { ISportsYearEndReportData } from '../types';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';

interface ReportGridProps {
    data: ISportsYearEndReportData[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const columns: ColumnDef<ISportsYearEndReportData>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'amsT_Name',
        header: 'Student Name',
        cell: ({ row }) => row.original.amsT_Name || '-'
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: 'Adm. No.',
        cell: ({ row }) => row.original.amsT_AdmNo || '-'
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class',
        cell: ({ row }) => row.original.asmcL_ClassName || '-'
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section',
        cell: ({ row }) => row.original.asmC_SectionName || '-'
    },
    {
        accessorKey: 'amsT_DOB',
        header: 'DOB',
        cell: ({ row }) => {
            if (!row.original.amsT_DOB) return '-';
            const date = new Date(row.original.amsT_DOB);
            return isNaN(date.getTime()) ? row.original.amsT_DOB : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    },
    {
        accessorKey: 'spccmE_EventName',
        header: 'Event',
        cell: ({ row }) => row.original.spccmE_EventName || '-'
    },
    {
        accessorKey: 'spccmeV_EventVenue',
        header: 'Venue',
        cell: ({ row }) => row.original.spccmeV_EventVenue || '-'
    },
    {
        accessorKey: 'spccmscC_SportsCCName',
        header: 'Sports',
        cell: ({ row }) => row.original.spccmscC_SportsCCName || '-'
    },
    {
        accessorKey: 'spccE_StartDate',
        header: 'Event Date',
        cell: ({ row }) => {
            if (!row.original.spccE_StartDate) return '-';
            const date = new Date(row.original.spccE_StartDate);
            return isNaN(date.getTime()) ? row.original.spccE_StartDate : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
    },
    {
        accessorKey: 'spccestR_Points',
        header: 'Points',
        cell: ({ row }) => row.original.spccestR_Points ?? '-'
    },
    {
        accessorKey: 'spccestR_Rank',
        header: 'Rank',
        cell: ({ row }) => row.original.spccestR_Rank ?? '-'
    }
];

export default function ReportGrid({ data, searchQuery, onSearchChange }: ReportGridProps) {
    const filteredData = data.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.amsT_Name && item.amsT_Name.toLowerCase().includes(query)) ||
            (item.amsT_AdmNo && item.amsT_AdmNo.toLowerCase().includes(query)) ||
            (item.spccmE_EventName && item.spccmE_EventName.toLowerCase().includes(query)) ||
            (item.spccmscC_SportsCCName && item.spccmscC_SportsCCName.toLowerCase().includes(query))
        );
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground mr-4">
                        Total Records: <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => window.print()} className="hover:bg-primary/5 border-2">
                            <Printer className="h-4 w-4 mr-2 text-primary" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            const worksheet = XLSX.utils.json_to_sheet(data);
                            const workbook = XLSX.utils.book_new();
                            XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
                            XLSX.writeFile(workbook, "SportsYearEndReport.xlsx");
                        }} className="hover:bg-primary/5 border-2">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
                            Excel
                        </Button>
                    </div>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 h-10 border-2"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[400px]">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold uppercase underline text-primary">Sports Year End Report</h1>
                </div>
                {filteredData.length > 0 ? (
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        totalItems={filteredData.length}
                        manualPagination={false}
                    />
                ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/30">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No records found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search query to find what you're looking for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
