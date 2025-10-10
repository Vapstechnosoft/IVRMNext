'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useMasterGetAllSubjectGroupDetails, useMasterSubjectGroupDetails } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectGroupSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubjectGroup } from '@/server/exam/exam-module/masters/subject-group';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { MasterSubjectGroupDetailsColumns } from './subject-group-details-columns';

type FormFields = z.infer<typeof masterSubjectGroupSchema>;

interface MasterSubjectGroupUpdateFormProps {
    initialData: IMasterSubjectGroup;
    onSuccess?: () => void;
    className?: string;
}

export default function MasterSubjectGroupUpdateForm({ initialData, onSuccess, className = '' }: MasterSubjectGroupUpdateFormProps) {
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

    // -------------------------
    // FETCH ALL SUBJECTS
    // -------------------------

    const { data: groupSubjectsResponse } = useMasterSubjectGroupDetails(30, initialData.ex_Id);
    const groupSubjects: IMasterSubjectGroupDetails[] = groupSubjectsResponse?.data || [];
    // FETCH SELECTED SUBJECTS FOR THIS GROUP
    // -------------------------
    const { data: allSubjectsResponce, isLoading: loadingAllSubjects } = useMasterGetAllSubjectGroupDetails();
    const _AllSubjects: IMasterSubjectGroupDetails[] = allSubjectsResponce?.data || [];
    // -------------------------
    // PRESELECT SUBJECTS
    // -------------------------
    useEffect(() => {
        if (groupSubjects?.length) {
            const ids = groupSubjects.map((s) => s.ex_Id);
            setSelectedSubjects(ids);
        }
    }, [groupSubjects]);

    // -------------------------
    // FORM INITIALIZATION
    // -------------------------
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema),
        mode: 'onChange',
        defaultValues: {
            ex_GroupName: initialData?.ex_GroupName || '',
            ex_MaxApplicapleSubjects: initialData?.ex_MaxApplicapleSubjects || 1,
            ex_MinApplicableSubjects: initialData?.ex_MinApplicableSubjects || 1,
            ex_BestOffSubjects: initialData?.ex_BestOffSubjects || 0,
            subjects: []
        }
    });

    const maxApplicableSubjects = watch('ex_MaxApplicapleSubjects');
    const minApplicableSubjects = watch('ex_MinApplicableSubjects');

    // -------------------------
    // ENABLE SELECTION BASED ON MIN/MAX
    // -------------------------
    const isSubjectsEnabled = minApplicableSubjects > 0 && maxApplicableSubjects >= minApplicableSubjects;

    // -------------------------
    // TABLE PROPS
    // -------------------------
    const tableProps = useDataTableProps({
        data: _AllSubjects.map((s) => ({
            ...s,
            selected: selectedSubjects.includes(s.ex_Id)
        })),
        total: _AllSubjects.length,
        pageIndex: 0,
        pageSize: 10
    });

    // -------------------------
    // COLUMNS WITH CHECKBOXES
    // -------------------------
    const columns = [...MasterSubjectGroupDetailsColumns];

    // -------------------------
    // SUBMIT HANDLER
    // -------------------------
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!isSubjectsEnabled) {
            toast.error('Please enter valid Min/Max subjects before saving');
            return;
        }
        if (selectedSubjects.length < minApplicableSubjects) {
            toast.error(`Please select at least ${minApplicableSubjects} subjects`);
            return;
        }

        const payload = {
            ...data,
            ex_GroupId: initialData.ex_Id,
            subjects: _AllSubjects.map((s) => ({
                ...s,
                selected: selectedSubjects.includes(s.ex_Id)
            }))
        };

        try {
            const res = await addOrUpdateMasterSubjectGroup(payload);
            if (res.success) {
                toast.success('Group updated successfully');
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to update group');
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // -------------------------
    // JSX
    // -------------------------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Group Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Group Name' required {...register('ex_GroupName')} error={errors.ex_GroupName?.message} />
                <div className='grid grid-cols-2 gap-2'>
                    <InputText
                        label='Max Applicable Subjects'
                        type='number'
                        required
                        {...register('ex_MaxApplicapleSubjects', { valueAsNumber: true })}
                        error={errors.ex_MaxApplicapleSubjects?.message}
                    />
                    <InputText
                        label='Min Applicable Subjects'
                        type='number'
                        required
                        {...register('ex_MinApplicableSubjects', { valueAsNumber: true })}
                        error={errors.ex_MinApplicableSubjects?.message}
                    />
                    <InputText
                        label='Best Off Subjects'
                        type='number'
                        required
                        {...register('ex_BestOffSubjects', { valueAsNumber: true })}
                        error={errors.ex_BestOffSubjects?.message}
                    />
                </div>
            </div>

            {/* Subjects Table */}
            <CollapsibleSection title='Select Subjects' defaultOpen>
                <GenericDataTable
                    {...tableProps}
                    columns={columns}
                    isLoading={loadingAllSubjects || !_AllSubjects}
                    noDataTitle='No Subjects Found'
                    noDataDescription='Please add subjects first.'
                />
            </CollapsibleSection>

            {/* Actions */}
            <div className='flex justify-end gap-2'>
                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Updating...'>
                    Update
                </Button>
            </div>
        </form>
    );
}
