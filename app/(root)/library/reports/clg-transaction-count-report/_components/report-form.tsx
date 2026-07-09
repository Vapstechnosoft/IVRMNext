'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCLGTransactionCountReportInitialData } from '@/hooks/library/reports/useCLGTransactionCountReport';
import type { ICLGTransactionCountReportRequest } from '@/types/library/reports/clg-transaction-count-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X, Printer, FileSpreadsheet } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import * as z from 'zod';

const formSchema = z.object({
    lmaL_Id: z.preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number({ required_error: 'Select Library', invalid_type_error: 'Select Library' }).min(1, 'Select Library')
    ),
    asmaY_Id: z.preprocess(
        (val) => (val === undefined || val === '' ? undefined : Number(val)),
        z.number({ required_error: 'Select Academic Year', invalid_type_error: 'Select Academic Year' }).min(1, 'Select Academic Year')
    ),
    statuscount: z.boolean().default(false),
    issue_Date: z.date({ required_error: 'From Date is required' }),
    issueToDate: z.date({ required_error: 'To Date is required' }),
    type: z.string().default('Student')
});

interface ReportFormProps {
    onSearch: (data: ICLGTransactionCountReportRequest) => void;
    isLoading: boolean;
    onPrint?: () => void;
    onExport?: () => void;
    onCancel?: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useCLGTransactionCountReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statuscount: false
        }
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ...values,
            issue_Date: format(values.issue_Date, "yyyy-MM-dd'T'HH:mm:ss"),
            issueToDate: format(values.issueToDate, "yyyy-MM-dd'T'HH:mm:ss")
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'>
            
            {/* Main Selection Row */}
            <div className='flex justify-center'>
                <div className='w-full max-w-2xl space-y-4'>
                    
                    {/* Library Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Library Name:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='lmaL_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.msterliblist1) &&
                                                initialData?.msterliblist1?.map((item: any) => (
                                                    <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                                        {item.lmaL_LibraryName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.lmaL_Id && <p className='text-xs text-destructive mt-1'>{errors.lmaL_Id.message}</p>}
                        </div>
                    </div>

                    {/* Academic Year */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Academic Year:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.yearlist) &&
                                                initialData?.yearlist?.map((item: any) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <p className='text-xs text-destructive mt-1'>{errors.asmaY_Id.message}</p>}
                        </div>
                    </div>

                    {/* Status Count Checkbox */}
                    <div className='flex items-center gap-4'>
                        <div className='min-w-[150px]'></div>
                        <div className='flex-1 flex items-center space-x-2 pt-1'>
                            <Controller
                                control={control}
                                name='statuscount'
                                render={({ field }) => (
                                    <Checkbox 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange}
                                        id='status-count-checkbox'
                                    />
                                )}
                            />
                            <Label htmlFor='status-count-checkbox' className='font-normal cursor-pointer'>
                                Status Count
                            </Label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Selection Section */}
            <div className='w-full max-w-4xl mx-auto mt-8'>
                <Label className='font-semibold text-[#4251b1] block mb-4 uppercase text-xs tracking-wider'>Issue Date Between :-</Label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    {/* From Date */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right text-sm font-medium'>
                            From Date <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='issue_Date'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter From date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.issue_Date && <p className='text-xs text-destructive mt-1'>{errors.issue_Date.message}</p>}
                        </div>
                    </div>

                    {/* To Date */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[100px] text-right text-sm font-medium'>
                            To Date <span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='issueToDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter To date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.issueToDate && <p className='text-xs text-destructive mt-1'>{errors.issueToDate.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <hr className='my-6 border-muted-foreground/20' />

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4'>
                <Button
                    type='submit'
                    className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#4251b1] hover:bg-[#35418e] text-white shadow-sm rounded-sm'
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' /> : <Search className='mr-1.5 h-3.5 w-3.5' />}
                    REPORT
                </Button>
                <Button
                    type='button'
                    className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#ff5a30] hover:bg-[#e64d26] text-white shadow-sm rounded-sm'
                    onClick={() => {
                        reset();
                        onCancel?.();
                    }}
                    disabled={isLoading}
                >
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>

                {hasData && (
                    <>
                        <Button 
                            type='button' 
                            onClick={onPrint}
                            className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#4251b1] hover:bg-[#35418e] text-white shadow-sm rounded-sm'
                        >
                            <Printer className='mr-1.5 h-3.5 w-3.5' />
                            PRINT
                        </Button>
                        <Button 
                            type='button' 
                            onClick={onExport}
                            className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#4251b1] hover:bg-[#35418e] text-white shadow-sm rounded-sm'
                        >
                            <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                            EXCEL
                        </Button>
                    </>
                )}
            </div>
        </form>
    );
};
