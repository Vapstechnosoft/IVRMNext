'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterExam } from '@/hooks/exam/exammodule/usemasters';
import { masterSubExamSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubExam } from '@/server/exam/exam-module/masters/sub-exam';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubExamSchema.addOrUpdate>;

interface AddMasterSubExamFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterSubExamForm({ onSuccess, className = '' }: AddMasterSubExamFormProps) {
    const { refetchAll } = useMasterExam();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubExamSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ex_SubExamName: '',
            ex_SubExamCode: '',
            ex_IsActiveFlag: true
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterSubExam(data);

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
                        label='Sub Exam Name'
                        required
                        id='ex_SubExamName'
                        {...register('ex_SubExamName')}
                        error={errors.ex_SubExamName?.message}
                    />
                    <InputText
                        label='Sub Exam Code'
                        required
                        id='ex_SubExamCode'
                        {...register('ex_SubExamCode')}
                        error={errors.ex_SubExamCode?.message}
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
                            Save Sub Exam
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
