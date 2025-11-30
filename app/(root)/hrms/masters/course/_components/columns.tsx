'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useMasterCourse } from '@/hooks/hrms/useMasters';
import type { CourseDetail, MasterCourseResponse } from '@/types/hrms/master-course';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { toast } from 'sonner';
export const columns: ColumnDef<CourseDetail>[] = [
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
        accessorKey: 'HRMC_QulaificationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Qualification Name' />
    },
    {
        accessorKey: 'HRMC_QualificationDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />
    },
    {
        accessorKey: 'HRMC_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' />,
        cell: ({ row }) => {
            const orderValue = row.original.HRMC_Order;
            return <div>{orderValue ?? '-'}</div>;
        }
    },
    {
        accessorKey: 'HRMC_DefaultQualFag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Default' />,
        cell: ({ row }) => (row.original.HRMC_DefaultQualFag ? 'Yes' : 'No')
    },
    {
        accessorKey: 'HRMC_SpecialisationFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Has Specialization' />,
        cell: ({ row }) => (row.original.HRMC_SpecialisationFlag ? 'Yes' : 'No')
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];
function ActionButtonsCell({ rowData }: { rowData: CourseDetail }) {
    const { openEditForm } = useFormContext<MasterCourseResponse>();
    const { toggleMutation } = useMasterCourse(HRMS_MI_ID);
    const handleEdit = useCallback(
        (data: CourseDetail) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );
    const handleToggle = useCallback(
        async (data: CourseDetail, newState: boolean) => {
            try {
                await toggleMutation.mutateAsync({
                    HRMC_Id: data.HRMC_Id,
                    HRMC_ActiveFlag: newState,
                    MI_Id: HRMS_MI_ID
                });
                toast.success(`Course ${newState ? 'activated' : 'deactivated'} successfully`);
            } catch (_error) {
                toast.error(`Failed to ${newState ? 'activate' : 'deactivate'} course`);
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
            toggleConditionKey='HRMC_ActiveFlag'
        />
    );
}
