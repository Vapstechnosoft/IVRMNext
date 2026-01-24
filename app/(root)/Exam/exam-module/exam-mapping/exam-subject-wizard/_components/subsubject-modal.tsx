'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { GitCompareArrows } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type SubSubject = {
    emsS_Id: number;
    emsS_SubSubjectName: string;
    emsS_SubSubjectCode?: string;
    checkedvalue?: boolean;
    eycessS_MaxMarks?: number | '';
    eycessS_MinMarks?: number | '';
    eycessS_MarksEntryMax?: number | '';
    EMGR_Id?: string | number;
    eycessS_ExemptedFlg?: boolean;
    eycessS_ExemptedPer?: number | '';
    eycessS_MarksDisplayFlg?: boolean;
    eycessS_GradeDisplayFlg?: boolean;
    eycessS_AplResultFlg?: boolean;
    eycessS_SubSubjectOrder?: number;
};

type SubSubjectFormValues = {
    subsubject_list: SubSubject[];
};

export default function SubSubjectModal({
    open,
    subject,
    onClose,
    onSave,
    schema,
    gradeList
}: {
    open: boolean;
    subject?: any;
    onClose: () => void;
    onSave: (subjectId: number, selectedList: any[], subSubjectList: any[]) => void;
    schema: z.ZodType<any>;
    gradeList: IMasterGrade[];
}) {
    const methods = useForm<SubSubjectFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { subsubject_list: [] },
        mode: 'onChange' // Enable validation on change
    });

    const { control, handleSubmit, reset, getValues, setValue, formState, setError, clearErrors, watch, trigger } = methods;
    const { errors } = formState;

    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [isOrderloading, setIsOrderloading] = useState(true);

    const parentMaxMarks = useMemo(() => Number(subject?.EYCES_MaxMarks ?? 0), [subject]);
    const parentMinMarks = useMemo(() => Number(subject?.EYCES_MinMarks ?? 0), [subject]);

    // Memoized form values
    const currentList = watch('subsubject_list') || [];
    const selectedSubjects = useMemo(() => currentList.filter((r) => r.checkedvalue), [currentList]);

    // Initialize form data
    useEffect(() => {
        if (!subject) {
            reset({ subsubject_list: [] });
            return;
        }

        const rawList = subject.list ?? [];

        // Check if any item has an order set
        const shouldSort = rawList.some((l: any) => Number(l.eycessS_SubSubjectOrder) > 0);

        const mappedList = rawList.map((l: any) => ({
            emsS_Id: l.emsS_Id,
            emsS_SubSubjectName: l.emsS_SubSubjectName,
            emsS_SubSubjectCode: l.emsS_SubSubjectCode,
            checkedvalue: Boolean(l.checkedvalue),
            eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
            eycessS_MinMarks: l.eycessS_MinMarks ?? '',
            eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? '',
            EMGR_Id: l.EMGR_Id ?? '',
            eycessS_ExemptedFlg: l.eycessS_ExemptedFlg,
            eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
            eycessS_MarksDisplayFlg: l.eycessS_MarksFlg,
            eycessS_GradeDisplayFlg: l.eycessS_GradesFlg,
            eycessS_AplResultFlg: l.eycessS_AplResultFlg,
            eycessS_SubSubjectOrder: l.eycessS_SubSubjectOrder ?? 0
        }));

        const finalList = shouldSort
            ? [...mappedList].sort((a, b) => Number(a.eycessS_SubSubjectOrder) - Number(b.eycessS_SubSubjectOrder))
            : mappedList;

        reset({ subsubject_list: finalList });
    }, [subject, reset]);

    // Optimized update function
    const updateRowValue = useCallback(
        (idx: number, field: keyof SubSubject, value: any) => {
            // Update specific field only
            setValue(`subsubject_list.${idx}.${field}`, value, { shouldDirty: true, shouldValidate: false });

            // Clear specific error
            clearErrors(`subsubject_list.${idx}.${field}`);

            // Trigger validation for the specific field
            if (field === 'checkedvalue' && value) {
                // If checking a row, validate required fields immediately
                setTimeout(() => {
                    trigger([
                        `subsubject_list.${idx}.eycessS_MaxMarks`,
                        `subsubject_list.${idx}.eycessS_MinMarks`,
                        `subsubject_list.${idx}.eycessS_MarksEntryMax`,
                        `subsubject_list.${idx}.EMGR_Id`
                    ]);
                }, 0);
            }
        },
        [setValue, clearErrors, trigger]
    );

    // Validation functions
    const validateRowManually = useCallback(
        (row: SubSubject, idx: number) => {
            const rowErrs: Record<string, string> = {};

            const max = row.eycessS_MaxMarks === '' || row.eycessS_MaxMarks === null ? undefined : Number(row.eycessS_MaxMarks);
            const min = row.eycessS_MinMarks === '' || row.eycessS_MinMarks === null ? undefined : Number(row.eycessS_MinMarks);
            const entry =
                row.eycessS_MarksEntryMax === '' || row.eycessS_MarksEntryMax === null ? undefined : Number(row.eycessS_MarksEntryMax);

            // Required fields validation for checked rows
            if (row.checkedvalue) {
                if (max === undefined || max === null) {
                    rowErrs.eycessS_MaxMarks = 'Max marks is required';
                }
                if (min === undefined || min === null) {
                    rowErrs.eycessS_MinMarks = 'Min marks is required';
                }
                if (entry === undefined || entry === null) {
                    rowErrs.eycessS_MarksEntryMax = 'Marks entry max is required';
                }
                if (!row.EMGR_Id || row.EMGR_Id === '') {
                    rowErrs.EMGR_Id = 'Grade is required';
                }
            }

            // Numeric validations (only if values exist)
            if (max !== undefined && max > parentMaxMarks) {
                rowErrs.eycessS_MaxMarks = `Max marks cannot exceed parent subject max (${parentMaxMarks})`;
            }

            if (min !== undefined) {
                if (min > parentMaxMarks) {
                    rowErrs.eycessS_MinMarks = `Min marks cannot exceed parent subject max (${parentMaxMarks})`;
                }
                if (max !== undefined && min > max) {
                    rowErrs.eycessS_MinMarks = 'Min marks cannot be greater than Max marks';
                }
            }

            if (entry !== undefined) {
                if (entry > parentMaxMarks) {
                    rowErrs.eycessS_MarksEntryMax = `Marks entry max cannot exceed parent subject max (${parentMaxMarks})`;
                }
                if (max !== undefined && entry > max) {
                    rowErrs.eycessS_MarksEntryMax = 'Marks entry max cannot be greater than Max marks';
                }
            }

            return rowErrs;
        },
        [parentMaxMarks]
    );

    // Handle field changes with immediate validation
    const handleMaxChange = useCallback(
        (idx: number, rawVal: string) => {
            const val: number | '' = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MaxMarks', val);

            const row = { ...getValues('subsubject_list')[idx], eycessS_MaxMarks: val };
            const rowErrs = validateRowManually(row, idx);

            if (rowErrs.eycessS_MaxMarks) {
                setError(`subsubject_list.${idx}.eycessS_MaxMarks` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MaxMarks
                });
            } else {
                clearErrors(`subsubject_list.${idx}.eycessS_MaxMarks`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleMinChange = useCallback(
        (idx: number, rawVal: string) => {
            const val: number | '' = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MinMarks', val);

            const row = { ...getValues('subsubject_list')[idx], eycessS_MinMarks: val };
            const rowErrs = validateRowManually(row, idx);

            if (rowErrs.eycessS_MinMarks) {
                setError(`subsubject_list.${idx}.eycessS_MinMarks` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MinMarks
                });
            } else {
                clearErrors(`subsubject_list.${idx}.eycessS_MinMarks`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleEntryChange = useCallback(
        (idx: number, rawVal: string) => {
            const val: number | '' = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MarksEntryMax', val);

            const row = { ...getValues('subsubject_list')[idx], eycessS_MarksEntryMax: val };
            const rowErrs = validateRowManually(row, idx);

            if (rowErrs.eycessS_MarksEntryMax) {
                setError(`subsubject_list.${idx}.eycessS_MarksEntryMax` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MarksEntryMax
                });
            } else {
                clearErrors(`subsubject_list.${idx}.eycessS_MarksEntryMax`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleGradeChange = useCallback(
        (idx: number, value: string) => {
            updateRowValue(idx, 'EMGR_Id', value);

            const row = { ...getValues('subsubject_list')[idx], EMGR_Id: value };
            const rowErrs = validateRowManually(row, idx);

            if (rowErrs.EMGR_Id) {
                setError(`subsubject_list.${idx}.EMGR_Id` as any, {
                    type: 'manual',
                    message: rowErrs.EMGR_Id
                });
            } else {
                clearErrors(`subsubject_list.${idx}.EMGR_Id`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleCheckboxChange = useCallback(
        (idx: number, checked: boolean) => {
            updateRowValue(idx, 'checkedvalue', checked);

            // If unchecking, clear any required field errors
            if (!checked) {
                clearErrors([
                    `subsubject_list.${idx}.eycessS_MaxMarks`,
                    `subsubject_list.${idx}.eycessS_MinMarks`,
                    `subsubject_list.${idx}.eycessS_MarksEntryMax`,
                    `subsubject_list.${idx}.EMGR_Id`
                ] as any);
            } else {
                // If checking, validate immediately
                const row = { ...getValues('subsubject_list')[idx], checkedvalue: checked };
                const rowErrs = validateRowManually(row, idx);

                Object.entries(rowErrs).forEach(([field, message]) => {
                    setError(`subsubject_list.${idx}.${field}` as any, {
                        type: 'manual',
                        message
                    });
                });
            }
        },
        [updateRowValue, clearErrors, getValues, validateRowManually, setError]
    );

    // Order handling
    const handleSetOrder = useCallback(() => {
        if (currentList.length === 0) {
            toast.info('Sub-subjects are loading...');
            return;
        }
        setIsOrderDetailsOpen(true);
        setIsOrderloading(false);
    }, [currentList]);

    // Update the handleOrderSave function in your code:

    const handleOrderSave = useCallback(
        async (updatedData: any[]) => {
            setIsOrderSaving(true);
            const currentList = getValues('subsubject_list') ?? [];

            console.log(
                'Before reorder - Current list:',
                currentList.map((item) => ({
                    id: item.emsS_Id,
                    name: item.emsS_SubSubjectName,
                    grade: item.EMGR_Id
                }))
            );

            console.log(
                'Updated data from modal:',
                updatedData.map((item) => ({
                    id: item.id || item.emsS_Id,
                    name: item.emsS_SubSubjectName,
                    grade: item.EMGR_Id
                }))
            );

            // Create a lookup map with ALL current values
            const currentMap = new Map();
            currentList.forEach((item) => {
                currentMap.set(item.emsS_Id, { ...item });
            });

            // Build the reordered list preserving ALL original values
            const reorderedList = updatedData.map((updatedItem: any, index: number) => {
                const itemId = updatedItem.id || updatedItem.emsS_Id;
                const existingItem = currentMap.get(itemId);

                if (existingItem) {
                    // Keep ALL existing values including grade, only update the order
                    return {
                        ...existingItem,
                        eycessS_SubSubjectOrder: index + 1
                    };
                }

                // If item doesn't exist in current list (shouldn't happen), use updatedItem
                // but make sure we have the correct ID
                return {
                    ...updatedItem,
                    emsS_Id: itemId,
                    eycessS_SubSubjectOrder: index + 1,
                    // Make sure grade is preserved
                    EMGR_Id: updatedItem.EMGR_Id || ''
                };
            });

            console.log(
                'After reorder - New list:',
                reorderedList.map((item) => ({
                    id: item.emsS_Id,
                    name: item.emsS_SubSubjectName,
                    grade: item.EMGR_Id
                }))
            );

            setValue('subsubject_list', reorderedList, {
                shouldDirty: true,
                shouldValidate: true
            });

            setIsOrderSaving(false);
            setIsOrderDetailsOpen(false);
            toast.success('Sub-Subjects order saved successfully.');
        },
        [getValues, setValue]
    );

    // Save handler
    const handleSave = useCallback(() => {
        const values = getValues();
        const selected = selectedSubjects;

        // Validate all checked rows
        let hasErrors = false;
        clearErrors();

        currentList.forEach((row, idx) => {
            if (row.checkedvalue) {
                const rowErrs = validateRowManually(row, idx);
                if (Object.keys(rowErrs).length > 0) {
                    hasErrors = true;
                    Object.entries(rowErrs).forEach(([field, message]) => {
                        setError(`subsubject_list.${idx}.${field}` as any, {
                            type: 'manual',
                            message
                        });
                    });
                }
            }
        });

        if (hasErrors) {
            toast.error('Please fix all validation errors before saving.');
            return;
        }

        // Validate totals match parent subject
        if (selected.length > 0) {
            const totMax = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MaxMarks || 0), 0);
            const totMin = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MinMarks || 0), 0);

            if (totMax !== parentMaxMarks || totMin !== parentMinMarks) {
                toast.error(
                    `Sum of selected sub-subjects (Max: ${totMax}, Min: ${totMin}) must equal subject marks (Max: ${parentMaxMarks}, Min: ${parentMinMarks})`
                );
                return;
            }
        }

        // All good, save
        onSave(subject.ISMS_Id, selected, values.subsubject_list);
        onClose();
    }, [
        getValues,
        selectedSubjects,
        currentList,
        validateRowManually,
        clearErrors,
        setError,
        parentMaxMarks,
        parentMinMarks,
        onSave,
        onClose,
        subject
    ]);
    const sortedSubSubjects = useMemo(() => {
        const list = getValues('subsubject_list') ?? [];

        // check if all order values are 0 / null / undefined
        const allZero = list.every((i) => !i.eycessS_SubSubjectOrder || i.eycessS_SubSubjectOrder === 0);

        if (allZero) return list; // keep original order

        // stable sort by order
        return [...list].sort((a, b) => (a.eycessS_SubSubjectOrder ?? 0) - (b.eycessS_SubSubjectOrder ?? 0));
    }, [getValues('subsubject_list')]);

    if (!subject) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-h-[80vh] w-full min-w-[80vw] overflow-x-auto overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Subjects — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <div className='text-muted-foreground text-sm'>
                        Parent Subject: Max={parentMaxMarks}, Min={parentMinMarks}
                    </div>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className='max-h-[55vh] overflow-x-auto overflow-y-auto'>
                            <table className='w-full table-auto border-collapse'>
                                <thead>
                                    <tr className='bg-slate-50 text-sm'>
                                        <th className='border p-2'>SLNO</th>
                                        <th className='border p-2'>Select</th>
                                        <th className='border p-2'>Sub-Subject Name(Code)</th>
                                        <th className='border p-2'>Max Marks</th>
                                        <th className='border p-2'>Min Marks</th>
                                        <th className='border p-2'>Marks Entry Max</th>
                                        <th className='border p-2'>Grade</th>
                                        <th className='border p-2'>Exempted Flag</th>
                                        <th className='border p-2'>Exempted %</th>
                                        <th className='border p-2'>Marks Display</th>
                                        <th className='border p-2'>Grade Display</th>
                                        <th className='border p-2'>Apply Result</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {subject && subject.list === undefined && (
                                        <tr>
                                            <td colSpan={12} className='p-6'>
                                                <div className='space-y-2'>
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <div key={i} className='h-8 w-full animate-pulse rounded bg-slate-200' />
                                                    ))}
                                                </div>
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

                                    {currentList.map((row, idx) => {
                                        const idPrefix = `subsubject-${subject.ISMS_Id}-${row.emsS_Id}`;
                                        const isRowChecked = Boolean(row.checkedvalue);
                                        const isRowDisabled = !isRowChecked;

                                        return (
                                            <tr key={row.emsS_Id ?? idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className='border p-2'>{idx + 1}</td>

                                                {/* Select */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.checkedvalue`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                id={`${idPrefix}-check`}
                                                                checked={!!field.value}
                                                                onCheckedChange={(checked) => {
                                                                    handleCheckboxChange(idx, !!checked);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Name (Code) */}
                                                <td className='border p-2'>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>{row.emsS_SubSubjectName}</div>
                                                        {row.emsS_SubSubjectCode && (
                                                            <div className='text-slate-500 text-xs'>{row.emsS_SubSubjectCode}</div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Max Marks */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_MaxMarks`}
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
                                                                    const rowVal = getValues('subsubject_list')[idx];
                                                                    const rowErrs = validateRowManually(rowVal, idx);
                                                                    if (rowErrs.eycessS_MaxMarks) {
                                                                        setError(`subsubject_list.${idx}.eycessS_MaxMarks` as any, {
                                                                            type: 'manual',
                                                                            message: rowErrs.eycessS_MaxMarks
                                                                        });
                                                                    }
                                                                }}
                                                                inputMode='numeric'
                                                                disabled={isRowDisabled}
                                                                className={
                                                                    errors.subsubject_list?.[idx]?.eycessS_MaxMarks ? 'border-red-500' : ''
                                                                }
                                                            />
                                                        )}
                                                    />
                                                    {errors.subsubject_list?.[idx]?.eycessS_MaxMarks && (
                                                        <p className='mt-1 text-[11px] text-red-500'>
                                                            {String(errors.subsubject_list[idx].eycessS_MaxMarks?.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Min Marks */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_MinMarks`}
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
                                                                    const rowVal = getValues('subsubject_list')[idx];
                                                                    const rowErrs = validateRowManually(rowVal, idx);
                                                                    if (rowErrs.eycessS_MinMarks) {
                                                                        setError(`subsubject_list.${idx}.eycessS_MinMarks` as any, {
                                                                            type: 'manual',
                                                                            message: rowErrs.eycessS_MinMarks
                                                                        });
                                                                    }
                                                                }}
                                                                inputMode='numeric'
                                                                disabled={isRowDisabled}
                                                                className={
                                                                    errors.subsubject_list?.[idx]?.eycessS_MinMarks ? 'border-red-500' : ''
                                                                }
                                                            />
                                                        )}
                                                    />
                                                    {errors.subsubject_list?.[idx]?.eycessS_MinMarks && (
                                                        <p className='mt-1 text-[11px] text-red-500'>
                                                            {String(errors.subsubject_list[idx].eycessS_MinMarks?.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Marks Entry Max */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_MarksEntryMax`}
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
                                                                    const rowVal = getValues('subsubject_list')[idx];
                                                                    const rowErrs = validateRowManually(rowVal, idx);
                                                                    if (rowErrs.eycessS_MarksEntryMax) {
                                                                        setError(`subsubject_list.${idx}.eycessS_MarksEntryMax` as any, {
                                                                            type: 'manual',
                                                                            message: rowErrs.eycessS_MarksEntryMax
                                                                        });
                                                                    }
                                                                }}
                                                                inputMode='numeric'
                                                                disabled={isRowDisabled}
                                                                className={
                                                                    errors.subsubject_list?.[idx]?.eycessS_MarksEntryMax
                                                                        ? 'border-red-500'
                                                                        : ''
                                                                }
                                                            />
                                                        )}
                                                    />
                                                    {errors.subsubject_list?.[idx]?.eycessS_MarksEntryMax && (
                                                        <p className='mt-1 text-[11px] text-red-500'>
                                                            {String(errors.subsubject_list[idx].eycessS_MarksEntryMax?.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Grade */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.EMGR_Id`}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value?.toString() ?? ''}
                                                                onValueChange={(val) => handleGradeChange(idx, val)}
                                                                disabled={isRowDisabled}>
                                                                <SelectTrigger
                                                                    className={
                                                                        errors.subsubject_list?.[idx]?.EMGR_Id ? 'border-red-500' : ''
                                                                    }>
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
                                                    {errors.subsubject_list?.[idx]?.EMGR_Id && (
                                                        <p className='mt-1 text-[11px] text-red-500'>
                                                            {String(errors.subsubject_list[idx].EMGR_Id?.message)}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Exempted Flag */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_ExemptedFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_ExemptedFlg', !!v);
                                                                    if (!v) updateRowValue(idx, 'eycessS_ExemptedPer', '');
                                                                }}
                                                                disabled={isRowDisabled}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Exempted Percentage */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_ExemptedPer`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type='text'
                                                                disabled={
                                                                    !getValues(`subsubject_list.${idx}.eycessS_ExemptedFlg`) ||
                                                                    isRowDisabled
                                                                }
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const raw = e.target.value.replace(/\D/g, '');
                                                                    const val = raw === '' ? '' : Number(raw);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_ExemptedPer', val);
                                                                }}
                                                                inputMode='numeric'
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Marks Display */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_MarksDisplayFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_MarksDisplayFlg', !!v);
                                                                }}
                                                                disabled={isRowDisabled}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Grade Display */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_GradeDisplayFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_GradeDisplayFlg', !!v);
                                                                }}
                                                                disabled={isRowDisabled}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Apply Result */}
                                                <td className='border p-2 text-center'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.eycessS_AplResultFlg`}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                checked={!!field.value}
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'eycessS_AplResultFlg', !!v);
                                                                }}
                                                                disabled={isRowDisabled}
                                                            />
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='flex w-fit justify-end gap-2 border-t bg-white pt-4'>
                            <Button className='w-fit' type='button' variant='ghost' onClick={onClose}>
                                Cancel
                            </Button>

                            <Button
                                type='button'
                                onClick={handleSetOrder}
                                className='w-fit transition-all duration-200 hover:scale-90'
                                disabled={currentList.length === 0}>
                                <GitCompareArrows className='mr-2 h-4 w-4' />
                                Set Order
                            </Button>

                            <Button className='w-fit' type='button' onClick={handleSave}>
                                Save & Close
                            </Button>
                        </div>
                    </form>
                </FormProvider>

                {isOrderDetailsOpen && (
                    <MasterViewDetails
                        isOpen={isOrderDetailsOpen}
                        onClose={() => setIsOrderDetailsOpen(false)}
                        data={currentList.map((d, index) => ({
                            ...d,
                            id: d.emsS_Id,
                            order: d.eycessS_SubSubjectOrder ?? index + 1
                        }))}
                        isLoading={isOrderloading}
                        isSaving={isOrderSaving}
                        columns={[
                            { key: 'id', label: 'ID', className: 'text-center w-12' },
                            { key: 'emsS_SubSubjectName', label: 'Sub-Subject Name', className: 'text-left' },
                            { key: 'emsS_SubSubjectCode', label: 'Sub-Subject Code', className: 'text-left' },
                            { key: 'order', label: 'Current Order', className: 'text-left' }
                        ]}
                        onSave={handleOrderSave}
                        tableHeight='500px'
                        title='Set Sub-Subject Order'
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
