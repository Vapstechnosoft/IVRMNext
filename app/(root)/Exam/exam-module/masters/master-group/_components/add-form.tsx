'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { useMasterSubjectGroup } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectGroupSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubjectGroup, getAllMasterSubjectDetails } from '@/server/exam/exam-module/masters/subject-group';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import { MasterSubjectGroupDetailsColumns } from './subject-group-details-columns';

type FormFields = z.infer<typeof masterSubjectGroupSchema.addOrUpdate>;

interface MasterSubjectGroupFormProps {
    onSuccess?: () => void;
    className?: string;
    initialData?: IMasterSubjectGroup & { subjects?: IMasterSubjectGroupDetails[] };
}

export default function MasterSubjectGroupForm({ onSuccess, className = '', initialData }: MasterSubjectGroupFormProps) {
    const [allSubjects, setAllSubjects] = useState<IMasterSubjectGroupDetails[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<IMasterSubjectGroupDetails[]>([]);
    const [isSubjectsEnabled, setIsSubjectsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { refetchAll } = useMasterSubjectGroup();

    // -------------------------
    // FETCH SUBJECTS
    // -------------------------
    useEffect(() => {
        async function fetchSubjects() {
            try {
                setIsLoading(true);
                const res = await getAllMasterSubjectDetails();
                const data: IMasterSubjectGroupDetails[] = Array.isArray(res?.data) ? res.data : [];
                setAllSubjects(data);

                if (initialData?.subjects?.length) {
                    const selected = data.filter((s) => initialData.subjects?.some((init) => init.ismS_Id === s.ismS_Id));
                    setSelectedSubjects(selected);
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch subjects');
            } finally {
                setIsLoading(false);
            }
        }
        fetchSubjects();
    }, [initialData]);

    // -------------------------
    // FORM SETUP
    // -------------------------
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: initialData
            ? {
                  emG_GroupName: initialData.emG_GroupName,
                  emG_TotSubjects: initialData.emG_TotSubjects,
                  emG_MaxAplSubjects: initialData.emG_MaxAplSubjects,
                  emG_MinAplSubjects: initialData.emG_MinAplSubjects,
                  emG_BestOff: initialData.emG_BestOff,
                  subject_list: initialData.subjects?.map((s) => ({ ismS_Id: s.ismS_Id })) || []
              }
            : {
                  emG_GroupName: '',
                  emG_TotSubjects: 1,
                  emG_MaxAplSubjects: 1,
                  emG_MinAplSubjects: 1,
                  emG_BestOff: 0,
                  subject_list: []
              }
    });

    const maxApplicableSubjects = watch('emG_MaxAplSubjects');
    const minApplicableSubjects = watch('emG_MinAplSubjects');

    useEffect(() => {
        const valid = maxApplicableSubjects > 0 && minApplicableSubjects > 0 && minApplicableSubjects <= maxApplicableSubjects;
        setIsSubjectsEnabled(valid);
    }, [maxApplicableSubjects, minApplicableSubjects]);

    const tableProps = useDataTableProps({
        data: allSubjects,
        total: allSubjects.length,
        pageIndex: 0,
        pageSize: 10
    });

    // -------------------------
    // ROW SELECTION HANDLER
    // -------------------------
    const handleSelectedSubjectsChange = (selectedRows: IMasterSubjectGroupDetails[]) => {
        setSelectedSubjects(selectedRows);
    };

    // -------------------------
    // SUBMIT HANDLER
    // -------------------------
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!isSubjectsEnabled) {
            toast.error('Enter valid Min/Max subjects before selecting subjects');
            return;
        }

        if (selectedSubjects.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        const payload = {
            emG_Id: initialData?.emG_Id ?? 0,
            mI_Id: 30, // hardcoded or pass from context
            emG_GroupName: data.emG_GroupName,
            emG_TotSubjects: data.emG_TotSubjects,
            emG_MaxAplSubjects: data.emG_MaxAplSubjects,
            emG_MinAplSubjects: data.emG_MinAplSubjects,
            emG_BestOff: data.emG_BestOff,
            subject_list: selectedSubjects.map((s) => ({ ismS_Id: s.ismS_Id }))
        };

        try {
            const res = await addOrUpdateMasterSubjectGroup(payload);
            if (res.success) {
                toast.success(res.message || 'Saved successfully.');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to save.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong.');
        }
    };

    // -------------------------
    // RENDER
    // -------------------------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Group Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Group Name' required {...register('emG_GroupName')} error={errors.emG_GroupName?.message} />

                <Controller
                    name='emG_TotSubjects'
                    control={control}
                    render={({ field }) => (
                        <InputNumber
                            label='Total Subjects'
                            required
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            minValue={1}
                            step={1}
                        />
                    )}
                />
                {errors.emG_TotSubjects && <FormError>{errors.emG_TotSubjects.message}</FormError>}

                <Controller
                    name='emG_MaxAplSubjects'
                    control={control}
                    render={({ field }) => (
                        <InputNumber
                            label='Max Applicable Subjects'
                            required
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            minValue={1}
                            step={1}
                        />
                    )}
                />
                {errors.emG_MaxAplSubjects && <FormError>{errors.emG_MaxAplSubjects.message}</FormError>}

                <Controller
                    name='emG_MinAplSubjects'
                    control={control}
                    render={({ field }) => (
                        <InputNumber
                            label='Min Applicable Subjects'
                            required
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            minValue={1}
                            step={1}
                        />
                    )}
                />
                {errors.emG_MinAplSubjects && <FormError>{errors.emG_MinAplSubjects.message}</FormError>}

                <Controller
                    name='emG_BestOff'
                    control={control}
                    render={({ field }) => (
                        <InputNumber
                            label='Best Off Subjects'
                            required
                            value={field.value ?? 0}
                            onChange={field.onChange}
                            minValue={0}
                            step={1}
                        />
                    )}
                />
                {errors.emG_BestOff && <FormError>{errors.emG_BestOff.message}</FormError>}
            </div>

            {/* Subjects Table */}
            <CollapsibleSection title='Select Subjects' defaultOpen>
                <GenericDataTable
                    {...tableProps}
                    columns={MasterSubjectGroupDetailsColumns}
                    maxSelectableRows={watch('emG_TotSubjects')}
                    isLoading={isLoading}
                    noDataTitle='No Subjects Found'
                    noDataDescription='Please add subjects first.'
                    onRowSelectionChange={handleSelectedSubjectsChange}
                />
            </CollapsibleSection>

            {/* Actions */}
            <div className='flex justify-end gap-2'>
                <Button type='button' variant='outline' onClick={() => window.location.reload()}>
                    Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Saving...'>
                    Save
                </Button>
            </div>
        </form>
    );
}
