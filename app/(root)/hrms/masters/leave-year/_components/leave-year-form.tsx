import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import { LEAVE_YEAR_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface LeaveYearFormProps {
    selectedRow?: LeaveYearDetail;
    onSuccess?: () => void;
}

export default function LeaveYearForm({ selectedRow, onSuccess }: LeaveYearFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterLeaveYear(roleId);
    const isEditMode = !!selectedRow;

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch: _watch,
        setValue,
        trigger,
        formState: { errors, isDirty }
    } = useForm<MasterLeaveYearInput>({
        mode: 'onChange',
        defaultValues: {
            MI_Id: roleId,
            HRMLY_LeaveYear: '',
            HRMLY_FromDate: '',
            HRMLY_ToDate: '',
            HRMLY_ActiveFlag: true,
            HRMLY_LeaveYearOrder: undefined
        }
    });

    // Watch From Date to validate To Date
    const fromDate = useWatch({
        control,
        name: 'HRMLY_FromDate'
    });

    // Watch To Date to validate From Date
    const toDate = useWatch({
        control,
        name: 'HRMLY_ToDate'
    });

    // Trigger validation when dates change
    useEffect(() => {
        if (fromDate) {
            trigger('HRMLY_ToDate');
            // Clear To Date if it's less than or equal to the new From Date
            if (toDate) {
                const from = new Date(fromDate);
                from.setHours(0, 0, 0, 0);
                const to = new Date(toDate);
                to.setHours(0, 0, 0, 0);
                if (to <= from) {
                    setValue('HRMLY_ToDate', '', { shouldValidate: true });
                }
            }
        }
    }, [fromDate, toDate, trigger, setValue]);

    useEffect(() => {
        if (toDate) {
            trigger('HRMLY_FromDate');
        }
    }, [toDate, trigger]);

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
        // else: no selected row, form remains empty
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLeaveYearInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);

            if (res?.success) {
                const successMsg = res?.message || (isEditMode ? 'Leave Year updated successfully' : 'Leave Year added successfully');
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
                const errorMsg = res?.message || (isEditMode ? 'Failed to update leave year' : 'Failed to add leave year');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.error('🔴 Error caught in form onSubmit:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error response data:', error?.response?.data);

            const errorMsg = error?.message || (isEditMode ? 'Failed to update leave year' : 'Failed to add leave year');
            toast.error(errorMsg);
        }
    };

    return (
        <form className='grid grid-cols-1 gap-4 md:grid-cols-2' onSubmit={handleSubmit(onSubmit)}>
            {/* Hidden fields for IDs */}
            {isEditMode && <input type='hidden' {...register('HRMLY_Id', { valueAsNumber: true })} />}
            <input type='hidden' {...register('MI_Id', { valueAsNumber: true })} />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYear'>
                    Leave Year <span className='text-destructive'>*</span>
                </Label>
                <HRMSInputText
                    id='HRMLY_LeaveYear'
                    placeholder='2025'
                    maxLength={4}
                    error={errors.HRMLY_LeaveYear?.message}
                    {...register('HRMLY_LeaveYear', LEAVE_YEAR_VALIDATION.HRMLY_LeaveYear)}
                />
            </div>

            <Controller
                name='HRMLY_FromDate'
                control={control}
                rules={{
                    required: 'From Date is required',
                    validate: (value) => {
                        if (!value) return true;
                        if (!toDate) return true;
                        // Normalize dates to start of day for accurate comparison
                        const from = new Date(value);
                        from.setHours(0, 0, 0, 0);
                        const to = new Date(toDate);
                        to.setHours(0, 0, 0, 0);
                        if (from >= to) {
                            return 'From Date must be less than To Date';
                        }
                        return true;
                    }
                }}
                render={({ field, fieldState }) => (
                    <DateField
                        field={field}
                        fieldState={fieldState}
                        label='From Date'
                        placeholder='Pick from date'
                    />
                )}
            />

            <Controller
                name='HRMLY_ToDate'
                control={control}
                rules={{
                    required: 'To Date is required',
                    validate: (value) => {
                        if (!value) return true;
                        if (!fromDate) return true;
                        // Normalize dates to start of day for accurate comparison
                        const from = new Date(fromDate);
                        from.setHours(0, 0, 0, 0);
                        const to = new Date(value);
                        to.setHours(0, 0, 0, 0);
                        if (to <= from) {
                            return 'To Date must be greater than From Date';
                        }
                        return true;
                    }
                }}
                render={({ field, fieldState }) => {
                    const fromDateObj = fromDate ? new Date(fromDate) : undefined;
                    return (
                        <DateField
                            field={field}
                            fieldState={fieldState}
                            label='To Date'
                            placeholder='Pick to date'
                            fromDate={fromDateObj}
                        />
                    );
                }}
            />

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYearOrder'>Order</Label>
                <Input type='number' id='HRMLY_LeaveYearOrder' {...register('HRMLY_LeaveYearOrder', { valueAsNumber: true })} />
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
                            HRMLY_LeaveYear: '',
                            HRMLY_FromDate: '',
                            HRMLY_ToDate: '',
                            HRMLY_ActiveFlag: true,
                            HRMLY_LeaveYearOrder: undefined
                        });
                    }}>
                    Clear
                </Button>
                {isEditMode && !isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
