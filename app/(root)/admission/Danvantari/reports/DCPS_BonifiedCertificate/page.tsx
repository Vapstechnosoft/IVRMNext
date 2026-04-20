'use client';

import { format } from 'date-fns';
import { RotateCcw, Printer, Loader2, Check, Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Popover as PopoverRoot } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useDanvantariBonafideLoadData,
    useChangeYearDanvantariBonafide,
    useChangeCourseDanvantariBonafide,
    useChangeBranchDanvantariBonafide,
    useChangeSemesterDanvantariBonafide,
    useDanvantariBonafideSearchFilter,
    useDanvantariBonafideReport
} from '@/hooks/admission/preadmission/reports/useDanvantariBonafideCertificate';

export default function DanvantariBonafideCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useDanvantariBonafideLoadData();

    /* -------------------- UI State -------------------- */
    const [reportType, setReportType] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'D'>('S');
    const [certificateType, setCertificateType] = useState<'1' | '0'>('1'); // 1: Bonafide, 0: Conduct

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [reportDate, setReportDate] = useState<Date>(new Date());
    const [conductText, setConductText] = useState('');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const yearMutation = useChangeYearDanvantariBonafide();
    const courseMutation = useChangeCourseDanvantariBonafide();
    const branchMutation = useChangeBranchDanvantariBonafide();
    const semesterMutation = useChangeSemesterDanvantariBonafide();
    const searchFilterMutation = useDanvantariBonafideSearchFilter();
    const reportMutation = useDanvantariBonafideReport();

    /* -------------------- Data Initialization -------------------- */
    const initialYearList = (loadData as any)?.data?.getyear || [];

    /* -------------------- Dependency Logic -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchTerm('');

        try {
            const res = (await yearMutation.mutateAsync({ ASMAY_Id: yearId })) as any;
            setCourseList(Array.isArray(res?.data?.getcourse) ? res?.data?.getcourse : []);
        } catch (error) {
            toast.error('Failed to update courses');
        }
    };

    const handleCourseChange = async (cId: number) => {
        setCourseId(cId);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await courseMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: cId
            })) as any;
            setBranchList(Array.isArray(res?.data?.getbranch) ? res?.data?.getbranch : []);
        } catch (error) {
            toast.error('Failed to update branches');
        }
    };

    const handleBranchChange = async (bId: number) => {
        setBranchId(bId);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await branchMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: bId
            })) as any;
            setSemesterList(Array.isArray(res?.data?.getsemester) ? res?.data?.getsemester : []);
        } catch (error) {
            toast.error('Failed to update semesters');
        }
    };

    const handleSemesterChange = async (sId: number) => {
        setSemesterId(sId);
        setSectionId(null);
        setStudentId(null);

        try {
            const res = (await semesterMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: branchId!,
                AMSE_Id: sId
            })) as any;
            setSectionList(Array.isArray(res?.data?.getsection) ? res?.data?.getsection : []);
        } catch (error) {
            toast.error('Failed to update sections');
        }
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (searchTerm.length > 2 && academicYearId) {
                try {
                    const res = (await searchFilterMutation.mutateAsync({
                        searchfilter: searchTerm,
                        ASMAY_Id: academicYearId,
                        AMCST_SOL: studentStatus,
                        AMCO_Id: reportType === 'A' ? 0 : courseId || 0,
                        AMB_Id: reportType === 'A' ? 0 : branchId || 0,
                        AMSE_Id: reportType === 'A' ? 0 : semesterId || 0,
                        ACMS_Id: reportType === 'A' ? 0 : sectionId || 0,
                        allorindid: reportType,
                        filterinitialdata: studentStatus
                    })) as any;
                    setStudentList(Array.isArray(res?.data?.getstudentlist) ? res?.data?.getstudentlist : []);
                } catch (error) {
                    console.error('Search failed', error);
                }
            }
        };

        const timeoutId = setTimeout(fetchStudents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, academicYearId, studentStatus, reportType]);

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || !studentId) {
            toast.error('Please select all required fields');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            AMCST_SOL: studentStatus,
            AMCO_Id: reportType === 'A' ? 0 : courseId || 0,
            AMB_Id: reportType === 'A' ? 0 : branchId || 0,
            AMSE_Id: reportType === 'A' ? 0 : semesterId || 0,
            ACMS_Id: reportType === 'A' ? 0 : sectionId || 0,
            AMCST_Id: studentId,
            allorindid: reportType
        };

        try {
            const res = (await reportMutation.mutateAsync(payload)) as any;
            const data = (res?.data);

            if (data?.getstudentdetailslist?.length > 0) {
                setReportData(data);
                setShowReport(true);
            } else {
                toast.error('No records found');
                setShowReport(false);
            }
        } catch (error) {
            toast.error('Failed to fetch report details');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setSectionId(null);
        setStudentId(null);
        setSearchTerm('');
        setReportType('A');
        setStudentStatus('S');
        setCertificateType('1');
        setShowReport(false);
        setConductText('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Danvantari_${certificateType === '1' ? 'Bonafide' : 'Conduct'}_Certificate`
    });

    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Bonafide Certificate Report'
                description='Generate study and conduct certificates for Danvantari students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Selection Type */}
                        <div className='flex flex-col space-y-2 rounded-lg border p-4 bg-gray-50/50'>
                            <Label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Selection Type</Label>
                            <RadioGroup
                                value={reportType}
                                onValueChange={(v) => {
                                    setReportType(v as any);
                                    setCourseId(null);
                                    setBranchId(null);
                                    setSemesterId(null);
                                    setSectionId(null);
                                    setStudentId(null);
                                }}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='A' id='sel-all' />
                                    <Label htmlFor='sel-all' className='text-sm font-medium'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='I' id='sel-ind' />
                                    <Label htmlFor='sel-ind' className='text-sm font-medium'>Individual</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Student Status */}
                        <div className='flex flex-col space-y-2 rounded-lg border p-4 bg-gray-50/50'>
                            <Label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Student Status</Label>
                            <RadioGroup
                                value={studentStatus}
                                onValueChange={(v) => setStudentStatus(v as any)}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='S' id='st-studying' />
                                    <Label htmlFor='st-studying' className='text-sm font-medium'>Studying</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='D' id='st-deactive' />
                                    <Label htmlFor='st-deactive' className='text-sm font-medium'>Deactive</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Certificate Type */}
                        <div className='flex flex-col space-y-2 rounded-lg border p-4 bg-gray-50/50'>
                            <Label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Certificate For</Label>
                            <RadioGroup
                                value={certificateType}
                                onValueChange={(v) => setCertificateType(v as any)}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='cert-bonafide' />
                                    <Label htmlFor='cert-bonafide' className='text-sm font-medium'>Bonafide</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='cert-conduct' />
                                    <Label htmlFor='cert-conduct' className='text-sm font-medium'>Conduct</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column: Cascading Selects */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialYearList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Course:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span></Label>
                                <Select
                                    disabled={reportType === 'A' || !academicYearId}
                                    value={courseId?.toString()}
                                    onValueChange={(v) => handleCourseChange(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Course' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseList.map((item: any) => (
                                            <SelectItem key={item.amcO_Id} value={item.amcO_Id.toString()}>
                                                {item.amcO_CourseName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Branch:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span></Label>
                                <Select
                                    disabled={reportType === 'A' || !courseId}
                                    value={branchId?.toString()}
                                    onValueChange={(v) => handleBranchChange(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Branch' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchList.map((item: any) => (
                                            <SelectItem key={item.amB_Id} value={item.amB_Id.toString()}>
                                                {item.amB_BranchName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Semester:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span></Label>
                                <Select
                                    disabled={reportType === 'A' || !branchId}
                                    value={semesterId?.toString()}
                                    onValueChange={(v) => handleSemesterChange(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Semester' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map((item: any) => (
                                            <SelectItem key={item.amsE_Id} value={item.amsE_Id.toString()}>
                                                {item.amsE_SEMName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Section:<span className={reportType === 'I' ? 'text-red-500' : 'hidden'}>*</span></Label>
                                <Select
                                    disabled={reportType === 'A' || !semesterId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => setSectionId(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.acmS_Id} value={item.acmS_Id.toString()}>
                                                {item.acmS_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column: Other inputs */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Date:<span className='text-red-500'>*</span></Label>
                                <PopoverRoot>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-9",
                                                !reportDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {reportDate ? format(reportDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={reportDate}
                                            onSelect={(date) => date && setReportDate(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </PopoverRoot>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Student Name:<span className='text-red-500'>*</span></Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            disabled={!academicYearId}
                                            className={cn(
                                                "w-full justify-between h-9 bg-white border-input font-normal",
                                                !studentId && "text-muted-foreground"
                                            )}
                                        >
                                            <span className="truncate pr-2">
                                                {studentId
                                                    ? (studentList.find((s: any) => s.amcsT_Id === studentId)?.studentname || "Selected Student")
                                                    : "Search Student (min 3 chars)"}
                                            </span>
                                            <div className="flex items-center shrink-0">
                                                {searchFilterMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                                ) : (
                                                    <>
                                                        {studentId && (
                                                            <X
                                                                className="h-4 w-4 mr-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStudentId(null);
                                                                    setSearchTerm("");
                                                                }}
                                                            />
                                                        )}
                                                        <Search className="h-4 w-4 opacity-50" />
                                                    </>
                                                )}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[450px] p-0 shadow-2xl' align='start'>
                                        <Command shouldFilter={false} className='w-full'>
                                            <div className="flex items-center border-b px-3">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <input
                                                    placeholder="Type to search (min 3 chars)..."
                                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <CommandList>
                                                <CommandEmpty>
                                                    {searchFilterMutation.isPending ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            <span>Loading...</span>
                                                        </div>
                                                    ) : "No student found."}
                                                </CommandEmpty>
                                                <CommandGroup className="max-h-64 overflow-y-auto">
                                                    {studentList.map((s: any) => (
                                                        <CommandItem
                                                            key={s.amcsT_Id}
                                                            value={s.amcsT_Id.toString()}
                                                            onSelect={() => {
                                                                setStudentId(s.amcsT_Id);
                                                                setStudentOpen(false);
                                                                setSearchTerm("");
                                                            }}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center">
                                                                <Check className={cn('mr-2 h-4 w-4 text-indigo-600', studentId === s.amcsT_Id ? 'opacity-100' : 'opacity-0')} />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{s.studentname}</span>
                                                                    <span className="text-[10px] text-muted-foreground">Adm: {s.admno}</span>
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

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Remark/Conduct:</Label>
                                <input
                                    type="text"
                                    className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-200'
                                    placeholder='Enter the Conduct (for Conduct certificate)'
                                    value={conductText}
                                    onChange={(e) => setConductText(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-6 pt-8 border-t'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={reportMutation.isPending}
                            className='w-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'REPORT'}
                        </Button>
                        <Button
                            size='lg'
                            variant="outline"
                            onClick={handleReset}
                            className='w-40 border-2 border-orange-200 text-orange-600 rounded-xl font-bold'>
                            CANCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='w-40 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl font-bold'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showReport && reportData && reportData.getstudentdetailslist?.map((student: any, index: number) => (
                <div key={index} className='mt-8 flex flex-col items-center bg-gray-50 p-4 md:p-8 rounded-2xl border-2 border-dashed border-indigo-200 overflow-auto'>
                    <div ref={printRef} className='bg-white shadow-2xl w-[210mm] min-h-[297mm] p-0 printable-content'>

                        {/* 1. BONAFIDE (STUDY) CERTIFICATE */}
                        {certificateType === '1' && (
                            <div className="certificate-page relative p-[15mm] flex flex-col" style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                <div className="border-2 border-black p-[10mm] h-full flex flex-col rounded-[15px]">

                                    {/* Header */}
                                    <div className="text-center mb-10 border-b-2 border-black pb-4">
                                        <img
                                            src="https://dcampusstrg.blob.core.windows.net/files/19/ISM_Attachments/2460aa04-2aee-4131-a407-25d84394aeb1.jpg"
                                            alt="Institution Logo"
                                            className="w-[90%] h-auto mx-auto object-contain"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="text-center mb-12">
                                        <h2 className="text-4xl font-serif font-black underline decoration-2 underline-offset-8">STUDY / BONAFIDE CERTIFICATE</h2>
                                    </div>

                                    {/* Body Text */}
                                    <div className="text-[28px] leading-[1.8] font-serif text-justify mb-10 px-4">
                                        <p>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that Ms.
                                            <b className="border-b-2 border-black inline-block min-w-[300px] px-2 uppercase mx-2" contentEditable>{student.studentname}</b>
                                            is a bonafide student of this college for the
                                            <b className="border-b-2 border-black inline-block min-w-[250px] px-2 uppercase mx-2" contentEditable>{student.coursename}</b>
                                            course during the academic year
                                            <b className="border-b-2 border-black inline-block min-w-[150px] px-2 mx-2" contentEditable>{student.acadamicyear}</b>.
                                        </p>
                                    </div>

                                    <div className="text-[28px] font-serif px-4 mb-4">
                                        Admission No: <b className="border-b-2 border-black px-2 ml-2" contentEditable>{student.admno}</b>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto flex justify-between items-end px-4 text-[28px] font-serif pb-10">
                                        <div>
                                            <b>Date:</b> <b className="border-b-2 border-black ml-2 px-2">{format(reportDate, 'dd/MM/yyyy')}</b>
                                        </div>
                                        <div className="text-center">
                                            <b className="block">Principal</b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. CONDUCT CERTIFICATE */}
                        {certificateType === '0' && (
                            <div className="certificate-page relative p-[10mm] flex flex-col" style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                <div className="border-2 border-black p-[8mm] h-full flex flex-col rounded-[15px]">

                                    {/* Header */}
                                    <div className="text-center mb-6 border-b-2 border-black pb-4">
                                        <img
                                            src={reportData.logo || "https://dcampusstrg.blob.core.windows.net/files/19/ISM_Attachments/2460aa04-2aee-4131-a407-25d84394aeb1.jpg"}
                                            alt="Institution Logo"
                                            className="w-[85%] h-auto mx-auto object-contain"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="text-center mb-8">
                                        <h2 className="text-4xl font-serif font-black underline decoration-2 underline-offset-8">BONAFIDE CERTIFICATE</h2>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="flex justify-between items-center text-[24px] font-serif px-6 mb-8">
                                        <div>Admission No: <b className="border-b-2 border-black px-2 ml-2" contentEditable>{student.admno}</b></div>
                                        <div><b>Date:</b> <b className="border-b-2 border-black ml-2 px-2">{format(reportDate, 'dd/MM/yyyy')}</b></div>
                                    </div>

                                    {/* Body Text */}
                                    <div className="text-[26px] leading-[1.8] font-serif text-justify px-6">
                                        <p className="mb-6">
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This is to certify that Master/Kumari
                                            <b className="border-b-2 border-black inline-block min-w-[300px] px-2 uppercase mx-2" contentEditable>{student.studentname}</b>
                                        </p>
                                        <p className="mb-6">
                                            S/o. D/o. <b className="border-b-2 border-black inline-block min-w-[300px] px-2 mx-2" contentEditable>{student.fathername}</b>
                                            bearing H.T.No <b className="border-b-2 border-black inline-block min-w-[150px] px-2 mx-2" contentEditable></b>
                                        </p>
                                        <p className="mb-6">
                                            is a Bonafide student of this Institution, is studying
                                            year <b className="border-b-2 border-black px-4 mx-2" contentEditable>{student.semestername || 'I'}</b>
                                            semester of IV years B.Pharmacy degree course for the Academic Year
                                            <b className="border-b-2 border-black px-4 mx-2" contentEditable>{student.academicyear || student.acadamicyear}</b>.
                                        </p>
                                        <p className="mb-6">
                                            During the study period his/her character was found good. His/her date of birth as per our record is
                                            <b className="border-b-2 border-black px-4 mx-2" contentEditable>{student.dob ? format(new Date(student.dob), 'dd-MM-yyyy') : ''}</b>.
                                        </p>
                                        <p>
                                            This Certificate is issued on the request of the Candidate to Obtain the
                                            <b className="border-b-2 border-black inline-block min-w-[200px] px-2 mx-2 uppercase" contentEditable>{conductText}</b>.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto flex justify-between items-end px-10 text-[26px] font-serif pb-12">
                                        <div className="text-center">
                                            <b className="block border-t-2 border-black pt-1 px-8">Clerk</b>
                                        </div>
                                        <div className="text-center">
                                            <b className="block text-[32px]">Principal</b>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <style jsx global>{`
                @media print {
                    .printable-content {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: white !important;
                    }
                    .certificate-page {
                        border: none !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        overflow: hidden !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                
                [contenteditable="true"]:focus {
                    outline: 2px solid #6366f1;
                    background-color: #f5f3ff;
                }
            `}</style>
        </div>
    );
}
