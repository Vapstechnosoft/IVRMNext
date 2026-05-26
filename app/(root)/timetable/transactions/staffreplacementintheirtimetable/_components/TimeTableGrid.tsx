'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import {
    useSaveStaffReplacementInTheirTimetable,
    useStaffReplacementInTheirTimetablePossiblePeriods,
    useStaffReplacementInTheirTimetableReport
} from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import type { Day, Period, TimeTableItem } from '@/types/timetable/Transaction/staffreplacementintheirtimetable';
import { ArrowRightLeft, Loader2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface TimeTableGridProps {
    params: {
        hrmE_Id: string;
    };
}

export default function TimeTableGrid({ params }: TimeTableGridProps) {
    const { hrmE_Id } = params;

    const { data: reportData, isLoading: isReportLoading } = useStaffReplacementInTheirTimetableReport({ hrmE_Id });
    // console.log('Report Data', JSON.stringify(reportData));
    const { mutate: getPossible, data: possibleData, isPending: isPossibleLoading } = useStaffReplacementInTheirTimetablePossiblePeriods();
    console.log('Possible Data', JSON.stringify(possibleData));

    const { mutate: saveReplacement, isPending: isSaving } = useSaveStaffReplacementInTheirTimetable();

    const [selection1, setSelection1] = useState<any>(null);
    const [selection2, setSelection2] = useState<any>(null);

    const [staffSDK, setStaffSDK] = useState(0);
    const [subSDK, setSubSDK] = useState(0);
    const [conSDK, setConSDK] = useState(0);

    // Reset selections and settings when hrmE_Id changes
    useEffect(() => {
        setSelection1(null);
        setSelection2(null);
        setStaffSDK(0);
        setSubSDK(0);
        setConSDK(0);
    }, [hrmE_Id]);

    const periodList: Period[] = (reportData as any)?.periodslst || [];
    const dayList: Day[] = (reportData as any)?.gridweeks || [];
    const ttList: TimeTableItem[] = (reportData as any)?.time_Table || [];

    // Construct the table grid similar to the AngularJS logic
    const tableGrid = useMemo(() => {
        if (!dayList.length || !periodList.length) return [];

        // Check if the current API response indicates a UDC Period selection
        const firstPossible = possibleData?.data_lst?.[0];
        const isUDCDetected = firstPossible && (Number(firstPossible.ttmP_Id) === 0 || Number(firstPossible.ttmD_Id) === 0);

        return dayList.map((day) => {
            return periodList.map((period) => {
                const matches = ttList.filter((item) => item.ttmP_Id === period.ttmP_Id && item.ttmD_Id === day.ttmD_Id);

                let value = '';
                let value1 = '';
                if (matches.length > 0) {
                    value = matches.map((m) => `${m.asmcL_ClassName} :${m.asmC_SectionName} :${m.ismS_SubjectName}`).join(' && ');
                    value1 = matches.map((m) => `${m.staffName} :${m.ismS_SubjectName}`).join(' && ');
                }

                // Check if this cell is one of the possible periods from API
                let background = '';
                let color = 'black';
                let isPossible = false;

                // Color mapping (Green) ONLY if NOT a UDC Period selection and selection1 exists
                if (selection1 && !isUDCDetected) {
                    isPossible = !!possibleData?.data_lst?.some(
                        (p: any) => Number(p.ttmP_Id) === Number(period.ttmP_Id) && Number(p.ttmD_Id) === Number(day.ttmD_Id)
                    );

                    if (isPossible) {
                        background = '#ccffcc'; // Light Green
                        color = '#006600'; // Dark Green
                    }
                }

                if (selection1?.dayid === day.ttmD_Id && selection1?.pedid === period.ttmP_Id) {
                    background = '#ffcccc'; // Light Red
                    color = '#990000'; // Dark Red
                }

                if (selection2?.dayid === day.ttmD_Id && selection2?.pedid === period.ttmP_Id) {
                    background = '#ffe5b4'; // Peach/Light Orange
                    color = '#cc7a00'; // Dark Orange
                }

                return {
                    dayid: day.ttmD_Id,
                    dayname: day.ttmD_DayName,
                    pedid: period.ttmP_Id,
                    pedname: period.ttmP_PeriodName,
                    value: value || ' ',
                    value1: value1,
                    background,
                    color,
                    isPossible
                };
            });
        });
        // }, [dayList, periodList, ttList, possibleData, selection1, selection2]);
    }, [dayList, periodList, ttList, possibleData?.data_lst, selection1, selection2]);

    // Re-fetch possible periods when checkboxes change and we have a selection1
    useEffect(() => {
        if (selection1) {
            getPossible({
                ttmD_Id: selection1.dayid,
                ttmP_Id: selection1.pedid,
                hrmE_Id: hrmE_Id,
                staffSDK,
                subSDK,
                conSDK
            });
        }
    }, [staffSDK, subSDK, conSDK, hrmE_Id]); // Only trigger on settings change, selection1 change is handled in toggleSelection

    const toggleSelection = (cell: any) => {
        if (!selection1) {
            // SELECTING SOURCE (FROM)
            setSelection1(cell);
            getPossible(
                {
                    ttmD_Id: cell.dayid,
                    ttmP_Id: cell.pedid,
                    hrmE_Id: hrmE_Id,
                    staffSDK,
                    subSDK,
                    conSDK
                },
                {
                    onSuccess: (data) => {
                        const firstItem = data?.data_lst?.[0];
                        if (firstItem && (Number(firstItem.ttmP_Id) === 0 || Number(firstItem.ttmD_Id) === 0)) {
                            // SWAL equivalent popup for UDC
                            toast.error('You selected UDC Period!', {
                                description: 'Please Select Another Period, UDC Periods Cannot Replace !!',
                                duration: 5000
                            });
                            setSelection1(null);
                            setSelection2(null);
                        }
                    }
                }
            );
        } else if (selection1.dayid === cell.dayid && selection1.pedid === cell.pedid) {
            // TOGGLE OFF
            setSelection1(null);
            setSelection2(null);
        } else if (!selection2) {
            // SELECTING TARGET (TO)
            if (cell.isPossible) {
                if (selection1.dayid === cell.dayid && selection1.pedid === cell.pedid) {
                    toast.warning('Same day and same period selected!');
                } else {
                    setSelection2(cell);
                }
            } else {
                toast.warning('Please Select Replace possibility Period!');
            }
        } else if (selection2.dayid === cell.dayid && selection2.pedid === cell.pedid) {
            // TOGGLE OFF SECOND
            setSelection2(null);
        } else {
            // RESET AND SELECT NEW SOURCE
            setSelection1(cell);
            setSelection2(null);
            getPossible(
                {
                    ttmD_Id: cell.dayid,
                    ttmP_Id: cell.pedid,
                    hrmE_Id: hrmE_Id,
                    staffSDK,
                    subSDK,
                    conSDK
                },
                {
                    onSuccess: (data) => {
                        const firstItem = data?.data_lst?.[0];
                        if (firstItem && (Number(firstItem.ttmP_Id) === 0 || Number(firstItem.ttmD_Id) === 0)) {
                            toast.error('You selected UDC Period!', {
                                description: 'Please Select Another Period, UDC Periods Cannot Replace !!',
                                duration: 5000
                            });
                            setSelection1(null);
                            setSelection2(null);
                        }
                    }
                }
            );
        }
    };

    const handleClear = () => {
        setSelection1(null);
        setSelection2(null);
        // Resetting possible data isn't directly supported by useMutation's mutate without manual state,
        // but our UI depends on selection1 so it's fine.
    };

    const handleReplace = () => {
        if (selection1 && selection2) {
            saveReplacement(
                {
                    hrmE_Id,
                    ttmD_ID_from: selection1.dayid,
                    ttmP_ID_from: selection1.pedid,
                    ttmD_ID_to: selection2.dayid,
                    ttmP_ID_to: selection2.pedid
                },
                {
                    onSuccess: (data: any) => {
                        if (data.returnval) {
                            toast.success('Replaced Periods successfully!');
                            setSelection1(null);
                            setSelection2(null);
                        } else {
                            toast.error('Selected Periods Not Replaced!');
                        }
                    },
                    onError: () => {
                        toast.error('An error occurred while saving replacement.');
                    }
                }
            );
        } else {
            toast.error('Please select Replacement day & Periods !!!');
        }
    };

    if (isReportLoading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
            </div>
        );
    }

    if (!reportData || !dayList.length) {
        return (
            <div className='rounded-xl border border-purple-100 bg-white p-10 text-center shadow-md'>
                <p className='text-gray-500'>TimeTable is Not Generated For Selected Details !!!!</p>
            </div>
        );
    }

    return (
        <div className='mx-auto max-w-7xl overflow-hidden rounded-xl border border-purple-100 bg-white shadow-md'>
            {/* HEADER */}
            <div className='bg-gradient-to-r from-purple-700 via-purple-600 to-purple-800 px-6 py-4'>
                <h2 className='flex items-center gap-2 font-extrabold text-sm text-white uppercase tracking-widest'>Report Grid View</h2>
            </div>

            <div className='space-y-6 p-6'>
                {/* Distribution Options */}
                <div className='flex flex-wrap gap-6 rounded-lg border border-purple-100 bg-purple-50/50 p-4'>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='staffSDK' checked={staffSDK === 1} onCheckedChange={(checked) => setStaffSDK(checked ? 1 : 0)} />
                        <Label htmlFor='staffSDK' className='cursor-pointer font-semibold text-purple-900 text-xs'>
                            Staff Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='subSDK' checked={subSDK === 1} onCheckedChange={(checked) => setSubSDK(checked ? 1 : 0)} />
                        <Label htmlFor='subSDK' className='cursor-pointer font-semibold text-purple-900 text-xs'>
                            Subject Wise Uniform Distribution
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox id='conSDK' checked={conSDK === 1} onCheckedChange={(checked) => setConSDK(checked ? 1 : 0)} />
                        <Label htmlFor='conSDK' className='cursor-pointer font-semibold text-purple-900 text-xs'>
                            Staff Wise Rest and Continue
                        </Label>
                    </div>
                </div>

                {/* TABLE */}
                <div className='overflow-x-auto rounded-xl border border-purple-100'>
                    <table className='w-full min-w-[1200px] border-collapse text-[11px]'>
                        <thead>
                            <tr className='bg-purple-50'>
                                <th className='sticky left-0 z-10 min-w-[120px] border-purple-100 border-r border-b bg-purple-50 px-4 py-4 text-left font-black text-purple-800 uppercase'>
                                    Day / Period
                                </th>
                                {periodList.map((p) => (
                                    <th
                                        key={p.ttmP_Id}
                                        className='min-w-[100px] border-purple-100 border-r border-b px-2 py-4 text-center font-bold text-purple-700'>
                                        Period {p.ttmP_PeriodName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableGrid.map((row, rIdx) => (
                                <tr key={rIdx} className='border-purple-50 border-b bg-white'>
                                    <td className='sticky left-0 z-10 border-purple-100 border-r bg-white px-4 py-4 font-bold text-purple-900'>
                                        {row[0]?.dayname}
                                    </td>
                                    {row.map((cell, cIdx) => (
                                        <td
                                            key={cIdx}
                                            onClick={() => toggleSelection(cell)}
                                            style={{ backgroundColor: cell.background, color: cell.color }}
                                            className={cn(
                                                'cursor-pointer border-purple-50 border-r px-2 py-4 text-center transition-all hover:bg-purple-50/50',
                                                cell.value1 ? 'font-medium' : ''
                                            )}>
                                            <div className='min-h-[20px]'>{cell.value}</div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* DUAL ACTIONS FOOTER */}
                <div className='slide-in-from-bottom-2 flex animate-in flex-col gap-4 border-t pt-4'>
                    <div className='flex items-center justify-between rounded-lg border border-purple-100 bg-purple-50 p-4 shadow-sm'>
                        <div className='flex flex-1 items-center gap-6'>
                            {/* SLOT 1 */}
                            <div className='flex flex-1 flex-col gap-1'>
                                <span className='font-bold text-[10px] text-gray-400 uppercase tracking-wider'>Replacement From</span>
                                <div
                                    className={cn(
                                        'flex h-10 items-center rounded-md border px-4 font-semibold text-xs shadow-sm transition-all',
                                        selection1
                                            ? 'border-purple-400 bg-white text-purple-900'
                                            : 'border-gray-300 border-dashed bg-gray-100 text-gray-400'
                                    )}>
                                    {selection1 ? (
                                        <>
                                            <span className='mr-2 text-purple-600'>{selection1.dayname} Day</span>
                                            <span className='mr-2 text-gray-300'>&</span>
                                            <span>{selection1.pedname} period</span>
                                        </>
                                    ) : (
                                        'Select first box...'
                                    )}
                                </div>
                            </div>

                            <div className='pt-5 text-gray-400'>
                                <ArrowRightLeft size={20} />
                            </div>

                            {/* SLOT 2 */}
                            <div className='flex flex-1 flex-col gap-1'>
                                <span className='font-bold text-[10px] text-gray-400 uppercase tracking-wider'>Replacement To</span>
                                <div
                                    className={cn(
                                        'flex h-10 items-center rounded-md border px-4 font-semibold text-xs shadow-sm transition-all',
                                        selection2
                                            ? 'border-orange-400 bg-white text-purple-900'
                                            : 'border-gray-300 border-dashed bg-gray-100 text-gray-400'
                                    )}>
                                    {selection2 ? (
                                        <>
                                            <span className='mr-2 text-orange-600'>{selection2.dayname} Day</span>
                                            <span className='mr-2 text-gray-300'>&</span>
                                            <span>{selection2.pedname} period</span>
                                        </>
                                    ) : (
                                        'Select second box...'
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className='ml-4 flex items-center gap-3 pt-5'>
                            <Button variant='ghost' onClick={handleClear} className='h-10 text-purple-600' disabled={isSaving}>
                                <X className='mr-1 h-4 w-4' /> Clear
                            </Button>
                            <Button
                                onClick={handleReplace}
                                disabled={!selection1 || !selection2 || isSaving}
                                className='h-10 bg-orange-500 px-8 font-bold text-white shadow-md hover:bg-orange-600'>
                                {isSaving ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
                                Replace
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

