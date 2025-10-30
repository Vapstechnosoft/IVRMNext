'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useExamSubjectWizard } from '@/hooks/exam/exammodule/exam-mapping';
import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';
// import { useExamSubjectWizard } from '@/hooks/exam/exammodule/exam-subject-wizard';
// import type { IExamSubjectWizard } from '@/types/exam/exam-module/exam-subject-wizard';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddExamSubjectWizard from './_components/add-from';
// import ExamSubjectWizardDetailsPage from './_components/exam-subject-wizard-details';
import { ExamSubjectWizardColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function ExamSubjectWizardPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useExamSubjectWizard(searchParams);

    return (
        <FormProvider<IExamSubjectWizard>>
            <ExamSubjectWizardPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function ExamSubjectWizardPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IExamSubjectWizard>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Exam Subject Wizard
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IExamSubjectWizard>
                        {...tableProps}
                        columns={ExamSubjectWizardColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading exam subject wizard data...'
                        noDataTitle='No Exam Subject Wizard Records Found'
                        noDataDescription='Get started by creating your first exam subject wizard entry'
                        errorTitle='Error Loading Exam Subject Wizard Data'
                    />
                </CollapsibleSection>

                <FormSections />
            </div>
        </div>
    );
}

export function FormSections() {
    const { isAddFormOpen, isEditFormOpen, selectedRow, closeAddForm, closeEditForm, addFormRef, editFormRef } =
        useFormContext<IExamSubjectWizard>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Exam Subject Wizard'
                        description='Fill in the details below to create a new exam subject mapping'
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
                            <AddExamSubjectWizard onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Exam Subject Wizard'
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
                            {/* <UpdateExamSubjectWizard rowData={selectedRow} onSuccess={closeEditForm} /> */}
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {/* {isToggleFormOpen && selectedRow && (
                <ToggleExamSubjectWizardForm rowData={selectedRow} onClose={closeToggleForm} />
            )} */}

            {/* Details View */}
            {/* {isDetailsViewOpen && selectedRow && (
                <ExamSubjectWizardDetailsPage rowData={selectedRow} onClose={closeDetailsView} />
            )} */}
        </>
    );
}
