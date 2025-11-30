'use client';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
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
interface UpdateGroupTypeFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: GroupTypeDetail;
}
export default function UpdateGroupTypeForm({ onSuccess, className = '', selectedRow: row }: UpdateGroupTypeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGroupType(roleId);
    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(groupTypeSchema.addOrUpdate),
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                HRMGT_Id: row.HRMGT_Id,
                MI_Id: row.MI_Id,
                HRMGT_EmployeeGroupType: row.HRMGT_EmployeeGroupType,
                HRMGT_Code: row.HRMGT_Code,
                HRMGT_Order: row.HRMGT_Order,
                HRMGT_ActiveFlag: row.HRMGT_ActiveFlag
            });
        }
    }, [row, reset]);
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const trimmedData = {
            ...data,
            HRMGT_EmployeeGroupType: data.HRMGT_EmployeeGroupType?.trim() || '',
            HRMGT_Code: data.HRMGT_Code?.trim() || ''
        };
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
                toast.success(response.message || 'Group type updated successfully');
                refetchAll();
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 300);
                }
            } else {
                toast.error(response?.message || 'Failed to update group type');
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
                            label='Employee Group Type'
                            required
                            id='HRMGT_EmployeeGroupType'
                            placeholder='Enter employee group type'
                            maxLength={50}
                            {...register('HRMGT_EmployeeGroupType')}
                            defaultValue={row.HRMGT_EmployeeGroupType}
                            error={errors.HRMGT_EmployeeGroupType?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <HRMSInputText
                            label='Code'
                            required
                            id='HRMGT_Code'
                            placeholder='Enter code'
                            maxLength={20}
                            {...register('HRMGT_Code')}
                            defaultValue={row.HRMGT_Code}
                            error={errors.HRMGT_Code?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Controller
                            name='HRMGT_Order'
                            control={control}
                            render={({ field }) => {
                                const containerRefCallback = (containerElement: HTMLDivElement | null) => {
                                    if (!containerElement) return;
                                    const findInput = () => {
                                        return containerElement.querySelector(
                                            'input[type="text"], input[type="number"]'
                                        ) as HTMLInputElement;
                                    };
                                    const attachListener = () => {
                                        const inputElement = findInput();
                                        if (!inputElement) {
                                            setTimeout(attachListener, 50);
                                            return;
                                        }
                                        if ((inputElement as any).__dirtyHandlerAttached) {
                                            return;
                                        }
                                        const handleInput = (e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            const inputValue = target.value.trim();
                                            if (inputValue !== '' && !Number.isNaN(Number(inputValue))) {
                                                const numValue = Number(inputValue);
                                                const currentValue = field.value || 0;
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
                            Save Group Type
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
