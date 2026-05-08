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
                const displaySchedules = Array.isArray(scheduleList) ? scheduleList : (scheduleList?.writentestlist || []);
                const selectedSchedule = (displaySchedules || []).find((s: any) => s.disid.toString() === data.disid);
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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            {/* Top Row: Scheduled Report Checkbox */}
            <div className='flex items-center space-x-2 mb-2'>
                <Controller
                    name='autostudent'
                    control={control}
                    render={({ field }) => (
                        <Checkbox 
                            id='autostudent' 
                            checked={field.value} 
                            onCheckedChange={field.onChange} 
                            className='h-4 w-4'
                        />
                    )}
                />
                <Label htmlFor='autostudent' className='text-sm font-bold text-slate-700 uppercase cursor-pointer'>Scheduled Report</Label>
            </div>

            {/* Filter Section with Grey Background */}
            <div className='p-4 bg-white border border-slate-200 rounded-sm space-y-4'>
                {/* Row 1: Year Selection & Academic Year */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                    <div className='flex items-center justify-center gap-6 border border-slate-200 p-2 rounded-sm bg-white min-h-[42px]'>
                        <Controller
                            name='yearwiseorbtwdates'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className='flex items-center gap-6'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='yearwise' id='yearwise' />
                                        <Label htmlFor='yearwise' className='font-bold text-[11px] uppercase'>Year Wise <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='btwdates' id='btwdates' />
                                        <Label htmlFor='btwdates' className='font-bold text-[11px] uppercase'>Between Dates <span className='text-red-500'>*</span></Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 font-bold text-[11px] uppercase text-right'>Academic Year : <span className='text-red-500'>*</span></Label>
                        <div className='col-span-8'>
                            {watchYearwise === 'yearwise' ? (
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                            <SelectTrigger className='h-8 text-xs'>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(initialDetails?.year || []).map((year: any) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()} className='text-xs'>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            ) : (
                                <div className='flex items-center gap-1'>
                                    <Controller
                                        name='from_date'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='h-8 px-2 text-[10px] w-full flex justify-between font-normal'>
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From Date'}
                                                        <CalendarIcon className="h-3 w-3 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align="start">
                                                    <CalendarYear mode='single' selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d?.toISOString())} />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    <Controller
                                        name='to_date'
                                        control={control}
                                        render={({ field }) => (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='h-8 px-2 text-[10px] w-full flex justify-between font-normal'>
                                                        {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To Date'}
                                                        <CalendarIcon className="h-3 w-3 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align="start">
                                                    <CalendarYear mode='single' selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d?.toISOString())} />
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Row 2: Class & Test Type */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 font-bold text-[11px] uppercase text-right'>Class : <span className='text-red-500'>*</span></Label>
                        <div className='col-span-8'>
                            <Controller
                                name='asmcL_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                        <SelectTrigger className='h-8 text-xs'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0' className='text-xs'>All</SelectItem>
                                            {(initialDetails?.classname || []).map((cls: any) => (
                                                <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()} className='text-xs'>
                                                    {cls.asmcL_ClassName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-center gap-4 border border-slate-200 p-2 rounded-sm bg-white min-h-[42px]'>
                        <Controller
                            name='oralwrittenschedule'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-4'>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='oral' id='oral' className='h-3 w-3' />
                                        <Label htmlFor='oral' className='text-[10px] font-bold uppercase whitespace-nowrap'>Oral Test <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='written' id='written' className='h-3 w-3' />
                                        <Label htmlFor='written' className='text-[10px] font-bold uppercase whitespace-nowrap'>Written Test <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='statusschedule' id='statusschedule' className='h-3 w-3' />
                                        <Label htmlFor='statusschedule' className='text-[10px] font-bold uppercase whitespace-nowrap'>IntimationSchedule <span className='text-red-500'>*</span></Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                </div>

                {/* Row 3: Time Format & Schedule Name */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-center'>
                    <div className='flex items-center justify-center gap-6 border border-slate-200 p-2 rounded-sm bg-white min-h-[42px]'>
                        <Controller
                            name='hrsrt'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-6'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='12hrrt' id='12hr' className='h-3 w-3' />
                                        <Label htmlFor='12hr' className='text-[10px] font-bold uppercase'>12 Hours Format</Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='24hrrt' id='24hr' className='h-3 w-3' />
                                        <Label htmlFor='24hr' className='text-[10px] font-bold uppercase'>24 Hours Format</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-12 items-center gap-2 px-2'>
                        <Label className='col-span-4 font-bold text-[11px] uppercase text-right'>Schedule Name : <span className='text-red-500'>*</span></Label>
                        <div className='col-span-8'>
                            <Controller
                                name='disid'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={watchYearwise !== 'yearwise' || !watchAsmayId}>
                                        <SelectTrigger className='h-8 text-xs'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {((Array.isArray(scheduleList) ? scheduleList : scheduleList?.writentestlist) || []).map((s: any) => (
                                                <SelectItem key={s.disid} value={s.disid.toString()} className='text-xs'>
                                                    {s.disname}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-center gap-2 pt-4'>
                <Button 
                    type='submit' 
                    className='h-9 px-8 bg-[#3f51b5] hover:bg-[#303f9f] text-white text-xs font-bold uppercase rounded-sm shadow-md transition-all active:scale-95' 
                    disabled={isSubmitting}
                >
                    REPORT
                </Button>
                <Button 
                    type='button' 
                    onClick={handleReset}
                    className='h-9 px-8 bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs font-bold uppercase rounded-sm shadow-md transition-all active:scale-95'
                >
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
