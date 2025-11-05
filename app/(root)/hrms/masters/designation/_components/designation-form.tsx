'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
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
        formState: { errors, isSubmitting }
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
            console.log('📝 [DESIGNATION FORM] Edit mode - Loading selectedRow:', JSON.stringify(selectedRow, null, 2));
            console.log('📝 [DESIGNATION FORM] Order value from selectedRow:', selectedRow.HRMDES_Order);
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
            console.log('📝 [DESIGNATION FORM] Form reset with edit data, order:', selectedRow.HRMDES_Order);
        } else {
            console.log('📝 [DESIGNATION FORM] Add mode - No selectedRow');
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        console.log('🔵 ========== DESIGNATION FORM SUBMIT ==========');
        console.log('🔵 [FORM] Designation submit - Data:', JSON.stringify(data, null, 2));
        console.log('🔵 [FORM] Is Edit Mode:', isEditMode);
        console.log('🔵 [FORM] Order value in data:', data.HRMDES_Order);
        console.log('🔵 [FORM] HRMDES_Id:', data.HRMDES_Id);
        
        try {
            const response = await saveMutation.mutateAsync(data);
            console.log('🟢 [FORM] Designation response:', JSON.stringify(response, null, 2));

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Designation updated successfully' : 'Designation saved successfully'));
                if (!isEditMode) reset();
                refetchAll();
                onSuccess?.();
            } else {
                console.log('❌ [FORM] Designation failed:', response?.message);
                toast.error(response?.message || (isEditMode ? 'Failed to update designation' : 'Failed to save designation'));
            }
        } catch (error: any) {
            console.log('🔴 [FORM] Designation error:', error);
            toast.error(error.message || 'An error occurred');
        }
        
        console.log('🔵 ========== DESIGNATION FORM SUBMIT END ==========');
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
                        <Controller
                            name='HRMDES_BasicAmount'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Basic Amount'
                                    id='HRMDES_BasicAmount'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.HRMDES_BasicAmount?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                        <Controller
                            name='HRMDES_SanctionedSeats'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Sanctioned Seats'
                                    id='HRMDES_SanctionedSeats'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.HRMDES_SanctionedSeats?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                        <Controller
                            name='HRMDES_Order'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Order'
                                    id='HRMDES_Order'
                                    value={field.value}
                                    onChange={(value) => {
                                        console.log('📝 [DESIGNATION FORM] Order field changed to:', value);
                                        field.onChange(value);
                                    }}
                                    error={errors.HRMDES_Order?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
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
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditMode ? 'Update Designation' : 'Save Designation'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
