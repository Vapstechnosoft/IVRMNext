'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { use, useRef, useState } from 'react';

import type { IRigistrationReportList } from '@/types/admission/preadmission/reports';
import { registrationColumns } from './_components/columns';

import { CalendarIcon, FileSpreadsheet, Printer, RotateCcw } from 'lucide-react';

import { usePreAdmissionRegistrationReport } from '@/hooks/admission/preadmission/useReports';
import { format } from 'date-fns';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function RegistrationPageprops(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const tableRef = useRef<DataTableRef>(null);

    /** -----------------------------
     *  Academic Year API
     * ----------------------------- */
    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    /** -----------------------------
     *  Filters
     * ----------------------------- */
    const [academicYearId, setAcademicYearId] = useState(0);
    const [reportType, setReportType] = useState('year_wise');
    const [showTable, setShowTable] = useState(false);

    /** -----------------------------
     *  Date Filters
     * ----------------------------- */
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    const [watchedFromDate, setWatchedFromDate] = useState<Date | null>(null);
    const [watchedToDate, setWatchedToDate] = useState<Date | null>(null);

    const academicIdParam = reportType === 'year_wise' ? academicYearId : 0;

    const fromDateParam = reportType === 'between_dates' && watchedFromDate ? format(watchedFromDate, 'yyyy-MM-dd') : null;

    const toDateParam = reportType === 'between_dates' && watchedToDate ? format(watchedToDate, 'yyyy-MM-dd') : null;

    const {
        data: response,
        isLoading,
        error,
        refetch: refetchAdmissionStudents
    } = usePreAdmissionRegistrationReport(academicIdParam, fromDateParam, toDateParam, searchParams);

    const tableProps = useDataTableProps({
        data: response?.data?.searchstudentDetails ?? []
    });

    const handleReport = () => {
        const payload: any = {};

        if (reportType === 'year_wise') {
            if (academicYearId) {
                payload.academicYearId = academicYearId;
            }
        }

        if (reportType === 'between_dates') {
            payload.fromDate = watchedFromDate ? format(watchedFromDate, 'yyyy-MM-dd') : null;

            payload.toDate = watchedToDate ? format(watchedToDate, 'yyyy-MM-dd') : null;
        }

        setShowTable(true);
        refetchAdmissionStudents();
    };

    const handleReset = () => {
        const list = academicYearOptions?.data ?? [];
        setAcademicYearId(list.length ? Number(list[0].asmaY_Id) : 0);

        setReportType('year_wise');
        setWatchedFromDate(null);
        setWatchedToDate(null);
        tableRef.current?.resetSelection();

        setShowTable(false); // Hide table
    };

    /** -----------------------------
     *  JSX
     * ----------------------------- */
    return (
        <div className='min-h-screen'>
            <div className='mb-3 flex w-full flex-col gap-6 rounded-xl border p-6 shadow-xl'>
                {/* ---------------------- Report Type ---------------------- */}
                <div className='flex flex-col items-center gap-3'>
                    <RadioGroup
                        value={reportType}
                        onValueChange={setReportType}
                        className='flex flex-wrap items-center justify-center gap-6'>
                        <div className='flex items-center gap-2'>
                            <RadioGroupItem value='year_wise' id='r1' />
                            <Label htmlFor='r1' className='cursor-pointer'>
                                Year Wise
                            </Label>
                        </div>

                        <div className='flex items-center gap-2'>
                            <RadioGroupItem value='between_dates' id='r2' />
                            <Label htmlFor='r2' className='cursor-pointer'>
                                Between Dates
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* ---------------------- Academic Year (Show only for Year Wise) ---------------------- */}
                {reportType === 'year_wise' && (
                    <div className='flex justify-center'>
                        <div className='flex w-full max-w-md items-center gap-4'>
                            <Label className='whitespace-nowrap font-semibold'>Academic Year</Label>
                            <Select
                                onValueChange={(value) => setAcademicYearId(Number(value))}
                                value={academicYearId ? String(academicYearId) : undefined}>
                                <SelectTrigger className='w-48'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading...
                                        </SelectItem>
                                    ) : academicYearError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading
                                        </SelectItem>
                                    ) : (
                                        academicYearOptions?.data?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* ---------------------- From & To Date (Show only for Between Dates) ---------------------- */}
                {reportType === 'between_dates' && (
                    <div className='mx-auto grid w-full max-w-md grid-cols-2 gap-4'>
                        {/* From Date */}
                        <div className='space-y-2'>
                            <Label>From Date</Label>
                            <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-full justify-start text-left'>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {watchedFromDate ? format(watchedFromDate, 'dd-MM-yyyy') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <DatePickerWithYear
                                        mode='single'
                                        selected={watchedFromDate || undefined}
                                        onDayClick={(day) => {
                                            setWatchedFromDate(day);
                                            setFromDateOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* To Date */}
                        <div className='space-y-2'>
                            <Label>To Date</Label>
                            <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant='outline' className='w-full justify-start text-left'>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {watchedToDate ? format(watchedToDate, 'dd-MM-yyyy') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <DatePickerWithYear
                                        mode='single'
                                        selected={watchedToDate || undefined}
                                        onDayClick={(day) => {
                                            setWatchedToDate(day);
                                            setToDateOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                )}

                {/* ---------------------- Action Buttons ---------------------- */}
                <div className='flex items-center justify-center gap-3 border-t pt-4'>
                    <Button variant='outline' onClick={handleReset}>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>

                    <Button type='button' onClick={handleReport}>
                        Report
                    </Button>

                    <Button variant='outline'>
                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                        Export to Excel
                    </Button>

                    <Button variant='outline'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                </div>
            </div>

            {/* ---------------------- Data Table ---------------------- */}
            {showTable && (
                <div className='container space-y-4 p-1'>
                    <CollapsibleSection
                        title='Student Yearly Attendance Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <GenericDataTable<IRigistrationReportList>
                            {...tableProps}
                            ref={tableRef}
                            columns={registrationColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            loadingMessage='Loading Registration Reports...'
                            noDataTitle='No Data Found'
                            noDataDescription='No Registration Reports found.'
                            errorTitle='Error Loading Registration Reports'
                        />
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
