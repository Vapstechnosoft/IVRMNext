'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeListItem } from '@/types/hrms/employee';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { ActionsCell } from './actions-cell';

export const employeeColumns: ColumnDef<EmployeeListItem>[] = [
    {
        id: 'slNo',
        header: 'Sl No',
        cell: ({ row }) => {
            return <div className='w-[50px] text-center'>{row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'HRME_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='First Name' />,
        cell: ({ row }) => {
            const firstName = row.getValue('HRME_EmployeeFirstName') as string;
            return <div>{firstName || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRME_EmployeeMiddleName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Middle Name' />,
        cell: ({ row }) => {
            const middleName = row.getValue('HRME_EmployeeMiddleName') as string;
            return <div>{middleName || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRME_EmployeeLastName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Last Name' />,
        cell: ({ row }) => {
            const lastName = row.getValue('HRME_EmployeeLastName') as string;
            return <div>{lastName || '-'}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'HRME_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => {
            const code = row.getValue('HRME_EmployeeCode') as string;
            return <div className='font-medium'>{code || '-'}</div>;
        },
        enableSorting: true
    },
    {
        id: 'employeePhoto',
        header: 'Employee Photo',
        cell: ({ row }) => {
            const photoUrl = row.original.HRME_Photo;
            const firstName = row.original.HRME_EmployeeFirstName;
            const lastName = row.original.HRME_EmployeeLastName;
            const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
            
            return (
                <div className='flex items-center gap-2'>
                    <div className='relative h-10 w-10'>
                        {photoUrl ? (
                            <>
                                <img 
                                    src={photoUrl} 
                                    alt={`${firstName} ${lastName}`}
                                    className='h-10 w-10 rounded-full object-cover'
                                    onError={(e) => {
                                        // Show initials fallback on error
                                        const target = e.target as HTMLImageElement;
                                        const parent = target.parentElement;
                                        if (parent) {
                                            const fallback = parent.querySelector('.initials-fallback') as HTMLDivElement;
                                            if (fallback) {
                                                target.style.display = 'none';
                                                fallback.style.display = 'flex';
                                            }
                                        }
                                    }}
                                />
                                <div className='initials-fallback absolute inset-0 hidden h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
                                    {initials || '?'}
                                </div>
                            </>
                        ) : (
                            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
                                {initials || '?'}
                            </div>
                        )}
                    </div>
                    <button 
                        className='text-xs text-primary hover:underline'
                        onClick={() => {
                            if (photoUrl) {
                                window.open(photoUrl, '_blank');
                            }
                        }}
                        disabled={!photoUrl}
                    >
                        Download
                    </button>
                </div>
            );
        },
        enableSorting: false
    },
    {
        accessorKey: 'HRME_EmployeeOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Order' />,
        cell: ({ row }) => {
            const order = row.original.HRME_EmployeeOrder || row.index + 1;
            return <div className='text-center'>{order}</div>;
        },
        enableSorting: true
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionsCell row={row} />
    }
];
