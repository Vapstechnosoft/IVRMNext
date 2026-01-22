'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { breakTimeSettingsSchema } from '@/schemas/timetable/masters';
import { getMaximumPeriodsCount, saveBreakTimeSettings } from '@/server/timetable/masters/breaktimesettings';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, Save, Square } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import {
    useAcademicYearDropDownMasterDayClasswise,
    useBreakTimeSettingDetails,
    useCategtoryDropDownMasterDayClasswise,
    useClassDropDownMasterDayClasswise,
    useDayDropDownMasterDayClasswise
} from '@/hooks/timetable/useMasters';
import { cn } from '@/lib/utils';
import { getClassDropDownMasterDayClasswiseOnchnageofCatandyr } from '@/server/timetable/masters/masterdayclasswise';
import type { ClassDropDownDataTT, IMasterDayList } from '@/types/timetable/masters/masters';
import { SpinnerTimePicker } from './SpinnerTimePicker';

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
    const dayList: IMasterDayList[] = (response as any)?.daysDrpDwn || [];

    const [classSearch, setClassSearch] = useState('');
    const [daySearch, setDaySearch] = useState('');

    const [isLoadingClasses, setIsLoadingClasses] = useState(false);

    const [selectedcalssidsItems, setSelectedcalssidsItems] = useState<{ asmcL_Id: string }[]>([]);
    const [overrideClassData, setOverrideClassData] = useState<ClassDropDownDataTT[] | null>(null);
    const {
        data: academicList,
        isLoading: academicLoading,
        error: academicError,
        refetchAll: academicRefetch
    } = useAcademicYearDropDownMasterDayClasswise();

    const {
        data: categoryList,
        isLoading: categoryLoading,
        error: categoryError,
        refetchAll: categoryRefetch
    } = useCategtoryDropDownMasterDayClasswise();

    const { data: classData, isLoading: classloading, error: classError, refetchAll: classRefetch } = useClassDropDownMasterDayClasswise();

    const {
        data: Masterdaydata,
        isLoading: masterdaydataloading,
        error: masterdaydataError,
        refetchAll: masterdaydataRefetch
    } = useDayDropDownMasterDayClasswise();

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

    const watchedAcademicYear = watch('asmay_id');
    const watchedCategory = watch('ttmC_Id');
    const watchedClasses = watch('calssids');
    const watchedAfterPeriod = watch('ttmB_AfterPeriod');

    // // Fetch classes when Category/Academic Year changes
    // useEffect(() => {
    //     const fetchClasses = async () => {
    //         if (watchedAcademicYear && watchedCategory) {
    //             try {
    //                 const res = await getClassByCategory({
    //                     ASMAY_Id: watchedAcademicYear,
    //                     TTMC_Id: watchedCategory
    //                 });
    //                 if (res?.classbycategory) {
    //                     setClassList(res.classbycategory as any[]);
    //                 } else {
    //                     setClassList([]);
    //                 }
    //             } catch (err) {
    //                 console.error('Error fetching classes', err);
    //             }
    //         }
    //     };
    //     fetchClasses();
    // }, [watchedAcademicYear, watchedCategory]);

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

    const classOptions =
        classData?.data?.map((h) => ({
            id: h.asmcL_Id.toString(),
            label: h.asmcL_ClassName
        })) ?? [];

    // Define form value for calss_ids
    const calss_ids = watch('calssids') || [];
    const day_ids = watch('dayids') || [];

    const toggleClass = (id: string) => {
        let updated = [];

        if (calss_ids.includes(id)) {
            updated = calss_ids.filter((v: string) => v !== id);
        } else {
            updated = [...calss_ids, id];
        }

        // MUST be tuple: at least 1 element
        if (updated.length === 0) {
            setValue('calssids', undefined as any);
        } else {
            setValue('calssids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedcalssidsItems(updated.map((x) => ({ asmcL_Id: x })));
    };

    // const selectAllcalssids = () => {
    //     const all = classOptions.map((h) => h.id);

    //     if (calss_ids.length === all.length) {
    //         // Option: clear selection → field becomes undefined
    //         setValue('calssids', undefined as any);
    //         setSelectedcalssidsItems([]);
    //     } else {
    //         setValue('calssids', all as [string, ...string[]], {
    //             shouldValidate: true
    //         });
    //         setSelectedcalssidsItems(all.map((x) => ({ asmcL_Id: x })));
    //     }
    // };

    const selectAllcalssids = () => {
        // Decide source based on search
        const source = classSearch.trim().length > 0 ? filteredcalssids.map((h) => h.asmcL_Id.toString()) : classOptions.map((h) => h.id);

        const isAllSelected = source.every((id) => calss_ids.includes(id));

        if (isAllSelected) {
            // Unselect only the affected items
            const remaining = calss_ids.filter((id) => !source.includes(id));

            if (remaining.length === 0) {
                setValue('calssids', undefined as any);
            } else {
                setValue('calssids', remaining as [string, ...string[]], {
                    shouldValidate: true
                });
            }
        } else {
            // Merge current + source (avoid duplicates)
            const merged = Array.from(new Set([...calss_ids, ...source]));

            setValue('calssids', merged as [string, ...string[]], {
                shouldValidate: true
            });
        }

        setSelectedcalssidsItems(
            (classSearch.trim().length > 0 ? filteredcalssids : classData?.data || []).map((x) => ({
                asmcL_Id: x.asmcL_Id.toString()
            }))
        );
    };

    const filteredcalssids = classData?.data?.filter((h) => h.asmcL_ClassName.toLowerCase().includes(classSearch.toLowerCase())) ?? [];

    const filteredDayIds = Masterdaydata?.data?.filter((d) => d.ttmD_DayName.toLowerCase().includes(daySearch.toLowerCase())) ?? [];

    const toggleDay = (id: string) => {
        let updated: string[] = [];

        if (day_ids.includes(id)) {
            updated = day_ids.filter((v) => v !== id);
        } else {
            updated = [...day_ids, id];
        }

        if (updated.length === 0) {
            setValue('dayids', undefined as any);
        } else {
            setValue('dayids', updated as [string, ...string[]], {
                shouldValidate: true
            });
        }
    };

    const selectAllDayIds = () => {
        const source =
            daySearch.trim().length > 0
                ? filteredDayIds.map((d) => d.ttmD_Id.toString())
                : (Masterdaydata?.data?.map((d) => d.ttmD_Id.toString()) ?? []);

        const isAllSelected = source.every((id) => day_ids.includes(id));

        if (isAllSelected) {
            const remaining = day_ids.filter((id) => !source.includes(id));

            if (remaining.length === 0) {
                setValue('dayids', undefined as any);
            } else {
                setValue('dayids', remaining as [string, ...string[]], {
                    shouldValidate: true
                });
            }
        } else {
            const merged = Array.from(new Set([...day_ids, ...source]));
            setValue('dayids', merged as [string, ...string[]], {
                shouldValidate: true
            });
        }
    };

    // const watchedAcademicYear = watch('asmay_id');
    // const watchedCategory = watch('ttmC_Id');

    useEffect(() => {
        const fetchClassesOnCategoryChange = async () => {
            if (!watchedAcademicYear || !watchedCategory) return;

            try {
                setIsLoadingClasses(true);

                const res = await getClassDropDownMasterDayClasswiseOnchnageofCatandyr(watchedAcademicYear, watchedCategory);

                // ✅ override class dropdown data
                if (res?.data?.length) {
                    setOverrideClassData(res.data);
                } else {
                    setOverrideClassData([]);
                }

                // reset selection
                setValue('calssids', undefined as any);
                setClassSearch('');
            } catch (err) {
                console.error('Error fetching classes on category change', err);
                setOverrideClassData([]);
            } finally {
                setIsLoadingClasses(false);
            }
        };

        fetchClassesOnCategoryChange();
    }, [watchedCategory]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                TTMB_Id: 0,
                // ASMAY_Id: data.asmaY_Id,
                // TTMC_Id: data.ttmC_Id,
                // ArrayClassList: data.classIds,
                // ArrayDayList: data.dayIds,
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
                                name='asmay_id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value) || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading Academic Years...
                                                </SelectItem>
                                            ) : academicError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading Academic Years...
                                                </SelectItem>
                                            ) : (
                                                academicList?.data?.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmay_id && <span className='text-red-500 text-sm'>{errors.asmay_id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>

                            <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                                <InputText
                                    placeholder='Search calssids...'
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    className='mb-3'
                                />

                                {/* Select All Users */}
                                {classData?.data && (
                                    <div
                                        onClick={selectAllcalssids}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            calss_ids.length === classOptions.length && classOptions.length
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {calss_ids.length === classOptions.length && classOptions.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                )}

                                <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                    {classloading ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>Loading Class...</div>
                                    ) : classData?.data?.length === 0 ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>No Class found</div>
                                    ) : (
                                        filteredcalssids.map((u) => {
                                            const id = u.asmcL_Id.toString();
                                            const selected = calss_ids.includes(id);

                                            return (
                                                <div
                                                    key={u.asmcL_Id}
                                                    onClick={() => toggleClass(id)}
                                                    className={cn(
                                                        'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-300 hover:border-primary/40'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{u.asmcL_ClassName}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                            {errors.calssids && <span className='text-red-500 text-sm'>{errors.calssids.message}</span>}
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
                                render={({ field }) => (
                                    // <TimePicker date={field.value} setDate={field.onChange} />
                                    <SpinnerTimePicker value={field.value} onChange={field.onChange} />
                                )}
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
                                Category Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='ttmC_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(Number(value) || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading CategoryData
                                                </SelectItem>
                                            ) : academicError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading CategoryData
                                                </SelectItem>
                                            ) : (
                                                categoryList?.data?.map((item) => (
                                                    <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>
                                                        {item.ttmC_CategoryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.ttmC_Id && <span className='text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
                        </div>

                        <div className='space-y-2'>
                            <Label>
                                Day <span className='text-red-500'>*</span>
                            </Label>

                            <div className='mt-2 rounded-md border border-gray-300 bg-white p-3'>
                                <InputText
                                    placeholder='Search Day...'
                                    value={daySearch}
                                    onChange={(e) => setDaySearch(e.target.value)}
                                    className='mb-3'
                                />

                                {Masterdaydata?.data && (
                                    <div
                                        onClick={selectAllDayIds}
                                        className={cn(
                                            'mb-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 font-medium text-sm transition-all',
                                            day_ids.length === (daySearch.trim() ? filteredDayIds.length : Masterdaydata.data.length) &&
                                                day_ids.length
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-gray-300 hover:border-primary/40'
                                        )}>
                                        {day_ids.length === (daySearch.trim() ? filteredDayIds.length : Masterdaydata.data.length) &&
                                        day_ids.length ? (
                                            <CheckSquare className='h-4 w-4 text-primary' />
                                        ) : (
                                            <Square className='h-4 w-4 text-gray-400' />
                                        )}
                                        <span>Select All</span>
                                    </div>
                                )}

                                <div className='max-h-40 overflow-y-auto rounded-md border border-gray-300 p-1'>
                                    {masterdaydataloading ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>Loading Days...</div>
                                    ) : filteredDayIds.length === 0 ? (
                                        <div className='py-4 text-center text-gray-500 text-sm'>No Day found</div>
                                    ) : (
                                        filteredDayIds.map((d) => {
                                            const id = d.ttmD_Id.toString();
                                            const selected = day_ids.includes(id);

                                            return (
                                                <div
                                                    key={d.ttmD_Id}
                                                    onClick={() => toggleDay(id)}
                                                    className={cn(
                                                        'mb-1 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-all',
                                                        selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-gray-300 hover:border-primary/40'
                                                    )}>
                                                    {selected ? (
                                                        <CheckSquare className='h-4 w-4 text-primary' />
                                                    ) : (
                                                        <Square className='h-4 w-4 text-gray-400' />
                                                    )}
                                                    <span>{d.ttmD_DayName}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {errors.dayids && <span className='text-red-500 text-sm'>{errors.dayids.message}</span>}
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
                                render={({ field }) => (
                                    //<TimePicker date={field.value} setDate={field.onChange} />
                                    <SpinnerTimePicker value={field.value} onChange={field.onChange} />
                                )}
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
