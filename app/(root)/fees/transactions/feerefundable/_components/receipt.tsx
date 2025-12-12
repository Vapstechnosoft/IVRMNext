'use client';

import { Button } from '@/components/ui/button';
import { receiptView } from '@/server/fees/trasactions/thirdPartyTrasaction';
import type { IFeeRefundableList } from '@/types/fees/transactions/transactions';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface IInstituteDetails {
    institute_logo?: string;
}

interface ReceiptPageProps {
    rowData: IFeeRefundableList;
    onClose: () => void;
}

export default function FeeRefundableReceiptPage({ rowData, onClose }: ReceiptPageProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const [receiptData, setReceiptData] = useState<any>(null);

    const payload = {
        // mI_Id: rowData.mI_Id,
        // asmaY_Id: rowData.asmaY_Id,
        // fyP_Id: rowData.fyP_Id,
        // fyptP_Id: rowData.fyptP_Id
    };
    console.log('Receipt Payload:', payload);

    // ───────────────────────────────────────────────
    //  FETCH RECEIPT DATA
    // ───────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const raw = await receiptView(payload);

                console.log('Receipt Raw Data:', raw);
                const response = typeof raw === 'string' ? JSON.parse(raw) : raw;

                setReceiptData(response);
            } catch (err) {
                console.error('Failed to load receipt', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePrint = () => {
        if (!receiptRef.current) return;

        const printWindow = window.open('', '_blank', 'width=1200,height=900');

        if (printWindow) {
            // Get the full HTML including all Tailwind classes
            const content = receiptRef.current.outerHTML;

            // Include Tailwind CSS + your custom print styles
            printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Receipt - ${''}</title>

        <!-- Tailwind CSS CDN (includes all your classes) -->
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
             th {
            color: #000 !important;
            font-weight: 700 !important;
          }
          body {
            font-family: system-ui, sans-serif;
            padding: 10px;
            background: white;
          }
          /* Force print layout same as screen */
          .grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
          @media print {
            body { padding: 0; margin: 0; }
            .print\\:hidden { display: none !important; }
            /* Ensure logo loads */
            img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);

            printWindow.document.close();
            printWindow.focus();

            // Wait for images (especially logo) to load before printing
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 800);
            };
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
            return `${convertLessThanThousand(Math.floor(num / 1000))} Thousand${
                num % 1000 !== 0 ? ` ${convertLessThanThousand(num % 1000)}` : ''
            }`;
        if (num < 10000000)
            return `${convertLessThanThousand(Math.floor(num / 100000))} Lakh${
                num % 100000 !== 0 ? ` ${convertNumberToWords(num % 100000)}` : ''
            }`;
        return `${convertLessThanThousand(Math.floor(num / 10000000))} Crore${
            num % 10000000 !== 0 ? ` ${convertNumberToWords(num % 10000000)}` : ''
        }`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Dynamic Logo Only Header (Used in Both Copies)
    const InstituteHeader = () => (
        <div className='mb-6 border-b-2 pb-4 text-center'>
            <div className='flex justify-center py-4'>
                {/* {institute.institute_logo ? (
                    <Image src={institute.institute_logo} alt='Institute Logo' width={1000} height={90} className='logo' />
                ) : (
                    <div className='h-24 w-24 rounded-full border-4 border-gray-400 border-dashed bg-gray-200' />
                )} */}
            </div>
        </div>
    );

    if (loading || !receiptData) {
        return <div className='fixed inset-0 flex items-center justify-center bg-black/50 text-lg text-white'>Loading receipt...</div>;
    }

    // Extract Data ---------------------------------------------------------
    // const d = receiptData.alldata[0];
    // //const studentname = d.fyptP_Name || '';
    // const studentname= '';
    // const logo = d.mI_Logo || '';

    // const receiptNo = d.fyP_Receipt_No;
    // const date = formatDate(d.fyP_Date);
    // const headName = d.fmH_FeeName;
    // const amount = d.fyP_Tot_Amount || 0;
    // const chequeNo = d.fyP_DD_Cheque_No || '';
    // const chequeDate = formatDate(d.fyP_DD_Cheque_Date);
    // const bank = d.fyP_Bank_Name || '';
    // const remarks = d.fyP_Remarks || '';
    // const paymode = d.fyP_Bank_Or_Cash;

    // const asmaY_Year = d.asmaY_Year;

    const studentname = '';
    const logo = '';
    const receiptNo = '';
    const date = '';
    const headName = '';
    const amount = 0; // keep as number if used in calculations
    const chequeNo = '';
    const chequeDate = '';
    const bank = '';
    const remarks = '';
    const paymode = '';
    const asmaY_Year = '';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
            <div className='relative max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg bg-white shadow-2xl'>
                <div ref={receiptRef} className='p-8'>
                    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                        {/* School Copy */}
                        <div className='border-2 border-gray-300 p-6'>
                            {/* <div className="mb-4 text-right">
                <span className="font-bold text-violet-700">SCHOOL COPY</span>
              </div> */}
                            {/* Logo */}
                            <div className='flex justify-center'>
                                {logo ? (
                                    <Image src={logo} width={450} height={90} alt='logo' />
                                ) : (
                                    <div className='h-20 w-20 rounded-full bg-gray-200' />
                                )}
                            </div>

                            <InstituteHeader />
                            <div className='mb-4 text-center'>
                                <span className='font-bold text-violet-700'>SCHOOL COPY</span>
                            </div>

                            <div className='mb-4 space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Receipt No.</span>:
                                        <span className='ml-1'>{receiptNo}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Class</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Adm No.</span>:<span className='ml-1'>{}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Section</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Student Name</span>:
                                        <span className='ml-1'>{studentname}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Aca Year</span>:<span className='ml-1'>{asmaY_Year}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Father</span>:<span className='ml-1'>{}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Date</span>:<span className='ml-1'>{date}</span>
                                    </div>
                                </div>

                                <div className='flex justify-start gap-4'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Mother</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>
                            </div>

                            <table className='mt-4 w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='bg-blue-700 text-white'>
                                        <th className='border px-2 py-1'>SLNO</th>
                                        <th className='border px-2 py-1'>Fee Name</th>
                                        <th className='border px-2 py-1'>Fee Amount</th>
                                        <th className='border px-2 py-1'>Refund Date</th>
                                        <th className='border px-2 py-1'>Refund No</th>
                                        <th className='border px-2 py-1'>Refund Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='border px-2 py-1 text-center'>1</td>
                                        <td className='border px-2 py-1'>{headName}</td>
                                        <td className='border px-2 py-1 text-right'>{amount}</td>
                                        <td className='border px-2 py-1 text-center'>{}</td>
                                        <td className='border px-2 py-1 text-center'>{}</td>
                                        <td className='border px-2 py-1 text-right'>{}</td>
                                    </tr>
                                    <tr className='text-center font-semibold'>
                                        <td className='border px-2 py-1 text-center' colSpan={5}>
                                            Total
                                        </td>
                                        <td className='border px-2 py-1 text-right'>{}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <br />

                            {/* <div className="mb-4 text-sm">
                <strong>Amount Received (in Words):</strong>{" "}
                {convertNumberToWords(paidAmount)} Rupees Only/-
              </div> */}
                            <div className='mb-4 text-sm'>
                                <strong>Amount Received (in Words):</strong> {convertNumberToWords(amount)} Rupees Only/-
                            </div>

                            {/* <div className="mb-4 text-xs">
                <strong>Note:</strong> This receipt is valid subject to
                realisation of Cheque
              </div> */}

                            <div className='mt-8 text-right'>
                                <p className='font-bold'>AUTHORISED SIGNATORY</p>
                            </div>
                        </div>

                        {/* Parent Copy - Now Uses Dynamic Logo Only */}
                        <div className='border-2 border-gray-300 p-6'>
                            {/* <div className="mb-4 text-right">
                <span className="font-bold text-violet-700">PARENT COPY</span>
              </div>
              <InstituteHeader /> */}
                            <div className='flex justify-center'>
                                {logo ? (
                                    <Image src={logo} width={450} height={90} alt='logo' />
                                ) : (
                                    <div className='h-20 w-20 rounded-full bg-gray-200' />
                                )}
                            </div>

                            <InstituteHeader />
                            <div className='mb-4 text-center'>
                                <span className='font-bold text-violet-700'>PARENT COPY</span>
                            </div>

                            <div className='mb-4 space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Receipt No.</span>:
                                        <span className='ml-1'>{receiptNo}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Class</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Adm No.</span>:<span className='ml-1'>{}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Section</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Student Name</span>:
                                        <span className='ml-1'>{studentname}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Aca Year</span>:<span className='ml-1'>{asmaY_Year}</span>
                                    </div>
                                </div>

                                <div className='flex justify-between'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Father</span>:<span className='ml-1'>{}</span>
                                    </div>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Date</span>:<span className='ml-1'>{date}</span>
                                    </div>
                                </div>

                                <div className='flex justify-start gap-4'>
                                    <div className='flex min-w-[200px] gap-1'>
                                        <span className='w-[100px] font-semibold'>Mother</span>:<span className='ml-1'>{}</span>
                                    </div>
                                </div>
                            </div>

                            <table className='mt-4 w-full border-collapse text-sm'>
                                <thead>
                                    <tr className='bg-blue-700 text-white'>
                                        <th className='border px-2 py-1'>SLNO</th>
                                        <th className='border px-2 py-1'>Fee Name</th>
                                        <th className='border px-2 py-1'>Fee Amount</th>
                                        <th className='border px-2 py-1'>Refund Date</th>
                                        <th className='border px-2 py-1'>Refund No</th>
                                        <th className='border px-2 py-1'>Refund Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='border px-2 py-1 text-center'>1</td>
                                        <td className='border px-2 py-1'>{headName}</td>
                                        <td className='border px-2 py-1 text-right'>{amount}</td>
                                        <td className='border px-2 py-1 text-center'>{}</td>
                                        <td className='border px-2 py-1 text-center'>{}</td>
                                        <td className='border px-2 py-1 text-right'>{}</td>
                                    </tr>
                                    <tr className='text-center font-semibold'>
                                        <td className='border px-2 py-1 text-center' colSpan={5}>
                                            Total
                                        </td>
                                        <td className='border px-2 py-1 text-right'>{}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />

                            {/* <div className="mb-4 text-sm">
                <strong>Amount Received (in Words):</strong>{" "}
                {convertNumberToWords(paidAmount)} Rupees Only/-
              </div> */}

                            <div className='mb-4 text-sm'>
                                <strong>Amount Received (in Words):</strong> {convertNumberToWords(amount)} Rupees Only/-
                            </div>

                            <div className='mt-8 text-right'>
                                <p className='font-bold'>AUTHORISED SIGNATORY</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='sticky bottom-0 z-10 flex justify-end gap-2 border-t bg-white p-4 print:hidden'>
                    <Button onClick={handlePrint} variant='default'>
                        Print
                    </Button>
                    <Button onClick={onClose} variant='outline'>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
