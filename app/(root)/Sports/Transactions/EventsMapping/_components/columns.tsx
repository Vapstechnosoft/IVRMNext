'use client';

import { ColumnDef } from '@tanstack/react-table';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useEventMapping } from '@/hooks/sports/useEventMapping';
import { IEventsMappingData } from '@/types/sports/events-mapping';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export const eventsMappingColumns: ColumnDef<IEventsMappingData>[] = [
    {
        accessorKey: 'spccE_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Academic Year',
    },
    {
        accessorKey: 'spccmE_EventName',
        header: 'Event Name',
    },
    {
        accessorKey: 'spccmeV_EventVenue',
        header: 'Venue Name',
    },
    {
        accessorKey: 'spccE_StartDate',
        header: 'Start Date',
        cell: ({ row }) => {
            const date = row.original.spccE_StartDate;
            return date ? new Date(date).toLocaleDateString() : '';
        }
    },
    {
        accessorKey: 'spccE_StartTime',
        header: 'Start Time',
        cell: ({ row }) => {
            return <div className="lowercase">{row.getValue("spccE_StartTime")}</div>
        }
    },
    {
        accessorKey: 'spccE_EndDate',
        header: 'End Date',
        cell: ({ row }) => {
            const date = row.original.spccE_EndDate;
            return date ? new Date(date).toLocaleDateString() : '';
        }
    },
    {
        accessorKey: 'spccE_EndTime',
        header: 'End Time',
        cell: ({ row }) => {
            return <div className="lowercase">{row.getValue("spccE_EndTime")}</div>
        }
    },
    {
        accessorKey: 'spccE_Remarks',
        header: 'Remarks',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            return <ActionsCell row={row.original} />;
        },
    },
];

const ActionsCell = ({ row }: { row: IEventsMappingData }) => {
    const { deactivate } = useEventMapping();
    const { openEditForm } = useFormContext<IEventsMappingData>();

    return (
        <ActionButtons
            rowData={row}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(row)}
            onToggle={(data) => {
                deactivate.mutate({ ASMAY_Id: data.asmaY_Id, SPCCE_Id: data.spccE_Id });
            }}
            toggleConditionKey='spccE_ActiveFlag'
        />
    );
};
