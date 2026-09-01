'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSaveDeputationDetails } from '@/hooks/timetable/useTransactions';
import { getFreeStaffDets } from '@/server/timetable/transactions/deputation';
import { AlertTriangle, Loader2, Save, UserCheck, Users } from 'lucide-react';
import { toast } from 'sonner';

interface DeputationAssignmentTableProps {
    periodsData: any; // Result from get_period_alloted
    selection: {
        date: Date | null;
        dateStr: string;
        dayId: number;
        dayName: string;
        absentStaffId: number;
        absflag: boolean;
        remarks: string;
        smsflag: boolean;
        mailflag: boolean;
        noT_Flag: boolean;
        masters: any;
    };
    onSaveSuccess?: () => void;
}

export default function DeputationAssignmentTable({ periodsData, selection, onSaveSuccess }: DeputationAssignmentTableProps) {
    const [assignedStaffMap, setAssignedStaffMap] = useState<Record<number, number>>({});
    const [freeStaffMap, setFreeStaffMap] = useState<Record<number, any[]>>({});
    const [loadingFreeStaff, setLoadingFreeStaff] = useState<Record<number, boolean>>({});
    const [savingPeriodId, setSavingPeriodId] = useState<number | null>(null);

    const saveMutation = useSaveDeputationDetails();

    // Extract list of period allotments from backend response
    const periodsPayload = periodsData?.data !== undefined ? periodsData.data : periodsData;
    const periodsList: any[] =
        periodsPayload?.periodslst ||
        periodsPayload?.gridweeks ||
        periodsPayload?.absentStaffTimeTable ||
        periodsPayload?.period_list ||
        periodsPayload?.time_Table ||
        (Array.isArray(periodsPayload) ? periodsPayload : []);

    // Master staff list as fallback
    const masterStaffList = selection?.masters?.stafflist || selection?.masters?.data?.stafflist || [];

    // Fetch free staff for a specific period slot
    const fetchFreeStaffForPeriod = async (periodId: number) => {
        if (!selection?.dateStr || loadingFreeStaff[periodId]) return;

        setLoadingFreeStaff((prev) => ({ ...prev, [periodId]: true }));
        try {
            const payload = {
                ttsD_Date: selection.dateStr,
                absflag: selection.absflag,
                ttmD_Id: selection.dayId || 0,
                ttmP_Id: periodId,
                hrmE_Id: selection.absentStaffId
            };
            const res = await getFreeStaffDets(payload);
            const resData = res?.data !== undefined ? res.data : res;
            const staffList: any[] =
                resData?.freestafflist ||
                resData?.stafflist ||
                resData?.staffList ||
                resData?.absentstafflist ||
                resData?.staff_list ||
                resData?.staffbyall ||
                (Array.isArray(resData) ? resData : []);
            setFreeStaffMap((prev) => ({ ...prev, [periodId]: staffList }));
        } catch (error) {
            console.error('Failed to fetch free staff:', error);
            toast.error(`Failed to load free staff for period ${periodId}`);
        } finally {
            setLoadingFreeStaff((prev) => ({ ...prev, [periodId]: false }));
        }
    };

    // Auto-fetch free staff for all periods on load
    useEffect(() => {
        if (periodsList && periodsList.length > 0 && selection?.dateStr) {
            for (const item of periodsList) {
                const periodId = Number(item.ttmP_Id || item.period || item.TTMP_Id || 0);
                if (periodId > 0 && !freeStaffMap[periodId]) {
                    fetchFreeStaffForPeriod(periodId);
                }
            }
        }
    }, [periodsData, selection]);

    if (!periodsList || periodsList.length === 0) {
        return (
            <CollapsibleSection title='Assign Replacement Staff (Period-Wise Allotment)' defaultOpen>
                <div className='rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm flex items-center gap-3 text-amber-800 font-semibold'>
                    <AlertTriangle className='h-5 w-5 text-amber-600 flex-shrink-0' />
                    <span>No allotted periods found for the selected staff on this day.</span>
                </div>
            </CollapsibleSection>
        );
    }

    const handleStaffChange = (periodId: number, deputedStaffId: number) => {
        setAssignedStaffMap((prev) => ({
            ...prev,
            [periodId]: deputedStaffId
        }));
    };

    const handleSaveSinglePeriod = async (item: any) => {
        const periodId = Number(item.ttmP_Id || item.period || item.TTMP_Id || 0);
        const deputedStaffId = assignedStaffMap[periodId];

        if (!deputedStaffId) {
            toast.error('Please select a replacement staff first');
            return;
        }

        setSavingPeriodId(periodId);
        try {
            const payload = {
                ttmD_Id: selection.dayId || 0,
                ttsD_AbsentStaff: selection.absentStaffId,
                ttsD_DeputedStaff: deputedStaffId,
                ttsD_Date: selection.dateStr,
                ttmP_Id: periodId,
                asmcL_Id: Number(item.asmcL_Id || item.ASMC_Id || 0),
                asmS_Id: Number(item.asmS_Id || item.ASMS_Id || 0),
                ttsD_Remarks: selection.remarks || '',
                smsflag: selection.smsflag,
                mailflag: selection.mailflag,
                noT_Flag: selection.noT_Flag
            };

            await saveMutation.mutateAsync(payload);
            toast.success(`Period ${item.period || item.ttmP_PeriodName || periodId} deputation saved successfully`);
            if (onSaveSuccess) onSaveSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error('Failed to save deputation');
        } finally {
            setSavingPeriodId(null);
        }
    };

    const handleSaveAllDeputations = async () => {
        const periodKeys = Object.keys(assignedStaffMap);
        if (periodKeys.length === 0) {
            toast.error('Please assign replacement staff for at least one period');
            return;
        }

        let savedCount = 0;
        for (const item of periodsList) {
            const periodId = Number(item.ttmP_Id || item.period || item.TTMP_Id || 0);
            const deputedStaffId = assignedStaffMap[periodId];
            if (deputedStaffId) {
                try {
                    const payload = {
                        ttmD_Id: selection.dayId || 0,
                        ttsD_AbsentStaff: selection.absentStaffId,
                        ttsD_DeputedStaff: deputedStaffId,
                        ttsD_Date: selection.dateStr,
                        ttmP_Id: periodId,
                        asmcL_Id: Number(item.asmcL_Id || item.ASMC_Id || 0),
                        asmS_Id: Number(item.asmS_Id || item.ASMS_Id || 0),
                        ttsD_Remarks: selection.remarks || '',
                        smsflag: selection.smsflag,
                        mailflag: selection.mailflag,
                        noT_Flag: selection.noT_Flag
                    };

                    await saveMutation.mutateAsync(payload);
                    savedCount++;
                } catch (err) {
                    console.error(err);
                }
            }
        }

        if (savedCount > 0) {
            toast.success(`Successfully saved ${savedCount} deputation allotment(s)`);
            if (onSaveSuccess) onSaveSuccess();
        }
    };

    return (
        <CollapsibleSection title='Assign Replacement Staff (Period-Wise Allotment)' defaultOpen>
            <div className='space-y-4 rounded-xl border border-blue-100 bg-white p-6 shadow-md'>
                <div className='mb-2 flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-blue-900'>
                        <UserCheck className='h-5 w-5' />
                        <h3 className='font-bold text-lg'>Allotted Periods & Replacement Staff</h3>
                    </div>
                    <Button
                        type='button'
                        onClick={handleSaveAllDeputations}
                        disabled={saveMutation.isPending}
                        className='bg-emerald-600 font-bold hover:bg-emerald-700 text-white'>
                        {saveMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                        Confirm All Deputations
                    </Button>
                </div>

                <div className='overflow-hidden rounded-xl border border-blue-100'>
                    <Table>
                        <TableHeader className='bg-blue-50'>
                            <TableRow>
                                <TableHead className='w-[120px] font-bold text-blue-900'>Period</TableHead>
                                <TableHead className='font-bold text-blue-900'>Class / Section / Subject</TableHead>
                                <TableHead className='w-[320px] font-bold text-blue-900'>Assign Free Replacement Staff</TableHead>
                                <TableHead className='w-[140px] text-right font-bold text-blue-900'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {periodsList.map((item: any, index: number) => {
                                const periodId = Number(item.ttmP_Id || item.period || item.TTMP_Id || index + 1);
                                const periodName = item.ttmP_PeriodName || item.period || `Period ${periodId}`;
                                const classSubStr =
                                    item.classSubject ||
                                    [item.asmcL_ClassName, item.asmS_SectionName, item.ismS_SubjectName].filter(Boolean).join(' - ') ||
                                    '--';

                                const freeStaff = freeStaffMap[periodId] || masterStaffList;
                                const isFreeLoading = loadingFreeStaff[periodId];
                                const selectedStaff = assignedStaffMap[periodId];
                                const isSavingThis = savingPeriodId === periodId;

                                return (
                                    <TableRow key={index} className='transition-colors hover:bg-slate-50'>
                                        <TableCell className='font-bold text-blue-700'>
                                            <span className='inline-flex items-center gap-1.5 rounded-md bg-blue-100 px-2.5 py-1 text-xs text-blue-800 font-semibold'>
                                                {periodName}
                                            </span>
                                        </TableCell>

                                        <TableCell className='font-semibold text-slate-700'>{classSubStr}</TableCell>

                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                <Select
                                                    onValueChange={(val) => handleStaffChange(periodId, Number(val))}
                                                    value={selectedStaff ? selectedStaff.toString() : undefined}>
                                                    <SelectTrigger className='w-full border-blue-200'>
                                                        <SelectValue
                                                            placeholder={isFreeLoading ? 'Loading free staff...' : '-- Select Replacement Staff --'}
                                                        />
                                                    </SelectTrigger>
                                                     <SelectContent>
                                                         {freeStaff && freeStaff.length > 0 ? (
                                                             freeStaff.map((staff: any, idx: number) => {
                                                                 const sId = staff.hrmE_Id || staff.hrE_Id || staff.HRME_Id || staff.id || idx;
                                                                 const fullName = [staff.hrmE_EmployeeFirstName, staff.hrmE_EmployeeMiddleName, staff.hrmE_EmployeeLastName]
                                                                     .filter(Boolean)
                                                                     .join(' ');
                                                                 const sName =
                                                                     staff.staffName ||
                                                                     staff.staffname ||
                                                                     (fullName ? fullName : null) ||
                                                                     staff.hrmE_EmployeeFirstName ||
                                                                     staff.hrmE_EmployeeCode ||
                                                                     staff.employeeName ||
                                                                     `Staff #${sId}`;
                                                                 const valStr = (sId ?? idx).toString();

                                                                 return (
                                                                     <SelectItem key={`${valStr}-${idx}`} value={valStr}>
                                                                         {sName}
                                                                     </SelectItem>
                                                                 );
                                                             })
                                                         ) : (
                                                             <SelectItem value='0' disabled>
                                                                 No free staff available
                                                             </SelectItem>
                                                         )}
                                                     </SelectContent>
                                                </Select>

                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='icon'
                                                    title='Reload Free Staff'
                                                    onClick={() => fetchFreeStaffForPeriod(periodId)}>
                                                    <Users className='h-4 w-4 text-blue-600' />
                                                </Button>
                                            </div>
                                        </TableCell>

                                        <TableCell className='text-right'>
                                            <Button
                                                type='button'
                                                size='sm'
                                                onClick={() => handleSaveSinglePeriod(item)}
                                                disabled={isSavingThis || !selectedStaff}
                                                className='bg-blue-600 font-bold hover:bg-blue-700 text-white'>
                                                {isSavingThis ? <Loader2 className='h-3.5 w-3.5 animate-spin' /> : <Save className='h-3.5 w-3.5 mr-1' />}
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </CollapsibleSection>
    );
}

