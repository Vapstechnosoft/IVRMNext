'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDepartment } from '@/hooks/hrms/useMasterDepartment';
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
        formState: { errors, isSubmitting }
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
            reset({
                HRMD_Id: selectedRow.HRMD_Id,
                MI_Id: selectedRow.MI_Id,
                HRMD_DepartmentName: selectedRow.HRMD_DepartmentName,
                HRMD_Order: selectedRow.HRMD_Order,
                HRMD_InternalTrainingMinimumHrs: selectedRow.HRMD_InternalTrainingMinimumHrs,
                HRMD_ActiveFlag: selectedRow.HRMD_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

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
                            render={({ field }) => (
                                <InputNumber
                                    label='Order'
                                    id='HRMD_Order'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.HRMD_Order?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
                        />
                        <Controller
                            name='HRMD_InternalTrainingMinimumHrs'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    label='Internal Training Min. Hours'
                                    id='HRMD_InternalTrainingMinimumHrs'
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.HRMD_InternalTrainingMinimumHrs?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            )}
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText={isEditMode ? 'Updating...' : 'Saving...'}>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isEditMode ? 'Update Department' : 'Save Department'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
