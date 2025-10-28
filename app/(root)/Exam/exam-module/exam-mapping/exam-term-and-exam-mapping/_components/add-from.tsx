'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamTermAndExamMapping } from '@/hooks/exam/exammodule/exam-mapping';
import { ExamTermAndExamMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getExamGroupsByCategory } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { addOrUpdateExamTermAndExamMapping } from '@/server/exam/exam-module/exam-mapping/examTerm-and-exam-mappiong';
import { getCategoryDropDownByAcademicYearlist } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import { getAcademicYears } from '@/server/exam/exam-module/masters/category-class-mapping';
import { getMasterGrade } from '@/server/exam/exam-module/masters/grade';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof ExamTermAndExamMappingSchema.addOrUpdate>;

export default function AddExamTermAndExamMapping({ onSuccess }: { onSuccess?: () => void }) {
    const orgId = 30;

    const methods = useForm<FormFields>({
        resolver: zodResolver(ExamTermAndExamMappingSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            ecT_Id: 0,
            mI_Id: orgId,
            asmaY_Id: 0,
            emcA_Id: 0,
            ecT_TermName: '',
            ecT_TermStartDate: '',
            ecT_TermEndDate: '',
            ecT_Marks: 0,
            ecT_MinMarks: 0,
            ecT_MarksPublishDate: '',
            emgR_Id: 0,
            exam_term: []
        }
    });

    const { refetchAll } = useExamTermAndExamMapping();
    const { control, handleSubmit, reset, setValue, formState, getValues } = methods;
    const { isSubmitting, errors } = formState;

    const [addedRows, setAddedRows] = useState<FormFields['exam_term']>([]);
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [categories, setCategories] = useState<{ emcA_Id: number; emcA_CategoryName: string }[]>([]);
    const [exams, setExams] = useState<{ emE_Id: number; emE_ExamName: string }[]>([]);
    const [grades, setGrades] = useState<IMasterGrade[]>([]);

    const { replace } = useFieldArray({ control, name: 'exam_term' });

    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const emcA_Id = useWatch({ control, name: 'emcA_Id' });
    const ecT_TermName = useWatch({ control, name: 'ecT_TermName' });
    const ecT_Marks = useWatch({ control, name: 'ecT_Marks' });
    const ecT_MinMarks = useWatch({ control, name: 'ecT_MinMarks' });
    const ecT_TermStartDate = useWatch({ control, name: 'ecT_TermStartDate' });
    const ecT_TermEndDate = useWatch({ control, name: 'ecT_TermEndDate' });
    const ecT_MarksPublishDate = useWatch({ control, name: 'ecT_MarksPublishDate' });
    const emgR_Id = useWatch({ control, name: 'emgR_Id' });

    const [entryExamId, setEntryExamId] = useState<number>(0);
    const [entryMarksFlag, setEntryMarksFlag] = useState<'M' | 'P'>('M');
    const [entryValue, setEntryValue] = useState<number | ''>('');
    const [entryRoundOff, setEntryRoundOff] = useState<boolean>(false);
    const [entryConversion, setEntryConversion] = useState<boolean>(false);
    const [entryNotApplicable, setEntryNotApplicable] = useState<boolean>(false);

    const topLocked = addedRows.length > 0;

    useEffect(() => {
        async function fetchYears() {
            try {
                const years = await getAcademicYears();
                setAcademicYears(Array.isArray(years) ? years : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load academic years');
            }
        }
        fetchYears();
    }, []);

    useEffect(() => {
        if (!asmaY_Id || topLocked) return;
        async function fetchRelated() {
            try {
                const { data: cats } = await getCategoryDropDownByAcademicYearlist(orgId, asmaY_Id);
                setCategories(Array.isArray(cats) ? cats : []);
                const { data: g } = await getMasterGrade({});
                setGrades(Array.isArray(g) ? g : []);
                setValue('emcA_Id', 0);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load related lists');
            }
        }
        fetchRelated();
    }, [asmaY_Id, topLocked, setValue]);

    useEffect(() => {
        if (!emcA_Id || !asmaY_Id || topLocked) return;
        async function fetchExams() {
            try {
                const { data: exs } = await getExamGroupsByCategory(asmaY_Id, emcA_Id);
                setExams(Array.isArray(exs) ? exs : []);
            } catch (err: any) {
                toast.error(err?.message ?? 'Failed to load exams');
            }
        }
        fetchExams();
    }, [asmaY_Id, emcA_Id, topLocked]);

    const topLevelValid =
        asmaY_Id !== null &&
        asmaY_Id !== undefined &&
        Number(asmaY_Id) > 0 &&
        emcA_Id !== null &&
        emcA_Id !== undefined &&
        Number(emcA_Id) > 0 &&
        ecT_TermName?.trim()?.length > 0 &&
        ecT_Marks !== null &&
        ecT_Marks !== undefined &&
        Number(ecT_Marks) > 0 &&
        ecT_MinMarks !== null &&
        ecT_MinMarks !== undefined &&
        Number(ecT_MinMarks) >= 0 &&
        ecT_TermStartDate?.trim()?.length > 0 &&
        ecT_TermEndDate?.trim()?.length > 0 &&
        ecT_MarksPublishDate?.trim()?.length > 0 &&
        emgR_Id !== null &&
        emgR_Id !== undefined &&
        Number(emgR_Id) > 0;

    const currentEntryValid = entryExamId !== null && entryExamId !== undefined && entryValue !== '' && Number(entryValue) > 0;

    function handleAddExamRow() {
        if (!topLevelValid) {
            toast.error('Please fill all required top-level fields before adding exam.');
            return;
        }

        if (!currentEntryValid) {
            toast.error('Please fill all required exam entry fields before adding.');
            return;
        }

        const totalMarksOrPercentage = addedRows.reduce((acc, curr) => acc + Number(curr.ecteX_MarksPercentValue || 0), 0);

        if (totalMarksOrPercentage + Number(entryValue || 0) > Number(ecT_Marks || 0)) {
            toast.error('Total marks or percentage cannot exceed term marks.');
            return;
        }

        const newRow = {
            emE_Id: entryExamId,
            emE_ExamName: exams.find((e) => e.emE_Id === entryExamId)?.emE_ExamName ?? '',
            ecteX_MarksPerFlag: entryMarksFlag,
            ecteX_MarksPercentValue: Number(entryValue),
            ecteX_RoundOffReqFlg: entryRoundOff,
            ecteX_ConversionReqFlg: entryConversion,
            ecteX_NotApplicableToTotal: entryNotApplicable
        };

        setAddedRows((prev) => [...prev, newRow]);
        setValue('exam_term', [...addedRows, newRow]);

        // Reset entry fields (but not top-level)
        setEntryExamId(0);
        setEntryMarksFlag('M');
        setEntryValue('');
        setEntryRoundOff(false);
        setEntryConversion(false);
        setEntryNotApplicable(false);
    }

    function handleDeleteRow(index: number) {
        setAddedRows((prev) => prev.filter((_, i) => i !== index));
    }

    const onSubmit = async (data: FormFields) => {
        console.log('Form submitted', data);
        console.log('Added rows:', addedRows);
        console.log('Form errors:', errors);

        if (!addedRows.length) {
            toast.error('Add at least one exam row before saving');
            return;
        }

        // Sync to field array for validation
        replace(addedRows);

        // Wait a tick for validation
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Check for validation errors
        if (Object.keys(errors).length > 0) {
            console.log('Validation errors:', errors);
            toast.error('Please fix form errors before submitting');
            return;
        }

        try {
            // Build API payload matching the required structure
            const payload = {
                ECT_Id: 0,
                MI_Id: orgId,
                ECT_TermName: data.ecT_TermName,
                ASMAY_Id: Number(data.asmaY_Id),
                EMCA_Id: Number(data.emcA_Id),
                EMGR_Id: Number(data.emgR_Id),
                ECT_Marks: Number(data.ecT_Marks),
                ECT_TermStartDate: data.ecT_TermStartDate,
                ECT_TermEndDate: data.ecT_TermEndDate,
                ECT_MinMarks: Number(data.ecT_MinMarks),
                ECT_PublishDate: data.ecT_MarksPublishDate,
                exam_term: addedRows.map((r) => ({
                    ECTEX_Id: 0,
                    ECT_Id: 0,
                    EME_Id: r.emE_Id,
                    ECTEX_RoundOffReqFlg: r.ecteX_RoundOffReqFlg,
                    ECTEX_ConversionReqFlg: r.ecteX_ConversionReqFlg,
                    ECTEX_MarksPercentValue: Number(r.ecteX_MarksPercentValue),
                    ECTEX_MarksPerFlag: r.ecteX_MarksPerFlag,
                    ECTEX_NotApplToTotalFlg: r.ecteX_NotApplicableToTotal
                }))
            };

            console.log('API Payload:', JSON.stringify(payload, null, 2));

            const res = await addOrUpdateExamTermAndExamMapping(payload);
            if (res?.success) {
                toast.success('Exam term mapping saved successfully');
                reset();
                setAddedRows([]);
                onSuccess?.();
                refetchAll?.();
            } else {
                toast.error(res?.message ?? 'Save failed');
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            toast.error(err?.message ?? 'Failed to save');
        }
    };

    const DateField = ({ field, fieldState, label }: { field: any; fieldState: any; label: string }) => {
        const [open, setOpen] = useState(false);
        const ref = useRef<HTMLDivElement | null>(null);
        useEffect(() => {
            const handler = (e: MouseEvent) => {
                if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
            };
            document.addEventListener('mousedown', handler);
            return () => document.removeEventListener('mousedown', handler);
        }, []);
        return (
            <div className='relative mt-4' ref={ref}>
                <Label>
                    {label} <span className='text-red-500'>*</span>
                </Label>
                <input
                    readOnly
                    value={field.value ?? ''}
                    placeholder={`Select ${label}`}
                    onClick={() => !topLocked && setOpen(true)}
                    className={`w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-sm ${
                        topLocked ? 'cursor-not-allowed bg-gray-50' : ''
                    }`}
                />
                {open && (
                    <div className='absolute z-50 mt-2'>
                        <div className='rounded-md bg-white shadow-lg'>
                            <CalendarYear
                                selected={field.value ? new Date(field.value) : undefined}
                                onDayClick={(day) => {
                                    field.onChange(day.toISOString().split('T')[0]);
                                    setOpen(false);
                                }}
                            />
                        </div>
                    </div>
                )}
                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
            </div>
        );
    };
    function handleReset() {
        // Reset all form fields to initial state
        reset({
            ecT_Id: 0,
            mI_Id: orgId,
            asmaY_Id: 0,
            emcA_Id: 0,
            ecT_TermName: '',
            ecT_TermStartDate: '',
            ecT_TermEndDate: '',
            ecT_MarksPublishDate: '',
            ecT_Marks: 0,
            ecT_MinMarks: 0,
            emgR_Id: 0,
            exam_term: []
        });

        // Clear all local state
        setAddedRows([]);
        setEntryExamId(0);
        setEntryMarksFlag('M');
        setEntryValue('');
        setEntryRoundOff(false);
        setEntryConversion(false);
        setEntryNotApplicable(false);

        // Optional: refresh dropdown data
        setCategories([]);
        setExams([]);
        setGrades([]);

        toast.info('Form has been reset');
    }

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit, (errors) => {
                        console.info('Form validation errors:', errors);
                    })}
                    className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'
                    noValidate>
                    <div className='grid grid-cols-2 gap-6'>
                        {/* Left Column */}
                        <div>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            value={field.value ? String(field.value) : undefined}
                                            onValueChange={(val) => !topLocked && field.onChange(Number(val))}
                                            disabled={topLocked}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Academic Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={control}
                                name='ecT_TermName'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Term Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input {...field} placeholder='Enter Term Name' disabled={topLocked} />
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <div className='flex w-full flex-row gap-4'>
                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='ecT_Marks'
                                        render={({ field, fieldState }) => (
                                            <div className='mt-4 w-full'>
                                                <Label>
                                                    Term Marks <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    type='number'
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                        field.onChange(val);
                                                    }}
                                                    placeholder='Enter Marks'
                                                    disabled={topLocked}
                                                    className='w-full'
                                                />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className='flex-1'>
                                    <Controller
                                        control={control}
                                        name='ecT_MinMarks'
                                        render={({ field, fieldState }) => (
                                            <div className='mt-4 w-full'>
                                                <Label>
                                                    Min Marks <span className='text-red-500'>*</span>
                                                </Label>
                                                <Input
                                                    type='number'
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                        field.onChange(val);
                                                    }}
                                                    placeholder='Enter Min Marks'
                                                    disabled={topLocked}
                                                    className='w-full'
                                                />
                                                {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            <Controller
                                control={control}
                                name='emcA_Id'
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>
                                            Category <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(val) => !topLocked && field.onChange(Number(val))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={topLocked}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((c) => (
                                                    <SelectItem key={c.emcA_Id} value={String(c.emcA_Id)}>
                                                        {c.emcA_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            <div className='flex flex-rows-3 gap-4'>
                                <Controller
                                    control={control}
                                    name='ecT_TermStartDate'
                                    render={({ field, fieldState }) => (
                                        <DateField field={field} fieldState={fieldState} label='Term Start Date' />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='ecT_TermEndDate'
                                    render={({ field, fieldState }) => (
                                        <DateField field={field} fieldState={fieldState} label='Term End Date' />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name='ecT_MarksPublishDate'
                                    render={({ field, fieldState }) => (
                                        <DateField field={field} fieldState={fieldState} label='Term Publish Date' />
                                    )}
                                />
                            </div>

                            <Controller
                                control={control}
                                name='emgR_Id'
                                render={({ field, fieldState }) => (
                                    <div className='mt-4'>
                                        <Label>
                                            Grade <span className='text-red-500'>*</span>
                                        </Label>
                                        <Select
                                            onValueChange={(val) => !topLocked && field.onChange(Number(val))}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={topLocked}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Grade' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {grades.map((g) => (
                                                    <SelectItem key={g.emgR_Id} value={String(g.emgR_Id)}>
                                                        {g.emgR_GradeName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Exam entry editor */}
                    <div className='mt-6 rounded-lg border bg-gray-50 p-4'>
                        <div className='grid grid-cols-5 items-end gap-3'>
                            <div>
                                <Label>
                                    Exam <span className='text-red-500'>*</span>
                                </Label>
                                <Select value={entryExamId ? String(entryExamId) : ''} onValueChange={(val) => setEntryExamId(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Exam' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {exams.map((ex) => (
                                            <SelectItem key={ex.emE_Id} value={String(ex.emE_Id)}>
                                                {ex.emE_ExamName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>
                                    Marks / Percentage <span className='text-red-500'>*</span>
                                </Label>
                                <div className='mt-1 flex items-center gap-2'>
                                    <label className='flex items-center gap-1'>
                                        <input
                                            type='radio'
                                            name='entryMarksFlag'
                                            checked={entryMarksFlag === 'M'}
                                            onChange={() => setEntryMarksFlag('M')}
                                        />
                                        <span>Marks</span>
                                    </label>
                                    <label className='flex items-center gap-1'>
                                        <input
                                            type='radio'
                                            name='entryMarksFlag'
                                            checked={entryMarksFlag === 'P'}
                                            onChange={() => setEntryMarksFlag('P')}
                                        />
                                        <span>Percentage</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <Label>
                                    Value <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    type='number'
                                    value={entryValue === '' ? '' : entryValue}
                                    onChange={(e) => setEntryValue(e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder='Enter value'
                                />
                            </div>

                            <div className='col-span-2'>
                                <div className='flex flex-wrap items-center gap-4'>
                                    <label className='flex items-center gap-2'>
                                        <input
                                            type='checkbox'
                                            checked={entryRoundOff}
                                            onChange={(e) => setEntryRoundOff(e.target.checked)}
                                        />
                                        <span className='text-sm'>Roundoff</span>
                                    </label>
                                    <label className='flex items-center gap-2'>
                                        <input
                                            type='checkbox'
                                            checked={entryConversion}
                                            onChange={(e) => setEntryConversion(e.target.checked)}
                                        />
                                        <span className='text-sm'>Conversion</span>
                                    </label>
                                    <label className='flex items-center gap-2'>
                                        <input
                                            type='checkbox'
                                            checked={entryNotApplicable}
                                            onChange={(e) => setEntryNotApplicable(e.target.checked)}
                                        />
                                        <span className='text-sm'>Not Applicable</span>
                                    </label>
                                </div>
                            </div>

                            <div className='col-span-5 mt-3 flex justify-center'>
                                <Button type='button' onClick={handleAddExamRow} className='w-fit' disabled={!currentEntryValid}>
                                    Add Exam
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Table and errors */}
                    {addedRows.length > 0 && (
                        <div className='mt-6'>
                            <Label>Added Exams</Label>

                            <div className='mt-3 overflow-x-auto'>
                                <div className='overflow-hidden rounded-xl border border-gray-300 shadow-sm'>
                                    <table className='w-full border-separate border-spacing-0'>
                                        <thead>
                                            <tr className='border-gray-300 border-b bg-gray-50 text-left font-semibold'>
                                                <th className='border-gray-300 border-r px-3 py-2 first:rounded-tl-xl'>SLNO</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Exam</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Type</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Value</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Round Off</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Conversion</th>
                                                <th className='border-gray-300 border-r px-3 py-2'>Not Applicable</th>
                                                <th className='px-3 py-2 last:rounded-tr-xl'>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {addedRows.map((r, idx) => (
                                                <tr
                                                    key={idx}
                                                    className='border-gray-300 border-t transition-colors duration-150 hover:bg-gray-50'>
                                                    <td className='border-gray-300 border-r px-3 py-2'>{idx + 1}</td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>{r.emE_ExamName}</td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>
                                                        {r.ecteX_MarksPerFlag === 'M' ? 'Marks' : 'Percentage'}
                                                    </td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>{r.ecteX_MarksPercentValue}</td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>
                                                        {r.ecteX_RoundOffReqFlg ? 'Yes' : 'No'}
                                                    </td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>
                                                        {r.ecteX_ConversionReqFlg ? 'Yes' : 'No'}
                                                    </td>
                                                    <td className='border-gray-300 border-r px-3 py-2'>
                                                        {r.ecteX_NotApplicableToTotal ? 'Yes' : 'No'}
                                                    </td>
                                                    <td className='px-3 py-2 text-center'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handleDeleteRow(idx)}
                                                            className='group h-8 w-8 p-0 transition-all duration-200 hover:scale-110 hover:bg-red-50 hover:text-red-600'>
                                                            <Trash2 className='h-4 w-4 transition-transform duration-200 group-hover:rotate-12' />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className='mt-6 flex w-fit gap-4'>
                        <Button type='submit' disabled={isSubmitting || addedRows.length === 0}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type='button' variant='outline' onClick={() => handleReset()}>
                            Reset
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
