'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibTransactionReportInitialData } from '@/hooks/library/reports/useLibTransactionReport';
import type { ILibTransactionReportRequest } from '@/types/library/reports/lib-transaction-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X, Printer, FileSpreadsheet } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import * as z from 'zod';

const formSchema = z.object({
    LMAL_Id: z.preprocess((val) => (val ? Number(val) : 0), z.number().min(1, 'Select Library Name')),
    ASMAY_Id: z.preprocess((val) => (val ? Number(val) : 0), z.number().min(1, 'Select Academic Year')),
    statuscount: z.boolean().default(false),
    Issue_Date: z.date({ required_error: 'From Date is required' }),
    IssueToDate: z.date({ required_error: 'To Date is required' })
});

interface ReportFormProps {
    onSearch: (data: ILibTransactionReportRequest) => void;
    isLoading: boolean;
    onPrint: () => void;
    onExport: () => void;
    onCancel: () => void;
    hasData: boolean;
}

export const ReportForm = ({ onSearch, isLoading, onPrint, onExport, onCancel, hasData }: ReportFormProps) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useLibTransactionReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;
    
    const {
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            statuscount: false
        }
    });

    useEffect(() => {
        if (initialData?.msterliblist1?.length === 1) {
            setValue('LMAL_Id', initialData.msterliblist1[0].lmaL_Id);
        }
        if (initialData?.yearlist?.length === 1) {
            setValue('ASMAY_Id', initialData.yearlist[0].asmaY_Id);
        }
    }, [initialData, setValue]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ...values,
            Issue_Date: format(values.Issue_Date, "yyyy-MM-dd'T'HH:mm:ss"),
            IssueToDate: format(values.IssueToDate, "yyyy-MM-dd'T'HH:mm:ss")
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
                                name='LMAL_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select Library' />
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
                            {errors.LMAL_Id && <p className='text-xs text-destructive mt-1'>{errors.LMAL_Id.message}</p>}
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
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select Year' />
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
                            {errors.ASMAY_Id && <p className='text-xs text-destructive mt-1'>{errors.ASMAY_Id.message}</p>}
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
                                name='Issue_Date'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter From date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.Issue_Date && <p className='text-xs text-destructive mt-1'>{errors.Issue_Date.message}</p>}
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
                                name='IssueToDate'
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value}
                                        setDate={field.onChange}
                                        placeholder='Enter To date'
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    />
                                )}
                            />
                            {errors.IssueToDate && <p className='text-xs text-destructive mt-1'>{errors.IssueToDate.message}</p>}
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
                        onCancel();
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
