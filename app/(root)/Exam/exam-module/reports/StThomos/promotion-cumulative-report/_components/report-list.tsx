'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileDown, Printer } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { institution, YearName, stream, section, empG_GroupName, Left_FlagAverage,
        getstudentmarksdetails_temp = [],
        piotsubjets = [],
        getskill = [],
        getallgrade = [],
        getstudentwisesubjectlist = [],
        St_ThomosTotal = []
    } = data || {};

    const handlePrint = useReactToPrint({
        content: () => printRef.current
    });

    const handleExportExcel = () => {
        const tableElement = printRef.current?.querySelector('table');
        if (tableElement) {
            const wb = XLSX.utils.table_to_book(tableElement, { sheet: "Sheet JS" });
            XLSX.writeFile(wb, Left_FlagAverage ? "Super_Average_Report.xlsx" : "Tabulation_Sheet.xlsx");
        }
    };

    if (!data || getstudentmarksdetails_temp.length === 0) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No data records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    const renderNormalReport = () => {
        return (
            <div className='w-full overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr>
                            <td colSpan={5 + piotsubjets.length + getskill.length} className='border border-gray-300 p-2 text-center'>
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    {institution?.mI_Logo && (
                                        <div className='relative h-20 w-20'>
                                            <Image
                                                src={institution.mI_Logo}
                                                alt='School Logo'
                                                fill
                                                className='object-contain'
                                            />
                                        </div>
                                    )}
                                    <h3 className='font-bold text-xl'>St. Thomas&apos; Church School</h3>
                                    <h5 className='font-semibold text-lg'>CLASS WISE TERM REPORT</h5>
                                    <h4 className='font-medium text-base'>
                                        TABULATION SHEET : {YearName || ''} Class : {stream || ''}: Section : {section || ''} - EXAM : {empG_GroupName || ''}
                                    </h4>
                                </div>
                            </td>
                        </tr>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>S. NO</th>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>STUDENT&apos;S-ID</th>
                            <th className='border border-gray-300 p-2 text-left'>STUDENT&apos;S NAME</th>
                            {piotsubjets.map((subject: any, idx: number) => (
                                <th key={`subj-${idx}`} className='border border-gray-300 p-2 text-center min-w-[100px]'>
                                    {subject.Flag === 0 ? subject.ISMS_SubjectName?.toUpperCase() : `${subject.SubjectName}(50)`}
                                </th>
                            ))}
                            {getskill.map((skill: any, idx: number) => (
                                <th key={`skill-${idx}`} className='border border-gray-300 p-2 text-center'>
                                    {skill.ECACT_SkillName}
                                </th>
                            ))}
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>TOTAL</th>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>PERCENTAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getstudentmarksdetails_temp.map((report: any, idx: number) => (
                            <tr key={`row-${idx}`} className='hover:bg-gray-50'>
                                <td className='border border-gray-300 p-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-300 p-2 text-center'>{report.AMST_AdmNo}</td>
                                <td className='border border-gray-300 p-2 font-medium'>{report.studentname}</td>

                                {/* Marks */}
                                {piotsubjets.map((user: any, sIdx: number) => {
                                    const mark = report[user.ISMS_SubjectName];
                                    let displayMark: string | number = '';
                                    if (mark > 0) displayMark = mark;
                                    else if (mark === 0) displayMark = 'AB';
                                    else if (mark === -2) displayMark = 0;
                                    else if (mark === -3) displayMark = 0;

                                    return (
                                        <td key={`mark-${sIdx}`} className='border border-gray-300 p-2 text-center'>
                                            {displayMark}
                                        </td>
                                    );
                                })}

                                {/* Skills */}
                                {getskill.map((ccce: any, skIdx: number) => {
                                    const cceMatch = getallgrade.find((cce: any) => cce.AMST_Id === report.AMST_Id && ccce.ECACT_Id === cce.ECACT_Id);
                                    return (
                                        <td key={`skill-val-${skIdx}`} className='border border-gray-300 p-2 text-center'>
                                            {cceMatch ? cceMatch.EMGD_Name : ''}
                                        </td>
                                    );
                                })}

                                <td className='border border-gray-300 p-2 text-center font-bold'>
                                    {report.TotalMarks}
                                </td>
                                <td className='border border-gray-300 p-2 text-center font-bold'>
                                    {report.TotalPercentage}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSuperAverageReport = () => {
        return (
            <div className='w-full overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr>
                            <td colSpan={5 + getstudentwisesubjectlist.length} className='border border-gray-300 p-2 text-center'>
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    {institution?.mI_Logo && (
                                        <div className='relative h-20 w-20'>
                                            <Image
                                                src={institution.mI_Logo}
                                                alt='School Logo'
                                                fill
                                                className='object-contain'
                                            />
                                        </div>
                                    )}
                                    <h3 className='font-bold text-xl'>St. Thomas&apos; Church School</h3>
                                    <h5 className='font-semibold text-lg'>CLASS WISE AVERAGE REPORT</h5>
                                    <h4 className='font-medium text-base'>
                                        SUPER AVERAGE SHEET : {YearName || ''} Class : {stream || ''}: Section : {section || ''}
                                    </h4>
                                </div>
                            </td>
                        </tr>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 p-2 text-center'>S. NO</th>
                            <th className='border border-gray-300 p-2 text-center'>STUDENT&apos;S-ID</th>
                            <th className='border border-gray-300 p-2 text-left'>STUDENT&apos;S NAME</th>
                            {getstudentwisesubjectlist.map((subject: any, idx: number) => (
                                <th key={`subj-${idx}`} className='border border-gray-300 p-2 text-center'>
                                    {subject.ISMS_SubjectName}
                                </th>
                            ))}
                            <th className='border border-gray-300 p-2 text-center'>TOTAL</th>
                            <th className='border border-gray-300 p-2 text-center'>PERCENTAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getstudentmarksdetails_temp.map((report: any, idx: number) => {
                            const totalRecord = St_ThomosTotal.find((dd: any) => report.AMST_Id === dd.AMST_Id);

                            return (
                                <tr key={`row-${idx}`} className='hover:bg-gray-50'>
                                    <td className='border border-gray-300 p-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-300 p-2 text-center'>{report.AMST_AdmNo}</td>
                                    <td className='border border-gray-300 p-2 font-medium'>{report.studentname}</td>

                                    {/* Marks */}
                                    {getstudentwisesubjectlist.map((user: any, sIdx: number) => {
                                        const mark = report[user.ISMS_SubjectName];
                                        let displayMark: string | number = '';
                                        if (mark > 0) displayMark = mark;
                                        else if (mark === 0) displayMark = 'AB';
                                        else if (mark === -2) displayMark = 0;
                                        else if (mark === -3) displayMark = 0;

                                        return (
                                            <td key={`mark-${sIdx}`} className='border border-gray-300 p-2 text-center'>
                                                {displayMark}
                                            </td>
                                        );
                                    })}

                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {totalRecord ? totalRecord.ESTMPPSG_GroupObtMarks : ''}
                                    </td>
                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {totalRecord ? totalRecord.TotalPercentage : ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Card className='mt-8 pt-4'>
            <div className='flex items-center justify-between px-6 pb-4 border-b'>
                <h3 className='font-semibold text-lg'>Promotion Report</h3>
                <div className='flex gap-2 no-print'>
                    <Button variant='outline' size='sm' onClick={handleExportExcel} className='flex items-center gap-2'>
                        <FileDown className='h-4 w-4' /> Excel
                    </Button>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>
            <CardContent className='p-6'>
                <div ref={printRef} className='print-container bg-white rounded-lg'>
                    {Left_FlagAverage ? renderSuperAverageReport() : renderNormalReport()}
                </div>
            </CardContent>
        </Card>
    );
};
