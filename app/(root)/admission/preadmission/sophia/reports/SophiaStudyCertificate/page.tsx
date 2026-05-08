'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Printer, Loader2, Check, FileText, GraduationCap, Search, FileCheck } from 'lucide-react';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
    useSophiaStudyCertDetails,
    useSophiaStudyCertLoadData,
    useSophiaStudyCertSearchFilter
} from '@/hooks/admission/preadmission/useSophiaStudyCertificate';
import { toast } from 'sonner';

/* -------------------- Types -------------------- */
interface AcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface ClassItem {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

interface SectionItem {
    asmS_Id: number;
    asmC_SectionName: string;
}

interface LoadData {
    allAcademicYear: AcademicYear[];
    allclasslist: ClassItem[];
    allsectionlist: SectionItem[];
}

export default function SophiaStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadDataResponse, isLoading: isLoadDataLoading } = useSophiaStudyCertLoadData();

    const loadData = useMemo(() => {
        const data = loadDataResponse?.data || (loadDataResponse as any);
        return {
            allAcademicYear: Array.isArray(data?.allAcademicYear) ? data.allAcademicYear : [],
            allclasslist: Array.isArray(data?.allclasslist) ? data.allclasslist : [],
            allsectionlist: Array.isArray(data?.allsectionlist) ? data.allsectionlist : [],
        } as LoadData;
    }, [loadDataResponse]);

    /* -------------------- UI State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'L' | 'D'>('S');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);
    const [certificateType, setCertificateType] = useState<string>('0');
    const [visaFromDate, setVisaFromDate] = useState<Date | null>(new Date());
    const [visaToDate, setVisaToDate] = useState<Date | null>(new Date());
    const [vacationReason, setVacationReason] = useState('');
    const [showCertificate, setShowCertificate] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const searchMutation = useSophiaStudyCertSearchFilter();
    const detailsMutation = useSophiaStudyCertDetails();

    /* -------------------- Search Logic -------------------- */
    // Triggered when user types in the search field
    useEffect(() => {
        // Requirement: ASMAY_Id is mandatory, and at least 3 chars for searching
        if (!academicYearId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            // Using the API as specified for global search: /StudyCertificate/searchfilter
            // Search always uses ASMCL_Id: 0, ASMC_Id: 0 and allorindid: 'A' to find students across the whole year
            searchMutation.mutate({
                ASMAY_Id: academicYearId,
                AMST_SOL: studentStatus,
                ASMCL_Id: 0,
                ASMC_Id: 0,
                searchfilter: searchQuery,
                allorindid: 'A'
            }, {
                onSuccess: (response: any) => {
                    const data = response?.data || response;
                    // Backend returns list in 'fillstudlist' or 'studentList'
                    const list = data?.fillstudlist || data?.studentList || [];
                    setStudentListFromSearch(Array.isArray(list) ? list.map((s: any) => ({
                        ...s,
                        amst_id: s.amsT_Id || s.AMST_Id,
                        studentname: s.amsT_FirstName || s.AMST_FirstName || s.studentname || s.studentName,
                        amst_admno: s.amsT_AdmNo || s.AMST_AdmNo || s.admNo,
                        asmcl_classname: s.asmcL_ClassName || s.ASMCL_ClassName || s.class || s.className
                    })) : []);
                },
                onError: () => {
                    toast.error('Error searching students');
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus]);

    /* -------------------- Actions -------------------- */
    const safeDateFormat = (dateStr: any, formatStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return format(date, formatStr);
        } catch (e) {
            return dateStr;
        }
    };

    const handleReport = async () => {
        if (!academicYearId) { toast.error('Select Academic Year'); return; }
        if (studentScope === 'I') {
            if (!classId) { toast.error('Select Class'); return; }
            if (!sectionId) { toast.error('Select Section'); return; }
            if (!studentId) { toast.error('Select Student'); return; }
        }
        if (certificateType === '2' && (!visaFromDate || !visaToDate)) {
            toast.error('Select From and To dates'); return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId || 0,
            ASMC_Id: sectionId || 0,
            AMST_Id: studentId || 0,
            allorindid: studentScope
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;
            const studentListData = data?.studentlist || data?.studentList || [];

            if (Array.isArray(studentListData) && studentListData.length > 0) {
                const normalizedList = studentListData.map((s: any) => {
                    const isFemale = (s.AMST_Sex || '').toLowerCase() === 'female';
                    return {
                        ...s,
                        studentname: s.studentnam || s.studentname || s.studentName || '',
                        fathername: s.fatherName || s.fathername || '',
                        mothername: s.mothername || '',
                        classstudying: s.class || s.classname || '',
                        admNo: s.admNo || s.admno || '',
                        acadamicyear: s.acadamicyear || '',
                        admyear: s.AMST_Date || s.admyear || '',
                        dob12: s.dob || '',
                        AMST_PerStreet: (s.AMST_PerStreet || '').toUpperCase(),
                        AMST_PerArea: (s.AMST_PerArea || '').toUpperCase(),
                        AMST_PerCity: (s.AMST_PerCity || '').toUpperCase(),
                        ivrmms_name: (s.ivrmms_name || '').toUpperCase(),
                        AMST_PerPincode: s.AMST_PerPincode || '',
                        religion: s.religion || '',
                        caste_name: s.caste_name || '',
                        stuMT: s.stuMT || '',
                        joinedClass: s.JoinedClass || s.joinedClass || '',
                        joinedyear: s.JoinedYear || s.joinedyear || '',
                        PresentClass: s.PresentClass || '',
                        presentYear: s.PresentYear || '',
                        gender1: isFemale ? 'She' : 'He',
                        gender2: isFemale ? 'Her' : 'His',
                        gender3: isFemale ? 'daughter' : 'son',
                        gender4: isFemale ? 'She' : 'He',
                        gender8: isFemale ? 'her' : 'his',
                        Holiday: vacationReason,
                        Summerfrom: visaFromDate,
                        Summerto: visaToDate
                    };
                });
                setReportData({ ...data, studentList: normalizedList });
                setShowCertificate(true);
                toast.success('Report data fetched');
            } else {
                toast.error('No records found for the selected criteria');
                setShowCertificate(false);
            }
        } catch (error) {
            toast.error('Failed to fetch report details');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchQuery('');
        setStudentScope('A');
        setStudentStatus('S');
        setSelectedDate(new Date());
        setCertificateType('0');
        setVisaFromDate(new Date());
        setVisaToDate(new Date());
        setVacationReason('');
        setShowCertificate(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Sophia_Study_Certificate'
    });

    if (isLoadDataLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className='flex flex-col items-center gap-2'>
                    <Loader2 className="h-10 w-10 animate-spin text-[#3f51b5]" />
                    <span className='text-sm font-medium text-gray-500'>Initializing...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#f1f5f9] p-4 space-y-6'>
            {/* Blue Header Bar */}
            <div className='bg-[#3f51b5] text-white p-4 rounded-t-lg shadow-md flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <GraduationCap className='h-6 w-6' />
                    <h1 className='text-xl font-bold tracking-tight uppercase'>STUDYCERTIFICATE CERTIFICATE REPORT</h1>
                </div>
                <div className='text-[10px] font-medium opacity-70'>ADMISSION &gt; REPORTS &gt; SOPHIA STUDY CERTIFICATE</div>
            </div>

            <Card className='rounded-none rounded-b-lg border-none shadow-lg bg-white overflow-hidden'>
                <CardContent className='p-8 space-y-8'>
                    {/* Filter Section Row */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='flex flex-col gap-2'>
                            <Label className='text-xs font-bold text-gray-500 uppercase px-1'>Scope</Label>
                            <div className='flex items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors duration-200 group'>
                                <RadioGroup value={studentScope} onValueChange={(v) => {
                                    setStudentScope(v as any);
                                    if (v === 'A') { setStudentId(null); setSearchQuery(''); }
                                }} className="flex gap-10">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="A" id="scope-all" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="scope-all" className="text-sm font-semibold cursor-pointer text-gray-700">All</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="I" id="scope-ind" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="scope-ind" className="text-sm font-semibold cursor-pointer text-gray-700">Individual</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className='text-xs font-bold text-gray-500 uppercase px-1'>Status</Label>
                            <div className='flex items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors duration-200'>
                                <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className="flex gap-10">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="S" id="status-studying" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="status-studying" className="text-sm font-semibold cursor-pointer text-gray-700">Studying</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="L" id="status-left" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="status-left" className="text-sm font-semibold cursor-pointer text-gray-700">Left</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <Label className='text-xs font-bold text-gray-500 uppercase px-1'>Certificate Type</Label>
                            <div className='flex flex-wrap items-center justify-center p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white transition-colors duration-200 min-h-[50px]'>
                                <RadioGroup value={certificateType} onValueChange={(v) => setCertificateType(v)} className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="0" id="type-0" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="type-0" className="text-[11px] font-bold cursor-pointer text-gray-600">Study Certificate</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="1" id="type-1" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="type-1" className="text-[11px] font-bold cursor-pointer text-gray-600">Study Certificate CET</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="2" id="type-2" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="type-2" className="text-[11px] font-bold cursor-pointer text-gray-600">Study Certificate Visa</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="3" id="type-3" className='border-[#3f51b5] text-[#3f51b5]' />
                                        <Label htmlFor="type-3" className="text-[11px] font-bold cursor-pointer text-gray-600">Conduct Certificate</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <Separator className='bg-gray-100' />

                    {/* Form Controls Area */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8'>
                        {/* Left Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col gap-1.5'>
                                <Label className='text-sm font-bold text-gray-700'>Academic Year <span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => { setAcademicYearId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white hover:border-[#3f51b5] transition-all shadow-sm'>
                                        <SelectValue placeholder='--Select Academic Year--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allAcademicYear?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>{item.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='text-sm font-bold text-gray-700'>Class <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span></Label>
                                <Select disabled={studentScope === 'A'} value={classId?.toString()} onValueChange={(v) => { setClassId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white hover:border-[#3f51b5] transition-all shadow-sm'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allclasslist?.map((item) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='text-sm font-bold text-gray-700'>Section <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span></Label>
                                <Select disabled={studentScope === 'A' || !classId} value={sectionId?.toString()} onValueChange={(v) => { setSectionId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-11 rounded-lg border-gray-200 bg-white hover:border-[#3f51b5] transition-all shadow-sm'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent className='rounded-lg'>
                                        {loadData.allsectionlist?.map((item) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>{item.asmC_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col gap-1.5'>
                                <Label className='text-sm font-bold text-gray-700'>Certificate Date <span className='text-red-500'>*</span></Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-11 w-full justify-between text-left font-normal border-gray-200 bg-white hover:border-[#3f51b5] transition-all shadow-sm'>
                                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy') : 'Pick a date'}
                                            <CalendarIcon className='h-4 w-4 text-[#3f51b5]' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0 rounded-xl border-none shadow-2xl'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => { setSelectedDate(date); setDateOpen(false); }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <Label className='text-sm font-bold text-gray-700'>Search Student <span className={cn(studentScope === 'I' ? 'text-red-500' : 'hidden')}>*</span></Label>
                                <div className='relative w-full group'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='relative'>
                                                <div className="absolute left-3 top-3.5">
                                                    <Search className={cn("h-4 w-4 transition-colors", searchQuery.length >= 3 ? "text-[#3f51b5]" : "text-gray-400")} />
                                                </div>
                                                <input
                                                    disabled={!academicYearId}
                                                    value={studentId ? studentListFromSearch.find((s: any) => s.amst_id === studentId)?.studentname || searchQuery : searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setStudentId(null);
                                                        setStudentOpen(true);
                                                    }}
                                                    onFocus={() => setStudentOpen(true)}
                                                    className='flex h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-sm shadow-sm transition-all focus:border-[#3f51b5] focus:outline-none focus:ring-1 focus:ring-[#3f51b5] disabled:bg-gray-50'
                                                    placeholder='Type at least 3 characters to search...'
                                                />
                                                {searchMutation.isPending && (
                                                    <div className="absolute right-3 top-3.5">
                                                        <Loader2 className="h-4 w-4 animate-spin text-[#3f51b5]" />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[450px] p-0 rounded-xl shadow-2xl border-none' align='start' onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='rounded-xl'>
                                                <CommandList>
                                                    {searchMutation.isPending && (
                                                        <div className="p-10 text-center flex flex-col items-center gap-2">
                                                            <Loader2 className="h-8 w-8 animate-spin text-[#3f51b5]" />
                                                            <p className='text-xs font-bold text-gray-400 uppercase tracking-widest'>Searching Database</p>
                                                        </div>
                                                    )}
                                                    {!searchMutation.isPending && searchQuery.length < 3 && (
                                                        <div className='p-8 text-center text-gray-400 italic text-sm'>Please type 3 or more characters</div>
                                                    )}
                                                    <CommandEmpty>No matching student found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentListFromSearch.map((s: any) => (
                                                            <CommandItem key={s.amst_id} value={s.studentname} onSelect={() => {
                                                                setStudentId(s.amst_id);
                                                                setSearchQuery(s.studentname);
                                                                setStudentOpen(false);
                                                            }} className='p-3 cursor-pointer hover:bg-blue-50/50 transition-colors'>
                                                                <Check className={cn('mr-3 h-4 w-4 text-green-500', studentId === s.amst_id ? 'opacity-100' : 'opacity-0')} />
                                                                <div className='flex flex-col gap-0.5'>
                                                                    <span className='font-bold text-gray-800'>{s.studentname}</span>
                                                                    <div className='flex items-center gap-2'>
                                                                        <span className='text-[10px] font-black text-gray-400 uppercase tracking-tighter'>Adm No: {s.amst_admno}</span>
                                                                        <Separator orientation='vertical' className='h-2 bg-gray-200' />
                                                                        <span className='text-[10px] font-black text-[#3f51b5] uppercase'>{s.asmcl_classname}</span>
                                                                    </div>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Visa Certificate Specific Fields */}
                            {certificateType === '2' && (
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border-2 border-dashed border-blue-100 bg-blue-50/30 animate-in slide-in-from-top-2 duration-300'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label className='text-xs font-bold text-gray-600'>From Date <span className='text-red-500'>*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-10 w-full justify-between text-left font-normal border-gray-200 bg-white shadow-sm'>
                                                    {visaFromDate ? format(visaFromDate, 'dd-MM-yyyy') : 'From Date'}
                                                    <CalendarIcon className='h-4 w-4 text-blue-400' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='p-0 rounded-xl shadow-2xl'>
                                                <DatePickerWithYear mode='single' selected={visaFromDate || undefined} onDayClick={(date) => setVisaFromDate(date)} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label className='text-xs font-bold text-gray-600'>To Date <span className='text-red-500'>*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-10 w-full justify-between text-left font-normal border-gray-200 bg-white shadow-sm'>
                                                    {visaToDate ? format(visaToDate, 'dd-MM-yyyy') : 'To Date'}
                                                    <CalendarIcon className='h-4 w-4 text-blue-400' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='p-0 rounded-xl shadow-2xl'>
                                                <DatePickerWithYear mode='single' selected={visaToDate || undefined} onDayClick={(date) => setVisaToDate(date)} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                                        <Label className='text-xs font-bold text-gray-600'>Vacation reason:</Label>
                                        <input
                                            value={vacationReason}
                                            onChange={(e) => setVacationReason(e.target.value)}
                                            className='flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-400 focus:outline-none'
                                            placeholder='Enter reason for travel...'
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons: Aligned to Right under Student Search like Legacy */}
                            <div className='flex items-center justify-end gap-4 pt-4'>
                                <Button
                                    size='lg'
                                    onClick={handleReport}
                                    disabled={detailsMutation.isPending}
                                    className='bg-[#3f51b5] hover:bg-[#303f9f] text-white px-8 h-11 shadow-lg shadow-blue-100 rounded-lg uppercase text-xs font-black tracking-widest transition-all active:scale-95'
                                >
                                    {detailsMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileCheck className='mr-2 h-4 w-4' />}
                                    REPORT
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='border-2 border-[#ff5722] text-[#ff5722] hover:bg-[#ff5722] hover:text-white px-8 h-11 shadow-lg shadow-orange-50 rounded-lg uppercase text-xs font-black tracking-widest transition-all active:scale-95'
                                >
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    CANCEL
                                </Button>
                                <Button
                                    size='lg'
                                    onClick={handlePrint}
                                    disabled={!showCertificate}
                                    className='bg-gray-200 hover:bg-gray-300 text-gray-600 px-8 h-11 shadow-lg shadow-gray-100 disabled:opacity-50 disabled:shadow-none rounded-lg uppercase text-xs font-black tracking-widest transition-all active:scale-95'
                                >
                                    <Printer className='mr-2 h-4 w-4' />
                                    PRINT
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Certificate Preview with B5 Formatting */}
            {showCertificate && reportData && (
                <div className='mt-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700'>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @media print {
                            @page {
                                size: B5 portrait;
                                margin: 0;
                            }
                            .printable-content {
                                width: 176mm !important;
                                height: 250mm !important;
                                margin: 0 !important;
                                padding: 12mm !important;
                                box-shadow: none !important;
                                ring: none !important;
                            }
                        }
                    `}} />

                    <div className='flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold uppercase tracking-widest'>
                        <div className='h-2 w-2 rounded-full bg-green-500 animate-pulse' />
                        Report Ready (B5 Format)
                    </div>

                    <div className='bg-gray-300 p-6 md:p-12 rounded-[2rem] shadow-inner w-full flex justify-center overflow-auto'>
                        <div ref={printRef} className='bg-white shadow-2xl p-10 w-full max-w-[176mm] min-h-[250mm] printable-content text-black ring-1 ring-gray-100 rounded-sm overflow-hidden'>
                            {reportData.studentList?.map((student: any, index: number) => (
                                <div key={index} className="page-break-after-always">
                                    {/* Type 0: Study Certificate (B5 Optimized) */}
                                    {String(certificateType) === '0' && (
                                        <div className="certificate-container" style={{ marginTop: '100px', lineHeight: '2.0', fontSize: '19px', marginLeft: '4%', paddingRight: '4%', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '17px', marginBottom: '30px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MMM/yyyy')}
                                            </div>

                                            <h3 className="text-center" style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '25px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of
                                                    Mr. <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> is a student of this school studying in Std. <strong>{student.classstudying}</strong> With admission number <strong>{student.admNo}</strong> during the academic year {student.acadamicyear}.
                                                </p>

                                                <p style={{ marginBottom: '25px' }}>
                                                    {student.gender1} is a student in this school since <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender2} date of birth as per our records is <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                                </p>

                                                <div style={{ marginBottom: '60px' }}>
                                                    <p style={{ marginBottom: '10px' }}>{student.gender2} local address :</p>
                                                    <div style={{ fontWeight: 'bold', lineHeight: '1.5' }}>
                                                        {student.AMST_PerStreet || student.amsT_PerStreet || student.address1 || ''}<br />
                                                        {student.AMST_PerArea || student.amsT_PerArea || student.address2 || ''}<br />
                                                        {student.AMST_PerCity || student.amsT_PerCity || student.city || ''}<br />
                                                        {student.ivrmms_name || student.state || ''} - {student.AMST_PerPincode || student.amsT_PerPincode || student.pincode || ''}
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '60px' }}>
                                                    <p style={{ marginBottom: '40px' }}>Yours sincerely,</p>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>Sr. M. Alpana, S.N.D.</p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 1: Study Certificate CET (B5 Optimized) */}
                                    {String(certificateType) === '1' && (
                                        <div className="certificate-container" style={{ marginTop: '100px', lineHeight: '2.0', fontSize: '19px', marginLeft: '4%', paddingRight: '4%', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                                            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '17px', marginBottom: '30px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}
                                            </div>

                                            <h3 className="text-center" style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '35px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of
                                                    Mr. <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> has studied <strong>std.{student.joinedClass} to {student.PresentClass}</strong> standard in our institution from <strong>{student.joinedyear} to {student.presentYear}</strong> academic years.
                                                </p>

                                                <p style={{ marginBottom: '35px' }}>
                                                    {student.gender1} belongs to <strong>{student.religion}({student.caste_name})</strong> religion & the mother tongue of the above student is <strong>{student.stuMT}</strong> as per the admission register maintained in the institution.
                                                </p>

                                                <p style={{ marginBottom: '60px' }}>
                                                    The above details are true and correct to the best of my knowledge.
                                                </p>

                                                <div style={{ marginTop: '80px' }}>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>Sr. M. Alpana, S.N.D.</p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 2: Study Certificate Visa (B5 Optimized) */}
                                    {String(certificateType) === '2' && (
                                        <div className="certificate-container" style={{ marginTop: '100px', lineHeight: '2.0', fontSize: '19px', marginLeft: '4%', paddingRight: '4%', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                                            <div style={{ textAlign: 'right', fontSize: '17px', marginBottom: '40px' }}>
                                                Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}
                                            </div>

                                            <h3 className="text-center" style={{ fontSize: '28px', margin: '40px 0', fontWeight: 'bold' }}>
                                                STUDY CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'justify' }}>
                                                <p style={{ marginBottom: '20px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> {student.gender3} of
                                                    Mr. <strong>{student.fathername}</strong> & Mrs. <strong>{student.mothername}</strong> is a student of this school studying in Std. <strong>{student.classstudying}</strong> with admission number <strong>{student.admNo}</strong> during the academic year {student.acadamicyear}.
                                                </p>

                                                <p style={{ marginBottom: '20px' }}>
                                                    {student.gender4} is a student in this school since <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender8} date of birth as per our records is <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                                </p>

                                                <p style={{ marginBottom: '20px' }}>
                                                    {vacationReason} from <strong> {safeDateFormat(visaFromDate, 'dd-MM-yyyy')} to {safeDateFormat(visaToDate, 'dd-MM-yyyy')} .</strong>
                                                </p>

                                                <p style={{ marginBottom: '40px' }}>
                                                    {student.gender4} is permitted to travel abroad during this period <strong>{safeDateFormat(visaFromDate, 'dd-MM-yyyy')}</strong> and <strong>{safeDateFormat(visaToDate, 'dd-MM-yyyy')}</strong> will return to school after {student.gender8} visit.
                                                </p>

                                                <div style={{ marginTop: '40px' }}>
                                                    <p style={{ marginBottom: '30px' }}>Yours sincerely,</p>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '20px' }}>Sr. M. Alpana, S.N.D.</p>
                                                        <p style={{ margin: '0', fontSize: '18px' }}>(Principal)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Type 3: Conduct Certificate (B5 Optimized) */}
                                    {String(certificateType) === '3' && (
                                        <div className="certificate-container" style={{ marginTop: '120px', lineHeight: '2.5', fontSize: '22px', marginLeft: '2%', paddingRight: '2%', fontFamily: "'Times New Roman', Times, serif", color: '#000' }}>
                                            <h3 className="text-center" style={{ fontSize: '30px', margin: '60px 0', fontWeight: 'bold', color: '#3f51b5', textDecoration: 'underline' }}>
                                                CONDUCT CERTIFICATE
                                            </h3>

                                            <div style={{ textAlign: 'center', fontStyle: 'italic', marginTop: '40px' }}>
                                                <p style={{ marginBottom: '10px' }}>
                                                    This is to certify that <strong>{student.studentname}</strong> of
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    Standard <strong>{student.classstudying}</strong> was a student of
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    <strong>SOPHIA HIGH SCHOOL, Bangalore</strong> and was
                                                </p>
                                                <p style={{ marginBottom: '10px' }}>
                                                    of <strong>Good</strong> Character.
                                                </p>
                                            </div>

                                            <div style={{ marginTop: '180px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px' }}>
                                                <div style={{ textAlign: 'left', fontSize: '18px' }}>
                                                    Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '20px', fontWeight: 'bold' }}>
                                                    PRINCIPAL
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Placeholder for other types */}
                                    {['0', '1', '2', '3'].indexOf(String(certificateType)) === -1 && (
                                        <div className='h-[500px] flex items-center justify-center text-gray-200 font-bold italic p-10 border-4 border-dashed border-gray-100 rounded-[2rem]'>
                                            Preview for Type {certificateType} is ready for generation.
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
