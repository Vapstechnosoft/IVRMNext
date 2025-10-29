'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasterBank';
import type { BankItem, MasterBankResponse } from '@/types/hrms/master-bank';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const columns: ColumnDef<BankItem>[] = [
    {
        accessorKey: 'HRMBD_BankName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' />
    },
    {
        accessorKey: 'HRMBD_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch Name' />
    },
    {
        accessorKey: 'HRMBD_BankAccountNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Account No' />
    },
    {
        accessorKey: 'HRMBD_IFSCCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IFSC Code' />
    },
    {
        accessorKey: 'HRMBD_BankAddress',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Address' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>{row.getValue('HRMBD_BankAddress') || 'N/A'}</div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: BankItem }) {
    const { openEditForm } = useFormContext<MasterBankResponse>();
    const { toggleActiveMutation } = useMasterBank(HRMS_MI_ID);

    const handleEdit = useCallback(
        (data: BankItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        async (data: BankItem, newState: boolean) => {
            try {
                await toggleActiveMutation.mutateAsync({
                    HRMBD_Id: data.HRMBD_Id,
                    HRMBD_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Bank ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} bank`);
            }
        },
        [toggleActiveMutation]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='HRMBD_ActiveFlag'
        />
    );
}
