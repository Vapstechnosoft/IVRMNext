'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useManualPeriodMasters, useManualPeriodInsertionReport, useSaveManualPeriodInsertion } from '@/hooks/timetable/useTransactions';
import { cn } from '@/lib/utils';
import { Book, Save, User, X, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface ManualPeriodInsertionReportProps {
    data: any; // This matches the filter values from the form
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_DAY_IDS: Record<string, number> = {
    'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7,
    'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 7
};
const PERIODS = [
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

export default function ManualPeriodInsertionReport({ data }: ManualPeriodInsertionReportProps) {
    const { data: masters } = useManualPeriodMasters();
    const { data: reportData, isLoading } = useManualPeriodInsertionReport(data);
    const { mutate: saveTimetable, isPending: isSaving } = useSaveManualPeriodInsertion();

    // State to track data for each cell: { "Monday-Period 1": { hrmE_Id: "...", ismS_Id: "..." } }
    const [cellData, setCellData] = useState<Record<string, CellData>>({});

    // State for cells currently highlighted for assignment
    const [selectedForAssignment, setSelectedForAssignment] = useState<Record<string, boolean>>({});
    const [tempSelection, setTempSelection] = useState<CellData>({ hrmE_Id: '', ismS_Id: '' });

    // Always show all standard days so user can assign to any day
    const gridDays = DAYS;

    const gridPeriods = reportData?.periodslst?.length 
        ? reportData.periodslst.map((p: any) => p.ttmP_PeriodName || p.periodName || p.ttcP_PeriodName) 
        : PERIODS;

    useEffect(() => {
        if (reportData?.time_Table && Array.isArray(reportData.time_Table)) {
            const newCellData: Record<string, CellData> = {};
            reportData.time_Table.forEach((item: any) => {
                const day = item.ttmd_DayName || item.ttmD_DayName || item.dayName;
                const period = item.ttcP_PeriodName || item.ttmP_PeriodName || item.periodName;
                if (day && period) {
                    const key = `${day.toLowerCase()}-${period.toLowerCase()}`;
                    newCellData[key] = {
                        hrmE_Id: item.hrmE_Id?.toString() || '',
                        ismS_Id: item.ismS_Id?.toString() || '',
                        staffName: item.staffName || masters?.staff?.find(s => s.hrmE_Id === item.hrmE_Id)?.staffName,
                        subjectName: item.subjectName || masters?.subjects?.find(s => s.ismS_Id === item.ismS_Id)?.ismS_SubjectName
                    };
                }
            });
            setCellData(newCellData);
        } else {
            setCellData({});
        }
    }, [reportData, masters]);

    const toggleSelection = (day: string, period: string) => {
        if (period.includes('Break')) return;

        const key = `${day.toLowerCase()}-${period.toLowerCase()}`;
        setSelectedForAssignment((prev) => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSave = () => {
        const selectedKeys = Object.keys(selectedForAssignment).filter((k) => selectedForAssignment[k]);
        if (selectedKeys.length === 0) return;

        const payloadTimeTable: any[] = [];

        selectedKeys.forEach((key) => {
            const [dayName, periodName] = key.split('-');
            const dayObj = reportData?.gridweeks?.find((d: any) => 
                (d.ttmD_DayName?.toLowerCase() || d.dayName?.toLowerCase()) === dayName
            );
            const periodObj = reportData?.periodslst?.find(
                (p: any) => (p.ttmP_PeriodName?.toLowerCase() || p.periodName?.toLowerCase() || p.ttcP_PeriodName?.toLowerCase()) === periodName
            );

            const ttmD_Id = dayObj ? (dayObj.ttmD_Id || dayObj.dayid) : DEFAULT_DAY_IDS[dayName.toUpperCase()];
            const ttmP_Id = periodObj ? (periodObj.ttmP_Id || periodObj.pedid) : null;

            if (ttmD_Id && ttmP_Id) {
                payloadTimeTable.push({
                    TTMD_Id: ttmD_Id,
                    TTMP_Id: ttmP_Id
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
            ASMS_Id: Number(data.asms_Id), // The class subject filter
            HRME_Id: Number(tempSelection.hrmE_Id),
            ISMS_Id: Number(tempSelection.ismS_Id),
            Time_Table: payloadTimeTable
        };

        console.log('Sending payload:', finalPayload);

        saveTimetable(finalPayload, {
            onSuccess: (res: any) => {
                if (res?.success || res?.returnval) {
                    toast.success('Saved Successfully', { description: res.message || 'Periods mapped to staff/subject.' });
                    
                    // Update UI Optimistically or rely on React Query invalidation
                    const selectedStaff = masters?.staff?.find((s) => s.hrmE_Id.toString() === tempSelection.hrmE_Id);
                    const selectedSubject = masters?.subjects?.find((s) => s.ismS_Id.toString() === tempSelection.ismS_Id);

                    const newData = { ...cellData };
                    selectedKeys.forEach((key) => {
                        newData[key] = {
                            ...tempSelection,
                            staffName: selectedStaff?.staffName,
                            subjectName: selectedSubject?.ismS_SubjectName
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
                            {gridPeriods.map((period: string, index: number) => (
                                <TableHead
                                    key={index}
                                    className={cn(
                                        'min-w-[140px] text-center font-bold text-purple-900',
                                        period.includes('Break') ? 'bg-amber-50/50 text-amber-700' : ''
                                    )}>
                                    {period}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gridDays.map((day: string) => (
                            <TableRow key={day} className='transition-colors hover:bg-slate-50'>
                                <TableCell className='border-purple-100 border-r bg-slate-50/50 font-bold text-slate-700 italic'>
                                    {day}
                                </TableCell>
                                {gridPeriods.map((period: string, index: number) => {
                                    const isBreak = period.includes('Break');
                                    const key = `${day.toLowerCase()}-${period.toLowerCase()}`;
                                    const cellDataVal = cellData[key];
                                    const isAssigned = !!cellDataVal && (cellDataVal.hrmE_Id || cellDataVal.ismS_Id);
                                    const isSelected = !!selectedForAssignment[key];

                                    return (
                                        <TableCell
                                            key={index}
                                            onClick={() => toggleSelection(day, period)}
                                            className={cn(
                                                'relative h-24 cursor-pointer select-none border-slate-100 border-r text-center transition-all duration-200',
                                                isBreak
                                                    ? 'cursor-not-allowed bg-amber-50/30 text-amber-600/60 text-xs italic'
                                                    : 'hover:bg-purple-50',
                                                isSelected
                                                    ? 'z-10 bg-purple-600 ring-2 ring-purple-400 ring-inset'
                                                    : isAssigned
                                                      ? 'bg-purple-100 text-purple-900'
                                                      : 'bg-white'
                                            )}>
                                            {isBreak ? (
                                                'Break'
                                            ) : isAssigned ? (
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
                            <SelectContent>
                                {masters?.subjects?.map((subj) => (
                                    <SelectItem key={subj.ismS_Id} value={subj.ismS_Id.toString()}>
                                        {subj.ismS_SubjectName}
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

