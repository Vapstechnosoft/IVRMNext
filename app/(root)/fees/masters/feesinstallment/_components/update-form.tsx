'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMasterFeeInstallment } from '@/hooks/fees/useMasters';
import { masterInstallmentSchema } from '@/schemas/fees/masters';
import { addOrUpdateInstallment } from '@/server/fees/masters/feeinstallment';
import type { IMasterFeesInstallmentList } from '@/types/fees/masters/masters';

type FormFields = z.infer<typeof masterInstallmentSchema.addOrUpdate> & {
    fmI_Id?: number;
    installments?: { sno: number; ftI_Name: string }[];
};

interface UpdateMasterFeeInstallmentFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterFeesInstallmentList;
}

export default function UpdateMasterFeeInstallmentForm({ onSuccess, selectedRow: row }: UpdateMasterFeeInstallmentFormProps) {
    const { refetchAll } = useMasterFeeInstallment();

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterInstallmentSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            installments: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'installments'
    });

    const watchNoOfInstallments = useWatch({
        control,
        name: 'fmI_No_Of_Installments'
    });

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
            setValue('fmI_No_Of_Installments', count, { shouldDirty: true });
        }
    };

    const normalizeType = (val: any) => {
        if (val === undefined || val === null) return '';
        if (typeof val === 'number') {
            if (val === 1) return 'monthly';
            if (val === 2) return 'quarterly';
        }
        const s = String(val).toLowerCase().trim();
        if (s === '1') return 'monthly';
        if (s === '2') return 'quarterly';
        if (s.includes('month') && s.includes('bi') === false) return 'monthly';
        if (s.includes('quarter')) return 'quarterly';
        if (s.includes('half')) return 'halfyearly';
        if (s.includes('year')) return 'yearly';
        if (s.includes('bimonth')) return 'bimonthly';
        if (s === 'anytime') return 'anytime';
        if (s === 'general') return 'general';
        return s;
    };

    useEffect(() => {
        if (watchNoOfInstallments !== undefined) {
            const targetLength = Number(watchNoOfInstallments);
            const currentLength = fields.length;

            if (targetLength > currentLength) {
                for (let i = currentLength; i < targetLength; i++) {
                    append({ sno: i + 1, ftI_Name: `Installment ${i + 1}` });
                }
            } else if (targetLength < currentLength) {
                for (let i = currentLength - 1; i >= targetLength; i--) {
                    remove(i);
                }
            }
        }
    }, [watchNoOfInstallments, fields.length, append, remove]);

    useEffect(() => {
        if (row) {
            const pickInstallmentName = (inst: any, idx: number) =>
                inst?.ftI_Name ?? inst?.ftI_NAME ?? inst?.installmentname ?? `Installment ${idx + 1}`;

            let mappedInstallments: { sno: number; ftI_Name: string }[] = [];

            if (Array.isArray(row.installments) && row.installments.length > 0) {
                mappedInstallments = row.installments.map((inst: any, index: number) => ({
                    sno: inst?.sno ?? index + 1,
                    ftI_Name: pickInstallmentName(inst, index)
                }));
            } else {
                const count = Number(row.fmI_No_Of_Installments) || 1;
                mappedInstallments = Array.from({ length: count }, (_, i) => {
                    const r: any = row as any;
                    return {
                        sno: i + 1,
                        ftI_Name: r?.ftI_Name ?? r?.ftI_NAME ?? r?.installmentname ?? `Installment ${i + 1}`
                    };
                });
            }

            const normalizedType = normalizeType(row.fmI_Installment_Type);

            reset({
                fmI_Id: row.fmI_Id,
                fmI_Name: row.fmI_Name,
                fmI_Installment_Type: normalizedType,
                fmI_No_Of_Installments: mappedInstallments.length,
                installments: mappedInstallments
            });
        }
    }, [row, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                fmI_Id: data.fmI_Id ?? row.fmI_Id,
                mI_Id: row.mI_Id ?? 30,
                fmI_Name: data.fmI_Name,
                fmI_Installment_Type: data.fmI_Installment_Type,
                fmI_No_Of_Installments: data.installments?.length ?? 0,
                fydto:
                    data.installments?.map((inst) => ({
                        ftI_Name: inst.ftI_Name || ''
                    })) ?? [],
                fmI_ActiveFlag: row.fmI_ActiveFlag ?? true
            };

            const response = await addOrUpdateInstallment(payload);

            if (response?.success) {
                toast.success(response?.message ?? 'Master Installment updated successfully!');
                refetchAll();
                reset();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update installment');
            }
        } catch (error: any) {
            console.error('Error in onSubmit:', error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <input type='hidden' {...register('fmI_Id')} />

                {/* Master Installment Name */}
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='fmI_Name'>
                        Master Installment Name <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fmI_Name'
                        control={control}
                        render={({ field }) => (
                            <InputText
                                id='fmI_Name'
                                placeholder='Enter master installment name'
                                {...field}
                                value={field.value ?? ''}
                                onChange={field.onChange}
                                disabled
                            />
                        )}
                    />
                    {errors.fmI_Name && <FormError>{errors.fmI_Name.message}</FormError>}
                </div>

                {/* Installment Type (dropdown) */}
                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='fmI_Installment_Type'>
                        Installment Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fmI_Installment_Type'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value ?? ''}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    handleTypeChange(val);
                                }}>
                                <SelectTrigger className='w-full' disabled>
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

                {/* No of Installments */}
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
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                placeholder='Enter number of installments'
                                className='w-full rounded-md border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                            />
                        )}
                    />
                    {errors.fmI_No_Of_Installments && <FormError>{errors.fmI_No_Of_Installments.message}</FormError>}
                </div>

                {/* Dynamic Installments Table */}
                {fields.length > 0 && (
                    <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm'>
                        <table className='min-w-full border-collapse bg-white'>
                            <thead>
                                <tr className='bg-gray-100 text-left font-semibold text-gray-700 text-sm'>
                                    <th className='w-16 border border-gray-200 px-4 py-2 text-center'>S.No</th>
                                    <th className='border border-gray-200 px-4 py-2'>Installment Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((field, index) => (
                                    <tr key={field.id} className='text-gray-800 text-sm transition-colors duration-150 hover:bg-gray-50'>
                                        <td className='border border-gray-200 px-4 py-2 text-center font-medium'>{index + 1}</td>
                                        <td className='border border-gray-200 px-4 py-2'>
                                            <Controller
                                                name={`installments.${index}.ftI_Name`}
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type='text'
                                                        {...field}
                                                        placeholder={`Installment ${index + 1}`}
                                                        className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary'
                                                    />
                                                )}
                                            />
                                            {errors.installments?.[index]?.ftI_Name && (
                                                <FormError>{errors.installments?.[index]?.ftI_Name?.message}</FormError>
                                            )}
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
                            Update Master Installment
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
