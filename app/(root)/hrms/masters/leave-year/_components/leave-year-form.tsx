import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterLeaveYear } from '@/hooks/hrms/useMasters';
import { LEAVE_YEAR_VALIDATION } from '@/lib/validation/hrms-master-validation';
import type { LeaveYearDetail, MasterLeaveYearInput } from '@/types/hrms/master-leave-year';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

    useEffect(() => {
        if (selectedRow) {
            console.log('📝 [LEAVE YEAR FORM] Edit mode - Loading selectedRow:', JSON.stringify(selectedRow, null, 2));
            console.log('📝 [LEAVE YEAR FORM] Order value from selectedRow:', selectedRow.HRMLY_LeaveYearOrder);
            reset({
                HRMLY_Id: selectedRow.HRMLY_Id,
                MI_Id: selectedRow.MI_Id,
                HRMLY_LeaveYear: selectedRow.HRMLY_LeaveYear,
                HRMLY_FromDate: selectedRow.HRMLY_FromDate,
                HRMLY_ToDate: selectedRow.HRMLY_ToDate,
                HRMLY_ActiveFlag: selectedRow.HRMLY_ActiveFlag,
                HRMLY_LeaveYearOrder: selectedRow.HRMLY_LeaveYearOrder
            });
            console.log('📝 [LEAVE YEAR FORM] Form reset with edit data, order:', selectedRow.HRMLY_LeaveYearOrder);
        } else {
            console.log('📝 [LEAVE YEAR FORM] Add mode - No selectedRow');
        }
    }, [selectedRow, reset]);

    const onSubmit = async (data: MasterLeaveYearInput) => {
        console.log('🔵 ========== LEAVE YEAR FORM SUBMIT ==========');
        console.log('🔵 Form Data:', JSON.stringify(data, null, 2));
        console.log('🔵 Is Edit Mode:', isEditMode);
        console.log('🔵 HRMLY_Id in data:', data.HRMLY_Id);
        console.log('🔵 Role ID:', roleId);
        console.log('🔵 Order value in data:', data.HRMLY_LeaveYearOrder);
        console.log('🔵 Form Errors:', errors);
        
        try {
            console.log('🟡 Calling saveMutation.mutateAsync...');
            const res = await saveMutation.mutateAsync(data);
            
            console.log('🟢 ========== API RESPONSE ==========');
            console.log('🟢 Response:', JSON.stringify(res, null, 2));
            console.log('🟢 Response success:', res?.success);
            console.log('🟢 Response message:', res?.message);
            console.log('🟢 ====================================');
            
            if (res?.success) {
                console.log('✅ Success! Showing toast:', res?.message);
                const successMsg = res?.message || (isEditMode ? 'Leave Year updated successfully' : 'Leave Year added successfully');
                toast.success(successMsg);
                
                if (!isEditMode) {
                    console.log('✅ Resetting form (add mode)');
                    reset();
                }
                
                console.log('✅ Calling refetchAll');
                refetchAll();
                
                if (onSuccess) {
                    console.log('✅ Calling onSuccess callback');
                    onSuccess();
                } else {
                    console.log('⚠️ No onSuccess callback provided');
                }
            } else {
                console.log('❌ API returned success=false. Message:', res?.message);
                const errorMsg = res?.message || (isEditMode ? 'Failed to update leave year' : 'Failed to add leave year');
                toast.error(errorMsg);
            }
        } catch (error: any) {
            console.log('🔴 ========== ERROR ==========');
            console.error('🔴 Error caught in form onSubmit:', error);
            console.error('🔴 Error message:', error?.message);
            console.error('🔴 Error response:', error?.response);
            console.error('🔴 Error response data:', error?.response?.data);
            console.log('🔴 ============================');
            
            const errorMsg = error?.message || (isEditMode ? 'Failed to update leave year' : 'Failed to add leave year');
            toast.error(errorMsg);
        }
        
        console.log('🔵 ========== FORM SUBMIT END ==========');
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
                    rules={{ required: 'From Date is required' }}
                    render={({ field }) => (
                        <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick from date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                        setFromDateOpen(false);
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
                    rules={{ required: 'To Date is required' }}
                    render={({ field }) => (
                        <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                    )}>
                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick to date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <DatePickerWithYear
                                    mode='single'
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                        setToDateOpen(false);
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
