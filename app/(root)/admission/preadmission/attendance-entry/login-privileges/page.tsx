'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { type ILoginPrivilege, loginPrivilegeColumns } from './_components/columns';

export default function LoginPrivilegePage() {
    const [data] = useState<ILoginPrivilege[]>([
        { id: 1, role: 'Class Teacher', class: 'I', section: 'A', activeFlag: true },
        { id: 2, role: 'Subject Teacher', class: 'I', section: 'B', activeFlag: true },
        { id: 3, role: 'Admin', class: 'All', section: 'All', activeFlag: true }
    ]);

    return (
        <FormProvider<ILoginPrivilege>>
            <LoginPrivilegePageContent data={data} />
        </FormProvider>
    );
}

function LoginPrivilegePageContent({ data }: { data: ILoginPrivilege[] }) {
    const { openAddForm } = useFormContext<ILoginPrivilege>();
    const tableProps = {
        data: data,
        totalItems: data.length,
        isLoading: false,
        error: null,
        success: true
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex justify-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Privilege
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<ILoginPrivilege>
                        {...tableProps}
                        columns={loginPrivilegeColumns}
                        isLoading={false}
                        showViewOptions={false}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading privileges...'
                        noDataTitle='No Privileges Found'
                        noDataDescription='Assign first privilege'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

function FormSections() {
    const { isAddFormOpen, isEditFormOpen, closeAddForm, closeEditForm, addFormRef, editFormRef } = useFormContext<ILoginPrivilege>();

    return (
        <>
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Login Privilege'
                        description='Assign privileges to roles'
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
                            <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <label htmlFor='lp-add-role' className='font-medium text-sm leading-none'>
                                        Role
                                    </label>
                                    <select
                                        id='lp-add-role'
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'>
                                        <option>Select Role</option>
                                        <option>Class Teacher</option>
                                        <option>Subject Teacher</option>
                                    </select>
                                </div>
                                <div className='space-y-2'>
                                    <label htmlFor='lp-add-class' className='font-medium text-sm leading-none'>
                                        Class
                                    </label>
                                    <select
                                        id='lp-add-class'
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'>
                                        <option>Select Class</option>
                                        <option>I</option>
                                        <option>II</option>
                                    </select>
                                </div>
                                <div className='space-y-2'>
                                    <label htmlFor='lp-add-section' className='font-medium text-sm leading-none'>
                                        Section
                                    </label>
                                    <select
                                        id='lp-add-section'
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'>
                                        <option>Select Section</option>
                                        <option>A</option>
                                        <option>B</option>
                                    </select>
                                </div>
                                <div className='col-span-full pt-4'>
                                    <Button>Save Privilege</Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Login Privilege'
                        description='Update assigned privileges'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='relative'>
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                <X className='h-4 w-4 text-destructive' /> Close
                            </Button>
                            <div className='grid grid-cols-1 gap-4 p-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                    <label htmlFor='lp-edit-role' className='font-medium text-sm leading-none'>
                                        Role
                                    </label>
                                    <select
                                        id='lp-edit-role'
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'>
                                        <option>Class Teacher</option>
                                        <option>Subject Teacher</option>
                                    </select>
                                </div>
                                <div className='col-span-full pt-4'>
                                    <Button>Update Privilege</Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
