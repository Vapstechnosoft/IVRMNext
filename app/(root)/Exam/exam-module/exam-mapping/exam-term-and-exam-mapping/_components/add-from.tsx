'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExamTermAndExamMapping } from '@/hooks/exam/exammodule/exam-mapping';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { ExamTermAndExamMappingSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { getExamGroupsByCategory } from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { addOrUpdateExamTermAndExamMapping } from '@/server/exam/exam-module/exam-mapping/examTerm-and-exam-mappiong';
import { getCategoryDropDownByAcademicYearlist } from '@/server/exam/exam-module/exam-mapping/yearly-category-dates-mapping';
import { getMasterGrade } from '@/server/exam/exam-module/masters/grade';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
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
            asmaY_Id: undefined,
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
    const { control, handleSubmit, reset, setValue, formState, watch } = methods;
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
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const topLocked = addedRows.length > 0;

    useEffect(() => {
        // Academic Years
        if (academicError) {
            toast.error(academicError.message || 'Error fetching academic years');
            setAcademicYears([]);
        } else if (academicData?.data && Array.isArray(academicData.data)) {
            const formattedYears: IAcademicYearDropDown[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id,
                asmaY_Year: item.asmaY_Year ?? '',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formattedYears);
        } else {
            setAcademicYears([]);
        }
    }, [academicData, academicError]);

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

        // Prevent duplicate exams
        const examAlreadyAdded = addedRows.some((row) => row.emE_Id === entryExamId);
        if (examAlreadyAdded) {
            toast.error('This exam is already added!');
            return;
        }

        const totalMarksOrPercentage = addedRows.reduce((acc, curr) => acc + Number(curr.ecteX_MarksPercentValue || 0), 0);
        const newTotal = totalMarksOrPercentage + Number(entryValue || 0);

        if (newTotal > Number(ecT_Marks || 0)) {
            toast.error(`Total (${newTotal}) cannot exceed term marks (${ecT_Marks})`);
            return;
        }

        const selectedExam = exams.find((e) => e.emE_Id === entryExamId);
        if (!selectedExam) {
            toast.error('Invalid exam selected');
            return;
        }

        const newRow = {
            emE_Id: entryExamId,
            emE_ExamName: selectedExam.emE_ExamName,
            ecteX_MarksPerFlag: entryMarksFlag,
            ecteX_MarksPercentValue: Number(entryValue),
            ecteX_RoundOffReqFlg: entryRoundOff,
            ecteX_ConversionReqFlg: entryConversion,
            ecteX_NotApplicableToTotal: entryNotApplicable
        };

        const updatedRows = [...addedRows, newRow];
        setAddedRows(updatedRows);
        setValue('exam_term', updatedRows); // Keep RHF in sync

        // Reset entry
        setEntryExamId(0);
        setEntryValue('');
        setEntryMarksFlag('M');
        setEntryRoundOff(false);
        setEntryConversion(false);
        setEntryNotApplicable(false);

        toast.success('Exam added successfully');
    }

    function handleDeleteRow(index: number) {
        setAddedRows((prev) => prev.filter((_, i) => i !== index));
    }

    const onSubmit = async (data: FormFields) => {
        if (!addedRows.length) {
            toast.error('Add at least one exam row before saving');
            return;
        }

        // Sync to field array for validation
        replace(addedRows);

        // // Wait a tick for validation
        // await new Promise((resolve) => setTimeout(resolve, 0));

        // // Check for validation errors
        // if (Object.keys(errors).length > 0) {
        //     toast.error('Please fix form errors before submitting');
        //     return;
        // }

        try {
            // Build API payload matching the required structure
            const payload = {
                ecT_Id: data.ecT_Id ?? 0,
                mI_Id: 30,
                asmaY_Id: data.asmaY_Id,
                emcA_Id: data.emcA_Id,
                emgR_Id: data.emgR_Id,
                ecT_TermName: data.ecT_TermName.trim(),
                ecT_TermStartDate: data.ecT_TermStartDate,
                ecT_TermEndDate: data.ecT_TermEndDate,
                ecT_MarksPublishDate: data.ecT_MarksPublishDate,
                ecT_Marks: data.ecT_Marks,
                ecT_MinMarks: data.ecT_MinMarks,

                exam_term: addedRows.map((r) => ({
                    emE_Id: r.emE_Id,
                    emE_ExamName: r.emE_ExamName,
                    ecteX_MarksPerFlag: r.ecteX_MarksPerFlag,
                    ecteX_MarksPercentValue: r.ecteX_MarksPercentValue,
                    ecteX_RoundOffReqFlg: r.ecteX_RoundOffReqFlg, // boolean
                    ecteX_ConversionReqFlg: r.ecteX_ConversionReqFlg, // boolean
                    ecteX_NotApplicableToTotal: r.ecteX_NotApplicableToTotal // boolean
                }))
            };
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
    function handleReset() {
        // Reset all form fields to initial state
        reset({
            ecT_Id: 0,
            mI_Id: orgId,
            asmaY_Id: undefined,
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
    function handleCancel() {
        setAddedRows([]);
        setEntryExamId(0);
        setEntryMarksFlag('M');
        setEntryValue('');
        setEntryRoundOff(false);
        setEntryConversion(false);
        setEntryNotApplicable(false);
    }

    return (
        <div className='flex w-full flex-col gap-6'>
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit, (errs) => {
                        const firstErrorKey = Object.keys(errs)[0];
                        const firstError = firstErrorKey && (errs as Record<string, any>)[firstErrorKey];
                        const errorMessage = firstError?.message || 'Something went wrong';
                        toast.error(errorMessage);
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
                                            value={!field.value || field.value === 0 ? undefined : String(field.value)}
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
                                            value={!field.value || field.value === 0 ? undefined : String(field.value)}
                                            onValueChange={(val) => !topLocked && field.onChange(Number(val))}
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
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Term Start Date'
                                            placeholder='Select Date'
                                            fromDate={new Date()}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name='ecT_TermEndDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Term End Date'
                                            placeholder='Select Date'
                                            fromDate={new Date(watch('ecT_TermStartDate'))}
                                        />
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name='ecT_MarksPublishDate'
                                    render={({ field, fieldState }) => (
                                        <DateField
                                            field={field}
                                            fieldState={fieldState}
                                            label='Term Publish Date'
                                            placeholder='Select Date'
                                            fromDate={new Date(watch('ecT_TermEndDate'))}
                                        />
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
                                    onKeyDown={(e) => {
                                        if (['e', 'E', '+', '-'].includes(e.key)) {
                                            e.preventDefault(); // 🚫 Block unwanted chars
                                        }
                                    }}
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

                            <div className='col-span-5 mt-3 flex justify-center gap-4 '>
                                <Button type='button' onClick={handleAddExamRow} className='w-fit' disabled={!currentEntryValid}>
                                    Add Exam
                                </Button>
                                <Button className='flex w-fit' type='button' variant='outline' onClick={() => handleCancel()}>
                                    Cancel
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
                                            <tr className='border-gray-300 border-b bg-gray-50 text-left font-normal text-[#78716C]'>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal first:rounded-tl-xl'>SLNO</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Exam</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Type</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Value</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Round Off</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Conversion</th>
                                                <th className='border-gray-300 border-r px-3 py-2 font-normal'>Not Applicable</th>
                                                <th className='px-3 py-2 font-normal last:rounded-tr-xl'>Actions</th>
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
