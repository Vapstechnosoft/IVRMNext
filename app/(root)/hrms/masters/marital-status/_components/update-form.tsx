'use client';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasters';
import { MARITAL_STATUS_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MaritalStatusDetail, MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateMaritalStatusFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: MaritalStatusDetail;
}
export default function UpdateMaritalStatusForm({ onSuccess, className = '', selectedRow: row }: UpdateMaritalStatusFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterMaritalStatus(roleId);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterMaritalStatusInput>({
        mode: 'onChange'
    });
    useEffect(() => {
        if (row) {
            reset({
                IVRMMMS_Id: row.IVRMMMS_Id,
                MI_Id: row.MI_Id,
                IVRMMMS_MaritalStatus: row.IVRMMMS_MaritalStatus,
                IVRMMMS_ActiveFlag: row.IVRMMMS_ActiveFlag
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterMaritalStatusInput) => {
        const sanitizedData: MasterMaritalStatusInput = {
            ...data,
            IVRMMMS_MaritalStatus: data.IVRMMMS_MaritalStatus?.trim() || ''
        };
        try {
            const res = await saveMutation.mutateAsync(sanitizedData);
            if (res?.success) {
                toast.success(res?.message || 'Marital status updated successfully');
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to update marital status');
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to update marital status';
            toast.error(errorMsg);
        }
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={className}>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='group flex flex-col gap-1.5'>
                        <Label htmlFor='IVRMMMS_MaritalStatus'>
                            Marital Status <span className='text-destructive'>*</span>
                        </Label>
                        <HRMSInputText
                            id='IVRMMMS_MaritalStatus'
                            placeholder='Enter marital status'
                            maxLength={MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus.maxLength?.value}
                            error={errors.IVRMMMS_MaritalStatus?.message}
                            defaultValue={row.IVRMMMS_MaritalStatus}
                            {...register('IVRMMMS_MaritalStatus', MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus)}
                        />
                    </div>
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
                            Save Marital Status
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
