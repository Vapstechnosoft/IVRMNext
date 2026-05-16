'use client';
import React from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { IBookCirculationReportGridData } from '@/types/library/reports/book-circulation-report';
import { format } from 'date-fns';

const SharedColumns: ColumnDef<IBookCirculationReportGridData>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true, // Use enableHiding as per user code, but enableSorting false
        enableSorting: false
    },
    {
        accessorKey: 'LMB_BOOKTITLE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div>{row.getValue('LMB_BOOKTITLE')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LMBANO_ACCESSIONNO',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => <div>{row.getValue('LMBANO_ACCESSIONNO')}</div>,
        enableSorting: true
    }
];

const StatusDateColumns: ColumnDef<IBookCirculationReportGridData>[] = [
    {
        accessorKey: 'LBTR_STATUS',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Transaction Status' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_STATUS')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_ISSUEDDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Issue Date' />,
        cell: ({ row }) => {
            const date = row.getValue('LBTR_ISSUEDDATE') as string;
            return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_DUEDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Due Date' />,
        cell: ({ row }) => {
            const date = row.getValue('LBTR_DUEDATE') as string;
            return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_RETURNEDDATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Return Date' />,
        cell: ({ row }) => {
            const date = row.getValue('LBTR_RETURNEDDATE') as string;
            return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_FINECOLLECTED',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fine Collected' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_FINECOLLECTED')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LBTR_TOTALFINE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Fine' />,
        cell: ({ row }) => <div>{row.getValue('LBTR_TOTALFINE')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'LMB_BOOKTYPE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => <div>{row.getValue('LMB_BOOKTYPE')}</div>,
        enableSorting: true
    }
];

export const getColumns = (memberType: string): ColumnDef<IBookCirculationReportGridData>[] => {
    let specificColumns: ColumnDef<IBookCirculationReportGridData>[] = [];

    if (memberType === 'Student') {
        specificColumns = [
            {
                accessorKey: 'AMST_ADMNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
                cell: ({ row }) => <div>{row.getValue('AMST_ADMNO')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'AMST_NAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                cell: ({ row }) => <div>{row.getValue('AMST_NAME')}</div>,
                enableSorting: true
            },
            {
                id: 'ASMCL_CLASSNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
                cell: ({ row }) => <div>{(row.original as any).ASMCL_CLASSNAME || (row.original as any).ASMCL_CLASS_NAME || '--'}</div>,
                enableSorting: true
            },
            {
                id: 'ASMC_SECTIONNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
                cell: ({ row }) => <div>{(row.original as any).ASMC_SECTIONNAME || (row.original as any).ASMS_SECTIONNAME || '--'}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'AMAY_ROLLNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No.' />,
                cell: ({ row }) => <div>{row.getValue('AMAY_ROLLNO')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LATEDAYS',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Late Return Days' />,
                cell: ({ row }) => {
                    const days = row.getValue('LATEDAYS') as number;
                    return <div>{days > 0 ? days : '--'}</div>;
                },
                enableSorting: true
            }
        ];
    } else if (memberType === 'Staff') {
        specificColumns = [
            {
                accessorKey: 'EMPNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' />,
                cell: ({ row }) => <div>{row.getValue('EMPNAME')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'HRME_EMPLOYEECODE',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Code' />,
                cell: ({ row }) => <div>{row.getValue('HRME_EMPLOYEECODE')}</div>,
                enableSorting: true
            }
        ];
    } else if (memberType === 'Guest') {
        specificColumns = [
            {
                accessorKey: 'LBTR_GUESTNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Guest Name' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTNAME')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LBTR_GUESTEMAILID',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Mail' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTEMAILID')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'LBTR_GUESTCONTACTNO',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Contact' />,
                cell: ({ row }) => <div>{row.getValue('LBTR_GUESTCONTACTNO')}</div>,
                enableSorting: true
            }
        ];
    } else if (memberType === 'Department') {
        specificColumns = [
            {
                accessorKey: 'HRMD_DEPARTMENTNAME',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Department Name' />,
                cell: ({ row }) => <div>{row.getValue('HRMD_DEPARTMENTNAME')}</div>,
                enableSorting: true
            }
        ];
    }

    // Combine: Shared + Specific + Status/Dates
    return [
        ...SharedColumns,
        ...specificColumns,
        ...StatusDateColumns
    ];
};
