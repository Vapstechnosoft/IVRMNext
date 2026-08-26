'use client';

import { Button } from '@/components/ui/button';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { useMasterQuestion, useSaveMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import { masterQuestionSchema } from '@/schemas/exam/online-exam/masters';
import type { IComplexityDropdown, ISubjectDropdown } from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterQuestionSchema>;

interface AddMasterQuestionFormProps {
    subjects?: ISubjectDropdown[];
    complexities?: IComplexityDropdown[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function AddMasterQuestionForm({ subjects = [], complexities = [], onSuccess, onCancel }: AddMasterQuestionFormProps) {
    const { refetchAll } = useMasterQuestion(undefined, { enabled: false });
    const saveMutation = useSaveMasterQuestion();
    const [fileList, setFileList] = useState<{ fileName: string; filePath: string; fileType: string }[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterQuestionSchema),
        defaultValues: {
            lmsmoeQ_Marks: 1,
            options: []
        },
        mode: 'onChange'
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'options'
    });

    const addOptionRow = () => {
        append({
            lmsmoeqoA_Option: '',
            lmsmoeqoA_AnswerFlag: false,
            lmsmoeqoA_Marks: 1
        });
    };

    const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileList((prev) => [
                ...prev,
                {
                    fileName: file.name,
                    filePath: `/uploads/exam/${file.name}`,
                    fileType: file.name.split('.').pop() || 'doc'
                }
            ]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFileList((prev) => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                MI_Id: 30,
                ISMS_Id: Number(data.ismS_Id),
                LPMOEQ_Question: data.lmsmoeQ_Question.trim(),
                LPMOEQ_QuestionDesc: data.lmsmoeQ_QuestionDesc?.trim() || '',
                LPMOEQ_Marks: Number(data.lmsmoeQ_Marks),
                LPMCOMP_Id: data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : 1,
                questionFiles: fileList,
                questionOptions: data.options?.map((opt, idx) => ({
                    LPMOEQOA_Option: opt.lmsmoeqoA_Option.trim(),
                    LPMOEQOA_AnswerFlag: opt.lmsmoeqoA_AnswerFlag,
                    LPMOEQOA_Marks: Number(opt.lmsmoeqoA_Marks || 1),
                    LPMOEQOA_Order: idx + 1
                }))
            };

            const response = await saveMutation.mutateAsync(payload);

            if (response?.success !== false && !response?.error) {
                toast.success('Question added successfully!');
                reset();
                setFileList([]);
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || response?.error || 'Failed to save question');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while saving the question');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-lg border bg-card p-6 shadow-sm'>
            <div className='border-b pb-3'>
                <h2 className='font-semibold text-foreground text-lg'>Add Master Question</h2>
                <p className='text-muted-foreground text-xs'>Enter question details, marks, complexity, and options</p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Subject Selection */}
                <div className='space-y-2'>
                    <Label htmlFor='ismS_Id' className='font-medium text-sm'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'>
                        <option value=''>-- Select Subject --</option>
                        {(Array.isArray(subjects) ? subjects : (subjects as any)?.$values || [])?.map((sub: any) => {
                            const id = sub.ismS_Id ?? sub.isms_Id ?? sub.ISMS_Id ?? sub.id;
                            const name =
                                sub.ismS_SubjectName ?? sub.isms_SubjectName ?? sub.ISMS_SubjectName ?? sub.subjectName ?? sub.name;
                            return (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            );
                        })}
                    </select>
                    {errors.ismS_Id && <p className='text-destructive text-xs'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Marks & Complexity */}
                <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='lmsmoeQ_Marks' className='font-medium text-sm'>
                            Marks <span className='text-destructive'>*</span>
                        </Label>
                        <input
                            type='number'
                            id='lmsmoeQ_Marks'
                            {...register('lmsmoeQ_Marks', { valueAsNumber: true })}
                            placeholder='1'
                            min={1}
                            max={100}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        />
                        {errors.lmsmoeQ_Marks && <p className='text-destructive text-xs'>{errors.lmsmoeQ_Marks.message}</p>}
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='lmsmoecX_Id' className='font-medium text-sm'>
                            Complexity Level
                        </Label>
                        <select
                            id='lmsmoecX_Id'
                            {...register('lmsmoecX_Id', { valueAsNumber: true })}
                            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                            <option value=''>Standard</option>
                            {(Array.isArray(complexities) ? complexities : (complexities as any)?.$values || [])?.map((comp: any) => {
                                const id = comp.lmsmoecX_Id ?? comp.lpmcomP_Id ?? comp.lpmcomp_Id ?? comp.LPMCOMP_Id ?? comp.id;
                                const name =
                                    comp.lmsmoecX_ComplexityName ??
                                    comp.lpmcomP_ComplexityName ??
                                    comp.lpmcomp_ComplexityName ??
                                    comp.LPMCOMP_ComplexityName ??
                                    comp.name;
                                return (
                                    <option key={id} value={id}>
                                        {name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Question Text */}
                <div className='col-span-1 space-y-2 md:col-span-2'>
                    <Label htmlFor='lmsmoeQ_Question' className='font-medium text-sm'>
                        Question <span className='text-destructive'>*</span>
                    </Label>
                    <InputTextarea
                        id='lmsmoeQ_Question'
                        {...register('lmsmoeQ_Question')}
                        placeholder='Type your question statement here...'
                        rows={3}
                    />
                    {errors.lmsmoeQ_Question && <p className='text-destructive text-xs'>{errors.lmsmoeQ_Question.message}</p>}
                </div>

                {/* Question Description */}
                <div className='col-span-1 space-y-2 md:col-span-2'>
                    <Label htmlFor='lmsmoeQ_QuestionDesc' className='font-medium text-sm'>
                        Question Description / Hints
                    </Label>
                    <InputTextarea
                        id='lmsmoeQ_QuestionDesc'
                        {...register('lmsmoeQ_QuestionDesc')}
                        placeholder='Additional hints or explanation (optional)...'
                        rows={2}
                    />
                </div>
            </div>

            {/* File Attachments */}
            <div className='rounded-md border bg-muted/20 p-4'>
                <div className='mb-3 flex items-center justify-between'>
                    <Label className='font-semibold text-sm'>Question Attachments (Image/Audio/Video/PDF)</Label>
                    <label className='cursor-pointer rounded-md bg-primary/10 px-3 py-1.5 font-medium text-primary text-xs hover:underline'>
                        + Upload File
                        <input type='file' className='hidden' onChange={handleAddFile} />
                    </label>
                </div>
                {fileList.length > 0 ? (
                    <div className='space-y-2'>
                        {fileList.map((file, idx) => (
                            <div
                                key={file.fileName + idx}
                                className='flex items-center justify-between rounded border bg-background p-2 text-xs'>
                                <span className='max-w-sm truncate font-medium'>{file.fileName}</span>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleRemoveFile(idx)}
                                    className='h-6 w-6 p-0 text-destructive'>
                                    <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-muted-foreground text-xs italic'>No files uploaded yet.</p>
                )}
            </div>

            {/* Quick Question Options */}
            <div className='space-y-3 rounded-md border bg-muted/20 p-4'>
                <div className='flex items-center justify-between'>
                    <Label className='font-semibold text-sm'>Multiple Choice Options (Optional during question creation)</Label>
                    <Button type='button' size='sm' variant='outline' onClick={addOptionRow} className='h-8 gap-1 text-xs'>
                        <Plus className='h-3.5 w-3.5' /> Add Option
                    </Button>
                </div>
                {fields.map((field, idx) => (
                    <div key={field.id} className='flex items-center gap-3 rounded-md border bg-background p-2'>
                        <span className='w-6 text-center font-bold text-muted-foreground text-xs'>{String.fromCharCode(65 + idx)}.</span>
                        <InputText
                            {...register(`options.${idx}.lmsmoeqoA_Option` as const)}
                            placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                            className='h-9 flex-1'
                        />
                        <label className='flex cursor-pointer items-center gap-1.5 font-medium text-emerald-600 text-xs dark:text-emerald-400'>
                            <input
                                type='checkbox'
                                {...register(`options.${idx}.lmsmoeqoA_AnswerFlag` as const)}
                                className='h-4 w-4 rounded border-gray-300'
                            />
                            Correct
                        </label>
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => remove(idx)}
                            className='h-7 w-7 p-0 text-destructive'>
                            <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className='flex items-center justify-end gap-3 border-t pt-4'>
                <Button type='button' variant='outline' onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} className='min-w-28'>
                    {isSubmitting ? 'Saving...' : 'Save Question'}
                </Button>
            </div>
        </form>
    );
}
