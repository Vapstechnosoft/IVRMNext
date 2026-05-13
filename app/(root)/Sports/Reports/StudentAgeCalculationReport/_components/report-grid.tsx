'use client';
import { Printer, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

import { IStudentAgeReport } from '@/types/sports/reports/student-age-calculation';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

interface ReportGridProps {
    data: IStudentAgeReport[];
    isLoading?: boolean;
}

const columns: ColumnDef<IStudentAgeReport>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'amsT_Admno',
        header: 'Adm. No.',
        cell: ({ row }) => row.original.amsT_Admno || '-'
    },
    {
        header: 'Student Name',
        accessorKey: 'amsT_Name',
        cell: ({ row }) => row.original.amsT_Name || '-'
    },
    {
        accessorKey: 'asmcL_Classname',
        header: 'Class',
        cell: ({ row }) => row.original.asmcL_Classname || '-'
    },
    {
        accessorKey: 'asmC_Sectionname',
        header: 'Section',
        cell: ({ row }) => row.original.asmC_Sectionname || '-'
    },
    {
        accessorKey: 'spccmH_Housename',
        header: 'House Name',
        cell: ({ row }) => row.original.spccmH_Housename || '-'
    },
    {
        accessorKey: 'amsT_DOb',
        header: 'DOB',
        cell: ({ row }) => {
            if (!row.original.amsT_DOb) return '-';
            const date = new Date(row.original.amsT_DOb);
            return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        }
    },
    {
        accessorKey: 'months',
        header: 'Age Months',
        cell: ({ row }) => row.original.months ?? '-'
    },
    {
        accessorKey: 'years',
        header: 'Years',
        cell: ({ row }) => row.original.years ?? '-'
    },
    {
        accessorKey: 'monthsd',
        header: 'Months',
        cell: ({ row }) => row.original.monthsd ?? '-'
    },
    {
        accessorKey: 'spccmcL_compitionLevel',
        header: 'Competition Category',
        cell: ({ row }) => row.original.spccmcL_compitionLevel || '-'
    },
];

// Column header labels for print table
const printHeaders = [
    'SL.No.', 'Adm. No.', 'Student Name', 'Class', 'Section', 'House Name', 'DOB', 'Age Months', 'Years', 'Months', 'Competition Category'
];

// Accessor keys matching columns order
const printAccessors: (keyof IStudentAgeReport)[] = [
    'amsT_Id', 'amsT_Admno', 'amsT_Name', 'asmcL_Classname', 'asmC_Sectionname', 'spccmH_Housename', 'amsT_DOb', 'months', 'years', 'monthsd', 'spccmcL_compitionLevel'
];

function buildPrintHtml(data: IStudentAgeReport[]): string {
    const rows = data.map((row, idx) => {
        const cells = printAccessors.map((key, colIdx) => {
            // SL. No. column
            if (colIdx === 0) return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${idx + 1}</td>`;
            
            let val: any = row[key];
            if (key === 'amsT_DOb' && val) {
                const date = new Date(val);
                val = isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            }
            
            const displayVal = (val !== null && val !== undefined ? String(val) : '-');
            return `<td style="border:1px solid #000;padding:6px 10px;text-align:center;">${displayVal}</td>`;
        }).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    const headerCells = printHeaders.map(h =>
        `<th style="border:1px solid #000;padding:6px 10px;background:#f3f4f6;text-align:center;font-weight:bold;">${h}</th>`
    ).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Student Age Calculation Report</title>
            <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; background: #fff; color: #000; }
                h2 { text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 16px; font-size: 16px; }
                table { width: 100%; border-collapse: collapse; }
                @media print {
                    body { margin: 10mm; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
            </style>
        </head>
        <body>
            <h2>Student Age Calculation Report</h2>
            <table>
                <thead><tr>${headerCells}</tr></thead>
                <tbody>${rows.length > 0 ? rows : '<tr><td colspan="' + printHeaders.length + '" style="text-align:center;padding:20px;">No Records Found</td></tr>'}</tbody>
            </table>
        </body>
        </html>
    `;
}

export default function ReportGrid({ data, isLoading }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const html = buildPrintHtml(data);
        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "StudentAgeCalculationReport.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        Total Grid Records: <span className="bg-primary/10 text-primary px-2 py-1 rounded">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint()} className="hover:bg-primary/5 border-2">
                            <Printer className="h-4 w-4 mr-2 text-primary" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel} className="hover:bg-primary/5 border-2">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-success" />
                            Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border min-h-[400px]">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold uppercase underline text-primary">Student Age Calculation Report</h1>
                </div>

                <div>
                    <GenericDataTable<IStudentAgeReport>
                        columns={columns}
                        data={data}
                        isLoading={!!isLoading}
                        totalItems={data.length}
                        manualPagination={false}
                        manualFiltering={true}
                        showSearchColumns={true}
                        loadingMessage="Generating report..."
                    />
                </div>
            </div>
        </div>
    );
}
