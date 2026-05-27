'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryMonthEndReportInitialData } from '@/hooks/library/reports/useLibraryMonthEndReport';
import type { ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Academic Year is required')),
    IVRM_Month_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Month is required')),
    LMRA_Id: z.preprocess((val) => (val === '' || val === undefined ? 0 : Number(val)), z.number().optional()),
    IE_Name: z.string().optional(),
    year: z.string().min(1, 'Year is required')
});

interface ReportFormProps {
    onSearch: (data: ILibraryMonthEndReportRequest) => void;
    onPrint?: () => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, onPrint, isLoading }: ReportFormProps) => {
    const { data: monthEndData, isLoading: isInitialLoading } = useLibraryMonthEndReportInitialData();
    const initialData = (monthEndData as any)?.data || monthEndData;
    
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {}
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ASMAY_Id: values.ASMAY_Id,
            IVRM_Month_Id: values.IVRM_Month_Id,
            year: values.year,
            LMRA_Id: values.LMRA_Id,
            IE_Name: values.IE_Name
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-5xl space-y-6 p-8 bg-white rounded-lg shadow-sm border border-t-4 border-t-orange-400'>
            
            <div className='flex justify-center mb-6'>
                <div className='w-full max-w-2xl space-y-6'>
                    
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
                                    <Select
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue('year', '');
                                        }}
                                        value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.acdlist) &&
                                                initialData?.acdlist?.map((item: any) => (
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

                    {/* Month */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Month:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='IVRM_Month_Id'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(initialData?.monthlist) &&
                                                initialData?.monthlist?.map((item: any) => (
                                                    <SelectItem key={item.ivrM_Month_Id} value={item.ivrM_Month_Id.toString()}>
                                                        {item.ivrM_Month_Name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.IVRM_Month_Id && <p className='text-xs text-destructive mt-1'>{errors.IVRM_Month_Id.message}</p>}
                        </div>
                    </div>

                    {/* IE (Text Field) */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            IE:
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='IE_Name'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder='Enter IE Name'
                                        className='w-full border-muted-foreground/30'
                                    />
                                )}
                            />
                            {errors.IE_Name && <p className='text-xs text-destructive mt-1'>{errors.IE_Name.message}</p>}
                        </div>
                    </div>

                    {/* Year */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            Year:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='year'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder='Enter Year (e.g. 2024)'
                                        className='w-full border-muted-foreground/30'
                                    />
                                )}
                            />
                            {errors.year && <p className='text-xs text-destructive mt-1'>{errors.year.message}</p>}
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
                    onClick={() => reset()}
                    disabled={isLoading}
                >
                    <X className='mr-1.5 h-3.5 w-3.5' />
                    CANCEL
                </Button>
                {onPrint && (
                    <Button
                        type='button'
                        className='w-auto h-8 px-8 py-1 text-xs min-w-[120px] bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm rounded-sm'
                        onClick={onPrint}
                        disabled={isLoading}
                    >
                        <Printer className='mr-1.5 h-3.5 w-3.5' />
                        PRINT
                    </Button>
                )}
            </div>
        </form>
    );
};
