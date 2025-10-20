'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MASTER_HEADS_DROPDOWN, MASTER_INSTALLMENT_DROPDOWN, TERM_DROPDOWN_DATA, useMasterTermsHead } from '@/hooks/fees/useMasters';
import { masterConcessionDetailsSchema } from '@/schemas/fees/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterConcessionDetailsSchema.addOrUpdate>;

interface FeeTermsHeadFormProps {
    onSuccess?: () => void;
    termname?: string;
}

export default function AddMasterConcessionDetailsForm({ onSuccess, termname = '' }: FeeTermsHeadFormProps) {
    const { refetchAll } = useMasterTermsHead();
    const [selectedHeadsItems, setSelectedHeadsItems] = useState<{ fmH_Id: string; fmH_FeeName: string }[]>([]);

    const [SelectedInstallmentsItems, setSelectedInstallmentsItems] = useState<{ ftI_ID: string; ftI_NAME: string }[]>([]);

    const { data: terms, isLoading: termsLoading, error: termsError, refetchAll: refetchheads } = TERM_DROPDOWN_DATA();

    const {
        data: masterInstallment,
        isLoading: masterInstallmentLoading,
        error: masterInstallmentError,
        refetchAll: refetchmasterInstallment
    } = MASTER_INSTALLMENT_DROPDOWN();

    const { data: masterHeads, isLoading: masterHeadsLoading, refetchAll: refetchMasterHeads } = MASTER_HEADS_DROPDOWN();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterConcessionDetailsSchema.addOrUpdate),
        mode: 'onChange'
    });

    function OnReset() {
        reset();
        setSelectedHeadsItems([]);
        setSelectedInstallmentsItems([]);
        refetchAll();
        refetchheads();
        refetchmasterInstallment();
        refetchMasterHeads();
    }

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            // const { fmT_Id } = data;
            const payload = {
                // terms: fmT_Id,
                installments: SelectedInstallmentsItems,
                heads: selectedHeadsItems
            };

            // const response = await addMasterClassCategory(payload);

            // if (response.success) {
            //     toast.success(response.message);
            //     OnReset();
            //     onSuccess?.();
            // } else {
            //     toast.error(response.message);
            // }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleReset = () => {
        reset();
    };

    const handleHeadSelection = (selectedValues: string[]) => {
        const selectedheads = selectedValues.map((value) => {
            return { fmH_Id: value.toString(), fmH_FeeName: '' };
        });

        setSelectedHeadsItems(selectedheads);
    };

    const handleInstallmentSelection = (selectedValues: string[]) => {
        const selectedInstallment = selectedValues.map((value) => {
            return { ftI_ID: value.toString(), ftI_NAME: '' };
        });

        setSelectedInstallmentsItems(selectedInstallment);
    };

    return (
        <div className={`${termname}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Term' htmlFor='fmT_Id'>
                                Term <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='fmcC_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select Term' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {termsLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading Terms...
                                                </SelectItem>
                                            ) : termsError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading Terms
                                                </SelectItem>
                                            ) : (
                                                terms?.data?.map((item) => (
                                                    <SelectItem key={item.fmT_Id} value={item.fmT_Id.toString()}>
                                                        {item.fmT_Name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.fmcC_Id && <FormError>{errors.fmcC_Id.message}</FormError>}
                        </div>
                        {/* 
                        <Controller
                            name='heads'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterHeads?.data?.map((data) => ({
                                            label: data.fmH_Id !== undefined ? data.fmH_Id.toString() : '',
                                            value: data.fmH_FeeName !== undefined ? data.fmH_FeeName.toString() : ''
                                        })) ?? []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleHeadSelection(selectedValues);
                                    }}
                                    defaultValue={selectedHeadsItems.map((data) =>
                                        data.fmH_Id !== undefined ? data.fmH_Id.toString() : ''
                                    )}
                                    value={selectedHeadsItems.map((data) => (data.fmH_Id !== undefined ? data.fmH_Id.toString() : ''))}
                                    placeholder='Select Heads'
                                    variant='inverted'
                                    disabled={masterHeadsLoading}
                                />
                            )}
                        /> */}

                        {/* <Controller
                            name='installments'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        masterInstallment?.data?.map((data) => ({
                                            label: data.ftI_ID !== undefined ? data.ftI_ID.toString() : '',
                                            value: data.ftI_NAME !== undefined ? data.ftI_NAME.toString() : ''
                                        })) ?? []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleInstallmentSelection(selectedValues);
                                    }}
                                    defaultValue={SelectedInstallmentsItems.map((data) =>
                                        data.ftI_ID !== undefined ? data.ftI_ID.toString() : ''
                                    )}
                                    value={SelectedInstallmentsItems.map((data) =>
                                        data.ftI_ID !== undefined ? data.ftI_ID.toString() : ''
                                    )}
                                    placeholder='Select Installment'
                                    variant='inverted'
                                    disabled={masterInstallmentLoading}
                                />
                            )}
                        /> */}
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
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
