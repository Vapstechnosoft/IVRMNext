'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CalendarIcon, RotateCcw, Save } from 'lucide-react';

import { use, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { CalendarYear } from '@/components/ui/calendar_year';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useAttendanceReport } from '@/hooks/admission/preadmission/useReports';
import { cn } from '@/lib/utils';
import { getExcelOverallAttendanceReport } from '@/server/admission/preadmission/reports/month_end_report';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { type IOverallDailyAttendanceReport, getOverallDailyAttendanceColumns } from './_components/columns';

// allow dates up to today (today or any previous day)
const isBeforeOrEqualLocalDate = (a: Date, b: Date) =>
    a.getFullYear() < b.getFullYear() ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth()) ||
    (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() <= b.getDate());

// Local schema for this form (allow today and previous dates)
const attendanceAbsentSmsSchema = z.object({
    frequency: z.enum(['0', '1']).default('0'),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    from_date: z
        .string()
        .nonempty('Date is required')
        .refine((val) => {
            const d = new Date(val);
            return isBeforeOrEqualLocalDate(d, new Date());
        }, 'Only today or previous dates are allowed')
});
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type FormFields = z.infer<typeof attendanceAbsentSmsSchema>;

export default function OverallDailyAttendanceReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const tableRef = useRef<DataTableRef>(null);
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(attendanceAbsentSmsSchema),
        defaultValues: {
            frequency: '0',
            from_date: new Date().toISOString()
        }
    });

    // Dropdown data
    const { data: academicYears, isLoading: ayLoading } = useAcademicYearDropdown();
    const asmaY_Id = watch('asmaY_Id');
    const from_date = watch('from_date');
    const frequency = watch('frequency');
    const { data: response, isLoading: reportLoading, error, refetch } = useAttendanceReport(asmaY_Id, from_date, frequency, searchParams);

    const columns = useMemo(() => getOverallDailyAttendanceColumns(), []);

    const tableProps = useDataTableProps({
        ...response,
        data: response?.data || []
    });

    const onSubmit = async () => {
        if (!asmaY_Id || asmaY_Id === 0) {
            toast.error('Please select Academic Year');
            return;
        }
        setIsLoading(true);
        setShowReport(true);
        try {
            const { data: result } = await refetch();
            if (result?.data && Array.isArray(result.data) && result.data.length > 0) {
                toast.success(result.message || 'Report generated successfully');
            } else {
                toast.error('No data found for the selected criteria');
            }
        } catch {
            if (!response) toast.error('Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadExcel = async () => {
        try {
            if (!asmaY_Id || !from_date || !frequency) {
                toast.error('Please fill all required fields!');
                return;
            }

            const response = await getExcelOverallAttendanceReport(asmaY_Id, from_date, frequency, searchParams);

            // Ensure we have a Blob
            const blob =
                response instanceof Blob
                    ? response
                    : new Blob([new Uint8Array(response)], {
                          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                      });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'OverAllDailyAttendance.xlsx';
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(url);
            }, 100);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    const handleReset = () => {
        reset();
        setShowReport(false);
        tableRef.current?.resetSelection();
        toast.success('Filters reset successfully');
    };

    return (
        <div className='min-h-screen p-4'>
            <div className='container space-y-4'>
                <CollapsibleSection
                    title='Overall Daily Attendance Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* ──────────────── RADIO BUTTONS ──────────────── */}
                        <div className='mb-6 text-center'>
                            <div className='mt-3 mb-6 flex justify-center'>
                                <Controller
                                    name='frequency'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='0' id='once' />
                                                <Label htmlFor='once'>
                                                    Daily Once<span className='text-red-500'>*</span>
                                                </Label>
                                            </div>

                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id='twice' />
                                                <Label htmlFor='twice'>
                                                    Daily Twice<span className='text-red-500'>*</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {errors.frequency && <FormError>{errors.frequency.message}</FormError>}
                            </div>
                        </div>

                        {/* ──────────────── Filters Grid ──────────────── */}
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
                            {/* Academic Year */}
                            <div className='flex flex-col gap-1.5'>
                                <Label>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ayLoading ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : (
                                                    academicYears?.data?.map((y) => (
                                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                            </div>

                            {/* Date Picker */}
                            <Controller
                                name='from_date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'From_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'From_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.from_date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Pick a date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        if (!isBeforeOrEqualLocalDate(date, new Date())) {
                                                            toast.error('Please select today or a previous date');
                                                            return;
                                                        }
                                                        date && field.onChange(date.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* ──────────────── Action Buttons ──────────────── */}
                        <div className='mt-6 flex flex-wrap justify-start gap-3 border-t pt-4'>
                            <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting} className='w-fit'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                Reset
                            </Button>

                            <Button type='submit' disabled={isSubmitting} isLoading={isLoading} className='w-fit'>
                                <Save className='mr-2 h-4 w-4' />
                                Report
                            </Button>

                            {showReport && response?.data && response.data.length > 0 && (
                                <Button type='button' onClick={downloadExcel} className='w-fit'>
                                    Export to Excel
                                </Button>
                            )}
                        </div>
                    </form>
                </CollapsibleSection>

                {/* ──────────────── Data Table ──────────────── */}
                {showReport && (
                    <CollapsibleSection
                        title='Report Results'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <GenericDataTable<IOverallDailyAttendanceReport>
                            {...tableProps}
                            ref={tableRef}
                            columns={columns}
                            isLoading={reportLoading}
                            error={error}
                            showViewOptions={false}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            loadingMessage='Loading attendance report...'
                            noDataTitle='No Data Found'
                            noDataDescription='No attendance records found for the selected criteria.'
                            errorTitle='Error Loading Report'
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
