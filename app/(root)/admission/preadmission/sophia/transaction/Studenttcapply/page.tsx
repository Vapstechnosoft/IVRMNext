'use client';

import { format } from 'date-fns';
import { CalendarIcon, Download, Eye, Loader2, RotateCcw, Search, FileText, Printer, X } from 'lucide-react';
import { useRef, useState, useMemo, useEffect } from 'react';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import {
    useSophiaStudentTCApplyLoadData,
    useSophiaStudentTCApplyOnChangeClass,
    useSophiaStudentTCApplySave,
    useSophiaStudentTCApplyStudentList,
    useSophiaStudentTCApplyTCPdf,
    useSophiaStudentTCApplyViewStatus
} from '@/hooks/admission/preadmission/transactions/useSophiaStudentTCApply';

export default function StudentTCApplyPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters & State -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useSophiaStudentTCApplyLoadData();
    const classChangeMutation = useSophiaStudentTCApplyOnChangeClass();
    const studentListMutation = useSophiaStudentTCApplyStudentList();
    const saveMutation = useSophiaStudentTCApplySave();
    const tcPdfMutation = useSophiaStudentTCApplyTCPdf();
    const viewStatusMutation = useSophiaStudentTCApplyViewStatus();

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentSearchList, setStudentSearchList] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [allRemarks, setAllRemarks] = useState('');
    const [mainSearchQuery, setMainSearchQuery] = useState('');
    const [appliedSearchQuery, setAppliedSearchQuery] = useState('');

    /* Modal States */
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfData, setPdfData] = useState<any[]>([]);

    const remarksOptions = [
        "Promoted to Nursery", "Promoted to Preparatory", "Promoted to Junior",
        "Promoted to Class I", "Promoted to Class II", "Promoted to Class III",
        "Promoted to Class IV", "Promoted to Class V", "Promoted to Class VI",
        "Promoted to Class VII", "Promoted to Class VIII", "Promoted to Class IX",
        "Promoted to Class X", "Promoted to Class XI", "Promoted to Class XII",
        "Not Promoted", "Other", "-"
    ];

    /* -------------------- Helpers -------------------- */
    const filteredSearchList = useMemo(() => {
        if (!mainSearchQuery) return studentSearchList;
        const q = mainSearchQuery.toLowerCase();
        return studentSearchList.filter(s =>
            (s.StudentName || '').toLowerCase().includes(q) ||
            (s.AMST_AdmNo || '').toLowerCase().includes(q)
        );
    }, [studentSearchList, mainSearchQuery]);

    const filteredAppliedList = useMemo(() => {
        const list = (loadData as any)?.studenttcapprovedlist || [];
        if (!appliedSearchQuery) return list;
        const q = appliedSearchQuery.toLowerCase();
        return list.filter((s: any) =>
            (s.StudentName || '').toLowerCase().includes(q) ||
            (s.AMST_AdmNo || '').toLowerCase().includes(q)
        );
    }, [loadData, appliedSearchQuery]);

    /* -------------------- Handlers -------------------- */
    const onYearChange = (val: string) => {
        setAcademicYearId(Number(val));
        setClassId(null);
        setSectionId(null);
        setStudentSearchList([]);
    };

    const onClassChange = async (val: string) => {
        const cId = Number(val);
        setClassId(cId);
        setSectionId(null);
        setStudentSearchList([]);
        if (!academicYearId) return;

        try {
            const res = await classChangeMutation.mutateAsync({ ASMAY_Id: academicYearId, ASMCL_Id: cId });
            const list = res?.sectionList || res?.data?.sectionList || [];
            setSectionList(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load sections');
        }
    };

    const handleSearch = async () => {
        if (!academicYearId || !classId || !sectionId) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            const res = await studentListMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId
            });
            const list = res?.studentlistsearch || res?.data?.studentlistsearch || [];
            if (Array.isArray(list) && list.length > 0) {
                setStudentSearchList(list.map(s => ({
                    ...s,
                    selected: false,
                    ASTC_TCDate: null,
                    ASTC_TCApplicationDate: new Date(),
                    ASTC_Remarks: ''
                })));
            } else {
                toast.error('No Records Found ..!');
                setStudentSearchList([]);
            }
        } catch (e) {
            toast.error('Failed to search students');
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        setStudentSearchList(prev => prev.map(s => ({ ...s, selected: checked })));
    };

    const onStudentSelect = (idx: number, checked: boolean) => {
        const newList = [...studentSearchList];
        newList[idx].selected = checked;
        setStudentSearchList(newList);
    };

    const onFieldChange = (idx: number, field: string, val: any) => {
        const newList = [...studentSearchList];
        newList[idx][field] = val;
        setStudentSearchList(newList);
    };

    const applyUniversalRemarks = (val: string) => {
        setAllRemarks(val);
        if (!val) return;
        setStudentSearchList(prev => prev.map(s => s.selected ? { ...s, ASTC_Remarks: val } : s));
    };

    const handleSave = async () => {
        const selected = studentSearchList.filter(s => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        // Validation for dates and remarks
        const invalid = selected.some(s => !s.ASTC_TCDate || !s.ASTC_TCApplicationDate || !s.ASTC_Remarks);
        if (invalid) {
            toast.error('Please fill Date of Leaving, Date and Remarks for all selected students');
            return;
        }

        const tcnumbering = (loadData as any)?.admTransNumSetting?.[0]; // Matching legacy logic for tcnumbering

        const payload = {
            StudentTCdata: selected,
            transnumconfigsettings: tcnumbering
        };

        try {
            const res = await saveMutation.mutateAsync(payload);
            if (res?.returnval || res?.data?.returnval) {
                toast.success('Record Saved Successfully...!');
                setStudentSearchList([]);
                // Reload data logic if needed, or just let useQuery handle it
            } else {
                toast.error('Failed to save record');
            }
        } catch (e) {
            toast.error('Failed to request TC');
        }
    };

    const handleViewStatus = async (item: any) => {
        try {
            const res = await viewStatusMutation.mutateAsync({ AMST_Id: item.AMST_Id });
            const list = res?.studentapprovedpendingdetails || res?.data?.studentapprovedpendingdetails || [];
            setStatusData(list);
            setStatusModalOpen(true);
        } catch (e) {
            toast.error('Failed to load status');
        }
    };

    const handleViewPdf = async (item: any) => {
        try {
            const res = await tcPdfMutation.mutateAsync({ AMST_Id: item.AMST_Id });
            const list = res?.studenttcpdf || res?.data?.studenttcpdf || [];
            setPdfData(list);
            setPdfModalOpen(true);
        } catch (e) {
            toast.error('Failed to load PDF data');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Student_Transfer_Certificate'
    });

    const handleReset = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentSearchList([]);
    };

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Student TC APPLY'
                description='Apply for student transfer certificates'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                            <Select value={academicYearId?.toString()} onValueChange={onYearChange}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(loadData as any)?.academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Class:<span className='text-red-500'>*</span></Label>
                            <Select value={classId?.toString()} onValueChange={onClassChange}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(loadData as any)?.classlist?.map((item: any) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Section:<span className='text-red-500'>*</span></Label>
                            <Select value={sectionId?.toString()} onValueChange={(v) => setSectionId(Number(v))}>
                                <SelectTrigger className='h-9 shadow-sm'>
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

                    <div className='flex flex-wrap justify-center gap-4 pt-8 mt-6 border-t'>
                        <Button size='sm' onClick={handleSearch} disabled={studentListMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase transition-all'>
                            {studentListMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            SEARCH
                        </Button>
                        <Button size='sm' onClick={handleReset} className='min-w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-lg rounded-full uppercase transition-all'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Student Search Grid */}
            {studentSearchList.length > 0 && (
                <div className='space-y-4 animate-in fade-in slide-in-from-top-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm'>
                        <h3 className='text-lg font-bold text-indigo-900'>STUDENT TC DATA</h3>
                        <div className='flex items-center gap-4'>
                            <div className='w-48'>
                                <Label className='text-[10px] font-bold text-red-500 uppercase'>Remarks for All Selected</Label>
                                <Select value={allRemarks} onValueChange={applyUniversalRemarks} disabled={!studentSearchList.some(s => s.selected)}>
                                    <SelectTrigger className='h-8 text-xs'>
                                        <SelectValue placeholder='-- Select --' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {remarksOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='relative w-48 mt-4'>
                                <Search className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Search student...'
                                    value={mainSearchQuery}
                                    onChange={(e) => setMainSearchQuery(e.target.value)}
                                    className='h-8 pl-8 text-xs border-gray-200'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='rounded-xl border bg-white shadow-sm overflow-hidden'>
                        <Table>
                            <TableHeader className='bg-gray-50'>
                                <TableRow>
                                    <TableHead className='w-[60px] text-center'>SL.NO</TableHead>
                                    <TableHead className='w-[50px]'>
                                        <Checkbox
                                            checked={studentSearchList.length > 0 && studentSearchList.every(s => s.selected)}
                                            onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
                                        />
                                    </TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Adm No.</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead className='w-[160px]'>Date of Leaving</TableHead>
                                    <TableHead className='w-[160px]'>Date</TableHead>
                                    <TableHead className='w-[180px]'>Remarks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSearchList.map((s, idx) => (
                                    <TableRow key={idx} className={s.selected ? 'bg-indigo-50/30' : ''}>
                                        <TableCell className='text-center'>{idx + 1}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                checked={s.selected}
                                                onCheckedChange={(checked) => onStudentSelect(idx, checked as boolean)}
                                            />
                                        </TableCell>
                                        <TableCell className='font-medium'>{s.StudentName}</TableCell>
                                        <TableCell>{s.AMST_AdmNo}</TableCell>
                                        <TableCell>{s.ASMCL_ClassName}</TableCell>
                                        <TableCell>{s.ASMC_SectionName}</TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' size='sm' disabled={!s.selected} className='h-8 w-full justify-start text-[11px] font-normal'>
                                                        {s.ASTC_TCDate ? format(new Date(s.ASTC_TCDate), 'dd/MM/yyyy') : 'Select Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align='start' className='p-0'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={s.ASTC_TCDate ? new Date(s.ASTC_TCDate) : undefined}
                                                        onDayClick={(date) => onFieldChange(idx, 'ASTC_TCDate', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' size='sm' disabled={!s.selected} className='h-8 w-full justify-start text-[11px] font-normal'>
                                                        {s.ASTC_TCApplicationDate ? format(new Date(s.ASTC_TCApplicationDate), 'dd/MM/yyyy') : 'Select Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent align='start' className='p-0'>
                                                    <DatePickerWithYear
                                                        mode='single'
                                                        selected={s.ASTC_TCApplicationDate ? new Date(s.ASTC_TCApplicationDate) : undefined}
                                                        onDayClick={(date) => onFieldChange(idx, 'ASTC_TCApplicationDate', date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                        <TableCell>
                                            <Select value={s.ASTC_Remarks} onValueChange={(v) => onFieldChange(idx, 'ASTC_Remarks', v)} disabled={!s.selected}>
                                                <SelectTrigger className='h-8 text-[11px]'>
                                                    <SelectValue placeholder='-- Select --' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {remarksOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className='flex justify-center gap-4 py-4'>
                        <Button size='sm' onClick={handleSave} disabled={saveMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase'>
                            {saveMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Request'}
                        </Button>
                        <Button size='sm' variant='outline' onClick={() => setStudentSearchList([])} className='min-w-32 border-red-500 text-red-500 hover:bg-red-50 rounded-full uppercase'>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Applied Details Grid */}
            <div className='space-y-4'>
                <div className='flex items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm'>
                    <h3 className='text-lg font-bold text-indigo-900'>STUDENT TC APPLY DETAILS</h3>
                    <div className='relative w-48'>
                        <Search className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search details...'
                            value={appliedSearchQuery}
                            onChange={(e) => setAppliedSearchQuery(e.target.value)}
                            className='h-8 pl-8 text-xs border-gray-200'
                        />
                    </div>
                </div>

                <div className='rounded-xl border bg-white shadow-sm overflow-hidden'>
                    <Table>
                        <TableHeader className='bg-gray-50'>
                            <TableRow>
                                <TableHead className='w-[60px] text-center'>SL.NO</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Adm No.</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Section</TableHead>
                                <TableHead className='text-center'>View</TableHead>
                                <TableHead className='text-center'>View TC PDF</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAppliedList.length > 0 ? (
                                filteredAppliedList.map((temp: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className='text-center'>{idx + 1}</TableCell>
                                        <TableCell className='font-medium'>{temp.StudentName}</TableCell>
                                        <TableCell>{temp.AMST_AdmNo}</TableCell>
                                        <TableCell>{temp.ASMCL_ClassName}</TableCell>
                                        <TableCell>{temp.ASMC_SectionName}</TableCell>
                                        <TableCell className='text-center'>
                                            <Button variant='ghost' size='sm' onClick={() => handleViewStatus(temp)} className='text-indigo-600 h-8 w-8 p-0'>
                                                <Eye className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {temp.ApprovalStatus === 'Approved' ? (
                                                <Button variant='ghost' size='sm' onClick={() => handleViewPdf(temp)} className='text-green-600 h-8 w-8 p-0'>
                                                    <Eye className='h-4 w-4' />
                                                </Button>
                                            ) : (
                                                <Badge variant='outline' className='text-[10px] text-red-500 border-red-200'>Approval Pending</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {temp.ApprovalStatus === 'Approved' ? (
                                                <Badge className='bg-green-100 text-green-700 hover:bg-green-100 border-none px-3'>Approved</Badge>
                                            ) : (
                                                <Badge variant='outline' className='text-red-500 border-red-200'>Pending</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center py-8 text-muted-foreground italic'>No records found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Approval Status Modal */}
            <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
                <DialogContent className='max-w-md p-0 overflow-hidden'>
                    <DialogHeader className='p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white'>
                        <DialogTitle className='text-lg font-bold uppercase tracking-wider'>Staff Approval Status</DialogTitle>
                    </DialogHeader>
                    <div className='p-6'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Approval Name</TableHead>
                                    <TableHead className='text-center'>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {statusData.map((s, idx) => (
                                    <TableRow key={idx} className={s.ASCAP_Status === 'Approved' ? 'bg-green-50/50' : 'bg-red-50/50'}>
                                        <TableCell className='font-medium'>{s.empname}</TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant='outline' className={s.ASCAP_Status === 'Approved' ? 'text-green-600 border-green-200' : 'text-red-500 border-red-200'}>
                                                {s.ASCAP_Status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='p-4 border-t bg-gray-50 flex justify-end'>
                        <Button size='sm' variant='outline' onClick={() => setStatusModalOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* TC PDF Modal */}
            <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
                <DialogContent className='max-w-4xl max-h-[95vh] flex flex-col p-0 overflow-hidden'>
                    <DialogHeader className='p-4 border-b flex flex-row items-center justify-between space-y-0'>
                        <DialogTitle className='text-base font-bold'>Transfer Certificate Preview</DialogTitle>
                        <div className='flex items-center gap-2 pr-6'>
                            <Button size='sm' onClick={handlePrint} className='bg-blue-600 hover:bg-blue-700 h-8'>
                                <Printer className='mr-2 h-4 w-4' /> Print / Download
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => setPdfModalOpen(false)} className='h-8'>
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    </DialogHeader>

                    <ScrollArea className='flex-1 p-8 bg-gray-100'>
                        <div ref={printRef} className='bg-white shadow-2xl mx-auto w-full max-w-[210mm] text-black font-serif' style={{ minHeight: '297mm' }}>
                            {pdfData.map((report: any, idx: number) => (
                                <div key={idx} className='p-12 space-y-8 page-break-after-always'>
                                    <div className='mt-[165px]'>
                                        <h1 className='text-center text-3xl font-bold underline underline-offset-8 mb-12 uppercase'>TRANSFER CERTIFICATE</h1>

                                        <div className='flex justify-between font-bold mb-4 border-b-2 border-black pb-2 text-lg'>
                                            <span>Admission Number: {report.amsT_AdmNo}</span>
                                            <span>
                                                Sl. No: {report.astC_TCNO && (report.astC_TCNO.split('/').length > 2
                                                    ? report.astC_TCNO.split('/').slice(1).join('/')
                                                    : report.astC_TCNO)}
                                            </span>
                                        </div>

                                        <div className='space-y-4 text-xl'>
                                            {[
                                                { label: '1. Name of Pupil', value: report.studentname },
                                                { label: "2. Father's Name", value: report.amsT_FatherName },
                                                { label: "3. Mother's Name", value: report.amsT_MotherName },
                                                { label: '4. Religion/Caste', value: `${report.religion} / ${report.caste}` },
                                                { label: '5. Nationality', value: report.nationality },
                                                { label: '6. Date of Birth', value: report.amsT_DOB ? format(new Date(report.amsT_DOB), 'dd-MMM-yyyy') : '' },
                                                { label: '7. School Last Attended', value: 'N/A' },
                                                { label: '8. Date Of Admission', value: report.amsT_Date ? format(new Date(report.amsT_Date), 'dd-MMM-yyyy') : '' },
                                                { label: '9. Conduct', value: 'Good' },
                                                { label: '10. Date Of Leaving', value: report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : '' },
                                                { label: '11. Studying In', value: `${report.Last_Class_Studied} ${report.asmC_SectionName}` }
                                            ].map((item, i) => (
                                                <div key={i} className='flex items-start'>
                                                    <span className='w-[240px] font-medium'>{item.label}</span>
                                                    <span className='flex-1'>: &nbsp;&nbsp; {item.value}</span>
                                                </div>
                                            ))}
                                            {report.astC_Remarks && report.astC_Remarks.trim() !== '' && (
                                                <div className='flex items-start'>
                                                    <span className='w-[240px] font-medium'>12. Remarks</span>
                                                    <span className='flex-1'>: &nbsp;&nbsp; {report.astC_Remarks}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className='mt-8 pt-8 border-t-2 border-black space-y-8'>
                                            <div className='flex justify-between text-lg'>
                                                <div className='flex flex-col gap-2'>
                                                    <span>PEN No. : {report.AMST_PENNo}</span>
                                                    <span>SATS No. : {report.govtno}</span>
                                                </div>
                                            </div>
                                            <p className='mt-8 italic text-lg font-medium'>
                                                Certified that the above mentioned information is in accordance with the school register.
                                            </p>
                                            <div className='mt-16 flex justify-between items-end text-xl font-bold'>
                                                <span>Date: {report.ASTC_TCApplicationDate ? format(new Date(report.ASTC_TCApplicationDate), 'dd-MMM-yyyy') : format(new Date(), 'dd-MMM-yyyy')}</span>
                                                <span>PRINCIPAL</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                @media print {
                    .page-break-after-always {
                        page-break-after: always !important;
                    }
                    .font-serif {
                        font-family: "Times New Roman", Times, serif !important;
                    }
                }
            `}</style>
        </div>
    );
}
