'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import * as XLSX from 'xlsx';

interface ReportListProps {
    data: any;
}

export const ReportList = ({ data }: ReportListProps) => {
    const tableRef = useRef<HTMLTableElement>(null);

    if (!data || !data.sectionlist || data.sectionlist.length === 0) {
        return null;
    }

    const { subjectlist, sectionlist, yearname, classname, sectioname, examname } = data;

    const handlePrint = () => {
        const printContent = tableRef.current?.outerHTML;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Marks Entry Report</title>');
                printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; text-align: center; } th, td { border: 1px solid black; padding: 8px; } th { background-color: #f2f2f2; }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write('<div style="text-align: center; margin-bottom: 20px;">');
                printWindow.document.write('<h3>Marks Entered Report</h3>');
                printWindow.document.write(`<p><strong>ACADEMIC YEAR:</strong> ${yearname}</p>`);
                printWindow.document.write(`<p><strong>CLASS:</strong> ${classname} &nbsp;&nbsp;&nbsp; <strong>SECTION:</strong> ${sectioname}</p>`);
                printWindow.document.write(`<p><strong>EXAM:</strong> ${examname}</p>`);
                printWindow.document.write('</div>');
                printWindow.document.write(printContent);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const handleExport = () => {
        if (tableRef.current) {
            const wb = XLSX.utils.table_to_book(tableRef.current);
            XLSX.writeFile(wb, 'Marks_Entry_Report.xlsx');
        }
    };

    return (
        <div className="space-y-4">
            <div className="text-center space-y-2 border-b pb-4">
                <h3 className="text-xl font-bold">Marks Entered Report</h3>
                <div className="flex justify-center space-x-8 text-sm">
                    <span><strong>ACADEMIC YEAR:</strong> {yearname}</span>
                </div>
                <div className="flex justify-center space-x-8 text-sm">
                    <span><strong>CLASS:</strong> {classname}</span>
                    <span><strong>SECTION:</strong> {sectioname}</span>
                </div>
                <div className="flex justify-center space-x-8 text-sm">
                    <span><strong>EXAM:</strong> {examname}</span>
                </div>
            </div>

            <div className="flex justify-end space-x-2">
                <Button onClick={handlePrint} variant="outline">
                    <i className="fa fa-print mr-2" /> Print
                </Button>
                <Button onClick={handleExport} variant="outline">
                    <i className="fa fa-file-excel-o mr-2" /> Export to Excel
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table ref={tableRef}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center font-bold">Sl No</TableHead>
                            <TableHead className="text-center font-bold">Class</TableHead>
                            <TableHead className="font-bold">Section</TableHead>
                            {subjectlist.map((sub: any) => (
                                <TableHead key={sub.ISMS_Id} className="text-center font-bold text-wrap max-w-[150px]">{sub.ISMS_SubjectName}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sectionlist.map((user: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell className="text-center">{index + 1}</TableCell>
                                <TableCell className="text-center">{user.ASMCL_ClassName}</TableCell>
                                <TableCell>{user.ASMC_SectionName}</TableCell>
                                {subjectlist.map((sub: any) => {
                                    // Find the marks for this subject in the user's data
                                    const subje = user.subjecttemp?.find((s: any) => s.ISMS_Id === sub.ISMS_Id);

                                    let color = 'black';
                                    if (subje) {
                                        if (subje.SourceMarksColorFlag) color = subje.SourceMarksColorFlag; // If API provides color
                                        // Or mimic logic: Flag 1=Green? logic from angular template seemed to just use SourceMarksColorFlag
                                    }

                                    return (
                                        <TableCell key={sub.ISMS_Id} className="text-center" style={{ color: color }}>
                                            {subje ? subje.SourceMarksEntry : '-'}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
