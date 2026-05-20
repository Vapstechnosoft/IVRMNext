'use client';

import { format } from 'date-fns';
import { CalendarIcon, Download, Eye, Loader2, RotateCcw, FileText, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
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
    useOverallDailyAttendanceReportDetails,
    useOverallDailyAttendanceReportInitialData,
    useOverallDailyAttendanceReportStudentAllDetails,
    useOverallDailyAttendanceReportStudentDetails
} from '@/hooks/admission/preadmission/useOverallDailyAttendanceReport';

import { utils, writeFile } from 'xlsx';

export default function OverallDailyAttendanceReportPage() {
    /* -------------------- Masters & State -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useOverallDailyAttendanceReportInitialData();
    const reportMutation = useOverallDailyAttendanceReportDetails();
    const studentDetailsMutation = useOverallDailyAttendanceReportStudentDetails();
    const allStudentDetailsMutation = useOverallDailyAttendanceReportStudentAllDetails();

    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [dateOpen, setDateOpen] = useState(false);

    const [reportData, setReportData] = useState<any[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [mainSearchQuery, setMainSearchQuery] = useState('');

    /* Modal State */
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalDetails, setModalDetails] = useState<any>(null);
    const [modalGridData, setModalGridData] = useState<any[]>([]);
    const [modalSearchQuery, setModalSearchQuery] = useState('');

    /* -------------------- Computed Totals -------------------- */
    const totals = useMemo(() => {
        if (!reportData.length) return { strength: 0, present: 0, absent: 0, halfday: 0 };
        return reportData.reduce((acc, curr) => ({
            strength: acc.strength + (curr.TOTAL || 0),
            present: acc.present + (curr.PRESENT || 0),
            absent: acc.absent + (curr.ABSENT || 0),
            halfday: acc.halfday + (curr.HALFDAY || 0),
        }), { strength: 0, present: 0, absent: 0, halfday: 0 });
    }, [reportData]);

    const filteredMainData = useMemo(() => {
        if (!mainSearchQuery) return reportData;
        const q = mainSearchQuery.toLowerCase();
        return reportData.filter(item =>
            (item.ASMCL_ClassName || '').toLowerCase().includes(q) ||
            (item.ASMC_SectionName || '').toLowerCase().includes(q)
        );
    }, [reportData, mainSearchQuery]);

    const filteredModalData = useMemo(() => {
        if (!modalSearchQuery) return modalGridData;
        const q = modalSearchQuery.toLowerCase();
        return modalGridData.filter(item =>
            (item.name || '').toLowerCase().includes(q) ||
            (item.HRME_EmployeeFirstName || '').toLowerCase().includes(q)
        );
    }, [modalGridData, modalSearchQuery]);

    /* -------------------- Handlers -------------------- */
    const handleShowReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (!selectedDate) {
            toast.error('Select Date');
            return;
        }

        const payload = {
            ASMAY_Id: academicYearId,
            fromdate: format(selectedDate, 'yyyy-MM-dd'),
            AMC_Id: categoryId === 'All' ? 0 : Number(categoryId) || 0
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const list = Array.isArray(res?.data) ? res.data : (res?.studentAttendanceList || res?.data?.studentAttendanceList || []);
            if (Array.isArray(list) && list.length > 0) {
                setReportData(list);
                setShowReport(true);
            } else {
                toast.error('No Records Found!');
                setShowReport(false);
            }
        } catch (e) {
            toast.error('Failed to load report');
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setCategoryId('');
        setSelectedDate(new Date());
        setReportData([]);
        setShowReport(false);
        setMainSearchQuery('');
    };

    const handleRowDetails = async (user: any) => {
        if (!academicYearId || !selectedDate) return;

        const payload = {
            ASMCL_Id: Number(user.ASMCL_Id),
            ASMS_Id: Number(user.ASMS_Id || user.ASMS_ID),
            ASMAY_Id: academicYearId,
            fromdate: format(selectedDate, 'yyyy-MM-dd')
        };

        try {
            const res = await studentDetailsMutation.mutateAsync(payload);
            const list = Array.isArray(res?.data) ? res.data : (res?.student_teacherList || res?.data?.student_teacherList || []);

            // Note: Keeping the filter for absentees if that's the intended report behavior, 
            // but ensuring the list is extracted correctly from the array format.
            const filteredList = list.filter((item: any) => item.ABSENT === 1 || item.ABSENT === '1');

            // If the user wants to see the data they provided (which has ABSENT: 0), 
            // we might want to show all if no absentees are found, but standard reports usually filter.
            const displayList = filteredList.length > 0 ? filteredList : list;

            setModalTitle(user.ABSENT === 0 ? "Absentees and Teacher's Names Are Not Available" : "Absentees and Teacher's Names Details:");
            setModalDetails({
                year: (loadData as any)?.data?.academicList?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year,
                classSection: `${user.ASMCL_ClassName}-${user.ASMC_SectionName}`,
                present: user.PRESENT,
                absent: user.ABSENT,
                strength: user.TOTAL,
                halfday: user.HALFDAY,
                date: selectedDate
            });
            setModalGridData(displayList);
            setModalOpen(true);
        } catch (e) {
            toast.error('Failed to load details');
        }
    };

    const handleViewAllDetails = async () => {
        if (!academicYearId || !selectedDate) return;

        const payload = {
            ASMAY_Id: academicYearId,
            fromdate: format(selectedDate, 'yyyy-MM-dd')
        };

        try {
            const res = await allStudentDetailsMutation.mutateAsync(payload);
            const list = Array.isArray(res?.data) ? res.data : (res?.student_teacherList || res?.data?.student_teacherList || []);
            const filteredList = list.filter((item: any) => item.ABSENT === 1 || item.ABSENT === '1');
            const displayList = filteredList.length > 0 ? filteredList : list;

            setModalTitle(totals.absent === 0 ? "Absentees and Teacher's Names Are Not Available" : "Absentees and Teacher's Names Details:");
            setModalDetails({
                year: (loadData as any)?.data?.academicList?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year,
                classSection: null, // Overall
                present: totals.present,
                absent: totals.absent,
                strength: totals.strength,
                halfday: totals.halfday,
                date: selectedDate
            });
            setModalGridData(displayList);
            setModalOpen(true);
        } catch (e) {
            toast.error('Failed to load details');
        }
    };

    const handleExport = (data: any[], fileName: string) => {
        if (!data.length) {
            toast.error('No data to export');
            return;
        }
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Sheet1");
        writeFile(wb, `${fileName}_${format(new Date(), 'ddMMyyyy')}.xlsx`);
    };

    /* -------------------- UI -------------------- */
    return (
        <div className='min-h-screen p-4 space-y-6'>
            <CollapsibleSection
                title='Overall Daily Attendance Report'
                description='Filter and generate daily attendance overview'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>

                <div className='bg-white p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto'>
                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Academic Year:<span className='text-red-500'>*</span></Label>
                            <Select value={academicYearId?.toString()} onValueChange={(v) => setAcademicYearId(Number(v))}>
                                <SelectTrigger className='h-9 shadow-sm'>
                                    <SelectValue placeholder='--Select--' />
                                </SelectTrigger>
                                <SelectContent>
                                    {(loadData as any)?.data?.academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* {(loadData as any)?.data?.categoryflag && (
                            <div className='space-y-4'>
                                <Label className='text-sm font-bold'>Category:<span className='text-red-500'>*</span></Label>
                                <Select value={categoryId} onValueChange={setCategoryId}>
                                    <SelectTrigger className='h-9 shadow-sm'>
                                        <SelectValue placeholder='Select Category' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='All'>All</SelectItem>
                                        {(loadData as any)?.data?.category_list?.map((cat: any) => (
                                            <SelectItem key={cat.amC_Id} value={cat.amC_Id.toString()}>
                                                {cat.amC_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )} */}

                        <div className='space-y-4'>
                            <Label className='text-sm font-bold'>Date:<span className='text-red-500'>*</span></Label>
                            <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='h-9 w-full justify-start text-left font-normal shadow-sm'>
                                        <CalendarIcon className='mr-2 h-4 w-4 text-indigo-500' />
                                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Enter date'}
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

                    <div className='flex flex-wrap justify-center gap-4 pt-8 mt-6 border-t'>
                        <Button size='sm' onClick={handleShowReport} disabled={reportMutation.isPending} className='min-w-32 bg-[#3f51b5] hover:bg-[#303f9f] text-white shadow-lg rounded-full uppercase transition-all'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button size='sm' onClick={handleReset} className='min-w-32 bg-[#ff5722] hover:bg-[#f4511e] text-white shadow-lg rounded-full uppercase transition-all'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button size='sm' onClick={() => handleExport(reportData, 'Overall_Attendance')} disabled={!showReport} className='min-w-32 bg-[#4caf50] hover:bg-[#388e3c] text-white shadow-lg disabled:bg-gray-200 disabled:text-gray-400 rounded-full uppercase transition-all'>
                            <Download className='mr-2 h-4 w-4' />
                            EXPORT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Main Report Table */}
            {showReport && (
                <div className='space-y-4 animate-in fade-in slide-in-from-top-4'>
                    <div className='flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm'>
                        <div className='flex items-center space-x-6'>
                            <div className='flex items-center space-x-2'>
                                <span className='text-sm font-bold text-gray-500 uppercase'>Total Records:</span>
                                <Badge variant='secondary' className='bg-indigo-100 text-indigo-700 font-bold px-3'>{reportData.length}</Badge>
                            </div>
                            {mainSearchQuery && (
                                <div className='flex items-center space-x-2'>
                                    <span className='text-sm font-bold text-gray-500 uppercase'>Filtered:</span>
                                    <Badge variant='secondary' className='bg-green-100 text-green-700 font-bold px-3'>{filteredMainData.length}</Badge>
                                </div>
                            )}
                        </div>
                        <div className='relative w-full max-w-xs'>
                            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search Class or Section...'
                                value={mainSearchQuery}
                                onChange={(e) => setMainSearchQuery(e.target.value)}
                                className='h-9 pl-8 text-sm border-gray-200'
                            />
                        </div>
                    </div>

                    <div className='rounded-xl border bg-white shadow-sm overflow-hidden'>
                        <Table>
                            <TableHeader className='bg-gray-50'>
                                <TableRow>
                                    <TableHead className='w-[80px] text-center font-bold'>SL. No.</TableHead>
                                    <TableHead className='font-bold'>Class</TableHead>
                                    <TableHead className='font-bold'>Section</TableHead>
                                    <TableHead className='text-center font-bold'>Strength</TableHead>
                                    <TableHead className='text-center font-bold'>Present</TableHead>
                                    <TableHead className='text-center font-bold'>Absent</TableHead>
                                    <TableHead className='text-center font-bold'>Half Day</TableHead>
                                    <TableHead className='font-bold'>Entry Date / Time</TableHead>
                                    <TableHead className='text-center font-bold'>Absentees Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMainData.map((user, idx) => (
                                    <TableRow key={idx} className='hover:bg-indigo-50/30 transition-colors'>
                                        <TableCell className='text-center font-medium'>{idx + 1}</TableCell>
                                        <TableCell>{user.ASMCL_ClassName}</TableCell>
                                        <TableCell>{user.ASMC_SectionName}</TableCell>
                                        <TableCell className='text-center font-semibold'>{user.TOTAL}</TableCell>
                                        <TableCell className='text-center text-green-600 font-semibold'>{user.PRESENT}</TableCell>
                                        <TableCell className='text-center text-red-600 font-semibold'>{user.ABSENT}</TableCell>
                                        <TableCell className='text-center text-orange-600 font-semibold'>{user.HALFDAY}</TableCell>
                                        <TableCell className='text-xs'>
                                            {(user.EntryTime || user.ASA_Entry_DateTime) ? format(new Date(user.EntryTime || user.ASA_Entry_DateTime), 'dd-MM-yyyy / hh:mm a') : '-'}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            <Button variant='link' size='sm' onClick={() => handleRowDetails(user)} className='text-indigo-600 font-bold hover:no-underline'>
                                                View Details <Eye className='ml-1 h-3 w-3' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className='bg-indigo-50/50 font-bold text-indigo-900'>
                                    <TableCell colSpan={3} className='text-right uppercase tracking-wider'>Grand Total</TableCell>
                                    <TableCell className='text-center'>{totals.strength}</TableCell>
                                    <TableCell className='text-center'>{totals.present}</TableCell>
                                    <TableCell className='text-center'>{totals.absent}</TableCell>
                                    <TableCell className='text-center'>{totals.halfday}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className='text-center'>
                                        <Button variant='link' size='sm' onClick={handleViewAllDetails} className='text-indigo-800 font-extrabold hover:no-underline underline'>
                                            View All Details <Eye className='ml-1 h-3 w-3' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            {/* Details Dialog */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden'>
                    <DialogHeader className='p-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white'>
                        <DialogTitle className='text-xl font-bold'>{modalTitle}</DialogTitle>
                    </DialogHeader>

                    <div className='p-6 space-y-6 flex-1 overflow-auto'>
                        {modalDetails && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border'>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Academic Year:</span> <span>{modalDetails.year}</span></div>
                                    {modalDetails.classSection && <div className='flex justify-between'><span className='font-bold text-gray-500'>Class-Section:</span> <span>{modalDetails.classSection}</span></div>}
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Total Present:</span> <span className='text-green-600 font-bold'>{modalDetails.present}</span></div>
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Half Day:</span> <span className='text-orange-600 font-bold'>{modalDetails.halfday}</span></div>
                                </div>
                                <div className='space-y-2 text-sm'>
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Date:</span> <span>{format(modalDetails.date, 'dd-MM-yyyy')}</span></div>
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Total Strength:</span> <span className='font-bold'>{modalDetails.strength}</span></div>
                                    <div className='flex justify-between'><span className='font-bold text-gray-500'>Total Absent:</span> <span className='text-red-600 font-bold'>{modalDetails.absent}</span></div>
                                </div>
                            </div>
                        )}

                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h4 className='text-sm font-bold uppercase tracking-widest text-indigo-900'>Absentees & Teachers List</h4>
                                <div className='relative w-64'>
                                    <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        placeholder='Search by Name...'
                                        value={modalSearchQuery}
                                        onChange={(e) => setModalSearchQuery(e.target.value)}
                                        className='h-9 pl-8 text-xs'
                                    />
                                </div>
                            </div>

                            <div className='rounded-lg border overflow-hidden'>
                                <Table>
                                    <TableHeader className='bg-gray-100'>
                                        <TableRow>
                                            <TableHead className='w-[80px] text-center font-bold'>SL. No.</TableHead>
                                            <TableHead className='font-bold'>Absentees Name</TableHead>
                                            <TableHead className='font-bold'>Teacher's Name</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredModalData.length > 0 ? (
                                            filteredModalData.map((item, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className='text-center'>{idx + 1}</TableCell>
                                                    <TableCell className='font-medium'>{item.name}</TableCell>
                                                    <TableCell>{item.HRME_EmployeeFirstName || '-'}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className='text-center py-8 text-muted-foreground italic'>No records found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    <div className='p-4 border-t bg-gray-50 flex justify-end gap-3'>
                        <Button variant='outline' size='sm' onClick={() => setModalOpen(false)}>Close</Button>
                        <Button size='sm' variant='default' onClick={() => handleExport(filteredModalData, 'Absentees_Details')} disabled={!filteredModalData.length} className='bg-green-600 hover:bg-green-700'>
                            <Download className='mr-2 h-4 w-4' /> Export
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
