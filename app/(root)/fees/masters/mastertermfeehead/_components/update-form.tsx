import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MASTER_HEADS_DROPDOWN, MASTER_INSTALLMENT_DROPDOWN, TERM_DROPDOWN_DATA, useMasterTermsHead } from '@/hooks/fees/useMasters';
import { masterTermFeeHeadSchema } from '@/schemas/fees/masters';
import { addOrUpdateFeeTermHead } from '@/server/fees/masters/fee-term-heads';
import type { IMasterTermFeeHeadList } from '@/types/fees/masters/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterTermFeeHeadSchema.addOrUpdate>;

interface UpdateFeeTermHeadFormProps {
    onSuccess?: () => void;
    headdata?: string;
    selectedRow: IMasterTermFeeHeadList; // Selected row for editing
}

export default function UpdateFeeTermHeadForm({ onSuccess, headdata = '', selectedRow: row }: UpdateFeeTermHeadFormProps) {
    const { refetchAll } = useMasterTermsHead();

    const [selectedHeadsItems, setSelectedHeadsItems] = useState<{ fmH_Id: string }[]>([]);
    const [selectedInstallmentsItems, setSelectedInstallmentsItems] = useState<{ ftI_ID: string }[]>([]);

    const { data: terms, isLoading: termsLoading, error: termsError, refetchAll: refetchTerms } = TERM_DROPDOWN_DATA();
    const {
        data: masterInstallment,
        isLoading: masterInstallmentLoading,
        error: masterInstallmentError,
        refetchAll: refetchMasterInstallment
    } = MASTER_INSTALLMENT_DROPDOWN();
    const { data: masterHeads, isLoading: masterHeadsLoading, refetchAll: refetchMasterHeads } = MASTER_HEADS_DROPDOWN();

    const {
        control,
        setValue,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterTermFeeHeadSchema.addOrUpdate),
        mode: 'onChange'
    });

    // Reset form and refetch data
    function OnReset() {
        reset();
        setSelectedHeadsItems([]);
        setSelectedInstallmentsItems([]);
        refetchAll();
        refetchTerms();
        refetchMasterInstallment();
        refetchMasterHeads();
    }

    // Set form data when editing (based on selectedRow)
    useEffect(() => {
        if (row) {
            console.log('Selected Row Data:', row); // For debugging purposes

            // Update form values using row data
            reset({
                fmT_Id: row.fmT_Id, // Term ID
                heads: [row.fmH_Id.toString()], // Heads - bind as array of string
                installments: [row.ftI_Id.toString()] // Installments - bind as array of string
            });

            // Set selected head and installment values
            setSelectedHeadsItems([{ fmH_Id: row.fmH_Id.toString() }]);
            setSelectedInstallmentsItems([{ ftI_ID: row.ftI_Id.toString() }]);
        }
    }, [row, reset]);

    // Submit handler to add/update fee term head
    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { fmT_Id } = data;

            const payload = {
                FMT_Id: fmT_Id,
                mI_Id: 30, // Adjust this value based on your business logic
                feeHeadList: selectedHeadsItems.map((item) => ({
                    fmH_Id: Number(item.fmH_Id)
                })),
                feeInsatallmentList: selectedInstallmentsItems.map((item) => ({
                    fmI_Id: Number(item.ftI_ID)
                }))
            };

            const js = JSON.stringify(payload);
            console.log('Payload JSON:', js);

            const response = await addOrUpdateFeeTermHead(payload);

            if (response.success) {
                toast.success(response.message);
                OnReset();
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    // Handle head selection (for MultiSelect)
    const handleHeadSelection = (selectedValues: string[]) => {
        setSelectedHeadsItems(selectedValues.map((value) => ({ fmH_Id: value.toString() })));
    };

    // Handle installment selection (for MultiSelect)
    const handleInstallmentSelection = (selectedValues: string[]) => {
        setSelectedInstallmentsItems(selectedValues.map((value) => ({ ftI_ID: value.toString() })));
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${headdata}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        {/* Term Selection */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Term' htmlFor='fmT_Id'>
                                Term <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='fmT_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value)); // Update the form value
                                        }}
                                        value={field.value?.toString() || ''} // Bind the value to the form field
                                    >
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
                            {errors.fmT_Id && <FormError>{errors.fmT_Id.message}</FormError>}
                        </div>

                        {/* Heads MultiSelect */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Heads' htmlFor='fmH_Id'>
                                Heads <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='heads'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            masterHeads?.data?.map((data) => ({
                                                label: data.fmH_FeeName || '',
                                                value: data.fmH_Id.toString()
                                            })) ?? []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleHeadSelection(selectedValues);
                                        }}
                                        value={selectedHeadsItems.map((data) => data.fmH_Id.toString())}
                                        placeholder='Select Heads'
                                        variant='inverted'
                                        disabled={masterHeadsLoading}
                                    />
                                )}
                            />
                        </div>

                        {/* Installments MultiSelect */}
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Installments' htmlFor='ftI_Id'>
                                Installments <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='installments'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            masterInstallment?.data?.map((data) => ({
                                                label: data.ftI_NAME || '',
                                                value: data.ftI_ID.toString()
                                            })) ?? []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleInstallmentSelection(selectedValues);
                                        }}
                                        value={selectedInstallmentsItems.map((data) => data.ftI_ID.toString())}
                                        placeholder='Select Installments'
                                        variant='inverted'
                                        disabled={masterInstallmentLoading}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
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
                                Update
                            </div>
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
