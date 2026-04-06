'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IBMIReport } from '@/types/sports/reports/bmi-report';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Button } from '@/components/ui/button';
import { Printer, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ApiResponse } from '@/lib/apiService';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

const columns: ColumnDef<IBMIReport>[] = [
    {
        accessorKey: 'amsT_ID', // Use actual key for sorting
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' className="pl-6" />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className="pl-6">{continuousIndex}</div>;
        },
        enableSorting: true,
    },
    {
        accessorKey: 'amsT_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => row.original.amsT_Name || '-',
        enableSorting: true,
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm. No.' />,
        cell: ({ row }) => row.original.amsT_AdmNo || '-',
        enableSorting: true,
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => row.original.asmcL_ClassName || '-',
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => row.original.asmC_SectionName || '-',
    },
    {
        accessorKey: 'spccshW_HeighT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Height' />,
        cell: ({ row }) => row.original.spccshW_HeighT ?? '-',
        enableSorting: true,
    },
    {
        accessorKey: 'spccshW_WeighT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Weight' />,
        cell: ({ row }) => row.original.spccshW_WeighT ?? '-',
        enableSorting: true,
    },
    {
        accessorKey: 'spccshW_BMi',
        header: ({ column }) => <DataTableColumnHeader column={column} title='BMI' />,
        cell: ({ row }) => row.original.spccshW_BMi ?? '-',
        enableSorting: true,
    },
    {
        accessorKey: 'spccshW_BMiRemark',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        cell: ({ row }) => row.original.spccshW_BMiRemark || '-',
    },
];

interface ReportGridProps {
    response: ApiResponse<IBMIReport[]>;
    searchParams?: any;
    isLoading: boolean;
}

export default function ReportGrid({ response, searchParams, isLoading }: ReportGridProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const tableProps = useDataTableProps(response);

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
        const worksheet = XLSX.utils.json_to_sheet(response.data || []);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "BMI Report");
        XLSX.writeFile(workbook, "BMI_Report.xlsx");
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                        Total Records: <span className="rounded bg-primary/10 px-3 py-1 font-bold text-primary">{response.total || 0}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint()} className="border-2 hover:bg-primary/5">
                            <Printer className="h-4 w-4 mr-2 text-primary" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel} className="border-2 hover:bg-primary/5">
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" /> Excel
                        </Button>
                    </div>
                </div>
            </div>

            <div ref={componentRef} className="p-4 bg-white rounded-lg border shadow-sm">
                <style jsx global>{`
                    @media screen {
                        .print-only { display: none !important; }
                    }
                    @media print {
                        .screen-only { display: none !important; }
                        .print-only { display: block !important; }
                        body { -webkit-print-color-adjust: exact !important; background: white !important; }
                    }
                `}</style>

                <div className="print-only text-center mb-6">
                    <h2 className="text-2xl font-bold uppercase underline">BMI Report</h2>
                </div>

                <div className="screen-only">
                    <GenericDataTable<IBMIReport>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        manualPagination={true}
                        manualSorting={true}
                        manualFiltering={true}
                        showSearchColumns={true}
                        loadingMessage="Loading report data..."
                    />
                </div>

                <div className="print-only overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-center text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                {columns.map((col: any, i) => (
                                    <th key={i} className="border border-gray-300 p-2 font-bold whitespace-nowrap">
                                        {typeof col.header === 'string' ? col.header : ''}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {response.data && response.data.length > 0 ? (
                                response.data.map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {columns.map((col: any, colIndex) => (
                                            <td key={colIndex} className="border border-gray-300 p-2">
                                                {col.accessorKey ? (row as any)[col.accessorKey] :
                                                    col.cell ? (col.cell as any)({ 
                                                        row: { original: row, index: rowIndex },
                                                        table: { getState: () => ({ pagination: { pageIndex: 0, pageSize: 1000 } }) }
                                                    }) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="border border-gray-300 p-10 text-center text-muted-foreground font-medium">
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
