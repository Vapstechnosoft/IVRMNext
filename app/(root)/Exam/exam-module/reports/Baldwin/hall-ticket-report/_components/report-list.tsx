'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const {
        datareport: mainList = [],
        subarray: subList = [],
        accyear = '',
        examname = ''
    } = data ?? {};

    const reportFormat: 'format1' | 'format2' | 'format3' = params?.reportFormat ?? 'format1';

    // ── Print ─────────────────────────────────────────────────────────────────
    // const handlePrint = useReactToPrint({
    //     content: () => printRef.current
    // });

    // ── Excel (Format 1 only) ─────────────────────────────────────────────────
    const handleExcel = () => {
        const table = printRef.current?.querySelector('table');
        if (!table) return;
        const wb = XLSX.utils.table_to_book(table, { sheet: 'Hall Ticket' });
        XLSX.writeFile(wb, 'HallTicketReport.xlsx');
    };

    if (!mainList.length) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    // ── Format 1 — simple list table ─────────────────────────────────────────
    const renderFormat1 = () => (
        <div id='table' className='w-full overflow-x-auto'>
            <div className='mb-3 text-center'>
                <h3 className='font-bold text-2xl'>Hall Ticket Report &nbsp;{accyear}</h3>
            </div>
            <table className='w-full border-collapse border border-gray-300 text-sm'>
                <thead className='bg-gray-100'>
                    <tr>
                        {['Sl No', 'Student Name', 'Admn No', 'Class', 'Section', 'Hall Ticket'].map(
                            (h) => (
                                <th
                                    key={h}
                                    className='border border-gray-300 px-3 py-2 text-left font-semibold'>
                                    {h}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {mainList.map((exm: any, idx: number) => (
                        <tr key={idx} className='hover:bg-gray-50'>
                            <td className='border border-gray-300 px-3 py-2 text-center'>
                                {idx + 1}
                            </td>
                            <td className='border border-gray-300 px-3 py-2'>
                                {exm.amsT_FirstName}
                            </td>
                            <td className='border border-gray-300 px-3 py-2'>
                                {exm.amsT_AdmNo}
                            </td>
                            <td className='border border-gray-300 px-3 py-2'>
                                {exm.asmcL_ClassName}
                            </td>
                            <td className='border border-gray-300 px-3 py-2'>
                                {exm.asmC_SectionName}
                            </td>
                            <td className='border border-gray-300 px-3 py-2 font-medium'>
                                {exm.ehT_HallTicketNo}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ── Format 2 — per-student admit card (GMVPS style) ───────────────────────
    const renderFormat2 = () => (
        <div className='space-y-6'>
            {mainList.map((user: any, idx: number) => {
                const studentSubjects = subList.filter(
                    (exm: any) => exm.amsT_Id === user.amsT_Id
                );
                return (
                    <div
                        key={idx}
                        className='break-inside-avoid border border-gray-800 p-5 font-serif text-sm'
                        style={{ fontFamily: 'Times New Roman, serif' }}>
                        {/* Header */}
                        <div className='text-center leading-snug'>
                            <div className='text-lg font-bold'>
                                G M VIDYANIKETAN PUBLIC SCHOOL
                            </div>
                            <div>(Affiliated to the CBSE, Delhi, No-830189)</div>
                            <div>
                                G M Global Village, Post Box No.12, Brahmavar, Udupi District,
                                Karnataka - 576213
                            </div>
                            <div className='mt-2 font-bold'>{examname} - {accyear}</div>
                            <div className='text-base font-bold tracking-wider'>ADMIT CARD</div>
                        </div>

                        {/* Student details + Photo */}
                        <div className='mt-4 flex justify-between'>
                            <div className='w-3/4 space-y-1 text-sm'>
                                <div>
                                    <b>Student&apos;s Name</b> : {user.amsT_FirstName}
                                </div>
                                <div>
                                    <b>Admission Number</b> : {user.amsT_AdmNo}
                                </div>
                                <div>
                                    <b>Class</b> : {user.asmcL_ClassName}
                                </div>
                                <div>
                                    <b>Father&apos;s Name</b> : {user.amsT_FatherName}
                                </div>
                                <div>
                                    <b>Mother&apos;s Name</b> : {user.MotherName}
                                </div>
                            </div>
                            {user.amsT_Photoname && (
                                <div
                                    className='overflow-hidden border border-gray-800'
                                    style={{ width: 120, height: 140 }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={user.amsT_Photoname}
                                        alt='Student'
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Exam schedule table */}
                        <table className='mt-4 w-full border-collapse text-sm'>
                            <thead>
                                <tr>
                                    {['DATE', 'DAY', 'SUBJECT', "INVIGILATOR'S SIGNATURE"].map(
                                        (h) => (
                                            <th
                                                key={h}
                                                className='border border-gray-800 px-2 py-1 text-center font-semibold'>
                                                {h}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {studentSubjects.map((exm: any, si: number) => {
                                    const d = exm.exttS_Date ? new Date(exm.exttS_Date) : null;
                                    const dateStr = d
                                        ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                                        : '';
                                    const dayStr = d
                                        ? d
                                            .toLocaleDateString('en-US', { weekday: 'long' })
                                            .toUpperCase()
                                        : '';
                                    return (
                                        <tr key={si}>
                                            <td className='border border-gray-800 px-2 py-1 text-center'>
                                                {dateStr}
                                            </td>
                                            <td className='border border-gray-800 px-2 py-1 text-center'>
                                                {dayStr}
                                            </td>
                                            <td className='border border-gray-800 px-2 py-1 text-center'>
                                                {exm.ismS_SubjectName}
                                            </td>
                                            <td className='border border-gray-800 px-2 py-1' />
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Signatures */}
                        <div className='mt-10 flex justify-between text-center text-sm'>
                            <div className='w-2/5'>Candidate&apos;s Signature</div>
                            <div className='w-2/5'>Parent&apos;s / Guardian&apos;s Signature</div>
                        </div>
                        <div className='mt-6 flex justify-between text-center text-sm'>
                            <div className='w-2/5'>
                                <div className='h-10' />
                                Principal&apos;s Signature
                            </div>
                            <div className='w-2/5'>
                                <div className='h-10' />
                                Class Teacher&apos;s Signature
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    // ── Format 3 — compact two-column card (old "printformat1") ──────────────
    const renderFormat3 = () => (
        <div className='space-y-6'>
            {mainList.map((user: any, idx: number) => {
                const studentSubjects = subList.filter(
                    (exm: any) => exm.amsT_Id === user.amsT_Id
                );
                return (
                    <div
                        key={idx}
                        className='break-inside-avoid border border-gray-400 font-serif'
                        style={{ fontFamily: 'Times New Roman, serif' }}>
                        <table className='w-full border-collapse'>
                            <tr>
                                {/* Left — student info */}
                                <td
                                    className='border border-gray-400 p-3 align-top'
                                    style={{ width: '55%' }}>
                                    <h4 className='text-center font-bold'>
                                        {examname} - ADMIT CARD
                                    </h4>
                                    <div className='mt-2 flex'>
                                        <div className='flex-1 space-y-1 text-sm'>
                                            <div>Name : {user.amsT_FirstName}</div>
                                            <div>
                                                Std : {user.asmcL_ClassName} {user.asmC_SectionName}
                                            </div>
                                            <div>Reg.No : {user.ettS_SessionName}</div>
                                        </div>
                                        {user.amsT_Photoname && (
                                            <div
                                                className='overflow-hidden border border-gray-400'
                                                style={{ width: 70, height: 90 }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={user.amsT_Photoname}
                                                    alt='Student'
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className='mt-4 flex justify-between text-sm'>
                                        <span>Sign. of Class Teacher</span>
                                        <span>Sign. of Principal</span>
                                    </div>
                                </td>

                                {/* Right — exam schedule */}
                                <td
                                    className='border border-gray-400 p-3 align-top'
                                    style={{ width: '45%' }}>
                                    <table className='w-full border-collapse text-xs'>
                                        <thead>
                                            <tr>
                                                {['Subject Name', 'Exam Date', 'Sign'].map((h) => (
                                                    <th
                                                        key={h}
                                                        className='border border-gray-400 px-1 py-1 text-left font-semibold'>
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentSubjects.map((exm: any, si: number) => {
                                                const d = exm.exttS_Date
                                                    ? new Date(exm.exttS_Date)
                                                    : null;
                                                const dateStr = d
                                                    ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
                                                    : '';
                                                return (
                                                    <tr key={si}>
                                                        <td className='border border-gray-400 px-1 py-1'>
                                                            {exm.ismS_SubjectName}
                                                        </td>
                                                        <td className='border border-gray-400 px-1 py-1 text-xs'>
                                                            {dateStr}
                                                            {exm.ettS_StartTime &&
                                                                ` (${exm.ettS_StartTime} – ${exm.ettS_EndTime})`}
                                                        </td>
                                                        <td className='border border-gray-400 px-1 py-1' />
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                );
            })}
        </div>
    );

    return (
        <Card className='mt-6'>
            {/* Toolbar */}
            <div className='flex items-center justify-between border-b px-6 py-3 no-print'>
                <h3 className='font-semibold text-lg'>Hall Ticket Report</h3>
                <div className='flex gap-2'>
                    {reportFormat === 'format1' && (
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={handleExcel}
                            className='flex items-center gap-2'>
                            <FileDown className='h-4 w-4' /> Excel
                        </Button>
                    )}
                    {/* <Button
                        variant='default'
                        size='sm'
                        onClick={handlePrint}
                        className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button> */}
                </div>
            </div>

            <CardContent className='p-6'>
                <div ref={printRef} className='print-container bg-white'>
                    {reportFormat === 'format1' && renderFormat1()}
                    {reportFormat === 'format2' && renderFormat2()}
                    {reportFormat === 'format3' && renderFormat3()}
                </div>
            </CardContent>
        </Card>
    );
};
