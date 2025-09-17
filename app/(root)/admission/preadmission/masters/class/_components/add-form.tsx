'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterClass, useTestDropdown } from '@/hooks/admission/preadmission/useMasters';
import { masterClassSchema } from '@/schemas/admission/preadmission/masters';
import { addMasterClass } from '@/server/admission/preadmission/masters/class';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

export default function AddMasterClassForm() {
    const [selectedValueItems, setSelectedValueItems] = useState<{ id: string; name: string }[]>([]);

    const { data: value, isLoading: valueLoading, error: valueError, refetchAll: refetchValue } = useTestDropdown(0, 0);

    const { refetchAll } = useMasterClass();

    const handleValueSelection = (selectedValues: string[]) => {
        const selectedResValues = selectedValues.map((value) => {
            return { id: value.toString(), name: '' };
        });

        setSelectedValueItems(selectedResValues);
    };

    const {
        control,
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { name, description, cost, value_id } = data;
            const payload = {
                id: 0,
                name: name,
                description: description,
                cost: cost === undefined ? 0 : Number(cost),
                value_id: Number(value_id),
                material_value_mapping: selectedValueItems.map((value) => ({
                    id: 0,
                    value_id: Number(value.id)
                }))
            };

            const response = await addMasterClass(payload);

            if (response.success) {
                toast.success(response.message);
                refetchAll();
                refetchValue();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-5'>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Value' htmlFor='value_id'>
                                Value <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='value_id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a Value' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valueLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading value...
                                                </SelectItem>
                                            ) : valueError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading value
                                                </SelectItem>
                                            ) : (
                                                value?.data?.map((item) => (
                                                    <SelectItem key={item.id} value={item.id.toString()}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.value_id && <FormError>{errors.value_id.message}</FormError>}
                        </div>
                    </div>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <InputText label='Name' required id='name' {...register('name')} error={errors.name?.message} />
                    </div>
                    <div>
                        <InputTextarea
                            label='Description'
                            required
                            id='description'
                            {...register('description')}
                            minHeight={50}
                            error={errors.description?.message}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                        <div className='group flex flex-col gap-1.5'>
                            <Controller
                                name='cost'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Cost'
                                        required
                                        id='cost'
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(value)}
                                    />
                                )}
                            />
                            {errors.cost && <FormError>Cost Required</FormError>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Multivalues' htmlFor='multi_value_ids'>
                                Multivalues <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='multi_value_ids'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            value?.data?.map((data) => ({
                                                label: data.name,
                                                value: data.id.toString()
                                            })) || []
                                        }
                                        onValueChange={(selectedValues) => {
                                            field.onChange(selectedValues);
                                            handleValueSelection(selectedValues);
                                        }}
                                        defaultValue={selectedValueItems.map((data) => data.id)}
                                        value={selectedValueItems.map((data) => data.id)}
                                        placeholder='Select Values'
                                        variant='inverted'
                                        disabled={valueLoading}
                                    />
                                )}
                            />

                            {errors.multi_value_ids && <FormError>{errors.multi_value_ids.message}</FormError>}
                        </div>
                    </div>

                    <FormError>{errors.root?.message}</FormError>
                </div>
                <div>
                    <Button type='submit' isLoading={isSubmitting}>
                        Save
                    </Button>
                </div>
            </form>
        </div>
    );
}
