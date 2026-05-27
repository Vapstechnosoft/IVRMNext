'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';

import { Eye } from 'lucide-react';
import { useCallback, useState } from 'react';
import { PrintReceiptButton } from './receipt-print-action';

export const masterGroupWiseAutoReciptColumns: ColumnDef<IMasterGroupWiseAutoReciptList>[] = [
    {
        accessorKey: 'fyccC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'academicyear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('academicyear')}</div>
    },

    {
        accessorKey: 'fgaR_PrefixName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Prefix' />,
        cell: ({ row }) => {
            const prefix = row.getValue('fgaR_PrefixName') as string;
            return <div className='truncate'>{prefix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'fgaR_SuffixName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Suffix' />,
        cell: ({ row }) => {
            const suffix = row.getValue('fgaR_SuffixName') as string;
            return <div className='truncate'>{suffix || 'N/A'}</div>;
        }
    },
    {
        accessorKey: 'fgaR_Starting_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Starting Number' />,
        cell: ({ row }) => <div className='truncate'>{row.getValue('fgaR_Starting_No')}</div>
    },
    {
        accessorKey: 'fgaR_Template_Name',
        // header: ({ column }) => <DataTableColumnHeader column={column}
        // title='Receipt Template' />,

        header: () => (
            <div className='flex h-8 w-full items-center justify-start'>
                <span className='font-medium text-xs'>Receipt Template</span>
            </div>
        ),

        // This ensures the entire <td> content is left-aligned
        meta: {
            className: 'text-left justify-start'
        },

        cell: ({ row }) => (
            <div className='flex w-full items-center justify-start'>
                <TemplatePreviewCell templateHtml={row.original.fgaR_Template_Name} rowData={row.original} />
            </div>
        ),

        enableSorting: false,
        enableHiding: true
    },

    {
        accessorKey: 'feeGroupslist',
        size: 150,
        minSize: 120,

        header: () => (
            <div className='flex h-8 w-full items-center justify-start'>
                <span className='font-medium text-xs'>Fee Group</span>
            </div>
        ),

        // 🔥 This aligns the CELL (not just the header)
        meta: {
            className: 'text-left justify-start'
        },

        cell: ({ row }) => {
            const selectedFeeGroups = (row.getValue('feeGroupslist') as Array<{ fmG_Id: number; fmG_GroupName: string }>) || [];

            const fmG_GroupName = selectedFeeGroups.map((g) => g.fmG_GroupName);
            const count = fmG_GroupName.length;

            return (
                <div className='flex w-full justify-start'>
                    <SelectedFeeGroupsCell fmG_GroupName={fmG_GroupName} count={count} />
                </div>
            );
        },

        enableSorting: false,
        enableHiding: true
    },

    // {
    //   accessorKey: 'fycC_ActiveFlag',
    //   header: ({ column }) => <DataTableColumnHeader column={column} title='Active' className='pl-6 text-left' />,
    //   cell: ({ row }) => {
    //     const isActive = row.getValue('fycC_ActiveFlag');
    //     return (
    //       <div className='flex items-center justify-start pl-6'>
    //         <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>
    //           {isActive ? 'Active' : 'Inactive'}
    //         </span>
    //       </div>
    //     );
    //   },
    //   enableSorting: true,
    //   enableHiding: true,
    //   size: 100,
    // },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({
    rowData
}: {
    rowData: IMasterGroupWiseAutoReciptList;
}) {
    const { openToggleForm, openEditForm, openDeleteForm } = useFormContext<IMasterGroupWiseAutoReciptList>();

    const handleToggle = useCallback((data: IMasterGroupWiseAutoReciptList) => openToggleForm(data), [openToggleForm]);

    const handleEdit = useCallback((data: IMasterGroupWiseAutoReciptList) => openEditForm(data), [openEditForm]);

    const handleDelete = useCallback((data: IMasterGroupWiseAutoReciptList) => openDeleteForm(data), [openDeleteForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='fycC_ActiveFlag'
        />
    );
}

// Selected Fee Groups View Modal
function SelectedFeeGroupsCell({
    fmG_GroupName,
    count
}: {
    fmG_GroupName: string[];
    count: number;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className='flex items-center gap-2'>
                <Button variant='ghost' size='sm' onClick={() => setOpen(true)} className='h-7 px-2 text-xs' disabled={count === 0}>
                    <Eye className='mr-1 h-3 w-3' />
                    View ({count})
                </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Selected Fee Groups ({count})</DialogTitle>
                    </DialogHeader>
                    <div className='max-h-96 space-y-2 overflow-y-auto'>
                        {fmG_GroupName && fmG_GroupName.length > 0 ? (
                            <ul className='list-inside list-disc space-y-1 text-sm'>
                                {fmG_GroupName.map((name, index) => (
                                    <li key={`${name}-${index}`} className='text-foreground'>
                                        <span className='font-mono font-semibold'>{name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className='text-muted-foreground text-sm'>No fee groups selected.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function TemplatePreviewCell({ templateHtml, rowData }: { templateHtml?: string | null, rowData: IMasterGroupWiseAutoReciptList }) {
    const [open, setOpen] = useState(false);

    let safeHtml = templateHtml ?? '';

    // Handle encoded HTML just in case
    if (safeHtml.includes('&lt;') && safeHtml.includes('&gt;')) {
        safeHtml = safeHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }

    // Attempt to bind data by replacing common placeholders with actual rowData values
    if (safeHtml) {
        safeHtml = safeHtml.replace(/\[Prefix\]/gi, rowData.fgaR_PrefixName || '');
        safeHtml = safeHtml.replace(/\[Suffix\]/gi, rowData.fgaR_SuffixName || '');
        safeHtml = safeHtml.replace(/\[StartingNo\]/gi, rowData.fgaR_Starting_No?.toString() || '');
        safeHtml = safeHtml.replace(/\[GroupName\]/gi, rowData.fgaR_Name || '');
        safeHtml = safeHtml.replace(/\[AcademicYear\]/gi, rowData.academicyear || '');
    }

    // Emulate Angular's $compile with an empty scope by removing all unbound {{variable}} placeholders
    if (safeHtml) {
        safeHtml = safeHtml.replace(/\{\{.*?\}\}/g, '');
    }

    const isFullHtmlDocument = safeHtml.toLowerCase().includes('<html') && safeHtml.toLowerCase().includes('<body');

    const iframeContent = isFullHtmlDocument ? safeHtml : `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; font-family: Arial, sans-serif; background-color: #fff; }
                    /* Add standard table styling in case it's missing from the template */
                    table { width: 100%; border-collapse: collapse; }
                    /* Force Bootstrap modals to be visible in the preview */
                    .modal { display: block !important; position: static !important; opacity: 1 !important; z-index: auto !important; background: transparent !important; }
                    .modal-dialog { width: 100% !important; max-width: 800px !important; margin: 0 auto !important; transform: none !important; }
                    .modal-content { border: none !important; box-shadow: none !important; }
                    .modal-content { border: none !important; box-shadow: none !important; }
                    .modal-backdrop { display: none !important; }
                    /* Hide legacy angular buttons */
                    .modal-footer { display: none !important; }
                </style>
            </head>
            <body>
                ${safeHtml}
            </body>
        </html>
    `;

    return (
        <>
            {/* Eye button - now naturally left-aligned because of parent flex */}
            <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 hover:bg-blue-50' // optional: makes it look consistent with View button
                onClick={() => setOpen(true)}
                title='Preview Template'>
                <Eye className='h-4 w-4 text-blue-600' />
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='flex flex-col h-[85vh] max-h-[90vh] max-w-5xl overflow-hidden p-0'>
                    <DialogHeader className='shrink-0 flex items-center justify-between border-b p-4'>
                        <DialogTitle>Receipt Template Preview</DialogTitle>
                        <DialogClose asChild>
                            <Button
                                variant='outline'
                                size='sm'
                                className='order-2 flex w-fit items-center gap-2 transition-all duration-200 hover:scale-105 sm:order-1'>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogHeader>

                    <div className='flex-1 w-full bg-white overflow-hidden'>
                        <iframe 
                            title='Template Preview' 
                            className='h-full w-full border-0' 
                            sandbox='allow-same-origin allow-scripts' 
                            srcDoc={iframeContent} 
                        />
                    </div>

                    <DialogFooter className='shrink-0 border-t bg-gray-50 px-6 py-4 flex items-center justify-end gap-2'>
                        <DialogClose asChild>
                            <Button variant='destructive' className='w-24'>
                                Cancel
                            </Button>
                        </DialogClose>
                        <PrintReceiptButton htmlContent={safeHtml} />
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// function TemplatePreviewCell({ templateHtml }: { templateHtml?: string | null }) {
//     const [open, setOpen] = useState(false);
//     const safeHtml = templateHtml ?? '';

//     return (
//         <>
//             <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 w-8 p-0 hover:bg-blue-50"
//                 onClick={() => setOpen(true)}
//                 title="Preview Template"
//             >
//                 <Eye className="h-4 w-4 text-blue-600" />
//             </Button>

//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden p-0">
//                     <DialogHeader className="border-b p-4">
//                         <DialogTitle>Receipt Template Preview</DialogTitle>
//                     </DialogHeader>

//                     <div className="h-[calc(90vh-80px)] w-full bg-white">
//                         <iframe
//                             title="Template Preview"
//                             className="h-full w-full border-0"
//                             sandbox=""
//                             srcDoc={safeHtml}
//                         />
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// }
