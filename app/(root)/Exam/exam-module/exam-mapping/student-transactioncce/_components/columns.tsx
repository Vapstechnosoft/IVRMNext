// app/exam/student-transaction/_components/columns.tsx
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Input } from '@/components/ui/input';
import type { IStudentTransactionGrid } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

type ScoreUpdateHandler = (studentId: number, score: number) => void;

export const StudentTransactionColumns = (onScoreUpdate: ScoreUpdateHandler): ColumnDef<IStudentTransactionGrid>[] => [
    // SELECT
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
                aria-label={`Select ${row.original.studentName}`}
            />
        ),
        enableSorting: false,
        size: 40
    },

    {
        accessorKey: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: true
    },

    // STUDENT NAME
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.studentName}</div>,
        size: 200
    },

    // REG NO
    {
        accessorKey: 'regNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reg.No' />,
        cell: ({ row }) => <div>{row.getValue('regNumber')}</div>,
        size: 120
    },

    // ROLL NO
    {
        accessorKey: 'rollNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
        cell: ({ row }) => <div>{row.getValue('rollNumber')}</div>,
        size: 80
    },

    // ✅ SCORE — FIXED (NO FOCUS LOSS)
    {
        accessorKey: 'score',
        header: ({ column }) => <DataTableColumnHeader column={column} className='PL-4 text-left' title='Score' />,
        cell: ({ row }) => {
            const { amsT_Id: studentId, score } = row.original;

            // ✅ Local state ONLY
            const [localValue, setLocalValue] = useState<string>(score !== null && score !== undefined ? score.toString() : '');

            // ✅ Sync when data changes (pagination / reload)
            useEffect(() => {
                setLocalValue(score !== null && score !== undefined ? score.toString() : '');
            }, [score]);

            const handleBlur = () => {
                const num = Number(localValue);

                if (Number.isNaN(num) || localValue === '') {
                    setLocalValue('0');
                    onScoreUpdate(studentId, 0);
                } else if (num < 0) {
                    setLocalValue('0');
                    onScoreUpdate(studentId, 0);
                } else if (num > 100) {
                    setLocalValue('100');
                    onScoreUpdate(studentId, 100);
                } else {
                    onScoreUpdate(studentId, num);
                }
            };

            return (
                <div className='w-24'>
                    <Input
                        type='text'
                        inputMode='numeric'
                        value={localValue}
                        onChange={(e) => {
                            const value = e.target.value;

                            // ✅ only numbers / empty
                            if (value === '' || /^\d+$/.test(value)) {
                                setLocalValue(value);
                            }
                        }}
                        onBlur={handleBlur}
                        className='text-center'
                        placeholder='0-100'
                    />
                </div>
            );
        },
        enableSorting: false,
        size: 100
    }
];
