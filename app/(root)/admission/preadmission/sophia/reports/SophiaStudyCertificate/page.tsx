'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Printer, Loader2, Check } from 'lucide-react';
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
    const [studentScope, setStudentScope] = useState<'A' | 'indid'>('A');
    const [studentStatus, setStudentStatus] = useState<'studying' | 'left' | 'deactive'>('studying');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentListFromSearch, setStudentListFromSearch] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);
    const [certificateType, setCertificateType] = useState<'0' | '1' | '2' | '3'>('0');
    const [visaFromDate, setVisaFromDate] = useState<Date | null>(null);
    const [visaToDate, setVisaToDate] = useState<Date | null>(null);
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
            const statusMap: Record<string, string> = {
                studying: 'S',
                left: 'L',
                deactive: 'D'
            };

            searchMutation.mutate({
                ASMAY_Id: academicYearId,
                AMST_SOL: statusMap[studentStatus] || 'S',
                ASMCL_Id: classId || 0,
                ASMC_Id: sectionId || 0,
                searchfilter: searchQuery,
                allorindid: studentScope === 'A' ? 'A' : 'I'
            }, {
                onSuccess: (response: any) => {
                    const list = response?.data?.fillstudlist || response?.fillstudlist || [];
                    setStudentListFromSearch(Array.isArray(list) ? list.map((s: any) => ({
                        ...s,
                        amst_id: s.amsT_Id || s.AMST_Id || s.amst_id || s.amst_Id || s.AMST_ID,
                        studentname: s.amsT_FirstName || s.AMST_FirstName || s.studentname || s.amst_FirstName || s.AMST_FIRSTNAME,
                        amst_admno: s.amsT_AdmNo || s.AMST_AdmNo || s.amst_admno || s.amst_AdmNo || s.AMST_ADMNO,
                        asmcl_classname: s.asmcL_ClassName || s.ASMCL_ClassName || s.asmcl_classname || s.asmcl_ClassName || s.ASMCL_CLASSNAME
                    })) : []);
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus, classId, sectionId, studentScope]);

    const students = studentListFromSearch;

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
        if (!academicYearId || (studentScope === 'indid' && !studentId)) {
            toast.error('Please select all required fields');
            return;
        }

        if (certificateType === '2' && (!visaFromDate || !visaToDate)) {
            toast.error('Please select From and To dates for Visa certificate');
            return;
        }

        const statusMap: Record<string, string> = {
            studying: 'S',
            left: 'L',
            deactive: 'D'
        };

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId || 0,
            ASMC_Id: sectionId || 0,
            AMST_Id: studentId || 0,
            AMST_SOL: statusMap[studentStatus] || 'S',
            allorindid: studentScope === 'A' ? 'A' : 'I'
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;

            const studentListData = data?.studentList || data?.fillstudlist || [];

            console.log(studentListData);
            if (Array.isArray(studentListData) && studentListData.length > 0) {
                const normalizedList = studentListData.map((s: any) => ({
                    ...s,
                    studentname: s.studentname || s.studentName || [s.amsT_FirstName || s.AMST_FirstName || s.amst_FirstName || s.amst_Name || s.AMST_Name || s.fullName || '', s.amsT_MiddleName || s.AMST_MiddleName || '', s.amsT_LastName || s.AMST_LastName || ''].filter(Boolean).join(' '),
                    amst_admno: s.amst_admno || s.amsT_AdmNo || s.AMST_AdmNo || s.amst_AdmNo || s.admNo || '',
                    classname: s.classname || s.asmcL_ClassName || s.ASMCL_ClassName || s.asmcl_ClassName || '',
                    yearname: s.yearname || s.asmaY_Year || s.ASMAY_Year || s.asmaY_Year || '',
                    dob: s.dob || s.amsT_DateOfBirth || s.AMST_DateOfBirth || s.amst_DateOfBirth || '',
                    fathername: s.fathername || s.amsT_FatherName || s.AMST_FatherName || s.amst_FatherName || '',
                    mothername: s.mothername || s.amsT_MotherName || s.AMST_MotherName || s.amst_MotherName || '',

                    // Legacy field equivalents
                    gender1: s.gender1 || (s.amsT_Sex?.toLowerCase() === 'female' || s.AMST_Sex?.toLowerCase() === 'female' || s.amsT_Sex?.toLowerCase() === 'f' || s.AMST_Sex?.toLowerCase() === 'f' ? 'She' : 'He'),
                    gender2: s.gender2 || (s.amsT_Sex?.toLowerCase() === 'female' || s.AMST_Sex?.toLowerCase() === 'female' || s.amsT_Sex?.toLowerCase() === 'f' || s.AMST_Sex?.toLowerCase() === 'f' ? 'her' : 'his'),
                    gender3: s.gender3 || (s.amsT_Sex?.toLowerCase() === 'female' || s.AMST_Sex?.toLowerCase() === 'female' || s.amsT_Sex?.toLowerCase() === 'f' || s.AMST_Sex?.toLowerCase() === 'f' ? 'daughter of' : 'son of'),
                    gender4: s.gender4 || s.gender1 || (s.amsT_Sex?.toLowerCase() === 'female' || s.AMST_Sex?.toLowerCase() === 'female' || s.amsT_Sex?.toLowerCase() === 'f' || s.AMST_Sex?.toLowerCase() === 'f' ? 'She' : 'He'),
                    gender8: s.gender8 || s.gender2 || (s.amsT_Sex?.toLowerCase() === 'female' || s.AMST_Sex?.toLowerCase() === 'female' || s.amsT_Sex?.toLowerCase() === 'f' || s.AMST_Sex?.toLowerCase() === 'f' ? 'her' : 'his'),
                    classstudying: s.classname || s.asmcL_ClassName || s.ASMCL_ClassName || '',
                    admNo: s.amst_admno || s.amsT_AdmNo || s.AMST_AdmNo || '',
                    acadamicyear1: s.yearname || s.asmaY_Year || s.ASMAY_Year || '',
                    acadamicyear: s.yearname || s.asmaY_Year || s.ASMAY_Year || '',
                    admyear: s.admyear || s.admuear || s.joinedyear || s.yearname || '',
                    dob12: s.dob || s.amsT_DateOfBirth || '',

                    religion: s.religion || 'Christian',
                    caste_name: s.caste_name || 'RC',
                    stuMT: s.stuMT || 'English',
                    joinedClass: s.joinedClass || s.classname || s.asmcL_ClassName,
                    PresentClass: s.PresentClass || s.classname || s.asmcL_ClassName,
                    joinedyear: s.joinedyear || s.asmaY_Year || s.yearname,
                    presentYear: s.presentYear || s.asmaY_Year || s.yearname,

                    AMST_PerStreet: (s.AMST_PerStreet || s.amst_PerStreet || '').toUpperCase(),
                    AMST_PerArea: (s.AMST_PerArea || s.amst_PerArea || '').toUpperCase(),
                    AMST_PerCity: (s.AMST_PerCity || s.amst_PerCity || '').toUpperCase(),
                    ivrmms_name: (s.ivrmms_name || s.ivrmmS_Name || 'Karnataka').toUpperCase(),
                    AMST_PerPincode: s.AMST_PerPincode || s.amst_PerPincode || '',

                    Holiday: vacationReason,
                    Summerfrom: visaFromDate,
                    Summerto: visaToDate
                }));
                setReportData({ ...data, studentList: normalizedList });

                setShowCertificate(true);
            } else {
                toast.error('No records found');
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
        setStudentStatus('studying');
        setSelectedDate(new Date());
        setCertificateType('0');
        setVisaFromDate(null);
        setVisaToDate(null);
        setVacationReason('');
        setShowCertificate(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Sophia_Study_Certificate'
    });

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Sophia Study Certificate'
                description='Generate study certificates for Sophia students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex items-center space-x-4 rounded-lg border p-2 bg-gray-50/50'>
                            <RadioGroup
                                value={studentScope}
                                onValueChange={(v) => {
                                    setStudentScope(v as any);
                                    if (v === 'A') {
                                        setClassId(null);
                                        setSectionId(null);
                                        setStudentId(null);
                                    }
                                }}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='scope-all' />
                                    <Label htmlFor='scope-all' className='text-sm font-medium'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indid' id='scope-ind' />
                                    <Label htmlFor='scope-ind' className='text-sm font-medium'>Individual</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex items-center space-x-4 rounded-lg border p-2 bg-gray-50/50'>
                            <RadioGroup
                                value={studentStatus}
                                onValueChange={(v) => setStudentStatus(v as any)}
                                className='flex space-x-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='studying' id='status-studying' />
                                    <Label htmlFor='status-studying' className='text-sm font-medium'>Studying</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='left' id='status-left' />
                                    <Label htmlFor='status-left' className='text-sm font-medium'>Left</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='deactive' id='status-deactive' />
                                    <Label htmlFor='status-deactive' className='text-sm font-medium'>Deactive</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='flex items-center space-x-4 rounded-lg border p-4 bg-gray-50/50'>
                        <Label className='text-sm font-bold min-w-[120px]'>Certificate Type:</Label>
                        <RadioGroup
                            value={certificateType}
                            onValueChange={(v) => setCertificateType(v as any)}
                            className='flex flex-wrap gap-4'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='0' id='type-study' />
                                <Label htmlFor='type-study' className='text-sm font-medium'>Study Certificate</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='1' id='type-cet' />
                                <Label htmlFor='type-cet' className='text-sm font-medium'>Study Certificate CET</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='2' id='type-visa' />
                                <Label htmlFor='type-visa' className='text-sm font-medium'>Study Certificate Visa</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='3' id='type-conduct' />
                                <Label htmlFor='type-conduct' className='text-sm font-medium'>Conduct Certificate</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => setAcademicYearId(Number(v))}>
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Year--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allAcademicYear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Class:</Label>
                                <Select
                                    disabled={studentScope === 'A'}
                                    value={classId?.toString()}
                                    onValueChange={(v) => setClassId(Number(v))}
                                >
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Class--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allclasslist?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Section:</Label>
                                <Select
                                    disabled={studentScope === 'A' || !classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => setSectionId(Number(v))}
                                >
                                    <SelectTrigger className='h-8'>
                                        <SelectValue placeholder='--Select Section--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allsectionlist?.map((item: any) => (
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
                                        <Button variant='outline' className='h-8 w-full justify-start text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={selectedDate || undefined}
                                            onDayClick={(date) => {
                                                setSelectedDate(date);
                                                setDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='grid grid-cols-[100px_1fr] items-center gap-4 relative'>
                                <Label className='text-sm font-bold'>Student:</Label>
                                <div className='space-y-1'>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className='relative'>
                                                <input
                                                    disabled={!academicYearId}
                                                    value={studentId ? students.find((s: any) => s.amst_id === studentId)?.studentname || searchQuery : searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setStudentId(null);
                                                        setStudentOpen(true);
                                                    }}
                                                    onFocus={() => studentScope !== 'A' && setStudentOpen(true)}
                                                    className='flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                                    placeholder='Search Student... (min 3 chars)'
                                                />
                                                {studentId && (
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute right-0 top-0 h-8 w-8 p-0'
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
                                                    <div className="absolute right-8 top-2">
                                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-[400px] p-0'
                                            align='start'
                                            onOpenAutoFocus={(e) => e.preventDefault()}
                                        >
                                            <Command shouldFilter={false} className='w-full'>
                                                <CommandList>
                                                    {searchMutation.isPending && (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">Searching students...</div>
                                                    )}
                                                    {!searchMutation.isPending && searchQuery.length > 0 && searchQuery.length < 3 && (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">Enter at least 3 characters</div>
                                                    )}
                                                    <CommandEmpty>
                                                        {!searchMutation.isPending && searchQuery.length >= 3 ? "No students found." : ""}
                                                    </CommandEmpty>
                                                    <CommandGroup>
                                                        {students.map((s: any, idx: number) => (
                                                            <CommandItem
                                                                key={`${s.amst_id || 's'}-${idx}`}
                                                                value={s.studentname}
                                                                onSelect={() => {
                                                                    setStudentId(s.amst_id);
                                                                    setSearchQuery(s.studentname);
                                                                    setStudentOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        studentId === s.amst_id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{s.studentname}</span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        Adm: {s.amst_admno} | {s.asmcl_classname || 'N/A'}
                                                                    </span>
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
                                <>
                                    <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-bold'>From Date:<span className='text-red-500'>*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-8 w-full justify-start text-left font-normal'>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {visaFromDate ? format(visaFromDate, 'dd-MM-yyyy') : 'Select Date'}
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
                                                <Button variant='outline' className='h-8 w-full justify-start text-left font-normal'>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {visaToDate ? format(visaToDate, 'dd-MM-yyyy') : 'Select Date'}
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
                                        <Label className='text-sm font-bold'>Reason:</Label>
                                        <input
                                            value={vacationReason}
                                            onChange={(e) => setVacationReason(e.target.value)}
                                            className='flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm'
                                            placeholder='Vacation reason...'
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-4 pt-6'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-md rounded-full uppercase'>
                            {detailsMutation.isPending ? <Loader2 className='mr-1 h-3 w-3 animate-spin' /> : <Printer className='mr-1 h-3 w-3' />}
                            REPORT
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleReset}
                            className='w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-md rounded-full uppercase'>
                            <RotateCcw className='mr-1 h-3 w-3' />
                            CANCEL
                        </Button>
                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='w-32 bg-[#e0e0e0] hover:bg-[#d5d5d5] text-gray-700 shadow-md disabled:bg-gray-100 rounded-full uppercase'>
                            <Printer className='mr-1 h-3 w-3' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate && reportData && (
                <div className='mt-8 flex flex-col items-center bg-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-300 overflow-auto'>

                    <div ref={printRef} className='bg-white p-8 shadow-2xl w-full min-h-[297mm] printable-content'>
                        {reportData.studentList?.map((student: any, index: number) => (
                            <div key={index} className="page-break-after-always">
                                {certificateType === '0' && (
                                    <div style={{ marginTop: '150px', lineHeight: '2', fontSize: '20px', marginLeft: '4%', marginRight: '4%' }}>
                                        <div className="date" style={{ textAlign: 'right' }}>
                                            <strong>Date: {safeDateFormat(selectedDate || new Date(), 'dd/MMM/yyyy')}</strong>
                                        </div>
                                        <br /><br />
                                        <h3 className="text-center" style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '40px' }}>
                                            STUDY CERTIFICATE
                                        </h3>

                                        <div className="certificate-content" style={{ textAlign: 'justify' }}>
                                            <p style={{ lineHeight: '2.5' }}>
                                                This is to certify that <strong>{student.studentname}</strong> {student.gender3} of
                                                Mr. <strong> {student.fathername} </strong> & Mrs. <strong> {student.mothername} </strong>
                                                is a student of this school studying in Std. <b>{student.classstudying} &nbsp;</b>
                                                With admission number <b>{student.admNo} &nbsp;</b> during the academic year {student.acadamicyear1}.
                                            </p>
                                            <br />
                                            <p style={{ lineHeight: '2.5' }}>
                                                {student.gender1} is a student in this school since <strong>{safeDateFormat(student.admyear, 'yyyy')}</strong> and {student.gender2} date of birth as per our records is <strong>{safeDateFormat(student.dob12, 'dd-MMM-yyyy')}</strong>.
                                            </p>
                                            <br />
                                            <p style={{ lineHeight: '2' }}>
                                                {student.gender2} local address :<br />
                                                <strong>
                                                    {student.AMST_PerStreet}<br />
                                                    {student.AMST_PerArea}<br />
                                                    {student.AMST_PerCity}<br />
                                                    {student.ivrmms_name} - {student.AMST_PerPincode}
                                                </strong>
                                            </p>
                                            <br /><br />
                                            <div>
                                                <p>Yours sincerely,</p>
                                            </div>
                                            <div style={{ marginTop: '40px' }}>
                                                <p className="principal" style={{ textAlign: 'left', marginBottom: '4px', fontWeight: 'bold' }}>Sr.M.Alpana.SND</p>
                                                <p style={{ textAlign: 'left', paddingLeft: '10px' }}>(Principal)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {certificateType === '1' && (
                                    <div style={{ marginTop: '80px', lineHeight: '2', fontSize: '20px', marginLeft: '4%', marginRight: '4%' }}>
                                        <div className="date" style={{ textAlign: 'right' }}>
                                            <strong><u>Date:{safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}</u></strong>
                                        </div>
                                        <br /><br />
                                        <div style={{ textAlign: 'center' }}>
                                            <h3 style={{ textDecoration: 'underline', fontWeight: 'bold', fontSize: '24px', display: 'inline-block' }}>STUDY CERTIFICATE</h3>
                                        </div>
                                        <br /><br />
                                        <div className="certificate-content" style={{ textAlign: 'justify' }}>
                                            <p style={{ lineHeight: '3' }}>
                                                This is to certify that <strong><u>{student.studentname}</u></strong> {student.gender3} of
                                                <u> Mr. <strong> {student.fathername} & Mrs. {student.mothername}</strong></u> has studied
                                                <b><u> std.{student.joinedClass} to {student.PresentClass}</u></b> standard in our institution from <b><u>{student.joinedyear} to {student.presentYear}</u></b> academic years.
                                            </p>
                                            <br />
                                            <p style={{ lineHeight: '3' }}>
                                                {student.gender1} belongs to <strong><u>{student.religion}({student.caste_name})</u></strong> religion & the mother tongue of the above student is <strong><u>{student.stuMT}</u></strong> as per the admission register maintained in the institution.
                                            </p>
                                            <br />
                                            <p style={{ marginTop: '40px' }}>
                                                The above details are true and correct to the best of my knowledge.
                                            </p>
                                            <br /><br />
                                            <div style={{ marginTop: '60px' }}>
                                                <p style={{ textAlign: 'left', marginBottom: '4px' }}>Sr.M.Alpana.SND</p>
                                                <p style={{ textAlign: 'left', marginLeft: '10px' }}>(Principal)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {certificateType === '2' && (
                                    <div style={{ margin: '70px 10% 50px 10%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <div style={{ textAlign: 'right', fontSize: '16px', marginBottom: '20px' }}>
                                            Date: {safeDateFormat(selectedDate || new Date(), 'dd/MM/yyyy')}
                                        </div>
                                        <h3 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '40px' }}>
                                            STUDY CERTIFICATE
                                        </h3>
                                        <div className="certificate-content" style={{ textAlign: 'justify' }}>
                                            <p>
                                                This is to certify that <strong>{student.studentname}</strong> {student.gender3} of Mr. {student.fathername} & Mrs. {student.mothername} is a student of this school studying in Std.{student.classstudying} with admission number {student.admNo} during the academic year {student.acadamicyear}.
                                            </p>
                                            <p>
                                                {student.gender4} is a student in this school since {safeDateFormat(student.joinedyear || student.admyear, 'yyyy')} and {student.gender8} date of birth as per our records is {safeDateFormat(student.dob12, 'dd-MMM-yyyy')}.
                                            </p>
                                            <p>
                                                {student.Holiday} from <b>{safeDateFormat(student.Summerfrom, 'dd-MM-yyyy')}</b> to <b>{safeDateFormat(student.Summerto, 'dd-MM-yyyy')}</b>.
                                            </p>
                                            <p>
                                                {student.gender4} is permitted to travel abroad during this period <b>{safeDateFormat(student.Summerfrom, 'dd-MM-yyyy')}</b> and <b>{safeDateFormat(student.Summerto, 'dd-MM-yyyy')}</b> will return to school after {student.gender8} visit.
                                            </p>
                                            <br /><br />
                                            <p style={{ textAlign: 'left' }}>Yours sincerely,</p>
                                            <div style={{ marginTop: '20px' }}>
                                                <p style={{ textAlign: 'left', margin: '0', fontWeight: 'bold' }}>Sr. M. Alpana, S.N.D.</p>
                                                <p style={{ textAlign: 'left', margin: '0' }}>(Principal)</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {certificateType === '3' && (
                                    <div style={{ margin: '235px 10% 50px 10%', fontSize: '18px', lineHeight: '1.8' }}>
                                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontWeight: 'bold', fontSize: '30px' }}>
                                            CONDUCT CERTIFICATE
                                        </h3>
                                        <div className="certificate-content" style={{ textAlign: 'center', paddingTop: '80px' }}>
                                            <p style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '27px', fontStyle: 'italic', lineHeight: '2' }}>
                                                This is to certify that <strong>{student.studentname}</strong> of<br />
                                                Standard <strong>{student.classstudying}</strong> was a student of<br />
                                                <strong>SOPHIA HIGH SCHOOL, Bangalore</strong> and was<br />
                                                of <strong>Good</strong> Character.
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '125px' }}>
                                                <p style={{ textAlign: 'left' }}>Date: {safeDateFormat(selectedDate || new Date(), 'dd-MMM-yyyy')}</p>
                                                <p style={{ textAlign: 'right', fontWeight: 'bold' }}>PRINCIPAL</p>
                                            </div>
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
