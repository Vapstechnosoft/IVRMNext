'use client';

import { Heading } from '@/components/layout/heading';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useCompOffApproval, useUpdateCompOffApprovalStatus } from '@/hooks/hrms/leave-management/useTransactions';
import { useMemo } from 'react';
import { type CompOffApproval, compOffApprovalColumns } from './_components/columns';

export default function CompOffApprovalPage() {
    const { data: response, isLoading, error } = useCompOffApproval();
    const { mutate: updateStatus } = useUpdateCompOffApprovalStatus();

    const handleApprove = (row: CompOffApproval) => {
        updateStatus({ id: row.id, hrStatus: 'Approved' });
    };

    const handleReject = (row: CompOffApproval) => {
        updateStatus({ id: row.id, hrStatus: 'Rejected' });
    };

    const columns = useMemo(
        () => compOffApprovalColumns({ onApprove: handleApprove, onReject: handleReject }),
        [handleApprove, handleReject]
    );

    const tableProps = useDataTableProps({
        data: response?.data || [],
        totalItems: response?.data?.length || 0
    });

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <div className='space-y-1'>
                        <Heading title='Leave Management' description='Comp Off Approval' />
                    </div>
                </div>

                <CollapsibleSection
                    title='Comp Off Approval'
                    description=''
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<CompOffApproval>
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        error={error}
                        showViewOptions={false}
                        loadingMessage='Loading comp off approvals...'
                        noDataTitle='No Approvals Pending'
                        noDataDescription='All comp off requests have been processed'
                        errorTitle='Error Loading Comp Off Approvals'
                    />
                </CollapsibleSection>
            </div>
        </div>
    );
}
