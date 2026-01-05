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
    data: any[];
}

export const ReportList = ({ data }: ReportListProps) => {
    const tableRef = useRef<HTMLTableElement>(null);

    if (!data || data.length === 0) {
        return null;
    }

    const handlePrint = () => {
        const printContent = tableRef.current?.outerHTML;

        if (!printContent) return;

        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Exam Login Privileges Report</title>
                    <style>
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            border: 1px solid black;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                        h1 {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                    </style>
                </head>
                <body>
                    <h1>Exam Login Privileges Report</h1>
                    ${printContent}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    const handleExport = () => {
        if (!tableRef.current) return;

        const workbook = XLSX.utils.table_to_book(tableRef.current, {
            sheet: 'Report',
        });

        XLSX.writeFile(workbook, 'Exam_Login_Privileges_Report.xlsx');
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePrint}>
                    <i className="fa fa-print mr-2" />
                    Print
                </Button>

                <Button variant="outline" onClick={handleExport}>
                    <i className="fa fa-file-excel-o mr-2" />
                    Export to Excel
                </Button>
            </div>

            <div className="rounded-md border overflow-auto">
                <Table ref={tableRef}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Sl. No.</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Teacher Name</TableHead>
                            <TableHead>Subject Name</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((item, index) => {
                            const subjects = item.subjectlist || [];

                            if (subjects.length === 0) {
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="text-center">{index + 1}</TableCell>
                                        <TableCell>{item.ASMCL_ClassName}</TableCell>
                                        <TableCell>{item.ASMC_SectionName}</TableCell>
                                        <TableCell>{item.Employeename}</TableCell>
                                        <TableCell>-</TableCell>
                                    </TableRow>
                                );
                            }

                            return (
                                <>
                                    <TableRow key={`${index}-0`}>
                                        <TableCell
                                            rowSpan={subjects.length}
                                            className="text-center align-top"
                                        >
                                            {index + 1}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className="align-top">
                                            {item.ASMCL_ClassName}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className="align-top">
                                            {item.ASMC_SectionName}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className="align-top">
                                            {item.Employeename}
                                        </TableCell>
                                        <TableCell>
                                            {subjects[0].ISMS_SubjectName}
                                        </TableCell>
                                    </TableRow>

                                    {subjects.slice(1).map((sub: any, subIndex: number) => (
                                        <TableRow key={`${index}-${subIndex + 1}`}>
                                            <TableCell>
                                                {sub.ISMS_SubjectName}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
