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
                    const list = response?.data?.studentList || response?.studentList || [];
                    setStudentListFromSearch(Array.isArray(list) ? list : []);
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, academicYearId, studentStatus, classId, sectionId, studentScope]);

    const students = studentListFromSearch;

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || (studentScope === 'indid' && !studentId)) {
            toast.error('Please select all required fields');
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
            if (data?.studentList?.length > 0) {
                setReportData(data);
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
                                                    disabled={studentScope === 'A'}
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
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-4 pt-6'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='min-w-[100px] bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-md'>
                            {detailsMutation.isPending ? <Loader2 className='mr-1 h-3 w-3 animate-spin' /> : <Printer className='mr-1 h-3 w-3' />}
                            REPORT
                        </Button>
                        <Button
                            size='sm'
                            onClick={handleReset}
                            className='min-w-[100px] bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-md uppercase'>
                            <RotateCcw className='mr-1 h-3 w-3' />
                            CANCEL
                        </Button>
                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            className='min-w-[100px] bg-[#e0e0e0] hover:bg-[#d5d5d5] text-gray-700 shadow-md disabled:bg-gray-100 uppercase'>
                            <Printer className='mr-1 h-3 w-3' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate && reportData && (
                <div className='mt-8 flex flex-col items-center bg-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-300'>
                    <div ref={printRef} className='bg-white p-12 shadow-2xl w-[800px] min-h-[1000px] border-8 border-double border-gray-200'>
                        {/* Basic Template for Sophia Study Certificate */}
                        <div className='text-center space-y-8'>
                            <h1 className='text-4xl font-serif font-bold text-indigo-900 uppercase tracking-widest border-b-2 border-indigo-900 pb-4'>
                                Sophia High School
                            </h1>
                            <h2 className='text-2xl font-serif font-semibold italic text-gray-700'>
                                Study Certificate
                            </h2>
                            
                            <div className='pt-12 text-left space-y-6 text-lg leading-relaxed font-serif'>
                                {reportData.studentList?.map((student: any, index: number) => (
                                    <div key={index} className='space-y-8'>
                                        <p>
                                            This is to certify that <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.studentname}</span> 
                                            daughter of <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.fathername || student.mothername}</span> 
                                            is / was a bonafide student of this school.
                                        </p>
                                        <p>
                                            She is / was studying in Class <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.classname}</span> 
                                            during the academic year <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.yearname}</span>.
                                        </p>
                                        <p>
                                            According to the School Records, her date of birth is <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.dob}</span> 
                                            (<span className='italic'>{student.dobwords}</span>).
                                        </p>
                                        <p>
                                            Her Admission Number is <span className='font-bold border-b border-dotted border-gray-400 px-4'>{student.amst_admno}</span>.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className='pt-24 flex justify-between items-end'>
                                <div className='text-left'>
                                    <p className='font-bold'>Date: {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}</p>
                                    <p className='font-bold'>Place: Bangalore</p>
                                </div>
                                <div className='text-center'>
                                    <div className='h-20'></div>
                                    <p className='font-bold uppercase pt-4 border-t-2 border-gray-800 px-8'>Principal</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
