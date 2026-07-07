'use client';

import { ColumnDef } from '@tanstack/react-table';

export interface IApplicationStatus {
    PASRAPS_ID: number;
    data: number;
}

export interface IAdmissionStatus {
    PAMS_Id: number;
    PAMST_Status: string;
    Data_count: number;
}

export const getApplicationStatusColumns = (): ColumnDef<IApplicationStatus>[] => {
    return [
        {
            accessorKey: 'slno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            size: 50
        },
        {
            accessorKey: 'PASRAPS_ID',
            header: 'Application Status',
            cell: ({ row }) => {
                const id = row.original.PASRAPS_ID;
                if (id === 787926) return 'APP WAITING';
                if (id === 787927) return 'APP REJECTED';
                if (id === 787928) return 'APP ACCEPTED';
                return id;
            }
        },
        {
            accessorKey: 'data',
            header: 'Count'
        }
    ];
};

export const getAdmissionStatusColumns = (): ColumnDef<IAdmissionStatus>[] => {
    return [
        {
            accessorKey: 'slno',
            header: 'SL.NO',
            cell: ({ row }) => row.index + 1,
            size: 50
        },
        {
            accessorKey: 'PAMST_Status',
            header: 'Admission Status'
        },
        {
            accessorKey: 'Data_count',
            header: 'Count'
        }
    ];
};
