'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ConsolidatedReportGridProps {
    reportData: any[];
    fullResponse: any;
    onPrint: () => void;
    reportType: string;
    initialData: any;
}

export default function ConsolidatedReportGrid({ reportData, fullResponse, onPrint, reportType, initialData }: ConsolidatedReportGridProps) {

    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();
        // biome-ignore lint/style/useConst: <explanation>
        // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                let ws;

        const wsData = [Object.keys(reportData[0])];
        reportData.forEach(row => {
            wsData.push(Object.values(row));
        });

        ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        const fileName = `Consolidated_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // 1. STAFF WISE DETAILS (ST)
    const renderStaffWiseDetails = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        const rows: any[] = [];
        days.forEach((day: any) => {
            periods.forEach((period: any) => {
                const dayPeriodLabel = `${day.ttmD_DayName}/${period.ttmP_PeriodName}`;
                const rowData: any = { label: dayPeriodLabel, dayId: day.ttmD_Id, periodId: period.ttmP_Id };

                staffList.forEach((staff: any) => {
                    const match = reportData.filter((tt: any) => {
                        const tt_dayId = tt.ttmD_Id || tt.TTMD_Id;
                        const tt_periodId = tt.ttmP_Id || tt.TTMP_Id;
                        const tt_staffId = tt.hrmE_Id || tt.HRME_Id;
                        return (
                            tt_dayId === day.ttmD_Id &&
                            tt_periodId === period.ttmP_Id &&
                            tt_staffId === staff.hrmE_Id
                        );
                    });

                    if (match.length > 0) {
                        rowData[`id${staff.hrmE_Id}`] = match.map((m: any) => m.staffSubject || m.StaffSubject).join(' && ');
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
                                    {fullResponse?.rpttypairods ? staff.empName : (staff.ttmsaB_Abbreviation || staff.ttmsaB_Name || staff.empName)}
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
                                        {row[`id${staff.hrmE_Id}`] || ''}
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
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];

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
                            const staffData = reportData.filter(
                                (tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id
                            );
                            let total = 0;
                            return (
                                <tr key={staff.hrmE_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{staff.empName}</td>
                                    <td className='border border-gray-200 px-4 py-2'>{staff.ttmsaB_Abbreviation}</td>
                                    {days.map((day: any) => {
                                        const dayMatch = staffData.find(
                                            (tt: any) => Number(tt.ttmD_Id || tt.TTMD_Id) === Number(day.ttmD_Id)
                                        );
                                        const count = dayMatch ? (dayMatch.pcount || dayMatch.PCOUNT || 0) : 0;
                                        total += Number(count);
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
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];
        const classSections = fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || [];

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
                            const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                            let total = 0;
                            return (
                                <tr key={sub.ismS_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find((tt: any) =>
                                            (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                            (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                                        );
                                        const count = match ? (match.pcount || match.PCOUNT || 0) : 0;
                                        total += Number(count);
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
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];
        const classSections = fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || [];

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
                            const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                            return (
                                <tr key={sub.ismS_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find((tt: any) =>
                                            (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                            (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                                        );
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center text-xs'>
                                                {match ? (match.ename || match.ENAME || '') : ''}
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

    // 5. STAFF PERIOD WISE WORKLOAD (SPW) - Matrix View
    const renderStaffPeriodMatrix = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>PERIOD</th>
                            {staffList.map((staff: any) => (
                                <th key={staff.hrmE_Id} className='border border-purple-800 px-2 py-3 font-bold text-xs uppercase'>
                                    {staff.empName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {periods.map((period: any, pIdx: number) => (
                            <tr key={pIdx} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-4 py-2 font-semibold bg-gray-50'>
                                    {period.ttmP_PeriodName}
                                </td>
                                {staffList.map((staff: any) => {
                                    const match = reportData.find((tt: any) => {
                                        const tt_periodId = tt.ttmP_Id || tt.TTMP_Id;
                                        const tt_staffId = tt.hrmE_Id || tt.HRME_Id;

                                        return (
                                            tt_periodId === period.ttmP_Id &&
                                            tt_staffId === staff.hrmE_Id
                                        );
                                    });
                                    return (
                                        <td key={staff.hrmE_Id} className='border border-gray-200 px-2 py-2 text-center font-bold text-purple-700'>
                                            {match ? (match.pcount || match.PCOUNT || '') : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
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

    // 6. STAFF FREE PERIOD (STFP)
    const renderStaffFreePeriod = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>STAFF NAME</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-2 py-3 font-bold text-xs uppercase'>{prd.ttmP_PeriodName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffData = reportData.filter((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id);
                            if (staffData.length === 0) return null;
                            return (
                                <tr key={staff.hrmE_Id} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 text-center text-xs'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium text-xs'>{staff.empName}</td>
                                    {periods.map((prd: any) => {
                                        const match = staffData.find((tt: any) => (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id);
                                        return (
                                            <td key={prd.ttmP_Id} className='border border-gray-200 px-2 py-2 text-center text-xs text-orange-600 font-bold'>
                                                {match ? (match.periodFree || match.PeriodFree || '') : ''}
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

    // 7. PERIOD WISE STAFF FREE (PSTF)
    const renderPeriodWiseStaffFree = () => {
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-center'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>ABBREVIATION</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>EMP. CODE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => (
                            <tr key={idx} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-200 px-4 py-2 font-medium'>{row.ename || row.ENAME || ''}</td>
                                <td className='border border-gray-200 px-4 py-2'>{row.abbr || row.ABBR || ''}</td>
                                <td className='border border-gray-200 px-4 py-2'>{row.empcode || row.EMPCODE || ''}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 8. STAFF-PERIOD CONSOLIDATED (SPC)
    const renderStaffPeriodConsolidated = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-1 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-2 py-3 font-bold text-left'>STAFF NAME</th>
                            <th className='border border-purple-800 px-1 py-3 font-bold text-left'>ABBR</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-1 py-3 font-bold text-center uppercase'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => (
                            <tr key={staff.hrmE_Id} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-200 px-2 py-2 font-semibold whitespace-nowrap'>{staff.empName}</td>
                                <td className='border border-gray-200 px-1 py-2'>{staff.ttmsaB_Abbreviation}</td>
                                {periods.map((prd: any) => {
                                    const matches = reportData.filter((tt: any) =>
                                        (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id &&
                                        (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                                    );

                                    const details = matches.map((tt: any) => {
                                        const pcount = (tt.MAXID || 0) - (tt.MINID || 0) + 1;
                                        const dayRange = tt.MINID === tt.MAXID ? (tt.MinDay || '') : `${tt.MinDay}-${tt.MaxDay}`;
                                        return `${tt.ASMCL_ClassName}::${tt.ASMC_SectionName}::${tt.ISMS_SubjectName}::${dayRange}::${pcount}`;
                                    }).join(' && ');

                                    return (
                                        <td key={prd.ttmP_Id} className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
                                            {details || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 9. CLASS-SECTION PERIOD CONSOLIDATED (CSPC)
    const renderClassSectionPeriodConsolidated = () => {
        const classSections = fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-1 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-2 py-3 font-bold text-left'>CLASS/SECTION</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-1 py-3 font-bold text-center uppercase'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classSections.map((cs: any, idx: number) => (
                            <tr key={idx} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                <td className='border border-gray-200 px-2 py-2 font-semibold whitespace-nowrap'>{cs.asmcL_ClassName}</td>
                                {periods.map((prd: any) => {
                                    const matches = reportData.filter((tt: any) =>
                                        (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                        (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id &&
                                        (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                                    );

                                    const details = matches.map((tt: any) => {
                                        const pcount = (tt.MAXID || 0) - (tt.MINID || 0) + 1;
                                        const dayRange = tt.MINID === tt.MAXID ? (tt.MinDay || '') : `${tt.MinDay}-${tt.MaxDay}`;
                                        return `${tt.EmpName || tt.ename || ''}::${tt.ISMS_SubjectName}::${dayRange}::${pcount}`;
                                    }).join(' && ');

                                    return (
                                        <td key={prd.ttmP_Id} className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
                                            {details || ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // 10. STAFF WORKLOAD AFTER TIMETABLE GENERATION (ATG)
    const renderStaffWorkloadAfterGeneration = () => {
        let totalCount = 0;
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>STAFF</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>CLASS</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SECTION</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold text-left'>SUBJECT</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold uppercase'>PERIODS COUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => {
                            const count = Number(row.pcount || row.PCOUNT || 0);
                            totalCount += count;
                            return (
                                <tr key={idx} className='hover:bg-purple-50 transition-colors'>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{row.ename || row.ENAME || ''}</td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{row.asmcL_ClassName || row.ASMCL_ClassName || ''}</td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{row.asmC_SectionName || row.ASMC_SectionName || ''}</td>
                                    <td className='border border-gray-200 px-4 py-2'>{row.ismS_SubjectName || row.ISMS_SubjectName || ''}</td>
                                    <td className='border border-gray-200 px-4 py-2 text-center font-bold text-purple-700'>{count}</td>
                                </tr>
                            );
                        })}
                        <tr className='bg-purple-50 font-bold'>
                            <td colSpan={4} className='border border-gray-200 px-4 py-3 text-right text-purple-900'>TOTAL:</td>
                            <td className='border border-gray-200 px-4 py-3 text-center text-purple-900'>{totalCount}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    // 11. ROOM-WISE REPORT (RMR)
    const renderRoomWiseReport = () => {
        const roomList = fullResponse?.roomlst || fullResponse?.roomlist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];
        const breakList = fullResponse?.tT_Break_list_all || fullResponse?.brklist || [];

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-[10px]'>
                    <thead>
                        <tr className='bg-purple-800 text-white'>
                            <th rowSpan={2} className='border border-purple-900 px-2 py-3 font-bold sticky left-0 bg-purple-800 z-10'>ROOM NAME</th>
                            {days.map((day: any) => (
                                <th key={day.ttmD_Id} colSpan={periods.length} className='border border-purple-900 px-2 py-2 font-bold uppercase text-center border-b-purple-400'>
                                    {day.ttmD_DayName}
                                </th>
                            ))}
                        </tr>
                        <tr className='bg-purple-700 text-white'>
                            {days.map((day: any) => (
                                periods.map((prd: any) => (
                                    <th key={`${day.ttmD_Id}-${prd.ttmP_Id}`} className='border border-purple-800 px-1 py-2 font-bold text-center uppercase min-w-[80px]'>
                                        {prd.ttmP_PeriodName}
                                    </th>
                                ))
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {roomList.map((room: any) => (
                            <tr key={room.ttmrM_Id} className='hover:bg-purple-50 transition-colors'>
                                <td className='border border-gray-200 px-2 py-2 font-semibold bg-gray-50 sticky left-0 z-10'>{room.ttmrM_RoomName}</td>
                                {days.map((day: any) => (
                                    periods.map((prd: any) => {
                                        // Check for Break
                                        const isBreak = breakList.find((brk: any) =>
                                            Number(prd.ttmP_PeriodName) === brk.ttmB_AfterPeriod &&
                                            brk.ttmD_Id === day.ttmD_Id
                                        );

                                        if (isBreak) {
                                            return (
                                                <td key={`${day.ttmD_Id}-${prd.ttmP_Id}`} className='border border-gray-200 px-1 py-1 text-center bg-yellow-50 text-[8px] font-bold text-red-600'>
                                                    {isBreak.ttmB_BreakName || 'BREAK'}
                                                </td>
                                            );
                                        }

                                        const match = reportData.find((tt: any) =>
                                            (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id &&
                                            (tt.ttmD_Id || tt.TTMD_Id) === day.ttmD_Id &&
                                            (tt.ttmrM_Id || tt.TTMRM_Id) === room.ttmrM_Id
                                        );

                                        return (
                                            <td key={`${day.ttmD_Id}-${prd.ttmP_Id}`} className='border border-gray-200 px-1 py-1 text-center leading-tight'>
                                                {match ? (match.staffSubject || match.StaffSubject || '') : ''}
                                            </td>
                                        );
                                    })
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Rendering logic based on reportType
    const renderTable = () => {
        switch (reportType) {
            case 'ST': return renderStaffWiseDetails();
            case 'STD': return renderStaffDayWise();
            case 'CSUB': return renderClassSubject();
            case 'STSUB': return renderStaffSubject();
            case 'SPW': return renderStaffPeriodMatrix();
            case 'STFP': return renderStaffFreePeriod();
            case 'PSTF': return renderPeriodWiseStaffFree();
            case 'SPC': return renderStaffPeriodConsolidated();
            case 'CSPC': return renderClassSectionPeriodConsolidated();
            case 'ATG': return renderStaffWorkloadAfterGeneration();
            case 'RMR': return renderRoomWiseReport();
            default: return renderDefaultTable();
        }
    };

    return (
        <div className='space-y-6'>
            <div className='no-print flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm'>
                <div className='flex items-center gap-2'>
                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
<span className='h-2 w-2 rounded-full bg-purple-600'></span>
                    <h2 className='text-sm font-semibold text-gray-700 uppercase tracking-wider'>
                        {reportType.replace(/_/g, ' ')} Report View
                    </h2>
                </div>
                <div className='flex items-center gap-3'>
                    <Button onClick={onPrint} size='sm' className='bg-purple-600 hover:bg-purple-700 shadow-md transition-all active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                    <Button onClick={exportToExcel} size='sm' variant='outline' className='gap-2 border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 shadow-sm transition-all'>
                        <Download className='h-4 w-4' /> Export Excel
                    </Button>
                </div>
            </div>
            {renderTable()}
            <div className='flex justify-between items-center px-2 text-xs text-gray-500 font-medium italic'>
                <p>* This is a generated consolidated report summary.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
