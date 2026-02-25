'use client';

import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { type IPeriodStaffList, columns } from './period-staff-columns';
import { useSubjectRestrictionPeriodStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { useSearchParams } from 'next/navigation';
import { SubjectRestrictionPeriodStaffGridData } from '@/types/timetable/constraints/subjectRestrictions';
import { use } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export function PeriodStaffPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);

    const { data: response, isLoading, error } = useSubjectRestrictionPeriodStaffGridData({
        ASMAY_Id: Number(searchParams?.asmaY_Id) || 0,
        TTMC_Id: Number(searchParams?.ttmC_Id) || 0,
        ...searchParams
    });

    return (
        <FormProvider<SubjectRestrictionPeriodStaffGridData>>
            <PeriodStaffListContent response={response} isLoading={isLoading} error={error} />
        </FormProvider>
    );
}

function PeriodStaffListContent({
    response,
    isLoading,
    error,
}: {
    response: any;
    isLoading: boolean;
    error: any;
}) {
    const dataArray = response?.data ||
        response?.periodstafflist ||
        response?.periodStaffList ||
        response?.periodstaff_list ||
        (Array.isArray(response) ? response : []);

    const totalItems = response?.total ?? response?.totalItems ?? dataArray.length;

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
            title='Period Staff Constraints List'>
            <GenericDataTable<IPeriodStaffList>
                {...tableProps}
                columns={columns}
                isLoading={isLoading}
                error={error}
                columnPinning={{ right: ['actions'] }}
                loadingMessage='Loading period staff constraints...'
                noDataTitle='No Period Staff Constraints Found'
                noDataDescription='Add a new period staff constraint to get started'
                errorTitle='Error Loading Period Staff Constraints'
            />
        </CollapsibleSection>
    );
}

interface PeriodStaffListProps {
    data: IPeriodStaffList[];
    isLoading?: boolean;
    asmaY_Id?: number;
    ttmC_Id?: number;
}

export default function PeriodStaffList({
    data: propData,
    isLoading: propLoading = false,
    asmaY_Id,
    ttmC_Id
}: PeriodStaffListProps) {
    const { isDetailsViewOpen } = useFormContext();
    const searchParamsHook = useSearchParams();
    const urlParams = Object.fromEntries(searchParamsHook.entries());

    const { data: gridResponse, isLoading: isGridLoading, error } = useSubjectRestrictionPeriodStaffGridData({
        ASMAY_Id: asmaY_Id || Number(urlParams.asmaY_Id) || 0,
        TTMC_Id: ttmC_Id || Number(urlParams.ttmC_Id) || 0,
        ...urlParams
    });

    const isLoading = isGridLoading || propLoading;
    const responseWithFallback = gridResponse || { success: true, data: propData };

    if (isDetailsViewOpen) return null;

    return (
        <PeriodStaffListContent
            response={responseWithFallback}
            isLoading={isLoading}
            error={error}
        />
    );
}
