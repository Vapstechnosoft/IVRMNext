'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterClassCategory } from '@/hooks/fees/useMasters';
import { masterClassSchema } from '@/schemas/fees/masters';
import { addOrUpdateMasterClassCategory } from '@/server/fees/masters/class_category';
import type { IMasterClassYearlyCategoryList, IMasterClassYearlyList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

interface UpdateMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow?: IMasterClassYearlyCategoryList | null;
}

export default function UpdateMasterClassForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterClassFormProps) {
    const { data: academicYearsData = [], isLoading: loadingYears } = useAcademicYearDropdown();

    const { data: classCategoriesData = [], isLoading: loadingCategories, refetchAll } = useMasterClassCategory();

    const academicYears = (academicYearsData ?? []) as IMasterClassYearlyList[];
    const classCategories = (classCategoriesData ?? []) as IMasterClassYearlyCategoryList[];

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            academicYearId: '',
            categoryId: '',
            asmcl_id: 0
        }
    });

    useEffect(() => {
        if (row) {
            reset({
                academicYearId: row.asmaY_Year ?? '',
                categoryId: row.asmcC_Id?.toString() ?? '',
                asmcl_id: row.asmcC_Id ?? 0
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!row) {
            console.warn('No valid class selected for update');
            return;
        }

        try {
            const payload = {
                // MI_Id: row.mi_id,
                ASMCL_Id: row.asmcC_Id,
                AcademicYear: data.academicYearId,
                ClassCategoryId: data.categoryId,
                ASMCL_ActiveFlag: row.is_Active
            };

            const _response = await addOrUpdateMasterClassCategory(payload);

            refetchAll();
            reset();
            onSuccess?.();
        } catch (error) {
            console.error('Error updating class category:', error);
        }
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Dropdowns */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Academic Year */}
                    <div className='flex flex-col gap-2'>
                        <Label>Academic Year</Label>
                        <Select
                            onValueChange={(val) => setValue('academicYearId', val)}
                            value={watch('academicYearId')}
                            disabled={loadingYears}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingYears ? 'Loading...' : 'Select Academic Year'} />
                            </SelectTrigger>
                            <SelectContent>
                                {academicYears.map((year) => (
                                    <SelectItem key={year.asmcL_Id} value={year.asmcL_AcademicYear}>
                                        {year.asmcL_AcademicYear}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError>{errors.academicYearId?.message}</FormError>
                    </div>

                    {/* Master Class Category */}
                    <div className='flex flex-col gap-2'>
                        <Label>Master Class Category</Label>
                        <Select
                            onValueChange={(val) => setValue('categoryId', val)}
                            value={watch('categoryId')}
                            disabled={loadingCategories}>
                            <SelectTrigger>
                                <SelectValue placeholder={loadingCategories ? 'Loading...' : 'Select Class Category'} />
                            </SelectTrigger>
                            <SelectContent>
                                {classCategories.map((cat) => (
                                    <SelectItem key={cat.asmcC_Id} value={cat.asmcC_Id.toString()}>
                                        {cat.amC_Name} - {cat.asmcL_ClassName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError>{errors.categoryId?.message}</FormError>
                    </div>
                </div>

                {/* Root Errors */}
                {errors.root && <FormError>{errors.root.message}</FormError>}

                {/* Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        disabled={isSubmitting}
                        onClick={() => reset()}
                        className='order-2 w-fit transition-all hover:scale-105 sm:order-1'>
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'
                        className='order-1 w-fit transition-all hover:scale-105 sm:order-2'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Master Class
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
