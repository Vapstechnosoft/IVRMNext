'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, FileSpreadsheet, Printer, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { useStudentBirthdayReportDetails } from '@/hooks/admission/preadmission/useReports';
import { getStudentBirthdayReportDetails } from '@/server/admission/preadmission/reports/student_birthday_report';
import { birthdayColumns } from './_components/columns';
import { StudentBirthdayPrint } from './_components/student-birthday-print';

const schema = z.object({
    selectionType: z.string().default('1'), // 1: Between Days, 0: Month Wise
    studentStatus: z.string().default('S'), // S: Studying, L: Left
    month: z.string().optional(),
    fromDate: z.date().nullable().optional(),
    toDate: z.date().nullable().optional()
}).refine((data) => {
    if (data.selectionType === '0' && !data.month) return false;
    if (data.selectionType === '1' && (!data.fromDate || !data.toDate)) return false;
    return true;
}, {
    message: "Required fields are missing",
    path: ["month"] // Placeholder path
});

type FormFields = z.infer<typeof schema>;

const monthList = [
    { value: '01', label: 'JANUARY' },
    { value: '02', label: 'FEBRUARY' },
    { value: '03', label: 'MARCH' },
    { value: '04', label: 'APRIL' },
    { value: '05', label: 'MAY' },
    { value: '06', label: 'JUNE' },
    { value: '07', label: 'JULY' },
    { value: '08', label: 'AUGUST' },
    { value: '09', label: 'SEPTEMBER' },
    { value: '10', label: 'OCTOBER' },
    { value: '11', label: 'NOVEMBER' },
    { value: '12', label: 'DECEMBER' }
];

export default function StudentBirthdayReportPage() {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            selectionType: '1',
            studentStatus: 'S'
        }
    });

    const selectionType = useWatch({ control, name: 'selectionType' });
    const fromDate = useWatch({ control, name: 'fromDate' });
    const toDate = useWatch({ control, name: 'toDate' });
    const month = useWatch({ control, name: 'month' });

    const [showGrid, setShowGrid] = useState(false);
    const [filterPayload, setFilterPayload] = useState<any>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [allReportData, setAllReportData] = useState<any[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    const { data: reportData, isLoading, refetch } = useStudentBirthdayReportDetails(filterPayload, undefined, showGrid);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'StudentBirthdayReport'
    });

    const onSubmit = (data: FormFields) => {
        const payload = {
            months: data.selectionType === '0' ? parseInt(data.month || '0') : '',
            flag: data.studentStatus,
            all1: data.selectionType,
            Fromdate: data.selectionType === '1' ? format(data.fromDate!, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            Todate: data.selectionType === '1' ? format(data.toDate!, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
        };
        setFilterPayload(payload);
        setAllReportData([]);
        setShowGrid(true);
        refetch();
    };

    const handleExportExcel = async () => {
        let dataToExport = selectedRows.length > 0 ? selectedRows : allReportData;

        if (dataToExport.length === 0 && reportData) {
            toast.loading('Fetching all records for export...', { id: 'export-all' });
            const total = (reportData as any).total || (reportData as any).data?.length || 0;
            const response = await getStudentBirthdayReportDetails(filterPayload, { page: 1, page_size: total });
            if (response?.success && response.data) {
                dataToExport = response.data;
                setAllReportData(response.data);
                toast.success('Ready to export', { id: 'export-all' });
            } else {
                toast.error('Failed to fetch records', { id: 'export-all' });
                return;
            }
        }

        if (dataToExport.length === 0) {
            toast.error('No records to export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(dataToExport.map((row: any, index: number) => ({
            'SL.No': index + 1,
            'Student Name': row.studentname,
            'Adm. No.': row.admno,
            'Class': row.classname,
            'Section': row.sectionname,
            'Date of Birth': row.amst_dob ? format(new Date(row.amst_dob), 'dd-MM-yyyy') : '',
            'Address': row.stdaddress
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'BirthdayReport');
        XLSX.writeFile(wb, `StudentBirthdayReport_${format(new Date(), 'ddMMyyyy')}.xlsx`);
    };

    const handlePrintClick = async () => {
        if (selectedRows.length === 0 && (!(reportData as any)?.data || (reportData as any).data.length === 0)) {
            toast.error('No records to print');
            return;
        }

        if (selectedRows.length === 0 && allReportData.length === 0 && reportData) {
            setIsPrinting(true);
            toast.loading('Fetching all records for print...', { id: 'print-all' });
            const total = (reportData as any).total || (reportData as any).data?.length || 0;
            const response = await getStudentBirthdayReportDetails(filterPayload, { page: 1, page_size: total });
            if (response?.success && response.data) {
                setAllReportData(response.data);
                toast.success('Ready to print', { id: 'print-all' });
                setTimeout(() => {
                    handlePrint();
                    setIsPrinting(false);
                }, 500);
            } else {
                toast.error('Failed to fetch records', { id: 'print-all' });
                setIsPrinting(false);
            }
        } else {
            handlePrint();
        }
    };

    return (
        <div className='flex flex-col gap-6 p-4'>
            <Card>
                <CardHeader>
                    <CardTitle>Student Birthday Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Selection Type */}
                            <div className='space-y-3 rounded-lg border p-4'>
                                <Label className='text-sm font-medium'>Report Type</Label>
                                <Controller
                                    name='selectionType'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className='flex flex-wrap gap-4'
                                        >
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id='r1' />
                                                <Label htmlFor='r1' className='font-normal cursor-pointer'>Between Days</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='0' id='r0' />
                                                <Label htmlFor='r0' className='font-normal cursor-pointer'>Month Wise</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* Student Status */}
                            <div className='space-y-3 rounded-lg border p-4'>
                                <Label className='text-sm font-medium'>Student Status</Label>
                                <Controller
                                    name='studentStatus'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className='flex gap-4'
                                        >
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='S' id='sS' />
                                                <Label htmlFor='sS' className='font-normal cursor-pointer'>Studying</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='L' id='sL' />
                                                <Label htmlFor='sL' className='font-normal cursor-pointer'>Left</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {selectionType === '0' && (
                                <div className='space-y-2'>
                                    <Label>Month <span className='text-destructive'>*</span></Label>
                                    <Controller
                                        name='month'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="--Select--" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthList.map((m) => (
                                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.month && <FormError>{errors.month.message}</FormError>}
                                </div>
                            )}

                            {selectionType === '1' && (
                                <>
                                    <div className='space-y-2'>
                                        <Label>From Date <span className='text-destructive'>*</span></Label>
                                        <Controller
                                            name='fromDate'
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <DatePickerWithYear
                                                            mode='single'
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>To Date <span className='text-destructive'>*</span></Label>
                                        <Controller
                                            name='toDate'
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <DatePickerWithYear
                                                            mode='single'
                                                            selected={field.value ?? undefined}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => fromDate ? date < fromDate : false}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='flex flex-wrap gap-4 border-t pt-6'>
                            <Button type='submit' isLoading={isLoading}>
                                <Search className='mr-2 h-4 w-4' />
                                Submit
                            </Button>
                            <Button type='button' variant='outline' onClick={() => { reset(); setShowGrid(false); setAllReportData([]); }}>
                                Cancel
                            </Button>
                            {(reportData as any)?.data?.length > 0 && (
                                <>
                                    <Button type='button' variant='success' onClick={handleExportExcel}>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Export to Excel
                                    </Button>
                                    <Button type='button' variant='gradient' onClick={handlePrintClick} disabled={isPrinting}>
                                        <Printer className='mr-2 h-4 w-4' />
                                        {isPrinting ? 'Preparing...' : 'Print'}
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {showGrid && (
                <CollapsibleSection title='Student Birthday Report Details' defaultOpen={true}>
                    <GenericDataTable
                        columns={birthdayColumns}
                        data={(reportData as any)?.data || []}
                        isLoading={isLoading}
                        totalItems={(reportData as any)?.total || (reportData as any)?.data?.length || 0}
                        maxSelectableRows={1000}
                        onRowSelectionChange={(rows) => setSelectedRows(rows)}
                    />
                </CollapsibleSection>
            )}

            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 0,
                    height: 0,
                    overflow: 'visible',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }}>
                <StudentBirthdayPrint
                    ref={printRef}
                    data={{
                        ...reportData as any,
                        data: selectedRows.length > 0 ? selectedRows : allReportData.length > 0 ? allReportData : (reportData as any)?.data || []
                    }}
                    monthName={monthList.find(m => m.value === month)?.label}
                    fromDate={fromDate}
                    toDate={toDate}
                />
            </div>
        </div>
    );
}
