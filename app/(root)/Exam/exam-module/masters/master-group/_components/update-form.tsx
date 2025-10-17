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

type FormFields = z.infer<typeof masterSubjectGroupSchema.addOrUpdate>;

interface MasterSubjectGroupUpdateFormProps {
    initialData: IMasterSubjectGroup;
    onSuccess?: () => void;
    className?: string;
}

export default function MasterSubjectGroupUpdateForm({ initialData, onSuccess, className = '' }: MasterSubjectGroupUpdateFormProps) {
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [allSubjects, setAllSubjects] = useState<IMasterSubjectGroupDetails[]>([]);

    // Fetch group-specific subjects
    const { data: groupSubjectsResponse } = useMasterSubjectGroupDetails(initialData.emG_Id);

    // Fetch all available subjects
    const { data: allSubjectsResponse, isLoading: loadingAllSubjects } = useMasterGetAllSubjectGroupDetails();

    // Normalize API data once
    useEffect(() => {
        const normalizedAllSubjects = normalizeSubjects(allSubjectsResponse?.data);
        const normalizedGroupSubjects = normalizeSubjects(groupSubjectsResponse?.data);

        setAllSubjects(normalizedAllSubjects);

        const preSelectedIds = normalizedGroupSubjects.map((s) => s.ismS_Id ?? 0).filter((id) => id > 0);

        setSelectedSubjects(preSelectedIds);

        console.log('All Subjects:', normalizedAllSubjects);
        console.log('Group Subjects:', normalizedGroupSubjects);
    }, [allSubjectsResponse, groupSubjectsResponse]);
    // Initialize form
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema.addOrUpdate),
        mode: 'onChange',
        defaultValues: {
            emG_Id: initialData?.emG_Id || 0,
            mI_Id: 30,
            emG_GroupName: initialData?.emG_GroupName || '',
            emG_TotSubjects: initialData?.emG_TotSubjects || 0,
            emG_MaxAplSubjects: initialData?.emG_MaxAplSubjects || 1,
            emG_MinAplSubjects: initialData?.emG_MinAplSubjects || 1,
            emG_BestOff: initialData?.emG_BestOff || 0,
            subject_list: []
        }
    });

    const maxSubjects = watch('emG_MaxAplSubjects');
    const minSubjects = watch('emG_MinAplSubjects');
    const isSubjectsEnabled = minSubjects > 0 && maxSubjects >= minSubjects;

    // Columns
    const columns = [...MasterSubjectGroupDetailsColumns];

    // Prepare table props
    const tableProps = useDataTableProps({
        data: allSubjects.map((s) => ({
            ...s,
            selected: s.ismS_Id !== undefined && selectedSubjects.includes(s.ismS_Id)
        })),
        total: allSubjects.length
    });

    // Submit form
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!isSubjectsEnabled) {
            toast.error('Please enter valid Min/Max subjects before saving');
            return;
        }

        if (selectedSubjects.length < minSubjects) {
            toast.error(`Please select at least ${minSubjects} subjects`);
            return;
        }

        const payload = {
            ...data,
            mI_Id: 30,
            subject_list: allSubjects
                .filter((s) => s.ismS_Id !== undefined && selectedSubjects.includes(s.ismS_Id))
                .map((s) => ({
                    ismS_Id: s.ismS_Id,
                    ismS_SubjectName: s.ismS_SubjectName
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Group Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Group Name' required {...register('emG_GroupName')} error={errors.emG_GroupName?.message} />
                <InputText
                    label='Total Subjects'
                    type='number'
                    required
                    {...register('emG_TotSubjects', { valueAsNumber: true })}
                    error={errors.emG_TotSubjects?.message}
                />
                <InputText
                    label='Max Applicable Subjects'
                    type='number'
                    required
                    {...register('emG_MaxAplSubjects', { valueAsNumber: true })}
                    error={errors.emG_MaxAplSubjects?.message}
                />
                <InputText
                    label='Min Applicable Subjects'
                    type='number'
                    required
                    {...register('emG_MinAplSubjects', { valueAsNumber: true })}
                    error={errors.emG_MinAplSubjects?.message}
                />
                <InputText
                    label='Best Off Subjects'
                    type='number'
                    required
                    {...register('emG_BestOff', { valueAsNumber: true })}
                    error={errors.emG_BestOff?.message}
                />
            </div>

            {/* Subjects Table */}
            <CollapsibleSection title='Select Subjects' defaultOpen>
                <GenericDataTable
                    {...tableProps}
                    columns={columns}
                    isLoading={loadingAllSubjects || !allSubjects.length}
                    noDataTitle='No Subjects Found'
                    noDataDescription='Please add subjects first.'
                    maxSelectableRows={maxSubjects}
                    onRowSelectionChange={(rows) => {
                        const ids = rows.map((r: IMasterSubjectGroupDetails) => r.ismS_Id ?? 0).filter((id) => id > 0);
                        setSelectedSubjects(ids);
                    }}
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

function normalizeSubjects(data: any): IMasterSubjectGroupDetails[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ('$values' in data && Array.isArray(data.$values)) return data.$values;
    return [];
}
