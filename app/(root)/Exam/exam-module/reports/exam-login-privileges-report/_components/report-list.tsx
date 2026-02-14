'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            sheet: 'Report'
        });

        XLSX.writeFile(workbook, 'Exam_Login_Privileges_Report.xlsx');
    };

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={handlePrint}>
                    <i className='fa fa-print mr-2' />
                    Print
                </Button>

                <Button variant='outline' onClick={handleExport}>
                    <i className='fa fa-file-excel-o mr-2' />
                    Export to Excel
                </Button>
            </div>

            <div className='overflow-auto rounded-md border'>
                <Table ref={tableRef}>
                    <TableHeader >
                        <TableRow className='bg-blue-600'> 
                            <TableHead className='w-[80px] text-center border border-gray-700 font-bold text-black text-md'>Sl. No.</TableHead>
                            <TableHead className='border border-gray-700 font-bold text-black text-md text-center'>Class</TableHead>
                            <TableHead className='border border-gray-700 font-bold text-black text-md text-center'>Section</TableHead>
                            <TableHead className='border border-gray-700 font-bold text-black text-md text-center'>Teacher Name</TableHead>
                            <TableHead className='border border-gray-700 font-bold text-black text-md text-center'>Subject Name</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((item, index) => {
                            const subjects = item.subjectlist || [];
                            if (subjects.length === 0) {
                                return (
                                    <TableRow key={index}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell>{item.asmcL_ClassName}</TableCell>
                                        <TableCell>{item.asmC_SectionName}</TableCell>
                                        <TableCell>{item.hrmE_EmployeeName}</TableCell>
                                        <TableCell>{item.ismS_SubjectName}</TableCell>
                                    </TableRow>
                                );
                            }

                            return (
                                <>
                                    <TableRow key={`${index}-0`} className='border border-gray-600'>
                                        <TableCell rowSpan={subjects.length} className='text-center border border-gray-600'>
                                            {index + 1}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className=' border border-gray-600'>
                                            {item.asmcL_ClassName}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className=' border border-gray-600'>
                                            {item.asmC_SectionName}
                                        </TableCell>
                                        <TableCell rowSpan={subjects.length} className=' border border-gray-600'>
                                            {item.hrmE_EmployeeName}
                                        </TableCell>
                                        <TableCell className='border border-gray-600'>{subjects[0].ismS_SubjectName}</TableCell>
                                    </TableRow>

                                    {subjects.slice(1).map((sub: any, subIndex: number) => (
                                        <TableRow key={`${index}-${subIndex + 1}`} >
                                            <TableCell className='border border-gray-600'>{sub.ismS_SubjectName}</TableCell>
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
