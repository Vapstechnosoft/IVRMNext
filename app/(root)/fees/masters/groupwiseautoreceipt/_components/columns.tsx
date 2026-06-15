'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';

import { getMasterInstitution } from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import type { IMasterInstitution } from '@/types/exam/exam-module/report';
import type { IMasterGroupWiseAutoReciptList } from '@/types/fees/masters/masters';
import { Eye, Printer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

// Import your API function

interface IInstituteDetails {
    institute_logo?: string;
    institute_name?: string;
    institute_address?: string;
    institute_phone?: string;
    institute_email?: string;
}

interface TemplatePreviewCellProps {
    templateHtml?: string | null;
    rowData: IMasterGroupWiseAutoReciptList;
    asmayId?: number | string; // Add asmayId parameter
}

// Placeholder configuration
// Update PLACEHOLDER_CONFIG to remove "baldwin"
const PLACEHOLDER_CONFIG = [
    { pattern: /\[Prefix\]/gi, value: (rowData: IMasterGroupWiseAutoReciptList) => rowData.fgaR_PrefixName || '' },
    { pattern: /\[Suffix\]/gi, value: (rowData: IMasterGroupWiseAutoReciptList) => rowData.fgaR_SuffixName || '' },
    { pattern: /\[StartingNo\]/gi, value: (rowData: IMasterGroupWiseAutoReciptList) => rowData.fgaR_Starting_No?.toString() || '' },
    { pattern: /\[GroupName\]/gi, value: (rowData: IMasterGroupWiseAutoReciptList) => rowData.fgaR_Name || '' },
    { pattern: /\[AcademicYear\]/gi, value: (rowData: IMasterGroupWiseAutoReciptList) => rowData.academicyear || '' },
    { pattern: /\[Date\]/gi, value: () => new Date().toLocaleDateString() },
    { pattern: /\[Time\]/gi, value: () => new Date().toLocaleTimeString() },
    // ADD THIS LINE TO REMOVE "baldwin"
    { pattern: /baldwin/gi, value: () => '' }
];

// Decode HTML entities
const decodeHtmlEntities = (html: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
};

// Replace placeholders
// Update the function signature
const replacePlaceholders = (html: string, rowData: IMasterGroupWiseAutoReciptList, institute: IMasterInstitution | null): string => {
    let processedHtml = html;

    for (const { pattern, value } of PLACEHOLDER_CONFIG) {
        processedHtml = processedHtml.replace(pattern, value(rowData));
    }

    // Add institute placeholders with null checks
    processedHtml = processedHtml.replace(/\[InstituteLogo\]/gi, institute?.mI_Logo || '');
    processedHtml = processedHtml.replace(/\[InstituteName\]/gi, institute?.mI_Name || '');
    processedHtml = processedHtml.replace(/\[InstituteAddress\]/gi, institute?.mI_Name || '');

    // REMOVE "baldwin" and other hardcoded test values
    processedHtml = processedHtml.replace(/baldwin/gi, '');
    processedHtml = processedHtml.replace(/Baldwin/gi, '');

    // Remove Angular-style placeholders
    processedHtml = processedHtml.replace(/\{\{.*?\}\}/g, '');

    return processedHtml;
};

// Generate iframe content with institute logo
// Update the generateIframeContent function
const generateIframeContent = (html: string, institute: IMasterInstitution | null, isFullDocument: boolean): string => {
    if (isFullDocument) return html;

    const hasLogo = institute?.mI_Logo && institute.mI_Logo.trim() !== '';
    const logoUrl = institute?.mI_Logo || '';
    const instituteName = institute?.mI_Name || '';

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Receipt Template Preview</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        background: #f0f2f5;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 40px 20px;
                        margin: 0;
                    }
                    
                    .preview-container {
                        max-width: 1200px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    
                    /* Header Section - FIXED FOR FULL WIDTH LOGO */
                    .receipt-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        width: 100%;
                    }
                    
                    .logo-container {
                        margin-bottom: 20px;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    
                    .school-logo {
                        max-width: 100%;
                        width: auto;
                        height: auto;
                        max-height: 120px;
                        object-fit: contain;
                        background: white;
                        padding: 10px;
                        border-radius: 8px;
                    }
                    
                    /* Alternative: Full width logo container */
                    .full-width-logo {
                        width: 100%;
                        text-align: center;
                        background: white;
                        padding: 20px;
                        margin-bottom: 20px;
                    }
                    
                    .full-width-logo img {
                        max-width: 100%;
                        height: auto;
                        max-height: 150px;
                        object-fit: contain;
                    }
                    
                    .school-name {
                        font-size: 28px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    
                    .school-address {
                        font-size: 14px;
                        opacity: 0.9;
                        margin-bottom: 5px;
                    }
                    
                    .receipt-content {
                        padding: 30px;
                        background: white;
                    }
                    
                    /* Table Styling */
                    .receipt-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    
                    .receipt-table th,
                    .receipt-table td {
                        border: 1px solid #dee2e6;
                        padding: 12px;
                        text-align: left;
                    }
                    
                    .receipt-table th {
                        background: #f8f9fa;
                        font-weight: 600;
                    }
                    
                    .receipt-footer {
                        background: #f8f9fa;
                        padding: 20px 30px;
                        text-align: center;
                        border-top: 1px solid #dee2e6;
                        font-size: 12px;
                        color: #6c757d;
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        
                        .preview-container {
                            box-shadow: none;
                        }
                        
                        .receipt-header {
                            background: #f8f9fa !important;
                            color: black !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div class="receipt-header">
                        <!-- FIXED: Full width logo display -->
                        <div class="full-width-logo">
                            ${
                                hasLogo
                                    ? `<img src="${logoUrl}" alt="Institute Logo" 
                                      onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\' viewBox=\\'0 0 100 100\\'%3E%3Crect width=\\'100\\' height=\\'100\\' fill=\\'%23f0f0f0\\'/%3E%3Ctext x=\\'50\\' y=\\'55\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-size=\\'14\\'%3E🏫%3C/text%3E%3C/svg%3E'" />`
                                    : '<div style="font-size: 60px;">🏫</div>'
                            }
                        </div>
                        
                        ${instituteName ? `<div class="school-name">${instituteName}</div>` : ''}
                    </div>
                    
                    <div class="receipt-content">
                        ${html}
                    </div>
                    
                    <div class="receipt-footer">
                        <p>© ${new Date().getFullYear()} - Official Receipt</p>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

export function TemplatePreviewCell({ templateHtml, rowData }: TemplatePreviewCellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [institution, setInstitution] = useState<IMasterInstitution | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch institution details on component mount
    useEffect(() => {
        const fetchInstitution = async () => {
            try {
                setLoading(true);
                const institutionRes = await getMasterInstitution();
                const { data: institutionData } = institutionRes;
                setInstitution(institutionData);
            } catch (err) {
                console.error('Failed to load institution details', err);
                setInstitution(null);
            } finally {
                setLoading(false);
            }
        };

        fetchInstitution();
    }, []); // Empty dependency array - fetch once when component mounts

    // Process template HTML
    const { safeHtml, iframeContent } = useMemo(() => {
        if (!templateHtml) {
            return { safeHtml: '', iframeContent: '' };
        }

        // Decode and process HTML
        let processed = decodeHtmlEntities(templateHtml);
        processed = replacePlaceholders(processed, rowData, institution);

        // Check if it's a full HTML document
        const isFullDocument = processed.toLowerCase().includes('<html') && processed.toLowerCase().includes('<body');

        const iframeContent = generateIframeContent(processed, institution, isFullDocument);

        return { safeHtml: processed, iframeContent };
    }, [templateHtml, rowData, institution]);

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open);
    }, []);

    if (!templateHtml) return null;

    return (
        <>
            <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 transition-all duration-200 hover:scale-105 hover:bg-blue-50'
                onClick={() => setIsOpen(true)}
                title='Preview Template'>
                <Eye className='h-4 w-4 text-blue-600' />
            </Button>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className='flex h-[85vh] max-h-[90vh] max-w-6xl flex-col overflow-hidden p-0'>
                    <DialogHeader className='flex shrink-0 flex-row items-center justify-between border-b bg-gray-50 px-6 py-4'>
                        <DialogTitle className='font-semibold text-gray-800 text-xl'>
                            Receipt Template Preview
                            {loading && <span className='ml-2 text-gray-500 text-sm'>(Loading institution details...)</span>}
                        </DialogTitle>
                        <DialogClose asChild>
                            <Button variant='outline' size='sm'>
                                Close
                            </Button>
                        </DialogClose>
                    </DialogHeader>

                    <div className='w-full flex-1 overflow-auto bg-gray-100'>
                        {loading ? (
                            <div className='flex h-full items-center justify-center'>
                                <div className='text-center'>
                                    <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2'></div>
                                    <p className='text-gray-500'>Loading preview...</p>
                                </div>
                            </div>
                        ) : iframeContent ? (
                            <iframe
                                title='Template Preview'
                                className='h-full w-full border-0'
                                sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
                                srcDoc={iframeContent}
                                loading='lazy'
                            />
                        ) : (
                            <div className='flex h-full items-center justify-center text-gray-500'>No template content to preview</div>
                        )}
                    </div>

                    <DialogFooter className='shrink-0 border-t bg-gray-50 px-6 py-4'>
                        <div className='flex w-full items-center justify-end gap-3'>
                            <DialogClose asChild>
                                <Button variant='outline' className='min-w-[100px]'>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <PrintReceiptButton htmlContent={safeHtml} institution={institution} />
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
const PrintReceiptButton = ({ htmlContent, institution }: { htmlContent: string; institution: IMasterInstitution | null }) => {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=900,height=900,toolbar=yes,scrollbars=yes');
        if (!printWindow) {
            alert('Please allow pop-ups to print the receipt');
            return;
        }

        const hasLogo = institution?.mI_Logo && institution.mI_Logo.trim() !== '';
        const logoUrl = institution?.mI_Logo || '';
        const instituteName = institution?.mI_Name || '';

        const documentHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Receipt - ${instituteName} ${new Date().toLocaleDateString()}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            padding: 20px;
                            background: white;
                        }
                        
                        .print-container {
                            max-width: 100%;
                            margin: 0 auto;
                            background: white;
                        }
                        
                        .print-header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #333;
                        }
                        
                        .logo-wrapper {
                            margin-bottom: 15px;
                        }
                        
                        .print-logo {
                            max-width: 100px;
                            max-height: 100px;
                            object-fit: contain;
                            border-radius: 50%;
                            border: 1px solid #ddd;
                            padding: 5px;
                        }
                        
                        .print-school-name {
                            font-size: 24px;
                            font-weight: bold;
                            margin-bottom: 5px;
                            color: #000;
                        }
                        
                        .print-title {
                            font-size: 20px;
                            font-weight: bold;
                            text-align: center;
                            margin: 20px 0;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                        }
                        
                        .print-content {
                            margin: 20px 0;
                        }
                        
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 15px 0;
                        }
                        
                        .print-table th,
                        .print-table td {
                            border: 1px solid #000;
                            padding: 10px;
                            text-align: left;
                            font-size: 12px;
                        }
                        
                        .print-table th {
                            background: #f5f5f5;
                            font-weight: bold;
                        }
                        
                        .print-footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            text-align: center;
                            border-top: 1px solid #ddd;
                            font-size: 10px;
                            color: #666;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                                margin: 0;
                            }
                            
                            .print-container {
                                padding: 15px;
                            }
                            
                            .print-table th,
                            .print-table td {
                                border-color: #000 !important;
                            }
                        }
                        
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .text-left { text-align: left; }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="print-header">
                            ${
                                hasLogo
                                    ? `
                                <div class="logo-wrapper">
                                    <img src="${logoUrl}" alt="Institute Logo" class="print-logo" 
                                         onerror="this.style.display='none'" />
                                </div>
                            `
                                    : ''
                            }
                            
                            ${instituteName ? `<div class="print-school-name">${instituteName}</div>` : ''}
                        </div>
                        
                        <div class="print-title">OFFICIAL RECEIPT</div>
                        
                        <div class="print-content">
                            ${htmlContent}
                        </div>
                        
                        <div class="print-footer">
                            <p>This is a computer-generated receipt and requires no signature.</p>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            }, 500);
                        };
                    <\/script>
                </body>
            </html>
        `;

        printWindow.document.write(documentHtml);
        printWindow.document.close();
    };

    return (
        <Button
            onClick={handlePrint}
            className='min-w-[100px] bg-blue-600 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700'>
            <Printer className='mr-2 h-4 w-4' />
            Print
        </Button>
    );
};
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
