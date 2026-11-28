'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToggleEmailActive, useToggleSmsActive, useViewEmailTemplate } from '@/hooks/sms-email-configuration/useSmsMailSetting';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { SmsEmailSettingList } from '@/types/sms-email-configuration/sms-mail-setting';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

interface ListGridProps {
    data: SmsEmailSettingList[];
    onEdit: (record: SmsEmailSettingList) => void;
}

export function ListGrid({ data, onEdit }: ListGridProps) {
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));

    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return data.slice(startIndex, startIndex + pageSize);
    }, [data, currentPage, pageSize]);

    const toggleSmsMutation = useToggleSmsActive();
    const toggleEmailMutation = useToggleEmailActive();
    const viewTemplateMutation = useViewEmailTemplate();

    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateHtml, setTemplateHtml] = useState('');
    const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
    const [selectedSmsMessage, setSelectedSmsMessage] = useState('');

    const handleViewSmsMessage = (message: string) => {
        setSelectedSmsMessage(message);
        setIsSmsModalOpen(true);
    };

        const isActiveFlag = (value: unknown) => value === true || value === 1 || value === '1' || value === 'true';

    const handleToggleSms = (record: SmsEmailSettingList) => {
       const isActive = isActiveFlag(record.iseS_SMSActiveFlag);
const mgs = isActive ? 'De-Activate' : 'Activate';
        Swal.fire({
            title: 'Are You Sure?',
            text: `Do You Want to ${mgs} SMS Settings?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: `Yes, ${mgs} It!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                toggleSmsMutation.mutate(record);
            }
        });
    };

    const handleToggleEmail = (record: SmsEmailSettingList) => {
       const isActive = isActiveFlag(record.iseS_MailActiveFlag);
const mgs = isActive ? 'De-Activate' : 'Activate';
        Swal.fire({
            title: 'Are You Sure?',
            text: `Do You Want to ${mgs} Email Settings?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: `Yes, ${mgs} It!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                toggleEmailMutation.mutate(record);
            }
        });
    };

    const handleViewEmailTemplate = (templateContent: string) => {
        setTemplateHtml(templateContent);
        setIsTemplateModalOpen(true);
    };

    const columns: ColumnDef<SmsEmailSettingList>[] = [
        {
            id: 'sl_no',
            size: 70,
            header: () => <div className='text-center'>SL NO</div>,
            cell: ({ row }) => <div className='text-center'>{(currentPage - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'iseS_Template_Name',
            size: 160,
            header: () => <div className='text-center'>Header</div>,
            cell: ({ row }) => (
                <div className='mx-auto max-w-[150px] truncate text-center' title={row.original.iseS_Template_Name || ''}>
                    {row.original.iseS_Template_Name || '-'}
                </div>
            )
        },
        {
            accessorKey: 'iseS_SMSMessage',
            size: 320,
            header: () => <div className='text-center'>SMS Message</div>,
            cell: ({ row }) => {
                const message = row.original.iseS_SMSMessage || '';
                const isLong = message.length > 80;
                return (
                    <div className='mx-auto max-w-[300px] whitespace-normal break-words text-center'>
                        <p className='line-clamp-2 text-sm leading-snug' title={message}>
                            {message || '-'}
                        </p>
                        {isLong && (
                            <Button
                                variant='link'
                                size='sm'
                                className='h-auto p-0 text-xs text-primary underline hover:text-primary/80'
                                onClick={() => handleViewSmsMessage(message)}>
                                View Full SMS
                            </Button>
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'iseS_Mail_Message',
            size: 180,
            header: () => <div className='text-center'>Email Message</div>,
            cell: ({ row }) => (
                <div className='text-center'>
                    <Button
                        variant='link'
                        className='h-auto p-0 font-normal'
                        onClick={() => {
                            if (row.original.ismhtmL_Id) {
                                viewTemplateMutation.mutate(row.original.ismhtmL_Id, {
                                    onSuccess: (res) => {
                                        if (res.data && res.data.length > 0) {
                                            handleViewEmailTemplate(res.data[0].ismhtmL_HTMLTemplate);
                                        } else {
                                            handleViewEmailTemplate(
                                                row.original.iseS_MailHTMLTemplate || row.original.iseS_Mail_Message || ''
                                            );
                                        }
                                    }
                                });
                            } else {
                                handleViewEmailTemplate(row.original.iseS_MailHTMLTemplate || row.original.iseS_Mail_Message || '');
                            }
                        }}>
                        <Eye className='mr-1 h-4 w-4' /> View Email Template
                    </Button>
                </div>
            )
        },
        {
            accessorKey: 'iseS_SMSActiveFlag',
            size: 130,
            header: () => <div className='text-center'>SMS Active</div>,
            cell: ({ row }) => (
                <div className='text-center'>
                    <Button
                        variant='link'
                       className={`h-auto p-0 font-bold ${isActiveFlag(row.original.iseS_SMSActiveFlag) ? 'text-green-500' : 'text-red-500'}`}
                        onClick={() => handleToggleSms(row.original)}>
                        {isActiveFlag(row.original.iseS_SMSActiveFlag) ? 'Activated' : 'Deactivated'}
                    </Button>
                </div>
            )
        },
        {
            accessorKey: 'iseS_MailActiveFlag',
            size: 130,
            header: () => <div className='text-center'>Email Active</div>,
            cell: ({ row }) => (
                <div className='text-center'>
                    <Button
                        variant='link'
                       className={`h-auto p-0 font-bold ${isActiveFlag(row.original.iseS_MailActiveFlag) ? 'text-green-500' : 'text-red-500'}`}
                        onClick={() => handleToggleEmail(row.original)}>
                       {isActiveFlag(row.original.iseS_MailActiveFlag) ? 'Activated' : 'Deactivated'}
                    </Button>
                </div>
            )
        },
        {
            id: 'actions',
            size: 80,
            header: () => <div className='text-center'>Action</div>,
            cell: ({ row }) => (
                <div className='flex justify-center gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => onEdit(row.original)} className='text-primary'>
                        <Edit className='h-4 w-4' />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <>
            <DataTable
                columns={columns as any}
                data={paginatedData}
                totalItems={data.length}
                getRowId={(row) => String(row.iseS_Id)}
                columnPinning={{ right: [] }}
            />

            <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Email Template</DialogTitle>
                    </DialogHeader>
                    <div className='mt-4 rounded border p-4' dangerouslySetInnerHTML={{ __html: templateHtml }} />
                </DialogContent>
            </Dialog>

            <Dialog open={isSmsModalOpen} onOpenChange={setIsSmsModalOpen}>
                <DialogContent className='max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>SMS Message</DialogTitle>
                    </DialogHeader>
                    <div className='mt-4 max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed'>
                        {selectedSmsMessage}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
