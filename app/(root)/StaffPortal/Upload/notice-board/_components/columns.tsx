'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { INoticeBoard } from '@/schemas/upload/transactions/notice-board.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash2, UserCheck, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export const getNoticeBoardColumns = (
    onEdit: (row: INoticeBoard) => void,
    onToggle: (row: INoticeBoard) => void,
    onViewRecords: (row: INoticeBoard) => void,
    onViewAttachment: (row: INoticeBoard) => void,
): ColumnDef<INoticeBoard>[] => [
        {
            accessorKey: 'index',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            enableSorting: false,
        },
        {
            accessorKey: 'asmaY_Year',
            header: 'Academic Year',
            enableSorting: true,
            cell: ({ row }) => (
                <div className="font-medium text-slate-700">{row.original.asmaY_Year || '---'}</div>
            )
        },
        {
            accessorKey: 'intB_Title',
            header: 'Notice Title',
            enableSorting: true,
            cell: ({ row }) => <div className="font-medium">{row.original.intB_Title}</div>
        },
        {
            header: 'Target',
            cell: ({ row }) => {
                const isStaff = row.original.intB_ToStaffFlg === 'true' || row.original.intB_ToStaffFlg === true;
                const isStudent = row.original.intB_ToStudentFlg === 'true' || row.original.intB_ToStudentFlg === true;
                return (
                    <div className="flex gap-1">
                        {isStaff && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Staff</span>}
                        {isStudent && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Student</span>}
                        {!isStaff && !isStudent && <span className="text-gray-400 text-xs">---</span>}
                    </div>
                );
            }
        },
        {
            header: 'Files',
            accessorKey: 'FilesCount',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    {row.original.FilesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700 border border-green-100">
                             {row.original.FilesCount} FILES
                        </span>
                    ) : (
                        <span className="text-gray-300 text-xs">---</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'intB_Description',
            header: 'Description',
            enableSorting: true,
            cell: ({ row }) => (
                <div>
                    {row.original.intB_Description || '---'}
                </div>
            )
        },
        {
            accessorKey: 'intB_StartDate',
            header: 'Start Date',
            cell: ({ row }) => {
                const date = row.original.intB_StartDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '---';
            }
        },
        {
            accessorKey: 'intB_EndDate',
            header: 'End Date',
            cell: ({ row }) => {
                const date = row.original.intB_EndDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '---';
            }
        },
        {
            accessorKey: 'intB_DisplayDate',
            header: 'Display Date',
            cell: ({ row }) => {
                const date = row.original.intB_DisplayDate;
                return date ? format(new Date(date), 'dd/MM/yyyy') : '---';
            }
        },
        {
            id: 'view_attachment',
            header: 'View Attachment',
            cell: ({ row }) => {
                const data = row.original;
                const hasFiles = data.intB_FilePath_Array && data.intB_FilePath_Array.length > 0;
                return (
                    <div className="flex justify-center">
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => onViewAttachment(data)}
                            className='h-8 w-8 text-blue-500 hover:bg-blue-50'
                            disabled={!hasFiles}
                        >
                            {hasFiles ? <Paperclip className='h-4 w-4' /> : <span className="text-slate-400">---</span>}
                        </Button>
                    </div>
                );
            }
        },
        {
            id: 'edit',
            header: 'Edit',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button variant='ghost' size='icon' onClick={() => onEdit(row.original)} className='h-8 w-8 text-blue-600 hover:bg-blue-50'>
                        <Pencil className='h-4 w-4' />
                    </Button>
                </div>
            )
        },
        {
            id: 'view_details',
            header: 'View Details',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button variant='ghost' size='icon' onClick={() => onViewRecords(row.original)} className='h-8 w-8 text-indigo-600 hover:bg-indigo-50'>
                        <Eye className='h-4 w-4' />
                    </Button>
                </div>
            )
        },
        {
            id: 'action',
            header: 'Action',
            cell: ({ row }) => {
                const isActive = row.original.intB_ActiveFlag;
                return (
                    <div className="flex justify-center">
                        <Button
                            variant='link'
                            size='sm'
                            onClick={() => onToggle(row.original)}
                            className={cn(
                                'h-8 px-2 font-semibold transition-colors',
                                isActive ? 'text-destructive hover:text-red-700' : 'text-green-600 hover:text-green-700'
                            )}
                        >
                            {isActive ? 'De-Activate' : 'Activate'}
                        </Button>
                    </div>
                );
            }
        },
    ];
