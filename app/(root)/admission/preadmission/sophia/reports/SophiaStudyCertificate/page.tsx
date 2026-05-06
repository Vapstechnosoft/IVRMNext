'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Printer, Loader2, Check, FileText } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useSophiaStudyCertDetails,
    useSophiaStudyCertLoadData,
    useSophiaStudyCertSearchFilter
} from '@/hooks/admission/preadmission/useSophiaStudyCertificate';
import { toast } from 'sonner';

export default function SophiaStudyCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSophiaStudyCertLoadData();

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
    useEffect(() => {
        if (!academicYearId || searchQuery.length < 3) {
            setStudentListFromSearch([]);
            return;
        }

        const timer = setTimeout(() => {
            searchMutation.mutate({
                ASMAY_Id: academicYearId,
                AMST_SOL: studentStatus,
                ASMCL_Id: classId || 0,
                ASMC_Id: sectionId || 0,
                searchfilter: searchQuery,
                allorindid: studentScope
            }, {
                onSuccess: (response: any) => {
                    const list = response?.fillstudlist || response?.data?.fillstudlist || [];
                    setStudentListFromSearch(Array.isArray(list) ? list.map((s: any) => ({
                        ...s,
                        amst_id: s.amsT_Id || s.AMST_Id,
                        studentname: s.amsT_FirstName || s.AMST_FirstName,
                        amst_admno: s.amsT_AdmNo || s.AMST_AdmNo,
                        asmcl_classname: s.asmcL_ClassName || s.ASMCL_ClassName
                    })) : []);
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus, classId, sectionId, studentScope]);

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
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (studentScope === 'I') {
            if (!classId) { toast.error('Select Class'); return; }
            if (!sectionId) { toast.error('Select Section'); return; }
            if (!studentId) { toast.error('Select Student'); return; }
        }

        if (certificateType === '2' && (!visaFromDate || !visaToDate)) {
            toast.error('Select From and To dates');
            return;
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
            } else {
                toast.error('Record not found');
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

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Studycertificate Certificate Report'
                description='Generate study certificates for Sophia students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='space-y-6 bg-white p-6'>
                    {/* Filters Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4'>
                        <div className='rounded-lg border p-3 bg-gray-50/50 shadow-sm'>
                            <RadioGroup value={studentScope} onValueChange={(v) => {
                                setStudentScope(v as any);
                                if (v === 'A') { setClassId(null); setSectionId(null); setStudentId(null); setSearchQuery(''); }
                            }} className='flex space-x-4 justify-center'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='text-sm font-medium'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='I' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='text-sm font-medium'>Individual</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='rounded-lg border p-3 bg-gray-50/50 shadow-sm'>
                            <RadioGroup value={studentStatus} onValueChange={(v) => setStudentStatus(v as any)} className='flex space-x-4 justify-center'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='status-studying' />
                                    <Label htmlFor='status-studying' className='text-sm font-medium'>Studying</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='L' id='status-left' />
                                    <Label htmlFor='status-left' className='text-sm font-medium'>Left</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='md:col-span-1 lg:col-span-2 rounded-lg border p-3 bg-gray-50/50 shadow-sm'>
                            <RadioGroup value={certificateType} onValueChange={(v) => setCertificateType(v)} className='flex flex-wrap gap-4 justify-center'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='type-0' />
                                    <Label htmlFor='type-0' className='text-xs font-medium'>Study Certificate</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='type-1' />
                                    <Label htmlFor='type-1' className='text-xs font-medium'>Study Certificate CET</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='2' id='type-2' />
                                    <Label htmlFor='type-2' className='text-xs font-medium'>Study Certificate Visa</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='3' id='type-3' />
                                    <Label htmlFor='type-3' className='text-xs font-medium'>Conduct Certificate</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='4' id='type-4' />
                                    <Label htmlFor='type-4' className='text-xs font-medium'>Course Completion</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='5' id='type-5' />
                                    <Label htmlFor='type-5' className='text-xs font-medium'>Certificate</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => { setAcademicYearId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.allAcademicYear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Class:<span className='text-red-500'>*</span></Label>
                                <Select disabled={studentScope === 'A'} value={classId?.toString()} onValueChange={(v) => { setClassId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.allclasslist?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                                <Select disabled={studentScope === 'A' || !classId} value={sectionId?.toString()} onValueChange={(v) => { setSectionId(Number(v)); setStudentId(null); setSearchQuery(''); }}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.allsectionlist?.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Date:<span className='text-red-500'>*</span></Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start text-left font-normal shadow-sm'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                            {selectedDate ? format(selectedDate, 'dd/MMM/yyyy') : 'Enter date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => { setSelectedDate(date); setDateOpen(false); }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='grid grid-cols-[100px_1fr] items-center gap-4 relative'>
                                <Label className='text-sm font-bold'>Student:<span className='text-red-500'>*</span></Label>
                                <div className='space-y-1 w-full'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='relative'>
                                                <input
                                                    disabled={!academicYearId}
                                                    value={studentId ? studentListFromSearch.find((s: any) => s.amst_id === studentId)?.studentname || searchQuery : searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setStudentId(null);
                                                        setStudentOpen(true);
                                                    }}
                                                    onFocus={() => studentScope === 'I' && setStudentOpen(true)}
                                                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                                    placeholder='Select or search Student'
                                                />
                                                {studentId && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute right-0 top-0 h-9 w-8 p-0'
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setStudentId(null);
                                                            setSearchQuery('');
                                                        }}
                                                    >
                                                        <RotateCcw className='h-3 w-3' />
                                                    </Button>
                                                )}
                                                {searchMutation.isPending && (
                                                    <div className="absolute right-8 top-2.5">
                                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[400px] p-0 shadow-xl' align='start' onOpenAutoFocus={(e) => e.preventDefault()}>
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList>
                                                    {searchMutation.isPending && <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>}
                                                    <CommandEmpty>{!searchMutation.isPending && searchQuery.length >= 3 ? "No results" : "Type 3 chars to search"}</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentListFromSearch.map((s: any) => (
                                                            <CommandItem key={s.amst_id} value={s.studentname} onSelect={() => {
                                                                setStudentId(s.amst_id);
                                                                setSearchQuery(s.studentname);
                                                                setStudentOpen(false);
                                                            }}>
                                                                <Check className={cn('mr-2 h-4 w-4', studentId === s.amst_id ? 'opacity-100' : 'opacity-0')} />
                                                                <div className="flex flex-col">
                                                                    <span className='font-medium'>{s.studentname}</span>
                                                                    <span className="text-[10px] text-muted-foreground">Adm: {s.amst_admno} | {s.asmcl_classname}</span>
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

                            {certificateType === '2' && (
                                <div className='space-y-4 animate-in fade-in slide-in-from-top-2'>
                                    <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-bold'>From Date:<span className='text-red-500'>*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-9 w-full justify-start text-left font-normal shadow-sm'>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                                    {visaFromDate ? format(visaFromDate, 'dd-MM-yyyy') : 'Enter date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='p-0'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={visaFromDate || undefined}
                                                    onDayClick={(date) => setVisaFromDate(date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-bold'>To Date:<span className='text-red-500'>*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-9 w-full justify-start text-left font-normal shadow-sm'>
                                                    <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                                    {visaToDate ? format(visaToDate, 'dd-MM-yyyy') : 'Enter date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='start' className='p-0'>
                                                <DatePickerWithYear
                                                    mode='single'
                                                    selected={visaToDate || undefined}
                                                    onDayClick={(date) => setVisaToDate(date)}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-bold'>Vacation reason:</Label>
                                        <input
                                            value={vacationReason}
                                            onChange={(e) => setVacationReason(e.target.value)}
                                            className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm'
                                            placeholder='Enter reason'
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 pt-8 border-t'>
                        <Button size='sm' onClick={handleReport} disabled={detailsMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase transition-all'>
                            {detailsMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button size='sm' onClick={handleReset} className='min-w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-lg rounded-full uppercase transition-all'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button size='sm' onClick={handlePrint} disabled={!showCertificate} className='min-w-32 bg-[#2196f3] hover:bg-[#1976d2] text-white shadow-lg disabled:bg-gray-200 disabled:text-gray-400 rounded-full uppercase transition-all'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate && reportData && (
                <div className='mt-8 flex flex-col items-center bg-gray-50 p-4 md:p-8 rounded-2xl border-2 border-dashed border-indigo-200 overflow-auto'>
                    <div ref={printRef} className='bg-white p-8 shadow-2xl w-full max-w-[210mm] min-h-[297mm] printable-content text-black'>
                        {reportData.studentList?.map((student: any, index: number) => (
                            <div key={index} className="page-break-after-always">
                                {/* Type 0: Study Certificate */}
                                {certificateType === '0' && (
                                    <div style={{ marginTop: '150px', lineHeight: '1.5', fontSize: '20px', marginLeft: '4%' }}>
                                        <div className="date" style={{ textAlign: 'right' }}><strong>Date:{safeDateFormat(selectedDate || new Date(), 'dd/MMM/yyyy')}</strong></div>
                                        <h3 className="text-center" style={{ fontSize: '30px' }}>STUDY CERTIFICATE </h3>
                                        <div className="certificate" style={{ textAlign: 'justify', paddingRight: '4%' }}>
                                            <p>
                                                This is to certify that <strong>{student.studentname}</strong> {student.gender3} of
                                                Mr. <strong> {student.fathername} </strong> & Mrs.<strong> {student.mothername} </strong> is a student of this school studying in Std.
                                                <b>{student.classstudying} &nbsp;</b>With admission number <b>{student.admNo} &nbsp;</b> during the academic year {student.acadamicyear}.
                                            </p>
                                            <p>
                                                {student.gender1} is a student in this school since <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender2} date of birth as per our records is <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                            </p>
                                            <p>
                                                {student.gender2} local address :<br /><br />
                                                <strong>
                                                    {student.AMST_PerStreet}<br />
                                                    {student.AMST_PerArea}<br />
                                                    {student.AMST_PerCity}<br />
                                                    {student.ivrmms_name} - {student.AMST_PerPincode}
                                                </strong>
                                            </p>
                                            <div style={{ marginTop: '30px' }}><p>Yours sincerely,</p></div>
                                            <div style={{ marginTop: '40px' }}>
                                                <p className="principal" style={{ textAlign: 'left', marginBottom: '2px' }}>Sr.M.Alpana.SND</p>
                                                <p style={{ textAlign: 'left', marginLeft: '24px', marginTop: '0' }}>(Principal)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Type 1: Study Certificate CET */}
                                {certificateType === '1' && (
                                    <div style={{ marginTop: '80px', lineHeight: '1.5', fontSize: '22px', marginLeft: '4%' }}>
                                        <div className="date" style={{ textAlign: 'right' }}><strong><u>Date:{safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}</u></strong></div>
                                        <br /><br />
                                        <h3 className="text-center"><u>STUDY CERTIFICATE </u></h3>
                                        <br />
                                        <div className="certificate" style={{ textAlign: 'justify', paddingRight: '4%' }}>
                                            <p>
                                                This is to certify that <strong><u>{student.studentname}</u></strong> {student.gender3} of
                                                <u> Mr. <strong> {student.fathername} & Mrs. {student.mothername}</strong></u> has studied
                                                <b><u>std.{student.joinedClass} to {student.PresentClass}</u> &nbsp;</b> standard in our institution from <b><u>{student.joinedyear} to {student.presentYear}</u> &nbsp;</b>academic years.
                                            </p>
                                            <p style={{ marginTop: '65px' }}>
                                                {student.gender1} belongs to <strong><u>{student.religion}({student.caste_name})</u></strong> religion & the mother tongue of the above student is <strong><u>{student.stuMT}</u></strong> as per the admission register maintained in the institution.
                                            </p>
                                            <p style={{ marginTop: '65px' }}>The above details are true and correct to the best of my knowledge.</p>
                                            <div style={{ marginTop: '60px' }}>
                                                <p className="principal" style={{ textAlign: 'left', marginBottom: '2px' }}>Sr.M.Alpana.SND</p>
                                                <p style={{ textAlign: 'left', marginLeft: '24px', marginTop: '0' }}>(Principal)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Type 2: Study Certificate Visa */}
                                {certificateType === '2' && (
                                    <div style={{ margin: '70px 10% 50px 10%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <div style={{ textAlign: 'right', fontSize: '16px', marginBottom: '20px' }}>Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}</div>
                                        <h3 style={{ textAlign: 'center', fontWeight: 'bold' }}>STUDY CERTIFICATE</h3>
                                        <p style={{ textAlign: 'justify' }}>
                                            This is to certify that <strong>{student.studentname}</strong> {student.gender3} of Mr. {student.fathername} & Mrs. {student.mothername} is a student of this school studying in Std.{student.classstudying} with admission number {student.admNo} during the academic year {student.acadamicyear}.
                                        </p>
                                        <p style={{ textAlign: 'justify' }}>
                                            {student.gender4} is a student in this school since {safeDateFormat(student.admyear, 'yyyy')} and {student.gender8} date of birth as per our records is {safeDateFormat(student.dob12, 'dd-MMM-yyyy')}.
                                        </p>
                                        <p style={{ textAlign: 'justify' }}>
                                            {student.Holiday} from <b>{safeDateFormat(student.Summerfrom, 'dd-MM-yyyy')}</b> to <b>{safeDateFormat(student.Summerto, 'dd-MM-yyyy')}</b>.
                                        </p>
                                        <p style={{ textAlign: 'justify' }}>
                                            {student.gender4} is permitted to travel abroad during this period <b>{safeDateFormat(student.Summerfrom, 'dd-MM-yyyy')}</b> and <b>{safeDateFormat(student.Summerto, 'dd-MM-yyyy')}</b> will return to school after {student.gender8} visit.
                                        </p>
                                        <p style={{ textAlign: 'left', marginTop: '30px' }}>Yours sincerely,</p>
                                        <p style={{ textAlign: 'left', margin: '0' }}>Sr. M. Alpana, S.N.D.</p>
                                        <p style={{ textAlign: 'left', margin: '0', marginTop: '-10px' }}>(Principal)</p>
                                    </div>
                                )}

                                {/* Type 3: Conduct Certificate */}
                                {certificateType === '3' && (
                                    <div style={{ margin: '235px 10% 50px 10%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontWeight: 'bold', fontSize: '30px' }}>CONDUCT CERTIFICATE</h3>
                                        <p style={{ fontFamily: "'Times New Roman', Times, serif", textAlign: 'center', paddingTop: '80px', fontSize: '27px', fontStyle: 'italic', lineHeight: '2' }}>
                                            This is to certify that <strong>{student.studentname}</strong> of<br />
                                            Standard <strong>{student.classstudying}</strong> was a student of<br />
                                            <strong>SOPHIA HIGH SCHOOL, Bangalore</strong> and was<br />
                                            of <strong>Good</strong> Character.
                                        </p>
                                        <div style={{ marginTop: '125px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <p style={{ textAlign: 'left', margin: '0' }}>Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}</p>
                                            <p style={{ textAlign: 'right', margin: '0', fontWeight: 'bold' }}>PRINCIPAL</p>
                                        </div>
                                    </div>
                                )}

                                {/* Type 4: Course Completion Certificate */}
                                {certificateType === '4' && (
                                    <div style={{ margin: '250px 8% 50px 6%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontSize: '30px' }}>
                                            <strong>COURSE COMPLETION <br /> CERTIFICATE</strong>
                                        </h3>
                                        <p style={{ textAlign: 'justify', marginTop: '80px', fontSize: '25px' }}>
                                            This is to certify that <strong>{student.studentname}</strong> has
                                            successfully completed the course of studies in Std.<b>{student.classstudying}</b> leading to the <b>I.C.S.E</b> Examination.
                                        </p>
                                        <div style={{ marginTop: '125px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <p style={{ textAlign: 'left', margin: '0' }}>Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}</p>
                                            <p style={{ textAlign: 'right', margin: '0', fontWeight: 'bold' }}>PRINCIPAL</p>
                                        </div>
                                    </div>
                                )}

                                {/* Type 5: Certificate */}
                                {certificateType === '5' && (
                                    <div style={{ margin: '240px 8% 50px 6%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontWeight: 'bold', fontSize: '30px' }}>CERTIFICATE</h3>
                                        <p style={{ textAlign: 'justify', marginTop: '80px', fontSize: '23px' }}>
                                            1. This is to certify that <strong>{student.studentname}</strong>&nbsp; is not
                                            debarred, rusticated or otherwise disqualified from
                                            continuing her studies by the University for any
                                            malpractice at any school examination or for any kind
                                            of misbehavior.
                                        </p>
                                        <p style={{ textAlign: 'justify', fontSize: '25px' }}>2. The student does not owe any amount to the school.</p>
                                        <div style={{ marginTop: '125px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <p style={{ textAlign: 'left', margin: '0' }}>Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}</p>
                                            <p style={{ textAlign: 'right', margin: '0', fontWeight: 'bold' }}>PRINCIPAL</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
