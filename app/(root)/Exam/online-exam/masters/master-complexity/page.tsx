'use client';

function extractArray(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.$values && Array.isArray(val.$values)) return val.$values;
    return [];
}

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterComplexity } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterComplexity } from '@/types/exam/online-exam/masters';
import { Plus, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import AddMasterComplexityForm from './_components/add-form';
import { masterComplexityColumns } from './_components/columns';
import ToggleMasterComplexityForm from './_components/toggle-form';
import UpdateMasterComplexityForm from './_components/update-form';

export default function MasterComplexityPage() {
    return (
        <FormProvider<IMasterComplexity>>
            <MasterComplexityContent />
        </FormProvider>
    );
}

function MasterComplexityContent() {
    const searchParams = useSearchParams();
    const miId = searchParams.get('MI_Id') || '30';
    const { data: response, isLoading, error } = useMasterComplexity({ MI_Id: Number(miId) });
    const { openAddForm } = useFormContext<IMasterComplexity>();
    const initialData = (response?.data || response || {}) as any;

    const complexityList: IMasterComplexity[] = useMemo(() => {
        const raw = extractArray(
            initialData?.getMasterComplexitiesdetails || initialData?.masterComplexityList || initialData?.complexityList
        );
        return raw.map((c: any) => ({
            lpmcomP_Id: Number(c.lpmcomP_Id ?? c.LPMCOMP_Id ?? c.id ?? 0),
            lpmcomP_ComplexityName: String(c.lpmcomP_ComplexityName ?? c.LPMCOMP_ComplexityName ?? ''),
            lpmcomP_ComplexityDesc: String(c.lpmcomP_ComplexityDesc ?? c.LPMCOMP_ComplexityDesc ?? ''),
            lpmcomP_DefaultFlg: Boolean(c.lpmcomP_DefaultFlg ?? c.LPMCOMP_DefaultFlg ?? false),
            lpmcomP_ActiveFlg: Boolean(c.lpmcomP_ActiveFlg ?? c.LPMCOMP_ActiveFlg ?? true),
            lpmcomP_CreatedDate: c.lpmcomP_CreatedDate ?? c.CreatedDate,
            lpmcomP_UpdatedDate: c.lpmcomP_UpdatedDate ?? c.UpdatedDate
        }));
    }, [initialData]);

    const tableProps = useDataTableProps(complexityList);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Master Complexity</h1>
                        <p className='text-muted-foreground text-sm'>
                            Configure question difficulty levels (Easy, Medium, Hard) and default selections
                        </p>
                    </div>
                    <Button onClick={openAddForm} className='gap-2 shadow-sm'>
                        <Plus className='h-4 w-4' />
                        Add Complexity
                    </Button>
                </div>

                {/* Form Sections */}
                <FormSections />

                {/* Complexity Data Table */}
                <GenericDataTable<IMasterComplexity>
                    columns={masterComplexityColumns}
                    {...tableProps}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
}

function FormSections() {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef
    } = useFormContext<IMasterComplexity>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Complexity'
                        description='Define a new question difficulty level'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <AddMasterComplexityForm onSuccess={closeAddForm} onCancel={closeAddForm} />
                    </CollapsibleSection>
                </div>
            )}

            {/* Update Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Update Complexity'
                        description='Edit the difficulty level details'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-destructive text-xs hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <UpdateMasterComplexityForm rowData={selectedRow} onSuccess={closeEditForm} onCancel={closeEditForm} />
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Status Modal Dialog */}
            {isToggleFormOpen && selectedRow && <ToggleMasterComplexityForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
