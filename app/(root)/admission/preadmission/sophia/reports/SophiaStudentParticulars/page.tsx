'use client';

import { format } from 'date-fns';
import { CalendarIcon, Loader2, Printer, RotateCcw, FileText, Search, UserCheck, GraduationCap, School, FileSignature, Info } from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    const [categoryId, setCategoryId] = useState<number | null>(null);
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
        setShowReport(false);
    };

    const handleClassChange = (val: string) => {
        setClassId(Number(val));
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
    };

    const handleSectionChange = async (val: string) => {
        const sId = Number(val);
        setSectionId(sId);
        setSelectedStudentIds([]);
        setShowReport(false);
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
            toast.error('Please select Year, Class and Section');
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            ASMCL_Id: classId,
            ASMC_Id: sectionId,
            AMC_Id: categoryId || 0,
            giftedtalented: selectedStudentIds.map(id => ({ admmT_Id: id }))
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const students = Array.isArray(res?.data) ? res.data : (res?.data?.studentlist || res?.studentlist || []);

            if (Array.isArray(students) && students.length > 0) {
                // DOB Fix as per legacy requirement
                const processedStudents = students.map((stu: any) => ({
                    ...stu,
                    dobString: stu.dob ? new Date(stu.dob) : null
                }));
                setReportStudents(processedStudents);
                setAcademicYearName(students[0].acadamicyear || '');
                setShowReport(true);
                toast.success('Report generated successfully');
            } else {
                toast.error('Record not found');
                setShowReport(false);
            }
        } catch (e) {
            toast.error('Failed to generate report');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setCategoryId(null);
        setClassId(null);
        setSectionId(null);
        setSelectedDate(new Date());
        setRemarks('');
        setStudentList([]);
        setSelectedStudentIds([]);
        setReportStudents([]);
        setShowReport(false);
        setSearchQuery('');
        toast.info('Form cleared');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Student_Particulars_${academicYearName}`
    });

    /* -------------------- UI Components -------------------- */
    return (
        <div className='min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8 font-sans'>
            {/* Main Form Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}>
                <CollapsibleSection
                    title='Student Particulars Certificate'
                    description='Comprehensive report for school records and CISCE IX STD registration'
                    defaultOpen={true}
                    className='bg-white shadow-xl border-none rounded-3xl overflow-hidden'>

                    <CardContent className='p-6 md:p-8'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                            {/* Left Column: Selections */}
                            <div className='space-y-6'>
                                <div className='flex items-center gap-3 mb-4'>
                                    <div className='p-2 bg-indigo-50 rounded-lg'>
                                        <School className='w-5 h-5 text-indigo-600' />
                                    </div>
                                    <h3 className='text-lg font-bold text-gray-800 tracking-tight'>Institutional Details</h3>
                                </div>

                                <div className='space-y-5'>
                                    <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-semibold text-gray-600 flex items-center gap-2'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select value={academicYearId?.toString()} onValueChange={handleYearChange}>
                                            <SelectTrigger className='h-11 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all'>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {(loadData as any)?.data?.allAcademicYear?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {(loadData as any)?.data?.categoryflag && (
                                        <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4'>
                                            <Label className='text-sm font-semibold text-gray-600'>
                                                Category
                                            </Label>
                                            <Select value={categoryId?.toString()} onValueChange={(val) => setCategoryId(Number(val))}>
                                                <SelectTrigger className='h-11 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all'>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent className='rounded-xl'>
                                                    {(loadData as any)?.data?.category_list?.map((item: any) => (
                                                        <SelectItem key={item.amC_Id} value={item.amC_Id.toString()}>
                                                            {item.amC_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-semibold text-gray-600'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select value={classId?.toString()} onValueChange={handleClassChange}>
                                            <SelectTrigger className='h-11 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all'>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {(loadData as any)?.data?.allClass?.map((item: any) => (
                                                    <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4'>
                                        <Label className='text-sm font-semibold text-gray-600'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select value={sectionId?.toString()} onValueChange={handleSectionChange}>
                                            <SelectTrigger className='h-11 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all'>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent className='rounded-xl'>
                                                {(loadData as any)?.data?.allSection?.map((item: any) => (
                                                    <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-4 pt-2'>
                                        <Label className='text-sm font-semibold text-gray-600 pt-3'>
                                            Remarks
                                        </Label>
                                        <Textarea
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                            placeholder='Any additional remarks for office use...'
                                            className='min-h-[100px] rounded-2xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none'
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Student Selection & Date */}
                            <div className='space-y-6'>
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 bg-emerald-50 rounded-lg'>
                                            <UserCheck className='w-5 h-5 text-emerald-600' />
                                        </div>
                                        <h3 className='text-lg font-bold text-gray-800 tracking-tight'>Student Selection</h3>
                                    </div>
                                    {selectedStudentIds.length > 0 && (
                                        <Badge variant='secondary' className='bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-full px-4'>
                                            {selectedStudentIds.length} Selected
                                        </Badge>
                                    )}
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                                        <div className='flex items-center space-x-3 bg-gray-50/50 px-4 py-2 rounded-full border border-gray-100'>
                                            <Checkbox
                                                id='selectAll'
                                                checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                                onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                                className='rounded-md border-gray-300'
                                            />
                                            <Label htmlFor='selectAll' className='text-sm font-bold cursor-pointer text-gray-700'>
                                                Select All Students
                                            </Label>
                                        </div>
                                        <div className='relative w-full sm:w-64'>
                                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                                            <Input
                                                placeholder='Search by name...'
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className='h-10 pl-10 rounded-full border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500'
                                            />
                                        </div>
                                    </div>

                                    <ScrollArea className='h-[180px] w-full rounded-2xl border border-gray-100 p-4 bg-gray-50/20 backdrop-blur-sm'>
                                        {studentListMutation.isPending ? (
                                            <div className='flex h-full items-center justify-center'>
                                                <Loader2 className='w-8 h-8 text-indigo-400 animate-spin' />
                                            </div>
                                        ) : filteredStudents.length > 0 ? (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                {filteredStudents.map((s: any) => (
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        key={s.amsT_Id}
                                                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all border ${selectedStudentIds.includes(s.amsT_Id) ? 'bg-white border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'bg-transparent border-transparent hover:bg-white hover:shadow-sm'}`}>
                                                        <Checkbox
                                                            id={`std-${s.amsT_Id}`}
                                                            checked={selectedStudentIds.includes(s.amsT_Id)}
                                                            onCheckedChange={(checked) => handleStudentSelect(s.amsT_Id, checked as boolean)}
                                                            className='rounded-md'
                                                        />
                                                        <Label htmlFor={`std-${s.amsT_Id}`} className='text-sm truncate cursor-pointer font-medium text-gray-700'>
                                                            {s.stuname}
                                                        </Label>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='flex h-full flex-col items-center justify-center text-gray-400 text-sm space-y-2 py-8'>
                                                <Info className='w-6 h-6 opacity-20' />
                                                <p className='italic'>{studentList.length > 0 ? 'No matching students found' : 'Select year/class/section to load students'}</p>
                                            </div>
                                        )}
                                    </ScrollArea>

                                    <div className='grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-4 pt-4 border-t border-gray-100'>
                                        <Label className='text-sm font-semibold text-gray-600 flex items-center gap-2'>
                                            Submission Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant='outline' className='h-11 w-full justify-start text-left font-normal rounded-xl border-gray-200 shadow-sm hover:bg-gray-50 transition-all'>
                                                    <CalendarIcon className='mr-3 h-5 w-5 text-indigo-500' />
                                                    {selectedDate ? format(selectedDate, 'PPP') : <span className='text-gray-400'>Enter date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent align='end' className='p-0 rounded-2xl shadow-2xl border-none'>
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
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-wrap justify-center gap-5 pt-10 mt-10 border-t border-gray-100'>
                            <Button
                                size='lg'
                                onClick={handleGenerate}
                                disabled={reportMutation.isPending}
                                className='min-w-[160px] h-12 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white shadow-lg hover:shadow-indigo-200/50 rounded-2xl uppercase font-bold tracking-wider transition-all transform active:scale-95'>
                                {reportMutation.isPending ? <Loader2 className='mr-3 h-5 w-5 animate-spin' /> : <FileSignature className='mr-3 h-5 w-5' />}
                                Generate
                            </Button>

                            <Button
                                size='lg'
                                variant='outline'
                                onClick={handleReset}
                                className='min-w-[160px] h-12 border-2 border-orange-100 bg-orange-50/30 text-orange-600 hover:bg-orange-50 hover:border-orange-200 shadow-sm rounded-2xl uppercase font-bold tracking-wider transition-all transform active:scale-95'>
                                <RotateCcw className='mr-3 h-5 w-5' />
                                Clear
                            </Button>

                            <Button
                                size='lg'
                                onClick={handlePrint}
                                disabled={!showReport}
                                className='min-w-[160px] h-12 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg hover:shadow-emerald-200/50 disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400 rounded-2xl uppercase font-bold tracking-wider transition-all transform active:scale-95'>
                                <Printer className='mr-3 h-5 w-5' />
                                Print
                            </Button>
                        </div>
                    </CardContent>
                </CollapsibleSection>
            </motion.div>

            {/* Preview Section - Premium Document View */}
            <AnimatePresence>
                {showReport && reportStudents.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className='mt-8 flex flex-col items-center p-4 md:p-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-[3rem] border border-slate-300 shadow-inner overflow-auto'>

                        <div className='flex items-center gap-2 mb-8 bg-white/80 backdrop-blur px-6 py-2 rounded-full border border-white shadow-sm'>
                            <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse' />
                            <span className='text-sm font-bold text-slate-700 uppercase tracking-widest'>Document Preview</span>
                        </div>

                        <div ref={printRef} className='print-container bg-white w-full max-w-[176mm] text-black' style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                            {reportStudents.map((stu: any, index: number) => (
                                <div key={index} className="certificate-page p-2 min-h-[240mm] flex flex-col text-[12px] leading-[1.1] page-break-after-always" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                                    <div className='mt-1'>
                                        <p className='mb-0.5'>Dear Parent,</p>
                                        <p className='mb-0.5'>
                                            This is to inform you that the following details of your ward are furnished as per our school records. Kindly verify the
                                            details. The same details will be forwarded to the <b>CISCE COUNCIL for IX STD board registration.</b>
                                        </p>
                                        <p className='mb-0.5'>
                                            As per the regulation of the <b>CISCE Board</b>, the students have to opt for <b>Elective subjects</b> in <b>Group II and Group III category</b> as a course of study in <b>Class IX</b>.
                                        </p>

                                        <p className='mb-0.5'>
                                            I request you to assist your child realistically in this choice and let us know your option through the form provided below
                                            before <b>{selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : ''}</b>. Do remember that the decision taken is final as the council does not allow changes after registration in <b>Class IX.</b>
                                        </p>

                                        <p className='mb-0.5'>For any clarification please contact the school office. Thank you for your cooperation and may God bless you all.</p>
                                        <p className='mb-1'>With warm Regards,</p>

                                        <div className='mb-2'>
                                            <p className='font-bold'>(Sr.Alpana SND)</p>
                                            <p className='font-bold' style={{ marginTop: '-6px' }}>PRINCIPAL</p>
                                        </div>

                                        <div className="text-center mb-1">
                                            <h3 className='text-[15px] font-bold underline uppercase tracking-wider'>STUDENT PARTICULARS [{academicYearName}]</h3>
                                        </div>

                                        <div className="border border-black">
                                            <table className="w-full border-collapse text-[12px]">
                                                <tbody>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black w-10 text-center">1.</td>
                                                        <td className="p-1 border-r border-black w-60 font-bold uppercase">SL.NO</td>
                                                        <td className="p-1">{index + 1}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">2.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">ADMN NO.</td>
                                                        <td className="p-1">{stu.AMST_AdmNo}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">3.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">NAME OF THE STUDENT</td>
                                                        <td className="p-1 font-bold uppercase">{stu.stuFN} {stu.stuMN} {stu.stuLN}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">4.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">FATHER'S NAME</td>
                                                        <td className="p-1 uppercase">{stu.fatherName}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">5.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">MOTHER'S NAME</td>
                                                        <td className="p-1 uppercase">{stu.mothername}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">6.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">DATE OF BIRTH</td>
                                                        <td className="p-1 uppercase">{stu.dob ? format(new Date(stu.dob), 'dd-MMM-yyyy') : ''}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">7.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">CLASS AND SECTION</td>
                                                        <td className="p-1 uppercase">{stu.class} &nbsp;{stu.sec}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">8.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">II LANGUAGE</td>
                                                        <td className="p-1"></td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">9.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">GROUP II SUBJECT</td>
                                                        <td className="p-1">
                                                            <div className='flex flex-wrap gap-x-2 items-center'>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 1. MATHEMATICS</div>
                                                                <div className='font-bold text-[12px] mx-1'>OR</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> ENVIRONMENTAL SCIENCE</div>
                                                            </div>
                                                            <div className='flex flex-wrap gap-x-2 items-center mt-1'>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 2. SCIENCE</div>
                                                                <div className='font-bold text-[12px] mx-1'>OR</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> COMMERCIAL STUDIES</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">10.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">GROUP III SUBJECT<br />(ONLY ONE)</td>
                                                        <td className="p-1">
                                                            <div className='grid grid-cols-2 gap-y-1'>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 1. COMPUTER APPLICATIONS</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 2. ECONOMIC APPLICATION</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 3. PHYSICAL EDUCATION</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 4. ART</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 5. MASS MEDIA COMMUNICATION</div>
                                                                <div className='flex items-center gap-2'><div className='w-4 h-4 border border-black'></div> 6. ROBOTICS AND AI</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">11.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">NATIONALITY/RELIGION/CASTE</td>
                                                        <td className="p-1 uppercase">{stu.nationality}/{stu.religion}/{stu.caste}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">12.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">CONTACT NUMBER</td>
                                                        <td className="p-1 uppercase">{stu.stumob} / {stu.Fathermob || ''}</td>
                                                    </tr>
                                                    <tr className="border-b border-black">
                                                        <td className="p-1 border-r border-black text-center">13.</td>
                                                        <td className="p-1 border-r border-black font-bold uppercase">AADHAR NUMBER</td>
                                                        <td className="p-1">{stu.Aadhar}</td>
                                                    </tr>
                                                    <tr className="h-16 align-bottom text-center">
                                                        <td className="p-0.5 border-r border-black"></td>
                                                        <td className="p-0.5 border-r border-black font-bold pb-1 text-[11px]">Verified and found Correct</td>
                                                        <td className="p-0.5 font-bold pb-1 text-[11px]">Verified and found Correct</td>
                                                    </tr>
                                                    <tr className="text-center uppercase text-[10px] font-bold border-t border-black">
                                                        <td className="p-0.5 border-r border-black"></td>
                                                        <td className="p-0.5 border-r border-black py-1">Signature of the Father/Guardian</td>
                                                        <td className="p-0.5 py-1">Signature of the Mother/Guardian</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className='mt-2'>
                                            <h4 className='text-center font-bold underline uppercase mb-1 text-[13px]'>FOR OFFICE USE ONLY</h4>
                                            <div className='flex gap-2 items-baseline'>
                                                <p className='font-bold text-[12px] uppercase whitespace-nowrap'>REMARKS (If any):</p>
                                                <div className='flex-1 border-b border-black pb-0.5 uppercase font-bold text-[12px]'>
                                                    {remarks}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: B5;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .page-break-after-always {
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 !important;
                        border: none !important;
                    }
                    @media print {
                        .print-container {
                            display: block !important;
                            visibility: visible !important;
                            width: 176mm !important;
                            margin: 0 auto !important;
                            padding: 0 !important;
                            background: white !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                        .certificate-page {
                            page-break-after: always !important;
                            break-after: page !important;
                            display: flex !important;
                            visibility: visible !important;
                            padding: 15mm !important;
                            margin: 0 !important;
                        }
                        .print-container, .certificate-page, .certificate-page *, table, td, th, p, h3, h4, span, div {
                            font-family: "Times New Roman", Times, serif !important;
                            color: black !important;
                            visibility: visible !important;
                        }
                        table { border-collapse: collapse !important; width: 100% !important; }
                        td, th { border: 1px solid black !important; }
                        .no-print { display: none !important; }
                    }
                }
            `}</style>
        </div>
    );
}
