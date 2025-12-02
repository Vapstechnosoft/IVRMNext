'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { List } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    EMGR_Id?: string;
    eycessS_ExemptedFlg?: boolean;
    eycessS_ExemptedPer?: number | '';
    eycessS_MarksDisplayFlg?: boolean;
    eycessS_GradeDisplayFlg?: boolean;
    eycessS_AplResultFlg?: boolean;
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
    onSave: (subjectId: number, selectedList: any[]) => void;
    schema: z.ZodType<any>;
    gradeList: IMasterGrade[];
}) {
    const methods = useForm<SubSubjectFormValues>({
        resolver: zodResolver(schema),
        defaultValues: { subsubject_list: [] }
    });

    const { control, handleSubmit, reset, getValues, setValue, formState } = methods;
    const { errors } = formState;
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [isOrderloading, setIsOrderloading] = useState(true);
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    useEffect(() => {
        if (!subject) {
            reset({ subsubject_list: [] });
            return;
        }
        const list = (subject.list ?? []).map((l: any) => ({
            emsS_Id: l.emsS_Id,
            emsS_SubSubjectName: l.emsS_SubSubjectName,
            emsS_SubSubjectCode: l.emsS_SubSubjectCode,
            checkedvalue: Boolean(l.checkedvalue),
            eycessS_MaxMarks: l.eycessS_MaxMarks ?? '',
            eycessS_MinMarks: l.eycessS_MinMarks ?? '',
            eycessS_MarksEntryMax: l.eycessS_MarksEntryMax ?? '',
            EMGR_Id: l.EMGR_Id ?? '',
            eycessS_ExemptedFlg: !!l.eycessS_ExemptedFlg,
            eycessS_ExemptedPer: l.eycessS_ExemptedPer ?? '',
            eycessS_MarksDisplayFlg: !!l.eycessS_MarksDisplayFlg,
            eycessS_GradeDisplayFlg: !!l.eycessS_GradeDisplayFlg,
            eycessS_AplResultFlg: !!l.eycessS_AplResultFlg,
            eycessS_SubSubjectOrder: l.emsS_Order
        }));
        reset({ subsubject_list: list });
    }, [subject, reset]);

    const updateRowValue = (idx: number, field: keyof SubSubject, value: any) => {
        const list = getValues('subsubject_list').map((r, i) => (i === idx ? { ...r, [field]: value } : r));
        setValue('subsubject_list', list, { shouldDirty: true, shouldValidate: true });
    };

    if (!subject) return null;
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
    const closeOrderDetails = () => {
        setIsOrderDetailsOpen(false);
        scrollToTop();
    };

    const handleSetOrder = async () => {
        try {
            if (methods.watch('subsubject_list').length === 0) {
                toast.info('subsubjects are loading...');
            }
            setIsOrderDetailsOpen(true);
        } catch (error: any) {
            setIsOrderloading(false);
        } finally {
            setIsOrderloading(false);
        }
    };

    // Save reordered exams
    const handleOrderSave = async (updatedData: any) => {
        setIsOrderSaving(true);

        // Get current form list to preserve full original item shape
        const currentList = getValues('subsubject_list') ?? [];

        // updatedData likely contains items with `id` (from MasterViewDetails),
        // so we map back to original items by matching emsS_Id or id.
        const reorderedList = (updatedData ?? []).map((item: any, index: number) => {
            const matchId = item.id ?? item.emsS_Id ?? item.EmsS_Id;
            const original = currentList.find((x: any) => x.emsS_Id === matchId) ?? item;

            return {
                ...original,
                eycessS_SubSubjectOrder: index + 1 // ✅ Update order here
            };
        });

        // If the master view returned only IDs (or partial items), ensure we also keep any originals that were not included:
        // Merge any originals that are missing in reorderedList (append at end with their existing order)
        const reorderedIds = new Set(reorderedList.map((r: any) => r.emsS_Id));
        const remaining = currentList.filter((x: any) => !reorderedIds.has(x.emsS_Id));
        const finalList = [...reorderedList, ...remaining];

        // Optionally sort by the new order so UI is consistent
        finalList.sort((a: any, b: any) => {
            const aOrder = Number(a.eycessS_SubSubjectOrder ?? 0);
            const bOrder = Number(b.eycessS_SubSubjectOrder ?? 0);
            return aOrder - bOrder;
        });

        setValue('subsubject_list', finalList, {
            shouldDirty: true,
            shouldValidate: true
        });
        setIsOrderSaving(false);
        setIsOrderDetailsOpen(false);
        toast.info('Sub-Subjects order saved successfully.');
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-h-[80vh] w-full min-w-[80vw] overflow-x-auto overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Subjects — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
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
                                                {renderSkeletonTable()}
                                            </td>
                                        </tr>
                                    )}

                                    {/* ✅ No records found */}
                                    {subject?.list?.length === 0 && (
                                        <tr>
                                            <td colSpan={12} className='py-6 text-center text-muted-foreground text-sm'>
                                                No records found.
                                            </td>
                                        </tr>
                                    )}
                                    {getValues('subsubject_list')?.map((row, idx) => {
                                        const idPrefix = `subsubject-${subject.ISMS_Id}-${row.emsS_Id}`;
                                        const rowErrors: any = errors.subsubject_list?.[idx];
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
                                                                onCheckedChange={(v) => {
                                                                    field.onChange(!!v);
                                                                    updateRowValue(idx, 'checkedvalue', !!v);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Name (Code) */}
                                                <td className='border p-2'>
                                                    <div className='text-sm'>
                                                        <div className='font-medium'>{row.emsS_SubSubjectName}</div>
                                                        <div className='text-slate-500 text-xs'>{row.emsS_SubSubjectCode ?? ''}</div>
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
                                                                    if (/^\d*$/.test(e.target.value))
                                                                        field.onChange(Number(e.target.value) || '');
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_MaxMarks && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_MaxMarks.message)}
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
                                                                    if (/^\d*$/.test(e.target.value))
                                                                        field.onChange(Number(e.target.value) || '');
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_MinMarks && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_MinMarks.message)}
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
                                                                    if (/^\d*$/.test(e.target.value)) {
                                                                        const val = Number(e.target.value) || '';
                                                                        field.onChange(val);
                                                                        updateRowValue(idx, 'eycessS_MarksEntryMax', val);
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </td>

                                                {/* Grade */}
                                                <td className='border p-2'>
                                                    <Controller
                                                        control={control}
                                                        name={`subsubject_list.${idx}.EMGR_Id`}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ?? ''}
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'EMGR_Id', val);
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
                                                                disabled={!getValues(`subsubject_list.${idx}.eycessS_ExemptedFlg`)}
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    if (/^\d*$/.test(e.target.value)) {
                                                                        const val = Number(e.target.value) || '';
                                                                        field.onChange(val);
                                                                        updateRowValue(idx, 'eycessS_ExemptedPer', val);
                                                                    }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {rowErrors?.eycessS_ExemptedPer && (
                                                        <p className='text-[11px] text-red-500'>
                                                            {String(rowErrors.eycessS_ExemptedPer.message)}
                                                        </p>
                                                    )}
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

                        <div className='flex w-fit justify-end gap-2 border-t bg-white pt-2'>
                            <Button className='w-fit' type='button' variant='ghost' onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                variant='secondary'
                                onClick={handleSetOrder}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-3'>
                                <div className='flex items-center'>
                                    <List className='mr-2 h-4 w-4' />
                                    Set Order
                                </div>
                            </Button>
                            <Button
                                className='w-fit'
                                type='button'
                                onClick={() => {
                                    const values = getValues();
                                    const selected = values.subsubject_list.filter((r) => r.checkedvalue);

                                    const parentMax = Number(subject.EYCES_MaxMarks ?? 0);
                                    const parentMin = Number(subject.EYCES_MinMarks ?? 0);
                                    const totMax = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MaxMarks || 0), 0);
                                    const totMin = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MinMarks || 0), 0);

                                    if (selected.length > 0 && (totMax !== parentMax || totMin !== parentMin)) {
                                        toast.error('Sum of selected sub-subjects (max/min) must equal subject max/min marks');
                                        return;
                                    }

                                    onSave(subject.ISMS_Id, selected);
                                    onClose();
                                }}>
                                Save & Close
                            </Button>
                        </div>
                    </form>
                </FormProvider>
                {isOrderDetailsOpen && (
                    <MasterViewDetails
                        isOpen={isOrderDetailsOpen}
                        onClose={closeOrderDetails}
                        data={methods.watch('subsubject_list').map((d) => ({ ...d, id: d.emsS_Id }))}
                        isLoading={isOrderloading}
                        isSaving={isOrderSaving}
                        columns={[
                            { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                            { key: 'emsS_SubSubjectName', label: 'Sub-Subject Name', className: 'text-left' },
                            { key: 'emsS_SubSubjectCode', label: 'Sub-Subject Code', className: 'text-left' },
                            { key: 'eycessS_SubSubjectOrder', label: 'Sub-Subject Order', className: 'text-left' }
                        ]}
                        onSave={handleOrderSave}
                        tableHeight='500px'
                        title='Set Master Subject Order'
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
