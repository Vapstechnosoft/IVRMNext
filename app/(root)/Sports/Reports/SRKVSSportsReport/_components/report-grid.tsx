'use client';

import { Button } from '@/components/ui/button';
import type { ISRKVSReportData } from '@/types/sports/reports/srkvs-sports-report';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportGridProps {
    data: ISRKVSReportData[];
    type: string;
}

export const ReportGrid = ({ data, type }: ReportGridProps) => {
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Sports_Report_${type}`,
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
        if (!data || data.length === 0) return;

        // Flatten grouped data into export rows per report type
        const rows: Record<string, any>[] = [];

        data.forEach((group) => {
            (group.RecordDetails || []).forEach((record: any, idx: number) => {
                if (type === 'Record') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Category: group.SPCCMCC_CompitionCategory || '',
                        Events: record.SPCCMSCCG_SportsCCGroupName || record.groupName || '',
                        Timings:
                            `${record.SPCCESTR_Value ?? record.points ?? ''} ${record.SPCCMUOM_UOMName ?? record.uomName ?? ''}`.trim(),
                        Year: record.ASMAY_Year || record.academicYear || '',
                        Name: record.AMST_FirstName || record.studentName || ''
                    });
                } else if (type === 'Start' || type === 'Finish') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Category: group.SPCCMCC_CompitionCategory || '',
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        'Lane No': idx + 1,
                        'Roll No': record.AMAY_RollNo ?? record.rollNo ?? '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        'Attempt I': record.I ?? '',
                        'Attempt II': record.II ?? '',
                        'Attempt III': record.III ?? '',
                        ...(type === 'Finish' ? { Rank: record.SPCCESTR_Rank ?? record.rank ?? '' } : {})
                    });
                } else if (type === 'Consolidated') {
                    rows.push({
                        'Sl.No': idx + 1,
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        Place: record.SPCCESTR_Rank ?? record.rank ?? '',
                        'Adm No': record.AMST_AdmNo || record.admNo || '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        Class: record.ASMCL_ClassName || record.className || '',
                        Section: record.ASMC_SectionName || record.sectionName || '',
                        'Time/Distance':
                            `${record.SPCCESTR_Value ?? record.points ?? ''} ${record.SPCCMUOM_UOMName ?? record.uomName ?? ''}`.trim()
                    });
                } else {
                    // Indoor / Outdoor / Team / Externals / Selection
                    rows.push({
                        'Sl.No': idx + 1,
                        Group: group.SPCCMSCCG_SportsCCGroupName || '',
                        Place: type === 'Selection' ? idx + 1 : (record.SPCCESTR_Rank ?? record.rank ?? ''),
                        'Adm No': record.AMST_AdmNo || record.admNo || '',
                        Name: record.AMST_FirstName || record.studentName || '',
                        Class: record.ASMCL_ClassName || record.className || '',
                        Section: record.ASMC_SectionName || record.sectionName || ''
                    });
                }
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

        // Generate Blob and trigger browser download (matching class-teacher-report pattern)
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Sports_Report_${type}.xlsx`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            link.remove();
            window.URL.revokeObjectURL(url);
        }, 100);
    };

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className='space-y-4'>
            <div className='flex justify-end gap-2'>
                <Button onClick={() => handlePrint()} variant='outline' size='sm' className='border-2'>
                    <Printer className='mr-2 h-4 w-4' /> Print
                </Button>
                <Button onClick={exportToExcel} variant='outline' size='sm' className='border-2'>
                    <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' /> Excel
                </Button>
            </div>

            <div ref={componentRef} className='rounded-md border bg-white p-4 shadow-sm'>
                <div className='mb-4 text-center'>
                    <h3 className='font-bold text-xl'>Sports Report - {type}</h3>
                </div>

                {type === 'Record' && (
                    <table className='w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2'>Category</th>
                                <th className='border border-gray-300 p-2'>Events</th>
                                <th className='border border-gray-300 p-2'>Timings</th>
                                <th className='border border-gray-300 p-2'>Year</th>
                                <th className='border border-gray-300 p-2'>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((group, groupIdx) => (
                                <片 key={groupIdx}>
                                    <tr className='bg-gray-50'>
                                        <th colSpan={5} className='border border-gray-300 p-2 text-left'>
                                            {group.SPCCMCC_CompitionCategory}
                                        </th>
                                    </tr>
                                    {group.RecordDetails.map((record, recIdx) => (
                                        <tr key={recIdx}>
                                            <td className='border border-gray-300 p-2 text-center'>{recIdx + 1}</td>
                                            <td className='border border-gray-300 p-2'>{record.SPCCMSCCG_SportsCCGroupName}</td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.SPCCESTR_Value} {record.SPCCMUOM_UOMName}
                                            </td>
                                            <td className='border border-gray-300 p-2'>{record.ASMAY_Year || '2023'}</td>
                                            <td className='border border-gray-300 p-2'>{record.AMST_FirstName}</td>
                                        </tr>
                                    ))}
                                </片>
                            ))}
                        </tbody>
                    </table>
                )}

                {(type === 'Start' || type === 'Finish') && (
                    <div className='space-y-6'>
                        {data.map((group, groupIdx) => (
                            <div key={groupIdx} className='page-break-inside-avoid mb-4 border p-2'>
                                <h4 className='mb-2 border-b pb-2 text-center font-bold'>
                                    {group.SPCCMCC_CompitionCategory} : {group.SPCCMSCCG_SportsCCGroupName}
                                </h4>
                                <table className='w-full border-collapse border border-gray-300'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} className='border border-gray-300 p-2'>
                                                Lane No
                                            </th>
                                            <th rowSpan={2} className='border border-gray-300 p-2'>
                                                Roll/Name
                                            </th>
                                            <th colSpan={3} className='border border-gray-300 p-2'>
                                                Attempts
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className='border border-gray-300 p-2'>I</th>
                                            <th className='border border-gray-300 p-2'>II</th>
                                            <th className='border border-gray-300 p-2'>III</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.RecordDetails.map((record, recIdx) => (
                                            <tr key={recIdx}>
                                                <td className='border border-gray-300 p-2 text-center'>{recIdx + 1}</td>
                                                <td className='border border-gray-300 p-2'>
                                                    {record.AMAY_RollNo} : {record.AMST_FirstName}
                                                </td>
                                                <td className='border border-gray-300 p-2'>{record.I}</td>
                                                <td className='border border-gray-300 p-2'>{record.II}</td>
                                                <td className='border border-gray-300 p-2'>{record.III}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {type === 'Finish' && (
                                    <div className='mt-4'>
                                        <h5 className='font-bold'>RESULTS:</h5>
                                        {group.RecordDetails.filter((r) => r.SPCCESTR_Rank).map((r, i) => (
                                            <div key={i}>
                                                {r.SPCCESTR_Rank === '1' && <span>I PLACE: {r.AMST_FirstName}</span>}
                                                {r.SPCCESTR_Rank === '2' && <span>II PLACE: {r.AMST_FirstName}</span>}
                                                {r.SPCCESTR_Rank === '3' && <span>III PLACE: {r.AMST_FirstName}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {(type === 'Consolidated' ||
                    type === 'Indoor' ||
                    type === 'Outdoor' ||
                    type === 'Team' ||
                    type === 'Externals' ||
                    type === 'Selection') && (
                    <table className='w-full border-collapse border border-gray-300'>
                        <thead>
                            <tr className='bg-gray-100'>
                                <th className='border border-gray-300 p-2'>Place</th>
                                <th className='border border-gray-300 p-2'>Adm No / Name</th>
                                <th className='border border-gray-300 p-2'>Class / Sec</th>
                                {type === 'Consolidated' && <th className='border border-gray-300 p-2'>Time/Distance</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((group, groupIdx) => (
                                <片 key={groupIdx}>
                                    <tr className='bg-gray-50'>
                                        <th colSpan={type === 'Consolidated' ? 4 : 3} className='border border-gray-300 p-2 text-left'>
                                            {group.SPCCMSCCG_SportsCCGroupName}
                                        </th>
                                    </tr>
                                    {group.RecordDetails.map((record, recIdx) => (
                                        <tr key={recIdx}>
                                            <td className='border border-gray-300 p-2 text-center'>
                                                {type === 'Selection' ? recIdx + 1 : record.SPCCESTR_Rank ? `${record.SPCCESTR_Rank}` : ''}
                                            </td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.AMST_AdmNo} : {record.AMST_FirstName}
                                            </td>
                                            <td className='border border-gray-300 p-2'>
                                                {record.ASMCL_ClassName} {record.ASMC_SectionName}
                                            </td>
                                            {type === 'Consolidated' && (
                                                <td className='border border-gray-300 p-2'>
                                                    {record.SPCCESTR_Value} {record.SPCCMUOM_UOMName}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </片>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
// Helper fragment replacement for map keys since React.Fragment is not imported
const 片 = ({ children }: { children: React.ReactNode }) => <>{children}</>;
