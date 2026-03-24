'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IBMIReport } from '@/types/sports/reports/bmi-report';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportGridProps {
    data: IBMIReport[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    manualPagination?: boolean;
}

export default function ReportGrid({ data, searchQuery, setSearchQuery, manualPagination = true }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'BMI_Report',
        pageStyle: `
          @page { size: portrait; margin: 20mm; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            table { border-collapse: collapse !important; width: 100% !important; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; }
          }
        `
    });

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BMI Report");
        XLSX.writeFile(workbook, "BMI_Report.xlsx");
    };

    const columns: ColumnDef<IBMIReport>[] = [
        {
            header: 'SL. No.',
            cell: ({ row }) => row.index + 1,
        },
        // {
        //     accessorKey: 'spccmH_HouseName', // Not in current API interface provided in task description, check if needed
        //     header: 'House Name',
        // },
        {
            accessorKey: 'amsT_Name',
            header: 'Student Name',
        },
        {
            accessorKey: 'amsT_AdmNo',
            header: 'Adm. No.',
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
            accessorKey: 'spccshW_HeighT',
            header: 'Height',
        },
        {
            accessorKey: 'spccshW_WeighT',
            header: 'Weight',
        },
        {
            accessorKey: 'spccshW_BMi',
            header: 'BMI',
        },
        {
            accessorKey: 'spccshW_BMiRemark',
            header: 'Remark',
        },
    ];

    const filteredData = data.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            item.amsT_Name.toLowerCase().includes(query) ||
            item.amsT_AdmNo.toLowerCase().includes(query) ||
            item.asmcL_ClassName.toLowerCase().includes(query)
            // item.spccmH_HouseName.toLowerCase().includes(query)
        );
    });

    return (
        <div className="rounded-md border bg-card p-4 shadow-sm">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b pb-4">
                <div className="flex gap-4 items-center">
                    <div className="text-sm font-medium">
                        Total: <span className="rounded bg-primary/10 px-3 py-1 font-bold text-primary">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint()} className="border-2">
                            <Printer className="h-4 w-4 mr-2" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Excel
                        </Button>
                    </div>
                </div>
                <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs border-2"
                />
            </div>

            <div ref={componentRef} className="print:p-0">
                <div className="hidden print:block text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase underline">BMI Report</h2>
                </div>
                <div className="print:hidden">
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        totalItems={filteredData.length}
                        manualPagination={manualPagination}
                    />
                </div>

                <div className="hidden print:block overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                {columns.map((col: any, i) => (
                                    <th key={i} className="border border-gray-300 p-2 font-bold">
                                        {typeof col.header === 'string' ? col.header : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {columns.map((col: any, colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 p-2">
                                                {col.accessorKey ? (row as any)[col.accessorKey] : 
                                                 col.cell ? (col.cell as any)({ row: { original: row, index: rowIndex } }) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="border border-gray-300 p-8 text-center text-muted-foreground font-medium">
                                        No Records Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
