'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterCategory } from '@/hooks/admission/preadmission/useMasters';
import { masterCategorySchema } from '@/schemas/admission/preadmission/masters';
import { addOrUpdateMasterCategory } from '@/server/admission/preadmission/masters/category';
import type { IMasterCategoryList } from '@/types/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterCategorySchema.addOrUpdate>;

interface UpdateMasterCategoryFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterCategoryList;
}

export default function UpdateMasterCategoryForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterCategoryFormProps) {
    const { refetchAll } = useMasterCategory();

    const {
        control,
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterCategorySchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                amC_Id: row.amC_Id,
                amC_Name: row.amC_Name,
                amC_Address: row.amC_Address,
                amC_Type: row.amC_Type
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const { amC_Id, amC_Name, amC_Address, amC_Type } = data;
            const payload = {
                MI_Id: 30,
                AMC_Id: amC_Id,
                AMC_Name: amC_Name,
                AMC_Address: amC_Address,
                AMC_Type: amC_Type,
                AMC_RegNoPrefix: '',
                AMC_Logo: '',
                AMC_FilePath: '',
                AMC_ActiveFlag: 1
            };

            const response = await addOrUpdateMasterCategory(payload);

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
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Category Name'
                            required
                            id='amC_Name'
                            {...register('amC_Name')}
                            defaultValue={row.amC_Name}
                            error={errors.amC_Name?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputTextarea
                            label='Category Address'
                            required
                            id='amC_Address'
                            {...register('amC_Address')}
                            defaultValue={row.amC_Address}
                            error={errors.amC_Address?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                            minHeight={20}
                        />
                        <div className='group flex flex-col gap-1.5'>
                            <Label aria-label='Category Type' htmlFor='amC_Type'>
                                Category Type <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='amC_Type'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(Number(value));
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder='Select a Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem key={'School'} value={'School'}>
                                                School
                                            </SelectItem>
                                            <SelectItem key={'College'} value={'College'}>
                                                College
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.amC_Type && <FormError>{errors.amC_Type.message}</FormError>}
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
                            Save Master Class
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
