'use client'

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

export interface IPromotionalGroupDetails {
    slNo: number
    groupName: string
    displayName: string
    percentage: number
    marks: number
    maxOff: number
    bestOff: number
    roundOffFlag: boolean
}

export const PromotionalGroupMappingColumns: ColumnDef<IPromotionalGroupDetails>[] = [

    { accessorKey: 'slNo', header: ({ column }) => <DataTableColumnHeader title='SLNO' column={column} />, cell: ({ row }) => row.index + 1 },

    { accessorKey: 'groupName', header: ({ column }) => <DataTableColumnHeader title='Group Name' column={column} /> },

    { accessorKey: 'displayName', header: ({ column }) => <DataTableColumnHeader title='Display Name' column={column} /> },

    { accessorKey: 'percentage', header: ({ column }) => <DataTableColumnHeader title='Percentage' column={column} /> },

    { accessorKey: 'marks', header: ({ column }) => <DataTableColumnHeader title='Marks' column={column} /> },

    { accessorKey: 'maxOff', header: ({ column }) => <DataTableColumnHeader title='Max Off' column={column} /> },

    { accessorKey: 'bestOff', header: ({ column }) => <DataTableColumnHeader title='Best Off' column={column} /> },

    {
        accessorKey: 'roundOffFlag',
        header: ({ column }) => <DataTableColumnHeader title='Round Off Flag' column={column} />,
        cell: ({ row }) => row.original.roundOffFlag ? '✔' : '✖'
    },

    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            // <button onClick={() => row.original.openExamList(row.original)}>
            //     <Eye className="text-blue-600 cursor-pointer" />
            // </button>
            <></>
        )
    }
]
