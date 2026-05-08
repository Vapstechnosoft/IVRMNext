'use client';

import { format } from 'date-fns';
import { CalendarIcon, Loader2, Printer, RotateCcw, FileText, Search } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

import {
    useSophiaStudentParticularsLoadData,
    useSophiaStudentParticularsReport,
    useSophiaStudentParticularsStudentList
} from '@/hooks/admission/preadmission/useSophiaStudentParticulars';

export default function SophiaStudentParticularsPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters & State -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSophiaStudentParticularsLoadData();
    const studentListMutation = useSophiaStudentParticularsStudentList();
    const reportMutation = useSophiaStudentParticularsReport();

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);
    const [remarks, setRemarks] = useState('');

    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [reportStudents, setReportStudents] = useState<any[]>([]);
    const [academicYearName, setAcademicYearName] = useState('');
    const [showReport, setShowReport] = useState(false);

    /* -------------------- Helpers -------------------- */
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return studentList;
        return studentList.filter(s =>
            (s.stuname || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [studentList, searchQuery]);

    /* -------------------- Handlers -------------------- */
    const handleYearChange = (val: string) => {
        setAcademicYearId(Number(val));
        setStudentList([]);
        setSelectedStudentIds([]);
    };

    const handleClassChange = (val: string) => {
        setClassId(Number(val));
        setStudentList([]);
        setSelectedStudentIds([]);
    };

    const handleSectionChange = async (val: string) => {
        const sId = Number(val);
        setSectionId(sId);
        setSelectedStudentIds([]);
        if (!academicYearId || !classId) return;

        try {
            const res = await studentListMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId,
                ASMC_Id: sId
            });
            const list = res?.fillstudlist || res?.data?.fillstudlist || [];
            if (Array.isArray(list) && list.length > 0) {
                setStudentList(list);
            } else {
                toast.error('No students found for this selection');
                setStudentList([]);
            }
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

    const handleGenerate = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Select Year, Class and Section');
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error('Select at least one student');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId,
            ASMC_Id: sectionId,
            giftedtalented: selectedStudentIds.map(id => ({ admmT_Id: id })),
            AMC_Id: 0
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const students = res?.studentlist || res?.data?.studentlist || [];
            if (Array.isArray(students) && students.length > 0) {
                setReportStudents(students);
                setAcademicYearName(students[0].acadamicyear || '');
                setShowReport(true);
                toast.success('Report generated successfully');
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
        setSelectedDate(new Date());
        setRemarks('');
        setStudentList([]);
        setSelectedStudentIds([]);
        setReportStudents([]);
        setShowReport(false);
        setSearchQuery('');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Student_Particulars_${academicYearName}`
    });

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Student Particulars Certificate'
                description='Generate student particular details for Sophia High School'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                        {/* Left Side */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                                <Select value={academicYearId?.toString()} onValueChange={handleYearChange}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='Select Academic Year' />
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
                                <Select value={classId?.toString()} onValueChange={handleClassChange}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.allClass?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                                <Select value={sectionId?.toString()} onValueChange={handleSectionChange}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.allSection?.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-start gap-4'>
                                <Label className='text-sm font-bold pt-2'>Remarks:</Label>
                                <Textarea
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder='Enter remarks if any...'
                                    className='min-h-[80px]'
                                />
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className='space-y-4'>
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
                                                        {s.stuname}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='flex h-full items-center justify-center text-muted-foreground text-xs italic'>
                                            {studentList.length > 0 ? 'No results found' : 'Select year/class/section to see students'}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='text-sm font-bold'>Date:<span className='text-red-500'>*</span></Label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start text-left font-normal shadow-sm'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                            {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Enter date'}
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
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 pt-8 mt-6 border-t'>
                        <Button size='sm' onClick={handleGenerate} disabled={reportMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase transition-all'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            GENERATE
                        </Button>
                        <Button size='sm' onClick={handleReset} className='min-w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-lg rounded-full uppercase transition-all'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CLEAR
                        </Button>
                        <Button size='sm' onClick={handlePrint} disabled={!showReport} className='min-w-32 bg-[#2196f3] hover:bg-[#1976d2] text-white shadow-lg disabled:bg-gray-200 disabled:text-gray-400 rounded-full uppercase transition-all'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Preview Section */}
            {showReport && reportStudents.length > 0 && (
                <div className='mt-8 flex flex-col items-center bg-gray-100 p-4 md:p-8 rounded-3xl border-2 border-dashed border-indigo-200 overflow-auto'>
                    <div ref={printRef} className='bg-white shadow-2xl w-full max-w-[210mm] text-black font-serif'>
                        {reportStudents.map((stu: any, index: number) => (
                            <div key={index} className="p-12 min-h-[297mm] flex flex-col text-sm leading-relaxed page-break-after-always">
                                <div className='mt-8'>
                                    <p className='mb-4'>Dear Parent,</p>
                                    <p className='mb-4'>
                                        This is to inform you that the following details of your ward are furnished as per our school records. Kindly verify the
                                        details. The same details will be forwarded to the <b>CISCE COUNCIL for IX STD board registration.</b>
                                    </p>
                                    <p className='mb-4'>
                                        As per the regulation of the <b>CISCE Board</b>, the students have to opt for <b>Elective subjects</b> in <b>Group II and Group III category</b> as a course of study in <b>Class IX</b>.
                                    </p>
                                    <p className='mb-4'>
                                        I request you to assist your child realistically in this choice and let us know your option through the form provided below
                                        before <b>{selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}</b>. Do remember that the decision taken is final as the council does not allow changes after registration in <b>Class IX.</b>
                                    </p>
                                    <p className='mb-4'>For any clarification please contact the school office.</p>
                                    <p className='mb-4'>Thank you for your cooperation and may God bless you all.</p>
                                    <p className='mb-8'>With warm Regards,</p>
                                    
                                    <div className='mb-12'>
                                        <p>(Sr.Alpana SND)</p>
                                        <p className='font-bold'>PRINCIPAL</p>
                                    </div>

                                    <div className="text-center mb-6">
                                        <h3 className='text-lg font-bold underline uppercase tracking-wider'>STUDENT PARTICULARS [{academicYearName}]</h3>
                                    </div>

                                    <table className="w-full border-collapse border border-black text-xs">
                                        <tbody>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black w-8 text-center">1.</td>
                                                <td className="p-2 border-r border-black w-48 font-bold">SL.NO</td>
                                                <td className="p-2">{stu.AMAY_RollNo}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">2.</td>
                                                <td className="p-2 border-r border-black font-bold">ADMN NO.</td>
                                                <td className="p-2">{stu.AMST_AdmNo}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">3.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">NAME OF THE STUDENT</td>
                                                <td className="p-2 font-bold uppercase">{stu.stuFN} {stu.stuMN} {stu.stuLN}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">4.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">FATHER'S NAME</td>
                                                <td className="p-2 uppercase">{stu.fatherName}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">5.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">MOTHER'S NAME</td>
                                                <td className="p-2 uppercase">{stu.mothername}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">6.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">DATE OF BIRTH</td>
                                                <td className="p-2 uppercase">{stu.dob ? format(new Date(stu.dob), 'dd-MMM-yyyy') : ''}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">7.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">CLASS AND SECTION</td>
                                                <td className="p-2 uppercase">{stu.class} &nbsp;{stu.sec}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">8.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">II LANGUAGE</td>
                                                <td className="p-2"></td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">9.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">GROUP II SUBJECT</td>
                                                <td className="p-2">
                                                    <div className='flex flex-wrap gap-4 items-center'>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 1. MATHEMATICS</div>
                                                        <div className='font-bold'>OR</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> ENVIRONMENTAL SCIENCE</div>
                                                    </div>
                                                    <div className='flex flex-wrap gap-4 items-center mt-2'>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 2. SCIENCE</div>
                                                        <div className='font-bold'>OR</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> COMMERCIAL STUDIES</div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">10.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">GROUP III SUBJECT<br/>(ONLY ONE)</td>
                                                <td className="p-2">
                                                    <div className='grid grid-cols-2 gap-y-2'>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 1. COMPUTER APPLICATIONS</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 2. ECONOMIC APPLICATION</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 3. PHYSICAL EDUCATION</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 4. ART</div>
                                                        <div className='flex items-center gap-1'><div className='w-3 h-3 border border-black'></div> 5. MASS MEDIA COMMUNICATION</div>
                                                        <div className='flex items-center gap-1 col-span-2'><div className='w-3 h-3 border border-black'></div> 6. ROBOTICS AND ARTIFICIAL INTELLIGENCE</div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">11.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">NATIONALITY/RELIGION/CASTE</td>
                                                <td className="p-2 uppercase">{stu.nationality } / {stu.religion } / {stu.caste}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">12.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">CONTACT NUMBER</td>
                                                <td className="p-2 uppercase">{stu.stumob} / {stu.Fathermob}</td>
                                            </tr>
                                            <tr className="border border-black">
                                                <td className="p-2 border-r border-black text-center">13.</td>
                                                <td className="p-2 border-r border-black font-bold uppercase">AADHAR NUMBER</td>
                                                <td className="p-2">{stu.Aadhar}</td>
                                            </tr>
                                            <tr className="border border-black h-20 text-center align-bottom">
                                                <td className="p-2 border-r border-black"></td>
                                                <td className="p-2 border-r border-black font-bold">Verified and found Correct</td>
                                                <td className="p-2 font-bold">Verified and found Correct</td>
                                            </tr>
                                            <tr className="border border-black text-center uppercase text-[10px]">
                                                <td className="p-1 border-r border-black"></td>
                                                <td className="p-1 border-r border-black">Signature of the Father/Guardian</td>
                                                <td className="p-1">Signature of the Mother/Guardian</td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <div className='mt-8'>
                                        <h4 className='text-center font-bold underline uppercase mb-4'>FOR OFFICE USE ONLY</h4>
                                        <p className='font-bold'>REMARKS(If any): <span className='font-normal'>{remarks}</span></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .page-break-after-always {
                        page-break-after: always !important;
                    }
                    .font-serif {
                        font-family: "Times New Roman", Times, serif !important;
                    }
                    table { border-collapse: collapse !important; }
                    td, th { border: 1px solid black !important; }
                }
            `}</style>
        </div>
    );
}
