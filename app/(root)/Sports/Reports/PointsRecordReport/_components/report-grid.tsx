'use client';

import React, { useState } from 'react';
import { Printer, FileSpreadsheet, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

import { IPointsRecordReportData } from '@/types/sports/reports/points-record-report';
import { PointsRecordReportFormSchema } from '../schema';
import { usePointsRecordReport } from '@/hooks/sports/usePointsRecordReport';
import { DataTable } from '@/components/ui/data-table/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportGridProps {
    data: IPointsRecordReportData[];
    formData: PointsRecordReportFormSchema | null;
}

export default function ReportGrid({ data, formData }: ReportGridProps) {
    const { loadData } = usePointsRecordReport();
    const [searchQuery, setSearchQuery] = useState('');
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Points_Record_Report',
        pageStyle: `
          @page { size: landscape; margin: 10mm; }
          @media print {
            body { -webkit-print-color-adjust: exact !important; margin: 0 !important; padding: 0 !important; }
            .no-clip { overflow: visible !important; }
            table { border-collapse: collapse !important; width: 100% !important; page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            th, td { border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; font-size: 9pt !important; }
            thead { display: table-header-group !important; }
          }
        `
    });

    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PointsRecordReport");
        XLSX.writeFile(workbook, "PointsRecordReport.xlsx");
    };

    const getYearName = (yearId: number) => {
        return loadData.data?.yearlist.find(y => y.asmaY_Id === yearId)?.asmaY_Year || '';
    };

    const getCategoryName = (catId?: number) => {
        if (!catId) return '';
        return loadData.data?.categoryList.find(c => c.spccmcC_Id === catId)?.spccmcC_CompitionCategory || '';
    };

    const filteredData = data.filter(item => {
        const query = searchQuery.toLowerCase();
        return (
            (item.AMST_Name && item.AMST_Name.toLowerCase().includes(query)) ||
            (item.AMST_AdmNo && item.AMST_AdmNo.toLowerCase().includes(query)) ||
            (item.SPCCMH_HouseName && item.SPCCMH_HouseName?.toLowerCase().includes(query)) ||
            (item.SPCCME_EventName && item.SPCCME_EventName?.toLowerCase().includes(query)) ||
            (item.ASMCL_ClassName && item.ASMCL_ClassName?.toLowerCase().includes(query)) ||
            (item.ASMC_SectionName && item.ASMC_SectionName?.toLowerCase().includes(query))
        );
    });

    const groupedData = filteredData.reduce((acc: any, item) => {
        const eventName = item.SPCCME_EventName || 'Unknown Event';
        if (!acc[eventName]) acc[eventName] = [];
        acc[eventName].push(item);
        return acc;
    }, {});

    const eventNames = Object.keys(groupedData);

    const columns: ColumnDef<IPointsRecordReportData>[] = [
        {
            accessorKey: 'index',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
        },
        {
            accessorKey: 'AMST_Name',
            header: 'Student Name',
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: 'Adm. No.',
        },
        {
            accessorKey: 'ASMCL_ClassName',
            header: 'Class',
        },
        {
            accessorKey: 'ASMC_SectionName',
            header: 'Section',
        },
        {
            accessorKey: 'SPCCMH_HouseName',
            header: 'House Name',
        },
        {
            accessorKey: 'SPCCME_EventName',
            header: 'Event',
        },
        {
            accessorKey: 'SPCCMEV_EventVenue',
            header: 'Venue',
        },
        {
            accessorKey: 'SPCCMSCC_SportsCCName',
            header: 'Sports',
        },
        {
            accessorKey: 'SPCCESTR_Points',
            header: 'Points',
        },
        {
            accessorKey: 'SPCCESTR_Rank',
            header: 'Place',
        },
        {
            accessorKey: 'SPCCESTR_Remarks',
            header: 'Remarks',
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border screen-only">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground mr-4">
                        Total Records: <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePrint()} className="hover:bg-primary/5 border-2">
                            <Printer className="h-4 w-4 mr-2 text-primary" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExcelExport} className="hover:bg-primary/5 border-2">
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 shadow-sm border rounded-lg overflow-visible" ref={componentRef}>
                <style jsx global>{`
                    @media screen {
                        .print-only { display: none !important; }
                    }
                    @media print {
                        .screen-only { display: none !important; }
                        .print-only { display: block !important; }
                        .no-clip { overflow: visible !important; }
                        body { -webkit-print-color-adjust: exact !important; background: white !important; }
                        .rounded-lg { border-radius: 0 !important; }
                        .shadow-sm { shadow: none !important; }
                        .border { border: none !important; }
                    }
                `}</style>

                {formData?.Type === 'CC' ? (
                    <div className="space-y-6 no-clip">
                        <div className="text-center">
                            <h3 className="text-xl font-bold uppercase underline">POINTS RECORD REPORT</h3>
                            <div className="mt-2 text-sm font-medium">
                                <p>Academic Year: {formData.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</p>
                                <p>Competition Category: {formData.SPCCMCC_Id ? getCategoryName(formData.SPCCMCC_Id) : ''}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto no-clip">
                            <table className="w-full border-collapse border border-gray-300 text-center text-sm">
                                <thead className="bg-[#3a5dae] text-white print:bg-gray-100 print:text-black">
                                    <tr>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">SL. NO</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Place</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Student Name</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Adm. No.</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Class</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Section</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">House Name</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Points</th>
                                        <th className="border border-gray-300 p-2 bg-[#3a5dae] text-white print:bg-gray-100 print:text-black font-bold">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {eventNames.length > 0 ? (
                                        eventNames.map((eventName, eIdx) => (
                                            <React.Fragment key={eIdx}>
                                                <tr className="bg-slate-50">
                                                    <th colSpan={9} className="border border-gray-300 p-2 font-bold text-left px-4 bg-slate-50">
                                                        EVENT: {eventName}
                                                    </th>
                                                </tr>
                                                {groupedData[eventName].map((item: any, sIdx: number) => (
                                                    <tr key={`${eIdx}-${sIdx}`} className="hover:bg-gray-50 bg-white">
                                                        {sIdx === 0 && (
                                                            <td rowSpan={groupedData[eventName].length} className="border border-gray-300 p-2 align-middle font-bold">
                                                                {eIdx + 1}
                                                            </td>
                                                        )}
                                                        <td className="border border-gray-300 p-2">{item.SPCCESTR_Rank}</td>
                                                        <td className="border border-gray-300 p-2 text-left">{item.AMST_Name}</td>
                                                        <td className="border border-gray-300 p-2">{item.AMST_AdmNo}</td>
                                                        <td className="border border-gray-300 p-2">{item.ASMCL_ClassName}</td>
                                                        <td className="border border-gray-300 p-2">{item.ASMC_SectionName}</td>
                                                        <td className="border border-gray-300 p-2">{item.SPCCMH_HouseName}</td>
                                                        <td className="border border-gray-300 p-2">{item.SPCCESTR_Points}</td>
                                                        <td className="border border-gray-300 p-2">{item.SPCCESTR_Remarks}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="border border-gray-300 p-8 text-center text-muted-foreground font-medium">
                                                No records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 no-clip">
                        <div className="text-center">
                            <h3 className="text-xl font-bold uppercase underline">POINTS RECORD REPORT {formData?.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</h3>
                        </div>

                        <div className="screen-only">
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                totalItems={filteredData.length}
                            />
                        </div>

                        <div className="print-only overflow-x-auto no-clip">
                            <table className="w-full border-collapse border border-gray-300 text-center text-[10pt]">
                                <thead className="bg-[#3a5dae] text-white print:bg-gray-100 print:text-black">
                                    <tr>
                                        {columns.map((col: any, i) => (
                                            <th key={i} className="border border-gray-300 p-2 font-bold bg-[#3a5dae] text-white print:bg-gray-100 print:text-black whitespace-nowrap">
                                                {typeof col.header === 'string' ? col.header : 'SL.NO'}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length > 0 ? (
                                        filteredData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className="bg-white">
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
                                            <td colSpan={columns.length} className="border border-gray-300 p-10 text-center text-muted-foreground font-medium">
                                                No Records Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
