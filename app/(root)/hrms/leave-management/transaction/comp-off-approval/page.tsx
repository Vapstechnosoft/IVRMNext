// Refactored by automation script on 2025-10-28T15:40:35.787Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/comp-off-approval-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure

'use client';

import { Heading } from '@/components/layout/heading';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { type BaseEntity, createLocalCrud } from '@/lib/localdb';
import { Check, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CompOffApproval extends BaseEntity {
    employeeName: string;
    date: string;
    time: string;
    compOffToBeCredit: number;
    reason: string;
    hrStatus: 'Pending' | 'Approved' | 'Rejected';
    approverRemarks?: string;
    remark?: string;
}

const compOffDB = createLocalCrud<CompOffApproval>('compOffApproval');

export default function CompOffApprovalPage() {
    const [data, setData] = useState<CompOffApproval[]>([]);

    const loadData = () => {
        setData(compOffDB.list());
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleApprove = (row: CompOffApproval) => {
        compOffDB.update(row.id, { hrStatus: 'Approved' });
        toast.success('Approved');
        loadData();
    };

    const handleReject = (row: CompOffApproval) => {
        compOffDB.update(row.id, { hrStatus: 'Rejected' });
        toast.success('Rejected');
        loadData();
    };

    const columns = useMemo(
        () => [
            { accessorKey: 'employeeName', header: 'Employee Name' },
            { accessorKey: 'date', header: 'Date' },
            { accessorKey: 'time', header: 'Time' },
            { accessorKey: 'compOffToBeCredit', header: 'Comp Off to be Credit' },
            { accessorKey: 'reason', header: 'Reason' },
            { accessorKey: 'hrStatus', header: 'HR Status' },
            { accessorKey: 'approverRemarks', header: 'Approver Remarks' },
            { accessorKey: 'remark', header: 'Remark' },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }: { row: any }) => (
                    <div className='flex gap-2'>
                        <Button size='sm' onClick={() => handleApprove(row.original)} disabled={row.original.hrStatus === 'Approved'}>
                            <Check className='mr-1 h-4 w-4' /> Approve
                        </Button>
                        <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleReject(row.original)}
                            disabled={row.original.hrStatus === 'Rejected'}>
                            <X className='mr-1 h-4 w-4' /> Reject
                        </Button>
                    </div>
                )
            }
        ],
        []
    );

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
                    {data.length === 0 ? (
                        <div className='py-10 text-center text-muted-foreground text-sm'>No Approvals Pending</div>
                    ) : (
                        <GenericDataTable data={data} columns={columns} totalItems={data.length} />
                    )}
                </CollapsibleSection>
            </div>
        </div>
    );
}
