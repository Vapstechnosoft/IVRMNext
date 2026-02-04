'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterMessCategory } from '@/hooks/hostel/useMasterMessCategory';
import { masterMessCategoryMappingSchema } from '@/schemas/hostel/mess-category-mapping.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { IMess, IMessCategory } from '@/types/hostel/hostel-management/masters';
import { saveMessCategoryMapping } from '@/server/hostel/hostel-management/masters/mess-category';

interface AddMasterMessCategoryFormProps {
    onSuccess: () => void;
    masterMessList: IMess[];
    messCategoryList: IMessCategory[];
}

type FormFields = z.infer<typeof masterMessCategoryMappingSchema>;

export default function AddMasterMessCategoryForm({ onSuccess, masterMessList, messCategoryList }: AddMasterMessCategoryFormProps) {
    const { refetchAll } = useMasterMessCategory();

    const methods = useForm<FormFields>({
        resolver: zodResolver(masterMessCategoryMappingSchema),
        defaultValues: {
            hlmM_Id: '',
            messCategories: [],
            hlmmmC_ActiveFlag: true
        },
        mode: 'onChange'
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = methods;

    const selectedCategories = watch('messCategories');
    const [selectAll, setSelectAll] = useState(false);

    // Handle Select All
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            setValue('messCategories', messCategoryList.map(c => c.hlmmC_Id));
        } else {
            setValue('messCategories', []);
        }
    };

    // Update Select All state when individual items change
    useEffect(() => {
        if (selectedCategories.length === messCategoryList.length && messCategoryList.length > 0) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedCategories, messCategoryList]);

    const onSubmit = async (data: FormFields) => {
        try {
            const formData = {
                hlmM_Id: data.hlmM_Id,
                messCategories: data.messCategories
            };

            const result = await saveMessCategoryMapping(formData);

            if (result.success) {
                toast.success(result.message);
                refetchAll();
                onSuccess();
                reset();
            } else {
                toast.error(result.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save mapping');
        }
    };

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md' noValidate>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Mess Selection */}
                        <div className='col-span-1'>
                            <Controller
                                control={control}
                                name='hlmM_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Mess Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Mess' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterMessList.map((mess) => (
                                                    <SelectItem key={mess.hlmM_Id} value={mess.hlmM_Id.toString()}>
                                                        {mess.hlmM_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Category Selection (Checkboxes) */}
                        <div className='col-span-1 space-y-2 rounded-md border p-4'>
                            <div className='flex items-center justify-between pb-2 border-b'>
                                <Label className='text-base font-semibold'>
                                    Mess Category <span className='text-red-500'>*</span>
                                </Label>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='select-all'
                                        checked={selectAll}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <Label htmlFor='select-all'>Select All</Label>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2'>
                                {messCategoryList.map((category) => (
                                    <div key={category.hlmmC_Id} className='flex items-center space-x-2'>
                                        <Controller
                                            control={control}
                                            name='messCategories'
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value?.includes(category.hlmmC_Id)}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        const updated = checked
                                                            ? [...current, category.hlmmC_Id]
                                                            : current.filter((id) => id !== category.hlmmC_Id);
                                                        field.onChange(updated);
                                                    }}
                                                />
                                            )}
                                        />
                                        <Label
                                            className='font-normal cursor-pointer'
                                            onClick={() => {
                                                const current = methods.getValues('messCategories') || [];
                                                const isChecked = current.includes(category.hlmmC_Id);
                                                const updated = !isChecked
                                                    ? [...current, category.hlmmC_Id]
                                                    : current.filter((id) => id !== category.hlmmC_Id);
                                                methods.setValue('messCategories', updated);
                                            }}
                                        >
                                            {category.hlmmC_Name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {errors.messCategories && <FormError>{errors.messCategories.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-center gap-2'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Mapping'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => {
                                reset();
                                onSuccess();
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
