'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDesignation } from '@/hooks/hrms/useMasters';
import { designationSchema } from '@/schemas/hrms/employee-category-schemas';
import type { DesignationDetail } from '@/types/hrms/master-designation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof designationSchema.addOrUpdate>;

interface DesignationFormProps {
    selectedRow?: DesignationDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function DesignationForm({ selectedRow, onSuccess, className = '' }: DesignationFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterDesignation(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(designationSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMDES_DesignationName: '',
            HRMDES_BasicAmount: 0,
            HRMDES_SanctionedSeats: 0,
            HRMDES_DisplaySanctionedSeatsFlag: false,
            HRMDES_Order: 0,
            HRMDES_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMDES_Id: selectedRow.HRMDES_Id,
                MI_Id: selectedRow.MI_Id,
                HRMDES_DesignationName: selectedRow.HRMDES_DesignationName,
                HRMDES_BasicAmount: selectedRow.HRMDES_BasicAmount,
                HRMDES_SanctionedSeats: selectedRow.HRMDES_SanctionedSeats,
                HRMDES_DisplaySanctionedSeatsFlag: selectedRow.HRMDES_DisplaySanctionedSeatsFlag,
                HRMDES_Order: selectedRow.HRMDES_Order,
                HRMDES_ActiveFlag: selectedRow.HRMDES_ActiveFlag
            });
        } else {
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Trim whitespace from text fields
        const sanitizedData = {
            ...data,
            HRMDES_DesignationName: data.HRMDES_DesignationName?.trim() || ''
        };

        try {
            const response = await saveMutation.mutateAsync(sanitizedData);

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Designation updated successfully' : 'Designation saved successfully'));
                if (!isEditMode) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || (isEditMode ? 'Failed to update designation' : 'Failed to save designation'));
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
                        <HRMSInputText
                            label='Designation Name'
                            required
                            id='HRMDES_DesignationName'
                            placeholder='Enter designation name'
                            maxLength={50}
                            {...register('HRMDES_DesignationName')}
                            error={errors.HRMDES_DesignationName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            name='HRMDES_BasicAmount'
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
                                                    setValue('HRMDES_BasicAmount', numValue, { shouldDirty: true, shouldValidate: true });
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
                                            label='Basic Amount'
                                            id='HRMDES_BasicAmount'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMDES_BasicAmount', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMDES_BasicAmount?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMDES_SanctionedSeats'
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
                                                    setValue('HRMDES_SanctionedSeats', numValue, {
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
                                            label='Sanctioned Seats'
                                            id='HRMDES_SanctionedSeats'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMDES_SanctionedSeats', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMDES_SanctionedSeats?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <Controller
                            name='HRMDES_Order'
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
                                                    setValue('HRMDES_Order', numValue, { shouldDirty: true, shouldValidate: true });
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
                                            id='HRMDES_Order'
                                            value={field.value}
                                            onChange={(value) => {
                                                const numValue = value !== null && value !== undefined ? Number(value) : 0;
                                                field.onChange(numValue);
                                                setValue('HRMDES_Order', numValue, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            onBlur={field.onBlur}
                                            error={errors.HRMDES_Order?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    </div>
                                );
                            }}
                        />
                        <div className='flex items-center space-x-2'>
                            <Controller
                                name='HRMDES_DisplaySanctionedSeatsFlag'
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id='HRMDES_DisplaySanctionedSeatsFlag'
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor='HRMDES_DisplaySanctionedSeatsFlag' className='cursor-pointer'>
                                Display Sanctioned Seats
                            </Label>
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-start sm:items-center'>
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
                    {isEditMode && !isDirty && (
                        <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>
                    )}
                </div>
            </form>
        </div>
    );
}
