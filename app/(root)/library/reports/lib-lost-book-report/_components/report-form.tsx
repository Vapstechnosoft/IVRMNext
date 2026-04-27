'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useLibLostBookReportInitialData } from '@/hooks/library/reports/useLibLostBookReport';
import type { ILibLostBookReportRequest } from '@/types/library/reports/lib-lost-book-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Search, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z
    .object({
        LMAL_Id: z.preprocess((val) => Number(val), z.number().min(1, 'Library Name is required')),
        BNBFlg: z.enum(['Book', 'Non-Book']),
        BookType: z.enum(['Issue', 'Reference']),
        datewised: z.boolean().default(false),
        Fromdate: z.date().optional(),
        ToDate: z.date().optional()
    })
    .refine(
        (data) => {
            if (data.datewised) {
                return !!data.Fromdate && !!data.ToDate;
            }
            return true;
        },
        {
            message: "Both dates are required when date range is enabled",
            path: ['Fromdate']
        }
    );

interface ReportFormProps {
    onSearch: (data: ILibLostBookReportRequest) => void;
    isLoading: boolean;
}

export const ReportForm = ({ onSearch, isLoading }: ReportFormProps) => {
    const { data: initialData, isLoading: isInitialLoading } = useLibLostBookReportInitialData();

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            BNBFlg: 'Book',
            BookType: 'Issue',
            datewised: false
        }
    });

    const isDateEnabled = watch('datewised');

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSearch({
            ...values,
            Fromdate: values.Fromdate ? values.Fromdate.toISOString() : undefined,
            ToDate: values.ToDate ? values.ToDate.toISOString() : undefined
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mx-auto max-w-4xl space-y-8 p-4'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                {/* Left Side - Selections */}
                <div className='space-y-6'>
                    <div className='space-y-2'>
                        <Label className='text-sm font-semibold'>
                            Library Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='LMAL_Id'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                    <SelectTrigger className='h-10'>
                                        <SelectValue placeholder='Select Library' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialData?.lib_list?.map((item) => (
                                            <SelectItem key={item.lmaL_Id} value={item.lmaL_Id.toString()}>
                                                {item.lmaL_LibraryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.LMAL_Id && <p className='text-xs text-destructive'>{errors.LMAL_Id.message}</p>}
                    </div>

                    <div className='flex flex-wrap gap-4'>
                        <div className='flex-1 space-y-3 rounded-lg border bg-card p-4 shadow-sm'>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Entity Type</Label>
                            <Controller
                                control={control}
                                name='BNBFlg'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Book' id='r-book' />
                                            <Label htmlFor='r-book' className='font-normal'>BOOK</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Non-Book' id='r-nonbook' />
                                            <Label htmlFor='r-nonbook' className='font-normal'>NON-BOOK</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='flex-1 space-y-3 rounded-lg border bg-card p-4 shadow-sm'>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>Book Purpose</Label>
                            <Controller
                                control={control}
                                name='BookType'
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Issue' id='r-issue' />
                                            <Label htmlFor='r-issue' className='font-normal'>ISSUE</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Reference' id='r-reference' />
                                            <Label htmlFor='r-reference' className='font-normal'>REFERENCE</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side - Date Filter */}
                <div className='flex flex-col space-y-4 rounded-lg border bg-muted/30 p-6'>
                    <div className='flex items-center justify-between border-b pb-3'>
                        <div className='flex items-center space-x-3'>
                            <Controller
                                control={control}
                                name='datewised'
                                render={({ field }) => (
                                    <Checkbox 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                        id='datewised'
                                        className='h-5 w-5'
                                    />
                                )}
                            />
                            <Label htmlFor='datewised' className='text-sm font-semibold cursor-pointer'>
                                Between Entry Date
                            </Label>
                        </div>
                    </div>

                    {isDateEnabled && (
                        <div className='grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300'>
                            <div className='space-y-2'>
                                <Label className='text-xs font-medium'>From Date</Label>
                                <Controller
                                    control={control}
                                    name='Fromdate'
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={field.onChange}
                                            placeholder='Select From Date'
                                        />
                                    )}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs font-medium'>To Date</Label>
                                <Controller
                                    control={control}
                                    name='ToDate'
                                    render={({ field }) => (
                                        <DatePicker
                                            date={field.value}
                                            setDate={field.onChange}
                                            placeholder='Select To Date'
                                        />
                                    )}
                                />
                            </div>
                            {(errors.Fromdate || errors.ToDate) && (
                                <p className='text-xs text-destructive mt-1 font-medium'>
                                    {errors.Fromdate?.message || errors.ToDate?.message}
                                </p>
                            )}
                        </div>
                    )}
                    {!isDateEnabled && (
                        <div className='flex h-32 items-center justify-center rounded border border-dashed text-sm text-muted-foreground bg-background/50'>
                            Select checkbox to filter by date
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center justify-center gap-4 pt-4'>
                <Button 
                    type='submit' 
                    size='lg'
                    className='min-w-[140px] shadow-md hover:shadow-lg transition-all duration-200'
                    disabled={isLoading || isInitialLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Search className='mr-2 h-4 w-4' />
                            Report
                        </>
                    )}
                </Button>
                <Button 
                    type='button' 
                    variant='outline' 
                    size='lg'
                    className='min-w-[140px]'
                    onClick={() => reset()}
                    disabled={isLoading}
                >
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
            </div>
        </form>
    );
};
