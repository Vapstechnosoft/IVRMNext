'use client';

import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarIcon, CheckCircle, Loader2, RotateCcw, Search, Trash, Eye, Info, Clock, Check, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import {
    useStudentAttendanceInitialData,
    useStudentAttendanceGetStudentData,
    useStudentAttendanceGetMonthClassHeld,
    useStudentAttendanceGetDateWiseAttendance,
    useStudentAttendanceGetBatchList,
    useStudentAttendanceGetStdListPeriod,
    useStudentAttendanceSave,
    useStudentAttendanceViewDetails,
    useStudentAttendanceDelete,
    useStudentAttendanceDeleteRecordWise
} from '@/hooks/admission/preadmission/transactions/useStudentAttendanceEntry';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import Swal from 'sweetalert2';

export default function StudentAttendanceEntryPage() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number | null>(null);
    const [asmsId, setAsmsId] = useState<number | null>(null);
    const [entryType, setEntryType] = useState<string>('');
    const [entryDate, setEntryDate] = useState<Date>(new Date());
    const [monthId, setMonthId] = useState<number | null>(null);
    const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    const [toDate, setToDate] = useState<Date | undefined>(undefined);
    const [ismsId, setIsmsId] = useState<number | null>(null);
    const [ttmpId, setTtmpId] = useState<number | null>(null);
    const [asasbId, setAsasbId] = useState<number | null>(null);
    const [asaId, setAsaId] = useState<number>(0);
    const [regularExtra, setRegularExtra] = useState<string>('Regular');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [batchList, setBatchList] = useState<any[]>([]);
    const [publicHolidays, setPublicHolidays] = useState<any[]>([]);
    const [countClass, setCountClass] = useState<number>(0);
    const [attEntryTypeFlag, setAttEntryTypeFlag] = useState<string>('');
    const [updateCount, setUpdateCount] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');

    /* Modal States */
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewDetails, setViewDetails] = useState<any[]>([]);

    /* -------------------- Hooks -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useStudentAttendanceInitialData(asmayId);
    const getStudentDataMutation = useStudentAttendanceGetStudentData();
    const getMonthClassHeldMutation = useStudentAttendanceGetMonthClassHeld();
    const getDateWiseAttMutation = useStudentAttendanceGetDateWiseAttendance();
    const getBatchListMutation = useStudentAttendanceGetBatchList();
    const getStdListPeriodMutation = useStudentAttendanceGetStdListPeriod();
    const saveMutation = useStudentAttendanceSave();
    const viewDetailsMutation = useStudentAttendanceViewDetails();
    const deleteMutation = useStudentAttendanceDelete();
    const deleteRecordWiseMutation = useStudentAttendanceDeleteRecordWise();

    /* -------------------- Effects -------------------- */
    // On Load / Year Change
    useEffect(() => {
        if (initialData?.data) {
            const current = (initialData.data as any).currentYear?.[0];
            if (current && asmayId === 0) {
                setAsmayId(current.asmaY_Id);
            }
        }
    }, [initialData, asmayId]);

    /* -------------------- Helpers -------------------- */
    const isHoliday = (date: Date) => {
        if (!publicHolidays || publicHolidays.length === 0) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        return publicHolidays.some(h => {
            const hDate = h.Date || h.date || h.PublicHolidayDate;
            if (!hDate) return false;
            return format(new Date(hDate), 'yyyy-MM-dd') === dateStr;
        });
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return studentList;
        const q = searchQuery.toLowerCase();
        return studentList.filter(s =>
            (s.studentname || '').toLowerCase().includes(q) ||
            (s.amaY_RollNo || '').toString().includes(q) ||
            (s.amsT_AdmNo || '').toLowerCase().includes(q)
        );
    }, [studentList, searchQuery]);

    /* -------------------- Handlers -------------------- */
    const handleClassChange = async (val: string) => {
        const cId = Number(val);
        setAsmclId(cId);
        setAsmsId(null);
        setStudentList([]);

        try {
            const res = await getStudentDataMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: cId,
                classsecflag: '1'
            });
            
            const pData = res?.data || res;
            setSectionList(pData.sectionList || []);
            setPublicHolidays(pData.publicHolidays || []);
            
            // Set entry type based on legacy logic
            if (pData.asA_Att_EntryType === 'D') setEntryType('Dailyonce');
            else if (pData.asA_Att_EntryType === 'H') setEntryType('Dailytwice');
            else if (pData.asA_Att_EntryType === 'M') setEntryType('monthly');
            else if (pData.asA_Att_EntryType === 'P') setEntryType('period');

        } catch (e) {
            toast.error('Failed to load class details');
        }
    };

    const handleSectionChange = async (val: string) => {
        const sId = Number(val);
        setAsmsId(sId);
        setStudentList([]);
        
        if (entryType !== 'monthly' && entryType !== 'period') {
            fetchStudents(sId);
        }
    };

    const fetchStudents = async (sId: number) => {
        try {
            const entry = entryType === 'Dailyonce' ? 'D' : entryType === 'Dailytwice' ? 'H' : entryType === 'monthly' ? 'M' : 'P';
            const res = await getStudentDataMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: sId,
                monthflag1: entryType,
                ASA_FromDate: format(entryDate, 'MM/dd/yyyy'),
                monthflag: entry,
                checksubject: '1'
            });

            const pData = res?.data || res;
            processStudentList(pData);
        } catch (e) {
            toast.error('Failed to fetch students');
        }
    };

    const processStudentList = (pData: any) => {
        const list = pData.studentList || [];
        const entryFlag = pData.attendanceentryflag;
        setAttEntryTypeFlag(entryFlag === 'A' ? 'Attendance Entry Type Is Absent' : 'Attendance Entry Type Is Present');
        setUpdateCount(pData.countclass1 || 0);

        // Capture ASA_Id if unique
        const distinctAsaIds = Array.from(new Set(list.map((s: any) => s.asA_Id).filter((id: any) => id > 0)));
        if (distinctAsaIds.length === 1) {
            setAsaId(distinctAsaIds[0] as number);
        } else {
            setAsaId(0);
        }

        if (entryType === 'Dailyonce' || entryType === 'period') {
            setStudentList(list.map((s: any) => ({
                ...s,
                selected: entryFlag === 'A' ? s.pdays === 0 : s.pdays > 0
            })));
        } else if (entryType === 'Dailytwice') {
            setStudentList(list.map((s: any) => ({
                ...s,
                FirstHalfflag: entryFlag === 'A' ? (s.pdays === 0 || (s.pdays === 0.5 && s.asA_Dailytwice_Flag === 'Secondhalf')) : (s.pdays === 1 || (s.pdays === 0.5 && s.asA_Dailytwice_Flag === 'firsthalf')),
                SecondHalfflag: entryFlag === 'A' ? (s.pdays === 0 || (s.pdays === 0.5 && s.asA_Dailytwice_Flag === 'firsthalf')) : (s.pdays === 1 || (s.pdays === 0.5 && s.asA_Dailytwice_Flag === 'Secondhalf'))
            })));
        } else {
            setStudentList(list);
        }

        if (isHoliday(entryDate)) {
            Swal.fire('Info', 'Today is a Public Holiday', 'info');
        }
    };

    const handleMonthChange = async (val: string) => {
        const mId = Number(val);
        setMonthId(mId);
        try {
            const entry = 'M';
            const res = await getMonthClassHeldMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                monthid: mId,
                monthflag: entry,
                monthflag1: 'monthly',
                ASA_FromDate: format(entryDate, 'MM/dd/yyyy')
            });
            const pData = res?.data || res;
            setCountClass(pData.countclass || 0);
            setFromDate(pData.startdate ? new Date(pData.startdate) : undefined);
            setToDate(pData.enddate ? new Date(pData.enddate) : undefined);
            setStudentList(pData.studentList || []);
            setUpdateCount(pData.countclass1 || 0);
        } catch (e) {
            toast.error('Failed to load monthly data');
        }
    };

    const handleSubjectChange = async (val: string) => {
        const sId = Number(val);
        setIsmsId(sId);
        try {
            const res = await getBatchListMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                ismS_Id: sId
            });
            const pData = res?.data || res;
            setBatchList(pData.batchList || []);
        } catch (e) {
            toast.error('Failed to load batch list');
        }
    };

    const handlePeriodChange = async (val: string) => {
        const pId = Number(val);
        setTtmpId(pId);
        try {
            const entry = 'P';
            const res = await getStdListPeriodMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                ismS_Id: ismsId,
                TTMP_Id: pId,
                monthflag: entry,
                monthflag1: 'period',
                ASA_FromDate: format(entryDate, 'MM/dd/yyyy'),
                asasB_Id: asasbId || 0
            });
            const pData = res?.data || res;
            processStudentList(pData);
        } catch (e) {
            toast.error('Failed to load period data');
        }
    };

    const handleSave = async () => {
        if (!asmayId || !asmclId || !asmsId) {
            toast.error('Please select required fields');
            return;
        }

        let ASA_ClassHeld: string | number = '1.00';
        let asasB_Id = asasbId || 0;
        let fromDateStr = format(entryDate, 'MM/dd/yyyy');
        let toDateStr = format(entryDate, 'MM/dd/yyyy');

        if (entryType === 'Dailytwice') {
            // Logic for half days held? Legacy code says '0.5' or '1.00' based on checkboxes which aren't in the global form but the student level?
            // Actually legacy JS has $scope.att.ASA_ClassHeld1 and ASA_ClassHeld2 but they aren't in the HTML. 
            // In Sophia Sophia legacy, they might be marking half days held too.
            // For now, default to 1.00
            ASA_ClassHeld = '1.00';
        } else if (entryType === 'monthly') {
            ASA_ClassHeld = countClass;
            fromDateStr = fromDate ? format(fromDate, 'MM/dd/yyyy') : fromDateStr;
            toDateStr = toDate ? format(toDate, 'MM/dd/yyyy') : toDateStr;
        }

        const absentees = studentList.filter(s => {
            if (entryType === 'Dailyonce' || entryType === 'period') return s.selected;
            if (entryType === 'Dailytwice') return s.FirstHalfflag || s.SecondHalfflag;
            return false;
        });

        if (absentees.length > 0) {
            const result = await Swal.fire({
                title: 'Are you sure?',
                html: `Are you want to mark the following <b>${absentees.length}</b> students as absent?<br/><br/>
                       <div style="max-height: 200px; overflow-y: auto; text-align: left; border: 1px solid #eee; padding: 10px;">
                        <ol>${absentees.map(s => `<li>${s.studentname}</li>`).join('')}</ol>
                       </div>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, mark them!',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) return;
        }

        const payload = {
            ASA_Id: asaId,
            ismS_Id: ismsId || 0,
            ASMAY_Id: asmayId,
            ASMCL_Id: asmclId,
            ASMS_Id: asmsId,
            ASA_Att_Type: entryType,
            TTMP_Id: ttmpId || 0,
            ASA_Entry_DateTime: new Date().toISOString(), 
            ASA_FromDate: fromDateStr,
            ASA_ToDate: toDateStr,
            ASA_ClassHeld: ASA_ClassHeld,
            ASA_Regular_Extra: regularExtra,
            asasB_Id: asasB_Id,
            stdList: studentList
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            if (res?.data?.returnval || res?.returnval) {
                toast.success('Record Saved Successfully!');
                window.location.reload();
            } else {
                toast.error(res?.data?.message || res?.message || 'Failed to save record');
            }
        } catch (e) {
            toast.error('Submission failed');
        }
    };

    const handleViewStaffWise = async () => {
        try {
            const res = await viewDetailsMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                att_entry_type: entryType
            });
            const pData = res?.data || res;
            setViewDetails(pData.viewStudentPeriodWiseAttDetails || []);
            setViewModalOpen(true);
        } catch (e) {
            toast.error('Failed to load view details');
        }
    };

    const handleDeleteRecord = async (user: any) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do You Want To Delete The Selected Attendance Details?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Yes, Delete it!'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await deleteRecordWiseMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                ASA_Id: user.ASA_Id,
                att_entry_type: entryType
            });
            if (res?.data?.returnval || res?.returnval) {
                toast.success('Record Deleted Successfully');
                setViewDetails(prev => prev.filter(p => p.ASA_Id !== user.ASA_Id));
            } else {
                toast.error('Failed to delete');
            }
        } catch (e) {
            toast.error('Error deleting record');
        }
    };

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Attendance Entry'
                description='Manage and record student attendance'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                            <Select value={asmayId?.toString()} onValueChange={(v) => setAsmayId(Number(v))}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(initialData?.data as any)?.academicYearList?.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Class:<span className='text-red-500'>*</span></Label>
                            <Select value={asmclId?.toString()} onValueChange={handleClassChange}>
                                <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(initialData?.data as any)?.classList?.map((c: any) => (
                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>{c.asmcL_ClassName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </CollapsibleSection>

            {entryType && (
                <CollapsibleSection
                    title='Attendance Entry Inputs'
                    description={`Entry Mode: ${entryType}`}
                    defaultOpen={true}
                    variant='outline'
                    className='shadow-md'>

                    <div className='bg-white p-6 space-y-8'>
                        <div className='flex justify-center'>
                            <RadioGroup value={entryType} className='flex gap-8 p-4 bg-gray-50 rounded-full border border-dashed border-indigo-200'>
                                {[
                                    { label: 'Daily Once', value: 'Dailyonce' },
                                    { label: 'Daily Twice', value: 'Dailytwice' },
                                    { label: 'Monthly', value: 'monthly' },
                                    { label: 'Period Wise', value: 'period' }
                                ].map(item => (
                                    <div key={item.value} className='flex items-center space-x-2 px-4'>
                                        <RadioGroupItem value={item.value} id={item.value} disabled />
                                        <Label htmlFor={item.value} className='text-xs font-bold text-gray-600 cursor-not-allowed'>{item.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
                            {/* Common Fields */}
                            <div className='space-y-4'>
                                <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                                <Select value={asmsId?.toString()} onValueChange={handleSectionChange}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Conditional Inputs */}
                            {entryType !== 'monthly' && (
                                <div className='space-y-4'>
                                    <Label className='text-sm font-bold'>DOE (Date of Entry):<span className='text-red-500'>*</span></Label>
                                    <DatePickerWithYear
                                        selected={entryDate}
                                        onDayClick={(date) => { setEntryDate(date); if (asmsId) fetchStudents(asmsId); }}
                                        className='w-full'
                                        disabled={isHoliday}
                                    />
                                </div>
                            )}

                            {entryType === 'monthly' && (
                                <>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Month:<span className='text-red-500'>*</span></Label>
                                        <Select value={monthId?.toString()} onValueChange={handleMonthChange}>
                                            <SelectTrigger className='h-9'>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(initialData?.data as any)?.monthList?.map((m: any) => (
                                                    <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>{m.ivrM_Month_Name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Date Range:</Label>
                                        <div className='flex items-center gap-2'>
                                            <Badge variant='outline' className='h-9 px-4 w-full justify-start bg-gray-50'>
                                                {fromDate ? format(fromDate, 'dd/MM/yyyy') : '-'} TO {toDate ? format(toDate, 'dd/MM/yyyy') : '-'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Total Classes Held:</Label>
                                        <Badge className='h-9 px-4 w-full justify-center bg-indigo-600 text-base'>{countClass}</Badge>
                                    </div>
                                </>
                            )}

                            {entryType === 'period' && (
                                <>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Subject:<span className='text-red-500'>*</span></Label>
                                        <Select value={ismsId?.toString()} onValueChange={handleSubjectChange}>
                                            <SelectTrigger className='h-9'>
                                                <SelectValue placeholder='Select Subject' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(initialData?.data as any)?.subjectList?.map((s: any) => (
                                                    <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>{s.ismS_SubjectName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Batch:</Label>
                                        <Select value={asasbId?.toString()} onValueChange={(v) => setAsasbId(Number(v))}>
                                            <SelectTrigger className='h-9' disabled={batchList.length === 0}>
                                                <SelectValue placeholder='Select Batch' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {batchList.map((b: any) => (
                                                    <SelectItem key={b.asasB_Id} value={b.asasB_Id.toString()}>{b.asasB_BatchName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-4'>
                                        <Label className='text-sm font-bold'>Period:<span className='text-red-500'>*</span></Label>
                                        <Select value={ttmpId?.toString()} onValueChange={handlePeriodChange}>
                                            <SelectTrigger className='h-9'>
                                                <SelectValue placeholder='Select Period' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(initialData?.data as any)?.periodlist?.map((p: any) => (
                                                    <SelectItem key={p.ttmP_Id} value={p.ttmP_Id.toString()}>{p.ttmP_PeriodName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='space-y-4 col-span-1 md:col-span-2'>
                                        <div className='flex justify-center gap-8 p-4 bg-indigo-50/50 rounded-xl border'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroup value={regularExtra} onValueChange={setRegularExtra} className='flex gap-4'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Regular' id='reg' />
                                                        <Label htmlFor='reg'>Regular</Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Extra Period' id='extra' />
                                                        <Label htmlFor='extra'>Extra Period</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='flex justify-center gap-4 pt-6'>
                            <Button size='sm' onClick={handleViewStaffWise} className='bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-lg'>
                                <Eye className='mr-2 h-4 w-4' /> VIEW ATTENDANCE
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {/* Student List Grid */}
            {studentList.length > 0 && (
                <div className='space-y-4 animate-in fade-in slide-in-from-top-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm'>
                        <div className='flex flex-col'>
                            <h3 className='text-lg font-bold text-indigo-900'>Student Details</h3>
                            <span className='text-sm text-blue-600 font-bold uppercase tracking-tight'>{attEntryTypeFlag}</span>
                        </div>
                        <div className='relative w-72'>
                            <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search student...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='h-10 pl-10 bg-gray-50/50 rounded-full'
                            />
                        </div>
                    </div>

                    <div className='rounded-2xl border bg-white shadow-xl overflow-hidden'>
                        <Table>
                            <TableHeader className='bg-indigo-900'>
                                <TableRow className='hover:bg-indigo-900 border-none'>
                                    <TableHead className='text-white w-[100px] text-center'>Roll No.</TableHead>
                                    <TableHead className='text-white'>Student Name</TableHead>
                                    <TableHead className='text-white w-[150px] text-center'>
                                        {entryType === 'monthly' ? 'Days Present' : entryType === 'Dailytwice' ? 'I Half' : 'Attendance'}
                                    </TableHead>
                                    {entryType === 'Dailytwice' && (
                                        <TableHead className='text-white w-[150px] text-center'>II Half</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStudents.map((s, idx) => (
                                    <TableRow key={idx} className={`${(s.selected || s.FirstHalfflag || s.SecondHalfflag) ? 'bg-red-50/30' : 'hover:bg-gray-50/50'} border-b transition-colors`}>
                                        <TableCell className='text-center font-bold text-gray-400'>{s.amaY_RollNo}</TableCell>
                                        <TableCell>
                                            <div className='flex flex-col'>
                                                <span className='font-bold text-indigo-900'>{s.studentname}</span>
                                                <span className='text-[10px] text-gray-500 uppercase'>Adm: {s.amsT_AdmNo}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {entryType === 'monthly' ? (
                                                <div className='flex flex-col items-center space-y-1'>
                                                    <Input
                                                        type='number'
                                                        className='w-24 text-center h-8 font-bold'
                                                        value={s.pdays || ''}
                                                        onChange={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (val > countClass) {
                                                                toast.error('Present Days cannot exceed Class Held');
                                                                return;
                                                            }
                                                            const newList = [...studentList];
                                                            newList[idx].pdays = val;
                                                            setStudentList(newList);
                                                        }}
                                                    />
                                                    {s.pdays > countClass && <span className='text-[10px] text-red-500'>Limit exceeded</span>}
                                                </div>
                                            ) : entryType === 'Dailytwice' ? (
                                                <Checkbox
                                                    checked={s.FirstHalfflag}
                                                    onCheckedChange={(v) => {
                                                        const newList = [...studentList];
                                                        newList[idx].FirstHalfflag = !!v;
                                                        setStudentList(newList);
                                                    }}
                                                />
                                            ) : (
                                                <Checkbox
                                                    checked={s.selected}
                                                    onCheckedChange={(v) => {
                                                        const newList = [...studentList];
                                                        newList[idx].selected = !!v;
                                                        setStudentList(newList);
                                                    }}
                                                />
                                            )}
                                        </TableCell>
                                        {entryType === 'Dailytwice' && (
                                            <TableCell className='text-center'>
                                                <Checkbox
                                                    checked={s.SecondHalfflag}
                                                    onCheckedChange={(v) => {
                                                        const newList = [...studentList];
                                                        newList[idx].SecondHalfflag = !!v;
                                                        setStudentList(newList);
                                                    }}
                                                />
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='flex justify-center gap-6 py-8'>
                        <Button size='lg' onClick={handleSave} disabled={saveMutation.isPending} className='min-w-[200px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl rounded-full uppercase tracking-widest transition-all'>
                            {saveMutation.isPending ? <Loader2 className='mr-2 h-5 w-5 animate-spin' /> : updateCount === 0 ? <CheckCircle className='mr-2 h-5 w-5' /> : <RotateCcw className='mr-2 h-5 w-5' />}
                            {updateCount === 0 ? 'Save' : 'Update'}
                        </Button>
                        <Button size='lg' variant='outline' onClick={() => window.location.reload()} className='min-w-[200px] border-red-200 text-red-600 hover:bg-red-50 shadow-md rounded-full uppercase tracking-widest'>
                            <RotateCcw className='mr-2 h-5 w-5' />
                            Reset
                        </Button>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className='max-w-6xl max-h-[90vh] overflow-hidden p-0'>
                    <DialogHeader className='p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white'>
                        <DialogTitle className='text-xl font-bold uppercase tracking-widest'>Attendance History Details</DialogTitle>
                        <DialogDescription className='text-indigo-100'>Overview of recently recorded attendance</DialogDescription>
                    </DialogHeader>
                    
                    <ScrollArea className='h-[60vh] p-6'>
                        <div className='rounded-xl border overflow-hidden shadow-sm'>
                            <Table>
                                <TableHeader className='bg-gray-100'>
                                    <TableRow>
                                        <TableHead className='w-[60px] text-center'>SL.NO</TableHead>
                                        <TableHead>Attendance Details</TableHead>
                                        <TableHead className='text-center'>Att. Date</TableHead>
                                        <TableHead className='text-center'>Entry Date</TableHead>
                                        {entryType === 'period' && (
                                            <>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead className='text-center'>P/A/T</TableHead>
                                            </>
                                        )}
                                        <TableHead>Entry By</TableHead>
                                        <TableHead className='text-center w-[80px]'>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewDetails.length > 0 ? (
                                        viewDetails.map((v, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className='text-center font-bold text-gray-400'>{idx + 1}</TableCell>
                                                <TableCell>
                                                    <div className='flex flex-col text-xs'>
                                                        <span className='font-bold text-indigo-900'>{v.ASMAY_Year}</span>
                                                        <span>{v.ASMCL_ClassName} - {v.ASMC_SectionName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-center text-xs'>{v.ASA_FROMDATE}</TableCell>
                                                <TableCell className='text-center text-xs'>{v.ASA_Entry_DateTime}</TableCell>
                                                {entryType === 'period' && (
                                                    <>
                                                        <TableCell className='text-xs'>{v.ISMS_SUBJECTNAME}</TableCell>
                                                        <TableCell className='text-xs'>{v.TTMP_PeriodName}</TableCell>
                                                        <TableCell className='text-center'>
                                                            <div className='flex items-center justify-center gap-1'>
                                                                <Badge variant='outline' className='text-[10px] px-1 bg-green-50'>{v.PresentCount}</Badge>
                                                                <Badge variant='outline' className='text-[10px] px-1 bg-red-50'>{v.AbsentCount}</Badge>
                                                                <Badge variant='outline' className='text-[10px] px-1 bg-blue-50'>{v.TotalCount}</Badge>
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className='text-xs font-medium'>{v.EMPLOYEENAME}</TableCell>
                                                <TableCell className='text-center'>
                                                    <Button variant='ghost' size='sm' onClick={() => handleDeleteRecord(v)} className='text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0'>
                                                        <Trash className='h-4 w-4' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={entryType === 'period' ? 9 : 6} className='text-center py-8 text-muted-foreground italic'>No records found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </ScrollArea>
                    
                    <DialogFooter className='p-6 border-t bg-gray-50'>
                        <Button variant='outline' onClick={() => setViewModalOpen(false)} className='rounded-full px-8'>Close Window</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                  -webkit-appearance: none; 
                  margin: 0; 
                }
            `}</style>
        </div>
    );
}
