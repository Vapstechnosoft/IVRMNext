'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Button } from '@/components/ui/button';
import { useMasterCaste } from '@/hooks/admission/preadmission/useMasters';
import type { IMasterCasteList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useState } from 'react';

const columns: ColumnDef<IMasterCasteList>[] = [
    {
        accessorKey: 'imC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row }) => <div className='w-full pl-6'>{row.index + 1}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'imC_CasteName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imC_CasteName')}</div>,
        enableSorting: false,
    },
    {
        accessorKey: 'imC_CasteDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Caste Description' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imC_CasteDesc')}</div>,
        enableSorting: false,
    }
];

export default function ViewDetailsDialog() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data: response, isLoading } = useMasterCaste({});

    const handleOpenDialog = () => {
        setIsDialogOpen(true);
    };

    return (
        <>
            <Button type='button' onClick={handleOpenDialog} className='w-fit transition-all duration-200 hover:scale-90 bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white'>
                <Eye className='mr-2 h-4 w-4' />
                View Details
            </Button>
            {isDialogOpen && (
                <AdaptiveDialog title='Master Caste List Report' isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} className='max-w-3xl'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <div className='my-2 max-h-[60vh] overflow-y-auto rounded-lg border p-3 shadow-sm'>
                            <GenericDataTable<IMasterCasteList>
                                data={response?.data || []}
                                totalItems={response?.data?.length || 0}
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
