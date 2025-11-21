'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGroupType } from '@/hooks/hrms/useMasters';
import { groupTypeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { GroupTypeDetail } from '@/types/hrms/master-group-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof groupTypeSchema.addOrUpdate>;

interface GroupTypeFormProps {
    selectedRow?: GroupTypeDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function GroupTypeForm({ selectedRow, onSuccess, className = '' }: GroupTypeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGroupType(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty, isValid }
    } = useForm<FormFields>({
        resolver: zodResolver(groupTypeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMGT_EmployeeGroupType: '',
            HRMGT_Code: '',
            HRMGT_Order: 0,
            HRMGT_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMGT_Id: selectedRow.HRMGT_Id,
                MI_Id: selectedRow.MI_Id,
                HRMGT_EmployeeGroupType: selectedRow.HRMGT_EmployeeGroupType,
                HRMGT_Code: selectedRow.HRMGT_Code,
                HRMGT_Order: selectedRow.HRMGT_Order,
                HRMGT_ActiveFlag: selectedRow.HRMGT_ActiveFlag
            });
        }
        // else: no selected row, form remains empty
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Trim and validate required fields before submission
        const trimmedData = {
            ...data,
            HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType?.trim() || '',
            HRMGT_Code: data.HRMGT_Code?.trim() || ''
        };

        // Additional validation check
        if (!trimmedData.HRMGT_EmployeeGroupType || trimmedData.HRMGT_EmployeeGroupType.length === 0) {
            toast.error('Employee Group Type is required');
            return;
        }

        if (!trimmedData.HRMGT_Code || trimmedData.HRMGT_Code.length === 0) {
            toast.error('Code is required');
            return;
        }

        try {
            const response = await saveMutation.mutateAsync(trimmedData);

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Group type updated successfully' : 'Group type saved successfully'));
                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                // Small delay to ensure refetch completes before closing form
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 300);
                }
            } else {
                toast.error(response?.message || (isEditMode ? 'Failed to update group type' : 'Failed to save group type'));
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
                            label='Employee Group Type'
                            required
                            id='HRMGT_EmployeeGroupType'
                            placeholder='Enter employee group type'
                            {...register('HRMGT_EmployeeGroupType')}
                            error={errors.HRMGT_EmployeeGroupType?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Code'
                            required
                            id='HRMGT_Code'
                            placeholder='Enter code'
                            {...register('HRMGT_Code')}
                            error={errors.HRMGT_Code?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            name='HRMGT_Order'
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
                                                    setValue('HRMGT_Order', numValue, { shouldDirty: true, shouldValidate: true });
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
                                            required
                                            id='HRMGT_Order'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMGT_Order', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMGT_Order?.message}
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
                        disabled={isSubmitting || (isEditMode && !isDirty) || !isValid}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditMode ? 'Update Group Type' : 'Save Group Type'}
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
