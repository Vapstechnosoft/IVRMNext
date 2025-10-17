'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { masterGradeSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterGrade } from '@/server/exam/exam-module/masters/grade';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// ------------------ SCHEMAS ------------------

type FormFields = z.infer<typeof masterGradeSchema.addOrUpdate>;

// ------------------ COMPONENT ------------------

export default function MasterGradeForm({ onSuccess, className = '' }: { onSuccess?: () => void; className?: string }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterGradeSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            emgR_GradeName: '',
            mI_Id: 30, // default institute id
            emgR_MarksPerFlag: 'm',
            emgR_ActiveFlag: true,
            subject_list: [{ emgR_Id: 0, emgD_Name: '', emgD_From: 0, emgD_To: 0, emgD_GradePoints: 0, emgD_Remarks: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'subject_list'
    });

    const gradeName = watch('emgR_GradeName');

    useEffect(() => {
        setIsDetailsOpen(!!gradeName?.trim());
    }, [gradeName]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                ...data,
                subject_list: data.subject_list.map((row) => ({
                    ...row,
                    emgD_From: Number(row.emgD_From),
                    emgD_To: Number(row.emgD_To),
                    emgD_GradePoints: Number(row.emgD_GradePoints)
                }))
            };

            const response = await addOrUpdateMasterGrade(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                setIsDetailsOpen(false);
                onSuccess?.();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Grade Name + Type */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Grade Name' required {...register('emgR_GradeName')} error={errors.emgR_GradeName?.message} />
                <div>
                    <Label>
                        Marks/Percentage <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='emgR_MarksPerFlag'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='m' id='marks' />
                                    <Label htmlFor='marks'>Marks</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='p' id='percentage' />
                                    <Label htmlFor='percentage'>Percentage</Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    {errors.emgR_MarksPerFlag && <FormError>{errors.emgR_MarksPerFlag.message}</FormError>}
                </div>
            </div>

            {/* Grade Details */}
            {isDetailsOpen && (
                <CollapsibleSection title='Grade Details' defaultOpen>
                    <div className='overflow-x-auto'>
                        <table className='w-full border border-gray-200'>
                            <thead className='bg-gray-100'>
                                <tr>
                                    <th className='border px-2 py-1'>Sl.No</th>
                                    <th className='border px-2 py-1'>Grade Name</th>
                                    <th className='border px-2 py-1'>From</th>
                                    <th className='border px-2 py-1'>To</th>
                                    <th className='border px-2 py-1'>Grade Points</th>
                                    <th className='border px-2 py-1'>Remarks</th>
                                    <th className='border px-2 py-1'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className='border text-center'>{index + 1}</td>
                                        <td className='border'>
                                            <InputText
                                                {...register(`subject_list.${index}.emgD_Name` as const)}
                                                error={errors.subject_list?.[index]?.emgD_Name?.message}
                                            />
                                        </td>
                                        <td className='border'>
                                            <InputText
                                                {...register(`subject_list.${index}.emgD_From` as const, { valueAsNumber: true })}
                                                error={errors.subject_list?.[index]?.emgD_From?.message}
                                            />
                                        </td>
                                        <td className='border'>
                                            <InputText
                                                {...register(`subject_list.${index}.emgD_To` as const, { valueAsNumber: true })}
                                                error={errors.subject_list?.[index]?.emgD_To?.message}
                                            />
                                        </td>
                                        <td className='border'>
                                            <InputText
                                                {...register(`subject_list.${index}.emgD_GradePoints` as const, { valueAsNumber: true })}
                                                error={errors.subject_list?.[index]?.emgD_GradePoints?.message}
                                            />
                                        </td>
                                        <td className='border'>
                                            <InputText
                                                {...register(`subject_list.${index}.emgD_Remarks` as const)}
                                                error={errors.subject_list?.[index]?.emgD_Remarks?.message}
                                            />
                                        </td>
                                        <td className='flex justify-center gap-2 border px-2 py-1'>
                                            <Button
                                                type='button'
                                                size='sm'
                                                onClick={() =>
                                                    append({
                                                        emgR_Id: 0,
                                                        emgD_Name: '',
                                                        emgD_From: 0,
                                                        emgD_To: 0,
                                                        emgD_GradePoints: 0,
                                                        emgD_Remarks: ''
                                                    })
                                                }>
                                                <Plus className='h-3 w-3' />
                                            </Button>
                                            {fields.length > 1 && (
                                                <Button type='button' size='sm' variant='destructive' onClick={() => remove(index)}>
                                                    <Trash className='h-3 w-3' />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className='flex gap-3 border-t pt-4'>
                        <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting}>
                            <Save className='mr-2 h-4 w-4' /> Save
                        </Button>
                    </div>
                </CollapsibleSection>
            )}
        </form>
    );
}
