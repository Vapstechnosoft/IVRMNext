'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarDays, Clock, UserCheck } from 'lucide-react';
import React from 'react';

export default function DeputationReport({ data, popupData }: { data?: any; popupData?: any }) {
    if (!data && !popupData) return null;

    const dataObj = data?.data !== undefined ? data.data : data;
    const popupDataObj = popupData?.data !== undefined ? popupData.data : popupData;

    const periodsList =
        dataObj?.periodslst ||
        dataObj?.gridweeks ||
        dataObj?.absentStaffTimeTable ||
        dataObj?.period_list ||
        dataObj?.time_Table ||
        (Array.isArray(dataObj) ? dataObj : []);

    const recordsList =
        popupDataObj?.vlist ||
        popupDataObj?.absentDetails ||
        popupDataObj?.staffList ||
        popupDataObj?.stafflist ||
        popupDataObj?.dpcount ||
        popupDataObj?.absentstfcnt ||
        popupDataObj?.weeklycntlist ||
        (Array.isArray(popupDataObj) ? popupDataObj : []);

    return (
        <div className='space-y-6'>
            {/* ABSENT STAFF PERIOD SCHEDULE */}
            {periodsList && periodsList.length > 0 && (
                <CollapsibleSection title='Absent Staff Period Schedule' defaultOpen className='overflow-hidden rounded-xl border-none shadow-md'>
                    <div className='relative border border-indigo-100 bg-white rounded-xl overflow-hidden'>
                        <div className='flex items-center gap-2 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 px-4 py-3'>
                            <Clock className='h-4 w-4 text-white' />
                            <span className='font-bold text-white text-xs uppercase tracking-wider'>Periods Requiring Replacement</span>
                        </div>

                        <Table>
                            <TableHeader className='bg-indigo-50/60'>
                                <TableRow>
                                    <TableHead className='font-bold text-indigo-900'>Period</TableHead>
                                    <TableHead className='font-bold text-indigo-900'>Class / Section</TableHead>
                                    <TableHead className='font-bold text-indigo-900'>Subject</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {periodsList.map((r: any, i: number) => {
                                    const periodName = r.ttmP_PeriodName || r.period || `Period ${i + 1}`;
                                    const className = r.asmcL_ClassName || r.className || '--';
                                    const sectionName = r.asmS_SectionName || r.sectionName || '--';
                                    const subjectName = r.ismS_SubjectName || r.subjectName || r.classSubject || '--';

                                    return (
                                        <TableRow key={i} className='hover:bg-indigo-50/30 transition-colors'>
                                            <TableCell className='font-bold text-indigo-700'>
                                                <span className='inline-flex h-6 px-2.5 items-center justify-center rounded bg-indigo-100 text-xs text-indigo-800 font-semibold'>
                                                    {periodName}
                                                </span>
                                            </TableCell>
                                            <TableCell className='font-semibold text-slate-700'>
                                                {className} {sectionName !== '--' ? `- ${sectionName}` : ''}
                                            </TableCell>
                                            <TableCell className='font-medium text-slate-600'>{subjectName}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CollapsibleSection>
            )}

            {/* STAFF ABSENCE STATISTICS & RECORDS POPUP DATA */}
            {recordsList && recordsList.length > 0 && (
                <CollapsibleSection
                    title='Staff Absence Statistics & Deputation Summary'
                    defaultOpen
                    className='overflow-hidden rounded-xl border-none shadow-md'>
                    <div className='relative border border-orange-100 bg-white rounded-xl overflow-hidden'>
                        <div className='flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-3'>
                            <CalendarDays className='h-4 w-4 text-white' />
                            <span className='font-bold text-white text-xs uppercase tracking-wider'>Staff Absence & Deputation History</span>
                        </div>

                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader className='bg-orange-50/60'>
                                    <TableRow>
                                        <TableHead className='font-bold text-orange-900 text-xs uppercase'>Staff Name</TableHead>
                                        <TableHead className='font-bold text-orange-900 text-xs uppercase'>Date / Period</TableHead>
                                        <TableHead className='text-center font-bold text-orange-900 text-xs uppercase'>Weekly Count</TableHead>
                                        <TableHead className='text-center font-bold text-orange-900 text-xs uppercase'>Monthly Count</TableHead>
                                        <TableHead className='text-center font-bold text-orange-900 text-xs uppercase'>Yearly Count</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recordsList.map((r: any, i: number) => (
                                        <TableRow key={i} className='border-orange-50 transition-colors hover:bg-orange-50/30'>
                                            <TableCell className='font-bold text-slate-800'>
                                                <div className='flex items-center gap-2'>
                                                    <UserCheck className='h-3.5 w-3.5 text-orange-500' />
                                                    {r.staffName || r.hrmE_EmployeeFirstName || `Staff #${r.hrmE_Id || i + 1}`}
                                                </div>
                                            </TableCell>
                                            <TableCell className='font-medium text-slate-600'>
                                                {r.absentOn || r.ttsD_Date || r.date || '--'}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <span className='inline-flex h-6 w-8 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-700'>
                                                    {r.weeklyCount ?? r.weekly_count ?? 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <span className='inline-flex h-6 w-8 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-700'>
                                                    {r.monthlyCount ?? r.monthly_count ?? 0}
                                                </span>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <span className='inline-flex h-6 w-8 items-center justify-center rounded-full bg-orange-100 font-bold text-xs text-orange-700'>
                                                    {r.yearlyCount ?? r.yearly_count ?? 0}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}

