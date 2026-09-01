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

    const questionList: IMasterQuestionList[] = useMemo(() => {
        const raw = extractArray(initialData?.getMasterQuestiondetails || initialData?.questionList || initialData?.masterQuestiondetails);
        return raw.map((q: any) => ({
            lmsmoeQ_Id: Number(q.lpmoeQ_Id ?? q.lmsmoeQ_Id ?? q.LPMOEQ_Id ?? q.id ?? 0),
            lmsmoeQ_Question: String(q.lpmoeQ_Question ?? q.lmsmoeQ_Question ?? q.LPMOEQ_Question ?? ''),
            lmsmoeQ_QuestionDesc: String(q.lpmoeQ_QuestionDesc ?? q.lmsmoeQ_QuestionDesc ?? q.LPMOEQ_QuestionDesc ?? ''),
            ismS_Id: Number(q.ismS_Id ?? q.isms_Id ?? q.ISMS_Id ?? 0),
            ismS_SubjectName: String(q.ismS_SubjectName ?? q.isms_SubjectName ?? q.ISMS_SubjectName ?? 'N/A'),
            asmcL_Id: Number(q.asmcL_Id ?? q.asmcl_Id ?? q.ASMCL_Id ?? 0),
            asmcL_ClassName: String(q.asmcL_ClassName ?? q.asmcl_ClassName ?? q.ASMCL_ClassName ?? 'N/A'),
            lmsmoeQ_Marks: Number(q.lpmoeQ_Marks ?? q.lmsmoeQ_Marks ?? q.LPMOEQ_Marks ?? 1),
            lmsmoecX_Id: Number(q.lpmcomP_Id ?? q.lmsmoecX_Id ?? q.lpmcomp_Id ?? 0),
            lmsmoecX_ComplexityName: String(
                q.lpmcomP_ComplexityName ?? q.lmsmoecX_ComplexityName ?? q.lpmcomp_ComplexityName ?? 'Standard'
            ),
            lmsmoeQ_ActiveFlg: Boolean(q.lpmoeQ_ActiveFlg ?? q.lmsmoeQ_ActiveFlg ?? q.LPMOEQ_ActiveFlg ?? true),
            countoption: Number(q.countoption ?? q.countOption ?? 0),
            countdoc: Number(q.countdoc ?? q.countDoc ?? 0)
        }));
    }, [initialData]);

    const tableProps = useDataTableProps(questionList);

    const [selectedQuestionForOptions, setSelectedQuestionForOptions] = useState<IMasterQuestionList | null>(null);
    const [selectedQuestionForMapping, setSelectedQuestionForMapping] = useState<IMasterQuestionList | null>(null);

    const subjects = useMemo(() => {
        const list = extractArray(initialData?.getsubjectlist || initialData?.getSubjects || initialData?.getsubjects);
        return list.map((s: any) => ({
            ismS_Id: Number(s.ismS_Id ?? s.isms_Id ?? s.ISMS_Id ?? 0),
            ismS_SubjectName: String(s.ismS_SubjectName ?? s.isms_SubjectName ?? s.ISMS_SubjectName ?? '')
        }));
    }, [initialData]);

    const classes = useMemo(() => {
        const list = extractArray(initialData?.getclasslist || initialData?.getClass || initialData?.getclass);
        return list.map((c: any) => ({
            asmcL_Id: Number(c.asmcL_Id ?? c.asmcl_Id ?? c.ASMCL_Id ?? 0),
            asmcL_ClassName: String(c.asmcL_ClassName ?? c.asmcl_ClassName ?? c.ASMCL_ClassName ?? '')
        }));
    }, [initialData]);

    const complexities = useMemo(() => {
        const list = extractArray(initialData?.getarratcomplexities || initialData?.getComplexity || initialData?.arrayComplexity);
        return list.map((c: any) => ({
            lmsmoecX_Id: Number(c.lpmcomP_Id ?? c.lmsmoecX_Id ?? c.lpmcomp_Id ?? 0),
            lmsmoecX_ComplexityName: String(c.lpmcomP_ComplexityName ?? c.lmsmoecX_ComplexityName ?? c.lpmcomp_ComplexityName ?? 'Standard')
        }));
    }, [initialData]);

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
