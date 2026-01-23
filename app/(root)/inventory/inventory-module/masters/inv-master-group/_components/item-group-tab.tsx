'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IInvMasterItemGroup } from '@/types/inventory/masters/inv-master-group';
import { Plus, X } from 'lucide-react';
import { InvMasterItemGroupColumns } from './columns';
import { AddItemGroupForm, ToggleItemGroupForm, UpdateItemGroupForm } from './item-group-form';

interface ItemGroupTabProps {
    data: IInvMasterItemGroup[];
}

export default function ItemGroupTab({ data }: ItemGroupTabProps) {
    return (
        <FormProvider<IInvMasterItemGroup>>
            <ItemGroupTabContent data={data} />
        </FormProvider>
    );
}

function ItemGroupTabContent({ data }: { data: IInvMasterItemGroup[] }) {
    const { openAddForm } = useFormContext<IInvMasterItemGroup>();
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
                    Add Item Group
                </Button>
            </div>

            {/* Data Table */}
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IInvMasterItemGroup>
                    {...tableProps}
                    columns={InvMasterItemGroupColumns}
                    isLoading={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading Item Groups...'
                    noDataTitle='No Item Groups Found'
                    noDataDescription='Create your first Item Group'
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
    } = useFormContext<IInvMasterItemGroup>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Item Group'
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
                            <AddItemGroupForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Item Group'
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
                            <UpdateItemGroupForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleItemGroupForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
