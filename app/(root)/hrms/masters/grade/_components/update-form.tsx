'use client';

import { Button } from '@/components/ui/button';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterGrade } from '@/hooks/hrms/useMasters';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateMasterGrade } from '@/server/hrms/hrmsConfig/master/grade';
import type { IMasterGradeList } from '@/types/hrms/hrms-config/master';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof hrmsMasterSchemas.grade.update>;

interface UpdateGradeFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterGradeList;
}

export default function UpdateGradeForm({ onSuccess, className = '', selectedRow: row }: UpdateGradeFormProps) {
    const { refetchAll } = useMasterGrade();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.grade.update),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                hrmG_Id: row.hrmG_Id,
                hrmG_GradeName: row.hrmG_GradeName,
                hrmG_GradeDisplayName: row.hrmG_GradeDisplayName,
                hrmG_PayScaleFrom: row.hrmG_PayScaleFrom,
                hrmG_IncrementOf: row.hrmG_IncrementOf,
                hrmG_PayScaleTo: row.hrmG_PayScaleTo,
                hrmG_Order: row.hrmG_Order
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                hrmG_Id: data.hrmG_Id,
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
                toast.success(response?.message || 'Grade updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update grade');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update grade');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <input type='hidden' {...register('hrmG_Id', { valueAsNumber: true })} />
                        <InputText
                            label='Grade Name'
                            required
                            id='hrmG_GradeName'
                            placeholder='Enter grade name'
                            maxLength={50}
                            defaultValue={row.hrmG_GradeName}
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
                            defaultValue={row.hrmG_GradeDisplayName}
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
                                    error={errors.hrmG_IncrementOf?.message}
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
                        disabled={isSubmitting || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Grade
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
