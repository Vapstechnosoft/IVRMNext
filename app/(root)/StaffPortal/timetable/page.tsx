'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEmployeeDailyTimetable, useEmployeeTimetable } from '@/hooks/staff-portal/useEmployeeTimetable';
import { useStaffDashboard } from '@/hooks/staff-portal/useStaffDashboard';
import { ArrowLeft, Calendar, Clock, PieChart as PieChartIcon, Printer, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#6366f1'];

export default function EmployeeTimetablePage() {
    const [mode, setMode] = useState<'daily' | 'weekly'>('daily');
    const [selectedDayId, setSelectedDayId] = useState<string>('');
    const printRef = useRef<HTMLDivElement>(null);

    const { data: timetableData, isLoading: isLoadingInitial, refetch: refetchTimetable } = useEmployeeTimetable();
    const { data: dashboardData } = useStaffDashboard();

    const dayIdNumber = selectedDayId ? Number(selectedDayId) : null;
    const { data: dailyData, isLoading: isLoadingDaily, refetch: refetchDaily } = useEmployeeDailyTimetable(dayIdNumber);

    // Merge or fallback to dashboard data if initial endpoint did not return allperiods
    const allPeriods = useMemo(() => {
        return timetableData?.allperiods || dashboardData?.allperiods || [];
    }, [timetableData?.allperiods, dashboardData?.allperiods]);

    const periodsList = useMemo(() => {
        return timetableData?.periods || [];
    }, [timetableData?.periods]);

    const classSectionAllocations = useMemo(() => {
        return timetableData?.class_sectons || timetableData?.class_sections || [];
    }, [timetableData?.class_sectons, timetableData?.class_sections]);

    const ttFinalGeneration = useMemo(() => {
        return timetableData?.tT_final_generation || dashboardData?.tT_final_generation || [];
    }, [timetableData?.tT_final_generation, dashboardData?.tT_final_generation]);

    // Set default selected day when allPeriods loads
    useEffect(() => {
        if (!selectedDayId && allPeriods.length > 0) {
            const preselected = allPeriods.find((d: any) => d.Selected === true);
            const defaultId = preselected ? String(preselected) : String(allPeriods[0]);
            setSelectedDayId(defaultId);
        }
    }, [allPeriods, selectedDayId]);

    const handleModeChange = (newMode: 'daily' | 'weekly') => {
        if (newMode === 'weekly') {
            if (!periodsList || periodsList.length === 0) {
                toast.info('No Weekly Records Found');
            }
        }
        setMode(newMode);
    };

    // Weekly Chart Data: Day Name vs Period Count
    const weeklyChartData = useMemo(() => {
        if (!allPeriods || allPeriods.length === 0) return [];
        const result: { name: string; value: number }[] = [];

        allPeriods.forEach((day: any) => {
            const dayName = day.ttmD_DayName;
            // Match with ttFinalGeneration
            const match = ttFinalGeneration.find((item: any) => (item.dayName || item.DayName) === dayName);
            const count = match ? Number(match.periodCount ) : 0;
            if (count > 0) {
                result.push({ name: dayName, value: count });
            }
        });

        // If no matching counts from ttFinalGeneration, compute from classSectionAllocations
        if (result.length === 0 && classSectionAllocations.length > 0) {
            allPeriods.forEach((day: any) => {
                const dayName = day.ttmD_DayName;
                const count = classSectionAllocations.filter((alloc: any) => alloc.p_Days === dayName).length;
                if (count > 0) {
                    result.push({ name: dayName, value: count });
                }
            });
        }

        return result;
    }, [allPeriods, ttFinalGeneration, classSectionAllocations]);

    // Daily Table Items
    const dailyItems = useMemo(() => {
        return dailyData?.class_sectons || dailyData?.class_sections || [];
    }, [dailyData]);

    // Daily Chart Data: Class-Section vs Period Count
    const dailyChartData = useMemo(() => {
        if (!dailyItems || dailyItems.length === 0) return [];

        const map = new Map<string, number>();
        dailyItems.forEach((item: any) => {
            const cls = item.asmcL_ClassName || '';
            const sec = item.asmC_SectionName || '';
            const label = sec ? `${cls}-${sec}` : cls || 'Period';
            const current = map.get(label) || 0;
            map.set(label, current + 1);
        });

        return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    }, [dailyItems]);

    // Handle Printing
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Staff_Timetable_${mode === 'daily' ? 'Daily' : 'Weekly'}`,
        pageStyle: `
            @page {
                size: landscape;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .no-print {
                    display: none !important;
                }
            }
        `
    });

    const selectedDayObj = allPeriods.find((d: any) => String(d.ttmD_Id) === selectedDayId);
    const selectedDayName = selectedDayObj?.ttmD_DayName || '';

    return (
        <div className='container mx-auto space-y-6 p-4 md:p-6'>
            {/* Header & Breadcrumb */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                        <Link href='/StaffPortal/staff-dashboard'>
                            <Button variant='ghost' size='sm' className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'>
                                <ArrowLeft className='h-4 w-4' />
                            </Button>
                        </Link>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Employee Time Table</h1>
                    </div>
                    <p className='pl-10 text-muted-foreground text-sm'>
                        View your daily and weekly scheduled class periods and allocations.
                    </p>
                </div>
                <div className='flex items-center gap-2 pl-10 sm:pl-0'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            refetchTimetable();
                            if (selectedDayId) refetchDaily();
                        }}
                        className='gap-2 shadow-sm'>
                        <RefreshCw className='h-4 w-4' /> Refresh
                    </Button>
                    <Button
                        variant='default'
                        size='sm'
                        onClick={() => handlePrint()}
                        className='gap-2 bg-purple-600 shadow-sm hover:bg-purple-700'>
                        <Printer className='h-4 w-4' /> Print Timetable
                    </Button>
                </div>
            </div>

            {/* Selection Controls Card */}
            <Card className='border-slate-200 shadow-sm'>
                <CardHeader className='border-b bg-slate-50/50 pb-4'>
                    <CardTitle className='font-semibold text-base text-slate-800'>Time Table Options</CardTitle>
                    <CardDescription>Select between Daily or Weekly schedule view.</CardDescription>
                </CardHeader>
                <CardContent className='pt-6'>
                    <div className='flex flex-col items-center justify-center gap-6'>
                        {/* Radio buttons for Daily vs Weekly */}
                        <RadioGroup
                            value={mode}
                            onValueChange={(val) => handleModeChange(val as 'daily' | 'weekly')}
                            className='flex flex-row items-center gap-8 rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-inner'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='daily' id='daily' className='text-purple-600' />
                                <Label htmlFor='daily' className='cursor-pointer font-medium text-slate-700 text-sm'>
                                    Daily TimeTable
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='weekly' id='weekly' className='text-purple-600' />
                                <Label htmlFor='weekly' className='cursor-pointer font-medium text-slate-700 text-sm'>
                                    Weekly TimeTable
                                </Label>
                            </div>
                        </RadioGroup>

                        {/* Day selector for Daily view */}
                        {mode === 'daily' && (
                            <div className='flex w-full max-w-md items-center gap-3'>
                                <Label className='whitespace-nowrap font-medium text-slate-700 text-sm'>
                                    Select Day: <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={selectedDayId} onValueChange={(val) => setSelectedDayId(val)}>
                                    <SelectTrigger className='w-full bg-white'>
                                        <SelectValue placeholder='--Select Day--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allPeriods.map((day: any) => (
                                            <SelectItem key={day.ttmD_Id} value={String(day.ttmD_Id)}>
                                                {day.ttmD_DayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Printable Container */}
            <div ref={printRef} className='space-y-6'>
                {/* 1. WEEKLY VIEW */}
                {mode === 'weekly' && (
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* Weekly Timetable Matrix */}
                        <div className='lg:col-span-8'>
                            <Card className='h-full border-slate-200 shadow-sm'>
                                <CardHeader className='border-b bg-slate-50/60 pb-3'>
                                    <div className='flex items-center gap-2'>
                                        <Calendar className='h-4 w-4 text-purple-600' />
                                        <CardTitle className='font-semibold text-base text-slate-800'>Weekly Timetable View</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    {isLoadingInitial ? (
                                        <div className='space-y-3 p-6'>
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <Skeleton key={i} className='h-12 w-full rounded-md' />
                                            ))}
                                        </div>
                                    ) : allPeriods.length === 0 ? (
                                        <div className='py-12 text-center text-muted-foreground text-sm'>
                                            No weekly timetable records available.
                                        </div>
                                    ) : (
                                        <div className='overflow-x-auto'>
                                            <Table className='min-w-[650px] border-collapse'>
                                                <TableHeader className='bg-slate-100/80'>
                                                    <TableRow>
                                                        <TableHead className='w-16 border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            SL.NO
                                                        </TableHead>
                                                        <TableHead className='w-32 border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            Day
                                                        </TableHead>
                                                        {periodsList.map((period: any) => (
                                                            <TableHead
                                                                key={period.ttmP_Id || period.ttmP_PeriodName}
                                                                className='border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                                {period.ttmP_PeriodName}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allPeriods.map((day: any, idx: number) => (
                                                        <TableRow key={day.ttmD_Id || idx} className='transition-colors hover:bg-slate-50'>
                                                            <TableCell className='border-r text-center font-medium text-slate-600 text-xs'>
                                                                {idx + 1}
                                                            </TableCell>
                                                            <TableCell className='border-r bg-slate-50/40 text-center font-semibold text-slate-800 text-xs'>
                                                                {day.ttmD_DayName}
                                                            </TableCell>
                                                            {periodsList.map((period: any) => {
                                                                const matches = classSectionAllocations.filter((item: any) => {
                                                                    const periodName = period.ttmP_PeriodName;
                                                                    const itemPeriod = item.period || item.Period;
                                                                    const itemDay = item.p_Days || item.P_Days || item.dayName;
                                                                    return (
                                                                        String(itemPeriod).trim() === String(periodName).trim() &&
                                                                        String(itemDay).trim().toLowerCase() ===
                                                                            String(day.ttmD_DayName).trim().toLowerCase()
                                                                    );
                                                                });

                                                                return (
                                                                    <TableCell
                                                                        key={period.ttmP_Id || period.ttmP_PeriodName}
                                                                        className='min-w-[130px] border-r p-2 text-center align-middle text-xs'>
                                                                        {matches.length > 0 ? (
                                                                            <div className='flex flex-col gap-1.5'>
                                                                                {matches.map((m: any, mIdx: number) => {
                                                                                    const cls = m.asmcL_ClassName || '';
                                                                                    const sec = m.asmC_SectionName || '';
                                                                                    const sub = m.ismS_SubjectName || '';
                                                                                    return (
                                                                                        <div
                                                                                            key={mIdx}
                                                                                            className='rounded-md border border-purple-200 bg-purple-50/60 p-1.5 shadow-sm'>
                                                                                            <span className='block font-bold text-[11px] text-purple-900'>
                                                                                                {cls}
                                                                                                {sec ? `-${sec}` : ''}
                                                                                            </span>
                                                                                            {sub && (
                                                                                                <span className='block font-medium text-[10px] text-slate-600'>
                                                                                                    {sub}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        ) : (
                                                                            <span className='font-light text-slate-300'>-</span>
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Weekly Chart */}
                        <div className='lg:col-span-4'>
                            <Card className='h-full border-slate-200 shadow-sm'>
                                <CardHeader className='border-b bg-slate-50/60 pb-3'>
                                    <div className='flex items-center gap-2'>
                                        <PieChartIcon className='h-4 w-4 text-purple-600' />
                                        <CardTitle className='font-semibold text-base text-slate-800'>Weekly Chart</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className='flex flex-col items-center justify-center p-4'>
                                    {weeklyChartData.length > 0 ? (
                                        <div className='h-[280px] w-full'>
                                            <ResponsiveContainer width='100%' height='100%'>
                                                <PieChart>
                                                    <Pie
                                                        data={weeklyChartData}
                                                        dataKey='value'
                                                        nameKey='name'
                                                        cx='50%'
                                                        cy='50%'
                                                        outerRadius={85}
                                                        innerRadius={30}
                                                        paddingAngle={3}
                                                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                                                        {weeklyChartData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: any, name: any) => [`${value} Sessions`, name]} />
                                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className='py-16 text-center text-muted-foreground text-sm'>No chart data available.</div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 2. DAILY VIEW */}
                {mode === 'daily' && (
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
                        {/* Daily Chart */}
                        <div className='lg:col-span-4'>
                            <Card className='h-full border-slate-200 shadow-sm'>
                                <CardHeader className='border-b bg-slate-50/60 pb-3'>
                                    <div className='flex items-center gap-2'>
                                        <PieChartIcon className='h-4 w-4 text-purple-600' />
                                        <CardTitle className='font-semibold text-base text-slate-800'>Daily Chart</CardTitle>
                                    </div>
                                    <CardDescription>
                                        {selectedDayName ? `${selectedDayName} Period Distribution` : 'Distribution for selected day'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='flex flex-col items-center justify-center p-4'>
                                    {dailyChartData.length > 0 ? (
                                        <div className='h-[280px] w-full'>
                                            <ResponsiveContainer width='100%' height='100%'>
                                                <PieChart>
                                                    <Pie
                                                        data={dailyChartData}
                                                        dataKey='value'
                                                        nameKey='name'
                                                        cx='50%'
                                                        cy='50%'
                                                        outerRadius={85}
                                                        innerRadius={30}
                                                        paddingAngle={3}
                                                        label={({ name, value }) => `${name} (${value})`}>
                                                        {dailyChartData.map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value: any, name: any) => [`${value} Periods`, name]} />
                                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className='py-16 text-center text-muted-foreground text-sm'>
                                            {isLoadingDaily ? 'Loading daily chart...' : 'No periods assigned for this day.'}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Daily Timetable Table */}
                        <div className='lg:col-span-8'>
                            <Card className='h-full border-slate-200 shadow-sm'>
                                <CardHeader className='border-b bg-slate-50/60 pb-3'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <Clock className='h-4 w-4 text-purple-600' />
                                            <CardTitle className='font-semibold text-base text-slate-800'>
                                                Daily Time Table {selectedDayName ? `(${selectedDayName})` : ''}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    {isLoadingDaily ? (
                                        <div className='space-y-3 p-6'>
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Skeleton key={i} className='h-10 w-full rounded-md' />
                                            ))}
                                        </div>
                                    ) : dailyItems.length === 0 ? (
                                        <div className='py-16 text-center text-muted-foreground text-sm'>
                                            No periods found for {selectedDayName || 'the selected day'}.
                                        </div>
                                    ) : (
                                        <div className='overflow-x-auto'>
                                            <Table className='border-collapse'>
                                                <TableHeader className='bg-slate-100/80'>
                                                    <TableRow>
                                                        <TableHead className='w-16 border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            SL.NO
                                                        </TableHead>
                                                        <TableHead className='border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            Time-Period
                                                        </TableHead>
                                                        <TableHead className='border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            Period
                                                        </TableHead>
                                                        <TableHead className='border-r text-center font-bold text-slate-700 text-xs uppercase'>
                                                            Class - Section
                                                        </TableHead>
                                                        {dailyItems.some((item: any) => item.ismS_SubjectName) && (
                                                            <TableHead className='text-center font-bold text-slate-700 text-xs uppercase'>
                                                                Subject
                                                            </TableHead>
                                                        )}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {dailyItems.map((item: any, idx: number) => {
                                                        const cls = item.asmcL_ClassName || '';
                                                        const sec = item.asmC_SectionName || '';
                                                        const classSectionStr = sec ? `${cls} - ${sec}` : cls || '-';
                                                        const timePeriod =
                                                            item.ttmdpT_StartTime && item.ttmdpT_EndTime
                                                                ? `${item.ttmdpT_StartTime} - ${item.ttmdpT_EndTime}`
                                                                : item.ttmdpT_StartTime || item.ttmdpT_EndTime || '-';

                                                        return (
                                                            <TableRow key={idx} className='transition-colors hover:bg-slate-50'>
                                                                <TableCell className='border-r text-center font-medium text-slate-600 text-xs'>
                                                                    {idx + 1}
                                                                </TableCell>
                                                                <TableCell className='border-r text-center font-semibold text-purple-900 text-xs'>
                                                                    {timePeriod}
                                                                </TableCell>
                                                                <TableCell className='border-r text-center font-medium text-slate-800 text-xs'>
                                                                    {item.period || '-'}
                                                                </TableCell>
                                                                <TableCell className='border-r text-center font-semibold text-slate-800 text-xs'>
                                                                    {classSectionStr}
                                                                </TableCell>
                                                                {dailyItems.some((d: any) => d.ismS_SubjectName) && (
                                                                    <TableCell className='text-center font-medium text-slate-600 text-xs'>
                                                                        {item.ismS_SubjectName || '-'}
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
