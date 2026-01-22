'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IInvMasterMainGroup } from '@/types/inventory/masters/inv-master-group';
import { Plus, X } from 'lucide-react';
import { InvMasterMainGroupColumns } from './columns';
import MainGroupForm, { ToggleMainGroupForm } from './main-group-form';

interface MainGroupTabProps {
    data: IInvMasterMainGroup[];
}

export default function MainGroupTab({ data }: MainGroupTabProps) {
    return (
        <FormProvider<IInvMasterMainGroup>>
            <MainGroupTabContent data={data} />
        </FormProvider>
    );
}

function MainGroupTabContent({ data }: { data: IInvMasterMainGroup[] }) {
    const { openAddForm } = useFormContext<IInvMasterMainGroup>();
    const tableProps = {
        data,
        totalItems: data.length,
        success: true
    };

    return (
        <div className='space-y-4 p-1'>
            {/* Header Actions */}
            <div className='flex justify-end'>
                <Button
                    type='button'
                    onClick={openAddForm}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                    <Plus className='h-4 w-4' />
                    Add Main Group
                </Button>
            </div>

            {/* Data Table */}
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IInvMasterMainGroup>
                    {...tableProps}
                    columns={InvMasterMainGroupColumns}
                    isLoading={false} // Data is passed from parent page which handles loading
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading Main Groups...'
                    noDataTitle='No Main Groups Found'
                    noDataDescription='Create your first Main Group'
                />
            </CollapsibleSection>

            {/* Forms */}
            <FormSections />
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
    } = useFormContext<IInvMasterMainGroup>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Main Group'
                        description='Fill in the details below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <MainGroupForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Main Group'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <MainGroupForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleMainGroupForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
