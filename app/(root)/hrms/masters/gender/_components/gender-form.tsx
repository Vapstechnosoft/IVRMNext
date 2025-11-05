import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
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
        defaultValues: {
            MI_Id: roleId,
            IVRMMG_GenderName: '',
            IVRMMG_ActiveFlag: true
        }
    });

    useEffect(() => {
        if (selectedRow) {
            console.log('📝 [GENDER FORM] Edit mode - Loading selectedRow:', JSON.stringify(selectedRow, null, 2));
            reset({
                IVRMMG_Id: selectedRow.IVRMMG_Id,
                MI_Id: selectedRow.MI_Id,
                IVRMMG_GenderName: selectedRow.IVRMMG_GenderName,
                IVRMMG_ActiveFlag: selectedRow.IVRMMG_ActiveFlag
            });
            console.log('📝 [GENDER FORM] Form reset with edit data');
        } else {
            console.log('📝 [GENDER FORM] Add mode - No selectedRow');
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterGenderInput) => {
        console.log('🔵 ========== GENDER FORM SUBMIT ==========');
        console.log('🔵 Form Data:', JSON.stringify(data, null, 2));
        console.log('🔵 Is Edit Mode:', isEditMode);
        console.log('🔵 IVRMMG_Id in data:', data.IVRMMG_Id);
        console.log('🔵 Role ID:', roleId);
        console.log('🔵 Form Errors:', errors);
        
        if (isEditMode && !data.IVRMMG_Id) {
            console.log('⚠️ WARNING: Edit mode but no IVRMMG_Id in form data!');
        }
        
        try {
            console.log('🟡 Calling saveMutation.mutateAsync...');
            const res = await saveMutation.mutateAsync(data);
            
            console.log('🟢 ========== API RESPONSE ==========');
            console.log('🟢 Response:', JSON.stringify(res, null, 2));
            console.log('🟢 Response success:', res?.success);
            console.log('🟢 Response message:', res?.message);
            console.log('🟢 ====================================');
            
            if (res?.success) {
                const successMsg = res?.message || (isEditMode ? 'Gender updated successfully' : 'Gender added successfully');
                console.log('✅ Success! Showing toast:', successMsg);
                toast.success(successMsg);
                
                // Reset form if in add mode
                if (!isEditMode) {
                    console.log('✅ Resetting form (add mode)');
                    reset();
                }
                
                // Refetch the list
                console.log('✅ Refetching list');
                refetchAll();
                
                // Call success callback (closes the form)
                if (onSuccess) {
                    console.log('✅ Calling onSuccess callback');
                    onSuccess();
                }
            } else {
                const errorMsg = res?.message || (isEditMode ? 'Failed to update gender' : 'Failed to add gender');
                console.log('❌ API returned success=false. Message:', errorMsg);
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.log('🔴 ========== ERROR CAUGHT ==========');
            console.error('🔴 Error object:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error data:', error?.response?.data);
            console.log('🔴 ====================================');
            
            const errorMsg = error?.response?.data?.message 
                || error?.message 
                || error?.data?.message
                || (isEditMode ? 'Failed to update gender' : 'Failed to add gender');
            
            console.log('🔴 Showing error toast:', errorMsg);
            toast.error(errorMsg);
        }
        
        console.log('🔵 ========== FORM SUBMIT END ==========');
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
                <InputText
                    id='IVRMMG_GenderName'
                    placeholder='Enter gender name'
                    {...register('IVRMMG_GenderName', GENDER_VALIDATION.genderName)}
                />
                {errors.IVRMMG_GenderName && <FormError>{errors.IVRMMG_GenderName.message}</FormError>}
            </div>
            <div className='col-span-full flex gap-2'>
                <Button 
                    type='submit' 
                    className='mt-2' 
                    disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                {isEditMode && !isDirty && (
                    <span className='mt-2 flex items-center text-sm text-muted-foreground'>
                        No changes made
                    </span>
                )}
            </div>
        </form>
    );
}
