'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { autoMappingSchema } from '@/schemas/super-admin/super-admin-module/institution/auto-mapping';
import { saveAutoMapping } from '@/server/super-admin/super-admin-module/institution/auto-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { type SubmitHandler, useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// Temporary Mock Data for Institutions
const institutionOptions = [
    { label: 'Vaps Institution', value: '1' },
    { label: 'St. Thomas School', value: '2' },
    { label: 'Greenwood High', value: '3' }
];

type FormFields = z.infer<typeof autoMappingSchema.addOrUpdate>;

interface AddAutoMappingFormProps {
    onSuccess?: () => void;
}

export default function AddAutoMappingForm({ onSuccess }: AddAutoMappingFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(autoMappingSchema.addOrUpdate),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            console.log('Form Data:', data);
            const response = await saveAutoMapping(data);

            if (response.success) {
                toast.success(response.message || 'Auto Mapping saved successfully');
                reset();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save Auto Mapping');
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        }
    };

    const handleReset = () => reset();

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 pt-4'>
            <div className='mx-auto max-w-2xl space-y-4'>
                <div className='flex flex-col space-y-2'>
                    <Label htmlFor='Pervious_MI_Id'>Reference Institute Name <span className='text-red-500'>*</span></Label>
                    <Controller
                        name='Pervious_MI_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Reference Institute" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutionOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.Pervious_MI_Id && <FormError>{errors.Pervious_MI_Id.message}</FormError>}
                </div>

                <div className='flex flex-col space-y-2'>
                    <Label htmlFor='Current_MI_Id'>Current Institute Name <span className='text-red-500'>*</span></Label>
                    <Controller
                        name='Current_MI_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Current Institute" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutionOptions.map((option) => (
                                        // Filter out selected Reference Institute to avoid mapping to self? (Optional dependent logic)
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.Current_MI_Id && <FormError>{errors.Current_MI_Id.message}</FormError>}
                </div>

                <InputText
                    label='User Name'
                    required
                    {...register('User_Name')}
                    error={errors.User_Name?.message}
                    placeholder='Enter User Name'
                    description='Allowed characters: Digits, a-z, A-Z, @, &'
                />

                <div className='flex justify-center gap-3 pt-4'>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='w-fit transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                </div>
            </div>
        </form>
    );
}
