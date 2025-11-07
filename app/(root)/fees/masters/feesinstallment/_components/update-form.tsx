'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useRef } from 'react';
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
    installments?: { sno: number; ftI_Name: string; ftI_Id?: number }[];
};

interface UpdateMasterFeeInstallmentFormProps {
    onSuccess?: () => void;
    selectedRow: IMasterFeesInstallmentList;
}

export default function UpdateMasterFeeInstallmentForm({ onSuccess, selectedRow: row }: UpdateMasterFeeInstallmentFormProps) {
    const { refetchAll } = useMasterFeeInstallment();

    const sanitizedRef = useRef<{
        fmI_Id?: number | string;
        fmI_ActiveFlag?: any;
    }>({});

    const sanitizeId = (id: any) => {
        if (id === null || id === undefined) return undefined;
        if (typeof id === 'string') {
            const trimmed = id.trim();
            const lower = trimmed.toLowerCase();
            if (lower === '$undefined' || lower === 'undefined' || trimmed === '') {
                return undefined;
            }
            const n = Number(trimmed);
            if (!Number.isNaN(n) && n > 0 && Number.isInteger(n)) {
                return n;
            }
            if (!Number.isNaN(n)) {
                return undefined;
            }
            return trimmed;
        }
        if (typeof id === 'number') {
            return id > 0 && Number.isInteger(id) ? id : undefined;
        }
        return undefined;
    };

    const sanitizeSnapshot = (vals: any): FormFields | null => {
        if (!vals) return null;
        const copy: any = { ...vals };

        copy.fmI_Id = sanitizeId(copy.fmI_Id);

        if (Array.isArray(copy.installments)) {
            copy.installments = copy.installments.map((inst: any) => ({
                sno: inst?.sno,
                ftI_Name: inst?.ftI_Name ?? '',
                ftI_Id: sanitizeId(inst?.ftI_Id ?? inst?.id)
            }));
        }

        copy.fmI_No_Of_Installments = Number(copy.fmI_No_Of_Installments) || 1;

        copy.fmI_Installment_Type = copy.fmI_Installment_Type ?? '';
        copy.fmI_Name = copy.fmI_Name ?? '';

        return copy as FormFields;
    };

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
            installments: [],
            fmI_Installment_Type: row?.fmI_Installment_Type?.toLowerCase() || '',
            fmI_Name: row?.fmI_Name || '',
            fmI_No_Of_Installments: row?.fmI_No_Of_Installments || 1
        }
    });

    const initialValuesRef = useRef<FormFields | null>(null);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'installments'
    });

    const watchNoOfInstallments = useWatch({
        control,
        name: 'fmI_No_Of_Installments'
    });

    useEffect(() => {
        if (!row) return;

        const rawType = row.fmI_Installment_Type;
        let normalizedType = '';

        if (rawType === undefined || rawType === null) {
            normalizedType = '';
        } else if (typeof rawType === 'number' || /^(\d+)$/g.test(String(rawType))) {
            const num = Number(rawType);
            normalizedType = num === 1 ? 'monthly' : num === 2 ? 'quarterly' : String(rawType);
        } else {
            normalizedType = String(rawType).toLowerCase();
        }

        const fmIId = sanitizeId(row.fmI_Id ?? (row as any).id);
        sanitizedRef.current = {
            fmI_Id: fmIId,
            fmI_ActiveFlag: row.fmI_ActiceFlag
        };

        const installments =
            Array.isArray((row as any).fydto) && (row as any).fydto.length > 0
                ? (row as any).fydto.map((inst: any, index: number) => ({
                      sno: index + 1,
                      ftI_Name: inst.ftI_Name ?? `Installment ${index + 1}`,
                      ftI_Id: sanitizeId(inst.ftI_Id ?? inst.id)
                  }))
                : Array.from({ length: row.fmI_No_Of_Installments || 1 }, (_, i) => ({
                      sno: i + 1,
                      ftI_Name: `Installment ${i + 1}`
                  }));

        setValue('fmI_Installment_Type', normalizedType, { shouldValidate: true });
        setValue('fmI_Name', row.fmI_Name, { shouldValidate: true });
        setValue('fmI_No_Of_Installments', installments.length, {
            shouldValidate: true
        });
        setValue('installments', installments, { shouldValidate: true });
        setValue('fmI_Id', typeof fmIId === 'number' ? fmIId : undefined);

        initialValuesRef.current = sanitizeSnapshot({
            fmI_Id: typeof fmIId === 'number' ? fmIId : undefined,
            fmI_Installment_Type: normalizedType,
            fmI_Name: row.fmI_Name,
            fmI_No_Of_Installments: installments.length,
            installments
        });
    }, [row, setValue]);

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

    const onSubmit = async (data: FormFields) => {
        try {
            const idFromForm = sanitizeId((data as any)?.fmI_Id ?? data.fmI_Id);
            const originalId =
                (idFromForm && typeof idFromForm === 'number' && idFromForm > 0 ? idFromForm : undefined) ??
                (typeof sanitizedRef.current?.fmI_Id === 'number'
                    ? sanitizedRef.current?.fmI_Id
                    : sanitizeId(row.fmI_Id ?? (row as any).id));

            const fmI_Id = originalId && typeof originalId === 'number' && originalId > 0 ? originalId : undefined;

            const payload = {
                fmI_Id,
                mI_Id: row.mI_Id,
                fmI_Name: data.fmI_Name,
                fmI_Installment_Type: data.fmI_Installment_Type,
                fmI_No_Of_Installments: data.fmI_No_Of_Installments,
                fydto: (data.installments || []).map((inst: any, idx: number) => {
                    const originalInst = (row as any).fydto?.[idx] ?? {};
                    const originalId = sanitizeId(originalInst.ftI_Id ?? originalInst.id);
                    const idFromForm = sanitizeId(inst.ftI_Id);
                    const ftI_Id =
                        idFromForm && typeof idFromForm === 'number' && idFromForm > 0
                            ? idFromForm
                            : originalId && typeof originalId === 'number' && originalId > 0
                              ? originalId
                              : undefined;
                    return {
                        ftI_Id,
                        ftI_Name: inst.ftI_Name
                    };
                })
            };

            const sanitizeOutgoing = (obj: any): any => {
                if (obj === null || obj === undefined) return undefined;
                if (typeof obj === 'string') {
                    const t = obj.trim();
                    if (t.toLowerCase() === '$undefined' || t.toLowerCase() === 'undefined' || t === '') return undefined;
                    const n = Number(t);
                    if (!Number.isNaN(n) && Number.isInteger(n) && n > 0) return n;
                    return obj;
                }
                if (typeof obj === 'number' || typeof obj === 'boolean') return obj;
                if (Array.isArray(obj)) return obj.map((v) => sanitizeOutgoing(v));
                if (typeof obj === 'object') {
                    const out: any = Array.isArray(obj) ? [] : {};
                    for (const k of Object.keys(obj)) {
                        const v = sanitizeOutgoing(obj[k]);
                        if (v !== undefined) out[k] = v;
                    }
                    return out;
                }
                return undefined;
            };

            const clean = sanitizeOutgoing(payload);

            const response = await addOrUpdateInstallment(clean);

            if (response?.success) {
                toast.success(response?.message ?? 'Master Installment updated successfully!');
                refetchAll();
                reset(sanitizeSnapshot(initialValuesRef.current) ?? undefined);
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
        if (initialValuesRef.current) {
            reset(sanitizeSnapshot(initialValuesRef.current) ?? undefined);
        } else {
            reset();
        }
    };

    return (
        <div className='p-4'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <input type='hidden' {...register('fmI_Id')} />

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

                <div className='flex flex-col gap-1.5'>
                    <Label htmlFor='fmI_Installment_Type'>
                        Installment Type <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fmI_Installment_Type'
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value ?? ''} onValueChange={field.onChange}>
                                <SelectTrigger className='w-full' disabled>
                                    <SelectValue placeholder='Select Installment Type' />
                                </SelectTrigger>
                                <SelectContent className='max-h-56 overflow-y-auto'>
                                    <SelectItem value='general'>General</SelectItem>
                                    <SelectItem value='monthly'>Monthly</SelectItem>
                                    <SelectItem value='quarterly'>Quarterly</SelectItem>
                                    <SelectItem value='halfyearly'>Half Yearly</SelectItem>
                                    <SelectItem value='yearly'>Yearly</SelectItem>
                                    <SelectItem value='bimonthly'>Bi-Monthly</SelectItem>
                                    <SelectItem value='anytime'>Anytime</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.fmI_Installment_Type && <FormError>{errors.fmI_Installment_Type.message}</FormError>}
                </div>

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
                                            {/* Preserve ftI_Id so payload includes existing installment IDs. Use Controller to avoid DOM string coercion issues. */}
                                            <Controller
                                                name={`installments.${index}.ftI_Id` as const}
                                                control={control}
                                                render={({ field }) => (
                                                    <input
                                                        type='hidden'
                                                        value={field.value as any}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value);
                                                        }}
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
