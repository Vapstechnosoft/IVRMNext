import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import { LEAVE_YEAR_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveYearFormProps {
    selectedRow?: LeaveYearDetail;
    onSuccess?: () => void;
}

export default function LeaveYearForm({ selectedRow, onSuccess }: LeaveYearFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation } = useMasterLeaveYear(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<MasterLeaveYearInput>({
        defaultValues: {
            MI_Id: roleId,
            HRMLY_LeaveYear: '',
            HRMLY_FromDate: '',
            HRMLY_ToDate: '',
            HRMLY_ActiveFlag: true,
            HRMLY_LeaveYearOrder: 1
        }
    });

    useEffect(() => {
        if (selectedRow) {
            reset({
                HRMLY_Id: selectedRow.HRMLY_Id,
                MI_Id: selectedRow.MI_Id,
                HRMLY_LeaveYear: selectedRow.HRMLY_LeaveYear,
                HRMLY_FromDate: selectedRow.HRMLY_FromDate,
                HRMLY_ToDate: selectedRow.HRMLY_ToDate,
                HRMLY_ActiveFlag: selectedRow.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: selectedRow.HRMLY_LeaveYearOrder
            });
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLeaveYearInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(isEditMode ? 'Leave Year updated successfully' : 'Leave Year added successfully');
                if (onSuccess) onSuccess();
            }
        } catch (_error) {
            toast.error(isEditMode ? 'Failed to update leave year' : 'Failed to add leave year');
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYear'>
                    Leave Year <span className='text-destructive'>*</span>
                </Label>
                <InputText
                    id='HRMLY_LeaveYear'
                    placeholder='e.g., 2025-2026'
                    {...register('HRMLY_LeaveYear', LEAVE_YEAR_VALIDATION.leaveYear)}
                />
                {errors.HRMLY_LeaveYear && <FormError>{errors.HRMLY_LeaveYear.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_FromDate'>
                    From Date <span className='text-destructive'>*</span>
                </Label>
                <Input id='HRMLY_FromDate' type='date' {...register('HRMLY_FromDate', { required: 'From Date is required' })} />
                {errors.HRMLY_FromDate && <FormError>{errors.HRMLY_FromDate.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_ToDate'>
                    To Date <span className='text-destructive'>*</span>
                </Label>
                <Input id='HRMLY_ToDate' type='date' {...register('HRMLY_ToDate', { required: 'To Date is required' })} />
                {errors.HRMLY_ToDate && <FormError>{errors.HRMLY_ToDate.message}</FormError>}
            </div>
            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYearOrder'>Order</Label>
                <Input type='number' id='HRMLY_LeaveYearOrder' {...register('HRMLY_LeaveYearOrder', { valueAsNumber: true })} />
            </div>
            <div className='col-span-full'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
            </div>
        </form>
    );
}
