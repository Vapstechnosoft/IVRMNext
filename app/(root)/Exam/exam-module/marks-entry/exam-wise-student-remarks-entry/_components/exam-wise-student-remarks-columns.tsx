import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Textarea } from '@/components/ui/textarea';
import type { IExamWiseStudentRemarksStudent } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';

// ------------------------------------------------------
// Columns — Exam Wise Student Remarks
// ------------------------------------------------------
// Accepts a callback to update student data in parent
export const ExamWiseStudentRemarksColumns = (
    updateStudent: (index: number, updated: IExamWiseStudentRemarksStudent) => void
): ColumnDef<IExamWiseStudentRemarksStudent>[] => [
    // ------------------------------------------------------
    // SELECT CHECKBOX
    // ------------------------------------------------------
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
        size: 24
    },

    // ------------------------------------------------------
    // SL.NO
    // ------------------------------------------------------
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },

    // ------------------------------------------------------
    // STUDENT NAME BLOCK
    // ------------------------------------------------------
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const data = row.original;

            return (
                <div className='flex flex-col text-sm leading-6'>
                    <div>
                        <span className='font-semibold'>Name :</span> {data.amsT_FirstName}
                    </div>
                    <div>
                        <span className='font-semibold'>Adm.No. :</span> {data.amsT_AdmNo}
                    </div>
                    <div>
                        <span className='font-semibold'>Reg.No. :</span> {data.amsT_RegistrationNo}
                    </div>
                    <div>
                        <span className='font-semibold'>Roll.No. :</span> {data.amaY_RollNo}
                    </div>
                </div>
            );
        }
    },

    // ------------------------------------------------------
    // MARKS BLOCK
    // ------------------------------------------------------
    {
        accessorKey: 'estmP_TotalObtMarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks' />,
        cell: ({ row }) => {
            const data = row.original;

            return (
                <div className='flex flex-col text-sm leading-6'>
                    <div>
                        <span className='font-semibold'>Obtained Marks :</span> {data.estmP_TotalObtMarks ?? '-'}
                    </div>
                    <div>
                        <span className='font-semibold'>Max Marks :</span> {data.estmP_TotalMaxMarks ?? '-'}
                    </div>
                    <div>
                        <span className='font-semibold'>Percentage :</span> {data.estmP_Percentage ?? '-'}
                    </div>
                </div>
            );
        }
    },

    // ------------------------------------------------------
    // REMARKS TEXT AREA
    // ------------------------------------------------------
    {
        accessorKey: 'emeR_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
        cell: ({ row }) => {
            const value = row.original.emeR_Remarks ?? '';

            return (
                <Textarea
                    value={value}
                    onChange={(e) => {
                        const updated = { ...row.original, emeR_Remarks: e.target.value };
                        updateStudent(row.index, updated); // call parent callback
                    }}
                    className='h-20 resize-none border-blue-300 focus-visible:ring-blue-400'
                    placeholder='Enter remarks'
                />
            );
        },
        enableSorting: false
    }
];
