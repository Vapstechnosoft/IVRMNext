'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFormContext } from '@/components/ui/form/form-provider';
import { getStudentApplicationForm } from '@/server/admission/preadmission/transactions/application_form';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ReceiptIndianRupee } from 'lucide-react';
import { Edit } from 'lucide-react';

import { ROLES } from '@/constants';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

import { Spinner } from '@/components/ui/spinner';
import { useDocumentDownload } from '@/hooks/admission/preadmission/useTransactions';
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
        header: ({ column }) => <DataTableColumnHeader className='ml-2' column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='ml-2'>{continuousIndex}</div>;
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
        accessorKey: 'application_form',
        header: ({ column }) => <DataTableColumnHeader className='text-nowrap' column={column} title='Application Form' />,
        cell: ({ row }) => {
            const appId = row.original.pasr_id;
            const [showPdfModal, setShowPdfModal] = useState(false);
            const { data: pdfData, isLoading } = useDocumentDownload(appId, {});
            const [iframeLoading, setIframeLoading] = useState(false);

            const pdfBase64: string | null | undefined =
                typeof pdfData?.data === 'string'
                    ? pdfData.data
                    : Array.isArray(pdfData?.data)
                      ? ((pdfData.data[0] as unknown as string) ?? null)
                      : null;

            useEffect(() => {
                if (showPdfModal && pdfBase64) {
                    setIframeLoading(true);
                }
                if (!showPdfModal) setIframeLoading(false);
            }, [showPdfModal, pdfBase64]);

            return (
                <>
                    <Button variant='link' className='p-0 text-blue-600 hover:underline' onClick={() => setShowPdfModal(true)}>
                        View Application
                    </Button>

                    {showPdfModal && (
                        <Dialog open={showPdfModal} onOpenChange={setShowPdfModal}>
                            <DialogContent className='flex h-[90vh] max-w-5xl flex-col p-0'>
                                <DialogHeader className='p-0'>
                                    <DialogTitle className='pt-3 text-center font-semibold text-lg'>
                                        Preadmission Application Form
                                    </DialogTitle>
                                </DialogHeader>
                                <div className='relative min-h-0 flex-1 overflow-hidden'>
                                    {/* Spinner while loading PDF */}
                                    {(isLoading || iframeLoading) && (
                                        <div className='absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
                                            <div className=' transition-all'>
                                                <div className='flex flex-col items-center'>
                                                    <Spinner size='lg' className='text-primary' />
                                                    <p className='mt-3 font-medium text-gray-700 text-sm'>Loading document...</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* PDF Viewer replaces iframe, removes extra padding */}
                                    <div className='relative h-full min-h-0 w-full'>
                                        {/* toolbar: download / open */}
                                        {pdfBase64 ? <div className='absolute top-3 right-3 z-30 flex gap-3' /> : null}

                                        {/* inline PDF viewer using iframe (falls back to message when no PDF) */}
                                        {typeof pdfBase64 === 'string' && pdfBase64 ? (
                                            <iframe
                                                src={
                                                    pdfBase64.startsWith('data:') || pdfBase64.startsWith('http')
                                                        ? pdfBase64
                                                        : `data:application/pdf;base64,${pdfBase64}`
                                                }
                                                title='Preadmission Application Form'
                                                className='h-full min-h-0 w-full border-0'
                                                style={{ display: iframeLoading ? 'none' : 'block' }}
                                                onLoad={() => setIframeLoading(false)}
                                            />
                                        ) : (
                                            <div className='flex h-full items-center justify-center'>
                                                <div className='text-gray-500 text-sm'>No document available</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </>
            );
        },
        enableSorting: false
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
            const session = useSession();
            const [loading, setLoading] = React.useState(false);
            useEffect(() => {
                if (session?.data?.role === undefined) {
                    window.location.reload();
                }
            }, [session?.data?.role]);

            return (
                <div className='flex items-start justify-start gap-2'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        disabled={loading}
                        onClick={async () => {
                            setLoading(true);
                            try {
                                const rowData = cell.row.original;
                                const response = await getStudentApplicationForm(rowData.pasr_id);
                                const resp = response.data;
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
                                    previousSchoolList: resp?.previous_schools || [],
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
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className='w-fit p-1'>
                        {loading ? (
                            <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent' />
                        ) : (
                            <Edit className='h-4 w-4' />
                        )}
                    </Button>
                    <div className='flex w-full justify-between gap-2'>
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
                        {session?.data?.role?.toUpperCase() === ROLES.ADMIN && <ToggleStudentApplicationForm cell={cell} />}
                    </div>
                </div>
            );
        }
    }
];
