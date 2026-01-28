'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { IFacility, IRoomDisplay } from '@/server/hostel/master-room/server-action';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/view-data-table/view-generic-data-table';

interface ViewFacilitiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: IRoomDisplay | null;
}

export function ViewFacilitiesModal({ isOpen, onClose, room }: ViewFacilitiesModalProps) {
    const data = room?.mappedFacilities || [];
    const tableProps = useDataTableProps({ data, total: data.length });

    const columns: ColumnDef<IFacility>[] = [
        {
            accessorKey: 'hlmftY_FacilityName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Facility Name' />,
            cell: ({ row }) => <div>{row.getValue('hlmftY_FacilityName')}</div>,
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Facilities: {room?.hrmrM_RoomNo}</DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                    <GenericDataTable
                        {...tableProps}
                        data={data}
                        totalItems={data.length}
                        columns={columns}
                        showViewOptions={false}
                        showPagination={false}
                        showSearch={false}
                        isLoading={false}
                        noDataTitle='No Facilities'
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
