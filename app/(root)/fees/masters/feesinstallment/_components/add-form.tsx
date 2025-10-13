'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { masterInstallmentSchema } from '@/schemas/fees/masters';
import { addOrUpdateInsallment } from '@/server/fees/masters/feeinstallment';

export default function AddMasterInstallmentForm() {
    const [installments, setInstallments] = useState<{ sno: number; ftI_Name: string }[]>([]);

    type MasterInstallmentFormSchema = z.infer<typeof masterInstallmentSchema.addOrUpdate>;

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<MasterInstallmentFormSchema>({
        resolver: zodResolver(masterInstallmentSchema.addOrUpdate),
        mode: 'onChange'
    });

    const installmentType = watch('fmI_Installment_Type');
    const _count = watch('fmI_No_Of_Installments');

    const INSTALLMENT_TYPES = [
        { value: 'general', label: 'General', count: 0 },
        { value: 'monthly', label: 'Monthly', count: 12 },
        { value: 'quarterly', label: 'Quarterly', count: 4 },
        { value: 'halfyearly', label: 'Half Yearly', count: 2 },
        { value: 'yearly', label: 'Yearly', count: 1 },
        { value: 'bimonthly', label: 'Bi-Monthly', count: 24 },
        { value: 'anytime', label: 'Anytime', count: 1 }
    ];

    const handleTypeChange = (value: string) => {
        const selected = INSTALLMENT_TYPES.find((t) => t.value === value);
        if (value !== 'general') {
            const count = selected?.count || 0;
            setInstallments(Array.from({ length: count }, (_, i) => ({ sno: i + 1, ftI_Name: '' })));
        } else {
            setInstallments([]);
        }
    };

    const handleGeneralCountChange = (num: number) => {
        if (!Number.isNaN(num) && num > 0) {
            setInstallments(Array.from({ length: num }, (_, i) => ({ sno: i + 1, ftI_Name: '' })));
        } else {
            setInstallments([]);
        }
    };

    const handleInputChange = (index: number, value: string) => {
        const updated = [...installments];
        updated[index].ftI_Name = value;
        setInstallments(updated);
    };

    const onSubmit = async (data: MasterInstallmentFormSchema) => {
        try {
            const payload = {
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
                    createdDate: new Date().toISOString(),
                    updatedDate: new Date().toISOString()
                }))
            };

            const response = await addOrUpdateInsallment(payload);

            if (response.success) {
                toast.success('Installment details saved successfully!');
                reset();
                setInstallments([]);
            } else {
                toast.error(response.message || 'Failed to save installment');
            }
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
                {/* Master Installment Name + Type */}
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Name'>
                            Master Installment Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='fmI_Name'
                            control={control}
                            render={({ field }) => <InputText id='fmI_Name' placeholder='Enter master installment name' {...field} />}
                        />
                        {errors.fmI_Name && <FormError>{errors.fmI_Name.message}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label htmlFor='fmI_Installment_Type'>
                            Installment Type <span className='text-red-500'>*</span>
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

                {/* General Type - No. of Installments */}
                {installmentType === 'general' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2'>
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
                                        className='w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
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
                                </tr>
                            </thead>
                            <tbody>
                                {installments.map((row, index) => (
                                    <tr key={row.sno} className='text-gray-800 text-sm transition-colors duration-150 hover:bg-gray-50'>
                                        <td className='border border-gray-200 px-4 py-2 text-center font-medium'>{row.sno}</td>
                                        <td className='border border-gray-200 px-4 py-2'>
                                            <input
                                                type='text'
                                                value={row.ftI_Name}
                                                onChange={(e) => handleInputChange(index, e.target.value)}
                                                placeholder={`Installment ${row.sno}`}
                                                className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Installment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
