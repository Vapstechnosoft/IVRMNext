import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterSpecialization } from '@/hooks/hrms/useMasters';
import { SPECIALIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { MasterSpecializationInput, SpecializationItem } from '@/types/hrms/master-specialization';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SpecializationFormProps {
    selectedRow?: SpecializationItem;
    onSuccess?: () => void;
}

export default function SpecializationForm({ selectedRow, onSuccess }: SpecializationFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterSpecialization(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterSpecializationInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMSPL_SpecialisationName: '',
            HRMSPL_ActiveFlg: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMSPL_Id: selectedRow.HRMSPL_Id,
                MI_Id: selectedRow.MI_Id,
                HRMSPL_SpecialisationName: selectedRow.HRMSPL_SpecialisationName,
                HRMSPL_ActiveFlg: selectedRow.HRMSPL_ActiveFlg
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterSpecializationInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(res?.message || (isEditMode ? 'Specialization updated successfully' : 'Specialization added successfully'));
                if (onSuccess) onSuccess();
            } else {
                toast.error(res?.message || (isEditMode ? 'Failed to update specialization' : 'Failed to add specialization'));
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                (isEditMode ? 'Failed to update specialization' : 'Failed to add specialization');
            toast.error(errorMessage);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMSPL_SpecialisationName'>
                    Specialization Name <span className='text-destructive'>*</span>
                </Label>
                <HRMSInputText
                    id='HRMSPL_SpecialisationName'
                    placeholder='Enter specialization name'
                    maxLength={SPECIALIZATION_VALIDATION.HRMSPL_SpecialisationName.maxLength?.value || 10}
                    error={errors.HRMSPL_SpecialisationName?.message}
                    {...register('HRMSPL_SpecialisationName', SPECIALIZATION_VALIDATION.HRMSPL_SpecialisationName)}
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
