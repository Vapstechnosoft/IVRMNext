'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useRegistration } from '@/hooks/admission/preadmission/useConfigurations';
import type { IMasterRegistrationList } from '@/types/admission/preadmission/configaration';
import { X } from 'lucide-react';
import { useState } from 'react';
import AddMasterCategoryForm from './_components/add-form';
import { masterRegistrationColumns } from './_components/columns';
import UpdateMasterCategoryForm from './_components/update-form';

export default function MasterRegistrationPage() {
    const { data: response, isLoading, error } = useRegistration();
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <FormProvider<IMasterRegistrationList>>
            <MasterRegistrationPageContent
                response={response}
                isLoading={isLoading}
                error={error}
                showAddForm={showAddForm}
                setShowAddForm={setShowAddForm}
            />
        </FormProvider>
    );
}

function MasterRegistrationPageContent({
    response,
    isLoading,
    error,
    showAddForm,
    setShowAddForm
}: {
    response: any;
    isLoading: boolean;
    error: any;
    showAddForm: boolean;
    setShowAddForm: (show: boolean) => void;
}) {
    const { openAddForm } = useFormContext<IMasterRegistrationList>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    {/* <Button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Back to List
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Pre-Registration
              </>
            )}
          </Button> */}
                </div>

                {/* Content Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    {showAddForm ? (
                        <GenericDataTable<IMasterRegistrationList>
                            {...tableProps}
                            columns={masterRegistrationColumns}
                            isLoading={isLoading}
                            error={error}
                            showViewOptions={false}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage='Loading Pre-Registration...'
                            noDataTitle='No Pre-Registration Found'
                            noDataDescription='Get started by creating your first pre-registration'
                            errorTitle='Error Loading Pre-Registration'
                        />
                    ) : (
                        <AddMasterCategoryForm onSuccess={() => setShowAddForm(false)} className='p-4' />
                    )}
                </CollapsibleSection>
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
    } = useFormContext<IMasterRegistrationList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Master Category'
                        description='Fill in the details below to create a new master category'
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
                            <AddMasterCategoryForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Master Category'
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
                            <UpdateMasterCategoryForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </>
    );
}
