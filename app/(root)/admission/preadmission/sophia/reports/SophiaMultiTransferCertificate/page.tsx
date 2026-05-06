'use client';

import { format } from 'date-fns';
import { Loader2, Printer, RotateCcw, FileText, Download, Check, Search } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import {
    useSophiaMultiTCLoadData,
    useSophiaMultiTCOnChangeClass,
    useSophiaMultiTCOnChangeSection,
    useSophiaMultiTCOnChangeYear,
    useSophiaMultiTCGetReport
} from '@/hooks/admission/preadmission/useSophiaMultiTransferCertificate';

export default function SophiaMultiTransferCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters & State -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSophiaMultiTCLoadData();
    const yearChangeMutation = useSophiaMultiTCOnChangeYear();
    const classChangeMutation = useSophiaMultiTCOnChangeClass();
    const sectionChangeMutation = useSophiaMultiTCOnChangeSection();
    const reportMutation = useSophiaMultiTCGetReport();

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [reportData, setReportData] = useState<any[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [lastClassStudied, setLastClassStudied] = useState<string>('');
    const [issType, setIssType] = useState<string>('');

    /* -------------------- Helpers -------------------- */
    const convertToRomanClass = (classValue: string) => {
        if (!classValue || classValue.trim() === '') return classValue || '';
        const v = classValue.trim().toLowerCase();
        const classMap: Record<string, string> = {
            "1st": "I", "2nd": "II", "3rd": "III", "4th": "IV", "5th": "V", "6th": "VI",
            "7th": "VII", "8th": "VIII", "9th": "IX", "10th": "X", "11th": "XI", "12th": "XII"
        };
        return classMap[v] || classValue;
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return studentList;
        return studentList.filter(s =>
            (s.studentname || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [studentList, searchQuery]);

    /* -------------------- Handlers -------------------- */
    const onYearChange = async (val: string) => {
        const id = Number(val);
        setAcademicYearId(id);
        setClassId(null);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        try {
            const res = await yearChangeMutation.mutateAsync({ ASMAY_Id: id });
            const list = res?.getclassdetails || res?.data?.getclassdetails || [];
            setClassList(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load classes');
        }
    };

    const onClassChange = async (val: string) => {
        const id = Number(val);
        setClassId(id);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        if (!academicYearId) return;
        try {
            const res = await classChangeMutation.mutateAsync({ ASMAY_Id: academicYearId, ASMCL_Id: id });
            const list = res?.getSectiondetails || res?.data?.getSectiondetails || [];
            setSectionList(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load sections');
        }
    };

    const onSectionChange = async (val: string) => {
        const id = Number(val);
        setSectionId(id);
        setSelectedStudentIds([]);
        if (!academicYearId || !classId) return;
        try {
            const res = await sectionChangeMutation.mutateAsync({ ASMAY_Id: academicYearId, ASMCL_Id: classId, ASMS_Id: id });
            const list = res?.getstudentdetails || res?.data?.getstudentdetails || [];
            setStudentList(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load students');
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(filteredStudents.map(s => s.amsT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentSelect = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(prev => [...prev, id]);
        } else {
            setSelectedStudentIds(prev => prev.filter(sid => sid !== id));
        }
    };

    const handleReport = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please select all required fields');
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId,
            ASMS_Id: sectionId,
            Temp_AmstId: selectedStudentIds.map(id => ({ AMST_Id: id }))
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const data = res?.getstudentreports || res?.data?.getstudentreports || [];
            if (Array.isArray(data) && data.length > 0) {
                const normalized = data.map(item => ({
                    ...item,
                    RomanClass: convertToRomanClass(item.Last_Class_Studied || '')
                }));
                setReportData(normalized);
                const firstLastClass = normalized[0].Last_Class_Studied || '';
                setLastClassStudied(firstLastClass);
                if (firstLastClass === '10th') setIssType('ICSE');
                else if (firstLastClass === '12th') setIssType('ISC');
                else setIssType('');
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
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setClassList([]);
        setSectionList([]);
        setStudentList([]);
        setSelectedStudentIds([]);
        setReportData([]);
        setShowReport(false);
        setSearchQuery('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Sophia_Transfer_Certificates'
    });

    /* -------------------- UI Render -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Transfer Certificate Report'
                description='Generate Multi-Student Transfer Certificates for Sophia High School'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Left Side: Dropdowns */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={onYearChange}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.accyear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Class:<span className='text-red-500'>*</span></Label>
                                <Select value={classId?.toString()} onValueChange={onClassChange} disabled={!academicYearId}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                                <Select value={sectionId?.toString()} onValueChange={onSectionChange} disabled={!classId}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Side: Student Multi-select */}
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='selectAll'
                                        checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                    />
                                    <Label htmlFor='selectAll' className='text-sm font-bold cursor-pointer'>Student:<span className='text-red-500'>*</span></Label>
                                </div>
                                <div className='relative w-48'>
                                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search student...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-9 pl-8 text-xs'
                                    />
                                </div>
                            </div>
                            <ScrollArea className='h-[160px] w-full rounded-md border p-4 bg-gray-50/30'>
                                {filteredStudents.length > 0 ? (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                        {filteredStudents.map((s: any) => (
                                            <div key={s.amsT_Id} className='flex items-center space-x-2 p-1 hover:bg-white rounded transition-colors'>
                                                <Checkbox
                                                    id={`std-${s.amsT_Id}`}
                                                    checked={selectedStudentIds.includes(s.amsT_Id)}
                                                    onCheckedChange={(checked) => handleStudentSelect(s.amsT_Id, checked as boolean)}
                                                />
                                                <Label htmlFor={`std-${s.amsT_Id}`} className='text-xs truncate cursor-pointer font-medium text-gray-700'>
                                                    {s.studentname}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='flex h-full items-center justify-center text-muted-foreground text-xs italic'>
                                        {studentList.length > 0 ? 'No results found' : 'Select class/section to see students'}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='flex flex-wrap justify-center gap-4 pt-8 mt-6 border-t'>
                        <Button size='sm' onClick={handleReport} disabled={reportMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase transition-all'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button size='sm' onClick={handleReset} className='min-w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-lg rounded-full uppercase transition-all'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button size='sm' onClick={handlePrint} disabled={!showReport} className='min-w-32 bg-[#2196f3] hover:bg-[#1976d2] text-white shadow-lg disabled:bg-gray-200 disabled:text-gray-400 rounded-full uppercase transition-all'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview Section */}
            {showReport && reportData.length > 0 && (
                <div className='mt-8 flex flex-col items-center bg-gray-100 p-4 md:p-8 rounded-3xl border-2 border-dashed border-indigo-200 overflow-auto'>
                    <div ref={printRef} className='bg-white shadow-2xl w-full max-w-[210mm] text-black font-serif'>
                        {reportData.map((report: any, index: number) => {
                            const isHighSchool = lastClassStudied === '10th' || lastClassStudied === '12th';
                            return (
                                <div key={index} className="page-break-after-always">
                                    {/* Transfer Certificate Page */}
                                    <div className="p-12 min-h-[297mm] flex flex-col">
                                        <div className="mt-[135px]">
                                            <h1 className="text-center text-3xl font-bold underline mb-12">TRANSFER CERTIFICATE</h1>

                                            <div className="flex justify-between font-bold mb-4 border-b-2 border-black pb-2 text-lg">
                                                <span>Admission Number: {report.amsT_AdmNo}</span>
                                                <span>
                                                    Sl. No: {report.astC_TCNO && (report.astC_TCNO.split('/').length > 2
                                                        ? report.astC_TCNO.split('/').slice(1).join('/')
                                                        : report.astC_TCNO)}
                                                </span>
                                            </div>

                                            <div className="space-y-4 text-xl">
                                                <div className="flex items-start">
                                                    <span className="w-12">1.</span>
                                                    <span className="w-56">Name of Pupil</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.studentname}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">2.</span>
                                                    <span className="w-56">Father's Name</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.amsT_FatherName}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">3.</span>
                                                    <span className="w-56">Mother's Name</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.amsT_MotherName}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">4.</span>
                                                    <span className="w-56">Religion/Caste</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.religion} / {report.caste}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">5.</span>
                                                    <span className="w-56">Nationality</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.nationality}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">6.</span>
                                                    <span className="w-56">Date of Birth</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : ''}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">7.</span>
                                                    <span className="w-56">School Last Attended</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; N/A</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">8.</span>
                                                    <span className="w-56">Date Of Admission</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : ''}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">9.</span>
                                                    <span className="w-56">Conduct</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; Good</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">10.</span>
                                                    <span className="w-56">Date Of Leaving</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : ''}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="w-12">11.</span>
                                                    <span className="w-56">Studying In</span>
                                                    <span className="flex-1">: &nbsp;&nbsp; {report.RomanClass} {report.asmC_SectionName}</span>
                                                </div>
                                                {report.astC_Remarks && report.astC_Remarks.trim() !== '' && (
                                                    <div className="flex items-start">
                                                        <span className="w-12">12.</span>
                                                        <span className="w-56">Remarks</span>
                                                        <span className="flex-1">: &nbsp;&nbsp; {report.astC_Remarks}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-8 pt-4 border-t-2 border-black space-y-4">
                                                <div className="flex justify-between text-lg">
                                                    <span>PEN No. : {report.AMST_PENNo}</span>
                                                    <span>SATS No. : {report.govtno}</span>
                                                </div>
                                                <p className="mt-8 italic text-lg font-medium">
                                                    Certified that the above mentioned information is in accordance with the school register.
                                                </p>
                                                <div className="mt-16 flex justify-between items-end text-xl font-bold">
                                                    <span>Date: {report.ASTC_TCApplicationDate ? format(new Date(report.ASTC_TCApplicationDate), 'dd-MMM-yyyy') : ''}</span>
                                                    <span>PRINCIPAL</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional High School Certificates */}
                                    {isHighSchool && (
                                        <>
                                            {/* Conduct Certificate */}
                                            <div className="page-break-before-always p-12 min-h-[297mm] flex flex-col items-center justify-center text-center">
                                                <div className="mt-[135px]">
                                                    <h2 className="text-4xl font-bold underline decoration-black underline-offset-8 mb-24">CONDUCT CERTIFICATE</h2>
                                                    <div className="text-3xl italic leading-[3] space-y-6">
                                                        <p>This is to certify that <strong>{report.studentname}</strong></p>
                                                        <p>of Standard <strong>{report.RomanClass}</strong> was a student of</p>
                                                        <p><strong className="text-3xl uppercase">SOPHIA HIGH SCHOOL, Bangalore</strong> and was</p>
                                                        <p>of <strong>Good</strong> Character.</p>
                                                    </div>
                                                    <div className="mt-32 w-full flex justify-between items-end px-4 font-bold text-xl">
                                                        <span className="font-normal">Date: {report.ASTC_TCApplicationDate ? format(new Date(report.ASTC_TCApplicationDate), 'dd-MMM-yyyy') : ''}</span>
                                                        <span>PRINCIPAL</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Course Completion Certificate */}
                                            <div className="page-break-before-always p-12 min-h-[297mm] flex flex-col text-left">
                                                <div className="mt-[135px]">
                                                    <h2 className="text-center text-4xl font-bold underline decoration-black underline-offset-8 mb-24">COURSE COMPLETION CERTIFICATE</h2>
                                                    <p className="text-3xl leading-relaxed mb-32">
                                                        This is to certify that <strong>{report.studentname}</strong> has successfully completed the course of studies in Std. <b>{report.RomanClass}</b> leading to the <b>{issType}</b> Examination.
                                                    </p>
                                                    <div className="mt-auto flex justify-between items-end font-bold text-xl">
                                                        <span className="font-normal">Date: {report.ASTC_TCApplicationDate ? format(new Date(report.ASTC_TCApplicationDate), 'dd-MMM-yyyy') : ''}</span>
                                                        <span>PRINCIPAL</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Final Certificate */}
                                            <div className="page-break-before-always p-12 min-h-[297mm] flex flex-col text-justify">
                                                <div className="mt-[135px]">
                                                    <h2 className="text-center text-4xl font-bold underline decoration-black underline-offset-8 mb-24">CERTIFICATE</h2>
                                                    <div className="space-y-12 text-2xl leading-relaxed">
                                                        <p>
                                                            1. This is to certify that <strong>{report.studentname}</strong> is not debarred, rusticated or otherwise disqualified from continuing her studies by the school for any malpractice at, in any school examination or for any kind of misbehavior.
                                                        </p>
                                                        <p>
                                                            2. The student does not owe any amount to the school.
                                                        </p>
                                                    </div>
                                                    <div className="mt-32 flex justify-between items-end font-bold text-xl">
                                                        <span className="font-normal">Date: {report.ASTC_TCApplicationDate ? format(new Date(report.ASTC_TCApplicationDate), 'dd-MMM-yyyy') : ''}</span>
                                                        <span>PRINCIPAL</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .page-break-after-always {
                        page-break-after: always !important;
                    }
                    .page-break-before-always {
                        page-break-before: always !important;
                    }
                    .font-serif {
                        font-family: "Times New Roman", Times, serif !important;
                    }
                }
            `}</style>
        </div>
    );
}
