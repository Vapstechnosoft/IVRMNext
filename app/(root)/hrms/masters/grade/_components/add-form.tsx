'use client';

import { Button } from '@/components/ui/button';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterGrade } from '@/hooks/hrms/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateMasterGrade } from '@/server/hrms/hrmsConfig/master/grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type FieldErrors, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.grade.add>;

interface AddGradeFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddGradeForm({ onSuccess, className = '' }: AddGradeFormProps) {
    const { refetchAll } = useMasterGrade();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.grade.add),
        mode: 'onChange',
        defaultValues: {
            hrmG_PayScaleFrom: 0,
            hrmG_IncrementOf: 0,
            hrmG_PayScaleTo: 0,
            hrmG_Order: 0
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                hrmG_Id: 0,
                hrmG_GradeName: data.hrmG_GradeName?.trim() || '',
                hrmG_GradeDisplayName: data.hrmG_GradeDisplayName?.trim() || '',
                hrmG_PayScaleFrom: data.hrmG_PayScaleFrom || 0,
                hrmG_IncrementOf: data.hrmG_IncrementOf || 0,
                hrmG_PayScaleTo: data.hrmG_PayScaleTo || 0,
                hrmG_Order: data.hrmG_Order || 0,
                hrmG_ActiveFlag: true
            };
            const response = await addOrUpdateMasterGrade(payload);

            if (response?.success) {
                toast.success(response?.message || 'Grade saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save grade');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save grade');
        }
    };

    const handleReset = () => {
        reset();
    };

    const onError = (errors: FieldErrors<FormFields>) => {
        // Show first error message
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        } else {
            toast.error('Please fix the validation errors before submitting');
        }
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit, onError)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Grade Name'
                            required
                            id='hrmG_GradeName'
                            placeholder='Enter grade name'
                            maxLength={50}
                            {...register('hrmG_GradeName')}
                            error={errors.hrmG_GradeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <InputText
                            label='Grade Display Name'
                            required
                            id='hrmG_GradeDisplayName'
                            placeholder='Enter grade display name'
                            maxLength={50}
                            {...register('hrmG_GradeDisplayName')}
                            error={errors.hrmG_GradeDisplayName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />

                        <Controller
                            name='hrmG_PayScaleFrom'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Pay Scale From'
                                    id='hrmG_PayScaleFrom'
                                    value={field.value}
                                    maxDigits={10}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmG_PayScaleFrom?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='hrmG_IncrementOf'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Increment Of'
                                    id='hrmG_IncrementOf'
                                    value={field.value}
                                    maxDigits={3}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmG_IncrementOf?.message as string}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='hrmG_PayScaleTo'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Pay Scale To'
                                    id='hrmG_PayScaleTo'
                                    value={field.value}
                                    maxDigits={10}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmG_PayScaleTo?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />

                        <Controller
                            name='hrmG_Order'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Order'
                                    id='hrmG_Order'
                                    value={field.value}
                                    onChange={(value) => {
                                        const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                        field.onChange(numValue);
                                    }}
                                    onBlur={field.onBlur}
                                    error={errors.hrmG_Order?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                    </div>
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
                            Save Grade
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
