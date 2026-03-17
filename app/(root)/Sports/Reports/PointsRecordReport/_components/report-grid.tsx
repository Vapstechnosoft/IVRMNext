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

interface ReportGridProps {
    data: IPointsRecordReportData[];
    formData: PointsRecordReportFormSchema | null;
}

export default function ReportGrid({ data, formData }: ReportGridProps) {
    const { loadData } = usePointsRecordReport();
    const [searchQuery, setSearchQuery] = useState('');

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

    // Grouping logic for CC view
    const groupedData = filteredData.reduce((acc: any, item) => {
        const eventName = item.SPCCME_EventName || 'Unknown Event';
        if (!acc[eventName]) acc[eventName] = [];
        acc[eventName].push(item);
        return acc;
    }, {});

    const eventNames = Object.keys(groupedData);

    const handlePrint = () => {
        const printContent = document.getElementById('print-section');
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // Reload to restore event listeners
        }
    };

    const handleExcelExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PointsRecordReport");
        XLSX.writeFile(workbook, "PointsRecordReport.xlsx");
    };

    if (formData?.Type === 'CC') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-muted-foreground mr-4">
                            Total Records: <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{data.length}</span>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="hover:bg-primary/5 border-2">
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

                <div className="rounded-md border bg-white p-6 shadow-sm" id="print-section">
                    <div className="mb-6 text-center">
                        <h3 className="text-xl font-bold uppercase">POINTS RECORD REPORT</h3>
                        <div className="mt-2 text-sm font-medium">
                            <p>Academic Year: {formData.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</p>
                            <p>Competition Category: {formData.SPCCMCC_Id ? getCategoryName(formData.SPCCMCC_Id) : ''}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-center text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 p-2">SL. NO</th>
                                    <th className="border border-gray-300 p-2">Place</th>
                                    <th className="border border-gray-300 p-2">Student Name</th>
                                    <th className="border border-gray-300 p-2">Adm. No.</th>
                                    <th className="border border-gray-300 p-2">Class</th>
                                    <th className="border border-gray-300 p-2">Section</th>
                                    <th className="border border-gray-300 p-2">House Name</th>
                                    <th className="border border-gray-300 p-2">Points</th>
                                    <th className="border border-gray-300 p-2">Remarks</th>
                                </tr>
                            </thead>
                            {eventNames.map((eventName, eIdx) => (
                                <React.Fragment key={eIdx}>
                                    <tbody>
                                        <tr>
                                            <td colSpan={9} className="bg-slate-50 border border-gray-300 p-2 font-bold text-left px-4">
                                                EVENT : {eventName}
                                            </td>
                                        </tr>
                                        {groupedData[eventName].map((item: any, sIdx: number) => (
                                            <tr key={`${eIdx}-${sIdx}`} className="hover:bg-gray-50">
                                                {sIdx === 0 && (
                                                    <td rowSpan={groupedData[eventName].length} className="border border-gray-300 p-2 align-middle">
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
                                    </tbody>
                                </React.Fragment>
                            ))}
                            {eventNames.length === 0 && (
                                <tbody>
                                    <tr>
                                        <td colSpan={9} className="border border-gray-300 p-4 text-center text-muted-foreground">
                                            No records found
                                        </td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Default View (House / CS)
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
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-muted-foreground mr-4">
                        Total Records: <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{data.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="hover:bg-primary/5 border-2">
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

            <div className="rounded-md border bg-white p-6 shadow-sm" id="print-section">
                <div className="mb-6 text-center">
                    <h3 className="text-xl font-bold uppercase">POINTS RECORD REPORT {formData?.ASMAY_Id ? getYearName(formData.ASMAY_Id) : ''}</h3>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredData}
                    totalItems={filteredData.length}
                />
            </div>
        </div>
    );
}
