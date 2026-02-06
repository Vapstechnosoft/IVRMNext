'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, GitCompareArrows } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
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

const ITEMS_PER_PAGE = 10;

// ----------------------------------
//  Component
// ----------------------------------
export default function SubExamModal({ open, subject, onClose, onSave, schema, gradeList }: SubExamModalProps) {
    const methods = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { subexam_list: [] },
        mode: 'onChange' // Changed to onChange for immediate feedback
    });

    const { control, reset, getValues, setValue, formState, setError, clearErrors, watch, trigger } = methods;
    const { errors } = formState;

    // Use watch instead of useFieldArray for better performance with manual rendering
    const watchedList = useWatch({ control, name: 'subexam_list' }) || [];

    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [isOrderloading, setIsOrderloading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const parentMaxMarks = useMemo(() => Number(subject?.EYCES_MaxMarks ?? 0), [subject]);

    // ----------------------------------
    // Populate initial list
    // ----------------------------------
    useEffect(() => {
        if (!subject) {
            reset({ subexam_list: [] });
            setCurrentPage(1);
            setSearchTerm('');
            return;
        }
        const rawList = subject.list ?? [];

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

        const finalList = shouldSort
            ? [...list].sort((a: any, b: any) => {
                const orderA = Number(a.emsE_SubExamOrder) || 999999;
                const orderB = Number(b.emsE_SubExamOrder) || 999999;
                return orderA - orderB;
            })
            : list;

        reset({ subexam_list: finalList });
        setCurrentPage(1);
        setSearchTerm('');
    }, [subject, reset]);

    // Filtered data (memoized)
    const filteredData = useMemo(() => {
        const allData = watchedList || [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return allData;
        return allData.filter((item) => {
            return (
                (item.emsE_SubExamName ?? '').toString().toLowerCase().includes(term) ||
                (item.emsE_SubExamCode ?? '').toString().toLowerCase().includes(term)
            );
        });
    }, [watchedList, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

    useEffect(() => {
        setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length);
    const paginatedData = useMemo(() => filteredData.slice(startIndex, endIndex), [filteredData, startIndex, endIndex]);

    // Optimized update function
    const updateRowValue = useCallback(
        (idx: number, field: keyof SubExamItem, value: any) => {
            // Update specific field only
            setValue(`subexam_list.${idx}.${field}`, value, { shouldDirty: true, shouldValidate: false });
            clearErrors(`subexam_list.${idx}.${field}`);

            // If checked value changes to true, trigger validation for required fields
            if (field === 'checkedvalue' && value) {
                setTimeout(() => {
                    trigger([
                        `subexam_list.${idx}.eycessS_MaxMarks`,
                        `subexam_list.${idx}.eycessS_MinMarks`,
                        `subexam_list.${idx}.eycessS_MarksEntryMax`,
                        `subexam_list.${idx}.emgR_Id`
                    ]);
                }, 0);
            }
        },
        [setValue, clearErrors, trigger]
    );

    // ----------------------------------
    // Manual Validation Functions
    // ----------------------------------

    // Validate a single row
    const validateRowManually = useCallback(
        (row: SubExamItem) => {
            const rowErrs: Record<string, string> = {};

            const max = row.eycessS_MaxMarks === '' || row.eycessS_MaxMarks === null ? undefined : Number(row.eycessS_MaxMarks);
            const min = row.eycessS_MinMarks === '' || row.eycessS_MinMarks === null ? undefined : Number(row.eycessS_MinMarks);
            const entry =
                row.eycessS_MarksEntryMax === '' || row.eycessS_MarksEntryMax === null
                    ? undefined
                    : Number(row.eycessS_MarksEntryMax);

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
                if (!row.emgR_Id || row.emgR_Id === '') {
                    rowErrs.emgR_Id = 'Grade is required';
                }
            }

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
                // rowErrs.eycessS_MaxMarks = 'Max marks cannot be less than Min marks'; // Optional: Error on both or just one
            }

            // 3) MarksEntry <= Max
            if (entry !== undefined && max !== undefined && entry > max) {
                rowErrs.eycessS_MarksEntryMax = 'Marks entry max cannot be greater than Max marks';
            }

            return rowErrs;
        },
        [parentMaxMarks]
    );

    // Validate all rows before save
    const validateAllBeforeSave = useCallback((): boolean => {
        const all = getValues('subexam_list') ?? [];
        let hasError = false;

        clearErrors();

        all.forEach((row: SubExamItem, idx: number) => {
            const rowErrs = validateRowManually(row);

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
    }, [getValues, clearErrors, validateRowManually, setError]);

    // Real-time validation handlers
    const handleMaxChange = useCallback(
        (idx: number, rawVal: string) => {
            const val = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MaxMarks', val);

            const row = { ...getValues('subexam_list')[idx], eycessS_MaxMarks: val };
            const rowErrs = validateRowManually(row);

            if (rowErrs.eycessS_MaxMarks) {
                setError(`subexam_list.${idx}.eycessS_MaxMarks` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MaxMarks
                });
            } else {
                clearErrors(`subexam_list.${idx}.eycessS_MaxMarks`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleMinChange = useCallback(
        (idx: number, rawVal: string) => {
            const val = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MinMarks', val);

            const row = { ...getValues('subexam_list')[idx], eycessS_MinMarks: val };
            const rowErrs = validateRowManually(row);

            if (rowErrs.eycessS_MinMarks) {
                setError(`subexam_list.${idx}.eycessS_MinMarks` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MinMarks
                });
            } else {
                clearErrors(`subexam_list.${idx}.eycessS_MinMarks`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleEntryChange = useCallback(
        (idx: number, rawVal: string) => {
            const val = rawVal === '' ? '' : Number(rawVal);
            updateRowValue(idx, 'eycessS_MarksEntryMax', val);

            const row = { ...getValues('subexam_list')[idx], eycessS_MarksEntryMax: val };
            const rowErrs = validateRowManually(row);

            if (rowErrs.eycessS_MarksEntryMax) {
                setError(`subexam_list.${idx}.eycessS_MarksEntryMax` as any, {
                    type: 'manual',
                    message: rowErrs.eycessS_MarksEntryMax
                });
            } else {
                clearErrors(`subexam_list.${idx}.eycessS_MarksEntryMax`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );

    const handleGradeChange = useCallback(
        (idx: number, value: string) => {
            updateRowValue(idx, 'emgR_Id', value);

            const row = { ...getValues('subexam_list')[idx], emgR_Id: value };
            const rowErrs = validateRowManually(row);

            if (rowErrs.emgR_Id) {
                setError(`subexam_list.${idx}.emgR_Id` as any, {
                    type: 'manual',
                    message: rowErrs.emgR_Id
                });
            } else {
                clearErrors(`subexam_list.${idx}.emgR_Id`);
            }
        },
        [updateRowValue, getValues, validateRowManually, setError, clearErrors]
    );


    // ----------------------------------
    // Set Order Functions
    // ----------------------------------
    const handleSetOrder = useCallback(() => {
        const currentList = getValues('subexam_list');
        if (!currentList || currentList.length === 0) {
            toast.info('Sub-exams are still loading...');
            return;
        }
        setIsOrderDetailsOpen(true);
        setIsOrderloading(false);
    }, [getValues]);

    const handleOrderSave = useCallback(
        async (updatedData: any) => {
            setIsOrderSaving(true);
            const currentList = getValues('subexam_list') ?? [];

            // Create a lookup map with ALL current values
            const currentMap = new Map();
            currentList.forEach((item) => {
                currentMap.set(item.emsE_Id, { ...item });
            });

            // Build the reordered list preserving ALL original values
            const reorderedList = (updatedData ?? []).map((updatedItem: any, index: number) => {
                const itemId = updatedItem.id || updatedItem.emsE_Id;
                const existingItem = currentMap.get(itemId);

                if (existingItem) {
                    // Keep ALL existing values including grade, only update the order
                    return {
                        ...existingItem,
                        emsE_SubExamOrder: index + 1
                    };
                }

                // If item doesn't exist in current list (shouldn't happen), use updatedItem
                return {
                    ...updatedItem,
                    emsE_Id: itemId,
                    emsE_SubExamOrder: index + 1,
                    // Make sure grade is preserved
                    emgR_Id: updatedItem.emgR_Id || ''
                };
            });

            // Add any items that were not in the updatedData list (just in case)
            const reorderedIds = new Set(reorderedList.map((r: any) => r.emsE_Id));
            const remaining = currentList.filter((x: any) => !reorderedIds.has(x.emsE_Id));

            const finalList = [...reorderedList, ...remaining].sort((a: any, b: any) => {
                const orderA = Number(a.EMSE_SubExamOrder) || Number(a.emsE_SubExamOrder) || 999999;
                const orderB = Number(b.EMSE_SubExamOrder) || Number(b.emsE_SubExamOrder) || 999999;
                return orderA - orderB;
            });

            setValue('subexam_list', finalList, { shouldDirty: true, shouldValidate: false });
            toast.success('Sub-Exam order saved successfully.');
            setIsOrderSaving(false);
            setIsOrderDetailsOpen(false);
        },
        [getValues, setValue]
    );

    const closeOrderDetails = useCallback(() => {
        setIsOrderDetailsOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // ----------------------------------
    // Save Handler
    // ----------------------------------
    const handleSave = useCallback(() => {
        const values = getValues();
        const list = values.subexam_list || [];
        const selected = list.filter((r) => r.checkedvalue);

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
            toast.error(
                `Sum of selected sub-exams (Max: ${totMax}, Min: ${totMin}) must equal subject marks (Max: ${parentMax}, Min: ${parentMin})`
            );
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
            EMSE_SubExamOrder: index + 1,
            EYCESSS_MarksFlg: !!r.eycessS_MarksFlg,
            EYCESSS_GradesFlg: !!r.eycessS_GradesFlg,
            EYCESSS_AplResultFlg: !!r.eycessS_AplResultFlg,
            EYCESSS_MarksEntryMax: Number(r.eycessS_MarksEntryMax) || 0
        }));

        onSave(subject.ISMS_Id, formatted, values.subexam_list);
    }, [getValues, validateAllBeforeSave, subject, onSave]);

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

    if (!subject) return null;

    // ----------------------------------
    // Table UI
    // ----------------------------------
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose(subject.ISMS_Id)}>
            <DialogContent className='max-h-[80vh] w-full min-w-[80vw] overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 z-30 bg-white pt-4 border-b pb-2'>
                    <DialogTitle>{`Map Sub-Exam — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
                </DialogHeader>

                {/* Search & pagination controls (sticky below header) */}
                <div className='sticky top-[86px] z-20 mb-4 flex items-center justify-between bg-white p-2 border-b'>
                    <div className='text-sm text-muted-foreground'>
                        Showing {filteredData.length === 0 ? 0 : startIndex + 1}-{endIndex} of {filteredData.length} items
                    </div>
                    <Input
                        placeholder='Search sub-exam...'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className='w-64'
                    />
                </div>

                <FormProvider {...methods}>
                    <div className='max-h-[55vh] overflow-x-auto overflow-y-auto'>
                        <table className='w-full table-auto border-collapse'>
                            <thead className='bg-slate-50 text-sm'>
                                <tr>
                                    <th className='border p-2'>SLNO</th>
                                    <th className='border p-2'>Select</th>
                                    <th className='border p-2'>Sub-Exam (Code)</th>
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

                                {paginatedData.map((row, i) => {
                                    // Calculate the absolute index in the original list for Form handling
                                    const realIdx = (watchedList || []).findIndex((r) => r.emsE_Id === row.emsE_Id);
                                    // Fallback if not found (shouldn't happen)
                                    const idx = realIdx !== -1 ? realIdx : startIndex + i;

                                    const visibleSerial = startIndex + i + 1;
                                    const isRowChecked = Boolean(row.checkedvalue);
                                    const isRowDisabled = !isRowChecked;

                                    return (
                                        <tr key={row.emsE_Id} className={visibleSerial % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                            <td className='border p-2 text-center'>{visibleSerial}</td>

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
                                                                // Clear errors if unchecked
                                                                if (!v) {
                                                                    clearErrors([
                                                                        `subexam_list.${idx}.eycessS_MaxMarks`,
                                                                        `subexam_list.${idx}.eycessS_MinMarks`,
                                                                        `subexam_list.${idx}.eycessS_MarksEntryMax`,
                                                                        `subexam_list.${idx}.emgR_Id`
                                                                    ] as any);
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </td>

                                            <td className='border p-2 text-left'>
                                                <div className='text-sm'>
                                                    <div className="font-medium">{row.emsE_SubExamName}</div>
                                                    {row.emsE_SubExamCode && (
                                                        <div className="text-xs text-slate-500">{row.emsE_SubExamCode}</div>
                                                    )}
                                                </div>
                                            </td>

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
                                                            disabled={isRowDisabled}
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
                                                            className={`text-center ${errors.subexam_list?.[idx]?.eycessS_MaxMarks ? 'border-red-500' : ''}`}
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
                                                            disabled={isRowDisabled}
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
                                                            className={`text-center ${errors.subexam_list?.[idx]?.eycessS_MinMarks ? 'border-red-500' : ''}`}
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
                                                            disabled={isRowDisabled}
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
                                                            className={`text-center ${errors.subexam_list?.[idx]?.eycessS_MarksEntryMax ? 'border-red-500' : ''}`}
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
                                                            disabled={isRowDisabled}
                                                            onValueChange={(val) => {
                                                                handleGradeChange(idx, val);
                                                            }}>
                                                            <SelectTrigger className={errors.subexam_list?.[idx]?.emgR_Id ? 'border-red-500' : ''}>
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
                                                                if (/^\d*$/.test(e.target.value)) {
                                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_ExemptedPer', val);
                                                                }
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
                                                        <Checkbox
                                                            checked={!!field.value}
                                                            onCheckedChange={(v) => {
                                                                field.onChange(!!v);
                                                                updateRowValue(idx, 'eycessS_MarksFlg', !!v);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </td>

                                            {/* Grades Flag */}
                                            <td className='border p-2 text-center'>
                                                <Controller
                                                    control={control}
                                                    name={`subexam_list.${idx}.eycessS_GradesFlg`}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            checked={!!field.value}
                                                            onCheckedChange={(v) => {
                                                                field.onChange(!!v);
                                                                updateRowValue(idx, 'eycessS_GradesFlg', !!v);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </td>

                                            {/* Apl Result */}
                                            <td className='border p-2 text-center'>
                                                <Controller
                                                    control={control}
                                                    name={`subexam_list.${idx}.eycessS_AplResultFlg`}
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            checked={!!field.value}
                                                            onCheckedChange={(v) => {
                                                                field.onChange(!!v);
                                                                updateRowValue(idx, 'eycessS_AplResultFlg', !!v);
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-end space-x-2 p-4 border-t bg-white">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className="w-8 h-8 p-0"
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronLeft className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className='z-10 mt-auto flex w-fit ml-auto justify-end gap-2 border-t bg-white p-2'>
                        <Button type='button' variant='ghost' onClick={() => onClose(subject.ISMS_Id)}>
                            Cancel
                        </Button>
                        <Button type='button' onClick={handleSetOrder} className='w-fit transition-all duration-200 hover:scale-90' disabled={watchedList.length === 0}>
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
                        data={watchedList.map((d, index) => ({ ...d, id: d.emsE_Id }))}
                        isLoading={isOrderloading}
                        isSaving={isOrderSaving}
                        columns={[
                            { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                            { key: 'emsE_SubExamName', label: 'Sub-Exam Name', className: 'text-left' },
                            { key: 'emsE_SubExamCode', label: 'Sub-Exam Code', className: 'text-left' },
                            { key: 'emsE_SubExamOrder', label: 'Order', className: 'text-left' }
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
