'use client';

import { Button } from '@/components/ui/button';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { useStudentCountReport } from '@/hooks/admission/preadmission/useReports';
import type { IMasterStudentCountReportList } from '@/types/admission/preadmission/reports';
import { X } from 'lucide-react';
import { use } from 'react';
import PreadmissionStatusCountReport from '../../transactions/application-form/_components/preadmission-status-count-report';
import AddStudentCountReportForm from './_components/add-from';
import { masterStudentCountReportColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function StudentCountReportPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error } = useStudentCountReport(searchParams);

    return (
        <FormProvider<IMasterStudentCountReportList>>
            <StudentCountReportPageContent response={response} isLoading={isLoading} error={error} searchParams={searchParams} />
        </FormProvider>
    );
}

function FormSections({ searchParams }: { searchParams?: any }) {
    const { closeAddForm, addFormRef } = useFormContext<IMasterStudentCountReportList>();

    return (
        <>
            <div ref={addFormRef}>
                <CollapsibleSection
                    title='Add New Student Count Report'
                    description='Fill in the details below to Student Count Report'
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
                        <AddStudentCountReportForm onSuccess={closeAddForm} searchParams={searchParams} />
                    </div>
                </CollapsibleSection>
            </div>
        </>
    );
}

function StudentCountReportPageContent({
    response,
    isLoading,
    error,
    searchParams
}: {
    response: any;
    isLoading: boolean;
    error: any;
    searchParams?: any;
}) {
    const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Report Cards */}
                <PreadmissionStatusCountReport />

                {/* Add Form Section (shown first) */}
                <FormSections searchParams={searchParams} />

                {/* Data Table Section */}
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterStudentCountReportList>
                        {...tableProps}
                        columns={masterStudentCountReportColumns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        isSearchRequired={true}
                        showSearchColumns={true}
                        columnPinning={{ right: ['actions'] }}
                        isPaginationRequired={true}
                        loadingMessage='Loading  Student Count Reports...'
                        noDataTitle='No  Student Count Reports Found'
                        noDataDescription='Get started by creating your first Student Count Reports '
                        errorTitle='Error Loading Student Count Reports'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
