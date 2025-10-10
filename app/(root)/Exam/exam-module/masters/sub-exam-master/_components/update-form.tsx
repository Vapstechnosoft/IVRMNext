'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterSubExam } from '@/hooks/exam/exammodule/usemasters';
import { masterSubExamSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubExam } from '@/server/exam/exam-module/masters/sub-exam';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubExamSchema.addOrUpdate>;

interface UpdateMasterSubExamFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterSubExam;
}

export default function UpdateMasterSubExamForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterSubExamFormProps) {
    const { refetchAll } = useMasterSubExam();

    const {
        setValue,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubExamSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                ex_Id: row.ex_Id,
                ex_SubExamName: row.ex_SubExamName,
                ex_SubExamCode: row.ex_SubExamCode,
                ex_IsActiveFlag: row.ex_IsActiveFlag
            });
        }
    }, [row, reset, setValue]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                EX_Id: data.ex_Id,
                EX_SubExamName: data.ex_SubExamName,
                EX_SubExamCode: data.ex_SubExamCode,
                EX_ActiveFlag: data.ex_IsActiveFlag
            };

            const response = await addOrUpdateMasterSubExam(payload);

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
                    {/* Basic Fields */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Sub Exam Name'
                            required
                            id='ex_SubExamName'
                            {...register('ex_SubExamName')}
                            defaultValue={row.ex_SubExamName}
                            error={errors.ex_SubExamName?.message}
                        />
                        <InputText
                            label='Sub Exam Code'
                            required
                            id='ex_SubExamCode'
                            {...register('ex_SubExamCode')}
                            defaultValue={row.ex_SubExamCode}
                            error={errors.ex_SubExamCode?.message}
                        />
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting} className='order-2 w-fit'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        isLoading={isSubmitting}
                        loadingText='Saving...'
                        className='order-1 w-fit'>
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
