'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { type IDaySubjectList, columns } from './day-subject-columns';
import { useSubjectRestrictionDaySubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';
import { SubjectRestrictionDaySubjectGridData } from '@/types/timetable/constraints/subjectRestrictions';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Component to handle data fetching based on URL search parameters.
 * Works as a standalone page-like component.
 */
export function DaySubjectPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error } = useSubjectRestrictionDaySubjectGridData({
        ASMAY_Id: Number(searchParams?.asmaY_Id) || 0,
        TTMC_Id: Number(searchParams?.ttmC_Id) || 0,
        ...searchParams
    });

    return (
        <FormProvider<SubjectRestrictionDaySubjectGridData>>
            <DaySubjectListContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

/**
 * Shared content component that renders the data table.
 */
function DaySubjectListContent({
    response,
    isLoading,
    error,
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    // Extract data array from the response
    const dataArray = response?.data ||
        response?.daysubjectlist ||
        response?.daySubjectList ||
        (Array.isArray(response) ? response : []);

    const totalItems = response?.total ?? response?.totalItems ?? dataArray.length;

    // Simplified prop handling using the generic data table hook
    const tableProps = useDataTableProps({
        ...response,
        data: dataArray,
        total: totalItems,
        success: response?.success ?? true
    });

    return (
        <CollapsibleSection
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
            title='Day Subject Constraints List'>
            <GenericDataTable<IDaySubjectList>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                error={error}
                columnPinning={{ right: ['actions'] }}
                loadingMessage='Loading day subject constraints...'
                noDataTitle='No Day Subject Constraints Found'
                noDataDescription='Add a new day subject constraint to get started'
                errorTitle='Error Loading Day Subject Constraints'
            />
        </CollapsibleSection>
    );
}

interface DaySubjectListProps {
    data: IDaySubjectList[];
    isLoading?: boolean;
    asmaY_Id?: number;
    ttmC_Id?: number;
}

/**
 * Default export used as a child component within DaySubjectTab.
 * Supports both props-based filtering and URL search params.
 */
export default function DaySubjectList({
    data: propData,
    isLoading: propLoading = false,
    asmaY_Id,
    ttmC_Id
}: DaySubjectListProps) {
    const { isDetailsViewOpen } = useFormContext();
    const searchParamsHook = useSearchParams();

    // Extract search query from URL
    const urlParams = Object.fromEntries(searchParamsHook.entries());

    // Fetch data using the hook, merging props and URL search parameters
    const { data: gridResponse, isLoading: isGridLoading, error } = useSubjectRestrictionDaySubjectGridData({
        ASMAY_Id: asmaY_Id || Number(urlParams.asmaY_Id) || 0,
        TTMC_Id: ttmC_Id || Number(urlParams.ttmC_Id) || 0,
        ...urlParams // preserves 'search' and other URL modifiers
    });

    // Determine loading state
    const isLoading = isGridLoading || propLoading;

    // Use initial data if the hook hasn't returned fresh content yet
    const responseWithFallback = gridResponse || { success: true, data: propData };

    if (isDetailsViewOpen) return null;

    return (
        <DaySubjectListContent
            response={responseWithFallback}
            isLoading={isLoading}
            error={error}
        />
    );
}
