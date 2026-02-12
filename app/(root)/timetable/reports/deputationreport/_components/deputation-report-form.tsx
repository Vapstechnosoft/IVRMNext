'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { deputationReportSchema } from '@/schemas/timetable/reports';
import { useDeputationAcademicYear } from '@/hooks/timetable/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Download, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import * as XLSX from 'xlsx';
import CountReportTable from './count-report-table';
import DetailsReportTable from './details-report-table';

type FormValues = z.infer<typeof deputationReportSchema.search>;

export default function DeputationReportForm() {
    const { data: academicYearData, isLoading: academicYearLoading } = useDeputationAcademicYear();
    const academicList = Array.isArray(academicYearData) ? academicYearData : (academicYearData as any)?.data || [];

    const [reportData, setReportData] = useState<any[]>([]);
    const [reportType, setReportType] = useState<'D' | 'C' | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(deputationReportSchema.search),
        defaultValues: {
            flag: 'D',
            fromdate: new Date(),
            todate: new Date()
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        reset,
        getValues
    } = form;

    // Initial value for asmaY_Id when academicList loads
    useEffect(() => {
        if (academicList && academicList.length > 0 && !getValues('asmaY_Id')) {
            const firstItem = academicList[0];
            const initialId = firstItem?.ttfG_Id || firstItem?.asmaY_Id;
            if (initialId) {
                setValue('asmaY_Id', initialId);
            }
        }
    }, [academicList, setValue, getValues]);

    const handleFormSubmit = async (data: FormValues) => {
        try {
            // Updated randomization for mock data
            if (data.flag === 'D') {
                const staffNames = ['Rahul Sharma', 'Anjali Gupta', 'Vikram Singh', 'Sneha Patil', 'Rohan Mehra', 'Priya Iyer', 'Amit Verma', 'Sonia Das'];
                const classes = ['10th', '9th', '8th', '7th', '6th'];
                const sections = ['DIVISION A', 'DIVISION B', 'DIVISION C', 'DIVISION D'];
                const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                const periods = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                const remarks = ['Medical Leave', 'Late Duty', 'Personal Work', 'Emergency', 'School Duty', 'Official Work'];

                const mockDetails = Array.from({ length: 15 }, () => ({
                    ttsd_date: new Date().toISOString(),
                    asmcL_ClassName: classes[Math.floor(Math.random() * classes.length)],
                    asmC_SectionName: sections[Math.floor(Math.random() * sections.length)],
                    ttmD_DayName: days[Math.floor(Math.random() * days.length)],
                    ttmP_PeriodName: periods[Math.floor(Math.random() * periods.length)],
                    absentStaff: staffNames[Math.floor(Math.random() * staffNames.length)],
                    deptStaff: staffNames[Math.floor(Math.random() * staffNames.length)],
                    ttsD_Remarks: remarks[Math.floor(Math.random() * remarks.length)]
                }));
                setReportData(mockDetails);
            } else {
                const classes = ['10th', '9th', '8th', '7th', '6th'];
                const sections = ['DIVISION A', 'DIVISION B', 'DIVISION C', 'DIVISION D'];

                const mockCount = [];
                for (const cls of classes) {
                    for (const sec of sections) {
                        mockCount.push({
                            asmcL_ClassName: cls,
                            asmC_SectionName: sec,
                            count: Math.floor(Math.random() * 15) + 1
                        });
                    }
                }
                setReportData(mockCount);
            }
            setReportType(data.flag as 'D' | 'C');
            toast.success('Report generated successfully (Randomized Data)');
        } catch (error) {
            toast.error("Failed to generate report");
        }
    };

    const handleCancel = () => {
        reset({
            flag: 'D',
            asmaY_Id: academicList && academicList.length > 0 ? (academicList[0].ttfG_Id || academicList[0].asmaY_Id) : undefined,
            fromdate: new Date(),
            todate: new Date()
        });
        setReportData([]);
        setReportType(null);
    };

    const handleExport = () => {
        if (reportData.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Deputation Report');
        XLSX.writeFile(workbook, `Deputation_Report_${reportType === 'D' ? 'Details' : 'Count'}.xlsx`);
    };

    const handlePrint = () => {
        if (!componentRef.current) return;
        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) return;

        const content = componentRef.current.innerHTML;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Deputation Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 2px solid #7e22ce; }
                        th, td { border: 1px solid #9ca3af; padding: 8px; text-align: center; font-size: 12px; }
                        th { background-color: #7e22ce; color: white; font-weight: bold; }
                        h3 { text-align: center; color: #15803d; margin-bottom: 20px; font-size: 20px; }
                        .no-print { display: none; }
                        button { display: none !important; }
                        input { display: none !important; }
                    </style>
                </head>
                <body>
                    <h3>Deputation ${reportType === 'D' ? 'Details' : 'Count'} Report</h3>
                    ${content}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className='space-y-6'>
            <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString() || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicList?.map((item: any) => {
                                            const id = item.ttfG_Id || item.asmaY_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString() || ''}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col space-y-2'>
                            <Label>
                                From Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='fromdate'
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.fromdate && <span className='text-red-500 text-sm'>{errors.fromdate.message}</span>}
                        </div>

                        <div className='flex flex-col space-y-2'>
                            <Label>
                                To Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='todate'
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={'outline'}
                                                className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) => date > new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.todate && <span className='text-red-500 text-sm'>{errors.todate.message}</span>}
                        </div>
                    </div>
                </div>

                <div className='flex justify-center'>
                    <Controller
                        control={control}
                        name='flag'
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className='flex flex-row space-x-6 rounded-md border bg-muted/20 p-4'>
                                <div className='flex items-center space-x-3 space-y-0'>
                                    <RadioGroupItem value='D' id='r1' />
                                    <Label htmlFor='r1' className='cursor-pointer font-normal'>DETAILS</Label>
                                </div>
                                <div className='flex items-center space-x-3 space-y-0'>
                                    <RadioGroupItem value='C' id='r2' />
                                    <Label htmlFor='r2' className='cursor-pointer font-normal'>COUNT</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' disabled={isSubmitting} className='bg-orange-600 hover:bg-orange-600'>
                        <Search className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button type='button' variant='outline' onClick={handleCancel}>
                        <X className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </form>

            {reportData.length > 0 && (
                <CollapsibleSection title='Report Grid' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <div className='no-print flex items-center justify-between bg-gray-50 px-4 py-2 text-sm'>
                        <span className='font-medium text-gray-700'>Total Records: {reportData.length}</span>
                        <div className='flex items-center gap-3'>
                            <Button onClick={handlePrint} size='sm' className='bg-purple-600 hover:bg-purple-700'>
                                <Printer className='mr-2 h-4 w-4' /> Print
                            </Button>
                            <Button
                                onClick={handleExport}
                                size='sm'
                                variant='outline'
                                className='gap-2 border-green-600 text-green-700 hover:bg-green-50'>
                                <Download className='h-4 w-4' /> Export Excel
                            </Button>
                        </div>
                    </div>

                    <div className='mt-6 rounded-md border bg-white p-4' ref={componentRef}>
                        {reportType === 'D' && <DetailsReportTable data={reportData} />}
                        {reportType === 'C' && <CountReportTable data={reportData} />}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
