'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IFeeDefaulterReportRow {
    feeGroup: string;
    totalDue: number;
    fsS_CurrentYrCharges: number;
    fsS_TotalToBePaid: number;
    fsS_ToBePaid: number;
    fsS_PaidAmount: number;
    fsS_ConcessionAmount: number;
    fsS_AdjustedAmount: number;
    fsS_WaivedAmount: number;
    fsS_RefundAmount: number;
    fsS_RunningExcessAmount: number;
    fsS_FineAmount: number;
}

export const YearlyFeeCollectionReportColumns: ColumnDef<IFeeDefaulterReportRow>[] = [
    // 1. Select All / Individual Checkbox
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all rows'
                className='translate-y-[2px]'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40
    },

    // 2. Serial Number (Safe: uses only table state)
    {
        id: 'serial',
        header: () => <div className='text-center'>Sl.No.</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const index = pageIndex * pageSize + row.index + 1;
            return <div className='text-center font-medium'>{index}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
    },

    // 3. Fee Group Name
    {
        accessorKey: 'feeGroup',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('feeGroup')}</div>,
        enableSorting: true
    },

    // 4. Balance Amount - HYDRATION-SAFE VERSION
    // 4. Balance Amount - HYDRATION-SAFE + SAME ALIGNMENT AS FEE GROUP
    {
        accessorKey: 'fsS_CurrentYrCharges',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Amount' />,
        cell: ({ row }) => <div>{row.getValue('fsS_TotalToBePaid')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_ConcessionAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Balance' />,
        cell: ({ row }) => <div>{row.getValue('fsS_ConcessionAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_WaivedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Concession' />,
        cell: ({ row }) => <div>{row.getValue('fsS_WaivedAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_AdjustedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fine' />,
        cell: ({ row }) => <div>{row.getValue('fsS_AdjustedAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_TotalToBePaid',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rebate' />,
        cell: ({ row }) => <div>{row.getValue('fsS_TotalToBePaid')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_PaidAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Waived Off' />,
        cell: ({ row }) => <div>{row.getValue('fsS_PaidAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_ToBePaid',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adjusted' />,
        cell: ({ row }) => <div>{row.getValue('fsS_ToBePaid')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_RefundAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Excess Paid' />,
        cell: ({ row }) => <div>{row.getValue('fsS_RefundAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'fsS_RunningExcessAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Running Excess' />,
        cell: ({ row }) => <div>{row.getValue('fsS_RunningExcessAmount')}</div>,
        enableHiding: true,
        enableSorting: false
    }
];

// 'use client';

// import { Checkbox } from '@/components/ui/checkbox';
// import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
// import type { ColumnDef, HeaderContext } from '@tanstack/react-table';

// export const getDynamicColumns = (data: any[]): ColumnDef<any>[] => {
//     if (!data || data.length === 0) return [];

//     const keys = Object.keys(data[0]);

//     return [
//         // 🔹 Checkbox column
//         {
//             id: 'select',
//             header: ({ table }) => (
//                 <Checkbox
//                     checked={
//                         table.getIsAllPageRowsSelected() ||
//                         (table.getIsSomePageRowsSelected() && 'indeterminate')
//                     }
//                     onCheckedChange={(value) =>
//                         table.toggleAllPageRowsSelected(!!value)
//                     }
//                     aria-label="Select all"
//                 />
//             ),
//             cell: ({ row }) => (
//                 <Checkbox
//                     checked={row.getIsSelected()}
//                     onCheckedChange={(value) =>
//                         row.toggleSelected(!!value)
//                     }
//                     aria-label="Select row"
//                 />
//             ),
//             enableSorting: false,
//             enableHiding: false,
//             size: 40
//         },

//         // 🔹 Serial No
//         {
//             id: 'serial',
//             header: () => <div className="text-center">Sl.No.</div>,
//             cell: ({ row, table }) => {
//                 const pageIndex = table.getState().pagination.pageIndex;
//                 const pageSize = table.getState().pagination.pageSize;
//                 return (
//                     <div className="text-center font-medium">
//                         {pageIndex * pageSize + row.index + 1}
//                     </div>
//                 );
//             },
//             enableSorting: false,
//             enableHiding: false,
//             size: 80
//         },

//         // 🔹 Dynamic columns
//         ...keys.map(
//             (key): ColumnDef<any> => ({
//                 accessorKey: key,
//                 header: ({ column }: HeaderContext<any, unknown>) => (
//                     <DataTableColumnHeader
//                         column={column}
//                         title={key
//                             .replace(/_/g, ' ')
//                             .replace(/([A-Z])/g, ' $1')
//                             .trim()}
//                     />
//                 ),
//                 cell: ({ row }) => {
//                     const value = row.getValue(key);

//                     if (value === null || value === undefined) {
//                         return <div>-</div>;
//                     }

//                     if (typeof value === 'object') {
//                         return <div>{JSON.stringify(value)}</div>;
//                     }

//                     if (typeof value === 'number') {
//                         return (
//                             <div className="text-right font-medium">
//                                 {value.toLocaleString()}
//                             </div>
//                         );
//                     }

//                     return <div className="font-medium">{String(value)}</div>;
//                 }

//             })
//         )
//     ];
// };
