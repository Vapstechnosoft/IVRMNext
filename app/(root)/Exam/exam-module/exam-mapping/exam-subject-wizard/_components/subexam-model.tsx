'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitCompareArrows } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

// ----------------------------------
// Interfaces
// ----------------------------------
interface SubExamItem {
    emsE_Id: number;
    emsE_SubExamName: string;
    emsE_SubExamCode?: string;
    checkedvalue?: boolean;
    eycessS_MaxMarks?: string | number;
    eycessS_MinMarks?: string | number;
    emgR_Id?: string | number;
    eycessS_ExemptedFlg?: boolean;
    eycessS_ExemptedPer?: string | number;
    eycessS_SubSubjectOrder?: string | number;
    eycessS_ActiveFlg?: boolean;
    eycessS_GradesFlg?: boolean;
    eycessS_MarksFlg?: boolean;
    eycessS_AplResultFlg?: boolean;
    eycessS_MarksEntryMax?: string | number;
    EYCESSE_Id?: number;
    EYCESSS_Id?: number;
    emsE_SubExamOrder?: number;
}

interface FormData {
    subexam_list: SubExamItem[];
}

interface SubExamModalProps {
    open: boolean;
    subject?: any;
    onClose: (subjectId: number) => void;
    onSave: (subjectId: number, selectedList: any[], subExamList: any[]) => void;
    schema: z.ZodType<any>;
    gradeList: IMasterGrade[];
}

// ----------------------------------
//  Component
// ----------------------------------
export default function SubExamModal({ open, subject, onClose, onSave, schema, gradeList }: SubExamModalProps) {
    const methods = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { subexam_list: [] },
        mode: 'onTouched'
    });

    const { control, reset, getValues, setValue, formState, setError, clearErrors, watch } = methods;
    const { errors } = formState;
    const { fields, replace } = useFieldArray({
        control,
        name: 'subexam_list'
    });

    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [isOrderloading, setIsOrderloading] = useState(true);

    // ----------------------------------
    // Populate initial list
    // ----------------------------------
    useEffect(() => {
        if (!subject) {
            reset({ subexam_list: [] });
            return;
        }
        const rawList = subject.list ?? [];
        console.info('rawList **', rawList);

        const shouldSort = rawList.some((l: any) => Number(l.emsE_SubExamOrder) > 0);
        const list = (subject.list ?? []).map((l: any) => ({
            ...l,
            emsE_SubExamName: l.emsE_SubExamName,
            emsE_SubExamCode: l.emsE_SubExamCode,
            checkedvalue: Boolean(l.checkedvalue),
            eycessS_MaxMarks: l.EYCESSE_MaxMarks ?? '',
            eycessS_MinMarks: l.EYCESSE_MinMarks ?? '',
            emgR_Id: l.EMGR_Id ?? '',
            eycessS_ExemptedFlg: !!l.EYCESSE_ExemptedFlg,
            eycessS_ExemptedPer: l.EYCESSE_ExemptedPer ?? '',
            eycessS_ActiveFlg: !!l.EYCESSE_ActiveFlg,
            eycessS_GradesFlg: !!l.EYCESSS_GradesFlg,
            eycessS_MarksFlg: !!l.EYCESSS_MarksFlg,
            eycessS_AplResultFlg: !!l.EYCESSS_AplResultFlg,
            eycessS_MarksEntryMax: l.EYCESSS_MarksEntryMax ?? '',
            emsE_SubExamOrder: l.emsE_SubExamOrder
        }));

        const finalList = shouldSort ? [...list].sort((a, b) => Number(a.emsE_SubExamOrder) - Number(b.emsE_SubExamOrder)) : list;

        replace(finalList);
    }, [subject, reset, replace]);

    // ----------------------------------
    // Set Order Functions
    // ----------------------------------
    const handleSetOrder = () => {
        if (fields.length === 0) {
            toast.info('Sub-exams are still loading...');
            return;
        }
        setIsOrderDetailsOpen(true);
        setIsOrderloading(false);
    };

    const handleOrderSave = async (updatedData: any) => {
        setIsOrderSaving(true);
        const currentList = getValues('subexam_list') ?? [];
        const reorderedList = (updatedData ?? []).map((item: any, index: number) => {
            const matchId = item.id ?? item.emsE_Id;
            const original = currentList.find((x: any) => x.emsE_Id === matchId) ?? item;
            return { ...original, emsE_SubExamOrder: index + 1 };
        });

        const reorderedIds = new Set(reorderedList.map((r: any) => r.emsE_Id));
        const remaining = currentList.filter((x: any) => !reorderedIds.has(x.emsE_Id));
        const finalList = [...reorderedList, ...remaining].sort(
            (a, b) => Number(a.emsE_SubExamOrder ?? 0) - Number(b.emsE_SubExamOrder ?? 0)
        );

        replace(finalList);
        toast.success('Sub-Exam order saved successfully.');
        setIsOrderSaving(false);
        setIsOrderDetailsOpen(false);
    };

    const closeOrderDetails = () => {
        setIsOrderDetailsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!subject) return null;

    const parentMaxMarks = Number(subject.EYCES_MaxMarks ?? 0);

    // ----------------------------------
    // Manual Validation Functions
    // ----------------------------------

    // Validate a single row
    const validateRowManually = (row: SubExamItem) => {
        const rowErrs: Record<string, string> = {};

        const max = row.eycessS_MaxMarks === '' || row.eycessS_MaxMarks === null ? undefined : Number(row.eycessS_MaxMarks);
        const min = row.eycessS_MinMarks === '' || row.eycessS_MinMarks === null ? undefined : Number(row.eycessS_MinMarks);
        const entry =
            row.eycessS_MarksEntryMax === '' || row.eycessS_MarksEntryMax === null ? undefined : Number(row.eycessS_MarksEntryMax);

        // 1) Sub-exam marks cannot exceed parent max
        if (max !== undefined && max > parentMaxMarks) {
            rowErrs.eycessS_MaxMarks = `Max marks cannot exceed parent subject max (${parentMaxMarks})`;
        }
        if (min !== undefined && min > parentMaxMarks) {
            rowErrs.eycessS_MinMarks = `Min marks cannot exceed parent subject max (${parentMaxMarks})`;
        }
        if (entry !== undefined && entry > parentMaxMarks) {
            rowErrs.eycessS_MarksEntryMax = `Marks entry max cannot exceed parent subject max (${parentMaxMarks})`;
        }

        // 2) Min <= Max
        if (min !== undefined && max !== undefined && min > max) {
            rowErrs.eycessS_MinMarks = 'Min marks cannot be greater than Max marks';
            rowErrs.eycessS_MaxMarks = 'Max marks cannot be less than Min marks';
        }

        // 3) MarksEntry <= Max
        if (entry !== undefined && max !== undefined && entry > max) {
            rowErrs.eycessS_MarksEntryMax = 'Marks entry max cannot be greater than Max marks';
        }

        return rowErrs;
    };

    // Validate all rows before save
    const validateAllBeforeSave = (): boolean => {
        const all = getValues('subexam_list') ?? [];
        let hasError = false;

        clearErrors();

        all.forEach((row: SubExamItem, idx: number) => {
            const rowErrs = validateRowManually(row);

            // If the row is checked, ensure required fields are present
            if (row.checkedvalue) {
                const maxVal = row.eycessS_MaxMarks === '' || row.eycessS_MaxMarks === null ? undefined : Number(row.eycessS_MaxMarks);
                const minVal = row.eycessS_MinMarks === '' || row.eycessS_MinMarks === null ? undefined : Number(row.eycessS_MinMarks);
                const entryVal =
                    row.eycessS_MarksEntryMax === '' || row.eycessS_MarksEntryMax === null ? undefined : Number(row.eycessS_MarksEntryMax);
                const gradeVal = row.emgR_Id;

                if (maxVal === undefined || maxVal === null) {
                    rowErrs.eycessS_MaxMarks = 'Max marks is required';
                }
                if (minVal === undefined || minVal === null) {
                    rowErrs.eycessS_MinMarks = 'Min marks is required';
                }
                if (entryVal === undefined || entryVal === null) {
                    rowErrs.eycessS_MarksEntryMax = 'Marks entry max is required';
                }
                if (gradeVal === undefined || gradeVal === null || gradeVal === '') {
                    rowErrs.emgR_Id = 'Grade is required';
                }
            }

            // Apply errors to react-hook-form
            Object.keys(rowErrs).forEach((field) => {
                hasError = true;
                setError(`subexam_list.${idx}.${field}` as any, {
                    type: 'manual',
                    message: rowErrs[field]
                });
            });
        });

        return !hasError;
    };

    // Real-time validation handlers
    const handleMaxChange = (idx: number, rawVal: string) => {
        const val = rawVal === '' ? '' : Number(rawVal);
        updateRowValue(idx, 'eycessS_MaxMarks', val);

        if (val !== '' && Number(val) > parentMaxMarks) {
            setError(`subexam_list.${idx}.eycessS_MaxMarks` as any, {
                type: 'manual',
                message: `Max marks cannot exceed parent subject max (${parentMaxMarks})`
            });
        } else {
            clearErrors(`subexam_list.${idx}.eycessS_MaxMarks`);
            clearErrors(`subexam_list.${idx}.eycessS_MinMarks`);
            clearErrors(`subexam_list.${idx}.eycessS_MarksEntryMax`);
        }
    };

    const handleMinChange = (idx: number, rawVal: string) => {
        const val = rawVal === '' ? '' : Number(rawVal);
        updateRowValue(idx, 'eycessS_MinMarks', val);

        if (val !== '' && Number(val) > parentMaxMarks) {
            setError(`subexam_list.${idx}.eycessS_MinMarks` as any, {
                type: 'manual',
                message: `Min marks cannot exceed parent subject max (${parentMaxMarks})`
            });
        } else {
            clearErrors(`subexam_list.${idx}.eycessS_MinMarks`);
        }

        // Check min <= max
        const row = getValues('subexam_list')[idx];
        const maxVal = row?.eycessS_MaxMarks === '' ? undefined : Number(row?.eycessS_MaxMarks);
        if (val !== '' && maxVal !== undefined && Number(val) > Number(maxVal)) {
            setError(`subexam_list.${idx}.eycessS_MinMarks` as any, {
                type: 'manual',
                message: 'Min marks cannot be greater than Max marks'
            });
            setError(`subexam_list.${idx}.eycessS_MaxMarks` as any, {
                type: 'manual',
                message: 'Max marks cannot be less than Min marks'
            });
        } else {
            if (maxVal !== undefined) clearErrors(`subexam_list.${idx}.eycessS_MaxMarks`);
        }
    };

    const handleEntryChange = (idx: number, rawVal: string) => {
        const val = rawVal === '' ? '' : Number(rawVal);
        updateRowValue(idx, 'eycessS_MarksEntryMax', val);

        if (val !== '' && Number(val) > parentMaxMarks) {
            setError(`subexam_list.${idx}.eycessS_MarksEntryMax` as any, {
                type: 'manual',
                message: `Marks entry max cannot exceed parent subject max (${parentMaxMarks})`
            });
        } else {
            const row = getValues('subexam_list')[idx];
            const maxVal = row?.eycessS_MaxMarks === '' ? undefined : Number(row?.eycessS_MaxMarks);
            if (maxVal !== undefined && val !== '' && Number(val) > Number(maxVal)) {
                setError(`subexam_list.${idx}.eycessS_MarksEntryMax` as any, {
                    type: 'manual',
                    message: 'Marks entry max cannot be greater than Max marks'
                });
            } else {
                clearErrors(`subexam_list.${idx}.eycessS_MarksEntryMax`);
            }
        }
    };

    // ----------------------------------
    // Save Handler
    // ----------------------------------
    const handleSave = () => {
        const values = getValues();
        const selected = values.subexam_list.filter((r) => r.checkedvalue);

        // Run manual validations
        const ok = validateAllBeforeSave();
        if (!ok) {
            toast.error('Please fix validation errors before saving.');
            return;
        }

        if (selected.length === 0) {
            toast.error('Select at least one sub-exam before saving.');
            return;
        }

        const parentMax = Number(subject.EYCES_MaxMarks ?? 0);
        const parentMin = Number(subject.EYCES_MinMarks ?? 0);
        const totMax = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MaxMarks || 0), 0);
        const totMin = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MinMarks || 0), 0);

        if (selected.length > 0 && (totMax !== parentMax || totMin !== parentMin)) {
            toast.error('Sum of selected sub-exams (max/min) must equal subject max/min marks.');
            return;
        }

        const formatted = selected.map((r, index) => ({
            EYCESSE_Id: r.EYCESSE_Id ?? 0,
            EYCES_Id: subject.EYCES_Id,
            EMSE_Id: r.emsE_Id,
            EMGR_Id: Number(r.emgR_Id) || null,
            EYCESSE_MaxMarks: Number(r.eycessS_MaxMarks) || 0,
            EYCESSE_MinMarks: Number(r.eycessS_MinMarks) || 0,
            EYCESSE_ExemptedFlg: !!r.eycessS_ExemptedFlg,
            EYCESSE_ExemptedPer: Number(r.eycessS_ExemptedPer) || 0,
            EYCESSE_ActiveFlg: !!r.eycessS_ActiveFlg,
            emsE_SubExamOrder: index + 1,
            EYCESSS_MarksFlg: !!r.eycessS_MarksFlg,
            EYCESSS_GradesFlg: !!r.eycessS_GradesFlg,
            EYCESSS_AplResultFlg: !!r.eycessS_AplResultFlg,
            EYCESSS_MarksEntryMax: Number(r.eycessS_MarksEntryMax) || 0
        }));

        onSave(subject.ISMS_Id, formatted, values.subexam_list);
    };

    const renderSkeletonTable = () => (
        <div className='w-full rounded-md'>
            <table className='w-full table-auto border-collapse border border-gray-200'>
                <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className='hover:bg-transparent'>
                            {Array.from({ length: 12 }).map((_, j) => (
                                <td key={j} className='border px-3 py-2'>
                                    <div className='h-6 w-full animate-pulse rounded bg-slate-200' />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const updateRowValue = (idx: number, field: keyof SubExamItem, value: any) => {
        const list = getValues('subexam_list').map((r, i) => (i === idx ? { ...r, [field]: value } : r));
        setValue('subexam_list', list, { shouldDirty: true, shouldValidate: true });
        clearErrors(`subexam_list.${idx}.${String(field)}` as any);
    };

    // ----------------------------------
    // Table UI
    // ----------------------------------
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose(subject.ISMS_Id)}>
            <DialogContent className='max-h-[80vh] w-full min-w-[80vw] overflow-x-auto overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Exam — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <div className='max-h-[55vh] overflow-x-auto overflow-y-auto'>
                        <table className='w-full table-auto border-collapse'>
                            <thead className='bg-slate-50 text-sm'>
                                <tr>
                                    <th className='border p-2'>SLNO</th>
                                    <th className='border p-2'>Select</th>
                                    <th className='border p-2'>Sub-Exam</th>
                                    <th className='border p-2'>Max Marks</th>
                                    <th className='border p-2'>Min Marks</th>
                                    <th className='border p-2'>Marks Entry Max</th>
                                    <th className='border p-2'>Grade</th>
                                    <th className='border p-2'>Exempted</th>
                                    <th className='border p-2'>Exempt %</th>
                                    <th className='border p-2'>Marks Flag</th>
                                    <th className='border p-2'>Grades Flag</th>
                                    <th className='border p-2'>Apl Result</th>
                                </tr>
                            </thead>

                            <tbody>
                                {subject && subject.list === undefined && (
                                    <tr>
                                        <td colSpan={12} className='p-6'>
                                            {renderSkeletonTable()}
                                        </td>
                                    </tr>
                                )}

                                {subject?.list?.length === 0 && (
                                    <tr>
                                        <td colSpan={12} className='py-6 text-center text-muted-foreground text-sm'>
                                            No records found.
                                        </td>
                                    </tr>
                                )}

                                {fields.map((row, idx) => (
                                    <tr key={row.id || row.emsE_Id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                        <td className='border p-2 text-center'>{idx + 1}</td>

                                        {/* Checkbox */}
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.checkedvalue`}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onCheckedChange={(v) => {
                                                            field.onChange(!!v);
                                                            updateRowValue(idx, 'checkedvalue', !!v);
                                                            clearErrors([
                                                                `subexam_list.${idx}.eycessS_MaxMarks`,
                                                                `subexam_list.${idx}.eycessS_MinMarks`,
                                                                `subexam_list.${idx}.eycessS_MarksEntryMax`,
                                                                `subexam_list.${idx}.emgR_Id`
                                                            ] as any);
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        <td className='border p-2 text-left'>{row.emsE_SubExamName}</td>

                                        {/* Max Marks */}
                                        <td className='w-28 border p-2'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_MaxMarks`}
                                                render={({ field }) => (
                                                    <Input
                                                        type='text'
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/\D/g, '');
                                                            handleMaxChange(idx, raw === '' ? '' : raw);
                                                        }}
                                                        onBlur={() => {
                                                            const rowVal = getValues('subexam_list')[idx];
                                                            const rowErrs = validateRowManually(rowVal);
                                                            clearErrors(`subexam_list.${idx}.eycessS_MaxMarks` as any);
                                                            if (rowErrs.eycessS_MaxMarks) {
                                                                setError(`subexam_list.${idx}.eycessS_MaxMarks` as any, {
                                                                    type: 'manual',
                                                                    message: rowErrs.eycessS_MaxMarks
                                                                });
                                                            }
                                                        }}
                                                        className='text-center'
                                                        placeholder='Enter Max Marks'
                                                        inputMode='numeric'
                                                    />
                                                )}
                                            />
                                            {errors.subexam_list?.[idx]?.eycessS_MaxMarks && (
                                                <p className='mt-1 text-[11px] text-red-500'>
                                                    {String(errors.subexam_list[idx].eycessS_MaxMarks?.message)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Min Marks */}
                                        <td className='w-28 border p-2'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_MinMarks`}
                                                render={({ field }) => (
                                                    <Input
                                                        type='text'
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/\D/g, '');
                                                            handleMinChange(idx, raw === '' ? '' : raw);
                                                        }}
                                                        onBlur={() => {
                                                            const rowVal = getValues('subexam_list')[idx];
                                                            const rowErrs = validateRowManually(rowVal);
                                                            clearErrors(`subexam_list.${idx}.eycessS_MinMarks` as any);
                                                            if (rowErrs.eycessS_MinMarks) {
                                                                setError(`subexam_list.${idx}.eycessS_MinMarks` as any, {
                                                                    type: 'manual',
                                                                    message: rowErrs.eycessS_MinMarks
                                                                });
                                                            }
                                                        }}
                                                        className='text-center'
                                                        placeholder='Enter Min Marks'
                                                        inputMode='numeric'
                                                    />
                                                )}
                                            />
                                            {errors.subexam_list?.[idx]?.eycessS_MinMarks && (
                                                <p className='mt-1 text-[11px] text-red-500'>
                                                    {String(errors.subexam_list[idx].eycessS_MinMarks?.message)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Marks Entry Max */}
                                        <td className='w-28 border p-2'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_MarksEntryMax`}
                                                render={({ field }) => (
                                                    <Input
                                                        type='text'
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            const raw = e.target.value.replace(/\D/g, '');
                                                            handleEntryChange(idx, raw === '' ? '' : raw);
                                                        }}
                                                        onBlur={() => {
                                                            const rowVal = getValues('subexam_list')[idx];
                                                            const rowErrs = validateRowManually(rowVal);
                                                            clearErrors(`subexam_list.${idx}.eycessS_MarksEntryMax` as any);
                                                            if (rowErrs.eycessS_MarksEntryMax) {
                                                                setError(`subexam_list.${idx}.eycessS_MarksEntryMax` as any, {
                                                                    type: 'manual',
                                                                    message: rowErrs.eycessS_MarksEntryMax
                                                                });
                                                            }
                                                        }}
                                                        className='text-center'
                                                        placeholder='Enter Max Entry'
                                                        inputMode='numeric'
                                                    />
                                                )}
                                            />
                                            {errors.subexam_list?.[idx]?.eycessS_MarksEntryMax && (
                                                <p className='mt-1 text-[11px] text-red-500'>
                                                    {String(errors.subexam_list[idx].eycessS_MarksEntryMax?.message)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Grade */}
                                        <td className='w-40 border p-2'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.emgR_Id`}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString() ?? ''}
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            updateRowValue(idx, 'emgR_Id', val);
                                                            clearErrors(`subexam_list.${idx}.emgR_Id` as any);
                                                        }}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Grade' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {gradeList.map((g) => (
                                                                <SelectItem key={g.emgR_Id} value={g.emgR_Id.toString()}>
                                                                    {g.emgR_GradeName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.subexam_list?.[idx]?.emgR_Id && (
                                                <p className='mt-1 text-[11px] text-red-500'>
                                                    {String(errors.subexam_list[idx].emgR_Id?.message)}
                                                </p>
                                            )}
                                        </td>

                                        {/* Exempted */}
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_ExemptedFlg`}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        checked={!!field.value}
                                                        onCheckedChange={(v) => {
                                                            field.onChange(!!v);
                                                            updateRowValue(idx, 'eycessS_ExemptedFlg', !!v);
                                                            if (!v) updateRowValue(idx, 'eycessS_ExemptedPer', '');
                                                        }}
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Exempt % */}
                                        <td className='w-24 border p-2'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_ExemptedPer`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        disabled={!watch(`subexam_list.${idx}.eycessS_ExemptedFlg`)}
                                                        value={field.value ?? ''}
                                                        onChange={(e) => {
                                                            if (/^\d*$/.test(e.target.value)) field.onChange(e.target.value);
                                                        }}
                                                        className='text-center'
                                                        placeholder='%'
                                                        inputMode='numeric'
                                                    />
                                                )}
                                            />
                                        </td>

                                        {/* Marks Flag */}
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_MarksFlg`}
                                                render={({ field }) => (
                                                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                                )}
                                            />
                                        </td>

                                        {/* Grades Flag */}
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_GradesFlg`}
                                                render={({ field }) => (
                                                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                                )}
                                            />
                                        </td>

                                        {/* Apl Result */}
                                        <td className='border p-2 text-center'>
                                            <Controller
                                                control={control}
                                                name={`subexam_list.${idx}.eycessS_AplResultFlg`}
                                                render={({ field }) => (
                                                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                                )}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Buttons */}
                    <div className='z-10 mt-4 flex w-fit justify-end gap-2 border-t bg-white p-2'>
                        <Button type='button' variant='ghost' onClick={() => onClose(subject.ISMS_Id)}>
                            Cancel
                        </Button>
                        <Button type='button' onClick={handleSetOrder} className='w-fit transition-all duration-200 hover:scale-90'>
                            <GitCompareArrows className='h-4 w-4 transition-transform duration-200 group-hover:rotate-90' />
                            Set Order
                        </Button>
                        <Button type='button' className='w-fit' onClick={handleSave}>
                            Save & Close
                        </Button>
                    </div>
                </FormProvider>

                {/* Order Modal */}
                {isOrderDetailsOpen && (
                    <MasterViewDetails
                        isOpen={isOrderDetailsOpen}
                        onClose={closeOrderDetails}
                        data={watch('subexam_list').map((d) => ({ ...d, id: d.emsE_Id }))}
                        isLoading={isOrderloading}
                        isSaving={isOrderSaving}
                        columns={[
                            { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                            { key: 'emsE_SubExamName', label: 'Sub-Exam Name', className: 'text-left' },
                            { key: 'emsE_SubExamCode', label: 'Sub-Exam Code', className: 'text-left' },
                            { key: 'emsE_SubExamOrder', label: 'Sub-Exam Order', className: 'text-left' }
                        ]}
                        onSave={handleOrderSave}
                        tableHeight='500px'
                        title='Set Sub-Exam Order'
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
