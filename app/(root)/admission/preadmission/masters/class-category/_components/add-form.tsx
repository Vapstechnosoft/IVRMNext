'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropdown,
    useMasterCategoryDropdown,
    useMasterClassCategory,
    useMasterClassDropdown
} from '@/hooks/admission/preadmission/useMasters';
import { masterClassCategorySchema } from '@/schemas/admission/preadmission/masters';
import { addMasterClassCategory } from '@/server/admission/preadmission/masters/class_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassCategorySchema.add>;

interface AddMasterClassCategoryFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterClassCategoryForm({ onSuccess, className = '' }: AddMasterClassCategoryFormProps) {
    const { refetchAll } = useMasterClassCategory();
    const [selectedClassItems, setSelectedClassItems] = useState<{ asmcL_Id: string; asmcL_ClassName: string }[]>([]);

    const {
        data: academicYear,
        isLoading: academicYearLoading,
        error: academicYearError,
        refetchAll: refetchAcademicYear
    } = useAcademicYearDropdown();

    const {
        data: masterCategory,
        isLoading: masterCategoryLoading,
        error: masterCategoryError,
        refetchAll: refetchMasterCategory
    } = useMasterCategoryDropdown();

    const { data: masterClass, isLoading: masterClassLoading, refetchAll: refetchMasterClass } = useMasterClassDropdown();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassCategorySchema.add),
        mode: 'onChange'
    });

    function OnReset() {
        reset();
        setSelectedClassItems([]);
        refetchAll();
        refetchAcademicYear();
        refetchMasterCategory();
        refetchMasterClass();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { asmaY_Id, amC_Id } = data;
            const payload = {
                asmcC_Id: 0,
                asmaY_Id: asmaY_Id,
                amC_Id: amC_Id,
                category_classes: selectedClassItems.map((item) => {
                    return { asmcL_Id: item.asmcL_Id };
                })
            };

            const response = await addMasterClassCategory(payload);

            if (response.success) {
                toast.success(response.message);
                OnReset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    const handleClassSelection = (selectedValues: string[]) => {
        const selectedClasses = selectedValues.map((value) => {
            return { asmcL_Id: value.toString(), asmcL_ClassName: '' };
        });

        setSelectedClassItems(selectedClasses);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Academic Year' htmlFor='asmaY_Id'>
                                Academic Year <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a AcademicYear' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYearLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading academicYear...
                                                </SelectItem>
                                            ) : academicYearError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading academicYear
                                                </SelectItem>
                                            ) : (
                                                academicYear?.data?.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Category' htmlFor='amC_Id'>
                                Category <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='amC_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {masterCategoryLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading category...
                                                </SelectItem>
                                            ) : masterCategoryError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading category
                                                </SelectItem>
                                            ) : (
                                                masterCategory?.data?.map((item) => (
                                                    <SelectItem key={item.amC_Id} value={item.amC_Id.toString()}>
                                                        {item.amC_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.amC_Id && <FormError>{errors.amC_Id.message}</FormError>}
                        </div>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Class' htmlFor='class_ids'>
                                Class <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='class_ids'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            masterClass?.data?.map((data) => ({
                                                label: data.asmcL_ClassName,
                                                value: data.asmcL_Id.toString()
                                            })) || []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleClassSelection(selectedValues);
                                        }}
                                        defaultValue={selectedClassItems.map((data) => data.asmcL_Id)}
                                        value={selectedClassItems.map((data) => data.asmcL_Id)}
                                        placeholder='Select Classes'
                                        variant='inverted'
                                        disabled={masterClassLoading}
                                    />
                                )}
                            />

                            {errors.class_ids && <FormError>{errors.class_ids.message}</FormError>}
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
