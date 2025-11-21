'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDepartment } from '@/hooks/hrms/useMasters';
import { departmentSchema } from '@/schemas/hrms/employee-category-schemas';
import type { DepartmentDetail } from '@/types/hrms/master-department';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof departmentSchema.addOrUpdate>;

interface DepartmentFormProps {
    selectedRow?: DepartmentDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function DepartmentForm({ selectedRow, onSuccess, className = '' }: DepartmentFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterDepartment(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(departmentSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMD_DepartmentName: '',
            HRMD_Order: 0,
            HRMD_InternalTrainingMinimumHrs: 0,
            HRMD_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset(
                {
                    HRMD_Id: selectedRow.HRMD_Id,
                    MI_Id: selectedRow.MI_Id,
                    HRMD_DepartmentName: selectedRow.HRMD_DepartmentName,
                    HRMD_Order: selectedRow.HRMD_Order,
                    HRMD_InternalTrainingMinimumHrs: selectedRow.HRMD_InternalTrainingMinimumHrs,
                    HRMD_ActiveFlag: selectedRow.HRMD_ActiveFlag
                },
                { keepDefaultValues: false }
            ); // Reset default values to mark form as clean
        }
    }, [selectedRow, reset]);
    if (isEditMode) {
    }

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync({
                ...data,
                HRMD_InternalTrainingMinimumHrs: data.HRMD_InternalTrainingMinimumHrs ?? 0
            });

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Department updated successfully' : 'Department saved successfully'));
                if (!isEditMode) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || (isEditMode ? 'Failed to update department' : 'Failed to save department'));
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
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Department Name'
                            required
                            id='HRMD_DepartmentName'
                            placeholder='Enter department name'
                            {...register('HRMD_DepartmentName')}
                            error={errors.HRMD_DepartmentName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            name='HRMD_Order'
                            control={control}
                            render={({ field }) => {
                                // Callback ref to attach input listener when element is mounted
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;

                                    // Find the actual input element inside the NumberField
                                    const findInput = () => {
                                        return containerElement.querySelector(
                                            'input[type="text"], input[type="number"]'
                                        ) as HTMLInputElement;
                                    };

                                    // Try to find input immediately, or after a short delay for React Aria rendering
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }

                                        // Check if listener is already attached to avoid duplicates
                                        if ((inputElement as any).__dirtyHandlerAttached) {
                                            return;
                                        }

                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();

                                            // Only process if there's a valid number
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                // Get current value from the field to compare
                                                const currentValue = field.value || 0;
                                                // Check if value actually changed to avoid unnecessary updates
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMD_Order', numValue, { shouldDirty: true, shouldValidate: true });
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
                                            id='HRMD_Order'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                // Explicitly mark field as dirty
                                                setValue('HRMD_Order', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMD_Order?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMD_InternalTrainingMinimumHrs'
                            control={control}
                            render={({ field }) => {
                                // Callback ref to attach input listener when element is mounted
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;

                                    // Find the actual input element inside the NumberField
                                    const findInput = () => {
                                        return containerElement.querySelector(
                                            'input[type="text"], input[type="number"]'
                                        ) as HTMLInputElement;
                                    };

                                    // Try to find input immediately, or after a short delay for React Aria rendering
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }

                                        // Check if listener is already attached to avoid duplicates
                                        if ((inputElement as any).__dirtyHandlerAttached) {
                                            return;
                                        }

                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();

                                            // Only process if there's a valid number
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                // Get current value from the field to compare
                                                const currentValue = field.value || 0;
                                                // Check if value actually changed to avoid unnecessary updates
                                                if (Math.abs(numValue - currentValue) > 0.0001) {
                                                    field.onChange(numValue);
                                                    setValue('HRMD_InternalTrainingMinimumHrs', numValue, {
                                                        shouldDirty: true,
                                                        shouldValidate: true
                                                    });
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
                                            label='Internal Training Min. Hours'
                                            id='HRMD_InternalTrainingMinimumHrs'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                // Explicitly mark field as dirty
                                                setValue('HRMD_InternalTrainingMinimumHrs', numValue, {
                                                    shouldDirty: true,
                                                    shouldValidate: true
                                                });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMD_InternalTrainingMinimumHrs?.message}
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
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || (isEditMode && !isDirty)}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditMode ? 'Update Department' : 'Save Department'}
                        </div>
                    </Button>
                    {isEditMode && !isDirty && (
                        <span className='order-3 flex items-center text-muted-foreground text-sm sm:order-3'>No changes made</span>
                    )}
                </div>
            </form>
        </div>
    );
}
