'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGrade } from '@/hooks/hrms/useMasterGrade';
import { gradeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { GradeDetail } from '@/types/hrms/master-grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
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
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(gradeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
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
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await saveMutation.mutateAsync(data);

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
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <InputText
                            label='Grade Name'
                            required
                            id='HRMG_GradeName'
                            placeholder='Enter grade name'
                            {...register('HRMG_GradeName')}
                            error={errors.HRMG_GradeName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Grade Display Name'
                            required
                            id='HRMG_GradeDisplayName'
                            placeholder='Enter grade display name'
                            {...register('HRMG_GradeDisplayName')}
                            error={errors.HRMG_GradeDisplayName?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Input
                            type='number'
                            id='HRMG_PayScaleFrom'
                            {...register('HRMG_PayScaleFrom', { valueAsNumber: true })}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Input
                            type='number'
                            id='HRMG_IncrementOf'
                            {...register('HRMG_IncrementOf', { valueAsNumber: true })}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Input
                            type='number'
                            id='HRMG_PayScaleTo'
                            {...register('HRMG_PayScaleTo', { valueAsNumber: true })}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <Input
                            type='number'
                            id='HRMG_Order'
                            {...register('HRMG_Order', { valueAsNumber: true })}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
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
                            {isEditMode ? 'Update Grade' : 'Save Grade'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
