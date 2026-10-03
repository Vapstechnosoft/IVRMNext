'use client';

import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';

interface ConsolidatedReportGridProps {
    reportData: any[];
    fullResponse: any;
    onPrint: () => void;
    reportType: string;
    initialData: any;
    institution?: any;
    admfigLogo?: string;
    academicYear?: string;
}

export default function ConsolidatedReportGrid({
    reportData,
    fullResponse,
    onPrint,
    reportType,
    initialData,
    institution,
    admfigLogo,
    academicYear
}: ConsolidatedReportGridProps) {
    const { data: session } = useSession();

    // 1. Resolve Logo
    const logoUrl =
        institution?.mI_Logo ||
        fullResponse?.mI_Logo ||
        initialData?.mI_Logo ||
        session?.mi_logo ||
        admfigLogo ||
        fullResponse?.masterCompany?.logo ||
        initialData?.masterCompany?.logo ||
        '';

    let resolvedLogo = logoUrl;
    if (resolvedLogo && !resolvedLogo.startsWith('http://') && !resolvedLogo.startsWith('https://') && !resolvedLogo.startsWith('data:')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        try {
            const origin = baseUrl ? new URL(baseUrl).origin : '';
            resolvedLogo = `${origin}${resolvedLogo.startsWith('/') ? '' : '/'}${resolvedLogo}`;
        } catch {
            // Keep resolvedLogo as is
        }
    }

    // 2. Specific Report Title
    const reportTitleMap: Record<string, string> = {
        ST: 'STAFF WISE DETAILS CONSOLIDATED REPORT',
        STD: 'STAFF DAY WISE CONSOLIDATED REPORT',
        CSUB: 'CLASS SUBJECT CONSOLIDATED REPORT',
        STSUB: 'STAFF SUBJECT CONSOLIDATED REPORT',
        SPW: 'STAFF PERIOD WISE WORKLOAD CONSOLIDATED REPORT',
        STFP: 'STAFF FREE PERIOD CONSOLIDATED REPORT',
        PSTF: 'PERIOD WISE STAFF FREE CONSOLIDATED REPORT',
        SPC: 'STAFF-PERIOD CONSOLIDATED REPORT',
        CSPC: 'CLASS-SECTION PERIOD CONSOLIDATED REPORT',
        RMR: 'ROOM-WISE CONSOLIDATED REPORT',
        ATG: 'STAFF WORKLOAD AFTER TIMETABLE GENERATION REPORT'
    };
    const reportTitle = reportTitleMap[reportType] || `${reportType.replace(/_/g, ' ')} CONSOLIDATED REPORT`;

    const getExportGridData = () => {
        const staffList = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const days = fullResponse?.dayslst || fullResponse?.daylist || initialData?.dayslst_fix || initialData?.daylist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];
        const classSections = fullResponse?.class_sectons || fullResponse?.class_sections || fullResponse?.classlist || [];
        const subjectList = fullResponse?.subjectlist || fullResponse?.subjectlst || [];

        switch (reportType) {
            case 'SPW': {
                // STAFF PERIOD WISE WORKLOAD (Staff as rows, Periods as columns, with Total)
                const allStaff = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
                const filteredStaff = allStaff.filter((staff: any) =>
                    reportData.some((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staff.hrmE_Id ?? staff.HRME_Id))
                );
                const activeStaffList = filteredStaff.length > 0 ? filteredStaff : allStaff;

                const headers = [
                    'SL. NO.',
                    'STAFF NAME',
                    'ABBR',
                    ...periods.map((prd: any) => prd.ttmP_PeriodName || ''),
                    'TOTAL'
                ];

                const rows = activeStaffList.map((staff: any, idx: number) => {
                    const staffData = reportData.filter(
                        (tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staff.hrmE_Id ?? staff.HRME_Id)
                    );
                    let total = 0;
                    const row: any[] = [
                        idx + 1,
                        staff.empName || staff.ename || staff.staffName || staff.hrmE_EmployeeFirstName || '',
                        staff.ttmsaB_Abbreviation || staff.ttmsaB_Name || staff.abbr || staff.ABBR || ''
                    ];

                    periods.forEach((prd: any) => {
                        const periodMatch = staffData.find(
                            (tt: any) => Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prd.ttmP_Id ?? prd.TTMP_Id)
                        );
                        const count = periodMatch ? Number(periodMatch.pcount ?? periodMatch.PCOUNT ?? 0) : 0;
                        total += count;
                        row.push(count || '');
                    });

                    row.push(total);
                    return row;
                });

                return { headers, rows };
            }

            case 'CSUB': {
                // CLASS SUBJECT
                const headers = ['SL. NO.', 'SUBJECT', ...classSections.map((cs: any) => cs.asmcL_ClassName || ''), 'TOTAL'];
                const rows = subjectList.map((sub: any, idx: number) => {
                    const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                    let total = 0;
                    const row: any[] = [idx + 1, sub.ismS_SubjectName || ''];
                    classSections.forEach((cs: any) => {
                        const match = subData.find(
                            (tt: any) =>
                                (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                        );
                        const count = match ? match.pcount || match.PCOUNT || 0 : 0;
                        total += Number(count);
                        row.push(count || '');
                    });
                    row.push(total);
                    return row;
                });
                return { headers, rows };
            }

            case 'ST': {
                // STAFF WISE DETAILS
                const headers = [
                    'DAY/PERIOD',
                    ...staffList.map((staff: any) =>
                        fullResponse?.rpttypairods
                            ? staff.empName || ''
                            : staff.ttmsaB_Abbreviation || staff.ttmsaB_Name || staff.empName || ''
                    )
                ];
                const rows: any[] = [];
                days.forEach((day: any) => {
                    periods.forEach((period: any) => {
                        const row: any[] = [`${day.ttmD_DayName}/${period.ttmP_PeriodName}`];
                        staffList.forEach((staff: any) => {
                            const match = reportData.filter((tt: any) => {
                                const tt_dayId = tt.ttmD_Id || tt.TTMD_Id;
                                const tt_periodId = tt.ttmP_Id || tt.TTMP_Id;
                                const tt_staffId = tt.hrmE_Id || tt.HRME_Id;
                                return (
                                    Number(tt_dayId) === Number(day.ttmD_Id) &&
                                    Number(tt_periodId) === Number(period.ttmP_Id) &&
                                    Number(tt_staffId) === Number(staff.hrmE_Id)
                                );
                            });
                            row.push(match.length > 0 ? match.map((m: any) => m.staffSubject || m.StaffSubject).join(' && ') : '');
                        });
                        rows.push(row);
                    });
                });
                return { headers, rows };
            }

            case 'STD': {
                // STAFF DAY WISE
                const headers = ['SL. NO.', 'STAFF NAME', 'ABBR', ...days.map((day: any) => day.ttmD_DayName || ''), 'TOTAL'];
                const rows = staffList.map((staff: any, idx: number) => {
                    const staffData = reportData.filter((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id);
                    let total = 0;
                    const row: any[] = [idx + 1, staff.empName || '', staff.ttmsaB_Abbreviation || ''];
                    days.forEach((day: any) => {
                        const dayMatch = staffData.find((tt: any) => Number(tt.ttmD_Id || tt.TTMD_Id) === Number(day.ttmD_Id));
                        const count = dayMatch ? dayMatch.pcount || dayMatch.PCOUNT || 0 : 0;
                        total += Number(count);
                        row.push(count || '');
                    });
                    row.push(total);
                    return row;
                });
                return { headers, rows };
            }

            case 'STSUB': {
                // STAFF SUBJECT
                const headers = ['SL. NO.', 'SUBJECT', ...classSections.map((cs: any) => cs.asmcL_ClassName || '')];
                const rows = subjectList.map((sub: any, idx: number) => {
                    const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                    const row: any[] = [idx + 1, sub.ismS_SubjectName || ''];
                    classSections.forEach((cs: any) => {
                        const match = subData.find(
                            (tt: any) =>
                                (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                        );
                        row.push(match ? match.ename || match.ENAME || '' : '');
                    });
                    return row;
                });
                return { headers, rows };
            }

            case 'STFP': {
                // STAFF FREE PERIOD
                const headers = ['SL. NO.', 'STAFF NAME', ...periods.map((prd: any) => prd.ttmP_PeriodName || '')];
                const rows = staffList
                    .filter((staff: any) => reportData.some((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id))
                    .map((staff: any, idx: number) => {
                        const staffData = reportData.filter((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id);
                        const row: any[] = [idx + 1, staff.empName || ''];
                        periods.forEach((prd: any) => {
                            const match = staffData.find((tt: any) => (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id);
                            row.push(match ? match.periodFree || match.PeriodFree || '' : '');
                        });
                        return row;
                    });
                return { headers, rows };
            }

            case 'PSTF': {
                // PERIOD WISE STAFF FREE
                const headers = ['SL. NO.', 'STAFF NAME', 'ABBREVIATION', 'EMP. CODE'];
                const rows = reportData.map((row: any, idx: number) => [
                    idx + 1,
                    row.ename || row.ENAME || '',
                    row.abbr || row.ABBR || '',
                    row.empcode || row.EMPCODE || ''
                ]);
                return { headers, rows };
            }

            case 'SPC': {
                // STAFF-PERIOD CONSOLIDATED
                const headers = ['SL. NO.', 'STAFF NAME', 'ABBR', ...periods.map((prd: any) => prd.ttmP_PeriodName || '')];
                const rows = staffList.map((staff: any, idx: number) => {
                    const row: any[] = [idx + 1, staff.empName || '', staff.ttmsaB_Abbreviation || ''];
                    periods.forEach((prd: any) => {
                        const matches = reportData.filter(
                            (tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id && (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                        );
                        const details = matches
                            .map((tt: any) => {
                                const minId = tt.minid ?? tt.MINID ?? 0;
                                const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                const pcount = maxId - minId + 1;
                                const minDay = tt.minDay ?? tt.MinDay ?? '';
                                const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;
                                const className = tt.asmcL_ClassName ?? tt.ASMCL_ClassName ?? '';
                                const sectionName = tt.asmC_SectionName ?? tt.ASMC_SectionName ?? '';
                                const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';
                                return `${className}::${sectionName}::${subName}::${dayRange}::${pcount}`;
                            })
                            .join(' && ');
                        row.push(details || '');
                    });
                    return row;
                });
                return { headers, rows };
            }

            case 'CSPC': {
                // CLASS-SECTION PERIOD CONSOLIDATED
                const headers = ['SL. NO.', 'CLASS/SECTION', ...periods.map((prd: any) => prd.ttmP_PeriodName || '')];
                const rows = classSections.map((cs: any, idx: number) => {
                    const row: any[] = [idx + 1, `${cs.asmcL_ClassName} : ${cs.asmC_SectionName}`];
                    periods.forEach((prd: any) => {
                        const matches = reportData.filter(
                            (tt: any) =>
                                (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id &&
                                (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                        );
                        const details = matches
                            .map((tt: any) => {
                                const minId = tt.minid ?? tt.MINID ?? 0;
                                const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                const pcount = maxId - minId + 1;
                                const minDay = tt.minDay ?? tt.MinDay ?? '';
                                const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;
                                const empName = tt.empName ?? tt.EmpName ?? tt.ename ?? tt.ENAME ?? '';
                                const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';
                                return `${empName}::${subName}::${dayRange}::${pcount}`;
                            })
                            .join(' && ');
                        row.push(details || '');
                    });
                    return row;
                });
                return { headers, rows };
            }

            case 'ATG': {
                // STAFF WORKLOAD AFTER TIMETABLE GENERATION
                const headers = ['SL. NO.', 'STAFF', 'CLASS', 'SECTION', 'SUBJECT', 'PERIODS COUNT'];
                let totalCount = 0;
                const rows = reportData.map((row: any, idx: number) => {
                    const count = Number(row.pcount || row.PCOUNT || 0);
                    totalCount += count;
                    return [
                        idx + 1,
                        row.ename || row.ENAME || '',
                        row.asmcL_ClassName || row.ASMCL_ClassName || '',
                        row.asmC_SectionName || row.ASMC_SectionName || '',
                        row.ismS_SubjectName || row.ISMS_SubjectName || '',
                        count
                    ];
                });
                rows.push(['', '', '', '', 'TOTAL:', totalCount]);
                return { headers, rows };
            }

            case 'RMR': {
                // ROOM-WISE REPORT
                const roomList = fullResponse?.roomlst || fullResponse?.roomlist || [];
                const breakList = fullResponse?.tT_Break_list_all || fullResponse?.brklist || [];
                const headers = [
                    'ROOM NAME',
                    ...days.flatMap((day: any) => periods.map((prd: any) => `${day.ttmD_DayName} - ${prd.ttmP_PeriodName}`))
                ];
                const rows = roomList.map((room: any) => {
                    const row: any[] = [room.ttmrM_RoomName || ''];
                    days.forEach((day: any) => {
                        periods.forEach((prd: any) => {
                            const isBreak = breakList.find(
                                (brk: any) => Number(prd.ttmP_PeriodName) === brk.ttmB_AfterPeriod && brk.ttmD_Id === day.ttmD_Id
                            );
                            if (isBreak) {
                                row.push(isBreak.ttmB_BreakName || 'BREAK');
                            } else {
                                const match = reportData.find(
                                    (tt: any) =>
                                        (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id &&
                                        (tt.ttmD_Id || tt.TTMD_Id) === day.ttmD_Id &&
                                        (tt.ttmrM_Id || tt.TTMRM_Id) === room.ttmrM_Id
                                );
                                row.push(match ? match.staffSubject || match.StaffSubject || '' : '');
                            }
                        });
                    });
                    return row;
                });
                return { headers, rows };
            }

            default: {
                if (!reportData.length) return { headers: [], rows: [] };
                const headers = ['SL. NO.', ...Object.keys(reportData[0])];
                const rows = reportData.map((row: any, idx: number) => [idx + 1, ...Object.values(row)]);
                return { headers, rows };
            }
        }
    };

    const exportToExcel = () => {
        if (!reportData.length) {
            alert('No data to export!');
            return;
        }

        const wb = XLSX.utils.book_new();
        // biome-ignore lint/style/useConst: <explanation>
        // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
        let ws;

        const headerRows: any[] = [];
        headerRows.push([reportTitle]);
        if (academicYear) {
            headerRows.push([`Academic Year: ${academicYear}`, `Generated on: ${new Date().toLocaleString()}`]);
        } else {
            headerRows.push([`Generated on: ${new Date().toLocaleString()}`]);
        }
        headerRows.push([]); // blank separator row

        const { headers, rows } = getExportGridData();
        const wsData = [...headerRows, headers, ...rows];

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
                        return tt_dayId === day.ttmD_Id && tt_periodId === period.ttmP_Id && tt_staffId === staff.hrmE_Id;
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
                                    {fullResponse?.rpttypairods
                                        ? staff.empName
                                        : staff.ttmsaB_Abbreviation || staff.ttmsaB_Name || staff.empName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 bg-gray-50 px-2 py-2 font-semibold'>{row.label}</td>
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
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>ABBR</th>
                            {days.map((day: any) => (
                                <th key={day.ttmD_Id} className='border border-purple-800 px-4 py-3 font-bold'>
                                    {day.ttmD_DayName}
                                </th>
                            ))}
                            <th className='border border-purple-800 bg-purple-800 px-4 py-3 font-bold'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffData = reportData.filter((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id);
                            let total = 0;
                            return (
                                <tr key={staff.hrmE_Id} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{staff.empName}</td>
                                    <td className='border border-gray-200 px-4 py-2'>{staff.ttmsaB_Abbreviation}</td>
                                    {days.map((day: any) => {
                                        const dayMatch = staffData.find(
                                            (tt: any) => Number(tt.ttmD_Id || tt.TTMD_Id) === Number(day.ttmD_Id)
                                        );
                                        const count = dayMatch ? dayMatch.pcount || dayMatch.PCOUNT || 0 : 0;
                                        total += Number(count);
                                        return (
                                            <td key={day.ttmD_Id} className='border border-gray-200 px-4 py-2 text-center'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 bg-purple-50 px-4 py-2 text-center font-bold text-purple-700'>
                                        {total}
                                    </td>
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
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>
                                    {cs.asmcL_ClassName}
                                </th>
                            ))}
                            <th className='border border-purple-800 bg-purple-800 px-4 py-3 font-bold'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                            let total = 0;
                            return (
                                <tr key={sub.ismS_Id} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find(
                                            (tt: any) =>
                                                (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id && (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                                        );
                                        const count = match ? match.pcount || match.PCOUNT || 0 : 0;
                                        total += Number(count);
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 bg-purple-50 px-4 py-2 text-center font-bold text-purple-700'>
                                        {total}
                                    </td>
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
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            {classSections.map((cs: any, idx: number) => (
                                <th key={idx} className='border border-purple-800 px-2 py-3 font-bold text-xs'>
                                    {cs.asmcL_ClassName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {subjectList.map((sub: any, idx: number) => {
                            const subData = reportData.filter((tt: any) => (tt.ismS_Id || tt.ISMS_Id) === sub.ismS_Id);
                            return (
                                <tr key={sub.ismS_Id} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{sub.ismS_SubjectName}</td>
                                    {classSections.map((cs: any, csIdx: number) => {
                                        const match = subData.find(
                                            (tt: any) =>
                                                (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id && (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id
                                        );
                                        return (
                                            <td key={csIdx} className='border border-gray-200 px-2 py-2 text-center text-xs'>
                                                {match ? match.ename || match.ENAME || '' : ''}
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

    // 5. STAFF PERIOD WISE WORKLOAD (SPW) - Staff as rows, Periods as columns, with Total
    const renderStaffPeriodMatrix = () => {
        const allStaff = fullResponse?.stafflst || fullResponse?.stafflist || initialData?.stafflst || initialData?.stafflist || [];
        const periods = fullResponse?.periodslst || fullResponse?.periodlist || initialData?.periodslst || initialData?.periodlist || [];

        const filteredStaff = allStaff.filter((staff: any) =>
            reportData.some((tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staff.hrmE_Id ?? staff.HRME_Id))
        );
        const activeStaffList = filteredStaff.length > 0 ? filteredStaff : allStaff;

        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse text-sm'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3 font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>ABBR</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-4 py-3 font-bold'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                            <th className='border border-purple-800 bg-purple-800 px-4 py-3 font-bold'>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeStaffList.map((staff: any, idx: number) => {
                            const staffData = reportData.filter(
                                (tt: any) => Number(tt.hrmE_Id ?? tt.HRME_Id) === Number(staff.hrmE_Id ?? staff.HRME_Id)
                            );
                            let total = 0;
                            return (
                                <tr key={staff.hrmE_Id || idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>
                                        {staff.empName || staff.ename || staff.staffName || staff.hrmE_EmployeeFirstName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2'>
                                        {staff.ttmsaB_Abbreviation || staff.ttmsaB_Name || staff.abbr || staff.ABBR || ''}
                                    </td>
                                    {periods.map((prd: any) => {
                                        const periodMatch = staffData.find(
                                            (tt: any) => Number(tt.ttmP_Id ?? tt.TTMP_Id) === Number(prd.ttmP_Id ?? prd.TTMP_Id)
                                        );
                                        const count = periodMatch ? Number(periodMatch.pcount ?? periodMatch.PCOUNT ?? 0) : 0;
                                        total += count;
                                        return (
                                            <td key={prd.ttmP_Id} className='border border-gray-200 px-4 py-2 text-center'>
                                                {count || ''}
                                            </td>
                                        );
                                    })}
                                    <td className='border border-gray-200 bg-purple-50 px-4 py-2 text-center font-bold text-purple-700'>
                                        {total}
                                    </td>
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
        if (!reportData.length) return <div className='p-4 text-center text-gray-500'>No data available for this report type.</div>;
        const headers = Object.keys(reportData[0]);
        return (
            <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='bg-purple-700 text-white'>
                            <th className='border border-purple-800 px-4 py-3'>SL. NO.</th>
                            {headers.map((h) => (
                                <th key={h} className='border border-purple-800 px-4 py-3 font-bold text-xs uppercase'>
                                    {h.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row, idx) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-4 py-2 text-center'>{idx + 1}</td>
                                {headers.map((h) => (
                                    <td key={h} className='border border-gray-200 px-4 py-2 text-sm'>
                                        {row[h]}
                                    </td>
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
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-2 py-3 font-bold text-xs uppercase'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => {
                            const staffData = reportData.filter((tt: any) => (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id);
                            if (staffData.length === 0) return null;
                            return (
                                <tr key={staff.hrmE_Id} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 text-center text-xs'>{idx + 1}</td>
                                    <td className='border border-gray-200 px-4 py-2 font-medium text-xs'>{staff.empName}</td>
                                    {periods.map((prd: any) => {
                                        const match = staffData.find((tt: any) => (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id);
                                        return (
                                            <td
                                                key={prd.ttmP_Id}
                                                className='border border-gray-200 px-2 py-2 text-center font-bold text-orange-600 text-xs'>
                                                {match ? match.periodFree || match.PeriodFree || '' : ''}
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
                            <th className='border border-purple-800 px-4 py-3 text-center font-bold'>SL. NO.</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>ABBREVIATION</th>
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>EMP. CODE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
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
                            <th className='border border-purple-800 px-2 py-3 text-left font-bold'>STAFF NAME</th>
                            <th className='border border-purple-800 px-1 py-3 text-left font-bold'>ABBR</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-1 py-3 text-center font-bold uppercase'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map((staff: any, idx: number) => (
                            <tr key={staff.hrmE_Id} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                <td className='whitespace-nowrap border border-gray-200 px-2 py-2 font-semibold'>{staff.empName}</td>
                                <td className='border border-gray-200 px-1 py-2'>{staff.ttmsaB_Abbreviation}</td>
                                {periods.map((prd: any) => {
                                    const matches = reportData.filter(
                                        (tt: any) =>
                                            (tt.hrmE_Id || tt.HRME_Id) === staff.hrmE_Id && (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                                    );

                                    const details = matches
                                        .map((tt: any) => {
                                            const minId = tt.minid ?? tt.MINID ?? 0;
                                            const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                            const pcount = maxId - minId + 1;
                                            const minDay = tt.minDay ?? tt.MinDay ?? '';
                                            const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                            const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;

                                            const className = tt.asmcL_ClassName ?? tt.ASMCL_ClassName ?? '';
                                            const sectionName = tt.asmC_SectionName ?? tt.ASMC_SectionName ?? '';
                                            const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';

                                            return `${className}::${sectionName}::${subName}::${dayRange}::${pcount}`;
                                        })
                                        .join(' && ');

                                    return (
                                        <td
                                            key={prd.ttmP_Id}
                                            className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
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
                            <th className='border border-purple-800 px-2 py-3 text-left font-bold'>CLASS/SECTION</th>
                            {periods.map((prd: any) => (
                                <th key={prd.ttmP_Id} className='border border-purple-800 px-1 py-3 text-center font-bold uppercase'>
                                    {prd.ttmP_PeriodName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {classSections.map((cs: any, idx: number) => (
                            <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                <td className='border border-gray-200 px-1 py-2 text-center'>{idx + 1}</td>
                                <td className='whitespace-nowrap border border-gray-200 px-2 py-2 font-semibold'>
                                    {cs.asmcL_ClassName} : {cs.asmC_SectionName}
                                </td>
                                {periods.map((prd: any) => {
                                    const matches = reportData.filter(
                                        (tt: any) =>
                                            (tt.asmcL_Id || tt.ASMCL_Id) === cs.asmcL_Id &&
                                            (tt.asmS_Id || tt.ASMS_Id) === cs.asmS_Id &&
                                            (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id
                                    );

                                    const details = matches
                                        .map((tt: any) => {
                                            const minId = tt.minid ?? tt.MINID ?? 0;
                                            const maxId = tt.maxid ?? tt.MAXID ?? 0;
                                            const pcount = maxId - minId + 1;
                                            const minDay = tt.minDay ?? tt.MinDay ?? '';
                                            const maxDay = tt.maxDay ?? tt.MaxDay ?? '';
                                            const dayRange = minId === maxId ? minDay : `${minDay}-${maxDay}`;

                                            const empName = tt.empName ?? tt.EmpName ?? tt.ename ?? tt.ENAME ?? '';
                                            const subName = tt.ismS_SubjectName ?? tt.ISMS_SubjectName ?? '';

                                            return `${empName}::${subName}::${dayRange}::${pcount}`;
                                        })
                                        .join(' && ');

                                    return (
                                        <td
                                            key={prd.ttmP_Id}
                                            className='border border-gray-200 px-1 py-2 text-center text-[9px] leading-tight'>
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
                            <th className='border border-purple-800 px-4 py-3 text-left font-bold'>SUBJECT</th>
                            <th className='border border-purple-800 px-4 py-3 font-bold uppercase'>PERIODS COUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((row: any, idx: number) => {
                            const count = Number(row.pcount || row.PCOUNT || 0);
                            totalCount += count;
                            return (
                                <tr key={idx} className='transition-colors hover:bg-purple-50'>
                                    <td className='border border-gray-200 px-4 py-2 font-medium'>{row.ename || row.ENAME || ''}</td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>
                                        {row.asmcL_ClassName || row.ASMCL_ClassName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2 text-center'>
                                        {row.asmC_SectionName || row.ASMC_SectionName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2'>
                                        {row.ismS_SubjectName || row.ISMS_SubjectName || ''}
                                    </td>
                                    <td className='border border-gray-200 px-4 py-2 text-center font-bold text-purple-700'>{count}</td>
                                </tr>
                            );
                        })}
                        <tr className='bg-purple-50 font-bold'>
                            <td colSpan={4} className='border border-gray-200 px-4 py-3 text-right text-purple-900'>
                                TOTAL:
                            </td>
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
                            <th rowSpan={2} className='sticky left-0 z-10 border border-purple-900 bg-purple-800 px-2 py-3 font-bold'>
                                ROOM NAME
                            </th>
                            {days.map((day: any) => (
                                <th
                                    key={day.ttmD_Id}
                                    colSpan={periods.length}
                                    className='border border-purple-900 border-b-purple-400 px-2 py-2 text-center font-bold uppercase'>
                                    {day.ttmD_DayName}
                                </th>
                            ))}
                        </tr>
                        <tr className='bg-purple-700 text-white'>
                            {days.map((day: any) =>
                                periods.map((prd: any) => (
                                    <th
                                        key={`${day.ttmD_Id}-${prd.ttmP_Id}`}
                                        className='min-w-[80px] border border-purple-800 px-1 py-2 text-center font-bold uppercase'>
                                        {prd.ttmP_PeriodName}
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {roomList.map((room: any) => (
                            <tr key={room.ttmrM_Id} className='transition-colors hover:bg-purple-50'>
                                <td className='sticky left-0 z-10 border border-gray-200 bg-gray-50 px-2 py-2 font-semibold'>
                                    {room.ttmrM_RoomName}
                                </td>
                                {days.map((day: any) =>
                                    periods.map((prd: any) => {
                                        // Check for Break
                                        const isBreak = breakList.find(
                                            (brk: any) =>
                                                Number(prd.ttmP_PeriodName) === brk.ttmB_AfterPeriod && brk.ttmD_Id === day.ttmD_Id
                                        );

                                        if (isBreak) {
                                            return (
                                                <td
                                                    key={`${day.ttmD_Id}-${prd.ttmP_Id}`}
                                                    className='border border-gray-200 bg-yellow-50 px-1 py-1 text-center font-bold text-[8px] text-red-600'>
                                                    {isBreak.ttmB_BreakName || 'BREAK'}
                                                </td>
                                            );
                                        }

                                        const match = reportData.find(
                                            (tt: any) =>
                                                (tt.ttmP_Id || tt.TTMP_Id) === prd.ttmP_Id &&
                                                (tt.ttmD_Id || tt.TTMD_Id) === day.ttmD_Id &&
                                                (tt.ttmrM_Id || tt.TTMRM_Id) === room.ttmrM_Id
                                        );

                                        return (
                                            <td
                                                key={`${day.ttmD_Id}-${prd.ttmP_Id}`}
                                                className='border border-gray-200 px-1 py-1 text-center leading-tight'>
                                                {match ? match.staffSubject || match.StaffSubject || '' : ''}
                                            </td>
                                        );
                                    })
                                )}
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
            case 'ST':
                return renderStaffWiseDetails();
            case 'STD':
                return renderStaffDayWise();
            case 'CSUB':
                return renderClassSubject();
            case 'STSUB':
                return renderStaffSubject();
            case 'SPW':
                return renderStaffPeriodMatrix();
            case 'STFP':
                return renderStaffFreePeriod();
            case 'PSTF':
                return renderPeriodWiseStaffFree();
            case 'SPC':
                return renderStaffPeriodConsolidated();
            case 'CSPC':
                return renderClassSectionPeriodConsolidated();
            case 'ATG':
                return renderStaffWorkloadAfterGeneration();
            case 'RMR':
                return renderRoomWiseReport();
            default:
                return renderDefaultTable();
        }
    };

    return (
        <div className='space-y-6'>
            {/* Action Bar (Print / Export Excel) - hidden during print */}
            <div className='no-print flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm rounded-lg'>
                <div className='flex items-center gap-2'>
                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                    <span className='h-2 w-2 rounded-full bg-purple-600'></span>
                    <h2 className='font-semibold text-gray-700 text-sm uppercase tracking-wider'>
                        {reportTitle} View
                    </h2>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        onClick={onPrint}
                        size='sm'
                        className='bg-purple-600 shadow-md transition-all hover:bg-purple-700 active:scale-95'>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                    <Button
                        onClick={exportToExcel}
                        size='sm'
                        variant='outline'
                        className='gap-2 border-green-600 text-green-700 shadow-sm transition-all hover:bg-green-50 hover:text-green-800'>
                        <Download className='h-4 w-4' /> Export Excel
                    </Button>
                </div>
            </div>

            {/* School Header Logo (Printed & Screen View) */}
            <div className='school-header-section mb-4 text-center'>
                {resolvedLogo ? (
                    <div className='mb-3 flex justify-center'>
                        <img
                            src={resolvedLogo}
                            alt='School Logo'
                            className='max-h-24 w-auto max-w-full object-contain'
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                            }}
                        />
                    </div>
                ) : null}

                {/* Report Title & Metadata Banner */}
                <h1 className='text-base md:text-lg font-bold uppercase text-purple-900 tracking-wider'>
                    {reportTitle}
                </h1>
                <div className='mt-1 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-gray-600 font-medium'>
                    <span>{academicYear ? `Academic Year: ${academicYear}` : ''}</span>
                    <span>Generated on: {new Date().toLocaleString()}</span>
                </div>
            </div>

            {renderTable()}
            <div className='flex items-center justify-between px-2 font-medium text-gray-500 text-xs italic'>
                <p>* This is a generated consolidated report summary.</p>
                <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
        </div>
    );
}
