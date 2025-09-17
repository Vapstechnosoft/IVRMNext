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
import { Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassSchema.addOrUpdate>;

interface AddMasterClassFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterClassForm({ onSuccess, className = '' }: AddMasterClassFormProps) {
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
        reset,
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
                reset();
                setSelectedValueItems([]);
                refetchAll();
                refetchValue();
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
        setSelectedValueItems([]);
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Primary Information Section */}
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        {/* Value Selector */}
                        <div className='space-y-2'>
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
                                        <SelectTrigger className='w-full transition-colors focus:ring-2 focus:ring-primary/20'>
                                            <SelectValue placeholder='Select a Value' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {valueLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    <div className='flex items-center'>
                                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                        Loading values...
                                                    </div>
                                                </SelectItem>
                                            ) : valueError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading values
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

                        {/* Name Input */}
                        <div className='space-y-2'>
                            <InputText
                                label='Name'
                                required
                                id='name'
                                {...register('name')}
                                error={errors.name?.message}
                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className='space-y-2'>
                        <InputTextarea
                            label='Description'
                            required
                            id='description'
                            {...register('description')}
                            minHeight={80}
                            error={errors.description?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20 resize-y'
                        />
                    </div>

                    {/* Cost and Multi-values */}
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        {/* Cost Input */}
                        <div className='space-y-2'>
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
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                            {errors.cost && <FormError>Cost is required</FormError>}
                        </div>

                        {/* Multi-values */}
                        <div className='space-y-2'>
                            <Label aria-label='Multi-values' htmlFor='multi_value_ids'>
                                Multi-values <span className='ml-1 text-red-500'>*</span>
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
                                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                                    />
                                )}
                            />
                            {errors.multi_value_ids && <FormError>{errors.multi_value_ids.message}</FormError>}
                        </div>
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
                        className='order-2 sm:order-1 transition-all duration-200 hover:scale-105 w-fit'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 sm:order-2 transition-all duration-200 hover:scale-105 w-fit'>
                        {isSubmitting ? (
                            <div className='flex items-center'>
                                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </div>
                        ) : (
                            <div className='flex items-center'>
                                <Save className='mr-2 h-4 w-4' />
                                Save Master Class
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
