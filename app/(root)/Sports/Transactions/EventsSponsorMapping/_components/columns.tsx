'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { deactivateEventsSponsorMapping } from '@/server/sports/transactions/events-sponsor';
import { useEventsSponsor } from '@/hooks/sports/useEventsSponsor';
import { useFormContext } from '@/components/ui/form/form-provider';
import { toast } from 'sonner';

/* ============================================
   Actions Cell Component
   ============================================ */
function ActionsCell({ row }: { row: Row<IEventSponsorMapping> }) {
    const mapping = row.original;
    const { refetch } = useEventsSponsor();
    const { openEditForm } = useFormContext<IEventSponsorMapping>();

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
                    const response = await deactivateEventsSponsorMapping(mapping);
                    if (response.success) {
                        toast.success(response.message || `Mapping ${mapping.spccesP_ActiveFlag ? 'deactivated' : 'activated'} successfully`);
                        await refetch();
                    } else {
                        toast.error(response.message || 'Failed to update mapping status');
                    }
                } catch (error) {
                    toast.error('An error occurred while updating mapping status');
                }
            }}
            toggleConditionKey='spccesP_ActiveFlag'
        />
    );
}

export const eventSponsorColumns: ColumnDef<IEventSponsorMapping>[] = [
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
        accessorKey: 'spccpM_Name',
        header: 'Program Name',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('spccpM_Name')}</div>
    },
    {
        accessorKey: 'sponsorName',
        header: 'Sponsor Name',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('sponsorName')}</div>
    },
    {
        accessorKey: 'spccesP_ActiveFlag',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('spccesP_ActiveFlag');
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
