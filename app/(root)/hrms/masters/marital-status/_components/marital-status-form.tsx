import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterMaritalStatus } from '@/hooks/hrms/useMasters';
import { MARITAL_STATUS_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MaritalStatusDetail, MasterMaritalStatusInput } from '@/types/hrms/master-marital-status';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface MaritalStatusFormProps {
    selectedRow?: MaritalStatusDetail;
    onSuccess?: () => void;
}

export default function MaritalStatusForm({ selectedRow, onSuccess }: MaritalStatusFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterMaritalStatus(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterMaritalStatusInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            IVRMMMS_MaritalStatus: '',
            IVRMMMS_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                IVRMMMS_Id: selectedRow.IVRMMMS_Id,
                MI_Id: selectedRow.MI_Id,
                IVRMMMS_MaritalStatus: selectedRow.IVRMMMS_MaritalStatus,
                IVRMMMS_ActiveFlag: selectedRow.IVRMMMS_ActiveFlag
            });
        }
        // else: no selected row, form remains empty
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterMaritalStatusInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);

            if (res?.success) {
                const successMsg =
                    res?.message || (isEditMode ? 'Marital status updated successfully' : 'Marital status added successfully');
                toast.success(successMsg);

                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                if (onSuccess) {
                    onSuccess();
                }
                // else: onSuccess callback not provided
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update marital status' : 'Failed to add marital status');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 Error caught in form onSubmit:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error response data:', error?.response?.data);

            const errorMsg = error?.message || (isEditMode ? 'Failed to update marital status' : 'Failed to add marital status');
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMMS_MaritalStatus'>
                    Marital Status <span className='text-destructive'>*</span>
                </Label>
                <HRMSInputText
                    id='IVRMMMS_MaritalStatus'
                    placeholder='Enter marital status'
                    maxLength={MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus.maxLength?.value}
                    error={errors.IVRMMMS_MaritalStatus?.message}
                    {...register('IVRMMMS_MaritalStatus', MARITAL_STATUS_VALIDATION.HRMMS_MaritalStatus)}
                />
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
