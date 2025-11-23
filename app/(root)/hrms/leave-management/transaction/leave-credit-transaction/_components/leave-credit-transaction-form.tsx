'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { differenceInDays, format } from 'date-fns';
import { CalendarIcon, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface LeaveCreditTransactionFormProps {
    editingRow: LeaveCreditTransaction | null;
    onSubmit: (data: LeaveCreditTransaction) => void;
    onCancel: () => void;
}

// Mock data - replace with actual API calls
const typeOptions = [
    { label: 'Teaching', value: 'Teaching' },
    { label: 'Non Teaching', value: 'Non Teaching' },
    { label: 'Administrative', value: 'Administrative' },
    { label: 'test', value: 'test' },
    { label: 'assistant teacher', value: 'assistant teacher' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Owner of the company', value: 'Owner of the company' }
];

const departmentOptions = [
    { label: 'Teaching', value: 'Teaching' },
    { label: 'Non Teaching', value: 'Non Teaching' },
    { label: 'JUNIOR SCHOOL', value: 'JUNIOR SCHOOL' },
    { label: 'PRIMARY SCHOOL', value: 'PRIMARY SCHOOL' },
    { label: 'SENIOR SCHOOL', value: 'SENIOR SCHOOL' },
    { label: 'OFFICE STAFF', value: 'OFFICE STAFF' },
    { label: 'Service Staff', value: 'Service Staff' }
];

const designationOptions = [
    { label: 'Assistant Teacher', value: 'Assistant Teacher' },
    { label: 'Principal', value: 'Principal' },
    { label: 'Vice Principal', value: 'Vice Principal' },
    { label: 'Office Assistant', value: 'Office Assistant' },
    { label: 'System Manager', value: 'System Manager' },
    { label: 'Teacher Helper', value: 'Teacher Helper' },
    { label: 'Electrician', value: 'Electrician' }
];

const leaveYearOptions = [
    { label: '2025', value: '2025' },
    { label: '2024', value: '2024' },
    { label: '2023', value: '2023' },
    { label: '2022', value: '2022' },
    { label: '2021', value: '2021' }
];

const leaveNameOptions = [
    { label: 'Casual Leave', value: 'Casual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'General Leave', value: 'General Leave' },
    { label: 'Earned Leave (EL)/Privilege Leave (PL)', value: 'Earned Leave (EL)/Privilege Leave (PL)' },
    { label: 'Maternity leave', value: 'Maternity leave' },
    { label: 'Optional Leave', value: 'Optional Leave' },
    { label: 'Emergency Leave', value: 'Emergency Leave' }
];

const employeeOptions = [
    { label: 'MR JOHN SHAH', value: 'MR JOHN SHAH' },
    { label: 'MRS JANE DOE', value: 'MRS JANE DOE' },
    { label: 'MR DIPAKKUMARMONDAL', value: 'MR DIPAKKUMARMONDAL' },
    { label: 'MRS JHUMAROYNATH', value: 'MRS JHUMAROYNATH' }
];

const lossOfPayOptions = [
    { label: 'None', value: 'none' },
    { label: 'Loss Of Pay', value: 'full' },
    { label: 'Loss Of Pay Half Day', value: 'half' },
    { label: 'Loss Of Pay One Fourth Day', value: 'oneFourth' },
    { label: 'Loss Of Pay Three Fourth Day', value: 'threeFourth' }
];

export function LeaveCreditTransactionForm({ editingRow, onSubmit, onCancel }: LeaveCreditTransactionFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<LeaveCreditTransaction>({
        defaultValues: editingRow || {
            type: [],
            department: [],
            designation: [],
            leaveYear: '',
            fromDate: '',
            toDate: '',
            totalDays: 0,
            employee: '',
            lossOfPayType: 'none',
            lossOfPayAmount: 0,
            leaveName: '',
            availed: 0
        }
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const totalDays = watch('totalDays');
    const lossOfPayType = watch('lossOfPayType');

    // Calculate total days from date range
    useEffect(() => {
        if (fromDate && toDate) {
            try {
                const from = new Date(fromDate);
                const to = new Date(toDate);
                if (to >= from) {
                    const days = differenceInDays(to, from) + 1; // +1 to include both start and end dates
                    setValue('totalDays', days, { shouldValidate: true });
                }
            } catch (error) {
                console.error('Error calculating days:', error);
            }
        } else {
            setValue('totalDays', 0);
        }
    }, [fromDate, toDate, setValue]);

    // Calculate loss of pay amount based on total days and loss of pay type
    useEffect(() => {
        if (totalDays > 0 && lossOfPayType !== 'none') {
            let calculatedAmount = 0;
            switch (lossOfPayType) {
                case 'full':
                    calculatedAmount = totalDays;
                    break;
                case 'half':
                    calculatedAmount = totalDays * 0.5;
                    break;
                case 'oneFourth':
                    calculatedAmount = totalDays * 0.25;
                    break;
                case 'threeFourth':
                    calculatedAmount = totalDays * 0.75;
                    break;
                default:
                    calculatedAmount = 0;
            }
            setValue('lossOfPayAmount', Number(calculatedAmount.toFixed(2)), { shouldValidate: true });
        } else {
            setValue('lossOfPayAmount', 0);
        }
    }, [totalDays, lossOfPayType, setValue]);

    const onSubmitForm: SubmitHandler<LeaveCreditTransaction> = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
            {/* Filters Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Type:</Label>
                    <Controller
                        name='type'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={typeOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Types'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Department:</Label>
                    <Controller
                        name='department'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={departmentOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Departments'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>

                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Designation:</Label>
                    <Controller
                        name='designation'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={designationOptions}
                                onValueChange={field.onChange}
                                defaultValue={field.value || []}
                                placeholder='Select Designations'
                                className='w-full'
                                maxHeight={240}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Leave Details Section */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label htmlFor='leave-year-select' className='font-medium text-sm'>
                        Leave Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveYear'
                        control={control}
                        rules={{ required: 'Leave Year is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='leave-year-select' className={errors.leaveYear ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveYearOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='leave-name-select' className='font-medium text-sm'>
                        Leave Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='leaveName'
                        control={control}
                        rules={{ required: 'Leave Name is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='leave-name-select' className={errors.leaveName ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveNameOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='from-date-input' className='font-medium text-sm'>
                        From Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fromDate'
                        control={control}
                        rules={{ required: 'From Date is required' }}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id='from-date-input'
                                        variant='outline'
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground',
                                            errors.fromDate && 'border-red-500'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {field.value ? format(new Date(field.value), 'dd-MM-yyyy') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <CalendarYear
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onDayClick={(day) => {
                                            if (day) {
                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                field.onChange(dateStr);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='to-date-input' className='font-medium text-sm'>
                        To Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='toDate'
                        control={control}
                        rules={{ required: 'To Date is required' }}
                        render={({ field }) => (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id='to-date-input'
                                        variant='outline'
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground',
                                            errors.toDate && 'border-red-500'
                                        )}>
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {field.value ? format(new Date(field.value), 'dd-MM-yyyy') : 'Select date'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0'>
                                    <CalendarYear
                                        mode='single'
                                        selected={field.value ? new Date(field.value) : undefined}
                                        onDayClick={(day) => {
                                            if (day) {
                                                const dateStr = format(day, 'yyyy-MM-dd');
                                                field.onChange(dateStr);
                                            }
                                        }}
                                        fromDate={fromDate ? new Date(fromDate) : undefined}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        )}
                    />
                    {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='total-days-input' className='font-medium text-sm'>
                        Total Days <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='totalDays'
                        control={control}
                        rules={{ required: 'Total Days is required', min: { value: 1, message: 'Total Days must be at least 1' } }}
                        render={({ field }) => (
                            <InputText
                                id='total-days-input'
                                type='number'
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                readOnly
                                className={errors.totalDays ? 'border-red-500' : ''}
                            />
                        )}
                    />
                    {errors.totalDays && <FormError>{errors.totalDays.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='employee-select' className='font-medium text-sm'>
                        Employee <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='employee'
                        control={control}
                        rules={{ required: 'Employee is required' }}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='employee-select' className={errors.employee ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select or search employee in the list...' />
                                </SelectTrigger>
                                <SelectContent>
                                    {employeeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.employee && <FormError>{errors.employee.message}</FormError>}
                </div>

                <div>
                    <Label htmlFor='loss-of-pay-select' className='font-medium text-sm'>
                        Loss Of Pay Options:
                    </Label>
                    <Controller
                        name='lossOfPayType'
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id='loss-of-pay-select'>
                                    <SelectValue placeholder='Select Loss of Pay Option' />
                                </SelectTrigger>
                                <SelectContent>
                                    {lossOfPayOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                {lossOfPayType !== 'none' && (
                    <div>
                        <Label htmlFor='loss-of-pay-amount-input' className='font-medium text-sm'>
                            Loss Of Pay Amount:
                        </Label>
                        <Controller
                            name='lossOfPayAmount'
                            control={control}
                            render={({ field }) => (
                                <InputText
                                    id='loss-of-pay-amount-input'
                                    type='number'
                                    step='0.01'
                                    value={field.value || 0}
                                    readOnly
                                    className='bg-muted'
                                />
                            )}
                        />
                    </div>
                )}

                <div>
                    <Label htmlFor='availed-input' className='font-medium text-sm'>
                        Availed:
                    </Label>
                    <Controller
                        name='availed'
                        control={control}
                        render={({ field }) => (
                            <InputText
                                id='availed-input'
                                type='number'
                                step='0.5'
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button type='submit' variant='default' className='min-w-[120px]'>
                    <Save className='mr-2 h-4 w-4' />
                    SAVE
                </Button>
                <Button type='button' variant='outline' onClick={onCancel} className='min-w-[120px]'>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
