'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterBank } from '@/hooks/hrms/useMasters';
import type { BankItem, MasterBankResponse } from '@/types/hrms/master-bank';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';
export const columns: ColumnDef<BankItem>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'HRMBD_BankName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMBD_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch Name' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMBD_BankAccountNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Account No' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMBD_IFSCCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='IFSC Code' className='whitespace-nowrap' />
    },
    {
        accessorKey: 'HRMBD_BankAddress',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Address' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>{row.getValue('HRMBD_BankAddress') || 'N/A'}</div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: BankItem }) {
    const { openEditForm } = useFormContext<MasterBankResponse>();
    const { toggleMutation } = useMasterBank(HRMS_MI_ID);
    const handleEdit = useCallback(
        (data: BankItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );
    const handleToggle = useCallback(
        async (data: BankItem, newState: boolean) => {
            try {
                const result = await toggleMutation.mutateAsync({
                    HRMBD_Id: data.HRMBD_Id,
                    HRMBD_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                if (result?.success) {
                    const successMsg = result?.message || `Bank ${newState ? 'activated' : 'deactivated'} successfully`;
                    toast.success(successMsg);
                } else {
                    const errorMsg = result?.message || `Failed to ${newState ? 'activate' : 'deactivate'} bank`;
                    toast.error(errorMsg);
                }
            } catch (error: any) {
                const errorMsg =
                    error?.response?.data?.message || error?.message || `Failed to ${newState ? 'activate' : 'deactivate'} bank`;
                toast.error(errorMsg);
            }
        },
        [toggleMutation]
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
