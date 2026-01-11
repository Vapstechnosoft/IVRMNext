'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker/time-picker';
import { breakTimeSettingsSchema } from '@/schemas/timetable/masters';
import { getClassByCategory, getMaximumPeriodsCount, saveBreakTimeSettings } from '@/server/timetable/masters/breaktimesettings';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { useBreakTimeSettingDetails } from '@/hooks/timetable/useMasters';
import type { IMasterDayList } from '@/types/timetable/masters/masters';

type FormFields = z.infer<typeof breakTimeSettingsSchema.addOrUpdate>;

interface AddBreakTimeSettingsFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddBreakTimeSettingsForm({ onSuccess, className = '' }: AddBreakTimeSettingsFormProps) {
    const { data: response, refetchAll } = useBreakTimeSettingDetails();
    const [classList, setClassList] = useState<any[]>([]);
    const [periodsBefore, setPeriodsBefore] = useState<any[]>([]);
    const [periodsAfter, setPeriodsAfter] = useState<any[]>([]);
    const [maxPeriods, setMaxPeriods] = useState<number>(0);

    // Initial load of dropdowns from response
    const academicList = (response as any)?.academiclist || [];
    const categoryList = (response as any)?.catelist || [];
    const dayList: IMasterDayList[] = (response as any)?.daysDrpDwn || [];

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(breakTimeSettingsSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            // Defaults if needed
        }
    });

    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');
    const watchedClasses = watch('classIds');
    const watchedAfterPeriod = watch('ttmB_AfterPeriod');

    // Fetch classes when Category/Academic Year changes
    useEffect(() => {
        const fetchClasses = async () => {
            if (watchedAcademicYear && watchedCategory) {
                try {
                    const res = await getClassByCategory({
                        ASMAY_Id: watchedAcademicYear,
                        TTMC_Id: watchedCategory
                    });
                    if (res?.classbycategory) {
                        setClassList(res.classbycategory as any[]);
                    } else {
                        setClassList([]);
                    }
                } catch (err) {
                    console.error('Error fetching classes', err);
                }
            }
        };
        fetchClasses();
    }, [watchedAcademicYear, watchedCategory]);

    // Fetch max periods when classes are selected
    useEffect(() => {
        const fetchMaxPeriods = async () => {
            if (watchedClasses && watchedClasses.length > 0) {
                try {
                    const classIds = watchedClasses.map((c: any) => c.asmcL_Id);
                    const data = {
                        classid: classIds[classIds.length - 1],
                        classidscount: classIds.length
                    };

                    const res = await getMaximumPeriodsCount(data);
                    if (res?.classidscountreturn) {
                        setMaxPeriods(res.classidscountreturn as number);
                    }
                } catch (err) {
                    console.error('Error fetching max periods', err);
                }
            }
        };
        fetchMaxPeriods();
    }, [watchedClasses]);

    useEffect(() => {
        if (watchedAfterPeriod && maxPeriods) {
            const ap = Number(watchedAfterPeriod);
            if (ap > maxPeriods) {
                toast.error('After Period cannot exceed Max Periods (' + maxPeriods + ')');
                setValue('ttmB_AfterPeriod', 0); // Reset or handle error
                return;
            }

            // Calculate lists
            // Before: 1 to ap
            const before = [];
            for (let i = 1; i <= ap; i++) before.push({ key: i, label: `${i}` });
            setPeriodsBefore(before);

            // After: ap + 1 to maxPeriods
            const after = [];
            for (let i = ap + 1; i <= maxPeriods; i++) after.push({ key: i, label: `${i}` });
            setPeriodsAfter(after);
        }
    }, [watchedAfterPeriod, maxPeriods, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                TTMB_Id: 0,
                ASMAY_Id: data.asmaY_Id,
                TTMC_Id: data.ttmC_Id,
                ArrayClassList: data.classIds,
                ArrayDayList: data.dayIds,
                TTMB_BreakName: data.ttmB_BreakName,
                TTMB_BreakStartTime: data.ttmB_BreakStartTime,
                TTMB_BreakEndTime: data.ttmB_BreakEndTime,
                TTMB_AfterPeriod: data.ttmB_AfterPeriod,
                ArraybeforeperiodsList: periodsBefore.map((p) => ({ TTPeriodnameB: p.key })),
                ArrayafterperiodsList: periodsAfter.map((p) => ({ TTPeriodnameA: p.key })),
                TTMB_ActiveFlag: true
            };

            const response = await saveBreakTimeSettings(payload as any);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='classIds'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={classList.map((c: any) => ({ label: c.asmcL_ClassName, value: c.asmcL_Id.toString() }))}
                                        defaultValue={field.value?.map((v: any) => v.asmcL_Id.toString()) || []}
                                        onValueChange={(vals) => {
                                            // vals is array of strings (IDs). Convert back to objects required by schema/backend
                                            const selectedObjs = vals
                                                .map((id) => {
                                                    const found = classList.find((c) => c.asmcL_Id.toString() === id);
                                                    return found
                                                        ? { asmcL_Id: found.asmcL_Id, asmcL_ClassName: found.asmcL_ClassName }
                                                        : null;
                                                })
                                                .filter((x) => x);
                                            field.onChange(selectedObjs);
                                        }}
                                        placeholder='Select Classes'
                                    />
                                )}
                            />
                            {errors.classIds && <FormError>{errors.classIds.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <InputText label='Break Name' required {...register('ttmB_BreakName')} error={errors.ttmB_BreakName?.message} />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Start Time <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmB_BreakStartTime'
                                render={({ field }) => <TimePicker date={field.value} setDate={field.onChange} />}
                            />
                            {errors.ttmB_BreakStartTime && <FormError>{errors.ttmB_BreakStartTime.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>Before Period</Label>
                            <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                                {periodsBefore.map((p) => (
                                    <div key={p.key} className='flex items-center space-x-2'>
                                        <Checkbox checked disabled />
                                        <Label className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            {p.label}
                                        </Label>
                                    </div>
                                ))}
                                {periodsBefore.length === 0 && <span className='text-muted-foreground text-xs'>No periods before</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>
                                Category <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmC_Id'
                                render={({ field }) => (
                                    <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryList.map((item: any) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                    {item.ttmC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ttmC_Id && <FormError>{errors.ttmC_Id.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='dayIds'
                                render={({ field }) => (
                                    <MultiSelect
                                        options={dayList.map((d) => ({ label: d.ttmD_DayName, value: d.ttmD_Id.toString() }))}
                                        defaultValue={field.value?.map((v: any) => v.ttmD_Id.toString()) || []}
                                        onValueChange={(vals) => {
                                            const selectedObjs = vals
                                                .map((id) => {
                                                    const found = dayList.find((d) => d.ttmD_Id.toString() === id);
                                                    return found ? { ttmD_Id: found.ttmD_Id, ttmD_DayName: found.ttmD_DayName } : null;
                                                })
                                                .filter((x) => x);
                                            field.onChange(selectedObjs);
                                        }}
                                        placeholder='Select Days'
                                    />
                                )}
                            />
                            {errors.dayIds && <FormError>{errors.dayIds.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <InputText
                                label='After Period'
                                required
                                {...register('ttmB_AfterPeriod')}
                                error={errors.ttmB_AfterPeriod?.message}
                                type='number'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                End Time <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ttmB_BreakEndTime'
                                render={({ field }) => <TimePicker date={field.value} setDate={field.onChange} />}
                            />
                            {errors.ttmB_BreakEndTime && <FormError>{errors.ttmB_BreakEndTime.message}</FormError>}
                        </div>

                        <div className='space-y-2'>
                            <Label>After Period (Remaining)</Label>
                            <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                                {periodsAfter.map((p) => (
                                    <div key={p.key} className='flex items-center space-x-2'>
                                        <Checkbox checked disabled />
                                        <Label className='font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                            {p.label}
                                        </Label>
                                    </div>
                                ))}
                                {periodsAfter.length === 0 && <span className='text-muted-foreground text-xs'>No periods after</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end gap-3'>
                    <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                        <Save className='mr-2 h-4 w-4' />
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
