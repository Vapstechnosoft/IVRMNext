'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterModeOfPayment } from '@/hooks/fees/useMasters';
import { feeConfigSchema } from '@/schemas/fees/masters';
import { addOrUpdateModeOfPayment } from '@/server/fees/masters/modeOfPayment';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeConfigSchema.addOrUpdate>;

interface AddFeeConfigProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddFeeConfigForm({ onSuccess, className = '' }: AddFeeConfigProps) {
    const { refetchAll } = useMasterModeOfPayment();

    const {
        control,
        watch,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeConfigSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {}
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // const { ivrmmoD_ModeOfPayment, ivrmmoD_ModeOfPayment_Code } = data;
            const payload = {
                // mi_id: 30,
                // IVRMMOD_ModeOfPayment: ivrmmoD_ModeOfPayment,
                // IVRMMOD_ModeOfPayment_Code: ivrmmoD_ModeOfPayment_Code
            };

            const response = await addOrUpdateModeOfPayment(payload);
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
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid w-full grid-cols-3 gap-6'>
                    <div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='Preadmission Class' htmlFor='asmcl_preadmflag'>
                                    Preadmission Class <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <RadioGroup
                                    value={String(watch('FMC_GroupOrTermFlg'))}
                                    onValueChange={(value) => setValue('FMC_GroupOrTermFlg', String(value))}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='yes' />
                                        <Label aria-label='Yes' htmlFor='yes'>
                                            Fee Term
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='no' />
                                        <Label aria-label='No' htmlFor='no'>
                                            Fee Group
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Include Financial Account Concept'>Include Financial Account Concept</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FMC_Areawise_FeeFlg'
                                    control={control}
                                    defaultValue={0} // default as integer 0 (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === 1}
                                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} // send int values
                                                id='FMC_Areawise_FeeFlg'
                                            />
                                            <Label htmlFor='Auto Fee Group Mapping during Promotion'>
                                                Auto Fee Group Mapping during Promotion
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on area'>
                                                Transport Fee Automapping based on area
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on Zone'>
                                                Transport Fee Automapping based on Zone
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Date of Admission condition checking'>
                                                Date of Admission condition checking
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show fee group remark in fee receipts and reports'>
                                                Show fee group remark in fee receipts and reports
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fee Groupwise Auto receipt No'>Fee Groupwise Auto receipt No</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fee Receipt Format Display'>Fee Receipt Format Display</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Concession Process'>Concession Process</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Staff Mapping Entry'>Staff Mapping Entry</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Others Students Entry'>Others Students Entry</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor=' Fine Applicable'> Fine Applicable</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fine Mapping'>Fine Mapping</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='User Level Previledge'>User Level Previledge</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Categorywise block online Payment'>Categorywise block online Payment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Display Pending/OB Term initially'>Enable Maker And Checker</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable'>Rebate Applicable</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable For Full Payment'>Rebate Applicable For Full Payment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable For Partial Payment'>
                                                Rebate Applicable For Partial Payment
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 mt-1.5lex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on Zone'>
                                                Transport Fee Automapping based on Zone
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='Preadmission Class' htmlFor='asmcl_preadmflag'>
                                    Preadmission Class <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <RadioGroup
                                    value={String(watch('FMC_GroupOrTermFlg'))}
                                    onValueChange={(value) => setValue('FMC_GroupOrTermFlg', String(value))}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='yes' />
                                        <Label aria-label='Yes' htmlFor='yes'>
                                            Fee Term
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='no' />
                                        <Label aria-label='No' htmlFor='no'>
                                            Fee Group
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Installment'>Show Installment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FMC_Areawise_FeeFlg'
                                    control={control}
                                    defaultValue={0} // default as integer 0 (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === 1}
                                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} // send int values
                                                id='FMC_Areawise_FeeFlg'
                                            />
                                            <Label htmlFor='Merge Installment'>Merge Installment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Fine'>Show Fine</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Concession'>Show Concession</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Waived Off'>Show Waived Off</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Balance'>Show Balance</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Amount'>Show Amount</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show Bank Name'>Show Bank Name</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Bank Challan'>Bank Challan</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Due Date'>Due Date</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Address'>Address</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor='Rebate' className='w-32'>
                                Rebate(%) :
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>

                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor='Receipt Signature:' className='w-32'>
                                Receipt Signature:
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>

                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor='No. Of Receipt' className='w-32'>
                                No. Of Receipt :
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor=' No. Of Search By Character' className='w-32'>
                                No. Of Search By Character :
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>

                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor='Online Payment AcademicYear Flag' className='w-32'>
                                Online Payment AcademicYear Flag :
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>

                        <div className='group mt-1.5 flex flex-row items-center gap-3'>
                            <label htmlFor='Partial Payment' className='w-32'>
                                Partial Payment :
                            </label>
                            <input
                                id='Rebate'
                                {...register('Rebate')}
                                className='rounded border px-2 py-1 transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                    </div>
                    <div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label aria-label='Preadmission Class' htmlFor='asmcl_preadmflag'>
                                    Preadmission Class <span className='ml-1 text-red-500'>*</span>
                                </Label>
                                <RadioGroup
                                    value={String(watch('FMC_GroupOrTermFlg'))}
                                    onValueChange={(value) => setValue('FMC_GroupOrTermFlg', String(value))}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='yes' />
                                        <Label aria-label='Yes' htmlFor='yes'>
                                            Fee Term
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='0' id='no' />
                                        <Label aria-label='No' htmlFor='no'>
                                            Fee Group
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Include Financial Account Concept'>Include Financial Account Concept</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-2'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FMC_Areawise_FeeFlg'
                                    control={control}
                                    defaultValue={0} // default as integer 0 (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === 1}
                                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)} // send int values
                                                id='FMC_Areawise_FeeFlg'
                                            />
                                            <Label htmlFor='Auto Fee Group Mapping during Promotion'>
                                                Auto Fee Group Mapping during Promotion
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on area'>
                                                Transport Fee Automapping based on area
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on Zone'>
                                                Transport Fee Automapping based on Zone
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Date of Admission condition checking'>
                                                Date of Admission condition checking
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Show fee group remark in fee receipts and reports'>
                                                Show fee group remark in fee receipts and reports
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fee Groupwise Auto receipt No'>Fee Groupwise Auto receipt No</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fee Receipt Format Display'>Fee Receipt Format Display</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Concession Process'>Concession Process</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Staff Mapping Entry'>Staff Mapping Entry</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Others Students Entry'>Others Students Entry</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor=' Fine Applicable'> Fine Applicable</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Fine Mapping'>Fine Mapping</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='User Level Previledge'>User Level Previledge</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Categorywise block online Payment'>Categorywise block online Payment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Display Pending/OB Term initially'>Enable Maker And Checker</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable'>Rebate Applicable</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable For Full Payment'>Rebate Applicable For Full Payment</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 flex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Rebate Applicable For Partial Payment'>
                                                Rebate Applicable For Partial Payment
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className='group mt-1.5 mt-1.5lex flex-col gap-1.5'>
                            <div className='group flex flex-row gap-6'>
                                <Controller
                                    name='FinancialAccount'
                                    control={control}
                                    defaultValue='0' // Set default as "0" (unchecked)
                                    render={({ field }) => (
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                checked={field.value === '1'}
                                                onCheckedChange={(checked) => field.onChange(checked ? '1' : '0')}
                                                id='FinancialAccount'
                                            />
                                            <Label htmlFor='Transport Fee Automapping based on Zone'>
                                                Transport Fee Automapping based on Zone
                                            </Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
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
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
