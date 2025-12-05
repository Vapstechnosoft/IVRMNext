'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit } from 'lucide-react';

import { ROLES } from '@/constants';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { useStudentApplicationForm } from '@/hooks/admission/preadmission/useTransactions';
import type { IadmissionStudentApplicationList } from '@/types/admission/admission';
import { toast } from 'sonner';
import DeleteMasterClassForm from './toggle-form';

export const studentApplicationColumns: ColumnDef<IadmissionStudentApplicationList>[] = [
    {
        accessorKey: 'pasr_id',
        header: ({ column }) => <DataTableColumnHeader className='w-full pl-6' column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'pasR_profile',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name/view Profile' />,
        cell: ({ row }) => <div>{row.getValue('pasR_profile') ?? 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'student_class',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('student_class')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'pasR_date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => <div>{row.getValue('pasR_date')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'applied_class_gender',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />,
        cell: ({ row }) => <div>{row.getValue('applied_class_gender')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'admission_reg_no',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Reg.No.' />,
        cell: ({ row }) => <div>{row.getValue('admission_reg_no')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_admission_no',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Adm.No.' />,
        cell: ({ row }) => <div>{row.getValue('applied_admission_no')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_email',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Email Id' />,
        cell: ({ row }) => <div>{row.getValue('applied_email')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'applied_mobile',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Mobile No' />,
        cell: ({ row }) => <div>{row.getValue('applied_mobile')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'admission_status',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Status.' />,
        cell: ({ row }) => <div>{row.getValue('admission_status')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'admission_Photo',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Photo' />,
        cell: ({ row }) => <div>{row.getValue('admission_Photo')}</div>,
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
            const { openEditForm } = useFormContext<IadmissionStudentApplicationList>();
            const session = useSession();
            const [pasrId, setPasrId] = useState<number>(0);

            const { data: applicationFormDetails, isLoading: applicationFormDetailsLoading } = useStudentApplicationForm(pasrId);

            useEffect(() => {
                if (session?.data?.role === undefined) {
                    window.location.reload();
                }
            }, [session?.data?.role]);

            // Trigger form open when applicationFormDetails is loaded
            useEffect(() => {
                if (pasrId && applicationFormDetails?.data && !applicationFormDetailsLoading) {
                    try {
                        const resp = applicationFormDetails.data;
                        const student = resp?.student_details || resp || {};
                        const payload = {
                            ...student,
                            selectedSourceDetails: (resp?.student_sources || resp?.studentSource || []).map((s: any) => ({
                                pamS_Id: String(s.pamS_Id)
                            })),
                            selectedRefrenceDetails: (resp?.student_refrences || resp?.studentReference || []).map((r: any) => ({
                                pamR_Id: String(r.pamR_Id)
                            })),
                            siblingsDetails: resp?.student_siblings || [],
                            previousSchoolDetails: resp?.previous_schools || [],
                            selectedDocuments: (resp?.student_documents || []).map((d: any) => ({
                                pasrD_Id: d.pasrD_Id,
                                pasR_Id: d.pasR_Id,
                                amsmD_Id: d.amsmD_Id,
                                document_Path: d.document_Path
                            }))
                        };
                        openEditForm(payload);
                        setPasrId(0); // Reset after opening
                    } catch (error) {
                        console.error('Error fetching application details:', error);
                        toast.error('Unable to fetch application details');
                        setPasrId(0); // Reset on error
                    }
                }
            }, [pasrId, applicationFormDetails, applicationFormDetailsLoading]);

            return (
                <div className='flex items-start justify-start gap-2'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={applicationFormDetailsLoading}
                        onClick={() => {
                            const rowData = cell.row.original;
                            setPasrId(rowData.pasr_id);
                        }}
                        className='w-fit p-1'>
                        {applicationFormDetailsLoading ? (
                            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
                        ) : (
                            <Edit className='h-4 w-4' />
                        )}
                    </Button>
                    <div className='flex w-full justify-between gap-2'>
                        {session?.data?.role?.toUpperCase() === ROLES.ADMIN && <DeleteMasterClassForm row={cell.row.original} />}
                    </div>
                </div>
            );
        }
    }
];
