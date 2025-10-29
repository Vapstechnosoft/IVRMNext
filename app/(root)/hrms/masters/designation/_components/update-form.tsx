'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDesignation } from '@/hooks/hrms/useMasterDesignation';
import { designationSchema } from '@/schemas/hrms/employee-category-schemas';
import type { DesignationDetail } from '@/types/hrms/master-designation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof designationSchema.addOrUpdate>;

interface UpdateDesignationFormProps {
    selectedRow: DesignationDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateDesignationForm({ selectedRow, onSuccess, className = '' }: UpdateDesignationFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterDesignation(roleId);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(designationSchema.addOrUpdate),
        mode: 'onChange'
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
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

            if (response?.success) {
                toast.success(response.message || 'Designation updated successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update designation');
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
                            label='Designation Name'
                            required
                            id='HRMDES_DesignationName'
                            placeholder='Enter designation name'
                            {...register('HRMDES_DesignationName')}
                            error={errors.HRMDES_DesignationName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Basic Amount'
                            required
                            id='HRMDES_BasicAmount'
                            placeholder='Enter basic amount'
                            {...register('HRMDES_BasicAmount', { valueAsNumber: true })}
                            error={errors.HRMDES_BasicAmount?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Sanctioned Seats'
                            required
                            id='HRMDES_SanctionedSeats'
                            placeholder='Enter sanctioned seats'
                            {...register('HRMDES_SanctionedSeats', { valueAsNumber: true })}
                            error={errors.HRMDES_SanctionedSeats?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputNumber
                            label='Order'
                            id='HRMDES_Order'
                            placeholder='Enter order'
                            {...register('HRMDES_Order', { valueAsNumber: true })}
                            error={errors.HRMDES_Order?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMDES_DisplaySanctionedSeatsFlag'>Display Sanctioned Seats</Label>
                            <Controller
                                name='HRMDES_DisplaySanctionedSeatsFlag'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2 pt-2'>
                                        <Checkbox
                                            id='HRMDES_DisplaySanctionedSeatsFlag'
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                        <label
                                            htmlFor='HRMDES_DisplaySanctionedSeatsFlag'
                                            className='cursor-pointer text-muted-foreground text-sm'>
                                            Show sanctioned seats count
                                        </label>
                                    </div>
                                )}
                            />
                            {errors.HRMDES_DisplaySanctionedSeatsFlag && (
                                <FormError>{errors.HRMDES_DisplaySanctionedSeatsFlag.message}</FormError>
                            )}
                        </div>
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Designation
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
