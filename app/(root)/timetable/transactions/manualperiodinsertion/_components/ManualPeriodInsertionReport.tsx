'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useManualPeriodMasters, useManualPeriodInsertionReport, useSaveManualPeriodInsertion } from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import { Book, Save, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

interface ManualPeriodInsertionReportProps {
    data: any; // This matches the filter values from the form
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_PERIODS = [
    'Period 1',
    'Period 2',
    'Period Break',
    'Period 3',
    'Period 4',
    'Period Break',
    'Period 5',
    'Period 6',
    'Period Break',
    'Period 7',
    'Period 8'
];

interface CellData {
    hrmE_Id: string;
    ismS_Id: string;
    staffName?: string;
    subjectName?: string;
}

interface ColumnItem {
    type: 'period' | 'break';
    id?: number;
    name: string;
    isBreak: boolean;
    afterPeriod?: string;
    raw?: any;
}

const EMPTY_OBJ = {};

export default function ManualPeriodInsertionReport({ data }: ManualPeriodInsertionReportProps) {
    const { data: masters } = useManualPeriodMasters();
    const { data: reportData, isLoading } = useManualPeriodInsertionReport(data);
    const { mutate: saveTimetable, isPending: isSaving } = useSaveManualPeriodInsertion();

    // State to track data for each cell: { "monday-1": { hrmE_Id: "...", ismS_Id: "..." } }
    const [cellData, setCellData] = useState<Record<string, CellData>>({});

    // State for cells currently highlighted for assignment
    const [selectedForAssignment, setSelectedForAssignment] = useState<Record<string, boolean>>({});
    const [tempSelection, setTempSelection] = useState<CellData>({ hrmE_Id: '', ismS_Id: '' });

    // Extract the nested data object if the API wraps it in { success: true, data: { ... } }
    const actualReportData = useMemo(() => reportData?.data || reportData || EMPTY_OBJ, [reportData]);

    // Available subjects from report response (subjectlist) with fallback to masters
    const availableSubjects = useMemo(() => {
        const list = actualReportData?.subjectlist || actualReportData?.subjectList || actualReportData?.subjects || [];
        if (Array.isArray(list) && list.length > 0) return list;
        return masters?.subjects || [];
    }, [actualReportData, masters]);

    // Construct columns (periods & breaks) from periodslst + break_list
    const columns = useMemo<ColumnItem[]>(() => {
        const periodList = actualReportData?.periodslst || actualReportData?.periodList || actualReportData?.allperiods || [];
        const breakList = actualReportData?.break_list || actualReportData?.breakList || actualReportData?.tT_Break_list || [];

        if (Array.isArray(periodList) && periodList.length > 0) {
            const result: ColumnItem[] = [];

            periodList.forEach((period: any) => {
                const pedId = period.ttmP_Id || period.TTMP_Id || period.ped_id;
                const pedName = String(period.ttmP_PeriodName || period.periodName || period.ped_name || '');

                result.push({
                    type: 'period',
                    id: pedId,
                    name: pedName,
                    isBreak: false,
                    raw: period
                });

                // Check if there is a break defined after this period
                const breakItem = breakList.find((b: any) => {
                    const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod ?? b.ttmb_afterperiod;
                    return String(bAfter) === pedName || Number.parseFloat(String(pedName)) === Number.parseFloat(String(bAfter));
                });

                if (breakItem) {
                    result.push({
                        type: 'break',
                        afterPeriod: pedName,
                        name: breakItem.ttmB_BreakName || breakItem.breakName || 'SHORT BREAK',
                        isBreak: true,
                        raw: breakItem
                    });
                }
            });

            return result;
        }

        // Fallback if periodslst is not provided
        return DEFAULT_PERIODS.map((p): ColumnItem => {
            const isBreak = p.includes('Break');
            return {
                type: isBreak ? 'break' : 'period',
                name: isBreak ? 'Break' : p.replace('Period ', ''),
                isBreak
            };
        });
    }, [actualReportData]);

    // Construct day rows from gridweeks with fallback
    const days = useMemo(() => {
        const gridWeeks = actualReportData?.gridweeks || actualReportData?.gridWeeks || actualReportData?.day_list || [];
        const allBreakList = actualReportData?.break_list_all || actualReportData?.allBreakList || actualReportData?.tT_Break_list_all || [];

        if (Array.isArray(gridWeeks) && gridWeeks.length > 0) {
            return gridWeeks.map((d: any) => ({
                dayId: d.ttmD_Id || d.TTMD_Id || d.day_id || d.ttmd_id || null,
                dayName: d.ttmD_DayName || d.dayName || d.day_name || ''
            }));
        }

        // If gridweeks is empty, map default DAYS and infer ttmD_Id from break_list_all if present
        const uniqueBreakDays = new Map<number, any>();
        if (Array.isArray(allBreakList)) {
            allBreakList.forEach((b: any) => {
                const dId = b.ttmD_Id || b.TTMD_Id;
                if (dId && !uniqueBreakDays.has(dId)) {
                    uniqueBreakDays.set(dId, b);
                }
            });
        }
        const dayIdsFromBreaks = Array.from(uniqueBreakDays.keys());

        return DAYS.map((dayName, idx) => ({
            dayId: dayIdsFromBreaks[idx] || null,
            dayName
        }));
    }, [actualReportData]);

    // Get break name and timing for a specific day and break column
    const getBreakInfo = (day: { dayId: number | null; dayName: string }, col: any) => {
        const allBreakList = actualReportData?.break_list_all || actualReportData?.allBreakList || actualReportData?.tT_Break_list_all || [];

        if (Array.isArray(allBreakList) && allBreakList.length > 0) {
            const matchedBreak = allBreakList.find((b: any) => {
                const bDayId = b.ttmD_Id || b.TTMD_Id || b.day_id;
                const bAfter = b.ttmB_AfterPeriod ?? b.afterPeriod;

                const isDayMatch = (day.dayId && Number(bDayId) === Number(day.dayId)) ||
                    (b.ttmd_DayName && String(b.ttmd_DayName).toLowerCase() === day.dayName.toLowerCase());
                const isPeriodMatch = String(bAfter) === String(col.afterPeriod) || Number(bAfter) === Number(col.afterPeriod);

                return isDayMatch && isPeriodMatch;
            });

            if (matchedBreak) {
                const startTime = matchedBreak.ttmB_BreakStartTime;
                const endTime = matchedBreak.ttmB_BreakEndTime;
                const timeStr = startTime && endTime ? `${startTime} - ${endTime}` : '';
                return {
                    breakName: matchedBreak.ttmB_BreakName || col.name || 'SHORT BREAK',
                    breakTime: timeStr
                };
            }
        }

        return {
            breakName: col.name || 'SHORT BREAK',
            breakTime: ''
        };
    };

    // Helper to find subject name by ID from availableSubjects or masters
    const getSubjectName = (ismsId: any) => {
        if (!ismsId) return '';
        const numId = Number(ismsId);
        const foundInReport = availableSubjects.find((s: any) => Number(s.ismS_Id) === numId);
        if (foundInReport) return foundInReport.ismS_SubjectName || foundInReport.subjectName || '';
        const foundInMasters = masters?.subjects?.find((s: any) => Number(s.ismS_Id) === numId);
        return foundInMasters?.ismS_SubjectName || '';
    };

    useEffect(() => {
        const timeTableList = actualReportData?.time_Table || actualReportData?.timeTable || actualReportData?.tt;
        if (Array.isArray(timeTableList) && timeTableList.length > 0) {
            const newCellData: Record<string, CellData> = {};
            timeTableList.forEach((item: any) => {
                const day = item.ttmd_DayName || item.ttmD_DayName || item.dayName;
                const period = item.ttcP_PeriodName || item.ttmP_PeriodName || item.periodName;
                if (day && period) {
                    const key = `${String(day).toLowerCase().trim()}-${String(period).toLowerCase().trim()}`;
                    const ismsIdVal = item.ismS_Id || item.isms_Id || item.isms_id || item.ISMS_Id;
                    const hrmeIdVal = item.hrmE_Id || item.hrme_Id || item.hrme_id || item.HRME_Id;

                    const staffObj = masters?.staff?.find((s: any) => Number(s.hrmE_Id) === Number(hrmeIdVal));
                    const subjName = item.ismS_SubjectName || item.subjectName || getSubjectName(ismsIdVal);

                    newCellData[key] = {
                        hrmE_Id: hrmeIdVal?.toString() || '',
                        ismS_Id: ismsIdVal?.toString() || '',
                        staffName: item.staffName || item.hrmE_EmployeeFirstName || staffObj?.staffName || '',
                        subjectName: subjName || ''
                    };
                }
            });
            setCellData(newCellData);
        } else {
            setCellData((prev) => (Object.keys(prev).length === 0 ? prev : {}));
        }
    }, [actualReportData, masters, availableSubjects]);

    const toggleSelection = (dayName: string, col: any) => {
        if (col.isBreak) return;

        const key = `${String(dayName).toLowerCase().trim()}-${String(col.name).toLowerCase().trim()}`;
        setSelectedForAssignment((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const colIdFromKey = (periodNameStr: string) => {
        const matchedCol = columns.find((c) => c.name.toLowerCase().trim() === periodNameStr.toLowerCase());
        return matchedCol?.id || null;
    };

    const handleSave = () => {
        const selectedKeys = Object.keys(selectedForAssignment).filter((k) => selectedForAssignment[k]);
        if (selectedKeys.length === 0) return;

        const payloadTimeTable: any[] = [];
        const periodList = actualReportData?.periodslst || actualReportData?.periodList || actualReportData?.allperiods || [];

        selectedKeys.forEach((key) => {
            const separatorIndex = key.indexOf('-');
            const dayNameStr = key.substring(0, separatorIndex).trim();
            const periodNameStr = key.substring(separatorIndex + 1).trim();

            const dayObj = days.find((d) => d.dayName.toLowerCase().trim() === dayNameStr.toLowerCase());
            const periodObj = Array.isArray(periodList)
                ? periodList.find(
                      (p: any) => String(p.ttmP_PeriodName || p.periodName || p.ttcP_PeriodName || p.ped_name).toLowerCase().trim() === periodNameStr.toLowerCase()
                  )
                : null;

            const ttmD_Id = dayObj?.dayId || null;
            const ttmP_Id = periodObj?.ttmP_Id || periodObj?.TTMP_Id || periodObj?.ttmp_id || colIdFromKey(periodNameStr) || null;

            if (ttmD_Id && ttmP_Id) {
                payloadTimeTable.push({
                    TTMD_Id: Number(ttmD_Id),
                    TTMP_Id: Number(ttmP_Id)
                });
            }
        });

        if (payloadTimeTable.length === 0) {
            toast.error('Invalid selection', { description: 'Could not map selected periods to their IDs.' });
            return;
        }

        const finalPayload = {
            ASMAY_Id: Number(data.asmaY_Id),
            TTMC_Id: Number(data.ttmC_Id),
            ASMCL_Id: Number(data.asmcL_Id),
            ASMS_Id: Number(data.asms_Id),
            HRME_Id: Number(tempSelection.hrmE_Id),
            ISMS_Id: Number(tempSelection.ismS_Id),
            Time_Table: payloadTimeTable
        };

        saveTimetable(finalPayload, {
            onSuccess: (res: any) => {
                if (res?.success || res?.returnval) {
                    toast.success('Saved Successfully', { description: res.message || 'Periods mapped to staff/subject.' });

                    const selectedStaff = masters?.staff?.find((s) => s.hrmE_Id.toString() === tempSelection.hrmE_Id);
                    const selectedSubject = availableSubjects.find((s: any) => s.ismS_Id.toString() === tempSelection.ismS_Id);

                    const newData = { ...cellData };
                    selectedKeys.forEach((key) => {
                        newData[key] = {
                            ...tempSelection,
                            staffName: selectedStaff?.staffName || '',
                            subjectName: selectedSubject?.ismS_SubjectName || selectedSubject?.subjectName || ''
                        };
                    });

                    setCellData(newData);
                    setSelectedForAssignment({});
                } else {
                    toast.error('Save failed', { description: res?.message || 'Failed to save configuration.' });
                }
            },
            onError: (err: any) => {
                toast.error('Error occurred while saving', { description: err.message || 'Please try again later.' });
            }
        });
    };

    const hasSelection = Object.values(selectedForAssignment).some((v) => v);

    if (isLoading) {
        return (
            <div className='flex h-64 items-center justify-center bg-white'>
                <div className='flex flex-col items-center gap-2'>
                    <div className='h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent' />
                    <p className='text-purple-600'>Loading timetable grid...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='overflow-x-auto bg-white p-6'>
            <div className='mb-6 flex items-center justify-between border-slate-100 border-b pb-4'>
                <div>
                    <h3 className='font-bold text-lg text-purple-900'>Time Table Grid View</h3>
                    <p className='text-slate-500 text-sm'>Select one or more period cells, then assign Staff/Subject.</p>
                </div>
            </div>

            <div className='overflow-hidden rounded-xl border border-purple-100 shadow-sm'>
                <Table>
                    <TableHeader className='bg-purple-50'>
                        <TableRow>
                            <TableHead className='min-w-[120px] border-purple-100 border-r font-bold text-purple-900'>
                                Day / Period
                            </TableHead>
                            {columns.map((col: any, index: number) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        'min-w-[130px] text-center font-bold text-purple-900',
                                        col.isBreak ? 'bg-amber-50/80 text-amber-800 border-amber-100' : ''
                                    )}>
                                    {col.isBreak ? (
                                        <span className='font-extrabold text-amber-800 text-xs uppercase tracking-wider'>
                                            {col.name}
                                        </span>
                                    ) : (
                                        <span>
                                            {col.name.toLowerCase().startsWith('period') ? col.name : `Period ${col.name}`}
                                        </span>
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {days.map((dayObj: any) => (
                            <TableRow key={dayObj.dayName} className='transition-colors hover:bg-slate-50'>
                                <TableCell className='border-purple-100 border-r bg-slate-50/50 font-bold text-slate-700 italic'>
                                    {dayObj.dayName}
                                </TableCell>
                                {columns.map((col: any, index: number) => {
                                    if (col.isBreak) {
                                        const breakInfo = getBreakInfo(dayObj, col);
                                        return (
                                            <TableCell
                                                key={index}
                                                className='h-24 cursor-not-allowed border-amber-100 border-r bg-amber-50/40 p-2 text-center select-none'>
                                                <div className='flex flex-col items-center justify-center gap-1 text-center'>
                                                    <span className='font-bold text-amber-800 text-xs uppercase tracking-wide'>
                                                        {breakInfo.breakName}
                                                    </span>
                                                    {breakInfo.breakTime && (
                                                        <span className='rounded bg-amber-100/80 px-1.5 py-0.5 font-medium text-[10px] text-amber-900/80'>
                                                            {breakInfo.breakTime}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        );
                                    }

                                    const key = `${String(dayObj.dayName).toLowerCase().trim()}-${String(col.name).toLowerCase().trim()}`;
                                    const cellDataVal = cellData[key];
                                    const isAssigned = !!cellDataVal && (cellDataVal.hrmE_Id || cellDataVal.ismS_Id);
                                    const isSelected = !!selectedForAssignment[key];

                                    return (
                                        <TableCell
                                            key={index}
                                            onClick={() => toggleSelection(dayObj.dayName, col)}
                                            className={cn(
                                                'relative h-24 cursor-pointer select-none border-slate-100 border-r p-2 text-center transition-all duration-200',
                                                'hover:bg-purple-50',
                                                isSelected
                                                    ? 'z-10 bg-purple-600 ring-2 ring-purple-400 ring-inset'
                                                    : isAssigned
                                                        ? 'bg-purple-100 text-purple-900'
                                                        : 'bg-white'
                                            )}>
                                            {isAssigned ? (
                                                <div
                                                    className={cn(
                                                        'zoom-in-95 flex animate-in flex-col items-center gap-1',
                                                        isSelected ? 'text-white' : 'text-purple-900'
                                                    )}>
                                                    <div className='line-clamp-1 font-bold text-xs leading-tight'>
                                                        {cellDataVal.staffName}
                                                    </div>
                                                    <div className='line-clamp-1 text-[11px] opacity-90'>{cellDataVal.subjectName}</div>
                                                </div>
                                            ) : null}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Assignment Controls Below Timetable */}
            <div
                className={cn(
                    'mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-6 transition-all duration-300',
                    !hasSelection ? 'pointer-events-none opacity-50 grayscale-[0.5]' : 'opacity-100'
                )}>
                <div className='flex flex-col items-end gap-6 md:flex-row'>
                    <div className='flex-1 space-y-2'>
                        <Label className='flex items-center gap-2 font-bold text-purple-900'>
                            <User className='h-4 w-4 text-purple-500' /> Staff Name
                            {hasSelection && (
                                <span className='font-normal text-purple-600 text-xs'>
                                    ({Object.values(selectedForAssignment).filter((v) => v).length} periods selected)
                                </span>
                            )}
                        </Label>
                        <Select
                            value={tempSelection.hrmE_Id}
                            onValueChange={(val) => setTempSelection((prev) => ({ ...prev, hrmE_Id: val }))}>
                            <SelectTrigger className='h-10 rounded-lg border-purple-200 bg-white focus:ring-purple-500'>
                                <SelectValue placeholder='-- Select Staff --' />
                            </SelectTrigger>
                            <SelectContent>
                                {masters?.staff?.map((s) => (
                                    <SelectItem key={s.hrmE_Id} value={s.hrmE_Id.toString()}>
                                        {s.staffName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex-1 space-y-2'>
                        <Label className='flex items-center gap-2 font-bold text-purple-900'>
                            <Book className='h-4 w-4 text-purple-500' /> Subject
                        </Label>
                        <Select
                            value={tempSelection.ismS_Id}
                            onValueChange={(val) => setTempSelection((prev) => ({ ...prev, ismS_Id: val }))}>
                            <SelectTrigger className='h-10 rounded-lg border-purple-200 bg-white focus:ring-purple-500'>
                                <SelectValue placeholder='-- Select Subject --' />
                            </SelectTrigger>
                            <SelectContent className='max-h-60 overflow-y-auto'>
                                {availableSubjects?.map((subj: any) => (
                                    <SelectItem key={subj.ismS_Id} value={subj.ismS_Id.toString()}>
                                        {subj.ismS_SubjectName || subj.subjectName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex gap-2'>
                        <Button
                            type='button'
                            onClick={handleSave}
                            disabled={!hasSelection || !tempSelection.hrmE_Id || !tempSelection.ismS_Id}
                            className='h-10 rounded-lg bg-orange-500 px-8 font-bold text-white shadow-lg shadow-orange-100 hover:bg-orange-600'>
                            <Save className='mr-2 h-4 w-4' />
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        {hasSelection && (
                            <Button
                                type='button'
                                variant='ghost'
                                onClick={() => setSelectedForAssignment({})}
                                className='h-10 rounded-lg text-purple-600 hover:bg-purple-100'>
                                <X className='h-5 w-5' />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

