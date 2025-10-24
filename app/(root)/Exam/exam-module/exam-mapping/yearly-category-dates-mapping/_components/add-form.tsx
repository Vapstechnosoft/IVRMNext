'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yearlyCategoryDatesMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { addOrUpdateYearlyCategoryDatesMapping } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import type { z } from 'zod';

type FormFields = z.infer<typeof yearlyCategoryDatesMappingSchema.addOrUpdate>;

export default function AddYearlyCategoryDatesMapping({ onSuccess }: { onSuccess?: () => void }) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(yearlyCategoryDatesMappingSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            ycdm_Id: 0,
            asmaY_Id: 0,
            emcA_Id: 0,
            ycdm_ExamStartDate: '',
            ycdm_MarksEntryLastDate: '',
            ycdm_MarksPublishDate: '',
            ycdm_StartDate: '',
            ycdm_EndDate: '',
            ycdm_ActiveFlg: true,
            remarks: ''
        }
    });

    const { control, handleSubmit, reset, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);

    useEffect(() => {
        async function fetchDropdowns() {
            try {
                setAcademicYears([
                    { asmaY_Id: 1, asmaY_Year: '2023-24' },
                    { asmaY_Id: 2, asmaY_Year: '2024-25' }
                ]);

                setCategories([
                    { emcA_Id: 1, emcA_CategoryName: 'General' },
                    { emcA_Id: 2, emcA_CategoryName: 'OBC' }
                ]);
            } catch (err: any) {
                toast.error(err.message || 'Failed to load dropdowns');
            }
        }

        fetchDropdowns();
    }, []);

    const onSubmit = async (data: FormFields) => {
        try {
            const res = await addOrUpdateYearlyCategoryDatesMapping(data);
            if (res.success) {
                toast.success('Yearly category dates mapping saved successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Save failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save');
        }
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div>
                            {/* Academic Year */}
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Exam Start Date */}
                            <Controller
                                control={control}
                                name='ycdm_ExamStartDate'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Exam Start Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <CalendarYear
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(day.toISOString().split('T')[0])}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Marks Entry Last Date */}
                            <Controller
                                control={control}
                                name='ycdm_MarksEntryLastDate'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Marks Entry Last Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <CalendarYear
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(day.toISOString().split('T')[0])}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Marks Publish Date */}
                            <Controller
                                control={control}
                                name='ycdm_MarksPublishDate'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Marks Publish Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <CalendarYear
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(day.toISOString().split('T')[0])}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Category */}
                            <Controller
                                control={control}
                                name='emcA_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.emcA_Id} value={String(c.emcA_Id)}>
                                                        {c.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Mapping Start Date */}
                            <Controller
                                control={control}
                                name='ycdm_StartDate'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Mapping Start Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <CalendarYear
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(day.toISOString().split('T')[0])}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            {/* Mapping End Date */}
                            <Controller
                                control={control}
                                name='ycdm_EndDate'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Mapping End Date <span className='text-red-500'>*</span>
                                        </Label>
                                        <CalendarYear
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(day.toISOString().split('T')[0])}
                                        />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Remarks + Buttons */}
                    <div className='mt-4 flex flex-col gap-4'>
                        <div>
                            <Label>Remarks</Label>
                            <input
                                {...methods.register('remarks')}
                                placeholder='Enter remarks'
                                className='w-full rounded-md border px-3 py-2 text-sm shadow-sm'
                            />
                        </div>

                        <div className='flex gap-4'>
                            <Button type='submit' disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
