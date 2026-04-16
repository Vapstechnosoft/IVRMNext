'use client';

import { format } from 'date-fns';
import { CalendarIcon, RotateCcw, Printer, Loader2, Check, FileText, X, Globe, Mail, Phone } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useDebounce } from '@/hooks/utils/use-debounce';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useSMSCConductCertLoadData,
    useSMSCConductCertYearChange,
    useSMSCConductCertCourseChange,
    useSMSCConductCertBranchChange,
    useSMSCConductCertSemesterChange,
    useSMSCConductCertSearch,
    useSMSCConductCertReport
} from '@/hooks/admission/preadmission/reports/useSmsConductCertificate';

export default function SMSCConductCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Data Hooks -------------------- */
    const { data: loadData } = useSMSCConductCertLoadData();
    const yearChangeMutation = useSMSCConductCertYearChange();
    const courseChangeMutation = useSMSCConductCertCourseChange();
    const branchChangeMutation = useSMSCConductCertBranchChange();
    const semesterChangeMutation = useSMSCConductCertSemesterChange();
    const searchMutation = useSMSCConductCertSearch();
    const reportMutation = useSMSCConductCertReport();

    /* -------------------- Form State -------------------- */
    const [studentScope, setStudentScope] = useState<'A' | 'I'>('A');
    const [studentStatus, setStudentStatus] = useState<'S' | 'D'>('S');
    const [certificateType, setCertificateType] = useState<'1' | '0'>('1'); // 1: Study, 0: Conduct

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [courseId, setCourseId] = useState<number | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [semesterId, setSemesterId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [reportDate, setReportDate] = useState<Date>(new Date());

    // Additional Fields for Conduct
    const [examName, setExamName] = useState('');
    const [examMonthYear, setExamMonthYear] = useState('');
    const [regNo, setRegNo] = useState('');

    /* -------------------- Lists State -------------------- */
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    /* -------------------- UI State -------------------- */
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [studentOpen, setStudentOpen] = useState(false);
    const [dateOpen, setDateOpen] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const debouncedSearch = useDebounce(searchQuery, 500);

    /* -------------------- Masters Data -------------------- */
    const yearList = loadData?.getyear || [];

    /* -------------------- Cascading Effects -------------------- */
    const handleYearChange = async (val: string) => {
        const id = Number(val);
        setAcademicYearId(id);
        setCourseId(null); setBranchId(null); setSemesterId(null); setSectionId(null); setStudentId(null);
        setCourseList([]); setBranchList([]); setSemesterList([]); setSectionList([]); setStudentList([]);
        setSearchQuery('');

        try {
            const res = await yearChangeMutation.mutateAsync({ ASMAY_Id: id });
            setCourseList(Array.isArray(res?.getcourse) ? res?.getcourse : []);
        } catch (e) { toast.error('Failed to load courses'); }
    };

    const handleCourseChange = async (val: string) => {
        const id = Number(val);
        setCourseId(id);
        setBranchId(null); setSemesterId(null); setSectionId(null); setStudentId(null);
        setBranchList([]); setSemesterList([]); setSectionList([]); setStudentList([]);
        setSearchQuery('');

        try {
            const res = await courseChangeMutation.mutateAsync({ ASMAY_Id: academicYearId!, AMCO_Id: id });
            setBranchList(Array.isArray(res?.getbranch) ? res?.getbranch : []);
        } catch (e) { toast.error('Failed to load branches'); }
    };

    const handleBranchChange = async (val: string) => {
        const id = Number(val);
        setBranchId(id);
        setSemesterId(null); setSectionId(null); setStudentId(null);
        setSemesterList([]); setSectionList([]); setStudentList([]);
        setSearchQuery('');

        try {
            const res = await branchChangeMutation.mutateAsync({ ASMAY_Id: academicYearId!, AMCO_Id: courseId!, AMB_Id: id });
            setSemesterList(Array.isArray(res?.getsemester) ? res?.getsemester : []);
        } catch (e) { toast.error('Failed to load semesters'); }
    };

    const handleSemesterChange = async (val: string) => {
        const id = Number(val);
        setSemesterId(id);
        setSectionId(null); setStudentId(null);
        setSectionList([]); setStudentList([]);
        setSearchQuery('');

        try {
            const res = await semesterChangeMutation.mutateAsync({ ASMAY_Id: academicYearId!, AMCO_Id: courseId!, AMB_Id: branchId!, AMSE_Id: id });
            setSectionList(Array.isArray(res?.getsection) ? res?.getsection : []);
        } catch (e) { toast.error('Failed to load sections'); }
    };

    /* -------------------- Search Logic -------------------- */
    useEffect(() => {
        const fetchStudents = async () => {
            if (!academicYearId || debouncedSearch.length < 2) {
                setStudentList([]);
                return;
            }

            try {
                const res = await searchMutation.mutateAsync({
                    filterinitialdata: studentStatus,
                    searchfilter: debouncedSearch,
                    ASMAY_Id: academicYearId,
                    AMCST_SOL: studentStatus,
                    AMCO_Id: studentScope === 'A' ? 0 : (courseId || 0),
                    AMB_Id: studentScope === 'A' ? 0 : (branchId || 0),
                    AMSE_Id: studentScope === 'A' ? 0 : (semesterId || 0),
                    ACMS_Id: studentScope === 'A' ? 0 : (sectionId || 0),
                    allorindid: studentScope
                });

                const list = res?.getstudentlist || [];
                setStudentList(Array.isArray(list) ? list : []);
            } catch (error) {
                console.error('Search error:', error);
                setStudentList([]);
            }
        };

        fetchStudents();
    }, [debouncedSearch, academicYearId, studentStatus, courseId, branchId, semesterId, sectionId, studentScope]);

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId) { toast.error('Select Academic Year'); return; }
        if (studentScope === 'I' && !studentId) { toast.error('Select Student'); return; }

        const payload = {
            ASMAY_Id: academicYearId,
            AMCST_SOL: studentStatus,
            AMCO_Id: studentScope === 'A' ? 0 : (courseId || 0),
            AMB_Id: studentScope === 'A' ? 0 : (branchId || 0),
            AMSE_Id: studentScope === 'A' ? 0 : (semesterId || 0),
            ACMS_Id: studentScope === 'A' ? 0 : (sectionId || 0),
            AMCST_Id: studentId || 0,
            allorindid: studentScope
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const list = res?.getstudentdetailslist || [];
            if (Array.isArray(list) && list.length > 0) {
                setReportData({
                    ...res,
                    studentList: list.map((s: any) => {
                        const gender = (s.gender || '').toUpperCase();
                        const isFemale = gender === 'FEMALE';
                        return {
                            ...s,
                            gender6: isFemale ? 'Ms' : 'Mr',
                            sonof: isFemale ? 'D/o' : 'S/o',
                            todaydate: reportDate
                        };
                    })
                });
                setShowReport(true);
            } else {
                toast.error('No records found');
                setShowReport(false);
            }
        } catch (e) {
            toast.error('Failed to generate report');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null); setCourseId(null); setBranchId(null); setSemesterId(null); setSectionId(null); setStudentId(null);
        setSearchQuery(''); setSelectedStudentName('');
        setStudentScope('A'); setStudentStatus('S'); setCertificateType('1');
        setReportDate(new Date()); setExamName(''); setExamMonthYear(''); setRegNo('');
        setShowReport(false); setReportData(null);
        setCourseList([]); setBranchList([]); setSemesterList([]); setSectionList([]); setStudentList([]);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: certificateType === '1' ? 'SMSC_Study_Certificate' : 'SMSC_Conduct_Certificate'
    });

    return (
        <div className="min-h-screen p-4 space-y-6 bg-slate-50/50">
            <CollapsibleSection
                title="SMS College Study & Conduct Certificate"
                description="Generate study and conduct certificates for SMS Degree College students"
                defaultOpen={true}
                variant="outline"
                className="shadow-xl border-slate-200"
            >
                <div className="space-y-8 bg-white p-8 rounded-b-2xl">
                    {/* Top Selectors Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SelectionCard label="Selection Scope">
                            <RadioGroup value={studentScope} onValueChange={(v) => {
                                setStudentScope(v as any);
                                if (v === 'A') {
                                    setCourseId(null); setBranchId(null); setSemesterId(null); setSectionId(null); setStudentId(null);
                                }
                            }} className="flex space-x-8">
                                <RadioItem id="sc-all" value="A" label="All" />
                                <RadioItem id="sc-ind" value="I" label="Individual" />
                            </RadioGroup>
                        </SelectionCard>

                        <SelectionCard label="Student Status">
                            <RadioGroup value={studentStatus} onValueChange={(v) => {
                                setStudentStatus(v as any);
                                setStudentId(null); setSearchQuery('');
                            }} className="flex space-x-8">
                                <RadioItem id="ss-studying" value="S" label="Studying" />
                                <RadioItem id="ss-deactive" value="D" label="Deactive" />
                            </RadioGroup>
                        </SelectionCard>

                        <SelectionCard label="Certificate Type">
                            <RadioGroup value={certificateType} onValueChange={(v) => {
                                setCertificateType(v as any);
                                if (v === '1') { setExamName(''); setExamMonthYear(''); setRegNo(''); }
                            }} className="flex space-x-8">
                                <RadioItem id="ct-study" value="1" label="Study" />
                                <RadioItem id="ct-conduct" value="0" label="Conduct" />
                            </RadioGroup>
                        </SelectionCard>
                    </div>

                    {/* Main Filter Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Side - Cascading Selects */}
                        <div className="space-y-5">
                            <FilterItem label="Academic Year" required>
                                <Select value={academicYearId?.toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200 focus:ring-indigo-100">
                                        <SelectValue placeholder="--Select Year--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.isArray(yearList) && yearList.map((y: any) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FilterItem>

                            <FilterItem label="Course" disabled={studentScope === 'A'} required={studentScope === 'I'}>
                                <Select disabled={studentScope === 'A'} value={courseId?.toString()} onValueChange={handleCourseChange}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="--Select Course--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseList.map((c: any) => (
                                            <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>{c.amcO_CourseName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FilterItem>

                            <FilterItem label="Branch" disabled={studentScope === 'A'} required={studentScope === 'I'}>
                                <Select disabled={studentScope === 'A'} value={branchId?.toString()} onValueChange={handleBranchChange}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="--Select Branch--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branchList.map((b: any) => (
                                            <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>{b.amB_BranchName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FilterItem>

                            <FilterItem label="Semester" disabled={studentScope === 'A'} required={studentScope === 'I'}>
                                <Select disabled={studentScope === 'A'} value={semesterId?.toString()} onValueChange={handleSemesterChange}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="--Select Semester--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesterList.map((s: any) => (
                                            <SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>{s.amsE_SEMName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FilterItem>

                            <FilterItem label="Section" disabled={studentScope === 'A'} required={studentScope === 'I'}>
                                <Select disabled={studentScope === 'A'} value={sectionId?.toString()} onValueChange={(v) => {
                                    setSectionId(Number(v)); setStudentId(null); setSearchQuery('');
                                }}>
                                    <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                                        <SelectValue placeholder="--Select Section--" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((s: any) => (
                                            <SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>{s.acmS_SectionName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FilterItem>
                        </div>

                        {/* Right Side - Search and Extra Fields */}
                        <div className="space-y-5">
                            <FilterItem label="Report Date" required>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal border-slate-200 bg-slate-50">
                                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                                            {reportDate ? format(reportDate, 'dd/MM/yyyy') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="start" className="p-0">
                                        <DatePickerWithYear mode="single" selected={reportDate} onDayClick={(d) => { if (d) setReportDate(d); setDateOpen(false); }} />
                                    </PopoverContent>
                                </Popover>
                            </FilterItem>

                            <FilterItem label="Student Search" required={studentScope === 'I'}>
                                <div className="relative">
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <div className="relative">
                                                <input
                                                    disabled={!academicYearId || studentScope === 'A'}
                                                    value={studentId ? (selectedStudentName || searchQuery) : searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        if (studentId) { setStudentId(null); setSelectedStudentName(''); }
                                                        setStudentOpen(true);
                                                    }}
                                                    className="w-full h-10 px-3 border border-slate-200 rounded-md bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-100 outline-none"
                                                    placeholder={studentScope === 'A' ? "Search disabled for 'All' scope" : "Type student name (min 2 chars)..."}
                                                />
                                                {searchMutation.isPending && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-indigo-400" />}
                                                {studentId && <X className="absolute right-3 top-3 h-4 w-4 cursor-pointer text-slate-400 hover:text-red-500" onClick={() => { setStudentId(null); setSelectedStudentName(''); setSearchQuery(''); }} />}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[450px] p-0" align="start">
                                            <Command shouldFilter={false}>
                                                <CommandList>
                                                    <CommandEmpty>{searchMutation.isPending ? 'Searching...' : 'No students found.'}</CommandEmpty>
                                                    <CommandGroup>
                                                        {studentList.map((s: any) => (
                                                            <CommandItem key={s.amcsT_Id} onSelect={() => {
                                                                setStudentId(s.amcsT_Id);
                                                                setSelectedStudentName(s.studentname);
                                                                setSearchQuery(s.studentname);
                                                                setStudentOpen(false);
                                                            }} className="p-3 border-b border-slate-50 hover:bg-slate-50">
                                                                <div className="flex flex-col">
                                                                    <span className="font-bold text-slate-700">{s.studentname}</span>
                                                                    <span className="text-xs text-slate-400">Adm: {s.amcsT_AdmNo} | {s.amcO_CourseName}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FilterItem>

                            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-100">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Conduct Specific Details</Label>
                                <div className="space-y-3">
                                    <Input
                                        placeholder="Exam Name"
                                        disabled={certificateType === '1'}
                                        value={examName}
                                        onChange={(e) => setExamName(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                    <Input
                                        placeholder="Exam Month/Year"
                                        disabled={certificateType === '1'}
                                        value={examMonthYear}
                                        onChange={(e) => setExamMonthYear(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                    <Input
                                        placeholder="Registration Number"
                                        disabled={certificateType === '1'}
                                        value={regNo}
                                        onChange={(e) => setRegNo(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex justify-center gap-4 pt-10 border-t border-slate-100">
                        <Button size="lg" onClick={handleReport} disabled={reportMutation.isPending} className="w-44 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl transition-all active:scale-95">
                            {reportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                            REPORT
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleReset} className="w-44 border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            RESET
                        </Button>
                        <Button size="lg" onClick={handlePrint} disabled={!showReport} className="w-44 bg-slate-800 hover:bg-slate-900 shadow-xl rounded-xl transition-all active:scale-95">
                            <Printer className="mr-2 h-4 w-4" />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showReport && reportData && (
                <div className="flex flex-col items-center bg-slate-200/30 p-12 rounded-3xl border border-slate-200 shadow-inner overflow-auto">
                    <div ref={printRef} className="bg-white shadow-2xl w-[210mm] min-h-[297mm] printable-content text-slate-900">
                        {reportData.studentList?.map((student: any, index: number) => (
                            <div key={index} className="certificate-wrapper font-serif">
                                {certificateType === '1' ? (
                                    <StudyCertificate student={student} logo={reportData.logo} />
                                ) : (
                                    <div className="flex flex-col space-y-8">
                                        <ConductCertificate student={student} logo={reportData.logo} copyLabel="FIRST COPY" />
                                        <div className="border-t-2 border-dashed border-slate-400 w-full my-8"></div>
                                        <ConductCertificate student={student} logo={reportData.logo} copyLabel="SECOND COPY" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @font-face {
                    font-family: 'Times New Roman';
                    src: local('Times New Roman');
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .printable-content {
                        box-shadow: none !important;
                        width: 210mm !important;
                        margin: 0 !important;
                    }
                    .certificate-wrapper {
                        width: 210mm !important;
                        min-height: 297mm !important;
                        page-break-after: always;
                    }
                }
            `}</style>
        </div>
    );
}

/* -------------------- Certificate Components -------------------- */

function StudyCertificate({ student, logo }: { student: any; logo: string }) {
    return (
        <div className="p-10 flex flex-col h-full bg-white relative border-[12px] border-double border-slate-100 min-h-[297mm]">
            {/* College Header Info */}
            <div className="flex justify-between text-[11px] font-bold text-slate-700 italic border-b pb-4 mb-6">
                <div>
                    E-mail: sms_college@yahoo.com<br />
                    Web: www.smscollegebrahmavar.com
                </div>
                <div className="text-right">
                    Ph: 8951615968 (Principal)<br />
                    Ph: 6366415968 (Office)
                </div>
            </div>

            {/* Institution Banner */}
            <div className="text-center mb-8">
                <img src={logo} alt="Logo" className="mx-auto max-h-24 mb-4" />
                <div className="flex justify-between items-start text-[10px] text-slate-500 font-medium px-4">
                    <div className="text-left w-24">Towards Moulding<br />Sublime Lives</div>
                    <div className="flex-1 px-4 leading-relaxed">
                        (Managed by O.S.C Educational Society/Obtained minority status vide No. 919/2014 dt. 18.09.2014)<br />
                        <span className="font-extrabold text-slate-800">(Affiliated to Mangalore University) (NAAC Accredited A Grade (CGPA: 3.20))</span>
                    </div>
                    <div className="w-24"></div>
                </div>
            </div>

            <hr className="border-t-2 border-slate-800 mb-10" />

            {/* Ref and Date */}
            <div className="flex justify-between text-lg font-bold mb-16 px-4">
                <div>Ref: SMSC/S.Cer/{student.yearname}</div>
                <div>Date: {format(student.todaydate, 'dd/MM/yyyy')}</div>
            </div>

            {/* Title */}
            <div className="text-center mb-16">
                <h3 className="text-3xl font-black underline underline-offset-8 tracking-widest text-[#1e293b]">STUDY CERTIFICATE</h3>
            </div>

            {/* Content Body */}
            <div className="px-10 text-xl leading-[2.2] text-justify text-slate-800">
                <p className="indent-16 first-letter:text-4xl first-letter:font-black">
                    This is to certify that {student.gender6}. <span className="font-extrabold border-b border-dotted border-slate-400 px-1 uppercase">{student.studentname}</span>,
                    {student.sonof} {student.gender6}. <span className="font-extrabold border-b border-dotted border-slate-400 px-1 uppercase">{student.fathername}</span>,
                    student of our college is studying in <span className="font-extrabold px-1 uppercase">{student.coursename} {student.semestername}</span>
                    during the Academic year <span className="font-extrabold px-1">{student.yearname}</span>.
                </p>
            </div>

            {/* Signature Area */}
            <div className="mt-auto pt-40 pr-10 text-right">
                <div className="inline-block text-center min-w-40 border-t-2 border-slate-800 pt-2">
                    <p className="text-2xl font-black text-slate-800">Principal</p>
                </div>
            </div>
        </div>
    );
}

function ConductCertificate({ student, logo, copyLabel }: { student: any; logo: string; copyLabel: string }) {
    return (
        <div className="p-8 flex flex-col h-full bg-white relative border border-slate-300 rounded-lg">
            <div className="absolute top-2 right-4 text-[9px] font-black text-slate-300 tracking-tighter uppercase">{copyLabel}</div>

            {/* Header Info */}
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-4 px-2">
                <div>Email: sms_college@yahoo.com<br />Web: www.smscollegebrahmavar.com</div>
                <div className="text-right">Ph: 8951615968<br />Ph: 6366415968</div>
            </div>

            {/* Logo and Managed By */}
            <div className="text-center mb-4">
                <img src={logo} alt="Logo" className="mx-auto max-h-16 mb-2" />
                <div className="flex justify-between items-start text-[9px] text-slate-400">
                    <div className="text-left w-20 pl-4">Towards Moulding<br />Sublime Lives</div>
                    <div className="flex-1 font-bold text-slate-600 italic">
                        (Managed by O.S.C Educational Society (R))<br />
                        (Affiliated to Mangalore University)
                    </div>
                    <div className="w-20 pl-4"></div>
                </div>
            </div>

            <hr className="border-slate-800 mb-4" />

            {/* Ref and Date */}
            <div className="flex justify-between text-sm font-bold mb-8 px-4">
                <div>Ref. No: SMSC/C.Cer/{student.yearname}</div>
                <div>Date: {format(student.todaydate, 'dd/MM/yyyy')}</div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h3 className="text-xl font-black underline underline-offset-4 tracking-wider uppercase text-slate-800">CONDUCT CERTIFICATE</h3>
            </div>

            {/* Content Body */}
            <div className="px-8 text-base leading-[1.8] text-justify text-slate-700">
                <p>
                    This is to certify that {student.gender6}. <span className="font-bold border-b border-slate-300 px-1 uppercase">{student.studentname}</span>,
                    {student.sonof} {student.gender6}. <span className="font-bold border-b border-slate-300 px-1 uppercase">{student.fathername}</span>,
                    was studying in this institution from <span className="font-bold px-1">{student.ACAYCBS_SemStartDate ? format(new Date(student.ACAYCBS_SemStartDate), 'dd/MM/yyyy') : 'N/A'}</span>
                    to <span className="font-bold px-1">{student.ACAYCBS_SemEndDate ? format(new Date(student.ACAYCBS_SemEndDate), 'dd/MM/yyyy') : 'N/A'}</span>
                    in I year <span className="font-bold px-1 uppercase">{student.coursename}</span> to III year <span className="font-bold px-1 uppercase">{student.coursename}</span>
                    and his/her conduct and character were <span className="font-black px-1 uppercase underline decoration-2 underline-offset-4">Good</span>.
                </p>
            </div>

            {/* Signature Area */}
            <div className="mt-16 flex justify-between items-end px-12 mb-4">
                <div className="text-center italic text-slate-400 text-sm">Institution Seal</div>
                <div className="text-center inline-block min-w-24 border-t border-slate-400 pt-1">
                    <p className="text-base font-black text-slate-800">Principal</p>
                </div>
            </div>
        </div>
    );
}

/* -------------------- UI Helpers -------------------- */

function SelectionCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col space-y-3 rounded-2xl border border-slate-100 p-5 bg-slate-50 shadow-sm transition-all hover:shadow-md">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</Label>
            <div className="flex items-center h-full">
                {children}
            </div>
        </div>
    );
}

function RadioItem({ id, value, label }: { id: string; value: string; label: string }) {
    return (
        <div className="flex items-center space-x-2.5 group">
            <RadioGroupItem value={value} id={id} className="border-slate-300 text-indigo-600 focus:ring-indigo-100 group-hover:scale-110 transition-transform" />
            <Label htmlFor={id} className="text-sm font-bold text-slate-600 cursor-pointer group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{label}</Label>
        </div>
    );
}

function FilterItem({ label, children, disabled = false, required = false }: { label: string; children: React.ReactNode; disabled?: boolean; required?: boolean }) {
    return (
        <div className={cn("space-y-2", disabled && "opacity-50 pointer-events-none")}>
            <Label className="text-xs font-bold text-slate-600 ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {children}
        </div>
    );
}
