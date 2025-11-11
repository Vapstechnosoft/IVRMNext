'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { getOnlinePaymentHeadGroupEdit } from '@/server/fees/masters/online_payment_head_group';
import type { IMasterOnlinePaymentHeadgroupList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const masterClassYearlyCategoryColumns: ColumnDef<IMasterOnlinePaymentHeadgroupList>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'fopM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'className',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('className')}</div>
    },
    {
        accessorKey: 'submerchandId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Merchant Id' />,
        cell: ({ row }) => <div>{row.getValue('submerchandId')}</div>
    },
    {
        accessorKey: 'groupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group Name' />,
        cell: ({ row }) => <div>{row.getValue('groupName')}</div>
    },
    {
        accessorKey: 'headName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Head Name' />,
        cell: ({ row }) => <div>{row.getValue('headName')}</div>
    },
    {
        accessorKey: 'installmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div>{row.getValue('installmentName')}</div>
    },
    {
        accessorKey: 'termName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Term' />,
        cell: ({ row }) => <div>{row.getValue('termName')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterOnlinePaymentHeadgroupList;
}) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterOnlinePaymentHeadgroupList>();

    const handleToggle = useCallback((data: IMasterOnlinePaymentHeadgroupList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback(
        async (data: IMasterOnlinePaymentHeadgroupList) => {
            try {
                // Get the fopM_Id from the data - this is the primary key
                const fopM_Id = data.fopM_Id;

                // Fetch the complete edit data from API
                const response = await getOnlinePaymentHeadGroupEdit(fopM_Id);

                if (response?.success && response?.data) {
                    const dataArray = (response as any).data;
                    const apiData = dataArray[0];

                    // Transform the API data to the format expected by the update form
                    const transformedData = {
                        fopM_Id: apiData.fopM_Id,
                        asmaY_Id: 176, // Replace with actual value from API if available
                        asmcL_ID: apiData.asmcL_Id,
                        className: data.className,
                        fpgd_id: apiData.fpgd_id,
                        submerchandId: data.subMerchantId,
                        fmg_id: apiData.fmg_id,
                        groupName: data.groupName,
                        fmh_HeadId: apiData.fmH_Id,
                        headName: data.headSearchTerm,
                        fti_id: apiData.fti_id,
                        installmentName: data.installmentName,
                        fmt_id: apiData.fmt_id,
                        termName: data.terms,
                        institutionName: 'vidya_vikas_vidya_samste'
                    };

                    openEditForm(transformedData as any);
                } else {
                    toast.error('Failed to fetch edit data');
                }
            } catch (error) {
                console.error('Error opening edit form:', error);
                toast.error('An error occurred while loading edit data');
            }
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}
