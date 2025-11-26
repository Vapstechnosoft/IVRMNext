import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterGender } from '@/hooks/hrms/useMasters';
import { GENDER_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { GenderItem, MasterGenderInput } from '@/types/hrms/master-gender';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface GenderFormProps {
    selectedRow?: GenderItem;
    onSuccess?: () => void;
}

export default function GenderForm({ selectedRow, onSuccess }: GenderFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterGender(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty }
    } = useForm<MasterGenderInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            IVRMMG_GenderName: '',
            IVRMMG_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                IVRMMG_Id: selectedRow.IVRMMG_Id,
                MI_Id: selectedRow.MI_Id,
                IVRMMG_GenderName: selectedRow.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: selectedRow.IVRMMG_ActiveFlag
            });
        } else {
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterGenderInput) => {
        if (isEditMode && !data.IVRMMG_Id) {
        }

        // Trim whitespace from text fields
        const sanitizedData: MasterGenderInput = {
            ...data,
            IVRMMG_GenderName: data.IVRMMG_GenderName?.trim() || ''
        };

        try {
            const res = await saveMutation.mutateAsync(sanitizedData);

            if (res?.success) {
                const successMsg = res?.message || (isEditMode ? 'Gender updated successfully' : 'Gender added successfully');
                toast.success(successMsg);

                // Reset form if in add mode
                if (!isEditMode) {
                    reset();
                }
                refetchAll();

                // Call success callback (closes the form)
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update gender' : 'Failed to add gender');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 Error object:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error data:', error?.response?.data);

            const errorMsg =
                error?.response?.data?.message ||
                error?.message ||
                error?.data?.message ||
                (isEditMode ? 'Failed to update gender' : 'Failed to add gender');
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden fields for IDs */}
            {isEditMode && <input type='hidden' {...register('IVRMMG_Id', { valueAsNumber: true })} />}
            <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='IVRMMG_GenderName'>
                    Gender Name <span className='text-destructive'>*</span>
                </Label>
                <HRMSInputText
                    id='IVRMMG_GenderName'
                    placeholder='Enter gender name'
                    maxLength={GENDER_VALIDATION.HRMGEN_GenderName.maxLength?.value}
                    error={errors.IVRMMG_GenderName?.message}
                    {...register('IVRMMG_GenderName', GENDER_VALIDATION.HRMGEN_GenderName)}
                />
            </div>
            <div className='col-span-full flex gap-2 items-center'>
                <Button 
                    type='submit' 
                    className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-primary text-primary-foreground hover:opacity-90' 
                    disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                <Button 
                    type='button' 
                    className='h-8 w-auto rounded-md px-4 py-1.5 text-sm bg-secondary text-secondary-foreground hover:opacity-90' 
                    onClick={() => {
                        reset({
                            MI_Id: roleId,
                            IVRMMG_GenderName: '',
                            IVRMMG_ActiveFlag: true
                        });
                    }}>
                    Clear
                </Button>
                {isEditMode && !isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
