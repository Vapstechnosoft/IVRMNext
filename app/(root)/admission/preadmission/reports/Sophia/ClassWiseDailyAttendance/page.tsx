'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, Printer, RotateCcw, X, FileSpreadsheet, Send, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Badge } from '@/components/ui/badge';

import { ClassWiseDailyAttendanceSchema } from '@/schemas/admission/preadmission/reports';
import {
    useClassWiseDailyAttendanceInitialDetails,
    useClassWiseDailyAttendanceClasses,
    useClassWiseDailyAttendanceSections,
    useClassWiseDailyAttendanceReport,
    useSendClassWiseDailyAttendanceSMS
} from '@/hooks/admission/preadmission/useClassWiseDailyAttendance';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { ClassWiseDailyAttendancePrint } from './_components/classwise-daily-attendance-print';

export default function ClassWiseDailyAttendancePage() {
    /* ---------------- Hooks & State ---------------- */

    const { data: initialData, isLoading: isInitialLoading } = useClassWiseDailyAttendanceInitialDetails();
    const { data: ayData, isLoading: isAYLoading } = useAcademicYearDropdown();
    const [reportPayload, setReportPayload] = useState<{ asmaY_Id: number; fromDate: Date; asmcL_Id: number; asmS_Id: number } | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
    const [printTimestamp, setPrintTimestamp] = useState('');
    const printRef = useRef<HTMLDivElement>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(ClassWiseDailyAttendanceSchema),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            fromDate: new Date()
        }
    });

    const watchedYear = watch('asmaY_Id');
    const watchedClass = watch('asmcL_Id');
    const watchedSection = watch('asmS_Id');
    const watchedDate = watch('fromDate');

    const { data: classData, isFetching: isClassesLoading } = useClassWiseDailyAttendanceClasses(watchedYear);
    const { data: sectionData, isFetching: isSectionsLoading } = useClassWiseDailyAttendanceSections(watchedYear, watchedClass);
    
    const { data: reportResponse, isFetching: isReportLoading, refetch: refetchReport } = useClassWiseDailyAttendanceReport(
        reportPayload?.asmaY_Id ?? 0,
        reportPayload?.fromDate,
        reportPayload?.asmcL_Id ?? 0,
        reportPayload?.asmS_Id ?? 0,
        showReport
    );

    const sendSMSMutation = useSendClassWiseDailyAttendanceSMS();

    /* ---------------- Memoized Data ---------------- */

    const years = initialData?.data?.data?.yearList || initialData?.data?.yearList || 
                  initialData?.data?.data?.academicList || initialData?.data?.academicList || 
                  initialData?.data?.data?.academicYearList || initialData?.data?.academicYearList || 
                  ayData?.data || [];
                  
    const classes = classData?.data?.data?.classList || classData?.data?.classList || 
                    initialData?.data?.data?.classList || initialData?.data?.classList || [];
                    
    const sections = sectionData?.data?.data?.sectionList || sectionData?.data?.sectionList || 
                     initialData?.data?.data?.sectionList || initialData?.data?.sectionList || [];
                     
    const reportData = useMemo(() => {
        const rawData = reportResponse?.data?.data || reportResponse?.data;
        if (!rawData) return [];
        if (Array.isArray(rawData)) return rawData;
        if (Array.isArray(rawData.studentList)) return rawData.studentList;
        if (Array.isArray(rawData.searchstudentDetails)) return rawData.searchstudentDetails;
        return [];
    }, [reportResponse]);

    const reportLogoUrl = useMemo(() => {
        const masterCompany = reportResponse?.data?.data?.masterCompany || reportResponse?.data?.masterCompany;
        if (Array.isArray(masterCompany) && masterCompany.length > 0) {
            return masterCompany[0].companyname;
        }
        return initialData?.data?.data?.imgname || initialData?.data?.imgname;
    }, [reportResponse, initialData]);

    const logoUrl = initialData?.data?.data?.imgname || initialData?.data?.imgname;
    const username = initialData?.data?.data?.usrname || initialData?.data?.usrname;
    const disclaimer = initialData?.data?.data?.coptyright || initialData?.data?.coptyright;

    const summary = useMemo(() => {
        if (!reportData || !reportData.length) return null;
        return {
            total: reportData.length,
            present: reportData.filter((r: any) => r.asa_class_attended === 1 || r.ASA_Class_Attended === 1).length,
            absent: reportData.filter((r: any) => r.asa_class_attended === 0 || r.ASA_Class_Attended === 0).length,
            halfDay: reportData.filter((r: any) => r.asa_class_attended === 0.5 || r.ASA_Class_Attended === 0.5).length
        };
    }, [reportData]);

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        if (initialData?.data?.defalutYearList && initialData.data.defalutYearList.length > 0) {
            const defaultYearId = initialData.data.defalutYearList[0].asmaY_Id;
            setValue('asmaY_Id', defaultYearId);
        }
    }, [initialData, setValue]);

    /* ---------------- Handlers ---------------- */

    const onSubmit = (data: any) => {
        setReportPayload(data);
        setShowReport(true);
        setSelectedStudents([]);
        toast.info('Generating report...');
    };

    const handleClear = () => {
        window.location.reload();
    };

    const handleSendSMS = async () => {
        if (!selectedStudents.length) {
            toast.warning('Please select at least one student to send SMS.');
            return;
        }

        toast.loading('Sending SMS...', { id: 'sms-send' });
        try {
            const absentOnlyList = selectedStudents.filter((s) => s.asa_class_attended === 0 || s.ASA_Class_Attended === 0);

            if (absentOnlyList.length === 0) {
                toast.warning('No absent students selected.', { id: 'sms-send' });
                return;
            }

            const res = await sendSMSMutation.mutateAsync({
                asmaY_Id: watchedYear,
                fromDate: watchedDate,
                asmcL_Id: watchedClass,
                absentList: absentOnlyList
            });

            // The backend might return success: false even for success messages
            const isSuccess = res.success || res.message === 'SMS Sent Successfully';

            if (isSuccess) {
                toast.success(res.message || 'SMS sent successfully!', { id: 'sms-send' });
            } else {
                toast.error(res.message || 'Failed to send SMS.', { id: 'sms-send' });
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while sending SMS.', { id: 'sms-send' });
        }
    };


    const exportToExcel = () => {
        if (!reportData.length) return;
        const ws = XLSX.utils.json_to_sheet(reportData.map((row: any, idx: number) => ({
            'SL. No.': idx + 1,
            'Student Name': row.studentname || row.AMST_FirstName,
            'Roll No.': row.amay_rollno || row.AMAY_RollNo,
            'Admission No.': row.amst_admno || row.AMST_AdmNo,
            'Class': row.asmcl_classname,
            'Section': row.asmc_sectionname,
            'Status': (row.asa_class_attended === 1 || row.ASA_Class_Attended === 1) ? 'Present' : 
                      (row.asa_class_attended === 0.5 || row.ASA_Class_Attended === 0.5) ? 'Half Day' : 'Absent'
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Attendance_Report');
        XLSX.writeFile(wb, `ClassWiseDailyAttendance_${format(watchedDate, 'dd-MM-yyyy')}.xlsx`);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'ClassWiseDailyAttendanceReport'
    });

    const handlePrint = () => {
        if (selectedStudents.length === 0) {
            toast.warning('Please select records to print.');
            return;
        }
        setPrintTimestamp(new Date().toLocaleString());
        setTimeout(() => triggerPrint(), 300);
    };

    /* ---------------- Table Config ---------------- */

    const classColumns: any[] = [
        { header: 'SL. No.', cell: (info: any) => info.row.index + 1, size: 70 },
        { header: 'Class Name', accessorKey: 'asmcL_ClassName' },
        { header: 'Class Code', accessorKey: 'asmcL_ClassCode' },
        { header: 'Max Capacity', accessorKey: 'asmcL_MaxCapacity' },
        { header: 'Order', accessorKey: 'asmcL_Order' }
    ];

    const sectionColumns: any[] = [
        { header: 'SL. No.', cell: (info: any) => info.row.index + 1, size: 70 },
        { header: 'Section Name', accessorKey: 'asmC_SectionName' },
        { header: 'Section Code', accessorKey: 'asmC_SectionCode' },
        { header: 'Max Capacity', accessorKey: 'asmC_MaxCapacity' },
        { header: 'Order', accessorKey: 'asmC_Order' }
    ];

    /* ---------------- Render ---------------- */

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection title='ClassWise Daily Attendance' defaultOpen>
                <form onSubmit={handleSubmit(onSubmit)} className='p-4 space-y-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {/* Academic Year */}
                        <div className='space-y-1.5'>
                            <Label>Academic Year *</Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            setValue('asmcL_Id', 0);
                                            setValue('asmS_Id', 0);
                                        }}
                                        value={field.value ? field.value.toString() : ''}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <p className='text-xs text-red-500 font-medium'>{errors.asmaY_Id.message}</p>}
                        </div>

                        {/* Date */}
                        <div className='space-y-1.5'>
                            <Label>Date *</Label>
                            <Controller
                                name='fromDate'
                                control={control}
                                render={({ field }) => (
                                    <DatePicker date={field.value} setDate={field.onChange} className='w-full' />
                                )}
                            />
                            {errors.fromDate && <p className='text-xs text-red-500 font-medium'>{errors.fromDate.message}</p>}
                        </div>

                        {/* Class */}
                        <div className='space-y-1.5'>
                            <Label>Class *</Label>
                            <Controller
                                name='asmcL_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(Number(val));
                                            setValue('asmS_Id', 0);
                                        }}
                                        value={field.value ? field.value.toString() : ''}
                                        disabled={(!watchedYear && classes.length === 0) || isClassesLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isClassesLoading ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map((c: any) => (
                                                <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                    {c.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmcL_Id && <p className='text-xs text-red-500 font-medium'>{errors.asmcL_Id.message}</p>}
                        </div>

                        {/* Section */}
                        <div className='space-y-1.5'>
                            <Label>Section *</Label>
                            <Controller
                                name='asmS_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== undefined ? field.value.toString() : ''}
                                        disabled={(!watchedClass && sections.length === 0) || isSectionsLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={isSectionsLoading ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>All</SelectItem>
                                            {sections.map((s: any) => (
                                                <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmS_Id && <p className='text-xs text-red-500 font-medium'>{errors.asmS_Id.message}</p>}
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-3 pt-4 border-t'>
                        <Button type='submit' isLoading={isReportLoading}>
                            <FileText className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button variant='outline' type='button' onClick={handleClear}>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            disabled={!showReport || !reportData.length}
                            onClick={exportToExcel}
                        >
                            <FileSpreadsheet className='mr-2 h-4 w-4 text-green-600' />
                            Export
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            disabled={!showReport || !reportData.length}
                            onClick={handlePrint}
                        >
                            <Printer className='mr-2 h-4 w-4 text-blue-600' />
                            Print
                        </Button>
                        <Button
                            variant='outline'
                            type='button'
                            className='bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
                            disabled={!showReport || !selectedStudents.length}
                            onClick={handleSendSMS}
                        >
                            <Send className='mr-2 h-4 w-4' />
                            SEND SMS
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {showReport && (
                <CollapsibleSection title='Report Details' defaultOpen>
                    <div className='p-4 space-y-4'>
                        {summary && (
                            <div className='flex flex-wrap gap-4 p-4 rounded-xl border-dashed border-2 border-primary/20 bg-primary/5 uppercase text-xs font-bold'>
                                <div className='flex items-center gap-2'>
                                    Total Records: <Badge variant='secondary' className='rounded-full'>{summary.total}</Badge>
                                </div>
                                <div className='flex items-center gap-2'>
                                    Total Present: <Badge className='bg-blue-500 rounded-full hover:bg-blue-600'>{summary.present}</Badge>
                                </div>
                                <div className='flex items-center gap-2 text-red-700'>
                                    Total Absent: <Badge variant='destructive' className='rounded-full'>{summary.absent}</Badge>
                                </div>
                                <div className='flex items-center gap-2 text-yellow-700'>
                                    Half Day: <Badge className='bg-yellow-500 rounded-full hover:bg-yellow-600'>{summary.halfDay}</Badge>
                                </div>
                            </div>
                        )}

                        <GenericDataTable
                            data={reportData}
                            columns={[
                                {
                                    id: 'select',
                                    header: ({ table }: any) => (
                                        <Checkbox
                                            checked={table.getIsAllRowsSelected()}
                                            onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
                                            aria-label='Select all'
                                        />
                                    ),
                                    cell: ({ row }: any) => (
                                        <Checkbox
                                            checked={row.getIsSelected()}
                                            onCheckedChange={(value) => row.toggleSelected(!!value)}
                                            aria-label='Select row'
                                        />
                                    ),
                                    enableSorting: false,
                                    enableHiding: false,
                                    size: 40
                                },
                                {
                                    header: 'SL. No.',
                                    cell: (info: any) => info.row.index + 1,
                                    size: 70
                                },
                                {
                                    header: 'Student Name',
                                    accessorKey: 'studentname',
                                    cell: (info: any) => info.getValue() || info.row.original.AMST_FirstName
                                },
                                {
                                    header: 'Roll No.',
                                    accessorKey: 'amay_rollno',
                                    cell: (info: any) => info.getValue() || info.row.original.AMAY_RollNo,
                                    size: 100
                                },
                                {
                                    header: 'Admission No.',
                                    accessorKey: 'amst_admno',
                                    cell: (info: any) => info.getValue() || info.row.original.AMST_AdmNo,
                                    size: 140
                                },
                                {
                                    header: 'Class',
                                    accessorKey: 'asmcl_classname',
                                    size: 120
                                },
                                {
                                    header: 'Mobile No',
                                    accessorKey: 'amst_mobileno',
                                    size: 120
                                },
                                {
                                    header: 'Section',
                                    accessorKey: 'asmc_sectionname',
                                    size: 100
                                },
                                {
                                    header: 'Status',
                                    accessorKey: 'asa_class_attended',
                                    size: 130,
                                    cell: (info: any) => {
                                        const val = info.getValue() ?? info.row.original.ASA_Class_Attended;
                                        if (val === 1) return <Badge variant='outline' className='text-blue-600 border-blue-200'>Present</Badge>;
                                        if (val === 0.5) return <Badge variant='outline' className='text-yellow-600 border-yellow-200'>Half Day</Badge>;
                                        return <Badge variant='outline' className='text-red-600 border-red-200'>Absent</Badge>;
                                    }
                                }
                            ]}
                            isLoading={isReportLoading}
                            maxSelectableRows={9999}
                            onRowSelectionChange={setSelectedStudents}
                            showExportOptions={false}
                            noDataTitle='Attendance records not found for selected criteria'
                            loadingMessage='Fetching classwise daily attendance...'
                        />
                    </div>
                </CollapsibleSection>
            )}



            {/* Hidden Print Content */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
                <ClassWiseDailyAttendancePrint
                    ref={printRef}
                    data={selectedStudents}
                    academicYear={years.find((y: any) => y.asmaY_Id === reportPayload?.asmaY_Id)?.asmaY_Year}
                    className={classes.find((c: any) => c.asmcL_Id === reportPayload?.asmcL_Id)?.asmcL_ClassName}
                    sectionName={reportPayload?.asmS_Id === 0 ? 'All' : sections.find((s: any) => s.asmS_Id === reportPayload?.asmS_Id)?.asmC_SectionName}
                    date={reportPayload?.fromDate}
                    logoUrl={reportLogoUrl || logoUrl}
                    username={username}
                    disclaimer={disclaimer}
                />
            </div>
        </div>
    );
}
