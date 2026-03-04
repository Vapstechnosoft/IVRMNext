'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { type IPeriodSubjectList, columns } from './period-subject-columns';
import { SubjectRestrictionPeriodSubjectGridData } from '@/types/timetable/constraints/subjectRestrictions';
import { useSubjectRestrictionPeriodSubjectGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Component to handle data fetching based on URL search parameters.
 * Works as a standalone page-like component.
 */
export function PeriodSubjectPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error } = useSubjectRestrictionPeriodSubjectGridData({
        ASMAY_Id: Number(searchParams?.asmaY_Id) || 0,
        TTMC_Id: Number(searchParams?.ttmC_Id) || 0,
        ...searchParams
    });

    return (
        <FormProvider<SubjectRestrictionPeriodSubjectGridData>>
            <PeriodSubjectListContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

/**
 * Shared content component that renders the data table.
 */
function PeriodSubjectListContent({
    response,
    isLoading,
    error,
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    // Extract data array from the response, checking common keys and provided JSON structure
    const dataArray = response?.data ||
        response?.periodsubjectlist ||
        response?.periodSubjectList ||
        response?.periodsubject_list ||
        (Array.isArray(response) ? response : []);

    // Ensure we have a total count, defaulting to dataArray.length if missing
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
            title='Period Subject Constraints List'>
            <GenericDataTable<IPeriodSubjectList>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                error={error}
                columnPinning={{ right: ['actions'] }}
                loadingMessage='Loading period subject constraints...'
                noDataTitle='No Period Subject Constraints Found'
                noDataDescription='Add a new period subject constraint to get started'
                errorTitle='Error Loading Period Subject Constraints'
            />
        </CollapsibleSection>
    );
}

interface PeriodSubjectListProps {
    data: IPeriodSubjectList[];
    isLoading?: boolean;
    asmaY_Id?: number;
    ttmC_Id?: number;
    total?: number;
}

/**
 * Default export used as a child component within PeriodSubjectTab.
 * Supports both props-based filtering and URL search params.
 */
export default function PeriodSubjectList({
    data: propData,
    isLoading: propLoading = false,
    asmaY_Id,
    ttmC_Id,
    total: propTotal
}: PeriodSubjectListProps) {
    const { isDetailsViewOpen } = useFormContext();
    const searchParamsHook = useSearchParams();

    // Extract search query from URL
    const urlParams = Object.fromEntries(searchParamsHook.entries());

    // Fetch data using the hook, merging props and URL search parameters
    const { data: gridResponse, isLoading: isGridLoading, error } = useSubjectRestrictionPeriodSubjectGridData({
        ASMAY_Id: asmaY_Id || Number(urlParams.asmaY_Id) || 0,
        TTMC_Id: ttmC_Id || Number(urlParams.ttmC_Id) || 0,
        ...urlParams // preserves 'search' and other URL modifiers
    });

    // Determine loading state
    const isLoading = isGridLoading || propLoading;

    // Use initial data if the hook hasn't returned fresh content yet
    const responseWithFallback = gridResponse || {
        success: true,
        data: propData,
        total: propTotal ?? propData?.length ?? 0
    };

    if (isDetailsViewOpen) return null;

    return (
        <PeriodSubjectListContent
            response={responseWithFallback}
            isLoading={isLoading}
            error={error}
        />
    );
}

