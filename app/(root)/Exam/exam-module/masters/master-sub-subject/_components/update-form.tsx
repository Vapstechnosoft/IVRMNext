'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { useMasterSubSubject } from '@/hooks/exam/exammodule/usemasters';
import { masterSubSubjectSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubSubject } from '@/server/exam/exam-module/masters/sus-subject';
import type { IMasterSubSubject } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterSubSubjectSchema.addOrUpdate>;

interface UpdateMasterSubSubjectFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterSubSubject;
}

export default function UpdateMasterSubSubjectForm({ onSuccess, className = '', selectedRow: row }: UpdateMasterSubSubjectFormProps) {
    const { refetchAll } = useMasterSubSubject();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubSubjectSchema.addOrUpdate),
        mode: 'onChange'
    });

    useEffect(() => {
        if (row) {
            reset({
                ex_Id: row.ex_Id,
                ex_SubSubjectName: row.ex_SubSubjectName,
                ex_SubSubjectCode: row.ex_SubSubjectCode,
                ex_IsActiveFlag: row.ex_IsActiveFlag
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data) => {
        try {
            const payload = {
                SUBEX_Id: data.ex_Id,
                SUBEX_SubSubjectName: data.ex_SubSubjectName,
                SUBEX_SubSubjectCode: data.ex_SubSubjectCode,
                SUBEX_ActiveFlag: data.ex_IsActiveFlag
            };

            const response = await addOrUpdateMasterSubSubject(payload);

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
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InputText
                            label='Sub Subject Name'
                            required
                            id='ex_SubSubjectName'
                            {...register('ex_SubSubjectName')}
                            defaultValue={row.ex_SubSubjectName}
                            error={errors.ex_SubSubjectName?.message}
                        />
                        <InputText
                            label='Sub Subject Code'
                            required
                            id='ex_SubSubjectCode'
                            {...register('ex_SubSubjectCode')}
                            defaultValue={row.ex_SubSubjectCode}
                            error={errors.ex_SubSubjectCode?.message}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 md:grid-cols-1'>
                        <Label htmlFor='ex_IsActiveFlag'>
                            Active Flag <span className='text-red-500'>*</span>
                        </Label>
                        <input
                            type='checkbox'
                            id='ex_IsActiveFlag'
                            {...register('ex_IsActiveFlag')}
                            defaultChecked={row.ex_IsActiveFlag}
                            className='h-5 w-5'
                        />
                        {errors.ex_IsActiveFlag && <FormError>{errors.ex_IsActiveFlag.message}</FormError>}
                    </div>

                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

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
                            Save Sub Subject
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
