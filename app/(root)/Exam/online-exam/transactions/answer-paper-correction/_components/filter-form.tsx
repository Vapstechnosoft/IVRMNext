'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { answerPaperFilterSchema } from '@/schemas/exam/online-exam/transactions';
import type {
    IAcademicYearDropdown,
    IClassDropdown,
    IExamDropdown,
    ISectionDropdown,
    ISubjectDropdown
} from '@/types/exam/online-exam/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

type FilterFormValues = z.infer<typeof answerPaperFilterSchema>;

interface FilterFormProps {
    years: IAcademicYearDropdown[];
    classes: IClassDropdown[];
    sections: ISectionDropdown[];
    subjects: ISubjectDropdown[];
    exams: IExamDropdown[];
    onFilterSubmit: (values: FilterFormValues) => void;
    onReset: () => void;
    isLoading?: boolean;
}

export default function AnswerPaperFilterForm({
    years = [],
    classes = [],
    sections = [],
    subjects = [],
    exams = [],
    onFilterSubmit,
    onReset,
    isLoading
}: FilterFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FilterFormValues>({
        resolver: zodResolver(answerPaperFilterSchema),
        mode: 'onChange'
    });

    const handleFormReset = () => {
        reset();
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onFilterSubmit)} className='space-y-4 rounded-xl border bg-card p-5 shadow-sm'>
            <div className='border-b pb-2'>
                <h3 className='font-semibold text-base text-foreground'>Filter Exam Submissions</h3>
                <p className='text-muted-foreground text-xs'>Select exam parameters to view and evaluate student answer papers</p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                {/* Academic Year */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmaY_Id' className='font-semibold text-xs'>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_asmaY_Id'
                        {...register('asmaY_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Year --</option>
                        {years.map((y) => (
                            <option key={y.asmaY_Id} value={y.asmaY_Id}>
                                {y.asmaY_Year}
                            </option>
                        ))}
                    </select>
                    {errors.asmaY_Id && <p className='text-[11px] text-destructive'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmcL_Id' className='font-semibold text-xs'>
                        Class <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_asmcL_Id'
                        {...register('asmcL_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Class --</option>
                        {classes.map((c) => (
                            <option key={c.asmcL_Id} value={c.asmcL_Id}>
                                {c.asmcL_ClassName}
                            </option>
                        ))}
                    </select>
                    {errors.asmcL_Id && <p className='text-[11px] text-destructive'>{errors.asmcL_Id.message}</p>}
                </div>

                {/* Section */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmS_Id' className='font-semibold text-xs'>
                        Section <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_asmS_Id'
                        {...register('asmS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Section --</option>
                        {sections.map((s) => (
                            <option key={s.asmS_Id} value={s.asmS_Id}>
                                {s.asmC_SectionName}
                            </option>
                        ))}
                    </select>
                    {errors.asmS_Id && <p className='text-[11px] text-destructive'>{errors.asmS_Id.message}</p>}
                </div>

                {/* Subject */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_ismS_Id' className='font-semibold text-xs'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Subject --</option>
                        {subjects.map((sub) => (
                            <option key={sub.ismS_Id} value={sub.ismS_Id}>
                                {sub.ismS_SubjectName}
                            </option>
                        ))}
                    </select>
                    {errors.ismS_Id && <p className='text-[11px] text-destructive'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Exam Name */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_lpmoeeX_Id' className='font-semibold text-xs'>
                        Exam Name <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_lpmoeeX_Id'
                        {...register('lpmoeeX_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Exam --</option>
                        {exams.map((ex) => (
                            <option key={ex.lpmoeeX_Id} value={ex.lpmoeeX_Id}>
                                {ex.lpmoeeX_ExamName}
                            </option>
                        ))}
                    </select>
                    {errors.lpmoeeX_Id && <p className='text-[11px] text-destructive'>{errors.lpmoeeX_Id.message}</p>}
                </div>
            </div>

            {/* Submit & Reset Buttons */}
            <div className='flex items-center justify-end gap-3 pt-2'>
                <Button type='button' variant='outline' size='sm' onClick={handleFormReset} className='h-9 gap-1.5 text-xs'>
                    <RotateCcw className='h-3.5 w-3.5' /> Reset
                </Button>
                <Button type='submit' size='sm' disabled={isLoading} className='h-9 min-w-28 gap-1.5 text-xs shadow-sm'>
                    <Search className='h-3.5 w-3.5' /> {isLoading ? 'Searching...' : 'Search Submissions'}
                </Button>
            </div>
        </form>
    );
}
