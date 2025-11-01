import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
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
    const { saveMutation } = useMasterMaritalStatus(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterMaritalStatusInput>({
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
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterMaritalStatusInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(isEditMode ? 'Marital status updated successfully' : 'Marital status added successfully');
                if (onSuccess) onSuccess();
            }
        } catch (_error) {
            toast.error(isEditMode ? 'Failed to update marital status' : 'Failed to add marital status');
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMMS_MaritalStatus'>
                    Marital Status <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='IVRMMMS_MaritalStatus'
                    placeholder='Enter marital status'
                    {...register('IVRMMMS_MaritalStatus', MARITAL_STATUS_VALIDATION.maritalStatus)}
                />
                {errors.IVRMMMS_MaritalStatus && <FormError>{errors.IVRMMMS_MaritalStatus.message}</FormError>}
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
