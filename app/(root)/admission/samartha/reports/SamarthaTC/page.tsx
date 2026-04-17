'use client';

import { format } from 'date-fns';
import { RotateCcw, Printer, Loader2, Check, Search, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useSamarthaTCLoadData,
    useChangeYearSamarthaTC,
    useChangeClassSamarthaTC,
    useChangeSectionSamarthaTC,
    useSamarthaTCDetails
} from '@/hooks/admission/preadmission/reports/useSamarthaTC';

export default function SamarthaTCPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSamarthaTCLoadData();

    /* -------------------- UI State -------------------- */
    const [reportType, setReportType] = useState<'All' | 'indi'>('All');
    const [temporper, setTemporper] = useState<'Temp' | 'Per'>('Per');

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);

    const [identificationMarks, setIdentificationMarks] = useState('');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);

    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showCertificate, setShowCertificate] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const yearMutation = useChangeYearSamarthaTC();
    const classMutation = useChangeClassSamarthaTC();
    const sectionMutation = useChangeSectionSamarthaTC();
    const detailsMutation = useSamarthaTCDetails();

    /* -------------------- Data Initialization -------------------- */
    const initialYearList = (loadData as any)?.data?.accyear || (loadData as any)?.accyear || [];
    const initialClassList = (loadData as any)?.data?.accclass || (loadData as any)?.accclass || [];
    const initialSectionList = (loadData as any)?.data?.accsection || (loadData as any)?.accsection || [];

    useEffect(() => {
        if (initialClassList.length > 0) setClassList(initialClassList);
        if (initialSectionList.length > 0) setSectionList(initialSectionList);
    }, [loadData]);

    /* -------------------- Dependency Logic -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setStudentId(null);
        setSearchQuery('');

        try {
            const res = await yearMutation.mutateAsync({
                ASMAY_Id: yearId,
                tctemporper: temporper,
                report_type: reportType
            });
            const data = res?.data || res;
            if (reportType === 'All') {
                setStudentList(data?.studentlist || []);
            }
            setClassList(data?.accclass || []);
        } catch (error) {
            toast.error('Failed to update classes');
        }
    };

    const handleClassChange = async (cId: number) => {
        setClassId(cId);
        setSectionId(null);
        setStudentId(null);
        setSearchQuery('');

        try {
            const res = await classMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: cId
            });
            const data = res?.data || res;
            setSectionList(data?.accsection || []);
        } catch (error) {
            toast.error('Failed to update sections');
        }
    };

    const handleSectionChange = async (sId: number) => {
        setSectionId(sId);
        setStudentId(null);
        setSearchQuery('');

        try {
            const res = await sectionMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                tctemporper: temporper,
                report_type: reportType,
                ASMCL_Id: classId,
                ASMS_Id: sId
            });
            const data = res?.data || res;
            setStudentList(data?.studentlist || []);
        } catch (error) {
            toast.error('Failed to update students');
        }
    };

    /* -------------------- Actions -------------------- */
    const handleReport = async () => {
        if (!academicYearId || !studentId) {
            toast.error('Please select all required fields');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            AMST_Id: studentId,
            tctemporper: temporper
        };

        try {
            const res = await detailsMutation.mutateAsync(payload);
            const data = res?.data || res;

            if (data?.studentTCList?.length > 0) {
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
        setReportType('All');
        setTemporper('Per');
        setIdentificationMarks('');
        setShowCertificate(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Samartha_TC_Report'
    });

    /* -------------------- UI Helpers -------------------- */
    const getMonthName = (monthId: number) => {
        const months = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
        return months[monthId] || "";
    };

    const getClassNameInWords = (className: string) => {
        const map: Record<string, string> = {
            'I': 'FIRST', 'II': 'SECOND', 'III': 'THIRD', 'IV': 'FOURTH', 'V': 'FIFTH',
            'VI': 'SIXTH', 'VII': 'SEVENTH', 'VIII': 'EIGHTH', 'IX': 'NINTH', 'X': 'TENTH',
            'XI': 'ELEVENTTH', 'Nursery': 'Nursery', 'Transition': 'Transition'
        };
        return map[className] || className;
    };

    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Student TC Custom Report'
                description='Generate transfer certificates for Samartha students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='space-y-6 bg-white p-6'>
                    {/* Top Filters */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex flex-col space-y-2 rounded-lg border p-4 bg-gray-50/50'>
                            <Label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Report Type</Label>
                            <RadioGroup
                                value={reportType}
                                onValueChange={(v) => {
                                    setReportType(v as any);
                                    setAcademicYearId(null);
                                    setClassId(null);
                                    setSectionId(null);
                                    setStudentId(null);
                                }}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='All' id='type-all' />
                                    <Label htmlFor='type-all' className='text-sm font-medium'>All</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='indi' id='type-indi' />
                                    <Label htmlFor='type-indi' className='text-sm font-medium'>Individual</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className='flex flex-col space-y-2 rounded-lg border p-4 bg-gray-50/50'>
                            <Label className='text-xs font-bold text-gray-500 uppercase tracking-wider'>TC Type</Label>
                            <RadioGroup
                                value={temporper}
                                onValueChange={(v) => setTemporper(v as any)}
                                className='flex space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Temp' id='tc-temp' />
                                    <Label htmlFor='tc-temp' className='text-sm font-medium'>Temporary TC</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Per' id='tc-per' />
                                    <Label htmlFor='tc-per' className='text-sm font-medium'>Permanent TC</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Year:<span className='text-red-500'>*</span></Label>
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
                                <Label className='text-sm font-bold'>Category/Class:</Label>
                                <Select
                                    disabled={reportType === 'All' && !academicYearId}
                                    value={classId?.toString()}
                                    onValueChange={(v) => handleClassChange(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Class' />
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
                                <Label className='text-sm font-bold'>Section:</Label>
                                <Select
                                    disabled={reportType === 'All' && !academicYearId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                >
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Section' />
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

                        <div className='space-y-4'>
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
                                                    ? (studentList.find((s: any) => (s.amsT_Id || s.amst_Id) === studentId)?.studentname || studentList.find((s: any) => (s.amsT_Id || s.amst_Id) === studentId)?.studentName || "Selected Student")
                                                    : "Select Student"}
                                            </span>
                                            <div className="flex items-center shrink-0">
                                                {sectionMutation.isPending ? (
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
                                                    placeholder="Type to search..."
                                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <CommandList>
                                                <CommandEmpty>
                                                    {sectionMutation.isPending ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                            <span>Loading...</span>
                                                        </div>
                                                    ) : "No student found."}
                                                </CommandEmpty>
                                                <CommandGroup className="max-h-64 overflow-y-auto">
                                                    {studentList
                                                        .filter((s: any) => {
                                                            const name = (s.studentname || s.studentName || '').toLowerCase();
                                                            const adm = (s.amsT_AdmNo || s.amst_AdmNo || '').toLowerCase();
                                                            const query = searchTerm.toLowerCase();
                                                            return name.includes(query) || adm.includes(query);
                                                        })
                                                        .map((s: any) => {
                                                            const sId = s.amsT_Id || s.amst_Id;
                                                            const sName = s.studentname || s.studentName || '';
                                                            return (
                                                                <CommandItem
                                                                    key={sId}
                                                                    value={sId.toString()}
                                                                    onSelect={() => {
                                                                        setStudentId(sId);
                                                                        setStudentOpen(false);
                                                                        setSearchTerm("");
                                                                    }}
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <Check className={cn('mr-2 h-4 w-4 text-indigo-600', studentId === sId ? 'opacity-100' : 'opacity-0')} />
                                                                        <div className="flex flex-col">
                                                                            <span className="font-medium">{sName}</span>

                                                                        </div>
                                                                    </div>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-start gap-4'>
                                <Label className='text-sm font-bold pt-2'>Identification Marks:</Label>
                                <Textarea
                                    value={identificationMarks}
                                    onChange={(e) => setIdentificationMarks(e.target.value)}
                                    placeholder='Enter identification marks'
                                    className='min-h-[80px]'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-6 pt-8 border-t'>
                        <Button
                            size='lg'
                            onClick={handleReport}
                            disabled={detailsMutation.isPending}
                            className='w-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold'>
                            {detailsMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'REPORT'}
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
                            disabled={!showCertificate}
                            className='w-40 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl font-bold'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview */}
            {showCertificate && reportData && reportData.studentTCList?.map((student: any, index: number) => {
                const datafrom = new Date(reportData.academicList1?.[0]?.asmaY_From_Date);
                const datato = new Date(reportData.academicList1?.[0]?.asmaY_To_Date);
                const frommonthName = getMonthName(datafrom.getMonth());
                const tomonthName = getMonthName(datato.getMonth());
                const fromYear = datafrom.getFullYear();
                const toYear = datato.getFullYear();

                return (
                    <div key={index} className='mt-8 flex flex-col items-center bg-gray-50 p-4 md:p-8 rounded-2xl border-2 border-dashed border-indigo-200 overflow-auto'>
                        <div ref={printRef} className='bg-white shadow-2xl w-[210mm] min-h-[297mm] p-0 printable-content'>
                            <div className="certificate-page relative p-[10mm] flex flex-col" style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always', margin: '0 auto' }}>
                                <div className="border-[1px] border-black p-[10px] h-full flex flex-col">

                                    {/* Header Image */}
                                    <div className="w-full mb-4">
                                        <img
                                            src="https://vapsclg.blob.core.windows.net/files/76/NoticeUpload/d120170c-fbbf-48c2-b675-ef8d053a0d03.jpg"
                                            alt="Institution Logo"
                                            className="w-[74%] h-auto object-contain mx-auto"
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-black underline decoration-2 underline-offset-4">TRANSFER CERTIFICATE</h2>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 gap-y-2 px-8 text-base font-bold mb-6">
                                        <div className="flex">CBSE Affiliation No. : <span className="ml-2 font-normal">130445</span></div>
                                        <div className="flex justify-end">ADM NO. : <span className="ml-2 font-normal">{student.amsT_AdmNo}</span></div>
                                        <div className="flex">School Code : <span className="ml-2 font-normal">57709</span></div>
                                        <div className="flex justify-end">PEN No. : <span className="ml-2 font-normal">{student.AMST_PENNo}</span></div>
                                        <div className="flex">Tc No : <span className="ml-2 font-normal">{student.astC_TCNO}</span></div>
                                        <div className="flex justify-end">APAAR No : <span className="ml-2 font-normal border-b border-dotted min-w-[100px]" contentEditable></span></div>
                                    </div>

                                    {/* Main Table */}
                                    <div className="px-8 flex-1">
                                        <table className="w-full border-collapse text-base leading-relaxed">
                                            <tbody>
                                                <tr>
                                                    <td className="w-[45%] py-1">1. Name of the pupil</td>
                                                    <td className="w-[2%]">:</td>
                                                    <td className="border-b border-dotted font-bold px-2 uppercase">{student.amsT_FirstName} {student.amsT_MiddleName} {student.amsT_LastName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">2. Father's/Guardian's Name</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2 uppercase">{student.amsT_FatherName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">3. Mother's Name</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2 uppercase">{student.amsT_MotherName}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">4. Nationality</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.nationality}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 align-top">5. Identification Mark</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted px-2 whitespace-pre-line">{identificationMarks}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">6. Whether candidate belongs to SC/ST/OBC/GEN</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.caste}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">7. Date of First admission in school with Class</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.amsT_Date ? format(new Date(student.amsT_Date), 'dd/MM/yyyy') : ''}, {student.JoinedClass}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">8. Date of birth (in figures)</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.amsT_DOB ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 pl-4">(in words)</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.amsT_DOB_Words?.replace(/\s+/g, '-')}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">9. Class in which the pupil last studied</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.classname}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">10. School/Board Annual Exam last taken with result</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.details}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">11. Whether failed, if so once/twice in same class</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">NA</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">12. Subjects Studied</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.subjectstudied} {student.langustudies}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">13. Qualified for promotion to higher class</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.qualificlass}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">14. Month upto which school dues paid</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.result}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">15. Total no. of working days</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2" contentEditable>{student.noof_schooldays}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">16. Total no. of working days present</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2" contentEditable>{student.noof_daysattended}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">17. Extra Curricular activities</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2" contentEditable>{student.ASTC_ExtraActivities}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">18. General Conduct</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.astC_Conduct}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">19. Date of application for certificate</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.ASTC_TCApplicationDate ? format(new Date(student.ASTC_TCApplicationDate), 'dd/MM/yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">20. Date of issue of certificate</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.astC_TCIssueDate ? format(new Date(student.astC_TCIssueDate), 'dd/MM/yyyy') : ''}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">21. Reasons for leaving the school</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.astC_LeavingReason}</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">22. Any other remarks</td>
                                                    <td>:</td>
                                                    <td className="border-b border-dotted font-bold px-2">{student.astC_Remarks}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto px-8 pb-10 flex justify-between items-end">
                                        <div className="text-center">
                                            <p className="border-t border-black pt-1">Signature of Class Teacher</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="border-t border-black pt-1 px-8">Checked By</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold mb-1">Principal</p>
                                            <p className="border-t border-black pt-1 px-8">Signature & Seal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <style jsx global>{`
                @media print {
                    .printable-content {
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                    }
                    .certificate-page {
                        border: none !important;
                        width: 210mm !important;
                        height: 297mm !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
