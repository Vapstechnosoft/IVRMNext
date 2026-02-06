'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useEventsMapping } from '@/hooks/sports/useEventsMapping';
import { deactivateEventsMapping } from '@/server/sports/events-mapping';
import type { IEventsMappingData } from '@/types/sports/events-mapping';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IEventsMappingData> }) {
    const mapping = row.original;
    const { gridData } = useEventsMapping();
    const { openEditForm } = useFormContext<IEventsMappingData>();

    return (
        <ActionButtons
            rowData={mapping}
            buttons={{
                edit: true,
                toggle: true,
                delete: false
            }}
            onEdit={() => openEditForm(mapping)}
            onToggle={async () => {
                try {
                    const response = await deactivateEventsMapping(mapping.spccE_Id, !mapping.spccE_ActiveFlag);
                    if (response.success) {
                        toast.success(response.message);
                        await gridData.refetch();
                    } else {
                        toast.error('Failed to update status');
                    }
                } catch (error) {
                    toast.error('An error occurred while updating status');
                }
            }}
            toggleConditionKey='spccE_ActiveFlag'
        />
    );
}

export const eventsMappingColumns: ColumnDef<IEventsMappingData>[] = [
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
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: 'Academic Year',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'spccmE_EventName',
        header: 'Event Name',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmE_EventName')}</div>
    },
    {
        accessorKey: 'spccmeV_EventVenue',
        header: 'Venue',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccmeV_EventVenue')}</div>
    },
    {
        accessorKey: 'spccE_StartDate',
        header: 'Start Date',
        cell: ({ row }) => {
            const date = row.getValue('spccE_StartDate') as string;
            return <div className='font-medium'>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
        }
    },
    {
        accessorKey: 'spccE_EndDate',
        header: 'End Date',
        cell: ({ row }) => {
            const date = row.getValue('spccE_EndDate') as string;
            return <div className='font-medium'>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
        }
    },
    {
        accessorKey: 'spccE_ActiveFlag',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('spccE_ActiveFlag');
            return (
                <Badge variant={isActive ? 'success' : 'destructive'} className='font-semibold'>
                    {isActive ? 'Active' : 'Deactivated'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ActionsCell
    }
];
