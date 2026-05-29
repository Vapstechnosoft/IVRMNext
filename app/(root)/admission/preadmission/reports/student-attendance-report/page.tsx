'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, FileSpreadsheet, Printer, Save, Search } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useAcademicYearDropdown, useMasterClassDropdown, useMasterSectionDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useStudentAttendanceReport, useadmissionStudentsDropdown } from '@/hooks/admission/preadmission/useReports';
import { getStudentAttendanceReport } from '@/server/admission/preadmission/reports/report';
import type { IStudentAttendanceReportList } from '@/types/admission/preadmission/reports';
import type { ApiSearchparams } from '@/types';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import { attendanceColumns, getAttendanceColumns } from './_components/columns';
import { StudentAttendancePrint } from './_components/student-attendance-print';

/* ---------------- Schema ---------------- */

const schema = z.object({
    academicYearId: z.number().min(1),
    classId: z.number().min(1),
    sectionId: z.number().min(1),
    studentId: z.number().optional(),

    selectionMode: z.number().min(1),
    studentStatus: z.number().min(1),
    certificateType: z.enum(['admNo', 'name']),

    month: z.number().optional(),
    monthDateWise: z.number().optional(),
    dailyDate: z.date().nullable().optional(),
    fromDate: z.date().nullable().optional(),
    toDate: z.date().nullable().optional()
});

type FormFields = z.infer<typeof schema>;

/* ---------------- Helper ---------------- */

const parseAttendanceList = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.map((item: any) => {
        let parsedConcession: any = {};
        if (item.FMCC_ConcessionName) {
            try {
                parsedConcession = JSON.parse(item.FMCC_ConcessionName);
            } catch (e) {
                console.error('Error parsing FMCC_ConcessionName JSON:', e);
            }
        }
        const newItem = { ...item };
        
        let attended = 0;
        let held = 0;
        let hasAttendanceDetails = false;

        Object.keys(parsedConcession).forEach((dayKey) => {
            const val = parsedConcession[dayKey];
            newItem[`_${dayKey}`] = val;
            newItem[dayKey] = val;

            if (val === 'P') {
                attended++;
                held++;
                hasAttendanceDetails = true;
            } else if (val === 'A') {
                held++;
                hasAttendanceDetails = true;
            } else if (val === 'L') {
                held++;
                hasAttendanceDetails = true;
            }
        });

        if (hasAttendanceDetails) {
            if (newItem.ASA_ClassHeld === 'Not Available' || isNaN(Number(newItem.ASA_ClassHeld))) {
                newItem.ASA_ClassHeld = held;
            }
            if (newItem.ASA_Class_Attended === 'Not Available' || isNaN(Number(newItem.ASA_Class_Attended))) {
                newItem.ASA_Class_Attended = attended;
            }
            if (newItem.Percentage === 'Not Available' || isNaN(Number(newItem.Percentage))) {
                newItem.Percentage = held > 0 ? (attended / held) * 100 : 0;
            }
        }

        return newItem;
    });
};

/* ---------------- Component ---------------- */

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudyCertificateReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const {

        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            selectionMode: 1, // all
            studentStatus: 1, // Monthly
            certificateType: 'admNo',
            monthDateWise: 0,
            studentId: 0
        }
    });
    const tableRef = useRef<DataTableRef>(null);

    const [showGrid, setShowGrid] = useState(false);

    const studentStatus = useWatch({ control, name: 'studentStatus' });
    const academicYearId = useWatch({ control, name: 'academicYearId' });
    const classId = useWatch({ control, name: 'classId' });
    const sectionId = useWatch({ control, name: 'sectionId' });
    const studentId = useWatch({ control, name: 'studentId' });
    const month = useWatch({ control, name: 'month' });
    const monthDateWise = useWatch({ control, name: 'monthDateWise' });
    const fromDate = useWatch({ control, name: 'fromDate' });
    const toDate = useWatch({ control, name: 'toDate' });
    const dailyDate = useWatch({ control, name: 'dailyDate' });
    const selectionMode = useWatch({ control, name: 'selectionMode' });

    const [searchValue, setSearchValue] = useState(String(searchParams?.search_query || ''));

    useEffect(() => {
        const timeout = setTimeout(() => {
            const currentQuery = String(searchParams?.search_query || '');
            if (searchValue !== currentQuery) {
                const params = new URLSearchParams(window.location.search);
                if (searchValue) {
                    params.set('search_query', searchValue);
                    params.set('page', '1');
                } else {
                    params.delete('search_query');
                }
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [searchValue, searchParams?.search_query, pathname, router]);

    const apiSearchParams: ApiSearchparams | undefined = searchParams
        ? {
              page: Number(searchParams.page) || 1,
              page_size: Number(searchParams.page_size) || 10,
              sort_column: String(searchParams.sort_column || ''),
              sort_direction: String(searchParams.sort_direction || 'asc'),
              search_query: String(searchParams.search_query || ''),
              search_columns: String(searchParams.search_columns || '')
          }
        : undefined;

    const { data: academicYears } = useAcademicYearDropdown();
    const { data: classes } = useMasterClassDropdown();
    const { data: sections } = useMasterSectionDropdown();

    const { data: students, isLoading: studentsLoading } = useadmissionStudentsDropdown(academicYearId, classId, sectionId);

    const {
        data: studentsAttendance,
        isLoading,
        error,
        refetch
    } = useStudentAttendanceReport(
        academicYearId,
        classId,
        sectionId,
        selectionMode === 2 ? studentId : 0, // Conditional studentId handling
        month,
        monthDateWise,
        fromDate,
        toDate,
        dailyDate,
        selectionMode,
        studentStatus,
        apiSearchParams,
        showGrid
    );

    const parsedStudentsAttendance = useMemo(() => {
        if (!studentsAttendance) return null;
        const list = (studentsAttendance as any)?.data?.studentAttendanceList;
        return {
            ...studentsAttendance,
            data: {
                ...(studentsAttendance as any).data,
                studentAttendanceList: list ? parseAttendanceList(list) : []
            }
        };
    }, [studentsAttendance]);

    const columns = useMemo(() => getAttendanceColumns(!!monthDateWise, (parsedStudentsAttendance as any)?.data?.monthList), [monthDateWise, parsedStudentsAttendance]);

    const [allReportData, setAllReportData] = useState<any>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const tableProps = useDataTableProps({
        ...parsedStudentsAttendance,
        data: (parsedStudentsAttendance as any)?.data?.studentAttendanceList ?? [],
        totalItems: (parsedStudentsAttendance as any)?.total ?? 0
    });

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'StudentAttendanceReport'
    });

    const handlePrintAll = async () => {
        try {
            if (!academicYearId || !classId || !sectionId) {
                toast.error('Please fill all required fields!');
                return;
            }

            setIsPrinting(true);
            toast.loading('Preparing all records for print...', { id: 'print-all' });

            const totalRecords = (studentsAttendance as any)?.total || 0;
            const allData = await getStudentAttendanceReport(
                academicYearId,
                classId,
                sectionId,
                selectionMode === 2 ? studentId : 0,
                month,
                monthDateWise,
                fromDate,
                toDate,
                dailyDate,
                selectionMode,
                studentStatus,
                { page: 1, page_size: totalRecords || 1000 }
            );

            if (allData) {
                const parsedAllData = {
                    ...allData,
                    data: {
                        ...(allData as any).data,
                        studentAttendanceList: parseAttendanceList((allData as any)?.data?.studentAttendanceList)
                    }
                };
                setAllReportData(parsedAllData);
                toast.success('Ready to print', { id: 'print-all' });
                // Small delay to ensure state update and re-render
                setTimeout(() => {
                    handlePrint();
                    setIsPrinting(false);
                }, 500);
            } else {
                toast.error('No data found to print', { id: 'print-all' });
                setIsPrinting(false);
            }
        } catch (error) {
            console.error('Print Error:', error);
            toast.error('Failed to prepare print view', { id: 'print-all' });
            setIsPrinting(false);
        }
    };

    /* ---------------- Effects ---------------- */

    useEffect(() => {
        reset((prev) => ({
            ...prev,
            month: undefined,
            monthDateWise: 0,
            dailyDate: null,
            fromDate: null,
            toDate: null
        }));
    }, [studentStatus, reset]);
    useEffect(() => {
        if (selectionMode === 1) {
            reset((prev) => ({
                ...prev,
                studentId: 0,
                certificateType: 'admNo'
            }));
        }
    }, [selectionMode, reset]);

    const monthList = [
        { id: 1, name: 'January' },
        { id: 2, name: 'February' },
        { id: 3, name: 'March' },
        { id: 4, name: 'April' },
        { id: 5, name: 'May' },
        { id: 6, name: 'June' },
        { id: 7, name: 'July' },
        { id: 8, name: 'August' },
        { id: 9, name: 'September' },
        { id: 10, name: 'October' },
        { id: 11, name: 'November' },
        { id: 12, name: 'December' }
    ];

    /* ---------------- Submit ---------------- */

    const onSubmit = async (data: FormFields) => {
        try {
            const res = await refetch();
            const reportData = res.data as any;
            const records = reportData?.data?.studentAttendanceList || [];

            if (records.length > 0) {
                setShowGrid(true);
                toast.success('Report generated successfully');
            } else {
                setShowGrid(false);
                toast.error('No records found');
            }
        } catch (error) {
            console.error('Report Error:', error);
            setShowGrid(false);
            toast.error('No records found');
        }
    };

    const downloadExcel = async () => {
        try {
            if (!academicYearId || !classId || !sectionId) {
                toast.error('Please fill all required fields!');
                return;
            }

            toast.loading('Preparing Excel export...', { id: 'excel-download' });

            const studentsReportData: any = parsedStudentsAttendance;
            const totalRecordsCount = studentsReportData?.total || studentsReportData?.data?.total || 0;

            const allDataResponse = await getStudentAttendanceReport(
                academicYearId,
                classId,
                sectionId,
                selectionMode === 2 ? studentId : 0,
                month,
                monthDateWise,
                fromDate,
                toDate,
                dailyDate,
                selectionMode,
                studentStatus,
                { page: 1, page_size: totalRecordsCount || 1000 }
            );

            // Robust data extraction
            const getListData = (resp: any): any[] => {
                if (!resp) return [];
                // Case 1: Standard ApiResponse wrapper
                const payload = resp.data;
                if (payload) {
                    if (Array.isArray(payload.studentAttendanceList)) return payload.studentAttendanceList;
                    if (Array.isArray(payload)) return payload;
                    // Case 1b: Double nested data (some APIs do this)
                    if (payload.data && Array.isArray(payload.data.studentAttendanceList)) return payload.data.studentAttendanceList;
                    if (Array.isArray(payload.data)) return payload.data;
                }
                // Case 2: Naked response (no ApiResponse wrapper)
                if (Array.isArray(resp.studentAttendanceList)) return resp.studentAttendanceList;
                if (Array.isArray(resp)) return resp;
                return [];
            };

            const getMonthList = (resp: any): any[] => {
                if (!resp) return [];
                const payload = resp.data;
                if (payload?.monthList) return payload.monthList;
                if (payload?.data?.monthList) return payload.data.monthList;
                if (resp.monthList) return resp.monthList;
                return [];
            };

            let rawData = getListData(allDataResponse);
            const excelMonthList = getMonthList(allDataResponse);
            const excelDays = excelMonthList.length > 0 ? excelMonthList.map((m: any) => m.day) : Array.from({ length: 31 }, (_, i) => i + 1);

            // Fallback to currently displayed data if fetch failed or returned nothing
            if (rawData.length === 0 && studentsReportData) {
                rawData = getListData(studentsReportData);
            }

            let allData = parseAttendanceList(rawData);

            if (!allData || allData.length === 0) {
                toast.dismiss('excel-download');
                toast.error('No records found to export');
                return;
            }

            const activeYear = academicYears?.data?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year;
            const activeClass = classes?.data?.find((c: any) => c.asmcL_Id === classId)?.asmcL_ClassName;
            const activeSection = sections?.data?.find((s: any) => s.asmS_Id === sectionId)?.asmC_SectionName;
            const activeMonth = monthList.find((m) => m.id === month)?.name;

            // Prepare headers
            const reportHeaders = [
                ['STUDENT ATTENDANCE REPORT'],
                [`Academic Year: ${activeYear || 'N/A'}`],
                [`Class: ${activeClass || 'N/A'}`, `Section: ${activeSection || 'N/A'}`],
                [activeMonth ? `Month: ${activeMonth}` : ''],
                [] // Empty row
            ];

            // Define table headers based on attendanceColumns
            let tableHeaders = ['Sl.No', 'Student Name', 'Admission No', 'Roll No'];
            if (monthDateWise) {
                for (const day of excelDays) {
                    tableHeaders.push(String(day));
                }
            }
            tableHeaders.push('Class Held', 'Class Attended', 'Percentage');

            // Prepare table data
            const tableData = allData.map((row: any) => {
                const baseData = [
                    row.RowNo,
                    row.name,
                    row.AMST_AdmNo,
                    row.AMAY_RollNo
                ];

                if (monthDateWise) {
                    for (const day of excelDays) {
                        baseData.push(row[`_${day}`] || '');
                    }
                }

                baseData.push(
                    row.ASA_ClassHeld,
                    row.ASA_Class_Attended,
                    `${Number(row.Percentage || 0).toFixed(2)}%`
                );

                return baseData;
            });

            // Add Total Records row
            const totalRecordsRow = [
                'TOTAL RECORDS',
                '',
                '',
                '',
                '',
                '',
                allData.length
            ];

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet([...reportHeaders, tableHeaders, ...tableData, [], totalRecordsRow]);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'AttendanceReport');

            // Download file
            XLSX.writeFile(wb, `StudentAttendanceReport_${activeYear || 'Report'}_${format(new Date(), 'ddMMyyyy_HHmmss')}.xlsx`);

            toast.dismiss('excel-download');
            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.dismiss('excel-download');
            toast.error('Failed to prepare Excel export');
        }
    };

    /* ---------------- UI ---------------- */

    return (
        <div className='min-h-screen'>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='space-y-6 rounded-xl border bg-card p-6 shadow-xl'>
                    {/* -------- Radio Groups -------- */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <RadioField
                            name='selectionMode'
                            control={control}
                            options={[
                                { label: 'all', value: 1 },
                                { label: 'individual', value: 2 }
                            ]}
                        />

                        <RadioField
                            name='certificateType'
                            control={control}
                            options={[
                                { label: 'admNo', value: 'admNo' },
                                { label: 'name', value: 'name' }
                            ]}
                            disabled={selectionMode !== 2}
                        />

                        <RadioField
                            name='studentStatus'
                            control={control}
                            options={[
                                { label: 'Monthly', value: 1 },
                                { label: 'Between Date', value: 2 },
                                { label: 'Daily', value: 3 }
                            ]}
                        />
                    </div>

                    {/* -------- Filters -------- */}
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <SelectField
                            label='Academic Year'
                            name='academicYearId'
                            control={control}
                            options={academicYears?.data}
                            labelKey='asmaY_Year'
                            valueKey='asmaY_Id'
                            error={errors.academicYearId}
                        />

                        <SelectField
                            label='Class'
                            name='classId'
                            control={control}
                            options={classes?.data}
                            labelKey='asmcL_ClassName'
                            valueKey='asmcL_Id'
                            error={errors.classId}
                        />

                        <SelectField
                            label='Section'
                            name='sectionId'
                            control={control}
                            options={sections?.data}
                            labelKey='asmC_SectionName'
                            valueKey='asmS_Id'
                            error={errors.sectionId}
                            disabled={!classId}
                        />

                        <SelectField
                            label='Student'
                            name='studentId'
                            control={control}
                            options={students?.data}
                            labelKey='studentName'
                            valueKey='amsT_Id'
                            disabled={selectionMode !== 2 || !sectionId || studentsLoading}
                        />

                        {/* -------- Month -------- */}
                        {studentStatus === 1 && (
                            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                {/* Month */}
                                <Controller
                                    name='month'
                                    control={control}
                                    render={({ field }) => (
                                        <div>
                                            <Label>Month</Label>
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Month' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthList.map((m) => (
                                                        <SelectItem key={m.id} value={String(m.id)}>
                                                            {m.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />
                                <Controller
                                    name='monthDateWise'
                                    control={control}
                                    render={({ field }) => (
                                        <div className='flex items-center gap-2'>
                                            <Label className='font-normal'>Month Date Wise</Label>
                                            <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v ? 1 : 0)} />
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* -------- Month Date Wise -------- */}
                    </div>

                    {/* -------- Between Dates -------- */}
                    {studentStatus === 2 && (
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DateField name='fromDate' label='From Date' control={control} />
                            <DateField name='toDate' label='To Date' control={control} />
                        </div>
                    )}
                    {studentStatus === 3 && (
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <DateField name='dailyDate' label='Daily Date' control={control} />
                        </div>
                    )}

                    {/* -------- Actions -------- */}
                    <div className='flex gap-3 border-t pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                setShowGrid(false);
                            }}
                            className='w-fit'>
                            Reset
                        </Button>
                        <Button type='submit' isLoading={isSubmitting} className='w-fit'>
                            <Save className='mr-2 h-4 w-4' />
                            Report
                        </Button>
                        <Button onClick={downloadExcel} className='w-fit'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Export to Excel
                        </Button>
                        <Button
                            onClick={handlePrintAll}
                            variant='outline'
                            className='w-fit'
                            disabled={isPrinting || !((parsedStudentsAttendance as any)?.data?.studentAttendanceList?.length > 0)}>
                            <Printer className='mr-2 h-4 w-4' />
                            {isPrinting ? 'Preparing...' : 'Print'}
                        </Button>
                    </div>
                </div>
            </form>

            {showGrid && (
                <div className='container space-y-4 p-1'>
                    <CollapsibleSection
                        title='Student Attendance Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        {/* Institution Header */}
                        {(parsedStudentsAttendance as any)?.data?.institutionDetails?.[0] && (
                            <div className='mb-6 border-b pb-6 text-center'>
                                <div className='flex flex-col items-center gap-4'>
                                    {(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Logo && (
                                        <img
                                            src={(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Logo}
                                            alt='Logo'
                                            className='h-24 w-auto object-contain'
                                        />
                                    )}
                                    <div>
                                        <h1 className='text-2xl font-bold uppercase'>
                                            {(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Name}
                                        </h1>
                                        <p className='text-sm text-muted-foreground'>
                                            {(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Address1}
                                            {(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Address2 &&
                                                `, ${(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Address2}`}
                                            {(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Address3 &&
                                                `, ${(parsedStudentsAttendance as any).data.institutionDetails[0].mI_Address3}`}
                                        </p>
                                        <h2 className='mt-2 text-lg font-bold tracking-wide'>STUDENT ATTENDANCE REPORT</h2>
                                        <div className='mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold'>
                                            {academicYearId && (
                                                <span>
                                                    Academic Year:{' '}
                                                    {academicYears?.data?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year}
                                                </span>
                                            )}
                                            {classId && (
                                                <span>
                                                    Class: {classes?.data?.find((c: any) => c.asmcL_Id === classId)?.asmcL_ClassName}
                                                </span>
                                            )}
                                            {sectionId && (
                                                <span>
                                                    Section: {sections?.data?.find((s: any) => s.asmS_Id === sectionId)?.asmC_SectionName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <style dangerouslySetInnerHTML={{
                            __html: `
                            .attendance-table thead th {
                                background-color: #337ab7 !important;
                                color: white !important;
                                border: 1px solid #ddd !important;
                                text-align: center !important;
                                font-size: 11px !important;
                                padding: 8px 4px !important;
                            }
                            .attendance-table tbody td {
                                border: 1px solid #ddd !important;
                                font-size: 11px !important;
                                padding: 4px !important;
                            }
                            `
                        }} />

                        {/* Report Header Info */}
                        <div className='mb-2 flex flex-col gap-2'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2 text-sm font-bold'>
                                    Total Grid Records : <span className='inline-flex h-6 items-center justify-center rounded-full bg-gray-500 px-2 text-xs text-white'>{(parsedStudentsAttendance as any)?.total || 0}</span>
                                </div>
                                <div className='flex items-center gap-0'>
                                    <div className='relative'>
                                        <input
                                            type='text'
                                            placeholder='search here...'
                                            className='h-8 w-64 border border-gray-300 px-2 text-xs focus:outline-none'
                                            value={searchValue}
                                            onChange={(e) => setSearchValue(e.target.value)}
                                        />
                                        <div className='absolute right-0 top-0 flex h-8 w-8 items-center justify-center border border-l-0 border-gray-300 bg-gray-50'>
                                            <Search className='h-4 w-4 text-gray-500' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='text-[11px] font-bold uppercase'>
                                Note : P - Present , A - Absent , HO - Holiday , NE - Not Entered
                            </div>
                        </div>

                        <div className='attendance-table overflow-x-auto border border-gray-300'>
                            <GenericDataTable<IStudentAttendanceReportList>
                                {...tableProps}
                                ref={tableRef}
                                columns={columns}
                                isLoading={isLoading}
                                error={error}
                                showViewOptions={false}
                                loadingMessage='Loading Student Attendance Reports...'
                                noDataTitle='No Data Found'
                                noDataDescription='No Student Attendance Reports found.'
                                errorTitle='Error Loading Student Attendance Reports'
                            />
                        </div>

                        <div className='hidden'>
                            <StudentAttendancePrint
                                ref={printRef}
                                data={allReportData || parsedStudentsAttendance}
                                academicYear={academicYears?.data?.find((y: any) => y.asmaY_Id === academicYearId)?.asmaY_Year || ''}
                                className={classes?.data?.find((c: any) => c.asmcL_Id === classId)?.asmcL_ClassName || ''}
                                sectionName={sections?.data?.find((s: any) => s.asmS_Id === sectionId)?.asmC_SectionName || ''}
                                monthName={monthList.find((m) => m.id === month)?.name}
                                monthDateWise={!!monthDateWise}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}

/* ---------------- Reusable Fields ---------------- */

function RadioField({ name, control, options, disabled }: any) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <RadioGroup
                    value={String(field.value)}
                    onValueChange={(v) => {
                        const num = Number(v);
                        field.onChange(isNaN(num) || v.trim() === '' ? v : num);
                    }}
                    disabled={disabled}
                    className={`flex justify-center gap-4 rounded border p-3 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
                    {options.map((opt: any) => {
                        const id = `radio-${name}-${opt.value}`;
                        return (
                            <div key={String(opt.value)} className='flex items-center gap-2'>
                                <RadioGroupItem id={id} value={String(opt.value)} />
                                <Label htmlFor={id} className='font-normal cursor-pointer text-sm'>
                                    {opt.label}
                                </Label>
                            </div>
                        );
                    })}
                </RadioGroup>
            )}
        />
    );
}

function SelectField({ label, name, control, options, labelKey, valueKey, error, disabled }: any) {
    return (
        <div>
            <Label>{label}</Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select
                        disabled={disabled}
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={(v) => field.onChange(Number(v))}>
                        <SelectTrigger>
                            <SelectValue placeholder={`Select ${label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {options?.map((o: any) => (
                                <SelectItem key={o[valueKey]} value={String(o[valueKey])}>
                                    {o[labelKey]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <FormError>{error.message}</FormError>}
        </div>
    );
}

function DateField({ name, label, control }: any) {
    const [open, setOpen] = useState(false);

    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <div>
                    <Label>{label}</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant='outline' className='w-full justify-start'>
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {field.value ? format(field.value, 'yyyy-MM-dd') : `Select ${label}`}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='p-0'>
                            <DatePickerWithYear
                                mode='single'
                                selected={field.value ?? undefined}
                                onDayClick={(d) => {
                                    field.onChange(d);
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            )}
        />
    );
}
