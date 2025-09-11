'use client';

import { Heading } from '@/components/layout/heading';
import { DataTable } from '@/components/ui/data-table/data-table';
import { use } from 'react';
import { toast } from 'sonner';
import AddMasterClassForm from './_components/add-master-class-form';
import { useMasterClass } from '@/hooks/admission/useMasters';
import type { IMasterClassList } from '@/types/admission/masters';
import { masterClassColumns } from './_components/columns';
import { deleteMasterClass } from '@/server/admission/masters/class';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterClassPage(props: {
    searchParams: SearchParams;
}) {
    const searchParams = use(props.searchParams);

    return (
        <div className='space-y-4'>
            <div className='flex-between flex-wrap gap-4'>
                <Heading title='Master Class' description='' />
                <AddMasterClassForm />
            </div>

            <MasterClassTable searchParams={searchParams} />
        </div>
    );
}

function MasterClassTable({ searchParams }: { searchParams: any }) {
    const { data: response, isLoading: loading, error, refetchAll: refetchData } = useMasterClass(searchParams);

    const responseData = response?.data || [];
    const totalItems = response?.total || 0;

    async function deleteData(selectedRows: IMasterClassList[]) {
        try {
            const seletedIds = selectedRows.map((row) => row.id).join(',');

            toast.promise(deleteMasterClass(seletedIds), {
                loading: 'Deleting...',
                success: (response) => {
                    if (response.success) refetchData();
                    return response.message;
                },
                error: (error) => `Error: ${error.message}`
            });
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    if (!loading && error) return <div>Error: {error?.message}</div>;

    if (!loading && !response?.success) return <div>Error: {response?.message}</div>;

    return (
        <DataTable
            isLoading={loading}
            columns={masterClassColumns}
            data={responseData}
            totalItems={totalItems}
            showViewOptions={true}
            handleDelete={deleteData}
            columnPinning={{ right: ['actions'] }}
        />
    );
}
