'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yearlyCategoryDatesMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import {
    addOrUpdateYearlyCategoryDatesMapping,
    getCategoryDropDownByAcademicYearlist
} from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import { getAcademicYears } from '@/server/exam/exam-module/masters/category-class-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof yearlyCategoryDatesMappingSchema.addOrUpdate>;

export default function AddYearlyCategoryDatesMapping({ onSuccess }: { onSuccess?: () => void }) {
    const orgId = 30;

    const methods = useForm<FormFields>({
        resolver: zodResolver(yearlyCategoryDatesMappingSchema.addOrUpdate),
        mode: 'all',
        defaultValues: {
            eyC_Id: 0,
            mI_Id: orgId,
            asmaY_Id: 0,
            emcA_Id: 0,
            eyC_ExamStartDate: '',
            eyC_ExamEndDate: '',
            eyC_MarksEntryLastDate: '',
            eyC_MarksProcessLastDate: '',
            eyC_MarksPublishDate: ''
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);

    // Fetch academic years on mount
    useEffect(() => {
        async function fetchYears() {
            try {
                const years = await getAcademicYears();
                setAcademicYears(Array.isArray(years) ? years : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load academic years');
            }
        }
        fetchYears();
    }, []);

    // Watch selected Academic Year
    const selectedYearId = useWatch({
        control,
        name: 'asmaY_Id'
    });

    // Fetch categories whenever Academic Year changes
    useEffect(() => {
        if (!selectedYearId) return;
        async function fetchCategories() {
            try {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(orgId, selectedYearId);
                setCategories(Array.isArray(cats) ? cats : []);
                setValue('emcA_Id', 0); // reset selected category whenever year changes
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load categories');
            }
        }
        fetchCategories();
    }, [selectedYearId]);

    const onSubmit = async (data: FormFields) => {
        try {
            const res = await addOrUpdateYearlyCategoryDatesMapping(data);
            if (res?.success) {
                toast.success('Yearly category dates mapping saved successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(res?.message ?? 'Save failed');
            }
        } catch (err: any) {
            toast.error(err?.message ?? 'Failed to save');
        }
    };

    // Reusable DateField component
    const DateField = ({
        field,
        fieldState,
        label,
        placeholder
    }: {
        field: any;
        fieldState: any;
        label: string;
        placeholder?: string;
    }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef<HTMLDivElement | null>(null);

        useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (ref.current && !ref.current.contains(e.target as Node)) {
                    setOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className='relative mt-4' ref={ref}>
                <Label>
                    {label} <span className='text-red-500'>*</span>
                </Label>
                <input
                    readOnly
                    value={field.value ?? ''}
                    placeholder={placeholder}
                    onClick={() => setOpen(true)}
                    className='w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-sm'
                />
                {open && (
                    <div className='absolute z-50 mt-2'>
                        <div className='rounded-md bg-white shadow-lg'>
                            <CalendarYear
                                selected={field.value ? new Date(field.value) : undefined}
                                onDayClick={(day) => {
                                    field.onChange(day.toISOString().split('T')[0]);
                                    setOpen(false);
                                }}
                            />
                        </div>
                    </div>
                )}
                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
            </div>
        );
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div>
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

                            <Controller
                                control={control}
                                name='eyC_ExamStartDate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Exam Start Date'
                                        placeholder='Select Exam Start Date'
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name='eyC_MarksEntryLastDate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Marks Entry Last Date'
                                        placeholder='Select Marks Entry Last Date'
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name='eyC_MarksPublishDate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Marks Publish Date'
                                        placeholder='Select Marks Publish Date'
                                    />
                                )}
                            />
                        </div>

                        {/* Right Column */}
                        <div>
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
                            <Controller
                                control={control}
                                name='eyC_ExamEndDate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Exam End Date'
                                        placeholder='Select Exam End Date'
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name='eyC_MarksProcessLastDate'
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Marks Process Last Date'
                                        placeholder='Select Marks Process Last Date'
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='mt-4 flex justify-start gap-4'>
                        <Button type='submit' className='w-fit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='outline' className='w-fit' onClick={() => reset()}>
                            Reset
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
