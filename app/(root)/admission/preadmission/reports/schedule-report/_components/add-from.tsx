'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { scheduleReportSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useScheduleReportInitialDetails, useScheduleList } from '@/hooks/admission/preadmission/useReports';
import type { 
    IScheduleReportInitialDetailsResponse, 
    IScheduleListResponse 
} from '@/types/admission/preadmission/reports';

type FormFields = z.infer<typeof scheduleReportSchema>;

interface AddScheduleReportFormProps {
    onFilterChange?: (payload: any, reset?: boolean) => void;
}

/**
 * Filter form for generating the Schedule Report.
 */
export default function AddScheduleReportForm({
    onFilterChange
}: AddScheduleReportFormProps) {
    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(scheduleReportSchema),
        defaultValues: {
            autostudent: false,
            yearwiseorbtwdates: 'yearwise',
            asmcL_Id: 0,
            oralwrittenschedule: 'oral',
            hrsrt: '12hrrt'
        }
    });

    const watchYearwise = watch('yearwiseorbtwdates');
    const watchTestType = watch('oralwrittenschedule');
    const watchAsmayId = watch('asmaY_Id');

    const { data: initialDetails } = useScheduleReportInitialDetails();
    
    const { data: scheduleList, isLoading: isScheduleLoading } = useScheduleList({
        oralwrittenscheduleflag: watchTestType,
        yearorbtwndates: watchYearwise,
        asmay_id: watchAsmayId || 0
    }, watchYearwise === 'yearwise' && !!watchAsmayId);

    // Reset schedule selection when test type or year changes
    useEffect(() => {
        setValue('disid', undefined);
    }, [watchTestType, watchAsmayId, watchYearwise, setValue]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                asmayid: data.yearwiseorbtwdates === 'yearwise' ? data.asmaY_Id : 0,
                asmclid: data.asmcL_Id,
                fromdate: data.yearwiseorbtwdates === 'btwdates' && data.from_date ? new Date(data.from_date).toISOString() : new Date().toISOString(),
                todate: data.yearwiseorbtwdates === 'btwdates' && data.to_date ? new Date(data.to_date).toISOString() : new Date().toISOString(),
                flagows: data.oralwrittenschedule,
                schids: data.disid || '',
                stype: data.autostudent ? 2 : 1,
                hrsrt: data.hrsrt
            };

            if (onFilterChange) {
                const selectedSchedule = (scheduleList?.writentestlist || []).find((s: any) => s.disid.toString() === data.disid);
                onFilterChange({
                    ...payload,
                    schedulename: selectedSchedule?.disname || '',
                });
            }
            toast.success('Filters applied successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to apply filters');
        }
    };

    const handleReset = () => {
        reset();
        if (onFilterChange) {
            onFilterChange({}, true);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                {/* Year Wise / Between Dates */}
                <div className='space-y-4 rounded-lg border p-6 bg-slate-50/50 shadow-sm'>
                    <div className='flex flex-col gap-2'>
                        <Label className='font-bold text-base'>Report Period</Label>
                        <Controller
                            name='yearwiseorbtwdates'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className='flex items-center gap-6 mt-2'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='yearwise' id='yearwise' />
                                        <Label htmlFor='yearwise' className='cursor-pointer'>Year Wise</Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='btwdates' id='btwdates' />
                                        <Label htmlFor='btwdates' className='cursor-pointer'>Between Dates</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {watchYearwise === 'yearwise' ? (
                        <div className='space-y-2 mt-4'>
                            <Label className='font-medium'>Academic Year <span className='text-red-500'>*</span></Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        onValueChange={(v) => field.onChange(Number(v))} 
                                        value={field.value?.toString()}
                                    >
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(initialDetails?.year || []).map((year: any) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>
                    ) : (
                        <div className='flex gap-4 mt-4'>
                            <div className='w-1/2 space-y-2'>
                                <Label className='font-medium'>From Date <span className='text-red-500'>*</span></Label>
                                <Controller
                                    name='from_date'
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className={cn('w-full justify-start text-left font-normal bg-white', !field.value && 'text-muted-foreground')}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From Date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.from_date && <FormError>{errors.from_date.message}</FormError>}
                            </div>
                            <div className='w-1/2 space-y-2'>
                                <Label className='font-medium'>To Date <span className='text-red-500'>*</span></Label>
                                <Controller
                                    name='to_date'
                                    control={control}
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    className={cn('w-full justify-start text-left font-normal bg-white', !field.value && 'text-muted-foreground')}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To Date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.to_date && <FormError>{errors.to_date.message}</FormError>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Class & Test Type */}
                <div className='space-y-4 rounded-lg border p-6 bg-slate-50/50 shadow-sm'>
                    <div className='space-y-2'>
                        <Label className='font-bold text-base'>Class Selection <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='asmcL_Id'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <SelectTrigger className='bg-white mt-2'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='0'>All</SelectItem>
                                        {(initialDetails?.classname || []).map((cls: any) => (
                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                    </div>

                    <div className='space-y-2 mt-4'>
                        <Label className='font-bold text-base'>Test Type <span className='text-red-500'>*</span></Label>
                        <Controller
                            name='oralwrittenschedule'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex flex-wrap items-center gap-6 mt-2'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='oral' id='oral' />
                                        <Label htmlFor='oral' className='cursor-pointer'>Oral Test</Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='written' id='written' />
                                        <Label htmlFor='written' className='cursor-pointer'>Written Test</Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='statusschedule' id='statusschedule' />
                                        <Label htmlFor='statusschedule' className='cursor-pointer'>Intimation</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                </div>

                {/* Time Format & Schedule Name */}
                <div className='space-y-4 rounded-lg border p-6 bg-slate-50/50 shadow-sm'>
                    <div className='space-y-2'>
                        <Label className='font-bold text-base'>Time Format</Label>
                        <Controller
                            name='hrsrt'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-6 mt-2'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='12hrrt' id='12hr' />
                                        <Label htmlFor='12hr' className='cursor-pointer'>12 Hours</Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='24hrrt' id='24hr' />
                                        <Label htmlFor='24hr' className='cursor-pointer'>24 Hours</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {watchYearwise === 'yearwise' && (
                        <div className='space-y-2 mt-4'>
                            <Label className='font-medium'>Schedule Name <span className='text-red-500'>*</span></Label>
                            <Controller
                                name='disid'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder={isScheduleLoading ? 'Loading...' : 'Select Schedule'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(scheduleList?.writentestlist || []).map((s: any) => (
                                                <SelectItem key={s.disid} value={s.disid.toString()}>
                                                    {s.disname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.disid && <FormError>{errors.disid.message}</FormError>}
                        </div>
                    )}
                </div>

                {/* Scheduled Report Checkbox */}
                <div className='flex flex-col justify-center rounded-lg border p-6 bg-blue-50/30 border-blue-100 shadow-sm'>
                    <div className='flex items-center space-x-3'>
                        <Controller
                            name='autostudent'
                            control={control}
                            render={({ field }) => (
                                <Checkbox 
                                    id='autostudent' 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                    className='h-5 w-5'
                                />
                            )}
                        />
                        <div className='space-y-1'>
                            <Label htmlFor='autostudent' className='text-base font-bold cursor-pointer'>Scheduled Report</Label>
                            <p className='text-xs text-muted-foreground'>Toggle for scheduled report specific data.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-start gap-4 pt-4'>
                <Button 
                    type='submit' 
                    size='lg'
                    className='flex items-center gap-2 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg transition-all hover:scale-105' 
                    disabled={isSubmitting}
                >
                    <Save className='h-5 w-5' />
                    Generate Report
                </Button>
                <Button 
                    type='button' 
                    variant='outline' 
                    size='lg'
                    onClick={handleReset}
                    className='px-8'
                >
                    Cancel / Reset
                </Button>
            </div>
        </form>
    );
}
