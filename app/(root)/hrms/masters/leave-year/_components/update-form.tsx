'use client';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Input } from '@/components/ui/input';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import { LEAVE_YEAR_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
interface UpdateLeaveYearFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: LeaveYearDetail;
}
export default function UpdateLeaveYearForm({ onSuccess, className = '', selectedRow: row }: UpdateLeaveYearFormProps) {
    const roleId = HRMS_MI_ID;
    const { saveMutation, refetchAll } = useMasterLeaveYear(roleId);
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        trigger,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<MasterLeaveYearInput>({
        mode: 'onChange'
    });
    const fromDate = useWatch({
        control,
        name: 'HRMLY_FromDate'
    });
    const toDate = useWatch({
        control,
        name: 'HRMLY_ToDate'
    });
    useEffect(() => {
        if (fromDate) {
            trigger('HRMLY_ToDate');
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
        if (row) {
            reset({
                HRMLY_Id: row.HRMLY_Id,
                MI_Id: row.MI_Id,
                HRMLY_LeaveYear: row.HRMLY_LeaveYear,
                HRMLY_FromDate: row.HRMLY_FromDate,
                HRMLY_ToDate: row.HRMLY_ToDate,
                HRMLY_ActiveFlag: row.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: row.HRMLY_LeaveYearOrder
            });
        }
    }, [row, reset]);
    const onSubmit = async (data: MasterLeaveYearInput) => {
        try {
            const res = await saveMutation.mutateAsync(data);
            if (res?.success) {
                toast.success(res?.message || 'Leave Year updated successfully');
                refetchAll();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(res?.message || 'Failed to update leave year');
            }
        } catch (error: any) {
            const errorMsg = error?.message || 'Failed to update leave year';
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
                    <input type='hidden' {...register('HRMLY_Id', { valueAsNumber: true })} />
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
                            defaultValue={row.HRMLY_LeaveYear}
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
                        <Input type='number' id='HRMLY_LeaveYearOrder' defaultValue={row.HRMLY_LeaveYearOrder} {...register('HRMLY_LeaveYearOrder', { valueAsNumber: true })} />
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
                            Save Leave Year
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
