'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
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

    useEffect(() => {
        if (!subject) {
            reset({ subsubject_list: [] });
            return;
        }
        console.log(subject);
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
            eycessS_AplResultFlg: !!l.eycessS_AplResultFlg
        }));

        reset({ subsubject_list: list });
    }, [subject, reset]);

    const updateRowValue = (idx: number, field: keyof SubSubject, value: any) => {
        const list = getValues('subsubject_list').map((r, i) => (i === idx ? { ...r, [field]: value } : r));
        setValue('subsubject_list', list, { shouldDirty: true, shouldValidate: true });
    };

    if (!subject) return null;

    const onSubmit = (values: SubSubjectFormValues) => {
        const selected = values.subsubject_list.filter((r) => r.checkedvalue);
        const parentMax = Number(subject.ECYSES_MaxMarks ?? 0);
        const parentMin = Number(subject.ECYSES_MinMarks ?? 0);
        const totMax = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MaxMarks || 0), 0);
        const totMin = selected.reduce((acc, cur) => acc + Number(cur.eycessS_MinMarks || 0), 0);

        if (selected.length > 0 && (totMax !== parentMax || totMin !== parentMin)) {
            alert('Sum of selected sub-subjects (max/min) must equal subject max/min marks');
            return;
        }

        onSave(subject.ismS_Id, selected);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className='max-h-[70vh] w-full min-w-[80vw] overflow-x-auto overflow-y-auto pt-0 sm:overflow-x-hidden'>
                <DialogHeader className='sticky top-0 bg-white pt-4'>
                    <DialogTitle>{`Map Sub-Subjects — ${subject.ISMS_SubjectName}`}</DialogTitle>
                    <DialogDescription>Fill details and save mapping</DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='overflow-x-auto'>
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
                                    {getValues('subsubject_list')?.map((row, idx) => {
                                        const idPrefix = `subsubject-${subject.ismS_Id}-${row.emsS_Id}`;
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
                                                                type='number'
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_MaxMarks', val);
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
                                                                type='number'
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_MinMarks', val);
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
                                                                type='number'
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_MarksEntryMax', val);
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
                                                                type='number'
                                                                disabled={!getValues(`subsubject_list.${idx}.eycessS_ExemptedFlg`)}
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value === '' ? '' : Number(e.target.value);
                                                                    field.onChange(val);
                                                                    updateRowValue(idx, 'eycessS_ExemptedPer', val);
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
                            <Button className='w-fit' type='submit'>
                                Save & Close
                            </Button>
                            <Button className='w-fit' type='button' variant='ghost' onClick={onClose}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
