'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ToppersListSchema, toppersListReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClasses,
    getDetails,
    getReportDetails,
    getSectionsAndExams,
    getSubjects
} from '@/server/exam/exam-module/reports/toppers-list-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';

interface ReportFormProps {
    onReportGenerated: (data: any, institution: any, params: any) => void;
    onReset: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onReportGenerated, onReset }) => {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    const methods = useForm<ToppersListSchema>({
        resolver: zodResolver(toppersListReportSchema),
        mode: 'all',
        defaultValues: {
            type: '1',
            topper: '10',
            subjectwise: false
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    // Watchers
    const watchType = useWatch({ control, name: 'type' });
    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchExam = useWatch({ control, name: 'EME_Id' });
    const watchSubjectwise = useWatch({ control, name: 'subjectwise' });
    const watchSubject = useWatch({ control, name: 'ISMS_Id' });
    const watchTopper = useWatch({ control, name: 'topper' });

    // Track previous values to trigger selective resets
    const prevValues = useRef({
        type: watchType,
        year: watchYear,
        class: watchClass,
        section: watchSection,
        exam: watchExam,
        subjectwise: watchSubjectwise,
        subject: watchSubject,
        topper: watchTopper
    });

    // Auto-Close Report on Change
    useEffect(() => {
        const current = {
            type: watchType,
            year: watchYear,
            class: watchClass,
            section: watchSection,
            exam: watchExam,
            subjectwise: watchSubjectwise,
            subject: watchSubject,
            topper: watchTopper
        };
        const prev = prevValues.current;

        // Check if any relevant field changed
        const hasChanged = Object.keys(current).some((k) => current[k as keyof typeof current] !== prev[k as keyof typeof prev]);

        if (hasChanged) {
            onReset();
            prevValues.current = current;
        }
    }, [watchType, watchYear, watchClass, watchSection, watchExam, watchSubjectwise, watchSubject, watchTopper, onReset]);

    // Initial Data
    useEffect(() => {
        getDetails().then((res) => {
            setYears(res.acdlist);
            setLoading(false);
            // In typical angular app logic, classes might also be loaded initially or after year select.
            // We will load classes AFTER year select to be safe and dependent.
        });
    }, []);

    // Load Classes on Year Change
    useEffect(() => {
        if (watchYear) {
            getClasses(watchYear).then((res) => setClasses(res.ctlist));
            setValue('ASMCL_Id', '');
            setSections([]);
            setExams([]);
            setSubjects([]);
        }
    }, [watchYear, setValue]);

    // Load Sections & Exams on Class Change
    useEffect(() => {
        if (watchClass) {
            getSectionsAndExams(watchClass).then((res) => {
                setSections(res.seclist);
                setExams(res.examlist);
            });
            setValue('ASMS_Id', '');
            setValue('EME_Id', '');
            setSubjects([]);
        }
    }, [watchClass, setValue]);

    // Load Subjects on Exam/Section Change (if needed, or just Exam)
    useEffect(() => {
        if (watchExam && (watchType === '1' || watchSection)) {
            // Need data context for subject fetch? usually year/class/section/exam
            getSubjects({}).then((res) => setSubjects(res.sublist));
            setValue('ISMS_Id', '');
        }
    }, [watchExam, watchSection, watchType, setValue]);

    const onSubmit = async (values: ToppersListSchema) => {
        try {
            const result = await getReportDetails(values);
            onReportGenerated(result.datareport, result.masterinstitution, values);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCancel = () => {
        reset();
        onReset();
    };

    if (loading)
        return (
            <div className='flex justify-center p-4'>
                <Loader2 className='animate-spin' />
            </div>
        );

    return (
        <div className='mx-auto w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h3 className='font-semibold text-gray-800 text-lg'>Topper List Report</h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Radio Group Type */}
                    <div className='flex justify-center rounded-md bg-gray-50 p-3'>
                        <Controller
                            control={control}
                            name='type'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='1' id='all' />
                                        <Label htmlFor='all' className='cursor-pointer'>
                                            All
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='2' id='ind' />
                                        <Label htmlFor='ind' className='cursor-pointer'>
                                            Individual
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='flex items-center gap-2'>
                            <Label className='w-1/3 text-right'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Class */}
                        <div className='flex items-center gap-2'>
                            <Label className='w-1/3 text-right'>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((c: any) => (
                                                        <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                            {c.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section (Disabled if Type = 1 (All)) */}
                        <div className='flex items-center gap-2'>
                            <Label className='w-1/3 text-right'>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={watchType === '1'}>
                                                <SelectTrigger className={watchType === '1' ? 'bg-gray-100' : ''}>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((s: any) => (
                                                        <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                            {s.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Top */}
                        <div className='flex items-center gap-2'>
                            <Label className='w-1/3 text-right'>
                                Top <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='topper'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Input {...field} placeholder='Enter Top Count' type='number' />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Examwise */}
                        <div className='flex items-center gap-2'>
                            <Label className='w-1/3 text-right'>
                                Examwise <span className='text-red-500'>*</span>
                            </Label>
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='EME_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Exam' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {exams.map((e: any) => (
                                                        <SelectItem key={e.emE_Id} value={String(e.emE_Id)}>
                                                            {e.emE_ExamName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Subjectwise Checkbox & Dropdown */}
                        <div className='flex items-center gap-2'>
                            {/* Checkbox part */}
                            <div className='flex w-1/3 items-center justify-end gap-2'>
                                <Controller
                                    control={control}
                                    name='subjectwise'
                                    render={({ field }) => (
                                        <>
                                            <Checkbox id='subCheck' checked={field.value} onCheckedChange={field.onChange} />
                                            <Label htmlFor='subCheck' className='cursor-pointer'>
                                                Subjectwise
                                            </Label>
                                        </>
                                    )}
                                />
                            </div>

                            {/* Dropdown part */}
                            <div className='w-2/3'>
                                <Controller
                                    control={control}
                                    name='ISMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchSubjectwise}>
                                                <SelectTrigger className={!watchSubjectwise ? 'bg-gray-100' : ''}>
                                                    <SelectValue placeholder='Select Subject' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map((s: any) => (
                                                        <SelectItem key={s.ismS_Id} value={String(s.ismS_Id)}>
                                                            {s.ismS_SubjectName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-4'>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />} Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
