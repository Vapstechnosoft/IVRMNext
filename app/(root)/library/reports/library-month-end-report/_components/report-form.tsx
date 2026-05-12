'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLibraryMonthEndReportInitialData } from '@/hooks/library/reports/useLibraryMonthEndReport';
import type { ILibraryMonthEndReportRequest } from '@/types/library/reports/library-month-end-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ASMAY_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Academic Year is required')),
    IVRM_Month_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Month is required')),
    ieName: z.string().optional(),
    year: z.string().min(1, 'Year is required')
});

interface ReportFormProps {
    onSearch: (data: ILibraryMonthEndReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialDataWrapper, isLoading: isInitialLoading } = useLibraryMonthEndReportInitialData();
    const initialData = (initialDataWrapper as any)?.data || initialDataWrapper;
    
    const [yearsList, setYearsList] = useState<string[]>([]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {}
    });

    const selectedAcademicYearId = watch('ASMAY_Id');

    useEffect(() => {
        if (selectedAcademicYearId && initialData?.acdlist) {
            const selectedYear = initialData.acdlist.find((y: any) => y.asmaY_Id === selectedAcademicYearId);
            if (selectedYear) {
                const yearParts = selectedYear.asmaY_Year.split('-');
                if (yearParts.length >= 1) {
                    const y1 = yearParts[0];
                    const y2 = yearParts[1];
                    const tempYears = [];
                    if (y1) tempYears.push(y1);
                    if (y2) tempYears.push(y2);
                    setYearsList(tempYears);
                } else {
                    setYearsList([selectedYear.asmaY_Year]);
                }
            }
        } else {
            setYearsList([]);
        }
    }, [selectedAcademicYearId, initialData]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ASMAY_Id: values.ASMAY_Id,
            IVRM_Month_Id: values.IVRM_Month_Id,
            year: values.year,
            ieName: values.ieName || ''
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

                    {/* IE Name */}
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right font-medium text-sm'>
                            IE Name:
                        </Label>
                        <div className='flex-1'>
                            <Controller
                                control={control}
                                name='ieName'
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value ?? ''}
                                        placeholder='Enter IE Name'
                                        className='w-full border-muted-foreground/30'
                                    />
                                )}
                            />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className='w-full border-muted-foreground/30'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsList.map((y) => (
                                                <SelectItem key={y} value={y}>
                                                    {y}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
            </div>
        </form>
    );
};
