'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterQuestionCollegeList } from '@/types/exam/online-exam/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { BookOpen, GitBranch } from 'lucide-react';
import { useCallback } from 'react';

interface MasterQuestionCollegeColumnsProps {
    onOpenOptionsModal: (question: IMasterQuestionCollegeList) => void;
    onOpenBranchMappingModal: (question: IMasterQuestionCollegeList) => void;
}

export const getMasterQuestionCollegeColumns = ({
    onOpenOptionsModal,
    onOpenBranchMappingModal
}: MasterQuestionCollegeColumnsProps): ColumnDef<IMasterQuestionCollegeList>[] => [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'amcO_CourseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Course' />,
        cell: ({ row }) => <div>{row.getValue('amcO_CourseName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'amB_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch' />,
        cell: ({ row }) => <div>{row.getValue('amB_BranchName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'amsE_SEMName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Semester' />,
        cell: ({ row }) => <div>{row.getValue('amsE_SEMName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div className='font-semibold text-primary'>{row.getValue('ismS_SubjectName') || 'N/A'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmsmcQ_Question',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Question' />,
        cell: ({ row }) => (
            <div className='max-w-xs truncate font-medium' title={row.getValue('lmsmcQ_Question')}>
                {row.getValue('lmsmcQ_Question')}
            </div>
        ),
        enableSorting: true
    },
    {
        accessorKey: 'lmsmcQ_Marks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks' />,
        cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('lmsmcQ_Marks')}</div>,
        enableSorting: true,
        size: 90
    },
    {
        id: 'mappings',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch & Options' className='text-center' />,
        cell: ({ row }) => (
            <div className='flex items-center justify-center gap-2'>
                <Button
                    size='sm'
                    variant='outline'
                    className='flex h-8 items-center gap-1.5 text-xs hover:border-primary'
                    onClick={() => onOpenBranchMappingModal(row.original)}>
                    <GitBranch className='h-3.5 w-3.5 text-blue-500' />
                    Branch Map
                </Button>
                <Button
                    size='sm'
                    variant='outline'
                    className='flex h-8 items-center gap-1.5 text-xs hover:border-primary'
                    onClick={() => onOpenOptionsModal(row.original)}>
                    <BookOpen className='h-3.5 w-3.5 text-emerald-500' />
                    Options
                </Button>
            </div>
        ),
        enableSorting: false
    },
    {
        accessorKey: 'lmsmcQ_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => getStatusBadge(row.getValue('lmsmcQ_ActiveFlg') ? 'active' : 'inactive'),
        enableSorting: true,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        size: 120,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterQuestionCollegeList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterQuestionCollegeList>();

    const handleEdit = useCallback(
        (data: IMasterQuestionCollegeList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterQuestionCollegeList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{
                edit: true,
                toggle: true
            }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='lmsmcQ_ActiveFlg'
        />
    );
}
