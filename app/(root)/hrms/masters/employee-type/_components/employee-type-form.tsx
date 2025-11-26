'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterEmployeeType } from '@/hooks/hrms/useMasters';
import { employeeTypeSchema } from '@/schemas/hrms/employee-category-schemas';
import type { EmployeeTypeDetail } from '@/types/hrms/master-employee-type';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof employeeTypeSchema.addOrUpdate>;

interface EmployeeTypeFormProps {
    selectedRow?: EmployeeTypeDetail;
    onSuccess?: () => void;
    className?: string;
}

export default function EmployeeTypeForm({ selectedRow, onSuccess, className = '' }: EmployeeTypeFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterEmployeeType(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(employeeTypeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMET_EmployeeType: '',
            HRMET_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMET_Id: selectedRow.HRMET_Id,
                MI_Id: selectedRow.MI_Id,
                HRMET_EmployeeType: selectedRow.HRMET_EmployeeType,
                HRMET_ActiveFlag: selectedRow.HRMET_ActiveFlag
            });
        }
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        // Trim whitespace from text fields
        const sanitizedData = {
            ...data,
            HRMET_EmployeeType: data.HRMET_EmployeeType?.trim() || ''
        };

        try {
            const response = await saveMutation.mutateAsync(sanitizedData);

            if (response?.success) {
                toast.success(response.message || (isEditMode ? 'Employee type updated successfully' : 'Employee type saved successfully'));
                if (!isEditMode) reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || (isEditMode ? 'Failed to update employee type' : 'Failed to save employee type'));
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
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <HRMSInputText
                            label='Employee Type'
                            required
                            id='HRMET_EmployeeType'
                            placeholder='Enter employee type'
                            maxLength={50}
                            {...register('HRMET_EmployeeType')}
                            error={errors.HRMET_EmployeeType?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
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
