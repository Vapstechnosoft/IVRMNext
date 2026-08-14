'use client';

import { format } from 'date-fns';
import { Printer, Loader2, Check, Search, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useDanvantariTCLoadData,
    useChangeYearDanvantariTC,
    useChangeCourseDanvantariTC,
    useChangeBranchDanvantariTC,
    useChangeSemesterDanvantariTC,
    useDanvantariTCDetails, useDanvantariStudentName
} from '@/hooks/admission/preadmission/reports/useDanvantariTransferCertificate';

export default function DanvantariTransferCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useDanvantariTCLoadData();

    /* -------------------- UI State -------------------- */
    const [tctempper, setTctempper] = useState<'temp' | 'per'>('per');
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [selectedStudentName, setSelectedStudentName] = useState<string>('');
    const [sectionId, setSectionId] = useState<number>(0);
    const [admNo, setAdmNo] = useState<string>('');
    const [miId, setMiId] = useState<number>(30);

    // Filter lists
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    // UI inputs
    const [hallTicketNo, setHallTicketNo] = useState('');
    const [reasonForLeaving, setReasonForLeaving] = useState('');
    const [identificationMarks, setIdentificationMarks] = useState('');

    // Control states
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const yearMutation = useChangeYearDanvantariTC();
    const courseMutation = useChangeCourseDanvantariTC();
    const branchMutation = useChangeBranchDanvantariTC();
    const semesterMutation = useChangeSemesterDanvantariTC();
    const reportMutation = useDanvantariTCDetails();
    const studentNameMutation = useDanvantariStudentName();
    const academicYearList = (loadData as any)?.data?.getyear || (loadData as any)?.getyear || [];

    useEffect(() => {
        const fetchStudents = async () => {
            if (searchTerm.length >= 3 && academicYearId) {
                try {
                    const res = await studentNameMutation.mutateAsync({
                        ASMAY_Id: academicYearId,
                        AMCO_Id: courseId || 0,
                        AMB_Id: branchId || 0,
                        searchfilter: searchTerm,
                        AMCST_SOL: tctempper
                    });
                    const data = (res as any)?.data || res;
                    const list = data?.getstudentlist || data?.studentList || [];
                    setStudentList(Array.isArray(list) ? list : []);
                } catch (error) {
                    console.error('Search failed:', error);
                }
            }
        };

        const timeoutId = setTimeout(fetchStudents, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, academicYearId, courseId, branchId, tctempper]);



    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (yearId: number) => {
        // Reset all dependent states immediately
        setAcademicYearId(yearId);
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setStudentId(null);
        setSelectedStudentName('');
        setSectionId(0);
        setAdmNo('');
        setMiId(30);
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);
        setHallTicketNo('');
        setReasonForLeaving('');
        setIdentificationMarks('');
        setShowReport(false);
        setSearchTerm('');

        try {
            const res = await yearMutation.mutateAsync({
                ASMAY_Id: yearId,
                tctemporper: tctempper
            });
            const data = (res as any)?.data || res;
            const cList = data?.getcourse || data?.courselist || data?.courseList || [];
            if (Array.isArray(cList)) {
                setCourseList(cList);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses for selected year');
        }
    };

    const handleCourseChange = async (cid: number) => {
        setCourseId(cid);
        setBranchId(null);
        setSemesterId(null);
        setStudentId(null);
        setSelectedStudentName('');
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);
        setHallTicketNo('');
        setReasonForLeaving('');
        setIdentificationMarks('');
        setShowReport(false);

        try {
            const res = await courseMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: cid,
                tctemporper: tctempper
            });
            const data = (res as any)?.data || res;

            // Handle branches or semesters directly
            const bList = data?.getbranch || data?.branchlist || data?.branchList || [];
            setBranchList(Array.isArray(bList) ? bList : []);

            const semList = data?.getsemester || data?.getSemester || data?.semesterlist || data?.semesterList || [];
            setSemesterList(Array.isArray(semList) ? semList : []);
        } catch (error) {
            toast.error('Failed to load data for selected course');
        }
    };

    const handleBranchChange = async (bid: number) => {
        setBranchId(bid);
        setSemesterId(null);
        setStudentId(null);
        setSelectedStudentName('');
        setSemesterList([]);
        setStudentList([]);
        setShowReport(false);

        try {
            const res = await branchMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: bid,
                tctemporper: tctempper
            });
            const data = (res as any)?.data || res;
            const semList = data?.getsemester || data?.getSemester || data?.semesterlist || data?.semesterList || [];
            setSemesterList(Array.isArray(semList) ? semList : []);
        } catch (error) {
            toast.error('Failed to load semesters');
        }
    };

    const handleSemesterChange = async (sid: number) => {
        setSemesterId(sid);
        setStudentId(null);
        setSelectedStudentName('');
        setStudentList([]);
        setHallTicketNo('');
        setReasonForLeaving('');
        setIdentificationMarks('');
        setShowReport(false);

        try {
            const res = await semesterMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                AMCO_Id: courseId!,
                AMB_Id: branchId || 0,
                AMSE_Id: sid,
                tctemporper: tctempper
            });
            const data = (res as any)?.data || res;
            const stuList = data?.getstudent || data?.getstudentdetails || data?.getstudentlist || data?.studentList || [];
            setStudentList(Array.isArray(stuList) ? stuList : []);
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    const handleReport = async () => {
        if (academicYearId === null) {
            toast.error('Select Academic Year');
            return;
        }
        if (courseId === null) {
            toast.error('Select Course');
            return;
        }
        if (semesterId === null) {
            toast.error('Select Semester');
            return;
        }
        if (studentId === null) {
            toast.error('Select Student Name');
            return;
        }

        try {
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                AMCST_Id: studentId,
                AMCO_Id: courseId || 0,
                AMB_Id: branchId || 0,
                AMSE_Id: semesterId || 0,
                ACMS_Id: sectionId || 1,
                miId: miId,
                admNo: admNo,
                studentName: selectedStudentName,
                tctemporper: tctempper
            });

            console.log("res", res);
            const data = (res as any)?.data || res;
            console.log("data", data);
            console.log("data keys", Object.keys(data || {}));

            if (res && (res as any).success === false) {
                toast.error((res as any).message || 'Error from server');
                return;
            }

            // Extract students list from various possible structures
            let students = [];
            if (Array.isArray(data)) {
                students = data;
            } else if (data) {
                students = data.getstudentdetails || data.getstudentlist || data.getreport || data.getstudent || [];
            }

            if (students && students.length > 0) {
                // Wrap in expected structure if it was a plain array
                const finalReportData = Array.isArray(data) ? { getstudentdetails: data } : data;
                setReportData(finalReportData);
                setShowReport(true);
                toast.success('Report generated successfully');
            } else {
                toast.error('No record found for selected student');
                setShowReport(false);
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error generating report');
        }
    };

    const handleCancel = () => {
        setAcademicYearId(null);
        setCourseId(null);
        setBranchId(null);
        setSemesterId(null);
        setStudentId(null);
        setSelectedStudentName('');
        setSectionId(0);
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setStudentList([]);
        setHallTicketNo('');
        setReasonForLeaving('');
        setIdentificationMarks('');
        setShowReport(false);
        setTctempper('per');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Danvantari_TC_${selectedStudentName || 'Report'}`
    });

    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Student Transfer Certificate'
                description='Generate transfer certificates for Danvantari Students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='space-y-8 bg-white p-6'>
                    {/* Student Type Selection */}
                    <div className='flex justify-center'>
                        <div className='bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 w-full max-w-2xl'>
                            <RadioGroup
                                value={tctempper}
                                onValueChange={(v) => {
                                    setTctempper(v as any);
                                    setAcademicYearId(null);
                                    setCourseId(null);
                                    setBranchId(null);
                                    setSemesterId(null);
                                    setStudentId(null);
                                    setSelectedStudentName('');
                                    setCourseList([]);
                                    setBranchList([]);
                                    setSemesterList([]);
                                    setStudentList([]);
                                    setShowReport(false);
                                }}
                                className='flex justify-center space-x-12'>
                                <div className='flex items-center space-x-3'>
                                    <RadioGroupItem value='temp' id='rt-temp' className='h-5 w-5 border-indigo-300 text-indigo-600' />
                                    <Label htmlFor='rt-temp' className='text-base font-bold text-slate-700 cursor-pointer'>Temp Student</Label>
                                </div>
                                <div className='flex items-center space-x-3'>
                                    <RadioGroupItem value='per' id='rt-per' className='h-5 w-5 border-indigo-300 text-indigo-600' />
                                    <Label htmlFor='rt-per' className='text-base font-bold text-slate-700 cursor-pointer'>Permanent Student</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Filter Section */}
                        <div className='bg-slate-50 p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId !== null ? academicYearId.toString() : ""} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearList.map((year: any, idx: number) => (
                                            <SelectItem key={`year-${year.asmaY_Id || idx}`} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Course:<span className='text-red-500'>*</span></Label>
                                <Select value={courseId !== null ? courseId.toString() : ""} onValueChange={(v) => handleCourseChange(Number(v))} disabled={!academicYearId}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        {courseMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin mr-2 opacity-50' /> : null}
                                        <SelectValue placeholder='Select Course' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseList.map((course: any, idx: number) => (
                                            <SelectItem key={`course-${course.amcO_Id || course.AMCO_Id || idx}`} value={(course.amcO_Id || course.AMCO_Id).toString()}>
                                                {course.amcO_CourseName || course.AMCO_CourseName || course.coursename}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {branchList.length > 0 && (
                                <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                    <Label className='text-sm font-bold text-slate-700'>Branch:<span className='text-red-500'>*</span></Label>
                                    <Select value={branchId !== null ? branchId.toString() : ""} onValueChange={(v) => handleBranchChange(Number(v))} disabled={!courseId}>
                                        <SelectTrigger className='h-10 rounded-xl'>
                                            {branchMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin mr-2 opacity-50' /> : null}
                                            <SelectValue placeholder='Select Branch' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branchList.map((branch: any, idx: number) => (
                                                <SelectItem key={`branch-${branch.amB_Id || branch.AMB_Id || idx}`} value={(branch.amB_Id || branch.AMB_Id).toString()}>
                                                    {branch.amB_BranchName || branch.AMB_BranchName || branch.branchname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}


                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Semester:<span className='text-red-500'>*</span></Label>
                                <Select value={semesterId !== null ? semesterId.toString() : ""} onValueChange={(v) => handleSemesterChange(Number(v))} disabled={branchList.length > 0 ? !branchId : !courseId}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        {semesterMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin mr-2 opacity-50' /> : null}
                                        <SelectValue placeholder='Select Semester' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map((sem: any, idx: number) => (
                                            <SelectItem key={`sem-${sem.amsE_Id || sem.AMSE_Id || idx}`} value={(sem.amsE_Id || sem.AMSE_Id).toString()}>
                                                {sem.amsE_SemName || sem.AMSE_SemName || sem.amsE_SEMName || sem.AMSE_SEMName || sem.semestername || sem.semesterName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Student Name:<span className='text-red-500'>*</span></Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            disabled={!semesterId}
                                            className={cn(
                                                "w-full justify-between h-10 rounded-xl bg-white border-input font-normal",
                                                studentId === null && "text-muted-foreground"
                                            )}
                                        >
                                            <span className="truncate pr-2">
                                                {studentId !== null
                                                    ? (selectedStudentName || "Selected Student")
                                                    : "Select Student"}
                                            </span>
                                            <div className="flex items-center shrink-0">
                                                {yearMutation.isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin opacity-50" />
                                                ) : (
                                                    <>
                                                        {studentId !== null && (
                                                            <X
                                                                className="h-4 w-4 mr-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setStudentId(null);
                                                                    setSelectedStudentName('');
                                                                }}
                                                            />
                                                        )}
                                                        <Search className="h-4 w-4 opacity-50" />
                                                    </>
                                                )}
                                            </div>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[450px] p-0 shadow-2xl rounded-xl overflow-hidden' align='start'>
                                        <Command className='w-full' shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Search student (Min 3 chars)..."
                                                className="h-10"
                                                value={searchTerm}
                                                onValueChange={setSearchTerm}
                                            />
                                            <CommandList>
                                                {studentNameMutation.isPending && (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                                    </div>
                                                )}
                                                <CommandEmpty>
                                                    {searchTerm.length < 3 ? 'Type at least 3 characters to search' : 'No students found'}
                                                </CommandEmpty>
                                                <CommandGroup className="max-h-64 overflow-y-auto">
                                                    {studentList.map((s: any, idx: number) => (
                                                        <CommandItem
                                                            key={`student-${s.amcsT_Id || s.AMCST_Id || s.AMST_Id || idx}`}
                                                            value={`${s.studentName || s.studentname} ${s.amsT_AdmNo || s.AMST_AdmNo || ''}`}
                                                            onSelect={() => {
                                                                const id = s.amcsT_Id || s.AMCST_Id || s.AMST_Id;
                                                                const name = s.studentName || s.studentname || "Selected Student";
                                                                const sid = s.acmS_Id || s.ACMS_Id || 1;
                                                                const admNo = s.amsT_AdmNo || s.AMST_AdmNo || "";
                                                                const miid = s.mI_Id || s.mi_Id || 30;
                                                                setStudentId(id);
                                                                setSelectedStudentName(name);
                                                                setSectionId(sid);
                                                                setAdmNo(admNo);
                                                                setMiId(miid);
                                                                setStudentOpen(false);
                                                            }}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center">
                                                                <Check className={cn('mr-2 h-4 w-4 text-indigo-600', studentId === (s.amcsT_Id || s.AMCST_Id || s.AMST_Id) ? 'opacity-100' : 'opacity-0')} />
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-slate-700">{s.studentName || s.studentname}</span>
                                                                    <span className="text-[10px] text-muted-foreground uppercase">{s.amsT_AdmNo || s.AMST_AdmNo}</span>
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

                        {/* Extra Details Section */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Hall Ticket No:</Label>
                                <input
                                    className='flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
                                    placeholder='Enter Hall Ticket No'
                                    value={hallTicketNo}
                                    onChange={(e) => setHallTicketNo(e.target.value)}
                                />
                            </div>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Reason for Leaving:</Label>
                                <input
                                    className='flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
                                    placeholder='Enter Reason'
                                    value={reasonForLeaving}
                                    onChange={(e) => setReasonForLeaving(e.target.value)}
                                />
                            </div>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold text-slate-700'>Identification Marks:</Label>
                                <input
                                    className='flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
                                    placeholder='Enter Identification Marks'
                                    value={identificationMarks}
                                    onChange={(e) => setIdentificationMarks(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center items-center gap-4 pt-8 border-t border-slate-100'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={reportMutation.isPending}
                            className='w-fit bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md px-6 py-2'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'REPORT'}
                        </Button>

                        <Button
                            size='sm'
                            variant='outline'
                            onClick={handleCancel}
                            className='w-fit border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl font-bold px-6 py-2'>
                            CANCEL
                        </Button>

                        <Button
                            size='sm'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='w-fit bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-md px-6 py-2'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Print Preview */}
            {showReport && reportData && (reportData.getstudentdetails || reportData.getstudentlist)?.map((student: any, idx: number) => (
                <div key={`report-${idx}`} className='mt-8 flex flex-col items-center bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-indigo-200 overflow-auto'>
                    <div ref={printRef} className='bg-white shadow-2xl w-[210mm] min-h-[297mm] p-0 printable-content'>
                        <div className="certificate-page relative p-[15mm] flex flex-col" style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                            <div className="h-full border-[1.5px] border-black p-[8mm] flex flex-col relative">

                                {/* Header Section */}
                                <div className="text-center mb-6">
                                    <img src={student.imgname || "https://vapsclg.blob.core.windows.net/files/76/NoticeUpload/d120170c-fbbf-48c2-b675-ef8d053a0d03.jpg"} className="w-[85%] mx-auto h-auto object-contain" alt="Danvantari Logo" />
                                </div>

                                {/* Title */}
                                <div className="text-center mb-8">
                                    <h2 className="title-box">TRANSFER CERTIFICATE</h2>
                                </div>

                                {/* No & Date */}
                                <div className="flex justify-between items-center text-[18px] font-serif mb-8 px-2 font-bold">
                                    <span>NO. <span className="border-b border-black inline-block min-w-[100px] text-center">{student.ACSTC_TCNO || 'N/A'}</span></span>
                                    <span>Date: <span className="border-b border-black inline-block min-w-[100px] text-center">{format(new Date(), 'dd/MM/yyyy')}</span></span>
                                </div>

                                {/* Form Rows */}
                                <div className="tc-content font-serif text-[18px] space-y-6">
                                    {/* Row 1 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[180px]">1. Admission No :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{student.AMCST_AdmNo}</div>
                                        <div className="flex-shrink-0 w-[100px] text-right">H.T.No :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{hallTicketNo}</div>
                                    </div>

                                    {/* Row 2 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[180px]">2. Course Admitted :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{student.coursename}</div>
                                    </div>

                                    {/* Row 3 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[240px]">3. Name of the Student (as per SSC) :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5 uppercase" contentEditable suppressContentEditableWarning={true}>{student.studentname}</div>
                                    </div>

                                    {/* Row 4 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[190px]">4. Name of the Father :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5 uppercase" contentEditable suppressContentEditableWarning={true}>{student.AMCST_FatherName}</div>
                                    </div>

                                    {/* Row 5 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[160px]">5. Date of Birth :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{student.AMCST_DOB ? format(new Date(student.AMCST_DOB), 'dd/MM/yyyy') : ''}</div>
                                    </div>

                                    {/* Row 6 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[180px]">6. Identification Marks :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5 uppercase" contentEditable suppressContentEditableWarning={true}>{identificationMarks}</div>
                                    </div>

                                    {/* Row 7 */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 flex-grow">
                                            <div className="flex-shrink-0">7. Nationality :</div>
                                            <div className="flex-grow border-b border-black px-2 pb-0.5 text-center" contentEditable suppressContentEditableWarning={true}>{student.nationality}</div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-grow">
                                            <div className="flex-shrink-0">Religion :</div>
                                            <div className="flex-grow border-b border-black px-2 pb-0.5 text-center" contentEditable suppressContentEditableWarning={true}>{student.religion}</div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-grow">
                                            <div className="flex-shrink-0">Caste :</div>
                                            <div className="flex-grow border-b border-black px-2 pb-0.5 text-center" contentEditable suppressContentEditableWarning={true}>{student.caste}</div>
                                        </div>
                                    </div>

                                    {/* Row 8 */}
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 w-[420px]">8. Class Studying at the time of leaving the institution :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{student.CurrentSemStudying}</div>
                                    </div>

                                    {/* Row 9 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[240px]">9. Reason for leaving institution :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{reasonForLeaving}</div>
                                    </div>

                                    {/* Row 10 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[140px]">10. T.C. issue on :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{format(new Date(), 'dd/MM/yyyy')}</div>
                                    </div>

                                    {/* Row 11 */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-shrink-0 w-[240px]">11. Conduct of the Student :</div>
                                        <div className="flex-grow border-b border-black px-2 pb-0.5" contentEditable suppressContentEditableWarning={true}>{student.ACSTC_Conduct}</div>
                                    </div>
                                </div>

                                {/* Signature Footer */}
                                <div className="mt-auto flex justify-between items-end px-4 text-[18px] font-serif font-bold pb-10">
                                    <div className="text-center w-[150px]">
                                        <div className="block pb-2">Clerk</div>
                                    </div>
                                    <div className="text-center w-[200px]">
                                        <div className="block uppercase pt-1">PRINCIPAL</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx global>{`
                .title-box {
                    border: 2px solid black;
                    padding: 8px 30px;
                    display: inline-block;
                    font-size: 24px;
                    font-weight: 900;
                    font-family: 'Times New Roman', serif;
                    background: white;
                }

                @media print {
                    .printable-content {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
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
                    outline: none;
                    background-color: #f8fafc;
                    border-bottom: 2px solid #6366f1;
                }
            `}</style>
        </div>
    );
}
