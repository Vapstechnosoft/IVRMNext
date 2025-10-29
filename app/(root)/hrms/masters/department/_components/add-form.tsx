'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterDepartment } from '@/hooks/hrms/useMasterDepartment';
import { departmentSchema } from '@/schemas/hrms/employee-category-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof departmentSchema.addOrUpdate>;

interface AddDepartmentFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddDepartmentForm({ onSuccess, className = '' }: AddDepartmentFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterDepartment(roleId);

    const {
        register,
        handleSubmit,
        reset,
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

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

            if (response?.success) {
                toast.success(response.message || 'Department saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save department');
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
                        <InputNumber
                            label='Order'
                            id='HRMD_Order'
                            placeholder='Enter order'
                            {...register('HRMD_Order', { valueAsNumber: true })}
                            error={errors.HRMD_Order?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputNumber
                            label='Internal Training Min. Hours'
                            id='HRMD_InternalTrainingMinimumHrs'
                            placeholder='Enter training hours'
                            {...register('HRMD_InternalTrainingMinimumHrs', {
                                valueAsNumber: true
                            })}
                            error={errors.HRMD_InternalTrainingMinimumHrs?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Department
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
