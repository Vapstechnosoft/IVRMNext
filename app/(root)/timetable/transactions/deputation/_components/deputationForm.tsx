'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useAbsentStaffList, useDeputationDetails } from '@/hooks/timetable/useTransactions';
import { DeputationSchema } from '@/schemas/timetable/transactions';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DeputationFormProps {
    onFetch: (selection: {
        date: Date | null;
        dateStr: string;
        dayId: number;
        dayName: string;
        absentStaffId: number;
        absflag: boolean;
        remarks: string;
        smsflag: boolean;
        mailflag: boolean;
        noT_Flag: boolean;
        masters: any;
    } | null) => void;
}

export default function DeputationForm({ onFetch }: DeputationFormProps) {
    const { data: initialDetails, isLoading: detailsLoading } = useDeputationDetails();
    const [fetchingPeriods, setFetchingPeriods] = useState(false);

    const {
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(DeputationSchema),
        defaultValues: {
            asmaY_Id: '',
            ttmD_Date: undefined as Date | undefined,
            ttmD_Day: '',
            ttmD_Id: 0,
            absent_Staff_Flag: false,
            sms_Flag: false,
            email_Flag: false,
            notification_Flag: false,
            ttmD_Remarks: '',
            hrmE_Id: ''
        }
    });

    const watchDate = watch('ttmD_Date');
    const watchAbsent = watch('absent_Staff_Flag');
    const watchHrmEId = watch('hrmE_Id');
    const watchDayId = watch('ttmD_Id');
    const watchDayName = watch('ttmD_Day');
    const watchRemarks = watch('ttmD_Remarks');
    const watchSms = watch('sms_Flag');
    const watchEmail = watch('email_Flag');
    const watchNot = watch('notification_Flag');

    // Academic years list from getdetails
    const ayList = initialDetails?.acayear || initialDetails?.academiclist || [];
    // Day list from getdetails
    const dayList = initialDetails?.daylist || initialDetails?.day_list || [];
    // Master staff list from getdetails
    const masterStaffList =
        initialDetails?.stafflist ||
        initialDetails?.absentstafflist ||
        initialDetails?.staff_list ||
        initialDetails?.staffList ||
        initialDetails?.gridweeks ||
        (Array.isArray(initialDetails) ? initialDetails : []);

    // Automatically update day when date changes
    useEffect(() => {
        if (watchDate) {
            const formattedDayName = format(watchDate, 'EEEE').toUpperCase();
            setValue('ttmD_Day', formattedDayName);

            // Find matching day ID from daylist if available
            if (dayList && dayList.length > 0) {
                const matchedDay = dayList.find(
                    (d: any) =>
                        d.ttmD_DayName?.toUpperCase() === formattedDayName ||
                        d.ttmD_DayCode?.toUpperCase() === formattedDayName.substring(0, 3)
                );
                if (matchedDay) {
                    setValue('ttmD_Id', Number(matchedDay.ttmD_Id || 0));
                }
            }
        }
    }, [watchDate, dayList, setValue]);

    // Fetch absent staff based on date and flag via POST /api/DeputationFacade/getabsentstaff
    const dateFormatted = watchDate ? format(watchDate, 'yyyy-MM-dd') : '';
    const dateIsoStr = watchDate ? watchDate.toISOString() : '';
    const { data: absentStaffRes, isLoading: absentStaffLoading } = useAbsentStaffList(
        {
            ttsD_Date: dateFormatted || dateIsoStr,
            absflag: watchAbsent,
            ttmD_Id: watchDayId || 0,
            ttmP_Id: 0,
            hrmE_Id: 0
        },
        !!watchDate
    );

    // Extract absent staff list array
    const rawAbsentList =
        absentStaffRes?.absentstafflist ||
        absentStaffRes?.stafflist ||
        absentStaffRes?.absentStaffList ||
        absentStaffRes?.staffList ||
        absentStaffRes?.staff_list ||
        absentStaffRes?.gridweeks ||
        absentStaffRes?.vlist ||
        (Array.isArray(absentStaffRes) ? absentStaffRes : (Array.isArray(absentStaffRes?.data) ? absentStaffRes.data : null));

    const absentStaffList = (rawAbsentList && rawAbsentList.length > 0) ? rawAbsentList : masterStaffList;

    // Reset staff selection when Date or Absent Flag changes
    useEffect(() => {
        setValue('hrmE_Id', '');
    }, [watchDate, watchAbsent, setValue]);

    // Show warning toast if absent staff query returns empty results
    useEffect(() => {
        if (watchDate && !absentStaffLoading && absentStaffRes) {
            if (rawAbsentList && Array.isArray(rawAbsentList) && rawAbsentList.length === 0) {
                toast.warning('No staff records found for the selected date and criteria');
            }
        }
    }, [watchDate, absentStaffLoading, absentStaffRes]);

    // Automatically trigger period allotment fetch when Date and Staff are selected
    useEffect(() => {
        if (watchDate && watchHrmEId) {
            const dateStr = watchDate ? watchDate.toISOString() : '';
            const dayId = Number(watchDayId || 0);

            onFetch({
                date: watchDate,
                dateStr,
                dayId,
                dayName: watchDayName || '',
                absentStaffId: Number(watchHrmEId),
                absflag: watchAbsent,
                remarks: watchRemarks || '',
                smsflag: watchSms,
                mailflag: watchEmail,
                noT_Flag: watchNot,
                masters: initialDetails
            });
        } else {
            onFetch(null);
        }
    }, [watchDate, watchHrmEId, watchAbsent, watchDayId, watchDayName, watchRemarks, watchSms, watchEmail, watchNot, initialDetails]);

    const handleReset = () => {
        reset({
            asmaY_Id: '',
            ttmD_Date: undefined,
            ttmD_Day: '',
            ttmD_Id: 0,
            absent_Staff_Flag: false,
            sms_Flag: false,
            email_Flag: false,
            notification_Flag: false,
            ttmD_Remarks: '',
            hrmE_Id: ''
        });
        onFetch(null);
    };

    return (
        <CollapsibleSection title='Staff Replacement For Class And Section' defaultOpen>
            <div className='rounded-xl border border-purple-100 bg-white p-6 shadow-md'>
                <form onSubmit={(e) => e.preventDefault()} className='space-y-6'>
                    {/* TOP GRID */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Academic Year */}
                        <div className='space-y-1'>
                            <Label className='font-bold text-purple-900 text-xs uppercase'>Academic Year</Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='h-10 border-purple-100'>
                                            <SelectValue placeholder={detailsLoading ? 'Loading Years...' : 'Select Academic Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ayList?.map((ay: any) => (
                                                <SelectItem key={ay.asmaY_Id} value={ay.asmaY_Id.toString()}>
                                                    {ay.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Date */}
                        <div className='space-y-1'>
                            <Label className={`font-bold text-xs uppercase ${errors.ttmD_Date ? 'text-red-500' : 'text-purple-900'}`}>
                                Date *
                            </Label>
                            <Controller
                                name='ttmD_Date'
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                className={`w-full justify-start border-purple-100 ${errors.ttmD_Date ? 'border-red-500 ring-red-100' : ''}`}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(field.value, 'dd/MM/yyyy') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0'>
                                            <CalendarYear
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                fromYear={2000}
                                                toYear={2050}
                                                captionLayout='dropdown'
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.ttmD_Date && <p className='font-medium text-[10px] text-red-500'>{errors.ttmD_Date.message}</p>}
                        </div>

                        {/* Day */}
                        <div className='space-y-1'>
                            <Label className='font-bold text-purple-900 text-xs uppercase'>Day</Label>
                            <Controller
                                name='ttmD_Day'
                                control={control}
                                render={({ field }) => <Input {...field} readOnly className='h-10 bg-slate-50 text-purple-700 font-semibold' />}
                            />
                        </div>
                    </div>

                    {/* ABSENT STAFF SECTION */}
                    <div className='grid gap-6 rounded-xl border border-orange-100 bg-orange-50/40 p-5 md:grid-cols-2'>
                        <div className='flex items-center space-x-3'>
                            <Controller
                                name='absent_Staff_Flag'
                                control={control}
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label className='font-bold text-orange-700 text-sm'>
                                Absent Staff On : {watchDate ? format(watchDate, 'dd/MM/yyyy') : '--'}
                            </Label>
                        </div>

                        <div className='space-y-1'>
                            <Label className={`font-bold text-xs uppercase ${errors.hrmE_Id ? 'text-red-500' : 'text-purple-900'}`}>
                                Staff Name *
                            </Label>
                            <Controller
                                name='hrmE_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            className={`h-10 border-purple-100 ${errors.hrmE_Id ? 'border-red-500 ring-red-100' : ''}`}>
                                            <SelectValue placeholder={absentStaffLoading ? 'Loading Staff...' : '-- Select Staff --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {absentStaffList?.map((staff: any, idx: number) => {
                                                const staffId = staff.hrmE_Id || staff.hrE_Id || staff.HRME_Id || staff.id || idx;
                                                const fullName = [staff.hrmE_EmployeeFirstName, staff.hrmE_EmployeeMiddleName, staff.hrmE_EmployeeLastName]
                                                    .filter(Boolean)
                                                    .join(' ');
                                                const staffName =
                                                    staff.staffName ||
                                                    staff.staffname ||
                                                    (fullName ? fullName : null) ||
                                                    staff.hrmE_EmployeeFirstName ||
                                                    staff.hrmE_EmployeeCode ||
                                                    staff.employeeName ||
                                                    `Staff #${staffId}`;

                                                return (
                                                    <SelectItem key={`${staffId}-${idx}`} value={staffId.toString()}>
                                                        {staffName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.hrmE_Id && <p className='font-medium text-[10px] text-red-500'>{errors.hrmE_Id.message}</p>}
                        </div>
                    </div>

                    {/* REMARKS */}
                    <div className='space-y-1'>
                        <Label className='font-bold text-purple-900 text-xs uppercase'>Remarks</Label>
                        <Controller
                            name='ttmD_Remarks'
                            control={control}
                            render={({ field }) => <Input {...field} placeholder='Enter remarks...' className='h-10' />}
                        />
                    </div>

                    {/* NOTIFICATION FLAGS */}
                    <div className='flex gap-8 border-y py-4'>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='sms_Flag'
                                control={control}
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label className='font-bold text-xs uppercase'>SMS</Label>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='email_Flag'
                                control={control}
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label className='font-bold text-xs uppercase'>Email</Label>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='notification_Flag'
                                control={control}
                                render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                            />
                            <Label className='font-bold text-xs uppercase'>Notification</Label>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className='flex justify-center pt-2 gap-3'>
                        <Button type='button' onClick={handleReset} className='bg-orange-600 px-8 font-bold text-white hover:bg-orange-700 uppercase tracking-wide'>
                            <X className='mr-2 h-4 w-4' /> Cancel
                        </Button>
                        {detailsLoading && <Loader2 className='h-4 w-4 animate-spin self-center text-purple-500' />}
                    </div>
                </form>
            </div>
        </CollapsibleSection>
    );
}



