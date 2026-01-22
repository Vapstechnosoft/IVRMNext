'use client';

import { IStudentAgeReport } from '@/types/sports/reports/student-age-calculation';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ReportGridProps {
    data: IStudentAgeReport[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    manualPagination?: boolean;
}

const columns: ColumnDef<IStudentAgeReport>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: 'Adm. No.',
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name',
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: 'Class',
    },
    {
        accessorKey: 'asmC_SectionName',
        header: 'Section',
    },
    {
        accessorKey: 'spccmH_HouseName',
        header: 'House Name',
    },
    {
        accessorKey: 'amsT_DOB',
        header: 'DOB',
        cell: ({ row }) => {
            const date = new Date(row.original.amsT_DOB);
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    },
    {
        accessorKey: 'months',
        header: 'Age Months',
    },
    {
        accessorKey: 'years',
        header: 'Years',
    },
    {
        accessorKey: 'monthsd',
        header: 'Months',
    },
    {
        accessorKey: 'spccmcL_CompitionLevel',
        header: 'Competition Category',
    },
];

export default function ReportGrid({ data, searchQuery, onSearchChange, manualPagination = true }: ReportGridProps) {
    const filteredData = data.filter(item =>
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.amsT_AdmNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-medium">
                    Total Grid Records: <span className="bg-primary/10 text-primary px-2 py-1 rounded">{data.length}</span>
                </div>
                {searchQuery && (
                    <div className="text-sm font-medium">
                        Total Records Searched: <span className="bg-primary/10 text-primary px-2 py-1 rounded">{filteredData.length}</span>
                    </div>
                )}
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search here..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="mb-4 text-center">
                    <h3 className="text-lg font-bold">Student Age Calculation Report</h3>
                </div>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    totalItems={filteredData.length}
                    manualPagination={manualPagination}
                />
            </div>
        </div>
    );
}
