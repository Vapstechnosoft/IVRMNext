'use client';

import { Button } from '@/components/ui/button';
import type { IFeePreAdmissionTransactionDetails } from '@/types/fees/transactions/transactions';
import { useRef } from 'react';

interface ReceiptViewPageProps {
    rowData: IFeePreAdmissionTransactionDetails;
    onClose: () => void;
}

export default function ReceiptViewPage({ rowData, onClose }: ReceiptViewPageProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    const receipt_no = rowData.receiptNo || 'N/A';
    const transaction_date = rowData.paidDate || '';
    const student_name = rowData.studentName || 'N/A';
    const reg_no = rowData.studentRegNo || 'N/A';
    const paid_amount = rowData.paidAmount || 0;
    const mode_of_payment = rowData.modeOfPayment || 'Cash';
    const bank_name = mode_of_payment === 'Cash' ? '' : (rowData as any).bankName || '';
    const cheque_no = mode_of_payment === 'Cash' ? '' : (rowData as any).chequeNo || '';
    const class_name = (rowData as any).className || 'XI';
    const academic_year = (rowData as any).academicYear || '2025-2026';
    const fee_head_name = (rowData as any).feeHead || 'Registration Fee';

    const handlePrint = () => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - ${receipt_no}</title>
              <style>
                @page {
                  size: A4 landscape;
                  margin: 10mm;
                }
                * { box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 10px;
                  width: 100%;
                  height: 100vh;
                }
                .p-8 { padding: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; }
                .border-2 { border: 2px solid #d1d5db; padding: 15px; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .mb-4 { margin-bottom: 16px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-6 { margin-bottom: 24px; }
                .mt-8 { margin-top: 32px; }
                .pb-4 { padding-bottom: 16px; }
                .p-2 { padding: 8px; }
                .font-bold { font-weight: bold; }
                .text-blue-700 { color: #1d4ed8; }
                .border-b-2 { border-bottom: 2px solid #000; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-content: center; }
                .justify-between { justify-content: space-between; }
                .gap-4 { gap: 16px; }
                .w-16 { width: 64px; }
                .h-16 { height: 64px; }
                .bg-blue-700 { background-color: #1d4ed8; }
                .rounded-full { border-radius: 9999px; }
                .text-white { color: white; }
                .text-2xl { font-size: 24px; }
                .text-sm { font-size: 14px; }
                .text-xs { font-size: 12px; }
                .italic { font-style: italic; }
                .space-y-1 > * + * { margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #9ca3af; padding: 8px; text-align: left; }
                th { background-color: #1d4ed8; color: white; font-weight: bold; }
                .border-gray-400 { border-color: #9ca3af; }
                @media print {
                  body { padding: 0; margin: 0; }
                  .print\\:hidden { display: none !important; }
                  @page { size: A4 landscape; margin: 10mm; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };

    const convertNumberToWords = (num: number): string => {
        if (num === 0) return 'Zero';

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 !== 0 ? ` ${ones[n % 10]}` : ''}`;
            return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` ${convertLessThanThousand(n % 100)}` : ''}`;
        };

        if (num < 1000) return convertLessThanThousand(num);
        if (num < 100000)
            return `${convertLessThanThousand(Math.floor(num / 1000))} Thousand${num % 1000 !== 0 ? ` ${convertLessThanThousand(num % 1000)}` : ''}`;
        if (num < 10000000)
            return `${convertLessThanThousand(Math.floor(num / 100000))} Lakh${num % 100000 !== 0 ? ` ${convertNumberToWords(num % 100000)}` : ''}`;
        return `${convertLessThanThousand(Math.floor(num / 10000000))} Crore${num % 10000000 !== 0 ? ` ${convertNumberToWords(num % 10000000)}` : ''}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const feeAmount = paid_amount;
    const discountAmount = 0;
    const paidAmount = paid_amount;

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='relative max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white shadow-2xl'>
                {/* Close Button */}
                {/* <Button onClick={onClose} variant="ghost" size="sm" className="absolute top-4 right-4 z-10 print:hidden">
          <X className="h-4 w-4" />
        </Button> */}
                {/* Receipt Content */}
                <div ref={receiptRef} className='p-8'>
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                        {/* School Copy */}
                        <div className='border-2 border-gray-300 p-6'>
                            <div className='mb-4 text-right'>
                                <span className='font-bold text-blue-700'>SCHOOL COPY</span>
                            </div>

                            <div className='mb-6 border-b-2 pb-4 text-center'>
                                <div className='mb-2 flex items-center justify-center gap-4'>
                                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 font-bold text-2xl text-white'>
                                        HHS
                                    </div>
                                    <div>
                                        <h1 className='font-bold text-2xl italic'>Hutchings High School & Junior College</h1>
                                        <p className='text-sm'>7, Phayre Road, Pune - 411 040</p>
                                        <p className='text-sm'>Telephone : 020 - 26363892</p>
                                    </div>
                                </div>
                            </div>

                            <div className='mb-4 space-y-1 text-sm'>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Receipt No:</strong> {receipt_no}
                                    </span>
                                    <span>
                                        <strong>Date:</strong> {formatDate(transaction_date)}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Student Name:</strong> {student_name}
                                    </span>
                                    <span>
                                        <strong>Class:</strong> {class_name}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Academic Year:</strong> {academic_year}
                                    </span>
                                    <span>
                                        <strong>Reg No:</strong> {reg_no}
                                    </span>
                                </div>
                            </div>

                            <table className='mb-4 w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='bg-blue-700 text-white'>
                                        <th className='border border-gray-400 p-2'>SL.NO</th>
                                        <th className='border border-gray-400 p-2'>Head Name</th>
                                        <th className='border border-gray-400 p-2'>Fee Amount</th>
                                        <th className='border border-gray-400 p-2'>Discount Amount</th>
                                        <th className='border border-gray-400 p-2'>Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='border border-gray-400 p-2 text-center'>1</td>
                                        <td className='border border-gray-400 p-2'>{fee_head_name}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{feeAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{discountAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td colSpan={2} className='border border-gray-400 p-2 text-right'>
                                            Total
                                        </td>
                                        <td className='border border-gray-400 p-2 text-right'>{feeAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{discountAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className='mb-4'>
                                <h3 className='mb-2 font-bold'>Current Payment Detail</h3>
                                <table className='w-full border-collapse text-sm'>
                                    <thead>
                                        <tr className='bg-blue-700 text-white'>
                                            <th className='border border-gray-400 p-2'>SL.NO</th>
                                            <th className='border border-gray-400 p-2'>Amount</th>
                                            <th className='border border-gray-400 p-2'>Bank</th>
                                            <th className='border border-gray-400 p-2'>DD.No</th>
                                            <th className='border border-gray-400 p-2'>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='border border-gray-400 p-2 text-center'>1</td>
                                            <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                            <td className='border border-gray-400 p-2'>{bank_name}</td>
                                            <td className='border border-gray-400 p-2'>{cheque_no}</td>
                                            <td className='border border-gray-400 p-2'>{formatDate(transaction_date)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='mb-4 text-sm'>
                                <strong>Amount Received (in Words):</strong> {convertNumberToWords(paidAmount)} Rupees Only/-
                            </div>

                            <div className='mb-4 text-xs'>
                                <strong>Note:</strong> This receipt is valid subject to realisation of Cheque
                            </div>

                            <div className='mt-8 text-right'>
                                <p className='font-bold'>AUTHORISED SIGNATORY</p>
                            </div>
                        </div>

                        {/* Parent Copy */}
                        <div className='border-2 border-gray-300 p-6'>
                            <div className='mb-4 text-right'>
                                <span className='font-bold text-blue-700'>PARENT COPY</span>
                            </div>

                            {/* <div className='mb-6 border-b-2 pb-4 text-center'>
                                <div className='mb-2 flex items-center justify-center gap-4'>
                                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-700 font-bold text-2xl text-white'>
                                        HHS
                                    </div>
                                    <div>
                                        <h1 className='font-bold text-2xl italic'>Hutchings High School & Junior College</h1>
                                        <p className='text-sm'>7, Phayre Road, Pune - 411 040</p>
                                        <p className='text-sm'>Telephone : 020 - 26363892</p>
                                    </div>
                                </div>
                            </div> */}

                            <div className='mb-4 space-y-1 text-sm'>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Receipt No:</strong> {receipt_no}
                                    </span>
                                    <span>
                                        <strong>Date:</strong> {formatDate(transaction_date)}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Student Name:</strong> {student_name}
                                    </span>
                                    <span>
                                        <strong>Class:</strong> {class_name}
                                    </span>
                                </div>
                                <div className='flex justify-between'>
                                    <span>
                                        <strong>Academic Year:</strong> {academic_year}
                                    </span>
                                    <span>
                                        <strong>Reg No:</strong> {reg_no}
                                    </span>
                                </div>
                            </div>

                            <table className='mb-4 w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='bg-blue-700 text-white'>
                                        <th className='border border-gray-400 p-2'>SL.NO</th>
                                        <th className='border border-gray-400 p-2'>Head Name</th>
                                        <th className='border border-gray-400 p-2'>Fee Amount</th>
                                        <th className='border border-gray-400 p-2'>Discount Amount</th>
                                        <th className='border border-gray-400 p-2'>Paid Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='border border-gray-400 p-2 text-center'>1</td>
                                        <td className='border border-gray-400 p-2'>{fee_head_name}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{feeAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{discountAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                    </tr>
                                    <tr className='font-bold'>
                                        <td colSpan={2} className='border border-gray-400 p-2 text-right'>
                                            Total
                                        </td>
                                        <td className='border border-gray-400 p-2 text-right'>{feeAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{discountAmount}</td>
                                        <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className='mb-4'>
                                <h3 className='mb-2 font-bold'>Current Payment Detail</h3>
                                <table className='w-full border-collapse text-sm'>
                                    <thead>
                                        <tr className='bg-blue-700 text-white'>
                                            <th className='border border-gray-400 p-2'>SL.NO</th>
                                            <th className='border border-gray-400 p-2'>Amount</th>
                                            <th className='border border-gray-400 p-2'>Bank</th>
                                            <th className='border border-gray-400 p-2'>DD.No</th>
                                            <th className='border border-gray-400 p-2'>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='border border-gray-400 p-2 text-center'>1</td>
                                            <td className='border border-gray-400 p-2 text-right'>{paidAmount}</td>
                                            <td className='border border-gray-400 p-2'>{bank_name}</td>
                                            <td className='border border-gray-400 p-2'>{cheque_no}</td>
                                            <td className='border border-gray-400 p-2'>{formatDate(transaction_date)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='mb-4 text-sm'>
                                <strong>Amount Received (in Words):</strong> {convertNumberToWords(paidAmount)} Rupees Only/-
                            </div>

                            <div className='mb-4 text-xs'>
                                <strong>Note:</strong> This receipt is valid subject to realisation of Cheque
                            </div>

                            <div className='mt-8 text-right'>
                                <p className='font-bold'>AUTHORISED SIGNATORY</p>
                            </div>
                        </div>
                    </div>
                    <div className='sticky top-0 z-10 flex justify-end gap-2 border-b bg-white p-4 print:hidden'>
                        <Button onClick={handlePrint} variant='default'>
                            Print
                        </Button>
                        <Button onClick={onClose} variant='outline'>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
