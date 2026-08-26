'use client';
function extractArray(obj: any): any[] {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (obj.$values && Array.isArray(obj.$values)) return obj.$values;
    return [];
}

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterQuestionList } from '@/types/exam/online-exam/masters';
import { Plus, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { use, useMemo, useState } from 'react';
import AddMasterQuestionForm from './_components/add-form';
import ClassMappingModal from './_components/class-mapping-modal';
import { getMasterQuestionColumns } from './_components/columns';
import QuestionOptionsModal from './_components/options-modal';
import ToggleQuestionForm from './_components/toggle-form';
import UpdateMasterQuestionForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterQuestionPage(props: { searchParams: SearchParams }) {
    const searchParamsPromise = use(props.searchParams);
    const searchParamsHook = useSearchParams();
    const miId = searchParamsHook.get('MI_Id') || (searchParamsPromise as any)?.MI_Id;
    const queryParams = useMemo(() => (miId ? { MI_Id: String(miId) } : {}), [miId]);

    const { data: response, isLoading, error } = useMasterQuestion(queryParams);

    return (
        <FormProvider<IMasterQuestionList>>
            <MasterQuestionPageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterQuestionPageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterQuestionList>();
    const initialData = (response?.data || response || {}) as any;
    const questionList = extractArray(
        initialData?.questionList ||
            initialData?.getMasterQuestiondetails ||
            initialData?.masterQuestiondetails ||
            response?.data ||
            response
    );
    const tableProps = useDataTableProps(questionList);

    const [selectedQuestionForOptions, setSelectedQuestionForOptions] = useState<IMasterQuestionList | null>(null);
    const [selectedQuestionForMapping, setSelectedQuestionForMapping] = useState<IMasterQuestionList | null>(null);

    const subjects = extractArray(initialData?.getSubjects || initialData?.getsubjectlist || initialData?.getsubjects);
    const classes = extractArray(initialData?.getClass || initialData?.getclasslist || initialData?.getclass);
    const rawComplexities = extractArray(initialData?.getComplexity || initialData?.getarratcomplexities || initialData?.arrayComplexity);
    const complexities = rawComplexities.map((c: any) => ({
        lmsmoecX_Id: c.lmsmoecX_Id ?? c.lpmcomP_Id ?? c.lpmcomp_Id ?? 0,
        lmsmoecX_ComplexityName: c.lmsmoecX_ComplexityName ?? c.lpmcomP_ComplexityName ?? c.lpmcomp_ComplexityName ?? 'Standard'
    }));

    const columns = useMemo(
        () =>
            getMasterQuestionColumns({
                onOpenOptionsModal: (question) => setSelectedQuestionForOptions(question),
                onOpenClassMappingModal: (question) => setSelectedQuestionForMapping(question)
            }),
        []
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Master Question Bank (School)</h1>
                        <p className='text-muted-foreground text-sm'>
                            Manage online exam question repository, complexity, class mappings, and answer keys
                        </p>
                    </div>
                    <Button onClick={openAddForm} className='gap-2 shadow-sm'>
                        <Plus className='h-4 w-4' />
                        Add Question
                    </Button>
                </div>

                {/* Form Sections */}
                <FormSections subjects={subjects} complexities={complexities} />

                {/* Question List Data Table */}
                <GenericDataTable<IMasterQuestionList> columns={columns} {...tableProps} isLoading={isLoading} error={error} />

                {/* Options Modal Dialog */}
                {selectedQuestionForOptions && (
                    <QuestionOptionsModal
                        question={selectedQuestionForOptions}
                        open={Boolean(selectedQuestionForOptions)}
                        onClose={() => setSelectedQuestionForOptions(null)}
                    />
                )}

                {/* Class Mapping Modal Dialog */}
                {selectedQuestionForMapping && (
                    <ClassMappingModal
                        question={selectedQuestionForMapping}
                        classes={classes}
                        open={Boolean(selectedQuestionForMapping)}
                        onClose={() => setSelectedQuestionForMapping(null)}
                    />
                )}
            </div>
        </div>
    );
}

function FormSections({
    subjects,
    complexities
}: {
    subjects: any[];
    complexities: any[];
}) {
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
    } = useFormContext<IMasterQuestionList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add Question'
                        description='Fill in the details below to add a question to the question bank'
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
                        <AddMasterQuestionForm
                            subjects={subjects}
                            complexities={complexities}
                            onSuccess={closeAddForm}
                            onCancel={closeAddForm}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Update Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Update Question'
                        description='Edit the question details below'
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
                        <UpdateMasterQuestionForm
                            rowData={selectedRow}
                            subjects={subjects}
                            complexities={complexities}
                            onSuccess={closeEditForm}
                            onCancel={closeEditForm}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Status Dialog */}
            {isToggleFormOpen && selectedRow && <ToggleQuestionForm rowData={selectedRow} onClose={closeToggleForm} />}
        </>
    );
}
