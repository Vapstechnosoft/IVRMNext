'use client';

import { Heading } from '@/components/layout/heading';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useMasterClass } from '@/hooks/admission/preadmission/useMasters';
import { use } from 'react';
import { masterClassColumns } from './_components/columns';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);

    return (
        <div className='space-y-4'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Master Class' description='' />
            </div>
            <MasterClassTable searchParams={searchParams} />
        </div>
    );
}

function MasterClassTable({ searchParams }: { searchParams: any }) {
    const { data: response, isLoading: loading, error } = useMasterClass(searchParams);

    const responseData = response?.data || [];
    const totalItems = response?.total || 0;

    if (!loading && error) return <div>Error: {error?.message}</div>;

    if (!loading && !response?.success) return <div>Error: {response?.message}</div>;

    return (
        <DataTable
            isLoading={loading}
            columns={masterClassColumns}
            data={responseData}
            totalItems={totalItems}
            showViewOptions={true}
            columnPinning={{ right: ['actions'] }}
        />
    );
}
