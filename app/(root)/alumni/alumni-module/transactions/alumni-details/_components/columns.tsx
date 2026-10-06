'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IAlumniStudentDetail } from '@/types/alumni/alumni-membership';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

import { Badge } from '@/components/ui/badge';

export const AlumniDetailsColumns: ColumnDef<IAlumniStudentDetail>[] = [
    {
        id: 'slNo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Sl.No' className='justify-center text-center font-bold text-black' />
        ),
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='text-center'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        id: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Alumnus Name' className='justify-center text-center font-bold text-black' />
        ),
        accessorFn: (row) => row.amsT_FirstName || row.almsT_FirstName || '',
        cell: ({ row }) => {
            const name = row.original.amsT_FirstName || row.original.almsT_FirstName || '';
            const isReadmitted = row.original.readmitted_student;
            return (
                <div className='flex flex-col items-center gap-1 text-center'>
                    <span className='font-medium'>{name}</span>
                    {isReadmitted && (
                        <Badge
                            variant='secondary'
                            className='h-4 w-fit border-amber-200 bg-amber-100 px-1.5 text-[10px] text-amber-700 hover:bg-amber-100'>
                            Readmitted
                        </Badge>
                    )}
                </div>
            );
        },
        enableSorting: true
    },
    {
        id: 'year',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Year' className='justify-center text-center font-bold text-black' />
        ),
        accessorFn: (row) => {
            const joinYear = row.asmaY_Year_Join || row.joinyear || row.asmaY_Year || row.yeardmitted || row.amsT_JOIN_YEAR || '';
            const leftYear = row.asmaY_Year_Left || row.leftyear || row.yearleft || row.amsT_JOIN_LEFT || '';
            return `${joinYear} ${leftYear}`;
        },
        cell: ({ row }) => {
            const item = row.original;
            const joinYear = item.asmaY_Year_Join || item.joinyear || item.asmaY_Year || item.yeardmitted || item.amsT_JOIN_YEAR || '-';
            const leftYear = item.asmaY_Year_Left || item.leftyear || item.yearleft || item.amsT_JOIN_LEFT || '-';
            return (
                <div className='flex flex-col text-xs'>
                    <span>Join: {joinYear}</span>
                    <span>Left: {leftYear}</span>
                </div>
            );
        }
    },
    {
        id: 'class',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Class' className='justify-center text-center font-bold text-black' />
        ),
        accessorFn: (row) => {
            const joinClass = row.asmcL_ClassName_Join || row.asmcl_classname || row.asmcL_ClassName || row.classnameadmitted || row.amsT_CLASS_JOIN || '';
            const leftClass = row.asmcL_ClassName_Left || row.leftclass || row.classnameleft || row.amsT_CLASS_LEFT || '';
            return `${joinClass} ${leftClass}`;
        },
        cell: ({ row }) => {
            const item = row.original;
            const joinClass = item.asmcL_ClassName_Join || item.asmcl_classname || item.asmcL_ClassName || item.classnameadmitted || item.amsT_CLASS_JOIN || '-';
            const leftClass = item.asmcL_ClassName_Left || item.leftclass || item.classnameleft || item.amsT_CLASS_LEFT || '-';
            return (
                <div className='flex flex-col text-xs'>
                    <span>Join: {joinClass}</span>
                    <span>Left: {leftClass}</span>
                </div>
            );
        }
    },
    {
        accessorKey: 'almsT_MobileNo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Mobile No' className='justify-center text-center font-bold text-black' />
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('almsT_MobileNo')}</div>
    },
    {
        accessorKey: 'almsT_emailId',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Email Id' className='justify-center text-center font-bold text-black' />
        ),
        cell: ({ row }) => (
            <div className='text-center'>
                <a href={`mailto:${row.getValue('almsT_emailId')}`} className='text-primary hover:underline'>
                    {row.getValue('almsT_emailId')}
                </a>
            </div>
        )
    },
    {
        accessorKey: 'almsT_BloodGroup',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Blood Group' className='justify-center text-center font-bold text-black' />
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('almsT_BloodGroup') || '-'}</div>
    },
    {
        accessorKey: 'almsT_FatherName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Father Name' className='justify-center text-center font-bold text-black' />
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('almsT_FatherName')}</div>
    },
    {
        id: 'location',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='State/City' className='justify-center text-center font-bold text-black' />
        ),
        accessorFn: (row) => {
            const state = row.ivrmmS_Name || (row.city ? row.city.split(':')[0] : '');
            const city = row.almsT_ConCity || (row.city && row.city.includes(':') ? row.city.split(':')[1] : '');
            if (state && city) return `${state}:${city}`;
            return state || city || '';
        },
        cell: ({ row }) => {
            const item = row.original;
            const state = item.ivrmmS_Name || (item.city ? item.city.split(':')[0] : '');
            const city = item.almsT_ConCity || (item.city && item.city.includes(':') ? item.city.split(':')[1] : '');
            let loc = '-';
            if (state && city) loc = `${state}:${city}`;
            else if (state) loc = state;
            else if (city) loc = city;
            return (
                <div className='text-center'>
                    {loc}
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Actions' className='justify-center text-center font-bold text-black' />
        ),
        enableSorting: false,
        cell: ({ row }) => (
            <div className='flex items-center justify-center'>
                <ActionButtonsCell rowData={row.original} />
            </div>
        )
    }
];

function ActionButtonsCell({ rowData }: { rowData: IAlumniStudentDetail }) {
    const { openEditForm, openToggleForm } = useFormContext<IAlumniStudentDetail>();

    const handleEdit = useCallback(
        (data: IAlumniStudentDetail) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    // const handleToggle = useCallback(
    //     (data: IAlumniStudentDetail) => {
    //         openToggleForm(data);
    //     },
    //     [openToggleForm]
    // );

    const normalizedRowData = {
        ...rowData,
        active_flag: rowData.ALMST_ActiveFlag ?? rowData.almsT_ActiveFlag
    };

    return (
        <ActionButtons
            rowData={normalizedRowData}
            buttons={{ edit: true }}
            onEdit={handleEdit}
            // onToggle={handleToggle}
        />
    );
}
