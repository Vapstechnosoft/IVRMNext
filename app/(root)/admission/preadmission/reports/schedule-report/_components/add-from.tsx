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
            <div className='p-4 bg-slate-50 border border-slate-200 rounded-sm space-y-4'>
                {/* Row 1 */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                    <div className='flex items-center gap-4 border border-slate-300 p-2 rounded-sm bg-white'>
                        <Controller
                            name='yearwiseorbtwdates'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className='flex items-center gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='yearwise' id='yearwise' />
                                        <Label htmlFor='yearwise' className='font-medium text-xs whitespace-nowrap'>Year Wise <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <RadioGroupItem value='btwdates' id='btwdates' />
                                        <Label htmlFor='btwdates' className='font-medium text-xs whitespace-nowrap'>Between Dates <span className='text-red-500'>*</span></Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='flex items-center gap-2 border border-slate-300 p-2 rounded-sm bg-white'>
                        <Label className='font-medium text-xs whitespace-nowrap'>Academic Year: <span className='text-red-500'>*</span></Label>
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
                                                <Button variant='outline' className='h-8 px-2 text-[10px] min-w-[80px]'>
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'From'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0'>
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
                                                <Button variant='outline' className='h-8 px-2 text-[10px] min-w-[80px]'>
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'To'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0'>
                                                <CalendarYear mode='single' selected={field.value ? new Date(field.value) : undefined} onSelect={(d) => field.onChange(d?.toISOString())} />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Row 2 */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 items-center'>
                    <div className='flex items-center gap-2 border border-slate-300 p-2 rounded-sm bg-white'>
                        <Label className='font-medium text-xs whitespace-nowrap'>Class: <span className='text-red-500'>*</span></Label>
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

                    <div className='flex items-center gap-4 border border-slate-300 p-2 rounded-sm bg-white overflow-x-auto'>
                        <Controller
                            name='oralwrittenschedule'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-3'>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='oral' id='oral' className='h-3 w-3' />
                                        <Label htmlFor='oral' className='text-[10px] whitespace-nowrap'>Oral Test <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='written' id='written' className='h-3 w-3' />
                                        <Label htmlFor='written' className='text-[10px] whitespace-nowrap'>Written Test <span className='text-red-500'>*</span></Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='statusschedule' id='statusschedule' className='h-3 w-3' />
                                        <Label htmlFor='statusschedule' className='text-[10px] whitespace-nowrap'>IntimationSchedule <span className='text-red-500'>*</span></Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Hidden logic for secondary fields */}
            {(watchYearwise === 'yearwise' && !!watchAsmayId) && (
                <div className='flex gap-4 justify-end items-center px-4 py-1'>
                     <div className='flex items-center gap-2'>
                        <Label className='text-[10px] text-slate-400'>Time Format:</Label>
                        <Controller
                            name='hrsrt'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-2'>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='12hrrt' id='12hr' className='h-2 w-2' />
                                        <Label htmlFor='12hr' className='text-[9px]'>12H</Label>
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <RadioGroupItem value='24hrrt' id='24hr' className='h-2 w-2' />
                                        <Label htmlFor='24hr' className='text-[9px]'>24H</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                     </div>
                     <div className='flex items-center gap-2'>
                        <Label className='text-[10px] text-slate-400'>Schedule:</Label>
                        <Controller
                            name='disid'
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <SelectTrigger className='h-6 text-[10px] w-[140px]'>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(scheduleList?.writentestlist || []).map((s: any) => (
                                            <SelectItem key={s.disid} value={s.disid.toString()} className='text-[10px]'>
                                                {s.disname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                     </div>
                </div>
            )}

            <div className='flex justify-center gap-2 pt-2'>
                <Button 
                    type='submit' 
                    className='h-8 px-6 bg-[#3f51b5] hover:bg-[#303f9f] text-white text-xs font-bold uppercase rounded-sm shadow-sm' 
                    disabled={isSubmitting}
                >
                    REPORT
                </Button>
                <Button 
                    type='button' 
                    onClick={handleReset}
                    className='h-8 px-6 bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs font-bold uppercase rounded-sm shadow-sm'
                >
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
