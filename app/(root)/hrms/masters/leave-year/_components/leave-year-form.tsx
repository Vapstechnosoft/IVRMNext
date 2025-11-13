import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import { cn } from '@/lib/utils';
import { LEAVE_YEAR_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
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

    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

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
        defaultValues: {
            MI_Id: roleId,
            HRMLY_LeaveYear: '',
            HRMLY_FromDate: '',
            HRMLY_ToDate: '',
            HRMLY_ActiveFlag: true,
            HRMLY_LeaveYearOrder: 1
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
        }
    }, [fromDate, trigger]);

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
                    render={({ field }) => (
                        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick from date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            field.onChange(dateStr);
                                            // If To Date exists and is less than or equal to selected date, clear it
                                            if (toDate) {
                                                const to = new Date(toDate);
                                                to.setHours(0, 0, 0, 0);
                                                const selected = new Date(date);
                                                selected.setHours(0, 0, 0, 0);
                                                if (to <= selected) {
                                                    setValue('HRMLY_ToDate', '', { shouldValidate: true });
                                                }
                                            }
                                            setValue('HRMLY_FromDate', dateStr, { shouldValidate: true });
                                        } else {
                                            field.onChange('');
                                        }
                                        setFromDateOpen(false);
                                    }}
                                    disabled={(date) => {
                                        // Disable dates that are greater than or equal to To Date (if To Date is selected)
                                        if (toDate) {
                                            const to = new Date(toDate);
                                            to.setHours(0, 0, 0, 0);
                                            const checkDate = new Date(date);
                                            checkDate.setHours(0, 0, 0, 0);
                                            return checkDate >= to;
                                        }
                                        return false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.HRMLY_FromDate && <FormError>{errors.HRMLY_FromDate.message}</FormError>}
            </div>

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_ToDate'>
                    To Date <span className='text-destructive'>*</span>
                </Label>
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
                    render={({ field }) => (
                        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick to date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        if (date) {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            field.onChange(dateStr);
                                            setValue('HRMLY_ToDate', dateStr, { shouldValidate: true });
                                        } else {
                                            field.onChange('');
                                        }
                                        setToDateOpen(false);
                                    }}
                                    disabled={(date) => {
                                        // Disable dates that are less than or equal to From Date
                                        if (fromDate) {
                                            const from = new Date(fromDate);
                                            from.setHours(0, 0, 0, 0);
                                            const checkDate = new Date(date);
                                            checkDate.setHours(0, 0, 0, 0);
                                            return checkDate <= from;
                                        }
                                        return false;
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.HRMLY_ToDate && <FormError>{errors.HRMLY_ToDate.message}</FormError>}
            </div>

            <div className='group flex flex-col gap-1.5'>
                <Label htmlFor='HRMLY_LeaveYearOrder'>Order</Label>
                <Input type='number' id='HRMLY_LeaveYearOrder' {...register('HRMLY_LeaveYearOrder', { valueAsNumber: true })} />
            </div>

            <div className='col-span-full flex gap-2'>
                <Button type='submit' className='mt-2' disabled={saveMutation.isPending || (isEditMode && !isDirty)}>
                    {saveMutation.isPending ? (isEditMode ? 'Updating...' : 'Saving...') : isEditMode ? 'Update' : 'Save'}
                </Button>
                {isEditMode && !isDirty && <span className='mt-2 flex items-center text-muted-foreground text-sm'>No changes made</span>}
            </div>
        </form>
    );
}
