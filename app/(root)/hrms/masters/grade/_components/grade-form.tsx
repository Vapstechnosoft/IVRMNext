'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasters';
import { gradeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { GradeDetail } from '@/types/hrms/master-grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof gradeSchema.addOrUpdate>;

interface GradeFormProps {
    selectedRow?: GradeDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function GradeForm({ selectedRow, onSuccess, className = '' }: GradeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGrade(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(gradeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            HRMG_Id: 0,
            MI_Id: roleId,
            HRMG_GradeName: '',
            HRMG_GradeDisplayName: '',
            HRMG_PayScaleFrom: 0,
            HRMG_IncrementOf: 0,
            HRMG_PayScaleTo: 0,
            HRMG_Order: 0,
            HRMG_ActiveFlag: true
        }
    });

    // Debug form state
    const _formValues = watch();

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMG_Id: selectedRow.HRMG_Id,
                MI_Id: selectedRow.MI_Id,
                HRMG_GradeName: selectedRow.HRMG_GradeName,
                HRMG_GradeDisplayName: selectedRow.HRMG_GradeDisplayName,
                HRMG_PayScaleFrom: selectedRow.HRMG_PayScaleFrom,
                HRMG_IncrementOf: selectedRow.HRMG_IncrementOf,
                HRMG_PayScaleTo: selectedRow.HRMG_PayScaleTo,
                HRMG_Order: selectedRow.HRMG_Order,
                HRMG_ActiveFlag: selectedRow.HRMG_ActiveFlag
            });
        } else {
        }
    }, [selectedRow, reset]);

    const handleFormSubmit = (_e?: React.FormEvent) => {};

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Trim whitespace from text fields
        const sanitizedData = {
            ...data,
            HRMG_GradeName: data.HRMG_GradeName?.trim() || '',
            HRMG_GradeDisplayName: data.HRMG_GradeDisplayName?.trim() || ''
        };

        try {
            const response = await saveMutation.mutateAsync(sanitizedData);

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Grade updated successfully' : 'Grade saved successfully'));
                if (!isEditMode) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || (isEditMode ? 'Failed to update grade' : 'Failed to save grade'));
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={className}>
            <form
                onSubmit={(e) => {
                    handleFormSubmit(e);
                    handleSubmit(onSubmit)(e);
                }}
                className='space-y-6'>
                <input type='hidden' {...register('HRMG_Id')} />
                <input type='hidden' {...register('MI_Id')} />
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <HRMSInputText
                            label='Grade Name'
                            required
                            id='HRMG_GradeName'
                            placeholder='Enter grade name'
                            maxLength={50}
                            {...register('HRMG_GradeName')}
                            error={errors.HRMG_GradeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <HRMSInputText
                            label='Grade Display Name'
                            required
                            id='HRMG_GradeDisplayName'
                            placeholder='Enter grade display name'
                            maxLength={50}
                            {...register('HRMG_GradeDisplayName')}
                            error={errors.HRMG_GradeDisplayName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            name='HRMG_PayScaleFrom'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () =>
                                        containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMG_PayScaleFrom', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Pay Scale From'
                                            id='HRMG_PayScaleFrom'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMG_PayScaleFrom', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMG_PayScaleFrom?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMG_IncrementOf'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () =>
                                        containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMG_IncrementOf', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Increment Of'
                                            id='HRMG_IncrementOf'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMG_IncrementOf', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMG_IncrementOf?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMG_PayScaleTo'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () =>
                                        containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMG_PayScaleTo', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Pay Scale To'
                                            id='HRMG_PayScaleTo'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMG_PayScaleTo', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMG_PayScaleTo?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMG_Order'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () =>
                                        containerElement.querySelector('input[type="text"], input[type="number"]') as HTMLInputElement;
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) return;
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMG_Order', numValue, { shouldDirty: true, shouldValidate: true });
                                                }
                                            }
                                        };
                                        inputElement.addEventListener('input', handleInput, { passive: true });
                                        (inputElement as any).__dirtyHandlerAttached = true;
                                    };
                                    attachListener();
                                };
                                return (
                                    <div ref={containerRefCallback}>
                                        <InputNumber
                                            label='Order'
                                            id='HRMG_Order'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMG_Order', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMG_Order?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='submit'
                        disabled={isSubmitting || (isEditMode && !isDirty)}
                        className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90'
                        isLoading={isSubmitting}
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        {isEditMode ? 'Update' : 'Save'}
                    </Button>
                    <Button
                        type='button'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-secondary text-secondary-foreground hover:opacity-90'>
                        Clear
                    </Button>
                </div>
            </form>
        </div>
    );
}
