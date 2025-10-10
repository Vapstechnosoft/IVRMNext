'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { addOrUpdateMasterSubjectGroup, getAllMasterSubjectDetails } from '@/server/exam/exam-module/masters/subject-group';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { MasterSubjectGroupDetailsColumns } from './subject-group-details-columns';

// -------------------------
// ZOD SCHEMAS
// -------------------------
export const subjectGroupDetailSchema = z.object({
    ex_Id: z.number(),
    ex_SubjectName: z.string().nonempty({ message: 'Subject Name is required' }).max(100),
    ex_SubjectCode: z.string().nonempty({ message: 'Subject Code is required' }).max(20),
    selected: z.boolean().optional()
});

export const masterSubjectGroupSchema = z.object({
    ex_GroupName: z.string().nonempty({ message: 'Group Name is required' }).max(100),
    ex_MaxApplicapleSubjects: z.number({ required_error: 'Max Applicable Subjects is required' }).min(1),
    ex_MinApplicableSubjects: z.number({ required_error: 'Min Applicable Subjects is required' }).min(1),
    ex_BestOffSubjects: z.number({ required_error: 'Best Off Subjects is required' }).min(0),
    subjects: z.array(subjectGroupDetailSchema).min(1, { message: 'At least one subject must be selected' })
});

type FormFields = z.infer<typeof masterSubjectGroupSchema>;

// -------------------------
// FORM COMPONENT
// -------------------------
interface MasterSubjectGroupFormProps {
    onSuccess?: () => void;
    className?: string;
    initialData?: IMasterSubjectGroup & { subjects?: IMasterSubjectGroupDetails[] };
}

export default function MasterSubjectGroupForm({ onSuccess, className = '', initialData }: MasterSubjectGroupFormProps) {
    const [response, setResponse] = useState<IMasterSubjectGroupDetails[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
    const [isSubjectsEnabled, setIsSubjectsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // -------------------------
    // FETCH SUBJECTS
    // -------------------------
    useEffect(() => {
        async function fetchSubjects() {
            try {
                setIsLoading(true);
                const res = await getAllMasterSubjectDetails();
                const data = Array.isArray(res.data) ? res.data : [];
                setResponse(data);

                // preselect
                if (initialData?.subjects?.length) {
                    const selectedIds = data
                        .filter((s) => initialData.subjects!.some((init) => init.ex_Id === s.ex_Id))
                        .map((s) => s.ex_Id);
                    setSelectedSubjects(selectedIds);
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to fetch subjects');
            } finally {
                setIsLoading(false);
            }
        }
        fetchSubjects();
    }, [initialData]);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema),
        mode: 'onChange',
        defaultValues: initialData
            ? {
                  ex_GroupName: initialData.ex_GroupName,
                  ex_MaxApplicapleSubjects: initialData.ex_MaxApplicapleSubjects,
                  ex_MinApplicableSubjects: initialData.ex_MinApplicableSubjects,
                  ex_BestOffSubjects: initialData.ex_BestOffSubjects,
                  subjects: initialData.subjects?.map((s) => ({ ...s, selected: false })) || []
              }
            : {
                  ex_GroupName: '',
                  ex_MaxApplicapleSubjects: 1,
                  ex_MinApplicableSubjects: 1,
                  ex_BestOffSubjects: 0,
                  subjects: []
              }
    });

    const maxApplicableSubjects = watch('ex_MaxApplicapleSubjects');
    const minApplicableSubjects = watch('ex_MinApplicableSubjects');

    useEffect(() => {
        const valid = maxApplicableSubjects > 0 && minApplicableSubjects > 0 && minApplicableSubjects <= maxApplicableSubjects;
        setIsSubjectsEnabled(valid);
    }, [maxApplicableSubjects, minApplicableSubjects]);

    const tableProps = useDataTableProps({
        data: response,
        total: response.length,
        pageIndex: 0,
        pageSize: 10
    });

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!isSubjectsEnabled) {
            toast.error('Enter valid Min/Max subjects before selecting subjects');
            return;
        }
        const payload = {
            ...data,
            subjects: response.map((s) => ({ ...s, selected: selectedSubjects.includes(s.ex_Id) }))
        };
        try {
            const res = await addOrUpdateMasterSubjectGroup(payload);
            if (res.success) {
                toast.success(res.message);
                onSuccess?.();
            } else toast.error(res.message);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Group Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <InputText label='Group Name' required {...register('ex_GroupName')} error={errors.ex_GroupName?.message} />
                <div className='grid grid-cols-2 gap-2'>
                    <InputText
                        label='Max Applicable Subjects'
                        required
                        type='number'
                        {...register('ex_MaxApplicapleSubjects', { valueAsNumber: true })}
                        error={errors.ex_MaxApplicapleSubjects?.message}
                    />
                    <InputText
                        label='Min Applicable Subjects'
                        required
                        type='number'
                        {...register('ex_MinApplicableSubjects', { valueAsNumber: true })}
                        error={errors.ex_MinApplicableSubjects?.message}
                    />
                    <InputText
                        label='Best Off Subjects'
                        required
                        type='number'
                        {...register('ex_BestOffSubjects', { valueAsNumber: true })}
                        error={errors.ex_BestOffSubjects?.message}
                    />
                </div>
            </div>

            {/* Subjects Table */}
            <CollapsibleSection title='Select Subjects' defaultOpen>
                <GenericDataTable
                    {...tableProps} // spread other necessary props like data, totalItems, pageSizeOptions etc.
                    columns={MasterSubjectGroupDetailsColumns}
                    isLoading={isLoading}
                    noDataTitle='No Subjects Found'
                    noDataDescription='Please add subjects first.'
                    // Row selection props
                    maxSelectableRows={maxApplicableSubjects} // optional, set max rows you want to allow
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
