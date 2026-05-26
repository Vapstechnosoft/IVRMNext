'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { getSectionSetOrder } from '@/server/admission/preadmission/masters/section';
import type { IMasterSectionSetOrderList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';

const columns: ColumnDef<IMasterSectionSetOrderList>[] = [
    {
        accessorKey: 'asmS_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row }) => <div className='w-full pl-6'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'asmC_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section Order' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmC_Order')}</div>,
        enableSorting: false
    }
];

export default function ViewDetailsDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [orderedItems, setOrderedItems] = useState<IMasterSectionSetOrderList[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenDialog = async () => {
        setIsLoading(true);
        setIsDialogOpen(true);
        try {
            const orderResponse = await getSectionSetOrder();
            setOrderedItems(orderResponse?.data ?? []);
        } catch (error) {
            console.error('Failed to fetch section order details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                type='button'
                onClick={handleOpenDialog}
                className='w-fit bg-[#3f51b5] text-white transition-all duration-200 hover:scale-90 hover:bg-[#3f51b5]/90'>
                <Eye className='mr-2 h-4 w-4' />
                View Details
            </Button>
            {isDialogOpen && (
                <AdaptiveDialog
                    title='Master Section List Report'
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    className='max-w-3xl'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <div className='my-2 max-h-[60vh] overflow-y-auto rounded-lg border p-3 shadow-sm'>
                            <GenericDataTable<IMasterSectionSetOrderList>
                                data={orderedItems}
                                totalItems={orderedItems.length}
                                columns={columns}
                                isLoading={isLoading}
                                error={null}
                                showViewOptions={false}
                                isPaginationRequired={false}
                                isSearchRequired={false}
                                loadingMessage='Loading details...'
                                noDataTitle='No Details Found'
                                noDataDescription='No related details available'
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='destructive' onClick={() => setIsDialogOpen(false)} type='button'>
                            Close
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
