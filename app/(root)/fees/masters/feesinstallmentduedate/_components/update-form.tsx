'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMasterFeeInstallmentDueDate } from '@/hooks/fees/useMasters';
import { masterInstallmentDueDateSchema } from '@/schemas/fees/masters';
import { addOrUpdateInsallmentDueDate } from '@/server/fees/masters/feeinstallmentduedate';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';

type FormFields = z.infer<typeof masterInstallmentDueDateSchema>;

interface UpdateMasterFeeInstallmentDueDateFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterFeesInstallmentDueDateList;
}

export default function UpdateMasterFeeInstallmentDueDateForm({ onSuccess, selectedRow: row }: UpdateMasterFeeInstallmentDueDateFormProps) {
    const { refetchAll } = useMasterFeeInstallmentDueDate();
    const [installments, setInstallments] = useState<IMasterFeesInstallmentDueDateList[]>([]);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstallmentDueDateSchema),
        mode: 'onChange'
    });

    const INSTALLMENT_YEAR = [
        { value: '2025-2026', label: '2025-2026' },
        { value: '2024-2025', label: '2024-2025' },
        { value: '2023-2024', label: '2023-2024' }
    ];

    const INSTALLMENT_TYPES = [
        { value: 'general', label: 'General' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'halfyearly', label: 'Half Yearly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'bimonthly', label: 'Bi-Monthly' },
        { value: 'anytime', label: 'Anytime' }
    ];

    const installmentType = watch('fmI_Installment_Type');

    useEffect(() => {
        if (row) {
            // Initialize form with existing data
            // const initialInstallment: IMasterFeesInstallmentDueDateList = {
            //     sno: 1,
            //     ftI_Id: row.ftI_Id,
            //     fmI_Id: row.fmI_Id,
            //     fmI_Name: row.fmI_Name,
            //     fmI_No_Of_Installments: row.fmI_No_Of_Installments,
            //     fmI_Installment_Type: row.fmI_Installment_Type,
            //     ftI_Name: row.ftI_Name || '',
            //     mI_ID: row.mI_ID,
            //     fmI_ActiveFlag: row.fmI_ActiveFlag,
            //     fdate: row.fdate || '',
            //     tdate: row.tdate || '',
            //     aplc: row.aplc || '',
            //     ddate: row.ddate || ''
            // };

            // setInstallments([initialInstallment]);

            reset({
                // fmI_Name: row.fmI_Name,
                // fmI_Installment_Type: row.fmI_Installment_Type,
                // fmI_No_Of_Installments: row.fmI_No_Of_Installments,
                // installments: [
                //     {
                //         sno: 1,
                //         ftI_Name: row.ftI_Name || '',
                //         fdate: row.fdate || '',
                //         tdate: row.tdate || '',
                //         aplc: row.aplc || '',
                //         ddate: row.ddate || ''
                //     }
                // ]
            });
        }
    }, [row, reset]);

    // Helper to convert Date to string format
    const formatDateToString = (date: Date | undefined | null): string => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };

    // Helper to parse string to Date
    const parseStringToDate = (dateStr: string): Date | undefined => {
        if (!dateStr) return undefined;
        try {
            return parse(dateStr, 'yyyy-MM-dd', new Date());
        } catch {
            return undefined;
        }
    };

    const handleInputChange = (index: number, field: keyof IMasterFeesInstallmentDueDateList, value: any) => {
        const updated = [...installments];
        updated[index] = { ...updated[index], [field]: value };
        setInstallments(updated);

        // Update form value
        const formInstallments = updated.map((inst) => ({
            // sno: inst.sno,
            // ftI_Name: inst.ftI_Name,
            // fdate: inst.fdate,
            // tdate: inst.tdate,
            // aplc: inst.aplc,
            // ddate: inst.ddate
        }));
        //setValue('installments', formInstallments);
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                installmentData: [
                    {
                        fmI_Id: row.fmI_Id,
                        fmI_Name: data.fmI_Name,
                        fmI_Installment_Type: data.fmI_Installment_Type,
                        fmI_No_Of_Installments: data.fmI_No_Of_Installments || installments.length,
                        updatedDate: new Date().toISOString()
                    }
                ]
                // inTData: installments.map((inst) => ({
                //     ftI_Id: inst.ftI_Id,
                //     mI_ID: row.mI_ID,
                //     ftI_Name: inst.ftI_Name || `Installment ${inst.sno}`,
                //     fdate: inst.fdate,
                //     tdate: inst.tdate,
                //     aplc: inst.aplc,
                //     ddate: inst.ddate,
                //     updatedDate: new Date().toISOString()
                // }))
            };

            const response = await addOrUpdateInsallmentDueDate(payload);

            if (response.success) {
                toast.success('Master Installment Due Date updated successfully!');
                refetchAll();
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to update installment due date');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset();
        if (row) {
            // const initialInstallment: IMasterFeesInstallmentDueDateList = {
            //     sno: 1,
            //     ftI_Id: row.ftI_Id,
            //     fmI_Id: row.fmI_Id,
            //     fmI_Name: row.fmI_Name,
            //     fmI_No_Of_Installments: row.fmI_No_Of_Installments,
            //     fmI_Installment_Type: row.fmI_Installment_Type,
            //     ftI_Name: row.ftI_Name || '',
            //     mI_ID: row.mI_ID,
            //     fmI_ActiveFlag: row.fmI_ActiveFlag,
            //     fdate: row.fdate || '',
            //     tdate: row.tdate || '',
            //     aplc: row.aplc || '',
            //     ddate: row.ddate || ''
            // };
            // setInstallments([initialInstallment]);
        }
    };

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Name'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Name'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-56 overflow-y-auto'>
                                        {INSTALLMENT_YEAR.map((year) => (
                                            <SelectItem key={year.value} value={year.value}>
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmI_Name && <FormError>{errors.fmI_Name.message}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Installment_Type'>
                            Master Installment <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Installment_Type'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Installment Type' />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-56 overflow-y-auto'>
                                        {INSTALLMENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.fmI_Installment_Type && <FormError>{errors.fmI_Installment_Type.message}</FormError>}
                    </div>
                </div>

                {installmentType === 'general' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='fmI_No_Of_Installments'>No. of Installments</Label>
                            <Controller
                                name='fmI_No_Of_Installments'
                                control={control}
                                render={({ field }) => (
                                    <input
                                        id='fmI_No_Of_Installments'
                                        type='number'
                                        min='1'
                                        {...field}
                                        value={field.value || ''}
                                        placeholder='Number of installments'
                                        className='w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                        readOnly
                                    />
                                )}
                            />
                            {errors.fmI_No_Of_Installments && <FormError>{errors.fmI_No_Of_Installments.message}</FormError>}
                        </div>
                    </div>
                )}

                {installments.length > 0 && (
                    <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm'>
                        <table className='min-w-full border-collapse bg-white'>
                            <thead>
                                <tr className='bg-gray-100 text-left font-semibold text-gray-700 text-sm'>
                                    <th className='w-16 border border-gray-200 px-4 py-2 text-center'>S.No</th>
                                    <th className='border border-gray-200 px-4 py-2'>Installment Name</th>
                                    <th className='border border-gray-200 px-4 py-2'>From Date</th>
                                    <th className='border border-gray-200 px-4 py-2'>To Date</th>
                                    <th className='border border-gray-200 px-4 py-2'>Applicable Date</th>
                                    <th className='border border-gray-200 px-4 py-2'>Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* {installments.map((inst, index) => (
                                    <tr key={inst.sno} className='text-gray-800 text-sm hover:bg-gray-50'>
                                        <td className='border border-gray-200 px-4 py-2 text-center font-medium'>{inst.sno}</td>
                                        <td className='border border-gray-200 px-4 py-2'>
                                            <InputText
                                                type='text'
                                                value={inst.ftI_Name}
                                                onChange={(e) => handleInputChange(index, 'ftI_Name', e.target.value)}
                                                placeholder={`Installment ${inst.sno}`}
                                                className='w-full rounded-md px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                            />
                                        </td>
                                        {(['fdate', 'tdate', 'aplc', 'ddate'] as const).map((dateField) => (
                                            <td key={dateField} className='border border-gray-200 px-4 py-2'>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !inst[dateField] && 'text-muted-foreground'
                                                            )}>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {inst[dateField]
                                                                ? format(parseStringToDate(inst[dateField]) || new Date(), 'dd/MM/yyyy')
                                                                : 'Select date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <CalendarYear
                                                            mode='single'
                                                            selected={parseStringToDate(inst[dateField])}
                                                            onSelect={(date) =>
                                                                handleInputChange(index, dateField, formatDateToString(date))
                                                            }
                                                            captionLayout='dropdown'
                                                            fromYear={2000}
                                                            toYear={2050}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </td>
                                        ))}
                                    </tr>
                                ))} */}
                            </tbody>
                        </table>
                    </div>
                )}

                {errors.installments && <FormError>{errors.installments.message}</FormError>}

                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'
                        disabled={isSubmitting}>
                        Reset
                    </Button>

                    <Button
                        type='submit'
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Master Installment Due Date
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
