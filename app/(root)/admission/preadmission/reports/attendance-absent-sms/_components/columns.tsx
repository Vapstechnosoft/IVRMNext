import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export const attendanceSummaryColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'RowNo',
        header: 'Sl. No.',
        cell: (info) => info.getValue()
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class'
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: 'Section'
    },
    {
        accessorKey: 'PRESENT',
        header: 'Present'
    },
    {
        accessorKey: 'ABSENT',
        header: 'Absent'
    },
    {
        accessorKey: 'HALFDAY',
        header: 'Half Day'
    },
    {
        accessorKey: 'TOTAL',
        header: 'Total'
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
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                />
            ),
            enableSorting: false,
            enableHiding: false
        }
    ];

    if (attendanceType === 'twice') {
        columns.push(
            {
                accessorKey: 'FirstHalf',
                header: 'I Half',
                cell: (info) => (
                    <Checkbox
                        checked={info.row.original.ASA_Class_Attended === 0.5 || (info.row.original.ASA_Class_Attended === 0.0 && info.row.original.FirstHalf === 1)}
                        disabled
                    />
                )
            },
            {
                accessorKey: 'SecondHalf',
                header: 'II Half',
                cell: (info) => (
                    <Checkbox
                        checked={info.row.original.ASA_Class_Attended === 0.5 || (info.row.original.ASA_Class_Attended === 0.0 && info.row.original.SecondHalf === 1)}
                        disabled
                    />
                )
            }
        );
    }

    columns.push(
        {
            accessorKey: 'RowNo',
            header: 'Sl.No.',
            cell: (info) => info.row.index + 1
        },
        {
            accessorKey: 'classsection',
            header: 'Class-Section'
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: 'Adm.No.'
        },
        {
            accessorKey: 'studentname',
            header: 'Student Name'
        }
    );

    return columns;
};
