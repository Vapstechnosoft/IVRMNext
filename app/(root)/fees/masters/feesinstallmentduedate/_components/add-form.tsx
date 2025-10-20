'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { cn } from '@/lib/utils';
import { masterInstallmentDueDateSchema } from '@/schemas/fees/masters';
import type { IMasterFeesInstallmentDueDateList } from '@/types/fees/masters';

type MasterInstallmentFormSchema = z.infer<typeof masterInstallmentDueDateSchema>;

interface AcademicYearOption {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface AddMasterInstallmentDueDateFormProps {
    onSuccess?: () => void;
}

export default function AddMasterInstallmentDueDateForm({ onSuccess }: AddMasterInstallmentDueDateFormProps) {
    const [installments, setInstallments] = useState<IMasterFeesInstallmentDueDateList[]>([]);

    const { data: academicYearData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<MasterInstallmentFormSchema>({
        resolver: zodResolver(masterInstallmentDueDateSchema),
        mode: 'onChange',
        defaultValues: {
            fmI_Name: '',
            fmI_Installment_Type: '',
            installments: []
        }
    });

    const installmentType = watch('fmI_Installment_Type');
    const selectedYear = watch('fmI_Name');

    const INSTALLMENT_TYPES = [
        { value: 'general', label: 'General', count: 0 },
        { value: 'monthly', label: 'Monthly', count: 12 },
        { value: 'quarterly', label: 'Quarterly', count: 4 },
        { value: 'halfyearly', label: 'Half Yearly', count: 2 },
        { value: 'yearly', label: 'Yearly', count: 1 },
        { value: 'bimonthly', label: 'Bi-Monthly', count: 24 },
        { value: 'anytime', label: 'Anytime', count: 1 }
    ];

    // Handle academic year data loading errors
    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
        }
    }, [academicError]);

    // Convert installments to form data format
    const convertInstallmentsToFormData = (rows: IMasterFeesInstallmentDueDateList[]) => {
        return rows.map((row) => ({
            sno: row.sno,
            ftI_Name: row.ftI_Name,
            fdate: row.fdate,
            tdate: row.tdate,
            aplc: row.aplc,
            ddate: row.ddate
        }));
    };

    const handleTypeChange = (value: string) => {
        const selected = INSTALLMENT_TYPES.find((t) => t.value === value);
        if (value !== 'general') {
            const count = selected?.count || 0;
            const newInstallments: IMasterFeesInstallmentDueDateList[] = Array.from({ length: count }, (_, i) => ({
                sno: i + 1,
                ftI_Id: 0,
                fmI_Id: 0,
                fmI_Name: '',
                fmI_No_Of_Installments: count,
                fmI_Installment_Type: value,
                ftI_Name: '',
                mI_ID: 30,
                fmI_ActiveFlag: true,
                fdate: '',
                tdate: '',
                aplc: '',
                ddate: ''
            }));
            setInstallments(newInstallments);
            setValue('installments', convertInstallmentsToFormData(newInstallments));
        } else {
            setInstallments([]);
            setValue('installments', []);
            setValue('fmI_No_Of_Installments', undefined);
        }
    };

    const handleGeneralCountChange = (num: number) => {
        if (!Number.isNaN(num) && num > 0) {
            const newInstallments: IMasterFeesInstallmentDueDateList[] = Array.from({ length: num }, (_, i) => ({
                sno: i + 1,
                ftI_Id: 0,
                fmI_Id: 0,
                fmI_Name: '',
                fmI_No_Of_Installments: num,
                fmI_Installment_Type: 'general',
                ftI_Name: '',
                mI_ID: 30,
                fmI_ActiveFlag: true,
                fdate: '',
                tdate: '',
                aplc: '',
                ddate: ''
            }));
            setInstallments(newInstallments);
            setValue('installments', convertInstallmentsToFormData(newInstallments));
        } else {
            setInstallments([]);
            setValue('installments', []);
        }
    };

    const handleInputChange = (index: number, field: keyof IMasterFeesInstallmentDueDateList, value: any) => {
        const updated = [...installments];
        updated[index] = { ...updated[index], [field]: value };
        setInstallments(updated);
        setValue('installments', convertInstallmentsToFormData(updated));
    };

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

    const onSubmit = async (data: MasterInstallmentFormSchema) => {
        try {
            const _payload = {
                installmentData: [
                    {
                        fmI_Name: data.fmI_Name,
                        fmI_Installment_Type: data.fmI_Installment_Type,
                        fmI_No_Of_Installments: installments.length,
                        createdDate: new Date().toISOString(),
                        updatedDate: new Date().toISOString()
                    }
                ],
                inTData: installments.map((row) => ({
                    mI_ID: 30,
                    ftI_Name: row.ftI_Name || `Installment ${row.sno}`,
                    fdate: row.fdate,
                    tdate: row.tdate,
                    aplc: row.aplc,
                    ddate: row.ddate,
                    createdDate: new Date().toISOString(),
                    updatedDate: new Date().toISOString()
                }))
            };

            toast.success('Installment details saved successfully!');
            handleReset();
            onSuccess?.();
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset();
        setInstallments([]);
    };

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Academic Year + Type */}
                <div className='grid grid-cols-1 gap-6 border-b pb-4 sm:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Name'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Name'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={loadingAcademic}>
                                    <SelectTrigger
                                        id='fmI_Name'
                                        className={cn('w-full transition-colors', errors.fmI_Name ? 'border-red-500' : '')}>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-56 overflow-y-auto'>
                                        {Array.isArray(academicYearData?.data) &&
                                            academicYearData.data.map((year: AcademicYearOption) => (
                                                <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
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
                                <Select
                                    value={field.value}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        handleTypeChange(val);
                                    }}>
                                    <SelectTrigger
                                        id='fmI_Installment_Type'
                                        className={cn('w-full transition-colors', errors.fmI_Installment_Type ? 'border-red-500' : '')}>
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

                {/* General Type - No. of Installments */}
                {installmentType === 'general' && (
                    <div className='grid grid-cols-1 border-b pb-4 sm:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                            <Label htmlFor='fmI_No_Of_Installments'>
                                No. of Installments <span className='text-red-500'>*</span>
                            </Label>
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
                                        onChange={(e) => {
                                            const num = Number(e.target.value);
                                            field.onChange(num);
                                            handleGeneralCountChange(num);
                                        }}
                                        placeholder='Enter number of installments'
                                        className={cn(
                                            'w-full rounded-md border px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary',
                                            errors.fmI_No_Of_Installments ? 'border-red-500' : 'border-gray-300'
                                        )}
                                    />
                                )}
                            />
                            {errors.fmI_No_Of_Installments && <FormError>{errors.fmI_No_Of_Installments.message}</FormError>}
                        </div>
                    </div>
                )}

                {/* Dynamic Table */}
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
                                {installments.map((row, index) => (
                                    <tr key={row.sno} className='text-gray-800 text-sm hover:bg-gray-50'>
                                        <td className='border border-gray-200 px-4 py-2 text-center font-medium'>{row.sno}</td>
                                        <td className='border border-gray-200 px-4 py-2'>
                                            <InputText
                                                type='text'
                                                value={row.ftI_Name}
                                                onChange={(e) => handleInputChange(index, 'ftI_Name', e.target.value)}
                                                placeholder={`Installment ${row.sno}`}
                                                className='w-full rounded-md px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                            />
                                        </td>
                                        {(['fdate', 'tdate', 'aplc', 'ddate'] as const).map((dateField) => (
                                            <td key={dateField} className='border border-gray-200 px-4 py-2'>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !row[dateField] && 'text-muted-foreground'
                                                            )}>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {row[dateField]
                                                                ? format(parseStringToDate(row[dateField]) || new Date(), 'dd/MM/yyyy')
                                                                : 'Select date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0' align='start'>
                                                        <CalendarYear
                                                            mode='single'
                                                            selected={parseStringToDate(row[dateField])}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {errors.installments && <FormError>{errors.installments.message}</FormError>}

                {/* Action Buttons */}
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
                        disabled={isSubmitting || !selectedYear || installments.length === 0}>
                        <Save className='mr-2 h-4 w-4' />
                        Save Installment Due Date
                    </Button>
                </div>
            </form>
        </div>
    );
}
