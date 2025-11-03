'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import { useFormContext } from '@/components/ui/form/form-provider';
import { getStudentApplicationForm } from '@/server/admission/preadmission/transactions/application_form';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ReceiptIndianRupee } from 'lucide-react';
import { Edit } from 'lucide-react';

import { ROLES } from '@/constants';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ReceiptIndianRupee } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

import PaymentDialog from './payment-dialog';
import ToggleStudentApplicationForm from './toggle-form';

export const studentApplicationColumns: ColumnDef<IPreadmissionStudentApplicationList>[] = [
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
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Application No' />,
        cell: ({ row }) => <div>{row.getValue('pasR_RegistrationNo') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'student_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div>{row.getValue('student_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pasR_Sex',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
        cell: ({ row }) => <div>{row.getValue('pasR_Sex')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'applied_class_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Class' />,
        cell: ({ row }) => <div>{row.getValue('applied_class_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'application_status',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Application Status' />,
        cell: ({ row }) => <div>{row.getValue('application_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'admission_status',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Admission Status' />,
        cell: ({ row }) => <div>{row.getValue('admission_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_by',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='User Name' />,
        cell: ({ row }) => <div>{row.getValue('applied_by')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader className='text-center' column={column} title='Actions' />,
        accessorFn: (row: any) => {
            return row;
        },
        enableHiding: false,
        enableSorting: false,
        cell: ({ cell }: { cell: any }) => {

            const { openEditForm } = useFormContext<IPreadmissionStudentApplicationList>();

            return (
                <div className='flex items-center gap-2'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={async () => {
                            try {
                                const rowData = cell.row.original;
                                const response = await getStudentApplicationForm(rowData.pasr_id);

                                // The server returns a wrapper containing multiple related arrays
                                // (student_details, student_sources, student_refrences, etc.).
                                // The Update form expects a flat object with properties like
                                // pasR_* plus helper arrays named selectedSourceDetails,
                                // selectedRefrenceDetails, siblingsDetails, previousSchoolList,
                                // selectedDocuments. Transform the response accordingly and
                                // then open the edit form with the mapped payload.
                                const resp = response.data;
                                const student = resp?.student_details || resp || {};

                                const payload = {
                                    // spread the core student fields (pasR_*, etc.)
                                    ...student,
                                    // map sources/references to the shape expected by the form
                                    selectedSourceDetails: (resp?.student_sources || resp?.studentSource || []).map((s: any) => ({
                                        pamS_Id: String(s.pamS_Id)
                                    })),
                                    selectedRefrenceDetails: (resp?.student_refrences || resp?.studentReference || []).map((r: any) => ({
                                        pamR_Id: String(r.pamR_Id)
                                    })),
                                    // siblings & previous schools kept as-is
                                    siblingsDetails: resp?.student_siblings || [],
                                    previousSchoolList: resp?.previous_schools || [],
                                    // map documents to the expected fields
                                    selectedDocuments: (resp?.student_documents || []).map((d: any) => ({
                                        pasrD_Id: d.pasrD_Id,
                                        pasR_Id: d.pasR_Id,
                                        amsmD_Id: d.amsmD_Id,
                                        document_Path: d.document_Path
                                    }))
                                };

                                openEditForm(payload);
                            } catch (error) {
                                console.error('Error fetching application details:', error);
                            }
                        }}
                        className='p-1'>
                        <Edit className='h-4 w-4' />
                    </Button>


            const session = useSession();

            useEffect(() => {
                if (session?.data?.role === undefined) {
                    window.location.reload();
                }
            }, [session?.data?.role]);

            return (
                <div className='flex justify-between gap-2'>

                    {cell.row.original.is_fee_applicable === 1 ? (
                        cell.row.original.payment_status === 0 ? (
                            <PaymentDialog cell={cell} />
                        ) : (
                            <Badge className='cursor-not-allowed bg-green-500 p-3 font-extrabold text-black hover:bg-green-600'>
                                <ReceiptIndianRupee className='h-4 w-4' /> Paid
                            </Badge>
                        )
                    ) : (
                        <p className='text-slate-600 text-sm'>No Fee</p>
                    )}


                    {session?.data?.role.toUpperCase() === ROLES.ADMIN && <ToggleStudentApplicationForm cell={cell} />}

                </div>
            );
        }
    }
];
