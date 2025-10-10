'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMasterExam } from '@/hooks/exam/exammodule/usemasters';
import { masterExamSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubject } from '@/server/exam/exam-module/masters/subject';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterExamSchema.addOrUpdate>;

interface AddMasterExamFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddMasterExamForm({ onSuccess, className = '' }: AddMasterExamFormProps) {
    const { refetchAll } = useMasterExam();

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterExamSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ex_FinalExamFlag: 0,
            ex_SubjectWiseMarksPublishFlag: 0
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const response = await addOrUpdateMasterSubject(data);

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
                    {/* Row 1 - Basic Info */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Exam Name'
                            required
                            id='ex_ExamName'
                            {...register('ex_ExamName')}
                            error={errors.ex_ExamName?.message}
                        />
                        <InputText
                            label='IVRS Exam Name'
                            required
                            id='ex_IVRSExamName'
                            {...register('ex_IVRSExamName')}
                            error={errors.ex_IVRSExamName?.message}
                        />
                        <InputText
                            label='Exam Description'
                            required
                            id='ex_ExamDescription'
                            {...register('ex_ExamDescription')}
                            error={errors.ex_ExamDescription?.message}
                        />
                        <InputText
                            label='Exam Code'
                            required
                            id='ex_ExamCode'
                            {...register('ex_ExamCode')}
                            error={errors.ex_ExamCode?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {[
                            { name: 'ex_FinalExamFlag', label: 'Final Exam' },
                            { name: 'ex_SubjectWiseMarksPublishFlag', label: 'Subject Wise Marks Publish' }
                        ].map((fieldDef) => (
                            <div key={fieldDef.name} className='group flex flex-col gap-1.5'>
                                <Label htmlFor={fieldDef.name}>
                                    {fieldDef.label} <span className='ml-1 text-red-500'>*</span>
                                </Label>

                                <Controller
                                    name={fieldDef.name as keyof FormFields}
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={String(field.value ?? 0)}
                                            onValueChange={(value) => field.onChange(Number(value))}
                                            className='flex gap-4'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id={`${fieldDef.name}-yes`} />
                                                <Label htmlFor={`${fieldDef.name}-yes`}>Yes</Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='0' id={`${fieldDef.name}-no`} />
                                                <Label htmlFor={`${fieldDef.name}-no`}>No</Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {errors[fieldDef.name as keyof FormFields] && (
                                    <FormError>{String(errors[fieldDef.name as keyof FormFields]?.message)}</FormError>
                                )}
                            </div>
                        ))}
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
                            Save Subject
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
