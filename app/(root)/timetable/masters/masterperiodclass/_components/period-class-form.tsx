'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBreakTimeSettings } from '@/hooks/timetable/useMasters';
import { masterPeriodClassSchema } from '@/schemas/timetable/masters';
import { getClassByCategory, getPeriodClass, savePeriodClass } from '@/server/timetable/masters/periodallocation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterPeriodClassSchema.save>;

interface MasterPeriodClassFormProps {
    onSuccess?: () => void;
}

export default function MasterPeriodClassForm({ onSuccess }: MasterPeriodClassFormProps) {
    const { data: response } = useBreakTimeSettings();
    const [classList, setClassList] = useState<any[]>([]);
    const [periods, setPeriods] = useState<any[]>([]);

    const academicList = (response as any)?.academiclist || [];
    const categoryList = (response as any)?.catelist || [];

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterPeriodClassSchema.save),
        defaultValues: {
            noOfPeriods: 1
        }
    });

    const watchedAcademicYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');
    const watchedNoOfPeriods = watch('noOfPeriods');

    // Fetch Classes based on Category and Academic Year
    useEffect(() => {
        const fetchClasses = async () => {
            if (watchedAcademicYear && watchedCategory) {
                try {
                    const res = await getClassByCategory({
                        ASMAY_Id: watchedAcademicYear,
                        TTMC_Id: watchedCategory
                    });
                    if (res?.tempararyArray) {
                        setClassList(res.tempararyArray as any[]);
                    } else {
                        setClassList([]);
                    }
                } catch (err) {
                    console.error('Error fetching classes', err);
                }
            } else {
                setClassList([]);
            }
        };
        fetchClasses();
    }, [watchedAcademicYear, watchedCategory]);

    // Fetch Period Class list
    useEffect(() => {
        const fetchPeriods = async () => {
            if (watchedNoOfPeriods) {
                try {
                    const count = Number(watchedNoOfPeriods);
                    const res = await getPeriodClass({ period_count: count });
                    if (res?.periodlist_class) {
                        setPeriods(res.periodlist_class as any[]);
                    } else {
                        setPeriods([]);
                    }
                } catch (err) {
                    console.error('Error fetching periods', err);
                    setPeriods([]);
                }
            }
        };
        fetchPeriods();
    }, [watchedNoOfPeriods]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                TTMPC_Id: 0,
                temp_period_Array: periods.map((p) => ({
                    ttmP_Id: p.ttmP_Id,
                    ttmP_PeriodName: p.ttmP_PeriodName
                })),
                ASMAY_Id: data.asmaY_Id,
                Temp_class_Array: data.classIds.map((c) => ({
                    asmcL_Id: c.asmcL_Id,
                    asmcL_ClassName: c.asmcL_ClassName,
                    class: true // Mimic legacy structure if needed
                }))
            };

            const response = await savePeriodClass(payload);
            if (response.returnval) {
                if (data.classIds.length > 1) {
                    toast.warning('Select Only One Class !!!'); // Mimic legacy behavior/alert if needed, though successfully saved maybe?
                    // Legacy code: if (promise.returnval === true) { ... if ($scope.checkclaaslst.length > 1) { swal('Select Only One Class !!!'); } ... }
                    // Does it actually prevent save? Logic seems mixed in legacy.
                    // It says "Data successfully Saved" otherwise.
                } else {
                    toast.success('Data successfully Saved');
                }
                onSuccess?.();
            } else if (response.returnduplicatestatus === 'Duplicate') {
                toast.error('Records Already Exist !');
            } else {
                toast.error('Data Not Saved !');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                    {errors.asmaY_Id && <span className='text-red-500 text-sm'>{errors.asmaY_Id.message}</span>}
                </div>

                <div className='space-y-2'>
                    <Label>
                        Category Name <span className='text-red-500'>*</span>
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
                    {errors.ttmC_Id && <span className='text-red-500 text-sm'>{errors.ttmC_Id.message}</span>}
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
                                    const selectedObjs = vals
                                        .map((id) => {
                                            const found = classList.find((c) => c.asmcL_Id.toString() === id);
                                            return found ? { asmcL_Id: found.asmcL_Id, asmcL_ClassName: found.asmcL_ClassName } : null;
                                        })
                                        .filter((x) => x);
                                    field.onChange(selectedObjs);
                                }}
                                placeholder='Select Classes'
                            />
                        )}
                    />
                    {errors.classIds && <span className='text-red-500 text-sm'>{errors.classIds.message}</span>}
                </div>

                <div className='space-y-2'>
                    <InputText
                        label='No of Period'
                        type='number'
                        required
                        {...register('noOfPeriods')}
                        error={errors.noOfPeriods?.message}
                        min={1}
                    />
                </div>

                <div className='space-y-2 md:col-span-2'>
                    <Label>Period</Label>
                    <div className='flex flex-wrap gap-2 rounded-md border bg-muted/20 p-2'>
                        {periods.map((p) => (
                            <div key={p.ttmP_Id} className='flex items-center space-x-2 rounded border bg-background p-2'>
                                <Checkbox checked disabled />
                                <Label className='font-medium text-sm'>{p.ttmP_PeriodName}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className='flex justify-end gap-3'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    Save
                </Button>
            </div>
        </form>
    );
}
