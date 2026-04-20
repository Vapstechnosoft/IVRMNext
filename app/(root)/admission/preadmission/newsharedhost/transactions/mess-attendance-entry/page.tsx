'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Loader2,
    Search,
    Save,
    Trash2,
    X,
    Eye,
    Calendar as CalendarIcon,
    RefreshCw,
    History,
} from 'lucide-react';
import {
    useMessAttendanceLoadData,
    useGetStudentData,
    useGetStudents,
    useGetMonthClassHeld,
    useGetDatewiseAttMDM,
    useGetBatchList,
    useGetStdListPeriod,
    useViewAttendanceDetailsStaffWise,
    useSaveMessStudentAttendance,
    useDeleteAttendance,
    useAttendanceDeleteRecordWise,
} from '@/hooks/admission/preadmission/transactions/useMessAttendanceEntry';

export default function MessAttendanceEntryPage() {
    // --- State Management ---
    const [academicYearId, setAcademicYearId] = useState<string>('');
    const [classId, setClassId] = useState<string>('');
    const [sectionId, setSectionId] = useState<string>('');
    const [entryType, setEntryType] = useState<string>(''); // Dailyonce, Dailytwice, monthly, period
    const [doe, setDoe] = useState<string>(new Date().toISOString().split('T')[0]);
    const [monthId, setMonthId] = useState<string>('');
    const [subjectId, setSubjectId] = useState<string>('');
    const [periodId, setPeriodId] = useState<string>('');
    const [batchId, setBatchId] = useState<string>('');
    const [attendanceType, setAttendanceType] = useState<'Regular' | 'Extra Period'>('Regular');

    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [totalClassHeld, setTotalClassHeld] = useState<number>(0);

    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchValue, setSearchValue] = useState<string>('');
    const [updateCount, setUpdateCount] = useState<number>(0);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historySearch, setHistorySearch] = useState('');

    // --- Queries & Mutations ---
    const { data: loadData, isLoading: isLoadLoading } = useMessAttendanceLoadData(Number(academicYearId) || 0);
    const studentDataMutation = useGetStudentData();
    const studentsMutation = useGetStudents();
    const monthClassHeldMutation = useGetMonthClassHeld();
    const datewiseAttMutation = useGetDatewiseAttMDM();
    const batchListMutation = useGetBatchList();
    const stdListPeriodMutation = useGetStdListPeriod();
    const viewHistoryMutation = useViewAttendanceDetailsStaffWise();
    const saveMutation = useSaveMessStudentAttendance();
    const deleteMutation = useDeleteAttendance();
    const deleteRecordWiseMutation = useAttendanceDeleteRecordWise();

    // --- Derived Data ---
    const years = loadData?.academicYearList || [];
    const classes = loadData?.classList || [];
    const sections = loadData?.sectionList || [];
    const months = loadData?.monthList || [];
    const subjects = loadData?.subjectList || [];
    const periods = loadData?.periodlist || [];
    const batches = loadData?.batchList || [];

    const filteredStudents = useMemo(() => {
        if (!searchValue) return studentList;
        const search = searchValue.toLowerCase();
        return studentList.filter(s =>
            s.studentname?.toLowerCase().includes(search) ||
            s.amsT_AdmNo?.toLowerCase().includes(search) ||
            s.amsT_RegistrationNo?.toLowerCase().includes(search)
        );
    }, [studentList, searchValue]);

    // --- Handlers ---
    const handleYearChange = (val: string) => {
        setAcademicYearId(val);
        setClassId('');
        setSectionId('');
        setEntryType('');
        setStudentList([]);
    };

    const handleClassChange = async (val: string) => {
        setClassId(val);
        setSectionId('');
        setEntryType('');
        setStudentList([]);

        try {
            const res = await studentDataMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(val),
                classsecflag: '1'
            });

            if (res?.message) {
                // toast.info(res.message);
            }

            if (res?.asA_Att_EntryType) {
                const types = { 'D': 'Dailyonce', 'H': 'Dailytwice', 'M': 'monthly', 'P': 'period' };
                setEntryType((types as any)[res.asA_Att_EntryType] || '');
            }
        } catch (error) {
            toast.error('Failed to load class configuration');
        }
    };

    const fetchStudents = async (sId?: string, d?: string) => {
        const sid = sId || sectionId;
        const entryDate = d || doe;
        if (!academicYearId || !classId || !sid) return;

        try {
            let res;
            if (entryType === 'monthly') {
                if (!monthId) return;
                res = await monthClassHeldMutation.mutateAsync({
                    ASMAY_Id: Number(academicYearId),
                    ASMCL_Id: Number(classId),
                    ASMS_Id: Number(sid),
                    monthid: Number(monthId),
                    monthflag: 'M',
                    monthflag1: 'monthly',
                    ASA_FromDate: entryDate
                });
                setTotalClassHeld(res?.countclass || 0);
                setFromDate(res?.startdate ? new Date(res.startdate).toISOString().split('T')[0] : '');
                setToDate(res?.enddate ? new Date(res.enddate).toISOString().split('T')[0] : '');
            } else if (entryType === 'period') {
                // Period logic handled separately in handlePeriodChange or handleDOEChange
                return;
            } else {
                res = await datewiseAttMutation.mutateAsync({
                    ASMAY_Id: Number(academicYearId),
                    ASMCL_Id: Number(classId),
                    ASMS_Id: Number(sid),
                    monthid: 0,
                    monthflag: entryType === 'Dailyonce' ? 'D' : 'H',
                    monthflag1: entryType,
                    ASA_FromDate: entryDate
                });
            }

            if (res) {
                if (res.isHoliday) {
                    toast.warning(res.holidayMessage || "Selected date is a holiday.");
                    setStudentList([]);
                    return;
                }
                const list = res.studentList || [];
                setStudentList(list);
                setUpdateCount(res.countclass1 || 0);
                // In Angular, selected = true if pdays > 0
                setSelectedStudentIds(list.filter((s: any) => s.pdays > 0).map((s: any) => s.amsT_Id));
            }
        } catch (error) {
            toast.error('Failed to fetch students');
        }
    };

    const handleSectionChange = (val: string) => {
        setSectionId(val);
        fetchStudents(val);
    };

    const handleDOEChange = (val: string) => {
        setDoe(val);
        if (entryType === 'period') {
            handlePeriodChange(periodId, val);
        } else {
            fetchStudents(undefined, val);
        }
    };

    const handleMonthChange = async (val: string) => {
        setMonthId(val);
        // Cascades to fetching class held and student list
        if (!academicYearId || !classId || !sectionId) return;
        try {
            const res = await monthClassHeldMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                monthid: Number(val),
                monthflag: 'M',
                monthflag1: 'monthly',
                ASA_FromDate: doe
            });
            if (res) {
                setTotalClassHeld(res.countclass || 0);
                setStudentList(res.studentList || []);
                setUpdateCount(res.countclass1 || 0);
                setFromDate(res.startdate ? new Date(res.startdate).toISOString().split('T')[0] : '');
                setToDate(res.enddate ? new Date(res.enddate).toISOString().split('T')[0] : '');
                setSelectedStudentIds((res.studentList || []).filter((s: any) => s.pdays > 0).map((s: any) => s.amsT_Id));
            }
        } catch (error) {
            toast.error('Failed to load month data');
        }
    };

    const [isBatchRequired, setIsBatchRequired] = useState(false);

    const handleSubjectChange = async (val: string) => {
        setSubjectId(val);
        setPeriodId('');
        setBatchId('');
        try {
            const res = await batchListMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                ismS_Id: Number(val)
            });
            if (res?.batchList?.length > 0) {
                setIsBatchRequired(true);
            } else {
                setIsBatchRequired(false);
            }
        } catch (error) {
            toast.error('Failed to fetch batch list');
        }
    };

    const handlePeriodChange = async (pId: string, d?: string) => {
        const pid = pId || periodId;
        const entryDate = d || doe;
        setPeriodId(pid);
        if (!pid) return;

        try {
            const res = await stdListPeriodMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                ismS_Id: Number(subjectId),
                TTMP_Id: Number(pid),
                monthflag: 'P',
                monthflag1: 'period',
                ASA_FromDate: entryDate,
                asasB_Id: Number(batchId) || 0
            });
            if (res) {
                setStudentList(res.studentList || []);
                setUpdateCount(res.countclass1 || 0);
                setSelectedStudentIds((res.studentList || []).filter((s: any) => s.pdays > 0).map((s: any) => s.amsT_Id));
            }
        } catch (error) {
            toast.error('Failed to load period data');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.amsT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentSelect = (sId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(prev => [...prev, sId]);
        } else {
            setSelectedStudentIds(prev => prev.filter(id => id !== sId));
        }
    };

    const handleSave = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please complete all required filters');
            return;
        }

        const formattedList = studentList.map(s => ({
            ...s,
            selected: selectedStudentIds.includes(s.amsT_Id),
            pdays: selectedStudentIds.includes(s.amsT_Id) ? 1.0 : 0.0
        }));

        const payload = {
            ASAMDM_Id: 0, // In Angular code, it takes asamdM_Id
            ismS_Id: Number(subjectId) || 0,
            ASMAY_Id: Number(academicYearId),
            ASMCL_Id: Number(classId),
            ASMS_Id: Number(sectionId),
            TTMP_Id: Number(periodId) || 0,
            ASAMDM_Entry_DateTime: doe,
            asasB_Id: Number(batchId) || 0,
            stdList: formattedList
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            if (res?.returnval) {
                toast.success(res.message || 'Record Saved Successfully!');
                handleClear();
            } else {
                toast.error(res?.message || 'Record Not Saved Successfully!');
            }
        } catch (error) {
            toast.error('Network Error during save');
        }
    };

    const handleDelete = async () => {
        // Confirmation is handled via standard swal in legacy, here we can use a simpler flow or toast
        if (!window.confirm("Do you want to delete the selected attendance details?")) return;

        const payload = {
            ASMAY_Id: Number(academicYearId),
            ASMCL_Id: Number(classId),
            ASMS_Id: Number(sectionId),
            ASA_Entry_DateTime: new Date().toISOString().split('T')[0], // Entry date from legacy
            stdList: studentList,
            // ... other fields as per legacy
        };

        try {
            const res = await deleteMutation.mutateAsync(payload);
            if (res?.returnval) {
                toast.success('Record Deleted Successfully');
                handleClear();
            } else {
                toast.error('Failed to delete record');
            }
        } catch (error) {
            toast.error('Error during deletion');
        }
    };

    const handleClear = () => {
        setAcademicYearId('');
        setClassId('');
        setSectionId('');
        setEntryType('');
        setStudentList([]);
        setSelectedStudentIds([]);
        setUpdateCount(0);
        window.location.reload(); // Quick reset as per legacy reload
    };

    const openHistory = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please select academic year, class, and section');
            return;
        }
        try {
            const res = await viewHistoryMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                att_entry_type: entryType
            });
            if (res?.viewStudentPeriodWiseAttDetails) {
                setHistoryData(res.viewStudentPeriodWiseAttDetails);
                setIsHistoryOpen(true);
            } else {
                toast.info('No history found');
            }
        } catch (error) {
            toast.error('Failed to load history');
        }
    };

    const deleteHistoryRecord = async (userDelete: any) => {
        if (!window.confirm("Do you want to delete this record?")) return;
        try {
            const res = await deleteRecordWiseMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: Number(classId),
                ASMS_Id: Number(sectionId),
                ASA_Id: userDelete.ASA_Id,
                att_entry_type: entryType
            });
            if (res?.returnval) {
                toast.success('Deleted successfully');
                // Refresh list
                setHistoryData(prev => prev.filter(h => h.ASA_Id !== userDelete.ASA_Id));
            } else {
                toast.error('Deletion failed');
            }
        } catch (error) {
            toast.error('Error during record deletion');
        }
    };

    return (
        <div className='p-6 space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500'>
            {/* --- Filter Card --- */}
            <Card className='shadow-xl border-none bg-gradient-to-br from-white to-slate-50 rounded-3xl overflow-hidden'>
                <CardHeader className='bg-slate-900 border-b border-white/10 px-8 py-6'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-indigo-500/20 rounded-xl'>
                                <CalendarIcon className='w-6 h-6 text-indigo-400' />
                            </div>
                            <div>
                                <CardTitle className='text-2xl font-black text-white tracking-tight'>Mess Attendance Entry</CardTitle>
                                <p className='text-indigo-200/60 text-sm font-medium'>Record student attendance daily, monthly, or by period</p>
                            </div>
                        </div>
                        <Badge variant='outline' className='bg-white/5 border-white/10 text-indigo-300 font-bold px-4 py-1.5 rounded-full'>
                            Attendance Module
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className='p-8 space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        <div className='space-y-2'>
                            <Label className='text-sm font-bold text-slate-700 flex items-center gap-1.5'>
                                Academic Year <span className='text-rose-500'>*</span>
                            </Label>
                            <Select value={academicYearId} onValueChange={handleYearChange}>
                                <SelectTrigger className='w-full h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-indigo-500 transition-all text-base font-semibold'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent className='rounded-xl shadow-2xl border-slate-200'>
                                    {years.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()} className='font-medium py-3 cursor-pointer'>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='text-sm font-bold text-slate-700 flex items-center gap-1.5'>
                                Class <span className='text-rose-500'>*</span>
                            </Label>
                            <Select value={classId} onValueChange={handleClassChange} disabled={!academicYearId}>
                                <SelectTrigger className='w-full h-12 bg-white border-2 border-slate-200 rounded-xl focus:ring-indigo-500 transition-all text-base font-semibold'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent className='rounded-xl shadow-2xl border-slate-200'>
                                    {classes.map((c: any) => (
                                        <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()} className='font-medium py-3 cursor-pointer'>
                                            {c.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Entry Inputs Card --- */}
            {entryType && (
                <Card className='shadow-xl border-none bg-white rounded-3xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500'>
                    <CardHeader className='border-b border-slate-100 bg-slate-50/50 px-8 py-4'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='text-lg font-bold text-slate-800 flex items-center gap-2'>
                                <Badge className='bg-indigo-600'>{entryType.toUpperCase().replace('ONCE', ' ONCE').replace('TWICE', ' TWICE')}</Badge>
                                Entry Logic
                            </CardTitle>
                            <Button variant='ghost' size='sm' onClick={openHistory} className='text-indigo-600 font-bold hover:bg-white'>
                                <Eye className='w-4 h-4 mr-2' /> View Period Wise History
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-8 space-y-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                            {/* Left Side: Parameters */}
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label className='text-sm font-bold text-slate-700'>Section <span className='text-rose-500'>*</span></Label>
                                    <Select value={sectionId} onValueChange={handleSectionChange}>
                                        <SelectTrigger className='h-12 border-2 rounded-xl font-semibold'>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sections.map((s: any) => (
                                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {entryType === 'monthly' && (
                                    <div className='space-y-4 animate-in slide-in-from-left-4'>
                                        <div className='space-y-2'>
                                            <Label className='text-sm font-bold text-slate-700'>Month <span className='text-rose-500'>*</span></Label>
                                            <Select value={monthId} onValueChange={handleMonthChange}>
                                                <SelectTrigger className='h-12 border-2 rounded-xl font-semibold'>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {months.map((m: any) => (
                                                        <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>{m.ivrM_Month_Name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-xs font-bold text-slate-400'>Attendance From Date</Label>
                                                <Input type='date' value={fromDate} readOnly className='bg-slate-50 border-none' />
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-xs font-bold text-slate-400'>Attendance To Date</Label>
                                                <Input type='date' value={toDate} readOnly className='bg-slate-50 border-none' />
                                            </div>
                                        </div>
                                        <div className='p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between'>
                                            <span className='font-bold text-indigo-700'>Total Class Helds:</span>
                                            <Badge variant='secondary' className='text-xl px-4 py-1 bg-white text-indigo-600 border-indigo-200'>{totalClassHeld}</Badge>
                                        </div>
                                    </div>
                                )}

                                {entryType === 'period' && (
                                    <div className='space-y-6 animate-in slide-in-from-left-4'>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm font-bold text-slate-700'>Subject <span className='text-rose-500'>*</span></Label>
                                                <Select value={subjectId} onValueChange={handleSubjectChange}>
                                                    <SelectTrigger className='h-12 border-2 rounded-xl font-semibold'>
                                                        <SelectValue placeholder='Select Subject' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects.map((s: any) => (
                                                            <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>{s.ismS_SubjectName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm font-bold text-slate-700'>
                                                    Batch {isBatchRequired && <span className='text-rose-500'>*</span>}
                                                </Label>
                                                <Select value={batchId} onValueChange={setBatchId}>
                                                    <SelectTrigger className='h-12 border-2 rounded-xl font-semibold'>
                                                        <SelectValue placeholder='Select Batch' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {batches.map((b: any) => (
                                                            <SelectItem key={b.asasB_Id} value={b.asasB_Id.toString()}>{b.asasB_BatchName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label className='text-sm font-bold text-slate-700'>Period <span className='text-rose-500'>*</span></Label>
                                            <Select value={periodId} onValueChange={handlePeriodChange}>
                                                <SelectTrigger className='h-12 border-2 rounded-xl font-semibold'>
                                                    <SelectValue placeholder='Select Period' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {periods.map((p: any) => (
                                                        <SelectItem key={p.ttmP_Id} value={p.ttmP_Id.toString()}>{p.ttmP_PeriodName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: DOE & Radio Logic */}
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label className='text-sm font-bold text-slate-700'>Date of Entry (DOE) <span className='text-rose-500'>*</span></Label>
                                    <div className='relative'>
                                        <Input
                                            type='date'
                                            value={doe}
                                            onChange={(e) => handleDOEChange(e.target.value)}
                                            className='h-12 pl-10 border-2 rounded-xl font-semibold focus:ring-indigo-500'
                                        />
                                        <CalendarIcon className='absolute left-3 top-3.5 w-5 h-5 text-slate-400' />
                                    </div>
                                </div>

                                {entryType === 'period' && (
                                    <div className='p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4'>
                                        <Label className='text-xs font-black uppercase text-slate-400 tracking-wider'>Attendance Mode</Label>
                                        <RadioGroup value={attendanceType} onValueChange={(val: any) => setAttendanceType(val)} className='flex flex-col gap-3'>
                                            <div className='flex items-center space-x-3 p-3 bg-white border-2 border-transparent hover:border-indigo-500 rounded-2xl cursor-pointer transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50'>
                                                <RadioGroupItem value='Regular' id='regular' className='text-indigo-600' />
                                                <Label htmlFor='regular' className='font-bold text-slate-800 cursor-pointer flex-1'>Regular Period</Label>
                                            </div>
                                            <div className='flex items-center space-x-3 p-3 bg-white border-2 border-transparent hover:border-indigo-500 rounded-2xl cursor-pointer transition-all has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50'>
                                                <RadioGroupItem value='Extra Period' id='extra' />
                                                <Label htmlFor='extra' className='font-bold text-slate-800 cursor-pointer flex-1'>Extra Period</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                )}

                                <div className='p-6 bg-indigo-500 text-white rounded-3xl shadow-lg'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <p className='text-indigo-100 text-xs font-bold uppercase tracking-widest'>Current Status</p>
                                            <h4 className='text-xl font-black mt-1'>{updateCount > 0 ? 'Update Mode' : 'New Entry'}</h4>
                                        </div>
                                        <div className='p-3 bg-white/20 rounded-2xl'>
                                            {updateCount > 0 ? <RefreshCw className='w-8 h-8' /> : <Save className='w-8 h-8' />}
                                        </div>
                                    </div>
                                    <p className='text-sm mt-4 text-indigo-100/80 leading-relaxed font-medium'>
                                        {updateCount > 0
                                            ? 'Existing attendance record found. Changes will update the current data.'
                                            : 'No record found for the selected criteria. A new entry will be created.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- Student Grid Card --- */}
            {studentList.length > 0 && (
                <Card className='shadow-2xl border-none bg-white rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500'>
                    <CardHeader className='border-b border-slate-100 bg-slate-900/5 px-8 py-6'>
                        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                            <div>
                                <CardTitle className='text-xl font-black text-slate-800 tracking-tight'>Student Attendance Register</CardTitle>
                                <p className='text-slate-500 text-xs font-bold uppercase mt-1 tracking-widest flex items-center gap-1.5'>
                                    <Badge size='sm' className='bg-indigo-600 text-[10px]'>{filteredStudents.length} Students</Badge>
                                </p>
                            </div>
                            <div className='flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-inner border-2 border-slate-100'>
                                <div className='relative'>
                                    <Search className='absolute left-3 top-3 w-4 h-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by name, roll no...'
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className='pl-9 border-none bg-transparent h-10 w-[300px] text-sm font-semibold'
                                    />
                                </div>
                                <div className='h-8 w-[2px] bg-slate-100' />
                                <div className='flex items-center gap-2 pr-4'>
                                    <Checkbox
                                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                        onCheckedChange={handleSelectAll}
                                        className='rounded-md border-2 border-indigo-400'
                                    />
                                    <Label className='text-xs font-black text-indigo-600 uppercase cursor-pointer'>Select All</Label>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <div className='max-h-[600px] overflow-auto scroll-smooth custom-scrollbar'>
                            <Table>
                                <TableHeader className='bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md'>
                                    <TableRow className='hover:bg-transparent border-slate-200'>
                                        <TableHead className='w-16 text-center font-black text-slate-400 text-[10px] uppercase'>SL.</TableHead>
                                        <TableHead className='font-black text-slate-400 text-[10px] uppercase'>Student Name</TableHead>
                                        <TableHead className='font-black text-slate-400 text-[10px] uppercase'>Adm No.</TableHead>
                                        <TableHead className='font-black text-slate-400 text-[10px] uppercase'>Reg No.</TableHead>
                                        <TableHead className='text-center font-black text-slate-400 text-[10px] uppercase'>Roll No.</TableHead>
                                        <TableHead className='text-center font-black text-indigo-600 text-[10px] uppercase w-32'>Attendance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((s, idx) => (
                                        <TableRow
                                            key={s.amsT_Id}
                                            className='group hover:bg-indigo-50/30 transition-colors border-slate-100'
                                        >
                                            <TableCell className='text-center text-slate-400 font-bold'>
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex flex-col'>
                                                    <span className='font-black text-slate-800 text-sm'>{s.studentname}</span>
                                                    <span className='text-[10px] font-bold text-slate-400'>ID: {s.amsT_Id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className='font-bold text-slate-600 text-xs'>{s.amsT_AdmNo}</TableCell>
                                            <TableCell className='font-bold text-slate-500 text-xs'>{s.amsT_RegistrationNo}</TableCell>
                                            <TableCell className='text-center'>
                                                <Badge variant='outline' className='bg-white font-bold text-indigo-600 border-indigo-100'>{s.amaY_RollNo}</Badge>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <div className='flex items-center justify-center'>
                                                    <Checkbox
                                                        id={`s-${s.amsT_Id}`}
                                                        checked={selectedStudentIds.includes(s.amsT_Id)}
                                                        onCheckedChange={(checked: boolean) => handleStudentSelect(s.amsT_Id, checked)}
                                                        className='w-6 h-6 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-600 transition-all scale-110'
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* --- Footer Actions --- */}
                        <div className='p-8 bg-slate-50 border-t border-slate-100'>
                            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
                                <Button
                                    size='lg'
                                    onClick={handleSave}
                                    disabled={saveMutation.isPending}
                                    className='min-w-[200px] h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50'
                                >
                                    {saveMutation.isPending ? (
                                        <Loader2 className='w-6 h-6 animate-spin mr-3' />
                                    ) : (
                                        updateCount > 0 ? <RefreshCw className='w-6 h-6 mr-3' /> : <Save className='w-6 h-6 mr-3' />
                                    )}
                                    {updateCount > 0 ? 'UPDATE RECORD' : 'SAVE ATTENDANCE'}
                                </Button>

                                {updateCount > 0 && (
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        onClick={handleDelete}
                                        className='min-w-[160px] h-14 border-2 border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl font-black text-base shadow-lg shadow-rose-100 transition-all'
                                    >
                                        <Trash2 className='w-6 h-6 mr-2' /> DELETE
                                    </Button>
                                )}

                                <Button
                                    variant='ghost'
                                    size='lg'
                                    onClick={handleClear}
                                    className='min-w-[140px] h-14 text-slate-400 hover:text-slate-800 font-bold text-base'
                                >
                                    <X className='w-5 h-5 mr-2' /> CANCEL
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- History Modal --- */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className='max-w-6xl rounded-3xl overflow-hidden p-0 bg-white border-none shadow-2xl'>
                    <DialogHeader className='bg-slate-900 px-8 py-6 text-white'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 bg-white/10 rounded-xl'>
                                    <History className='w-6 h-6 text-indigo-400' />
                                </div>
                                <div>
                                    <DialogTitle className='text-2xl font-black'>Attendance Records</DialogTitle>
                                    <p className='text-slate-400 text-xs font-bold uppercase tracking-widest mt-1'>Review and manage previous entries</p>
                                </div>
                            </div>
                            <div className='relative'>
                                <Search className='absolute left-3 top-2.5 w-4 h-4 text-slate-500' />
                                <Input
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    placeholder='Quick search history...'
                                    className='bg-white/5 border-white/10 text-white pl-10 h-10 w-64 rounded-xl text-sm'
                                />
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='p-8 h-[600px] overflow-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow className='border-slate-100'>
                                    <TableHead className='font-black text-[10px] text-slate-400 uppercase'>Details</TableHead>
                                    <TableHead className='font-black text-[10px] text-slate-400 uppercase text-center whitespace-nowrap'>Attendance Date</TableHead>
                                    <TableHead className='font-black text-[10px] text-slate-400 uppercase text-center'>Entry Info</TableHead>
                                    <TableHead className='font-black text-[10px] text-slate-400 uppercase text-center'>Counts</TableHead>
                                    <TableHead className='font-black text-[10px] text-slate-400 uppercase text-center'>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historyData.filter(h =>
                                    h.ASMAY_Year?.toLowerCase().includes(historySearch.toLowerCase()) ||
                                    h.EMPLOYEENAME?.toLowerCase().includes(historySearch.toLowerCase())
                                ).map((h, i) => (
                                    <TableRow key={i} className='hover:bg-slate-50/80 border-slate-50'>
                                        <TableCell>
                                            <div className='space-y-1'>
                                                <Badge variant='outline' className='font-bold text-indigo-600 bg-indigo-50/50 border-indigo-100'>{h.ASMAY_Year}</Badge>
                                                <div className='flex flex-col text-xs font-bold text-slate-700'>
                                                    <span>{h.ASMCL_ClassName} ({h.ASMC_SectionName})</span>
                                                    {h.ISMS_SUBJECTNAME && <span className='text-indigo-500 uppercase'>{h.ISMS_SUBJECTNAME}</span>}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center text-sm font-black text-slate-800'>
                                            {h.ASA_FROMDATE && format(new Date(h.ASA_FROMDATE), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <div className='flex flex-col text-xs'>
                                                <span className='font-bold text-slate-800'>{h.EMPLOYEENAME}</span>
                                                <span className='text-slate-400 font-medium'>{h.ASA_Entry_DateTime && format(new Date(h.ASA_Entry_DateTime), 'dd/MM/yy HH:mm')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Badge className='bg-emerald-50 text-emerald-600 border-emerald-100 font-bold'>P: {h.PresentCount}</Badge>
                                                <Badge className='bg-rose-50 text-rose-600 border-rose-100 font-bold'>A: {h.AbsentCount}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => deleteHistoryRecord(h)}
                                                className='text-slate-300 hover:text-rose-600 transition-colors'
                                            >
                                                <Trash2 className='w-5 h-5' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <DialogFooter className='bg-slate-50 p-6 flex justify-end gap-3'>
                        <Button variant='outline' onClick={() => setIsHistoryOpen(false)} className='rounded-xl px-8 font-black text-slate-500'>
                            CLOSE
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}

