'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usePeriodAllocation } from '@/hooks/timetable/useMasters';
import type { IMasterPeriodList } from '@/types/timetable/masters/masters';
import { use } from 'react';
import { masterPeriodColumns } from './_components/columns';
import MasterPeriodForm from './_components/period-form';
import ToggleMasterPeriodForm from './_components/toggle-form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterPeriodPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = usePeriodAllocation(searchParams);

    return (
        <FormProvider<IMasterPeriodList>>
            <MasterPeriodPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function MasterPeriodPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    // The API returns periodlist in the response object
    const tableProps = useDataTableProps(response?.periodlist ? { ...response, data: response.periodlist } : response);
    const dataList = response?.periodlist || [];

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection title='Master Period Allocation' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <MasterPeriodForm onSuccess={refetchAll} />
                </CollapsibleSection>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IMasterPeriodList>
                        {...tableProps}
                        data={dataList}
                        columns={masterPeriodColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['actions'] }}
                        loadingMessage='Loading periods...'
                        noDataTitle='No Periods Found'
                        noDataDescription='Create a period allocation to get started'
                        errorTitle='Error Loading Data'
                    />
                </CollapsibleSection>

                <FormSections onSuccess={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ onSuccess }: { onSuccess: () => void }) {
    const { isToggleFormOpen, selectedRow, closeToggleForm } = useFormContext<IMasterPeriodList>();

    return (
        <>
            {isToggleFormOpen && selectedRow && (
                <ToggleMasterPeriodForm
                    rowData={selectedRow}
                    onClose={() => {
                        closeToggleForm();
                        onSuccess();
                    }}
                />
            )}
        </>
    );
}
