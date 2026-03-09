import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

export type LeaveStatusReportData = {
    hrelS_CBLeaves: number;
    hrelS_TotalLeaves: number;
    hrelS_TransLeaves: number;
    hrmE_EmployeeCode: string;
    hrmE_EmployeeName: string;
    hrmL_LeaveName: string;
};

export const columns: ColumnDef<LeaveStatusReportData>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>
    },
    {
        accessorKey: 'hrmE_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeCode')}</div>
    },
    {
        accessorKey: 'hrmE_EmployeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeName')}</div>
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Type' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmL_LeaveName')}</div>
    },
    {
        accessorKey: 'hrelS_TotalLeaves',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Leave' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrelS_TotalLeaves')}</div>
    },
    {
        accessorKey: 'hrelS_TransLeaves',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Used' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrelS_TransLeaves')}</div>
    },
    {
        accessorKey: 'hrelS_CBLeaves',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Leave Balance' />,
        cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('hrelS_CBLeaves')}</div>
    }
];
