'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { masterCategorySchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateExamMasterCategory } from '@/server/exam/exam-module/masters/category';
import type { IMasterCategory } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterCategorySchema.addOrUpdate>;

interface UpdateMasterCategoryFormProps {
    initialData: IMasterCategory;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateMasterCategoryForm({ initialData, onSuccess, className = '' }: UpdateMasterCategoryFormProps) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterCategorySchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ex_Id: initialData?.ex_Id ?? undefined,
            ex_CategoryName: initialData?.ex_CategoryName ?? '',
            ex_CCEPromotionApplicableFlag: initialData?.ex_CCEPromotionApplicableFlag === 1 ? 1 : 0,
            ex_IsActiveFlag: initialData?.ex_IsActiveFlag ? 1 : 0
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                ex_Id: initialData?.ex_Id,
                ex_CategoryName: initialData?.ex_CategoryName ?? '',
                ex_CCEPromotionApplicableFlag: initialData?.ex_CCEPromotionApplicableFlag === 1 ? 1 : 0,
                ex_IsActiveFlag: initialData?.ex_IsActiveFlag ? 1 : 0
            });
        }
    }, [initialData, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                ex_CCEPromotionApplicableFlag: Number(data.ex_CCEPromotionApplicableFlag),
                ex_IsActiveFlag: Number(data.ex_IsActiveFlag)
            };

            const response = await addOrUpdateExamMasterCategory(payload);

            if (response.success) {
                toast.success('Category updated successfully');
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update category');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset({
            ex_Id: initialData?.ex_Id,
            ex_CategoryName: initialData?.ex_CategoryName ?? '',
            ex_CCEPromotionApplicableFlag: initialData?.ex_CCEPromotionApplicableFlag === 1 ? 1 : 0,
            ex_IsActiveFlag: initialData?.ex_IsActiveFlag ? 1 : 0
        });
    };

    return (
        <div className={`${className} flex items-center justify-center`}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col space-y-6'>
                <div className='w-full space-y-4'>
                    {/* Row 1 - Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Category Name'
                            required
                            id='ex_CategoryName'
                            {...register('ex_CategoryName')}
                            error={errors.ex_CategoryName?.message}
                        />
                    </div>

                    {/* Applicable CCE Promotion */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='group flex flex-col gap-2'>
                            <Label htmlFor='ex_CCEPromotionApplicableFlag'>
                                Applicable CCE Promotion <span className='ml-1 text-red-500'>*</span>
                            </Label>

                            <Controller
                                name='ex_CCEPromotionApplicableFlag'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                        value={String(field.value ?? 1)}
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='active-yes' />
                                            <Label htmlFor='active-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='0' id='active-no' />
                                            <Label htmlFor='active-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />

                            {errors.ex_CCEPromotionApplicableFlag && <FormError>{errors.ex_CCEPromotionApplicableFlag.message}</FormError>}
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        <RefreshCw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Category
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
