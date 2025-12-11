'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

import { useMasterSubjectGroup } from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectGroupSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubjectGroup, getAllMasterSubjectDetails } from '@/server/exam/exam-module/masters/subject-group';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import { MasterSubjectGroupDetailsColumns } from './subject-group-details-columns';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';

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
    // GET SUBJECT LIST
    // -------------------------
    useEffect(() => {
        async function loadSubjects() {
            try {
                setIsLoading(true);
                const res = await getAllMasterSubjectDetails();
                const data = Array.isArray(res?.data) ? res.data : [];
                setAllSubjects(data);

                if (initialData?.subjects?.length) {
                    const selected = data.filter((s) => initialData.subjects?.some((i) => i.ismS_Id === s.ismS_Id));
                    setSelectedSubjects(selected);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to fetch subjects");
            } finally {
                setIsLoading(false);
            }
        }

        loadSubjects();
    }, [initialData]);

    // -------------------------
    // FORM SETUP + LIVE VALIDATION
    // -------------------------
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        trigger, // used to re-validate dependent fields immediately
        formState
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema.addOrUpdate),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: initialData
            ? {
                emG_GroupName: initialData.emG_GroupName,
                emG_TotSubjects: initialData.emG_TotSubjects,
                emG_MaxAplSubjects: initialData.emG_MaxAplSubjects,
                emG_MinAplSubjects: initialData.emG_MinAplSubjects,
                emG_BestOff: initialData.emG_BestOff,
                subject_list: initialData.subjects?.map(s => ({ ismS_Id: s.ismS_Id })) ?? []
            }
            : {
                emG_GroupName: "",
                emG_TotSubjects: 1,
                emG_MaxAplSubjects: 1,
                emG_MinAplSubjects: 1,
                emG_BestOff: 1,
                subject_list: []
            }
    });

    const { errors, isSubmitting, touchedFields, isSubmitted } = formState;

    // -------------------------
    // Watch Dependent Fields
    // -------------------------
    const total = watch("emG_TotSubjects");
    const max = watch("emG_MaxAplSubjects");
    const min = watch("emG_MinAplSubjects");
    const best = watch("emG_BestOff");

    // Whenever dependent fields change -> revalidate to update errors immediately
    useEffect(() => {
        // trigger only the dependent fields to reduce overhead
        trigger(["emG_TotSubjects", "emG_MaxAplSubjects", "emG_MinAplSubjects", "emG_BestOff"]);
    }, [total, max, min, best, trigger]);

    // Enable subject selection only when values are logically valid
    useEffect(() => {
        setIsSubjectsEnabled(min > 0 && max > 0 && min <= max && max <= total);
    }, [total, max, min]);

    const tableProps = useDataTableProps({
        data: allSubjects,
        total: allSubjects.length,
        pageIndex: 0,
        pageSize: 10
    });

    // -------------------------
    // TABLE SELECTION
    // -------------------------
    const handleSelectedSubjectsChange = (rows: IMasterSubjectGroupDetails[]) => {
        setSelectedSubjects(rows);
    };

    // -------------------------
    // SUBMIT
    // -------------------------
    const onSubmit: SubmitHandler<FormFields> = async (d) => {
        if (!isSubjectsEnabled) {
            toast.error("Enter valid Min/Max subjects first");
            return;
        }

        if (selectedSubjects.length < d.emG_TotSubjects) {
            toast.error(`Select exactly ${d.emG_TotSubjects} subjects`);
            return;
        }

        const payload = {
            emG_Id: initialData?.emG_Id ?? 0,
            mI_Id: 30,
            emG_GroupName: d.emG_GroupName,
            emG_TotSubjects: d.emG_TotSubjects,
            emG_MaxAplSubjects: d.emG_MaxAplSubjects,
            emG_MinAplSubjects: d.emG_MinAplSubjects,
            emG_BestOff: d.emG_BestOff,
            subject_list: selectedSubjects.map(s => ({ ismS_Id: s.ismS_Id }))
        };

        try {
            const res = await addOrUpdateMasterSubjectGroup(payload);
            if (res.success) {
                toast.success(res.message || "Saved successfully.");
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res.message || "Failed to save");
            }
        } catch (e: any) {
            toast.error(e.message || "Something went wrong");
        }
    };

    // -------------------------
    // UI
    // -------------------------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* GROUP NAME */}
                <div>
                    <InputText
                        label="Group Name"
                        required
                        placeholder="Enter Group Name"
                        {...register("emG_GroupName")}
                    />
                    {errors.emG_GroupName && <FormError>{errors.emG_GroupName.message}</FormError>}
                </div>

                {/* TOTAL SUBJECTS */}
                <div>
                    <Controller
                        name="emG_TotSubjects"
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label="Total Subjects"
                                required
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger("emG_TotSubjects");
                                }}
                            />
                        )}
                    />
                    {errors.emG_TotSubjects && <FormError>{errors.emG_TotSubjects.message}</FormError>}
                </div>

                {/* MAX */}
                <div>
                    <Controller
                        name="emG_MaxAplSubjects"
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label="Max Applicable Subjects"
                                required
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger("emG_MaxAplSubjects");
                                }}
                            />
                        )}
                    />
                    {errors.emG_MaxAplSubjects && <FormError>{errors.emG_MaxAplSubjects.message}</FormError>}
                </div>

                {/* MIN */}
                <div>
                    <Controller
                        name="emG_MinAplSubjects"
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label="Min Applicable Subjects"
                                required
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger("emG_MinAplSubjects");
                                }}
                            />
                        )}
                    />
                    {errors.emG_MinAplSubjects && <FormError>{errors.emG_MinAplSubjects.message}</FormError>}
                </div>

                {/* BEST OFF */}
                <div>
                    <Controller
                        name="emG_BestOff"
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label="Best Off Subjects"
                                required
                                minValue={0}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger("emG_BestOff");
                                }}
                            />
                        )}
                    />
                    {errors.emG_BestOff && <FormError>{errors.emG_BestOff.message}</FormError>}
                </div>


            </div>

            <CollapsibleSection title="Select Subjects" defaultOpen>
                <GenericDataTable
                    {...tableProps}
                    columns={MasterSubjectGroupDetailsColumns}
                    isLoading={isLoading}
                    maxSelectableRows={total}
                    onRowSelectionChange={handleSelectedSubjectsChange}
                    noDataTitle="No Subjects Found"
                    noDataDescription="Please add subjects first"
                />
            </CollapsibleSection>

            <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => reset()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                    Save
                </Button>
            </div>

        </form>
    );
}
