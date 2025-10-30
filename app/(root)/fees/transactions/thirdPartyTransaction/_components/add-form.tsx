'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import {
    useBankdropdowndatathirdpartytransaction,
    useFeeAmountEntry,
    useGroupdropdowndatathirdpartytransaction,
    useHeaddropdowndatathirdpartytransaction,
    useacademicyerdropdowndatafee
} from '@/hooks/fees/useTrasactions';
import { thirdPartyTransactionSchema } from '@/schemas/fees/trasactions';
import { addOrUpdateMasterfeehead } from '@/server/fees/masters/feehead';

import { cn } from '@/lib/utils';

type FormFields = z.infer<typeof thirdPartyTransactionSchema.addOrUpdate>;

interface AddThirdPartyTransactionProps {
    onSuccess?: () => void;
    headname?: string;
}

export default function AddThirdPartyTransactionForm({ onSuccess, headname = '' }: AddThirdPartyTransactionProps) {
    const { refetchAll } = useFeeAmountEntry();
    const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>('');

    const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(thirdPartyTransactionSchema.addOrUpdate),
        mode: 'onChange'
    });

    const studentType = watch('studentType');

    const watchAcademicYearId = watch('academicYearId');

    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useacademicyerdropdowndatafee();

    const { data: groupData, isLoading: groupDataLoading, error: groupDataError } = useGroupdropdowndatathirdpartytransaction();

    const { data: headdata, isLoading: headDataLoading, error: headDataError } = useHeaddropdowndatathirdpartytransaction();

    const { data: bankdata, isLoading: bankDataLoading, error: bankDataError } = useBankdropdowndatathirdpartytransaction();

    useEffect(() => {
        const fetchData = async () => {
            if (watchAcademicYearId && studentType === 'student') {
                try {
                    const data = await fetchStudentsByAcademicYear(watchAcademicYearId.toString());
                    setStudents(data);
                    setValue('studentId', undefined); // reset dropdown
                } catch (error) {
                    console.error('Error fetching students:', error);
                    setStudents([]);
                }
            } else {
                setStudents([]);
                setValue('studentId', undefined);
            }
        };

        fetchData();
    }, [watchAcademicYearId, studentType, setValue]);

    const fetchStudentsByAcademicYear = async (id: string) => {
        // Placeholder function: replace with your API call
        return [
            { id: '1', name: 'John Doe' },
            { id: '2', name: 'Jane Smith' }
        ];
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterfeehead(data);
            if (response.success) {
                toast.success(response.message);
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
        setSelectedPaymentMode('');
    };

    return (
        <div className={`${headname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col items-center justify-center space-y-6'>
                <div className='flex items-center justify-center space-x-6 rounded-lg border border-gray-300 bg-white px-4 py-2'>
                    <Controller
                        control={control}
                        name='studentType'
                        render={({ field }) => {
                            const options = [
                                { label: 'Existing Student', value: 'student' },
                                { label: 'Other', value: 'other' }
                            ];

                            return (
                                <div className='flex flex-wrap gap-4'>
                                    {options.map((option) => (
                                        <label key={option.value} className='flex cursor-pointer items-center gap-2'>
                                            <input
                                                type='radio'
                                                value={option.value}
                                                checked={field.value === option.value}
                                                onChange={() => {
                                                    field.onChange(option.value);
                                                    setSelectedPaymentMode(option.value);
                                                }}
                                                className='accent-primary'
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            );
                        }}
                    />
                </div>

                {/* Academic Year */}
                <div className='flex items-center gap-4'>
                    <Label className='min-w-[150px] text-right'>
                        Academic Year:<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='academicYearId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || undefined}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Academic Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYearLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading....
                                        </SelectItem>
                                    ) : academicYearError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading data
                                        </SelectItem>
                                    ) : (
                                        academicYear?.data?.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                </div>

                {/* Student Selection / Input */}
                {studentType && (
                    <div className='flex items-center gap-4'>
                        <Label className='min-w-[150px] text-right'>
                            {studentType === 'student' ? 'Select Student' : 'Student Name'}
                            <span className='ml-1 text-red-500'>*</span>
                        </Label>

                        {studentType === 'student' ? (
                            <Controller
                                name='studentId'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={(value) => field.onChange(value)} value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='min-w-[400px] text-center'>
                                            <SelectValue placeholder='Select Student' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.length > 0 ? (
                                                students.map((student) => (
                                                    <SelectItem key={student.id} value={student.id}>
                                                        {student.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value='none' disabled>
                                                    No students found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        ) : (
                            <InputText
                                id='studentName'
                                placeholder='Enter Student Name'
                                {...register('studentName', {
                                    required: "Student name is required for 'Other'"
                                })}
                                error={errors.studentName?.message}
                                className='min-w-[400px] transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        )}
                    </div>
                )}

                <div className='flex items-center gap-4'>
                    <Label className='min-w-[150px] text-right'>
                        Group Name:<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='groupId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || undefined}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Group' />
                                </SelectTrigger>
                                <SelectContent>
                                    {groupDataLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading....
                                        </SelectItem>
                                    ) : groupDataError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading data
                                        </SelectItem>
                                    ) : (
                                        groupData?.data?.map((item) => (
                                            <SelectItem key={item.fmG_Id} value={item.fmG_Id.toString()}>
                                                {item.fmG_GroupName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.groupId && <FormError>{errors.groupId.message}</FormError>}
                </div>

                <div className='flex items-center gap-4'>
                    <Label className='min-w-[150px] text-right'>
                        Head Name:<span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='headId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString() || undefined}>
                                <SelectTrigger className='min-w-[400px] text-center'>
                                    <SelectValue placeholder='Select Head' />
                                </SelectTrigger>
                                <SelectContent>
                                    {headDataLoading ? (
                                        <SelectItem value='loading' disabled>
                                            Loading....
                                        </SelectItem>
                                    ) : headDataError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading data
                                        </SelectItem>
                                    ) : (
                                        headdata?.data?.map((item) => (
                                            <SelectItem key={item.fmH_Id} value={item.fmH_Id.toString()}>
                                                {item.fmH_FeeName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.headId && <FormError>{errors.headId.message}</FormError>}
                </div>

                {/* Amount */}
                <div className='flex items-center gap-4'>
                    <Label htmlFor='amount' className='min-w-[150px] text-right'>
                        Amount <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='amount'
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                id='amount'
                                value={field.value ?? 0}
                                onChange={(value) => field.onChange(Number(value))}
                                onBlur={field.onBlur}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                error={errors.amount?.message}
                            />
                        )}
                    />
                </div>

                {/* Towards */}
                <div className='flex items-center gap-4'>
                    <Label htmlFor='towards' className='min-w-[150px] text-right'>
                        Towards <span className='text-red-500'>*</span>
                    </Label>
                    <InputText
                        required
                        id='towards'
                        {...register('towards')}
                        error={errors.towards?.message}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                    />
                </div>

                {/* Payment Mode */}
                <div className='flex items-center justify-center space-x-6 rounded-lg border border-gray-300 bg-white px-4 py-2'>
                    {/* <Label className="min-w-[150px] text-right">Payment Mode</Label> */}
                    <Controller
                        control={control}
                        name='paymentMode'
                        render={({ field }) => {
                            const options = [
                                { label: 'Bank', value: 'B' },
                                { label: 'Cash', value: 'C' },
                                { label: 'RTGS/NEFT', value: 'R' },
                                { label: 'Card', value: 'S' }
                            ];

                            return (
                                <div className='flex flex-wrap gap-4'>
                                    {options.map((option) => (
                                        <label key={option.value} className='flex cursor-pointer items-center gap-2'>
                                            <input
                                                type='radio'
                                                value={option.value}
                                                checked={field.value === option.value}
                                                onChange={() => {
                                                    field.onChange(option.value);
                                                    setSelectedPaymentMode(option.value);
                                                }}
                                                className='accent-primary'
                                            />
                                            <span>{option.label}</span>
                                        </label>
                                    ))}
                                </div>
                            );
                        }}
                    />
                </div>

                {/* Conditional Fields */}
                {(selectedPaymentMode === 'B' || selectedPaymentMode === 'R') && (
                    <>
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[150px] text-right'>
                                Bank Name:<span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='bankId'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='min-w-[400px] text-center'>
                                            <SelectValue placeholder='Select Bank' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bankDataError ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading....
                                                </SelectItem>
                                            ) : bankDataError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading data
                                                </SelectItem>
                                            ) : (
                                                bankdata?.data?.map((item) => (
                                                    <SelectItem key={item.fmbanK_Id} value={item.fmbanK_Id.toString()}>
                                                        {item.fmbanK_BankName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.bankId && <FormError>{errors.bankId.message}</FormError>}
                        </div>

                        {/* Cheque Date */}
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[150px] text-left'>
                                Cheque Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='chequeDate'
                                control={control}
                                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                                render={({ field }) => {
                                    const selectedDate = field.value ? new Date(field.value) : new Date();
                                    return (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.chequeDate ? 'border-red-500' : ''
                                                    )}>
                                                    <Calendar className='mr-2 h-4 w-4' />
                                                    {field.value
                                                        ? format(selectedDate, 'dd/MM/yyyy')
                                                        : format(new Date(), 'dd/MM/yyyy')}{' '}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='z-50 w-auto p-0' align='start'>
                                                <CalendarPicker
                                                    mode='single'
                                                    selected={selectedDate}
                                                    onSelect={(d) => field.onChange(d ? format(d, 'yyyy-MM-dd') : '')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    );
                                }}
                            />
                            {errors.chequeDate && <FormError>{errors.chequeDate.message}</FormError>}
                        </div>

                        {/* Cheque No */}
                        <div className='flex items-center gap-4'>
                            <Label htmlFor='chequeNo' className='font-medium'>
                                Cheque No <span className='text-red-500'>*</span>
                            </Label>
                            <InputText id='chequeNo' {...register('chequeNo')} error={errors.chequeNo?.message} />
                        </div>
                    </>
                )}

                {selectedPaymentMode === 'S' && (
                    <>
                        {/* Transaction Date */}
                        <div className='flex items-center gap-4'>
                            <Label className='min-w-[150px] text-right'>
                                Transaction Date <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='date'
                                control={control}
                                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                                render={({ field }) => {
                                    const selectedDate = field.value ? new Date(field.value) : new Date();
                                    return (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.date ? 'border-red-500' : ''
                                                    )}>
                                                    <Calendar className='mr-2 h-4 w-4' />
                                                    {field.value
                                                        ? format(selectedDate, 'dd/MM/yyyy')
                                                        : format(new Date(), 'dd/MM/yyyy')}{' '}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='z-50 w-auto p-0' align='start'>
                                                <CalendarPicker
                                                    mode='single'
                                                    selected={selectedDate}
                                                    onSelect={(d) => field.onChange(d ? format(d, 'yyyy-MM-dd') : '')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    );
                                }}
                            />
                            {errors.date && <FormError>{errors.date.message}</FormError>}
                        </div>

                        {/* Card Number */}
                        <div className='flex items-center gap-4'>
                            <Label htmlFor='cardNo' className='font-medium'>
                                Card No <span className='text-red-500'>*</span>
                            </Label>
                            <InputText
                                id='cardNo'
                                {...register('chequeNo')}
                                placeholder='Enter Card Number'
                                error={errors.chequeNo?.message}
                            />
                        </div>
                    </>
                )}

                {/* Buttons */}
                <div className='flex gap-3 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={handleReset}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Save Third Party Transaction
                    </Button>
                </div>
            </form>
        </div>
    );
}
