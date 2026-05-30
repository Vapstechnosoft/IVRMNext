import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintReceiptButtonProps {
    htmlContent: string;
}

export function PrintReceiptButton({ htmlContent }: PrintReceiptButtonProps) {
    const handlePrint = () => {
        // Open a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=800');
        if (!printWindow) return;

        // Construct the document to print
        const documentHtml = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Receipt</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        @page { size: auto; margin: 10mm; }
                        body { padding: 20px; font-family: Arial, sans-serif; background-color: #fff; }
                        table { width: 100%; border-collapse: collapse; }
                        /* Force Bootstrap modals to be visible in the print window */
                        .modal { display: block !important; position: static !important; opacity: 1 !important; z-index: auto !important; background: transparent !important; }
                        .modal-dialog { width: 100% !important; max-width: 100% !important; margin: 0 !important; transform: none !important; }
                        .modal-content { border: none !important; box-shadow: none !important; }
                        .modal-backdrop { display: none !important; }
                        /* Hide the original angular footer buttons */
                        .modal-footer { display: none !important; }
                    </style>
                </head>
                <body onload="setTimeout(function() { window.print(); window.onafterprint = function(){ window.close(); }; }, 500);">
                    ${htmlContent}
                </body>
            </html>
        `;

        printWindow.document.write(documentHtml);
        printWindow.document.close();
    };

    return (
        <Button onClick={handlePrint} className='w-24 bg-blue-600 text-white hover:bg-blue-700'>
            <Printer className='mr-2 h-4 w-4' />
            Print
        </Button>
    );
}
