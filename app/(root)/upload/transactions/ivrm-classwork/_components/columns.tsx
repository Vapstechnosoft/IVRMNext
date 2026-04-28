'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';

interface ClassWorkColumnProps {
    onEdit: (row: IClassWorkDetails) => void;
    onToggle: (row: IClassWorkDetails) => void;
    onView: (row: IClassWorkDetails) => void;
}

export const classWorkColumns = ({
    onEdit,
    onToggle,
    onView
}: ClassWorkColumnProps): ColumnDef<IClassWorkDetails>[] => [
        {
            accessorKey: 'icW_Id',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'isms_SubjectName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='text-xs font-black uppercase text-black justify-left' />,
            cell: ({ row }) => <div className='text-[11px] font-bold text-slate-600 uppercase'>{row.getValue('isms_SubjectName')}</div>
        },
        {
            accessorKey: 'icW_Topic',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Topic' className='text-xs font-black uppercase text-black justify-left' />,
            cell: ({ row }) => <div className='text-[11px] font-medium text-slate-600'>{row.getValue('icW_Topic')}</div>
        },
        {
            accessorKey: 'icW_SubTopic',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sub Topic' className='text-xs font-black uppercase text-black justify-left' />,
            cell: ({ row }) => <div className='text-[11px] font-medium text-slate-500 italic'>{row.getValue('icW_SubTopic')}</div>
        },
        {
            accessorKey: 'icW_Content',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Content' className='text-xs font-black uppercase text-black justify-left' />,
            cell: ({ row }) => <div className='text-[11px] text-slate-600 max-w-[200px] truncate' title={row.getValue('icW_Content')}>{row.getValue('icW_Content')}</div>
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => <div className='text-[11px] font-black text-center text-slate-700'>{row.getValue('asmcL_ClassName')}</div>
        },
        {
            accessorKey: 'asmC_SectionName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => <div className='text-[11px] font-black text-center text-slate-700'>{row.getValue('asmC_SectionName')}</div>
        },
        {
            id: 'updateDateTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Update Date / Time' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => {
                const data = row.original as any;
                return <div className='text-[10px] text-center text-slate-400 font-medium tracking-tighter'>{data.createdDate ? `${data.createdDate} ${data.createdTime || ''}` : '---'}</div>;
            }
        },
        {
            accessorKey: 'icW_FromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Start Date' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => {
                const date = row.getValue('icW_FromDate');
                return <div className='text-[11px] font-bold text-center text-blue-600'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
            }
        },
        {
            accessorKey: 'icW_ToDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='End Date' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => {
                const date = row.getValue('icW_ToDate');
                return <div className='text-[11px] font-bold text-center text-blue-600'>{date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}</div>;
            }
        },
        {
            id: 'attachment',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Attachment' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => {
                const rowData = row.original;
                const hasAttachment = (rowData as any).filesCount > 0 || rowData.icW_Attachment || (rowData as any).attachementlist?.length > 0;
                return (
                    <div className='flex justify-center'>
                        {hasAttachment ? (
                            <button
                                type='button'
                                onClick={() => onView(rowData)}
                                className='rounded-md p-1.5 bg-blue-50 text-blue-600 transition hover:bg-blue-600 hover:text-white shadow-sm ring-1 ring-blue-100 hover:ring-blue-600 transition-all duration-300'
                                title='View Attachments'
                            >
                                <Eye className='h-3.5 w-3.5 shadow-sm' />
                            </button>
                        ) : (
                            <span className='text-slate-300 text-[10px] font-bold tracking-widest'>---</span>
                        )}
                    </div>
                );
            }
        },
        {
            id: 'actions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-xs font-black uppercase text-black justify-center' />,
            cell: ({ row }) => {
                const rowData = row.original;
                return (
                    <div className='flex items-center justify-center gap-3'>
                        <button
                            type='button'
                            onClick={() => onEdit(rowData)}
                            className='group rounded-md p-1.5 bg-slate-50 text-blue-600 transition hover:bg-blue-600 hover:text-white shadow-sm ring-1 ring-slate-100 hover:ring-blue-600 transition-all duration-300'
                            title='Edit'
                        >
                            <Pencil className='h-3.5 w-3.5 group-hover:scale-110 transition-transform' />
                        </button>
                        <ActionButtons
                            rowData={rowData}
                            buttons={{ edit: false, toggle: true, delete: false }}
                            onToggle={() => onToggle(rowData)}
                            toggleConditionKey='icW_ActiveFlag'
                        />
                    </div>
                );
            }
        }
    ];
