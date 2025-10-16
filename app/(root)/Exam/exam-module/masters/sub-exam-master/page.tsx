'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterSubExam } from '@/hooks/exam/exammodule/usemasters';
import type { IMasterSubExam } from '@/types/exam/exam-module/masters';
import { Plus, X } from 'lucide-react';
import { use } from 'react';
import AddSubExamForm from './_components/add-form';
import { MasterSubExamColumns } from './_components/columns';
import ToggleSubExamForm from './_components/toggle-form';
import UpdateSubExamForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * ======================
 * SUB EXAM PAGE
 * ======================
 */
export default function SubExamPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterSubExam(searchParams);

    return (
        <FormProvider<IMasterSubExam>>
            <SubExamPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

/**
 * ======================
 * SUB EXAM PAGE CONTENT
 * ======================
 */
function SubExamPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterSubExam>();
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* HEADER SECTION */}
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Sub Exam
                    </Button>
                </div>

                {/* DATA TABLE SECTION */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterSubExam>
                        {...tableProps}
                        columns={MasterSubExamColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading sub exams...'
                        noDataTitle='No Sub Exams Found'
                        noDataDescription='Get started by creating your first sub exam.'
                        errorTitle='Error Loading Sub Exams'
                    />
                </CollapsibleSection>

                {/* FORM SECTIONS */}
                <FormSections />
            </div>
        </div>
    );
}

/**
 * ======================
 * FORM SECTIONS
 * ======================
 */
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
    } = useFormContext<IMasterSubExam>();

    return (
        <>
            {/* ADD FORM */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Sub Exam'
                        description='Fill in the details below to create a new sub exam.'
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

                            <AddSubExamForm onSuccess={closeAddForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* EDIT FORM */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Sub Exam'
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

                            <UpdateSubExamForm selectedRow={selectedRow} onSuccess={closeEditForm} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* TOGGLE FORM */}
            {isToggleFormOpen && selectedRow && <ToggleSubExamForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
