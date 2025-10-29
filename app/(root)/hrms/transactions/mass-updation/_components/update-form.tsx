'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useSaveMassUpdation } from '@/hooks/hrms/useMassUpdation';
import type { MassUpdationOnloadResponse } from '@/types/hrms/mass-updation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Local schema for update form (more complex than the search schema)
const updateFormSchema = z.object({
    Type: z.string().min(1, 'Please select type'),
    EarningDeduction: z.string().min(1, 'Please select earning/deduction'),
    HRMED_Id: z.number().min(1, 'Please select head'),
    AmountPercentage: z.string().min(1, 'Please select amount or percentage'),
    HREED_Amount: z.number().min(0, 'Amount cannot be negative'),
    HREED_Percentage: z.string().optional(),
    AddRemove: z.string().min(1, 'Please select add or remove')
});

type FormFields = z.infer<typeof updateFormSchema>;

interface UpdateFormProps {
    onloadData: MassUpdationOnloadResponse | undefined;
    selectedEmployees: number[];
    onSuccess: () => void;
    className?: string;
}

export default function UpdateForm({ onloadData, selectedEmployees, onSuccess, className = '' }: UpdateFormProps) {
    const { mutate: saveUpdation, isPending } = useSaveMassUpdation();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(updateFormSchema),
        mode: 'onChange',
        defaultValues: {
            Type: '',
            EarningDeduction: '',
            HRMED_Id: 0,
            AmountPercentage: '',
            HREED_Amount: 0,
            HREED_Percentage: '',
            AddRemove: ''
        }
    });

    const earningDeductionValue = watch('EarningDeduction');
    const amountPercentageValue = watch('AmountPercentage');

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (selectedEmployees.length === 0) {
            toast.warning('Please select at least one employee to update.');
            return;
        }

        const payload = {
            MI_Id: HRMS_MI_ID,
            roleId: 2,
            LogInUserId: 5,
            Type: data.Type,
            EarningDeduction: data.EarningDeduction,
            AmountPercentage: data.AmountPercentage,
            HRMED_Id: data.HRMED_Id,
            HREED_Amount: data.HREED_Amount,
            HREED_Percentage: data.HREED_Percentage || '',
            AddRemove: data.AddRemove,
            groupTypeIdList: [],
            hrmD_IdList: [],
            hrmdeS_IdList: [],
            employeeselected: selectedEmployees
        };

        saveUpdation(payload, {
            onSuccess: (response) => {
                if (response?.success) {
                    toast.success(response.message || 'Mass updation applied successfully');
                    reset();
                    onSuccess();
                } else {
                    toast.error(response?.message || 'Failed to apply mass updation');
                }
            },
            onError: (error: any) => {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    const handleReset = () => {
        reset();
    };

    const earningDeductions = onloadData?.headdropdown || [];
    const filteredHeads = earningDeductions.filter(
        (head) =>
            (earningDeductionValue === 'Earning' && head.HRMED_EarnDedFlag === 'Earning') ||
            (earningDeductionValue === 'Deduction' && head.HRMED_EarnDedFlag === 'Deduction') ||
            !earningDeductionValue
    );

    return (
        <CollapsibleSection
            title='Apply Mass Updation'
            description={`Apply salary updates to ${selectedEmployees.length} selected employee(s).`}
            defaultOpen={true}
            className={`shadow-lg ${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {/* Type */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='Type'>
                                Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='Type'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='Type' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select type' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Earning'>Earning</SelectItem>
                                            <SelectItem value='Deduction'>Deduction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.Type && <FormError>{errors.Type.message}</FormError>}
                        </div>

                        {/* Earning/Deduction */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='EarningDeduction'>
                                Earning/Deduction <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='EarningDeduction'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='EarningDeduction'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Earning'>Earning</SelectItem>
                                            <SelectItem value='Deduction'>Deduction</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.EarningDeduction && <FormError>{errors.EarningDeduction.message}</FormError>}
                        </div>

                        {/* Head */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='HRMED_Id'>
                                Head <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='HRMED_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? String(field.value) : ''}>
                                        <SelectTrigger id='HRMED_Id' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select head' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredHeads.map((head) => (
                                                <SelectItem key={head.HRMED_Id} value={String(head.HRMED_Id)}>
                                                    {head.HRMED_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.HRMED_Id && <FormError>{errors.HRMED_Id.message}</FormError>}
                        </div>

                        {/* Amount or Percentage */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='AmountPercentage'>
                                Amount/Percentage <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='AmountPercentage'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger
                                            id='AmountPercentage'
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Amount'>Amount</SelectItem>
                                            <SelectItem value='Percentage'>Percentage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.AmountPercentage && <FormError>{errors.AmountPercentage.message}</FormError>}
                        </div>

                        {/* Amount - Conditional */}
                        {amountPercentageValue === 'Amount' && (
                            <Controller
                                name='HREED_Amount'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Amount'
                                        required
                                        id='HREED_Amount'
                                        placeholder='Enter amount'
                                        {...field}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        error={errors.HREED_Amount?.message}
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                        )}

                        {/* Percentage - Conditional */}
                        {amountPercentageValue === 'Percentage' && (
                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='HREED_Percentage'>
                                    Percentage <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='HREED_Percentage'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id='HREED_Percentage'
                                            placeholder='e.g., 10%'
                                            {...field}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                        />
                                    )}
                                />
                                {errors.HREED_Percentage && <FormError>{errors.HREED_Percentage.message}</FormError>}
                            </div>
                        )}

                        {/* Add or Remove */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='AddRemove'>
                                Action <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='AddRemove'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id='AddRemove' className='transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select action' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='Add'>Add</SelectItem>
                                            <SelectItem value='Remove'>Remove</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.AddRemove && <FormError>{errors.AddRemove.message}</FormError>}
                        </div>
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending || selectedEmployees.length === 0}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Applying...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Apply Mass Updation
                        </div>
                    </Button>
                </div>
            </form>
        </CollapsibleSection>
    );
}
