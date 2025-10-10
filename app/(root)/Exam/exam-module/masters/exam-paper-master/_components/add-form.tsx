'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterExamPaper } from '@/hooks/exam/exammodule/usemasters';
import { masterExamPaperSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterExamPaper } from '@/server/exam/exam-module/masters/exam-paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterExamPaperSchema.addOrUpdate>;

interface AddMasterExamPaperFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterExamPaperForm({ onSuccess, className = '' }: AddMasterExamPaperFormProps) {
    const { refetchAll } = useMasterExamPaper();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterExamPaperSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ex_ExamPaperType: '',
            ex_DisplayColor: '',
            ex_PaperTypeDescription: '',
            ex_IsActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterExamPaper(data);

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

    const handleReset = () => reset();

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Basic Fields */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InputText
                        label='Exam Paper Type'
                        required
                        id='ex_ExamPaperType'
                        {...register('ex_ExamPaperType')}
                        error={errors.ex_ExamPaperType?.message}
                    />
                    <InputText
                        label='Display Color'
                        required
                        id='ex_DisplayColor'
                        {...register('ex_DisplayColor')}
                        error={errors.ex_DisplayColor?.message}
                    />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <InputText
                        label='Paper Type Description'
                        required
                        id='ex_PaperTypeDescription'
                        {...register('ex_PaperTypeDescription')}
                        error={errors.ex_PaperTypeDescription?.message}
                    />
                </div>

                {/* IsActive Flag */}
                <div className='grid grid-cols-1 md:grid-cols-2'>
                    <div className='flex flex-col gap-2'>
                        <Label htmlFor='ex_IsActiveFlag'>
                            Active Status <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='ex_IsActiveFlag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value ? 'true' : 'false'}
                                    onValueChange={(value) => field.onChange(value === 'true')}
                                    className='flex gap-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='true' id='active-yes' />
                                        <Label htmlFor='active-yes'>Active</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='false' id='active-no' />
                                        <Label htmlFor='active-no'>Inactive</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                        {errors.ex_IsActiveFlag && <FormError>{errors.ex_IsActiveFlag.message}</FormError>}
                    </div>
                </div>

                {/* Root Error */}
                {errors.root && <FormError>{errors.root.message}</FormError>}

                {/* Buttons */}
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
                            Save Exam Paper
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
