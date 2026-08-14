import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Switch } from '@/components/ui/switch';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit2 } from 'lucide-react';

// Basic interface expected from the grid data
export interface CirculationParameterGridData {
    lmC_Id: number;
    lmC_CategoryName?: string;
    lmB_BookType?: string;
    lmC_MaxIssueItems?: number;
    lmC_MaxIssueDays?: number;
    lmC_MaxRenewals?: number;
    lmC_ActiveFlag: boolean;
    schclgflag?: string;
    lmB_BookTypeflag?: string; // 'BP' or 'NBP'
}

interface ColumnProps {
    onEdit: (data: CirculationParameterGridData) => void;
    onToggleStatus: (data: CirculationParameterGridData) => void;
}

export const createCirculationParameterColumns = ({ onEdit, onToggleStatus }: ColumnProps): ColumnDef<CirculationParameterGridData>[] => {
    return [
        {
            id: 'index',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' />,
            cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
            enableSorting: false
        },
        {
            id: 'categoryOrType',
            accessorFn: (row) => (row.lmB_BookTypeflag === 'BP' ? row.lmB_BookType : row.lmC_CategoryName),
            header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type/Category' />,
            cell: ({ row }) => (
                <div>{row.original.lmB_BookTypeflag === 'BP' ? row.original.lmB_BookType : row.original.lmC_CategoryName}</div>
            )
        },
        {
            accessorKey: 'lmC_MaxIssueItems',
            header: ({ column }) => <DataTableColumnHeader column={column} title='No. Of Item' />,
            cell: ({ row }) => <div>{row.getValue('lmC_MaxIssueItems')}</div>
        },
        {
            accessorKey: 'lmC_MaxIssueDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Days' />,
            cell: ({ row }) => <div>{row.getValue('lmC_MaxIssueDays')}</div>
        },
        {
            accessorKey: 'lmC_MaxRenewals',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Max Renewals' />,
            cell: ({ row }) => <div>{row.getValue('lmC_MaxRenewals')}</div>
        },
        {
            accessorKey: 'lmC_ActiveFlag',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Active' />,
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Switch checked={row.original.lmC_ActiveFlag} onCheckedChange={() => onToggleStatus(row.original)} />
                </div>
            )
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
            cell: ({ row }) => {
                return (
                    <div className='flex items-center justify-center gap-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            disabled={!row.original.lmC_ActiveFlag}
                            onClick={() => onEdit(row.original)}
                            className='text-blue-500 hover:text-blue-700'>
                            <Edit2 className='h-4 w-4' />
                        </Button>
                    </div>
                );
            }
        }
    ];
};
