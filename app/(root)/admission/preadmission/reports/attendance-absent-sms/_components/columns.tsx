import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export const attendanceSummaryColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'RowNo',
        header: () => <div className='font-bold text-black'>Sl. No.</div>,
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: () => <div className='font-bold text-black'>Class</div>
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: () => <div className='font-bold text-black'>Section</div>
    },
    {
        accessorKey: 'PRESENT',
        header: () => <div className='font-bold text-black'>Present</div>
    },
    {
        accessorKey: 'ABSENT',
        header: () => <div className='font-bold text-black'>Absent</div>
    },
    {
        accessorKey: 'HALFDAY',
        header: () => <div className='font-bold text-black'>Half Day</div>
    },
    {
        accessorKey: 'TOTAL',
        header: () => <div className='font-bold text-black'>Total</div>
    }
];

export const absentStudentColumns = (attendanceType: string): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [
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
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            ),
            enableSorting: false,
            enableHiding: false
        }
    ];

    if (attendanceType === 'twice') {
        columns.push(
            {
                accessorKey: 'FirstHalf',
                header: () => <div className='font-bold text-black'>I Half</div>,
                cell: (info) => (
                    <Checkbox
                        checked={
                            info.row.original.ASA_Class_Attended === 0.5 ||
                            (info.row.original.ASA_Class_Attended === 0.0 && info.row.original.FirstHalf === 1)
                        }
                        disabled
                    />
                )
            },
            {
                accessorKey: 'SecondHalf',
                header: () => <div className='font-bold text-black'>II Half</div>,
                cell: (info) => (
                    <Checkbox
                        checked={
                            info.row.original.ASA_Class_Attended === 0.5 ||
                            (info.row.original.ASA_Class_Attended === 0.0 && info.row.original.SecondHalf === 1)
                        }
                        disabled
                    />
                )
            }
        );
    }

    columns.push(
        {
            accessorKey: 'RowNo',
            header: () => <div className='font-bold text-black'>Sl.No.</div>,
            cell: (info) => info.row.index + 1
        },
        {
            accessorKey: 'classsection',
            header: () => <div className='font-bold text-black'>Class-Section</div>
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: () => <div className='font-bold text-black'>Adm.No.</div>
        },
        {
            accessorKey: 'studentname',
            header: () => <div className='font-bold text-black'>Student Name</div>
        }
    );

    return columns;
};
