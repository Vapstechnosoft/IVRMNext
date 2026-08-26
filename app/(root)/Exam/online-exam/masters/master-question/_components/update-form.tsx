'use client';

import { Button } from '@/components/ui/button';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { useMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import { masterQuestionSchema } from '@/schemas/exam/online-exam/masters';
import { saveMasterQuestion } from '@/server/exam/online-exam/masters/master-question';
import type { IComplexityDropdown, IMasterQuestionList, ISubjectDropdown } from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterQuestionSchema>;

interface UpdateMasterQuestionFormProps {
    rowData: IMasterQuestionList;
    subjects?: ISubjectDropdown[];
    complexities?: IComplexityDropdown[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UpdateMasterQuestionForm({
    rowData,
    subjects = [],
    complexities = [],
    onSuccess,
    onCancel
}: UpdateMasterQuestionFormProps) {
    const { refetchAll } = useMasterQuestion();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterQuestionSchema),
        defaultValues: {
            lmsmoeQ_Id: rowData.lmsmoeQ_Id,
            ismS_Id: rowData.ismS_Id,
            lmsmoeQ_Question: rowData.lmsmoeQ_Question,
            lmsmoeQ_QuestionDesc: rowData.lmsmoeQ_QuestionDesc || '',
            lmsmoeQ_Marks: rowData.lmsmoeQ_Marks,
            lmsmoecX_Id: rowData.lmsmoecX_Id || undefined
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (rowData) {
            reset({
                lmsmoeQ_Id: rowData.lmsmoeQ_Id,
                ismS_Id: rowData.ismS_Id,
                lmsmoeQ_Question: rowData.lmsmoeQ_Question,
                lmsmoeQ_QuestionDesc: rowData.lmsmoeQ_QuestionDesc || '',
                lmsmoeQ_Marks: rowData.lmsmoeQ_Marks,
                lmsmoecX_Id: rowData.lmsmoecX_Id || undefined
            });
        }
    }, [rowData, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                LMSMOEQ_Id: rowData.lmsmoeQ_Id,
                ISMS_Id: Number(data.ismS_Id),
                LMSMOEQ_Question: data.lmsmoeQ_Question.trim(),
                LMSMOEQ_QuestionDesc: data.lmsmoeQ_QuestionDesc?.trim() || '',
                LMSMOEQ_Marks: Number(data.lmsmoeQ_Marks),
                LMSMOECX_Id: data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : null
            };

            const response = await saveMasterQuestion(payload);

            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success('Question updated successfully!');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update question');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while updating the question');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-lg border bg-card p-6 shadow-sm'>
            <div className='border-b pb-3'>
                <h2 className='font-semibold text-foreground text-lg'>Update Master Question</h2>
                <p className='text-muted-foreground text-xs'>Modify question statement, marks, or complexity level</p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Subject Selection */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_ismS_Id' className='font-medium text-sm'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='edit_ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Subject --</option>
                        {subjects?.map((sub) => (
                            <option key={sub.ismS_Id || (sub as any).isms_Id || (sub as any).ISMS_Id} value={sub.ismS_Id || (sub as any).isms_Id || (sub as any).ISMS_Id}>
                                {sub.ismS_SubjectName || (sub as any).isms_SubjectName || (sub as any).ISMS_SubjectName}
                            </option>
                        ))}
                    </select>
                    {errors.ismS_Id && <p className='text-destructive text-xs'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Marks & Complexity */}
                <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='edit_lmsmoeQ_Marks' className='font-medium text-sm'>
                            Marks <span className='text-destructive'>*</span>
                        </Label>
                        <input
                            type='number'
                            id='edit_lmsmoeQ_Marks'
                            {...register('lmsmoeQ_Marks', { valueAsNumber: true })}
                            placeholder='1'
                            min={1}
                            max={100}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        />
                        {errors.lmsmoeQ_Marks && <p className='text-destructive text-xs'>{errors.lmsmoeQ_Marks.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='edit_lmsmoecX_Id' className='font-medium text-sm'>
                            Complexity Level
                        </Label>
                        <select
                            id='edit_lmsmoecX_Id'
                            {...register('lmsmoecX_Id', { valueAsNumber: true })}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                            <option value=''>Standard</option>
                            {(Array.isArray(complexities) ? complexities : (complexities as any)?.$values || [])?.map((comp: any) => (
                                <option key={comp.lmsmoecX_Id} value={comp.lmsmoecX_Id}>
                                    {comp.lmsmoecX_ComplexityName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Question Text */}
                <div className='col-span-1 space-y-2 md:col-span-2'>
                    <Label htmlFor='edit_lmsmoeQ_Question' className='font-medium text-sm'>
                        Question <span className='text-destructive'>*</span>
                    </Label>
                    <InputTextarea
                        id='edit_lmsmoeQ_Question'
                        {...register('lmsmoeQ_Question')}
                        placeholder='Type your question statement here...'
                        rows={3}
                    />
                    {errors.lmsmoeQ_Question && <p className='text-destructive text-xs'>{errors.lmsmoeQ_Question.message}</p>}
                </div>

                {/* Question Description */}
                <div className='col-span-1 space-y-2 md:col-span-2'>
                    <Label htmlFor='edit_lmsmoeQ_QuestionDesc' className='font-medium text-sm'>
                        Question Description / Hints
                    </Label>
                    <InputTextarea
                        id='edit_lmsmoeQ_QuestionDesc'
                        {...register('lmsmoeQ_QuestionDesc')}
                        placeholder='Additional hints or explanation (optional)...'
                        rows={2}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3 border-t pt-4'>
                <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} className='min-w-28'>
                    {isSubmitting ? 'Updating...' : 'Update Question'}
                </Button>
            </div>
        </form>
    );
}
