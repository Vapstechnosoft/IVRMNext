'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ConsolidatedReportGridProps {
    reportData: any[];
    fullResponse: any;
    onPrint: () => void;
    reportType: string;
}

export default function ConsolidatedReportGrid({ reportData, fullResponse, onPrint, reportType }: ConsolidatedReportGridProps) {

    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();
        let ws;

        // Simple export for now, can be improved per type
        const wsData = [Object.keys(reportData[0])];
        reportData.forEach(row => {
            wsData.push(Object.values(row));
        });

        ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        const fileName = `Consolidated_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Rendering logic based on reportType
    const renderTable = () => {
        switch (reportType) {
            case 'ST':
                return renderStaffWiseDetails();
            case 'STD':
                return renderStaffDayWise();
            case 'CSUB':
                return renderClassSubject();
            case 'STSUB':
                return renderStaffSubject();
            default:
                return renderDefaultTable();
        }
    };

    // 1. STAFF WISE DETAILS (ST)
    const renderStaffWiseDetails = () => {
        const staffList = fullResponse?.stafflst || [];
        const days = fullResponse?.dayslst || [];
        const periods = fullResponse?.periodslst || [];

        // This view in the original code uses day/period as rows and staff as columns
        // We'll reconstruct the rows if finaltable is the data
        const rows: any[] = [];
        days.forEach((day: any) => {
            periods.forEach((period: any) => {
                const dayPeriodLabel = `${day.ttmD_DayName}/${period.ttmP_PeriodName}`;
                const rowData: any = { label: dayPeriodLabel, dayId: day.ttmD_Id, periodId: period.ttmP_Id };

                staffList.forEach((staff: any) => {
                    const match = reportData.filter((tt: any) =>
                        tt.TTMD_Id === day.ttmD_Id &&
                        tt.TTMP_Id === period.ttmP_Id &&
                        tt.HRME_Id === staff.hrmE_Id
                    );

                    if (match.length > 0) {
                        rowData[`staff_${staff.hrmE_Id}`] = match.map((m: any) => m.StaffSubject).join(' && ');
                    }
                });
                rows.push(rowData);
            });
        });

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-xs'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-2 py-3 font-bold uppercase'>DAY/PERIOD</th>
                            {staffList.map((staff: any) => (
                                <th key={staff.hrmE_Id} className='border border-purple-800 px-2 py-3 font-bold uppercase'>
                                    {fullResponse?.rpttypairods ? staff.empName : staff.ttmsaB_Abbreviation}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-2 py-2 font-semibold bg-gray-50'>{row.label}</td>
                                {staffList.map((staff: any) => (
                                    <td key={staff.hrmE_Id} className='border border-gray-200 px-2 py-2 text-center'>
                                        {row[`staff_${staff.hrmE_Id}`] || ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 2. STAFF DAY WISE (STD)
    const renderStaffDayWise = () => {
        const staffList = fullResponse?.stafflst || [];
        const days = fullResponse?.dayslst || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>ABBR</th>
                            {days.map((day: any) => (
                                <th key={day.ttmD_Id} className='border border-purple-800 px-4 py-3 font-bold'>{day.ttmD_DayName}</th>
                            ))}
                            <th className='border border-purple-800 px-4 py-3 font-bold bg-purple-800'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffData = reportData.filter((tt: any) => tt.HRME_Id === staff.hrmE_Id);
                            let total = 0;
                            return (
                                <tr key={staff.hrmE_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{staff.empName}</td>
                                    <td className='border border-gray-200 px-4 py-2'>{staff.ttmsaB_Abbreviation}</td>
                                    {days.map((day: any) => {
                                        const dayMatch = staffData.find((tt: any) => tt.TTMD_Id === day.ttmD_Id);
                                        const count = dayMatch ? dayMatch.PCOUNT : 0;
                                        total += count;
                                        return (
                                            <td key={day.ttmD_Id} className='border border-gray-200 px-4 py-2 text-center'>{count || ''}</td>
                                        );
                                    })}
                                    <td className='border border-gray-200 px-4 py-2 text-center font-bold text-purple-700 bg-purple-50'>{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 3. CLASS SUBJECT (CSUB)
    const renderClassSubject = () => {
        const subjectList = fullResponse?.subjectlist || [];
        const classSections = fullResponse?.class_sectons || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>{cs.asmcL_ClassName}</th>
                            ))}
                            <th className='border border-purple-800 px-4 py-3 font-bold bg-purple-800'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subData = reportData.filter((tt: any) => tt.ISMS_Id === sub.ismS_Id);
                            let total = 0;
                            return (
                                <tr key={sub.ismS_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find((tt: any) => tt.ASMCL_Id === cs.asmcL_Id && tt.ASMS_Id === cs.asmS_Id);
                                        const count = match ? match.PCOUNT : 0;
                                        total += count;
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center'>{count || ''}</td>
                                        );
                                    })}
                                    <td className='border border-gray-200 px-4 py-2 text-center font-bold text-purple-700 bg-purple-50'>{total}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // 4. STAFF SUBJECT (STSUB)
    const renderStaffSubject = () => {
        const subjectList = fullResponse?.subjectlist || [];
        const classSections = fullResponse?.class_sectons || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>{cs.asmcL_ClassName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subData = reportData.filter((tt: any) => tt.ISMS_Id === sub.ismS_Id);
                            return (
                                <tr key={sub.ismS_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find((tt: any) => tt.ASMCL_Id === cs.asmcL_Id && tt.ASMS_Id === cs.asmS_Id);
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center text-xs'>
                                                {match ? match.ENAME : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Default Table for other types
    const renderDefaultTable = () => {
        if (!reportData.length) return <div className="p-4 text-center text-gray-500">No data available for this report type.</div>;

        const headers = Object.keys(reportData[0]);

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3'>SL. NO.</th>
                            {headers.map(h => (
                                <th key={h} className='border border-purple-800 px-4 py-3 uppercase text-xs font-bold'>{h.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, idx) => (
                            <tr key={idx} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                {headers.map(h => (
                                    <td key={h} className='border border-gray-200 px-4 py-2 text-sm'>{row[h]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className='space-y-6'>
            {/* Header Bar */}
            <div className='no-print flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                    <span className='h-2 w-2 rounded-full bg-purple-600'></span>
                    <h2 className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                        {reportType.replace(/_/g, ' ')} Report View
                    </h2>
                </div>
                <div className='flex items-center gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-purple-600 hover:bg-purple-700 shadow-md transition-all active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>

                    <Button
                        onClick={exportToExcel}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm transition-all'>
                        <Download className='h-4 w-4' />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Report Content */}
            {renderTable()}

            <div className='flex justify-between items-center px-2 text-xs text-gray-500 font-medium italic'>
                <p>* This is a generated consolidated report summary.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
