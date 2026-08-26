'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useMasterQuestionCollege } from '@/hooks/exam/online-exam/useMasters';
import type { IMasterQuestionCollegeList } from '@/types/exam/online-exam/masters';
import { Plus, X } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import AddMasterQuestionCollegeForm from './_components/add-form';
import BranchMappingModal from './_components/branch-mapping-modal';
import { getMasterQuestionCollegeColumns } from './_components/columns';
import QuestionCollegeOptionsModal from './_components/options-modal';
import ToggleQuestionCollegeForm from './_components/toggle-form';
import UpdateMasterQuestionCollegeForm from './_components/update-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterQuestionCollegePage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useMasterQuestionCollege(searchParams);

    return (
        <FormProvider<IMasterQuestionCollegeList>>
            <MasterQuestionCollegePageContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function MasterQuestionCollegePageContent({
    response,
    isLoading,
    error
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const { openAddForm } = useFormContext<IMasterQuestionCollegeList>();
    const initialData = (response?.data || response || {}) as any;
    const questionList = Array.isArray(initialData?.questionList)
        ? initialData.questionList
        : Array.isArray(initialData?.getMasterQuestiondetails)
        ? initialData.getMasterQuestiondetails
        : Array.isArray(initialData?.masterQuestiondetails)
        ? initialData.masterQuestiondetails
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
    const tableProps = useDataTableProps(questionList);

    const [selectedQuestionForOptions, setSelectedQuestionForOptions] = useState<IMasterQuestionCollegeList | null>(null);
    const [selectedQuestionForMapping, setSelectedQuestionForMapping] = useState<IMasterQuestionCollegeList | null>(null);

    const courses = initialData?.getCourse || [];
    const branches = initialData?.getBranch || [];
    const semesters = initialData?.getSemester || [];
    const subjects = initialData?.getSubjects || [];
    const complexities = initialData?.getComplexity || [];

    const columns = useMemo(
        () =>
            getMasterQuestionCollegeColumns({
                onOpenOptionsModal: (question) => setSelectedQuestionForOptions(question),
                onOpenBranchMappingModal: (question) => setSelectedQuestionForMapping(question)
            }),
        []
    );

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Master Question Bank (College)</h1>
                        <p className='text-muted-foreground text-sm'>
                            Manage college examination question bank, degree branch mapping, options, and scoring
                        </p>
                    </div>
                    <Button onClick={openAddForm} className='gap-2 shadow-sm'>
                        <Plus className='h-4 w-4' />
                        Add Question
                    </Button>
                </div>

                {/* Form Sections */}
                <FormSections courses={courses} branches={branches} semesters={semesters} subjects={subjects} complexities={complexities} />

                {/* Question List Data Table */}
                <GenericDataTable<IMasterQuestionCollegeList> columns={columns} {...tableProps} isLoading={isLoading} error={error} />

                {/* Options Modal Dialog */}
                {selectedQuestionForOptions && (
                    <QuestionCollegeOptionsModal
                        question={selectedQuestionForOptions}
                        open={Boolean(selectedQuestionForOptions)}
                        onClose={() => setSelectedQuestionForOptions(null)}
                    />
                )}

                {/* Branch Mapping Modal Dialog */}
                {selectedQuestionForMapping && (
                    <BranchMappingModal
                        question={selectedQuestionForMapping}
                        branches={branches}
                        open={Boolean(selectedQuestionForMapping)}
                        onClose={() => setSelectedQuestionForMapping(null)}
                    />
                )}
            </div>
        </div>
    );
}

function FormSections({
    courses,
    branches,
    semesters,
    subjects,
    complexities
}: {
    courses: any[];
    branches: any[];
    semesters: any[];
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
    } = useFormContext<IMasterQuestionCollegeList>();

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add College Question'
                        description='Fill in the details below to add a question to the college question bank'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeAddForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <AddMasterQuestionCollegeForm
                            courses={courses}
                            branches={branches}
                            semesters={semesters}
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
                        title='Update College Question'
                        description='Edit the college question details below'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        rightElement={
                            <Button
                                type='button'
                                onClick={closeEditForm}
                                variant='ghost'
                                size='sm'
                                className='h-8 gap-1.5 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive'>
                                <X className='h-4 w-4' /> Close
                            </Button>
                        }>
                        <UpdateMasterQuestionCollegeForm
                            rowData={selectedRow}
                            courses={courses}
                            branches={branches}
                            semesters={semesters}
                            subjects={subjects}
                            complexities={complexities}
                            onSuccess={closeEditForm}
                            onCancel={closeEditForm}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Status Dialog */}
            {isToggleFormOpen && selectedRow && (
                <ToggleQuestionCollegeForm rowData={selectedRow} onClose={closeToggleForm} />
            )}
        </>
    );
}
