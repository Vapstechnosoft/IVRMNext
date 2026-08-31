'use client';

import { Button } from '@/components/ui/button';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { useMasterQuestionCollege } from '@/hooks/exam/online-exam/useMasters';
import { masterQuestionCollegeSchema } from '@/schemas/exam/online-exam/masters';
import { saveMasterQuestionCollege } from '@/server/exam/online-exam/masters/master-question-college';
import type {
    IBranchDropdown,
    IComplexityDropdown,
    ICourseDropdown,
    IMasterQuestionCollegeList,
    ISemesterDropdown,
    ISubjectDropdown
} from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterQuestionCollegeSchema>;

interface UpdateMasterQuestionCollegeFormProps {
    rowData: IMasterQuestionCollegeList;
    courses?: ICourseDropdown[];
    branches?: IBranchDropdown[];
    semesters?: ISemesterDropdown[];
    subjects?: ISubjectDropdown[];
    complexities?: IComplexityDropdown[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UpdateMasterQuestionCollegeForm({
    rowData,
    courses = [],
    branches = [],
    semesters = [],
    subjects = [],
    complexities = [],
    onSuccess,
    onCancel
}: UpdateMasterQuestionCollegeFormProps) {
    const { refetchAll } = useMasterQuestionCollege();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterQuestionCollegeSchema),
        defaultValues: {
            lmsmcQ_Id: rowData.lmsmcQ_Id,
            amcO_Id: rowData.amcO_Id,
            amB_Id: rowData.amB_Id,
            amsE_Id: rowData.amsE_Id,
            ismS_Id: rowData.ismS_Id,
            lmsmcQ_Question: rowData.lmsmcQ_Question,
            lmsmcQ_QuestionDesc: rowData.lmsmcQ_QuestionDesc || '',
            lmsmcQ_Marks: rowData.lmsmcQ_Marks,
            lmsmoecX_Id: rowData.lmsmoecX_Id || undefined
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (rowData) {
            reset({
                lmsmcQ_Id: rowData.lmsmcQ_Id,
                amcO_Id: rowData.amcO_Id,
                amB_Id: rowData.amB_Id,
                amsE_Id: rowData.amsE_Id,
                ismS_Id: rowData.ismS_Id,
                lmsmcQ_Question: rowData.lmsmcQ_Question,
                lmsmcQ_QuestionDesc: rowData.lmsmcQ_QuestionDesc || '',
                lmsmcQ_Marks: rowData.lmsmcQ_Marks,
                lmsmoecX_Id: rowData.lmsmoecX_Id || undefined
            });
        }
    }, [rowData, reset]);

    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                LMSMCQ_Id: rowData.lmsmcQ_Id,
                AMCO_Id: Number(data.amcO_Id),
                AMB_Id: Number(data.amB_Id),
                AMSE_Id: Number(data.amsE_Id),
                ISMS_Id: Number(data.ismS_Id),
                LMSMCQ_Question: data.lmsmcQ_Question.trim(),
                LMSMCQ_QuestionDesc: data.lmsmcQ_QuestionDesc?.trim() || '',
                LMSMCQ_Marks: Number(data.lmsmcQ_Marks),
                LMSMOECX_Id: data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : null
            };

            const response = await saveMasterQuestionCollege(payload);

            if (response?.success || response?.returnval === true || !response?.error) {
                toast.success('College Question updated successfully!');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update college question');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while updating the question');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 rounded-lg border bg-card p-6 shadow-sm'>
            <div className='border-b pb-3'>
                <h2 className='font-semibold text-foreground text-lg'>Update College Master Question</h2>
                <p className='text-muted-foreground text-xs'>Modify Course, Branch, Semester, and Question details</p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Course */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_amcO_Id' className='font-medium text-sm'>
                        Course <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='edit_amcO_Id'
                        {...register('amcO_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Course --</option>
                        {courses.map((course) => (
                            <option key={course.amcO_Id} value={course.amcO_Id}>
                                {course.amcO_CourseName}
                            </option>
                        ))}
                    </select>
                    {errors.amcO_Id && <p className='text-destructive text-xs'>{errors.amcO_Id.message}</p>}
                </div>

                {/* Branch */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_amB_Id' className='font-medium text-sm'>
                        Branch <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='edit_amB_Id'
                        {...register('amB_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Branch --</option>
                        {branches.map((branch) => (
                            <option key={branch.amB_Id} value={branch.amB_Id}>
                                {branch.amB_BranchName}
                            </option>
                        ))}
                    </select>
                    {errors.amB_Id && <p className='text-destructive text-xs'>{errors.amB_Id.message}</p>}
                </div>

                {/* Semester */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_amsE_Id' className='font-medium text-sm'>
                        Semester <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='edit_amsE_Id'
                        {...register('amsE_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Semester --</option>
                        {semesters.map((sem) => (
                            <option key={sem.amsE_Id} value={sem.amsE_Id}>
                                {sem.amsE_SEMName}
                            </option>
                        ))}
                    </select>
                    {errors.amsE_Id && <p className='text-destructive text-xs'>{errors.amsE_Id.message}</p>}
                </div>

                {/* Subject */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_ismS_Id' className='font-medium text-sm'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='edit_ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Subject --</option>
                        {subjects.map((sub) => (
                            <option key={sub.ismS_Id} value={sub.ismS_Id}>
                                {sub.ismS_SubjectName}
                            </option>
                        ))}
                    </select>
                    {errors.ismS_Id && <p className='text-destructive text-xs'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Marks */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_lmsmcQ_Marks' className='font-medium text-sm'>
                        Marks <span className='text-destructive'>*</span>
                    </Label>
                    <input
                        type='number'
                        id='edit_lmsmcQ_Marks'
                        {...register('lmsmcQ_Marks', { valueAsNumber: true })}
                        placeholder='1'
                        min={1}
                        max={100}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    />
                    {errors.lmsmcQ_Marks && <p className='text-destructive text-xs'>{errors.lmsmcQ_Marks.message}</p>}
                </div>

                {/* Complexity */}
                <div className='space-y-2'>
                    <Label htmlFor='edit_lmsmoecX_Id' className='font-medium text-sm'>
                        Complexity Level
                    </Label>
                    <select
                        id='edit_lmsmoecX_Id'
                        {...register('lmsmoecX_Id', { valueAsNumber: true })}
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>Standard</option>
                        {complexities.map((comp) => (
                            <option key={comp.lmsmoecX_Id} value={comp.lmsmoecX_Id}>
                                {comp.lmsmoecX_ComplexityName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Question Statement */}
                <div className='col-span-1 space-y-2 md:col-span-3'>
                    <Label htmlFor='edit_lmsmcQ_Question' className='font-medium text-sm'>
                        Question <span className='text-destructive'>*</span>
                    </Label>
                    <InputTextarea
                        id='edit_lmsmcQ_Question'
                        {...register('lmsmcQ_Question')}
                        placeholder='Type your question statement here...'
                        rows={3}
                    />
                    {errors.lmsmcQ_Question && <p className='text-destructive text-xs'>{errors.lmsmcQ_Question.message}</p>}
                </div>

                {/* Question Description */}
                <div className='col-span-1 space-y-2 md:col-span-3'>
                    <Label htmlFor='edit_lmsmcQ_QuestionDesc' className='font-medium text-sm'>
                        Question Description / Hints (Optional)
                    </Label>
                    <InputTextarea
                        id='edit_lmsmcQ_QuestionDesc'
                        {...register('lmsmcQ_QuestionDesc')}
                        placeholder='Detailed question description or notes...'
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
