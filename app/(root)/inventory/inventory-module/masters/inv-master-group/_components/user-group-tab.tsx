'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import type { IInvMasterUserGroup } from '@/types/inventory/masters/inv-master-group';
import { Plus, X } from 'lucide-react';
import { InvMasterUserGroupColumns } from './columns';
import { AddUserGroupForm, ToggleUserGroupForm, UpdateUserGroupForm } from './user-group-form';

interface UserGroupTabProps {
    data: IInvMasterUserGroup[];
}

export default function UserGroupTab({ data }: UserGroupTabProps) {
    return (
        <FormProvider<IInvMasterUserGroup>>
            <UserGroupTabContent data={data} />
        </FormProvider>
    );
}

function UserGroupTabContent({ data }: { data: IInvMasterUserGroup[] }) {
    const { openAddForm } = useFormContext<IInvMasterUserGroup>();
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
                    Add User Group
                </Button>
            </div>

            {/* Data Table */}
            <CollapsibleSection
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                <GenericDataTable<IInvMasterUserGroup>
                    {...tableProps}
                    columns={InvMasterUserGroupColumns}
                    isLoading={false}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading User Groups...'
                    noDataTitle='No User Groups Found'
                    noDataDescription='Create your first User Group'
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
    } = useFormContext<IInvMasterUserGroup>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New User Group'
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
                            <AddUserGroupForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit User Group'
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
                            <UpdateUserGroupForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && (
                <ToggleUserGroupForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
