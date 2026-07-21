'use client';

import { format } from 'date-fns';
import {
    ChevronRight,
    Loader2,
    RotateCcw,
    Save,
    Search,
    Users,
    Trash2,
    LayoutDashboard,
    School,
    CheckCircle2,
    Calendar as CalendarIcon,
    Eye
} from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import {
    useStudentAttendanceInitialData,
    useGetStudentData,
    useSaveAttendance,
    useGetMonthClassHeld,
    useGetDateWiseAttendance,
    useGetStdListPeriod,
    useDeleteAttendance,
    useViewAttendance,
} from '@/hooks/admission/preadmission/transactions/useStudentAttendanceEntry';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function StudentAttendanceEntryPage() {
    /* -------------------- State -------------------- */
    const [asmayId, setAsmayId] = useState<number>(0);
    const [asmclId, setAsmclId] = useState<number>(0);
    const [asmsId, setAsmsId] = useState<number>(0);
    const [attDate, setAttDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [entryType, setEntryType] = useState<string>('');
    const [monthId, setMonthId] = useState<number>(0);
    const [periodId, setPeriodId] = useState<number>(0);
    const [subjectId, setSubjectId] = useState<number>(0);
    const [attEntryTypeFlag, setAttEntryTypeFlag] = useState<string>('');
    const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [viewAttendanceList, setViewAttendanceList] = useState<any[]>([]);

    /* -------------------- Hooks -------------------- */
    const { data: initialData } = useStudentAttendanceInitialData();
    const getStudentDataMutation = useGetStudentData();
    const saveMutation = useSaveAttendance();
    const getMonthClassHeldMutation = useGetMonthClassHeld();
    const getDateWiseAttendanceMutation = useGetDateWiseAttendance();
    const getStdListPeriodMutation = useGetStdListPeriod();
    const deleteMutation = useDeleteAttendance();
    const viewAttendanceMutation = useViewAttendance();
    const [isPending, startTransition] = useTransition();

    /* -------------------- Effects -------------------- */
    useEffect(() => {
        if (initialData?.data) {
            const data = initialData.data as any;

            // Auto-select Current Year
            const current = data.currentYear?.[0];
            if (current && asmayId === 0) {
                setAsmayId(current.asmaY_Id);
            }

            // Populate Initial Sections if available
            if (data.sectionList?.length > 0 && sectionList.length === 0) {
                setSectionList(data.sectionList);
            }

            // Configure Entry Type from settings
            const entryConfig = data.attendance_entrytype?.[0];
            if (entryConfig) {
                if (!attEntryTypeFlag) {
                    setAttEntryTypeFlag(entryConfig.asC_Att_DefaultEntry_Type === 'A'
                        ? 'Attendance Entry Type Is Absent'
                        : 'Attendance Entry Type Is Present');
                }
                if (!entryType) {
                    const scheduler = entryConfig.asC_Att_Scheduler_Flag;
                    if (scheduler === 'EOD') setEntryType('Dailyonce');
                    else if (scheduler === 'Daily Twice') setEntryType('Dailytwice');
                    else if (scheduler === 'Monthly') setEntryType('monthly');
                    else if (scheduler === 'Period') setEntryType('period');
                }
            }
        }
    }, [initialData, asmayId, attEntryTypeFlag, entryType, sectionList.length]);

    // Auto-fetch on Section or Date change
    useEffect(() => {
        if (asmayId > 0 && asmclId > 0 && asmsId > 0 && attDate) {
            fetchStudents();
        }
    }, [asmayId, asmclId, asmsId, attDate, entryType, monthId, subjectId, periodId]);

    /* -------------------- Handlers -------------------- */
    const handleClassChange = async (cId: number) => {
        setAsmclId(cId);
        setAsmsId(0);
        setStudentList([]);
        try {
            const res = await getStudentDataMutation.mutateAsync({ ASMAY_Id: asmayId, ASMCL_Id: cId, classsecflag: '1' });
            const pData = res?.data || res;
            if (pData) {
                setSectionList(pData.sectionList || []);
                if (pData.asA_Att_EntryType === 'Dailyonce') setEntryType('Dailyonce');
                else if (pData.asA_Att_EntryType === 'Dailytwice') setEntryType('Dailytwice');
                else if (pData.asA_Att_EntryType === 'monthly') setEntryType('monthly');
                else if (pData.asA_Att_EntryType === 'period') setEntryType('period');
                if (pData.attendanceentryflag) setAttEntryTypeFlag(pData.attendanceentryflag === 'A' ? 'Attendance Entry Type Is Absent' : 'Attendance Entry Type Is Present');
            }
        } catch (error) { toast.error('Error loading class details'); }
    };

    const fetchStudents = async () => {
        if (!asmayId || !asmclId || !asmsId) return;
        startTransition(async () => {
            try {
                let res: any;
                const getFlag = (type: string) => {
                    if (type === 'Dailyonce') return 'Dailyonce';
                    if (type === 'Dailytwice') return 'Dailytwice';
                    if (type === 'monthly') return 'monthly';
                    if (type === 'period') return 'period';
                    return 'D';
                };
                const flag = getFlag(entryType);

                if (entryType === 'period') {
                    res = await getStdListPeriodMutation.mutateAsync({ ASMAY_Id: asmayId, ASMCL_Id: asmclId, ASMS_Id: asmsId, ismS_Id: subjectId, TTMP_Id: periodId, ASA_Entry_DateTime: attDate, att_entry_type: 'period' });
                } else if (entryType === 'monthly') {
                    res = await getMonthClassHeldMutation.mutateAsync({ ASMAY_Id: asmayId, ASMCL_Id: asmclId, ASMS_Id: asmsId, IVRM_Month_Id: monthId, monthflag1: 'monthly', asamdM_Entry_DateTime: attDate });
                } else {
                    res = await getStudentDataMutation.mutateAsync({ asmaY_Id: asmayId, asmcL_Id: asmclId, asmS_Id: asmsId, asa_FromDate: attDate, monthflag: flag, monthflag1: flag, classsecflag: '0', checksubject: '0', monthid: monthId, ismS_Id: subjectId, ttmP_Id: periodId });
                }

                // Resilient data extraction
                const responseData = res?.data || res;
                const sList = responseData?.studentList ||
                    responseData?.studentList1 ||
                    responseData?.studestudentList1 ||
                    responseData?.students ||
                    responseData?.studentList5 ||
                    responseData?.data?.studentList ||
                    responseData?.data?.studentList1 ||
                    responseData?.data?.studestudentList1 ||
                    responseData?.data?.students || [];

                if (sList.length > 0) {
                    const isAbsentMode = attEntryTypeFlag.includes('Absent');
                    setStudentList(sList.map((s: any) => {
                        let isSelected = false;
                        if (s.asA_Id > 0 || s.asaS_Id > 0 || s.ASAS_Id > 0) {
                            isSelected = isAbsentMode ? (s.pdays === 0) : (s.pdays > 0 || s.selected === true || s.FirstHalfflag === true || s.SecondHalfflag === true);
                        } else {
                            isSelected = !isAbsentMode;
                        }
                        return {
                            ...s,
                            AMST_Id: s.amsT_Id || s.AMST_Id,
                            studentName: s.studentname || s.studentName,
                            selected: isSelected,
                            FirstHalfflag: s.FirstHalfflag ?? isSelected,
                            SecondHalfflag: s.SecondHalfflag ?? isSelected
                        };
                    }));
                } else {
                    setStudentList([]);
                }
            } catch (error) { setStudentList([]); }
        });
    };

    useEffect(() => {
        if (asmayId && asmclId && asmsId) {
            fetchStudents();
        } else {
            setStudentList([]);
        }
    }, [asmayId, asmclId, asmsId, attDate, subjectId, periodId, monthId, entryType]);

    const onSave = async () => {
        if (studentList.length === 0) return toast.error('Fetch student list first');

        const now = new Date().toISOString();
        const formattedDate = attDate.includes('T') ? attDate : `${attDate}T00:00:00Z`;

        const payload: any = {
            ASMAY_Id: asmayId,
            ASMCL_Id: asmclId,
            ASMS_Id: asmsId,
            ASA_Att_Type: entryType,
            ASA_FromDate: formattedDate,
            ASA_ToDate: formattedDate,
            ASA_ClassHeld: "1",
            ASA_Entry_DateTime: now,
            ASA_Network_IP: "192.168.1.1",
        };

        if (entryType === 'period') {
            payload.ismS_Id = subjectId;
            payload.ISMP_Id = periodId;
            payload.TTMP_Id = periodId;
            payload.ASA_Regular_Extra = "Regular";
            payload.asasB_Id = 1; // Default as per example
            payload.stdList = studentList.map(s => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                selected: s.selected,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else if (entryType === 'Dailytwice') {
            payload.stdList = studentList.map(s => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                FirstHalfflag: s.FirstHalfflag,
                SecondHalfflag: s.SecondHalfflag,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else if (entryType === 'monthly') {
            payload.stdList = studentList.map(s => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                pdays: Number(s.pdays || 0),
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        } else {
            // Dailyonce or general
            payload.stdList = studentList.map(s => ({
                AMST_Id: s.AMST_Id || s.amsT_Id,
                selected: s.selected,
                ASAS_Id: s.ASAS_Id || s.asaS_Id || null,
                ASA_Id: s.asA_Id || 0
            }));
        }

        const res = await saveMutation.mutateAsync(payload);
        if (res.success) {
            await Swal.fire('Success', res.message || 'Attendance saved successfully', 'success');
            window.location.reload();
        } else {
            toast.error(res.message || 'Failed to save attendance');
        }
    };

    const onViewAttendance = async () => {
        if (!asmayId || !asmclId || !asmsId) {
            return toast.error('Please select Academic Year, Class and Section');
        }
        try {
            const res = await viewAttendanceMutation.mutateAsync({
                ASMAY_Id: asmayId,
                ASMCL_Id: asmclId,
                ASMS_Id: asmsId,
                att_entry_type: entryType
            });
            const list: any[] = (res as any)?.viewStudentPeriodWiseAttDetails || (res as any)?.data || (Array.isArray(res) ? res : []);
            if (list && list.length > 0) {
                setViewAttendanceList(list);
                setIsViewModalOpen(true);
            } else {
                toast.info('No records found for the selection');
            }
        } catch (error) {
            toast.error('Failed to load attendance details');
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({ title: 'Delete Attendance?', text: 'This will remove the selected attendance record permanently.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Yes, Delete' });
        if (result.isConfirmed) {
            const res = await deleteMutation.mutateAsync({ ASMAY_Id: asmayId, ASMCL_Id: asmclId, ASMS_Id: asmsId, ASA_Entry_DateTime: attDate, att_entry_type: entryType });
            if (res.success) {
                Swal.fire('Deleted', res.message || 'Record removed.', 'success');
                setStudentList([]);
            } else {
                toast.error(res.message || 'Failed to delete record');
            }
        }
    };

    const getEntryTypeLabel = () => {
        switch (entryType) {
            case 'Dailyonce': return 'DAILY ONCE';
            case 'Dailytwice': return 'DAILY TWICE';
            case 'monthly': return 'MONTHLY';
            case 'period': return 'PERIOD WISE';
            default: return 'ATTENDANCE ENTRY DETAILS';
        }
    };

    const filteredStudents = studentList.filter(s => {
        const sName = (s.studentname || s.studentName || '').toString().toLowerCase();
        const sAdm = (s.amsT_AdmNo || '').toString().toLowerCase();
        const search = searchTerm.toLowerCase();
        return sName.includes(search) || sAdm.includes(search);
    });

    if (!initialData) return <div className='h-screen flex items-center justify-center bg-[#edf2f9]'><Loader2 className='h-8 w-8 animate-spin text-[#3c8dbc]' /></div>;

    return (
        <div className='min-h-screen bg-[#edf2f9] p-4 space-y-4 font-sans'>
            {/* Header / Breadcrumbs */}
            <div className='flex items-center justify-between text-[#003366] text-[11px] font-bold uppercase tracking-tight mb-1'>
                <div className='flex items-center gap-1'>
                    <span>ATTENDANCE</span>
                    <ChevronRight className='h-3 w-3' />
                    <span className='text-gray-400'>Student Attendance Entry</span>
                </div>
            </div>

            {/* Card 1: Initial Selection */}
            <Card className='rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm'>
                <CardHeader className='py-1 px-4 bg-white border-b flex flex-row items-center justify-between min-h-[36px]'>
                    <CardTitle className='text-[11px] font-bold text-[#003366]'>ATTENDANCE ENTRY</CardTitle>
                    <div className='text-xs font-bold text-gray-400 cursor-pointer'>_</div>
                </CardHeader>
                <CardContent className='p-6'>
                    <div className='max-w-2xl mx-auto space-y-3'>
                        <div className='flex items-center gap-4'>
                            <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Academic Year: <span className='text-red-500'>*</span></Label>
                            <div className='w-64'>
                                <Select value={asmayId.toString()} onValueChange={(v) => setAsmayId(Number(v))}>
                                    <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Year' /></SelectTrigger>
                                    <SelectContent>
                                        {(initialData?.data as any)?.academicYearList?.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Class: <span className='text-red-500'>*</span></Label>
                            <div className='w-64 relative'>
                                <Select value={asmclId.toString()} onValueChange={(v) => handleClassChange(Number(v))}>
                                    <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px] px-2'>
                                        <div className='flex items-center gap-2'>
                                            <Search className='h-3 w-3 text-gray-400' />
                                            <SelectValue placeholder='Search...' />
                                        </div>
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
                </CardContent>
            </Card>

            {/* Card 2: Configuration */}
            {asmclId > 0 && (
                <Card className='rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm'>
                    <CardHeader className='py-1 px-4 bg-white border-b flex flex-row items-center justify-between min-h-[36px]'>
                        <CardTitle className='text-[11px] font-bold text-[#003366] uppercase'>{getEntryTypeLabel()}</CardTitle>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                onClick={onViewAttendance}
                                disabled={viewAttendanceMutation.isPending}
                                className='h-6 bg-[#3c8dbc] text-white text-[10px] font-bold px-3 hover:bg-[#367fa9] rounded-sm'
                            >
                                {viewAttendanceMutation.isPending ? (
                                    <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                ) : (
                                    <Eye className='h-3 w-3 mr-1' />
                                )}
                                View Period Wise Attendance
                            </Button>
                            <div className='text-xs font-bold text-gray-400 cursor-pointer'>_</div>
                        </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='max-w-5xl mx-auto space-y-6'>
                            <div className='flex justify-center'>
                                <div className='border rounded-sm p-2 bg-[#f9fafc]'>
                                    <RadioGroup value={entryType} onValueChange={setEntryType} className='flex gap-8'>
                                        {[
                                            { label: 'Daily Once', value: 'Dailyonce' },
                                            { label: 'Daily Twice', value: 'Dailytwice' },
                                            { label: 'Monthly', value: 'monthly' },
                                            { label: 'Period Wise', value: 'period' }
                                        ].map((item) => (
                                            <div key={item.value} className='flex items-center space-x-1.5'>
                                                <RadioGroupItem value={item.value} id={item.value} disabled className='h-3 w-3 border-gray-400' />
                                                <Label htmlFor={item.value} className='text-[10px] font-bold text-gray-600 cursor-pointer'>{item.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3'>
                                <div className='flex items-center gap-4'>
                                    <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Section: <span className='text-red-500'>*</span></Label>
                                    <div className='w-64'>
                                        <Select value={asmsId.toString()} onValueChange={(v) => setAsmsId(Number(v))}>
                                            <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Section' /></SelectTrigger>
                                            <SelectContent>
                                                {sectionList.map((s: any) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>{s.asmC_SectionName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className='flex items-center gap-4'>
                                    <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>DOE: <span className='text-red-500'>*</span></Label>
                                    <div className='relative w-64'>
                                        <Input 
                                            type='date' 
                                            value={attDate} 
                                            onChange={(e) => setAttDate(e.target.value)} 
                                            className='h-7 rounded-sm border-gray-300 text-[11px] pl-2 pr-8 cursor-pointer relative z-10 bg-transparent' 
                                        />
                                        <CalendarIcon className='absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none' />
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            input[type="date"]::-webkit-calendar-picker-indicator {
                                                position: absolute;
                                                left: 0;
                                                top: 0;
                                                width: 100%;
                                                height: 100%;
                                                margin: 0;
                                                padding: 0;
                                                cursor: pointer;
                                                opacity: 0;
                                            }
                                        ` }} />
                                    </div>
                                </div>

                                {entryType === 'monthly' && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Month: <span className='text-red-500'>*</span></Label>
                                        <div className='w-64'>
                                            <Select value={monthId.toString()} onValueChange={(v) => setMonthId(Number(v))}>
                                                <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Month' /></SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.monthList?.map((m: any) => (
                                                        <SelectItem key={m.ivrM_Month_Id} value={m.ivrM_Month_Id.toString()}>{m.ivrM_Month_Name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                                {/* {(entryType === 'period' || (initialData?.data as any)?.subjectList?.length > 0) && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Subject: <span className='text-red-500'>*</span></Label>
                                        <Select value={subjectId.toString()} onValueChange={(v) => setSubjectId(Number(v))}>
                                            <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Subject' /></SelectTrigger>
                                            <SelectContent>
                                                {(initialData?.data as any)?.subjectList?.map((s: any) => (
                                                    <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()}>{s.ismS_SubjectName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} */}
                                {entryType === 'period' && (
                                    <div className='flex items-center gap-4'>
                                        <Label className='text-[11px] font-bold text-gray-700 w-40 text-right'>Period: <span className='text-red-500'>*</span></Label>
                                        <div className='w-64'>
                                            <Select value={periodId.toString()} onValueChange={(v) => setPeriodId(Number(v))}>
                                                <SelectTrigger className='h-7 rounded-sm border-gray-300 w-full text-[11px]'><SelectValue placeholder='Select Period' /></SelectTrigger>
                                                <SelectContent>
                                                    {(initialData?.data as any)?.periodlist?.map((p: any) => (
                                                        <SelectItem key={p.ttmP_Id} value={p.ttmP_Id.toString()}>{p.ttmP_PeriodName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Card 3: Student Details */}
            {asmsId > 0 && (
                <Card className='rounded-none border-t-2 border-t-[#3c8dbc] shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500'>
                    <CardHeader className='py-1 px-4 bg-white border-b flex flex-row items-center justify-between min-h-[36px]'>
                        <CardTitle className='text-[11px] font-bold text-[#003366]'>STUDENT DETAILS</CardTitle>
                        <div className='text-xs font-bold text-gray-400 cursor-pointer'>_</div>
                    </CardHeader>
                    <CardContent className='p-4 space-y-4'>
                        <div className='flex items-center justify-between'>
                            <span className='text-[11px] font-bold text-[#3c8dbc]'>{attEntryTypeFlag}</span>
                            <div className='flex items-center gap-2 border px-2 py-1 bg-white rounded-sm w-[250px] shadow-inner'>
                                <Search className='h-3 w-3 text-gray-400' />
                                <Input
                                    placeholder='search here...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='h-5 border-none shadow-none text-[11px] focus-visible:ring-0 p-0'
                                />
                            </div>
                        </div>

                        {isPending ? (
                            <div className='h-40 flex items-center justify-center'><Loader2 className='h-6 w-6 animate-spin text-[#3c8dbc]' /></div>
                        ) : (
                            <div className='overflow-x-auto border'>
                                <Table className='border-collapse'>
                                    <TableHeader className='bg-[#3c8dbc]'>
                                        <TableRow className='h-9'>
                                            <TableHead className='text-center border-r font-bold text-white w-16 text-[10px]'>SL NO</TableHead>
                                            <TableHead className='text-center border-r font-bold text-white w-20 text-[10px]'>ROLL NO</TableHead>
                                            <TableHead className='border-r font-bold text-white text-[10px]'>STUDENT NAME</TableHead>
                                            <TableHead className='border-r font-bold text-white text-[10px]'>ADMISSION NO</TableHead>
                                            {entryType === 'Dailytwice' ? (
                                                <>
                                                    <TableHead className='text-center border-r font-bold text-white w-24 text-[10px]'>FIRST HALF</TableHead>
                                                    <TableHead className='text-center font-bold text-white w-24 text-[10px]'>SECOND HALF</TableHead>
                                                </>
                                            ) : (
                                                <TableHead className='text-center font-bold text-white w-24 text-[10px]'>ATTENDANCE</TableHead>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => (
                                            <TableRow key={idx} className='h-10 border-b border-gray-100 hover:bg-[#f1f4f9] transition-colors'>
                                                <TableCell className='text-center border-r text-[11px] text-gray-500'>{idx + 1}</TableCell>
                                                <TableCell className='text-center border-r text-[11px] text-gray-500'>{s.amaY_RollNo || '-'}</TableCell>
                                                <TableCell className='border-r font-bold text-gray-700 text-[11px] uppercase'>{s.studentname || s.studentName}</TableCell>
                                                <TableCell className='border-r text-[11px] text-gray-500'>{s.amsT_AdmNo}</TableCell>
                                                {entryType === 'Dailytwice' ? (
                                                    <>
                                                        <TableCell className='text-center border-r'>
                                                            <Checkbox
                                                                checked={s.FirstHalfflag}
                                                                onCheckedChange={(v) => {
                                                                    const newList = [...studentList];
                                                                    const actualIdx = studentList.findIndex(item => item.AMST_Id === s.AMST_Id);
                                                                    if (actualIdx > -1) { newList[actualIdx].FirstHalfflag = !!v; setStudentList(newList); }
                                                                }}
                                                                className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:bg-[#3c8dbc] data-[state=checked]:border-[#3c8dbc]'
                                                            />
                                                        </TableCell>
                                                        <TableCell className='text-center'>
                                                            <Checkbox
                                                                checked={s.SecondHalfflag}
                                                                onCheckedChange={(v) => {
                                                                    const newList = [...studentList];
                                                                    const actualIdx = studentList.findIndex(item => item.AMST_Id === s.AMST_Id);
                                                                    if (actualIdx > -1) { newList[actualIdx].SecondHalfflag = !!v; setStudentList(newList); }
                                                                }}
                                                                className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:bg-[#3c8dbc] data-[state=checked]:border-[#3c8dbc]'
                                                            />
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <TableCell className='text-center'>
                                                        <Checkbox checked={s.selected} onCheckedChange={(v) => { const newList = [...studentList]; const actualIdx = studentList.findIndex(item => (item.AMST_Id || item.amsT_Id) === (s.AMST_Id || s.amsT_Id)); if (actualIdx > -1) { newList[actualIdx].selected = !!v; setStudentList(newList); } }} className='h-3.5 w-3.5 border-gray-400 data-[state=checked]:bg-[#3c8dbc] data-[state=checked]:border-[#3c8dbc]' />
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={5} className='text-center text-xs py-10 text-gray-400'>No student data available</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {studentList.length > 0 && (
                            <div className='flex justify-center gap-2 pt-2'>
                                <Button
                                    onClick={onSave}
                                    disabled={saveMutation.isPending}
                                    className='bg-[#00a65a] hover:bg-[#008d4c] h-7 rounded-sm text-[10px] font-bold px-6'
                                >
                                    {saveMutation.isPending ? (
                                        <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />
                                    ) : (
                                        <Save className='h-3.5 w-3.5 mr-1.5' />
                                    )}
                                    {saveMutation.isPending ? 'SAVING...' : 'SAVE'}
                                </Button>
                                <Button onClick={handleDelete} className='bg-[#dd4b39] hover:bg-[#d73925] h-7 rounded-sm text-[10px] font-bold px-6'><Trash2 className='h-3.5 w-3.5 mr-1.5' /> DELETE</Button>
                                <Button variant='outline' onClick={() => window.location.reload()} className='h-7 rounded-sm text-[10px] font-bold px-6 border-gray-300'>CANCEL</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* View Attendance Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className='max-w-5xl p-0 overflow-hidden border-none rounded-none'>
                    <DialogHeader className='bg-[#3c8dbc] text-white px-4 py-2 flex flex-row items-center justify-between'>
                        <DialogTitle className='text-[11px] font-bold uppercase'>View Attendance Details</DialogTitle>
                    </DialogHeader>
                    <div className='p-4 bg-white max-h-[70vh] overflow-y-auto'>
                        <div className='overflow-x-auto border'>
                            <Table className='border-collapse'>
                                <TableHeader className='bg-[#f4f4f4]'>
                                    <TableRow className='h-9'>
                                        <TableHead className='text-center border-r font-bold text-gray-700 w-16 text-[10px]'>SL NO</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px]'>DATE</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px]'>STAFF NAME</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px] text-center'>TOTAL</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px] text-center'>PRESENT</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px] text-center'>ABSENT</TableHead>
                                        <TableHead className='border-r font-bold text-gray-700 text-[10px]'>ENTRY DATE</TableHead>
                                        <TableHead className='text-center font-bold text-gray-700 w-24 text-[10px]'>ACTION</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {viewAttendanceList.map((item, idx) => (
                                        <TableRow key={idx} className='h-10 border-b border-gray-100 hover:bg-[#f9fafc]'>
                                            <TableCell className='text-center border-r text-[11px] text-gray-500'>{idx + 1}</TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-700 font-medium'>
                                                {item.ASA_FROMDATE || (item.asA_FromDate ? format(new Date(item.asA_FromDate), 'dd/MM/yyyy') : '-')}
                                            </TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600 uppercase'>{item.EMPLOYEENAME || '-'}</TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600 text-center font-bold text-blue-600'>{item.TotalCount ?? '-'}</TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600 text-center font-bold text-green-600'>{item.PresentCount ?? '-'}</TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600 text-center font-bold text-red-600'>{item.AbsentCount ?? '-'}</TableCell>
                                            <TableCell className='border-r text-[11px] text-gray-600'>
                                                {item.ASA_Entry_DateTime || '-'}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    className='h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'
                                                    onClick={() => {
                                                        // Handle delete record wise if needed
                                                        Swal.fire({
                                                            title: 'Delete Record?',
                                                            text: 'Are you sure you want to delete this specific record?',
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonText: 'Yes, Delete'
                                                        }).then(async (result) => {
                                                            if (result.isConfirmed) {
                                                                // Call delete logic here
                                                                toast.info('Delete functionality to be implemented');
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className='h-3.5 w-3.5' />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                    <div className='bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t'>
                        <Button
                            variant='outline'
                            onClick={() => setIsViewModalOpen(false)}
                            className='h-7 rounded-sm text-[10px] font-bold px-6 border-gray-300'
                        >
                            CLOSE
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
