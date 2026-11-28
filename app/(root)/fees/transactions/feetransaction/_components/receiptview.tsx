'use client';

import { Button } from '@/components/ui/button';
import { getStudentPrintDetails } from '@/server/fees/trasactions/fee_student_transaction';
import { getPrintdetails } from '@/server/fees/trasactions/feepreadmissiontrasaction';
import type { CurrentPaymentDetails, Ifeetransaction, StudentPrintDetails } from '@/types/fees/transactions/transactions';
import { useEffect, useMemo, useRef, useState } from 'react';
import Portal from './portal';

interface IInstituteDetails {
    institute_logo?: string;
}

interface ReceiptViewPageProps {
    rowData: Ifeetransaction;
    onClose: () => void;
    asmayId: number;
    asmayYear: string;
}

/**
 * Helper to compile AngularJS-style fee receipt template with scope variables and ng-repeat loops.
 */
function compileReceiptTemplate(template: string, scope: Record<string, any>): string {
    if (!template || typeof template !== 'string' || template.trim() === '') return '';
    let compiled = template;

    // 1. Process ng-repeat loops (e.g. <tr ng-repeat="user in showdetailsreceipt">...</tr>)
    const repeatRegex =
        /<([a-zA-Z0-9]+)([^>]*?)ng-repeat=["'](\w+)\s+in\s+([a-zA-Z0-9_.]+)(?:\s*\|[^"']*)?["']([^>]*?)>([\s\S]*?)<\/\1>/gi;

    compiled = compiled.replace(repeatRegex, (_match: string, tag: string, beforeAttr: string, itemVar: string, listKey: string, afterAttr: string, innerContent: string) => {
        const normalizedKey = listKey.trim().toLowerCase();
        let list: any[] = [];

        for (const [k, v] of Object.entries(scope)) {
            if (k.toLowerCase() === normalizedKey && Array.isArray(v)) {
                list = v;
                break;
            }
        }

        // Clean attributes (remove ng-repeat)
        const cleanAttrs = `${beforeAttr} ${afterAttr}`.replace(/\s+/g, ' ').trim();
        const openTag = cleanAttrs ? `<${tag} ${cleanAttrs}>` : `<${tag}>`;
        const closeTag = `</${tag}>`;

        if (!list || list.length === 0) {
            return '';
        }

        return list
            .map((item: any, index: number) => {
                let rowHtml = innerContent;

                // Replace {{$index+1}} and {{$index}}
                rowHtml = rowHtml.replace(/\{\{\s*\$index\s*\+\s*1\s*\}\}/g, String(index + 1));
                rowHtml = rowHtml.replace(/\{\{\s*\$index\s*\}\}/g, String(index));

                // Replace item fields: {{ user.fieldName }}
                const itemFieldRegex = new RegExp(`\\{\\{\\s*${itemVar}\\.([a-zA-Z0-9_]+)\\s*(?:\\|[^}]*)?\\}\\}`, 'gi');
                rowHtml = rowHtml.replace(itemFieldRegex, (_m: string, fieldName: string) => {
                    const normField = fieldName.toLowerCase();
                    for (const [k, v] of Object.entries(item)) {
                        if (k.toLowerCase() === normField) {
                            return v !== null && v !== undefined ? String(v) : '';
                        }
                    }
                    if (normField === 'fmh_feename' || normField === 'feename') {
                        return item.fmH_FeeName || item.fmh_feename || 'Fee Amount';
                    }
                    if (normField === 'ftp_paid_amt' || normField === 'paidamount' || normField === 'paid_amount') {
                        return String(item.ftP_Paid_Amt ?? item.paid_amount ?? item.fyppM_TotalPaidAmount ?? 0);
                    }
                    if (normField === 'totalcharges' || normField === 'feeamount') {
                        return String(item.totalcharges ?? item.feeAmount ?? 0);
                    }
                    if (normField === 'ftp_concession_amt' || normField === 'concession') {
                        return String(item.ftP_Concession_Amt ?? item.concession_amount ?? 0);
                    }
                    if (normField === 'fti_name' || normField === 'installment') {
                        return item.ftI_Name || item.fti_name || '--';
                    }
                    return '';
                });

                return `${openTag}${rowHtml}${closeTag}`;
            })
            .join('');
    });

    // 2. Filter pipes like {{to_day |date:'yyyy'}}
    compiled = compiled.replace(
        /\{\{\s*to_day\s*\|\s*date\s*:\s*['"]yyyy['"]\s*\}\}/gi,
        String(new Date().getFullYear())
    );
    compiled = compiled.replace(
        /\{\{\s*([a-zA-Z0-9_]+)\s*\|\s*date\s*(?::\s*['"][^'"]*['"])?\s*\}\}/gi,
        (_m: string, key: string) => {
            const val = scope[key] || scope[key.toLowerCase()];
            return val ? String(val) : '';
        }
    );

    // 3. Simple variable interpolations: {{variable}}
    const varRegex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
    compiled = compiled.replace(varRegex, (_match: string, varName: string) => {
        const trimmed = varName.trim();
        const norm = trimmed.toLowerCase();

        // Exact match in scope
        if (scope[trimmed] !== undefined && scope[trimmed] !== null) {
            return String(scope[trimmed]);
        }

        // Case-insensitive match in scope
        for (const [k, v] of Object.entries(scope)) {
            if (k.toLowerCase() === norm && v !== undefined && v !== null) {
                return String(v);
            }
        }

        // Common synonyms / fallback mappings
        switch (norm) {
            case 'receiptno':
            case 'receipt_no':
            case 'fyp_receipt_no':
                return scope.receiptno || '';
            case 'paid_date':
            case 'fyp_date':
            case 'date':
                return scope.Paid_Date || scope.FYP_Date || '';
            case 'amst_admno':
            case 'admno':
            case 'regno':
                return scope.AMST_AdmNo || '';
            case 'asmay_year':
            case 'year':
                return scope.asmaY_Year || '';
            case 'amst_firstname':
            case 'studentname':
            case 'name':
                return scope.AMST_FirstName || '';
            case 'asmcl_classname':
            case 'classname':
            case 'class':
                return scope.ASMCL_ClassName || '';
            case 'asmc_sectionname':
            case 'sectionname':
            case 'section':
                return scope.ASMC_SectionName || '';
            case 'amst_fathername':
            case 'fathername':
            case 'father':
                return scope.AMST_FatherName || '';
            case 'amst_mothername':
            case 'mothername':
            case 'mother':
                return scope.AMST_MotherName || '';
            case 'imgname':
            case 'logo':
            case 'institute_logo':
                return scope.imgname || '';
            case 'words':
            case 'amountinwords':
                return scope.words || '';
            case 'atota':
            case 'totalamount':
            case 'paidamount':
                return String(scope.atotA ?? 0);
            case 'due_amount':
            case 'dueamount':
            case 'pendingamount':
                return String(scope.due_amount ?? 0);
            case 'paymentmode':
            case 'modeofpayment':
                return scope.paymentmode || 'Cash';
            default:
                return '';
        }
    });

    // 4. Clean up any remaining angular directives
    compiled = compiled.replace(/\s*ng-[a-zA-Z0-9_-]+(=["'][^"']*["'])?/gi, '');

    return compiled;
}

export default function ReceiptViewPage({ rowData, onClose, asmayId, asmayYear }: ReceiptViewPageProps) {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [institute, setInstitute] = useState<IInstituteDetails>({});
    const [loading, setLoading] = useState(true);
    const [dueAmount, setDueAmount] = useState(0);
    const [studentDetails, setStudentDetails] = useState<StudentPrintDetails[]>([]);
    const [currentPaymentDetails, setCurrentPaymentDetails] = useState<CurrentPaymentDetails[]>([]);
    const [copyTitles, setCopyTitles] = useState<string[]>(['INSTITUTION COPY', 'STUDENT COPY']);
    const [studentMeta, setStudentMeta] = useState<any>({});
    const [rawBackendTemplate, setRawBackendTemplate] = useState<string | null>(null);

    useEffect(() => {
        const targetFypId = Number(rowData.fyP_Id || (rowData as any).fP_Id || 0);

        const fetchStudentPrintDetails = async () => {
            if (!targetFypId) {
                console.warn('ReceiptViewPage: fyP_Id is 0 or missing, cannot fetch print details');
                setLoading(false);
                return;
            }
            try {
                const response = await getStudentPrintDetails({
                    amst_Id: rowData.amst_Id,
                    fyP_Id: targetFypId,
                    asmaY_Id: asmayId,
                    minstall: '0'
                });

                // Normalize response: parse JSON string if needed
                let res: any = response;
                if (typeof response === 'string') {
                    const trimmed = (response as unknown as string).trim();
                    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                        try {
                            res = JSON.parse(trimmed);
                        } catch {
                            res = response;
                        }
                    }
                }

                const printtermDTOs = res?.printtermDTOs || res?.data?.printtermDTOs || {};
                const sDetails = JSON.parse(
                    JSON.stringify(
                        res?.showdetailsreceipt ||
                            res?.data?.showdetailsreceipt ||
                            printtermDTOs?.fee_termwise_fee_receipt_details ||
                            []
                    )
                );
                const pDetails = JSON.parse(
                    JSON.stringify(
                        res?.paymenrgrid ||
                            res?.data?.paymenrgrid ||
                            printtermDTOs?.currpaymentdetails ||
                            []
                    )
                );
                const dAmount = JSON.parse(
                    JSON.stringify(
                        res?.dueamount ??
                            res?.pendingamount ??
                            res?.data?.dueamount ??
                            res?.data?.pendingamount ??
                            0
                    )
                );

                const sInfo = res?.fillstudentviewdetails?.[0] || res?.data?.fillstudentviewdetails?.[0] || {};
                setStudentMeta(sInfo);
                setDueAmount(dAmount);
                setStudentDetails(sDetails);
                setCurrentPaymentDetails(pDetails);

                // Robust check for backend HTML template
                let templateString: string | null = null;
                if (typeof res === 'string' && res.trim().startsWith('<')) {
                    templateString = res;
                } else if (res?.htmldata && typeof res.htmldata === 'string') {
                    templateString = res.htmldata;
                } else if (res?.htmlData && typeof res.htmlData === 'string') {
                    templateString = res.htmlData;
                } else if (res?.data?.htmldata && typeof res.data.htmldata === 'string') {
                    templateString = res.data.htmldata;
                } else if (res?.data?.htmlData && typeof res.data.htmlData === 'string') {
                    templateString = res.data.htmlData;
                } else if (typeof res?.data === 'string' && res.data.trim().startsWith('<')) {
                    templateString = res.data;
                } else if (res?.template && typeof res.template === 'string') {
                    templateString = res.template;
                }

                if (templateString && templateString.trim() !== '') {
                    setRawBackendTemplate(templateString);

                    // Extract copy titles dynamically if present
                    const matches = [
                        ...templateString.matchAll(
                            /<(?:h[456]|span|b|strong|div)[^>]*>\s*([^<]*?COPY)\s*<\/(?:h[456]|span|b|strong|div)>/gi
                        )
                    ]
                        .map((m) => m[1].trim())
                        .filter((t) => t.length > 0);

                    if (matches.length > 0) {
                        setCopyTitles(matches);
                    }
                }
            } catch (err) {
                console.error('Failed to load student print details', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchInstituteDetails = async () => {
            if (!targetFypId) return;
            try {
                const preadmissionorprospectus = 'Preadmission';
                const res = await getPrintdetails(targetFypId, asmayId, preadmissionorprospectus, 0);
                const response = typeof res === 'string' ? JSON.parse(res) : res;
                const logoUrl = response?.data?.institute_logo || response?.institute_logo || '';
                if (logoUrl) {
                    setInstitute({
                        institute_logo: `${logoUrl}?t=${Date.now()}`
                    });
                }

                // Fallback check if getPrintdetails provided the HTML template
                const instTemplate =
                    (typeof response === 'string' && response.trim().startsWith('<') ? response : null) ||
                    response?.htmldata ||
                    response?.data?.htmldata ||
                    response?.htmlData ||
                    response?.data?.htmlData;

                if (instTemplate && typeof instTemplate === 'string' && instTemplate.trim() !== '') {
                    setRawBackendTemplate((prev) => prev || instTemplate);
                }
            } catch (err) {
                console.error('Failed to load institute logo', err);
                setInstitute({ institute_logo: '' });
            }
        };

        fetchInstituteDetails();
        fetchStudentPrintDetails();
    }, [rowData, asmayId]);

    const receipt_no = studentMeta?.fyP_Receipt_No || rowData.fyP_Receipt_No || 'N/A';
    const transaction_date = studentMeta?.fyP_Date || rowData.fyP_Date || '';
    const student_name =
        studentMeta?.amsT_FirstName
            ? `${studentMeta.amsT_FirstName || ''} ${studentMeta.amsT_MiddleName || ''} ${studentMeta.amsT_LastName || ''}`.trim()
            : `${rowData?.amsT_FirstName || ''} ${rowData?.amsT_MiddleName || ''} ${rowData?.amsT_LastName || ''}`.trim() || 'N/A';
    const reg_no = studentMeta?.admno || studentMeta?.amsT_AdmNo || rowData.amsT_AdmNo || 'N/A';
    const class_name = studentMeta?.classname || rowData.classname || '';
    const section_name = studentMeta?.sectionname || (rowData as any).sectionname || (rowData as any).asmC_SectionName || '';
    const full_class = section_name ? `${class_name} - ${section_name}` : class_name;
    const academic_year = studentMeta?.asmaY_Year || asmayYear || '';
    const father_name = studentMeta?.fathername || (rowData as any).amsT_FatherName || '';
    const mother_name = studentMeta?.mothername || (rowData as any).amsT_MotherName || '';
    const concession_name = studentMeta?.fmcC_ConcessionName || (rowData as any).fmcC_ConcessionName || '';

    const currentPaidAmount =
        currentPaymentDetails.reduce((sum, p) => {
            return sum + (p.fyppM_TotalPaidAmount ?? (p as any).ftP_Paid_Amt ?? 0);
        }, 0) || Number(rowData.fyP_Tot_Amount || 0);

    const paymentMode =
        studentMeta?.fyP_Bank_Or_Cash === 'B'
            ? 'Bank'
            : studentMeta?.fyP_Bank_Or_Cash === 'C'
                ? 'Cash'
                : currentPaymentDetails[0]?.ivrmmoD_ModeOfPayment ||
                  currentPaymentDetails[0]?.ivrmmoD_Flag ||
                  (rowData as any).modeOfPayment ||
                  'Cash';

    const noteText =
        rowData.mI_Id === 78
            ? 'Fees Once Paid will not be Refunded.'
            : 'This receipt is valid subject to realisation of Cheque.';

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const convertNumberToWords = (num: number | undefined | null): string => {
        if (num === undefined || num === null || Number.isNaN(num)) return 'Zero';
        const numberValue = typeof num === 'string' ? Number.parseFloat(num) : num;
        if (Number.isNaN(numberValue) || numberValue === 0) return 'Zero';
        if (numberValue < 0) return `Negative ${convertNumberToWords(Math.abs(numberValue))}`;

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = [
            'Ten',
            'Eleven',
            'Twelve',
            'Thirteen',
            'Fourteen',
            'Fifteen',
            'Sixteen',
            'Seventeen',
            'Eighteen',
            'Nineteen'
        ];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convertLessThanThousand = (n: number): string => {
            if (n === 0) return '';
            let result = '';
            let temp = n;
            if (temp >= 100) {
                result += `${ones[Math.floor(temp / 100)]} Hundred`;
                temp %= 100;
                if (temp > 0) result += ' ';
            }
            if (temp >= 20) {
                result += tens[Math.floor(temp / 10)];
                if (temp % 10 > 0) result += ` ${ones[temp % 10]}`;
            } else if (temp >= 10) {
                result += teens[temp - 10];
            } else if (temp > 0) {
                result += ones[temp];
            }
            return result;
        };

        const convertLessThanLakh = (n: number): string => {
            if (n < 1000) return convertLessThanThousand(n);
            const thousands = Math.floor(n / 1000);
            const remainder = n % 1000;
            const thousandPart = `${convertLessThanThousand(thousands)} Thousand`;
            return remainder === 0 ? thousandPart : `${thousandPart} ${convertLessThanThousand(remainder)}`;
        };

        if (numberValue < 100000) return convertLessThanLakh(numberValue);
        const lakhs = Math.floor(numberValue / 100000);
        const remainder = numberValue % 100000;
        const lakhPart = `${convertLessThanThousand(lakhs)} Lakh`;
        return remainder === 0 ? lakhPart : `${lakhPart} ${convertLessThanLakh(remainder)}`;
    };

    // Compile backend template with full dynamic scope data
    const compiledBackendHtml = useMemo(() => {
        if (!rawBackendTemplate || typeof rawBackendTemplate !== 'string' || rawBackendTemplate.trim() === '') {
            return null;
        }

        const scopeData: Record<string, any> = {
            receiptno: receipt_no,
            receiptNo: receipt_no,
            Paid_Date: formatDate(transaction_date),
            paidDate: formatDate(transaction_date),
            FYP_Date: formatDate(transaction_date),
            AMST_AdmNo: reg_no,
            admno: reg_no,
            asmaY_Year: academic_year,
            year: academic_year,
            AMST_FirstName: student_name,
            studentName: student_name,
            ASMCL_ClassName: class_name,
            classname: class_name,
            ASMC_SectionName: section_name,
            sectionname: section_name,
            AMST_FatherName: father_name,
            fathername: father_name,
            AMST_MotherName: mother_name,
            mothername: mother_name,
            fmcC_ConcessionName: concession_name,
            concessionName: concession_name,
            imgname: institute.institute_logo || '',
            institute_logo: institute.institute_logo || '',
            words: `${convertNumberToWords(currentPaidAmount)} Rupees`,
            atotA: currentPaidAmount,
            totalPaidAmount: currentPaidAmount,
            paidAmount: currentPaidAmount,
            rtotA: 0,
            ctotA: studentDetails.reduce((sum, d: any) => sum + (d.ftP_Concession_Amt ?? d.concession_amount ?? 0), 0),
            totchar:
                studentDetails.reduce((sum, d: any) => sum + (d.feeAmount ?? d.totalcharges ?? 0), 0) ||
                currentPaidAmount,
            totbal: dueAmount,
            due_amount: dueAmount,
            dueamount: dueAmount,
            pendingamount: dueAmount,
            feeremarks: studentMeta?.fyP_Remarks || 'Remarks Not Given',
            period: studentMeta?.duration || (rowData as any).duration || '',
            paymentmode: paymentMode,
            modeofpayment: paymentMode,
            fyppM_TransactionId: currentPaymentDetails[0]?.fyppM_TransactionId || '',
            fyppM_PaymentReferenceId: currentPaymentDetails[0]?.fyppM_PaymentReferenceId || '',
            Refund_amount: studentMeta?.fsS_RefundAmount || 0,
            groupwisebal: 0,
            fynP_QRCode: studentMeta?.fyP_QRCode || '',
            MI_Name: studentMeta?.mI_Name || (rowData as any).mI_Name || '',
            MI_Address1: studentMeta?.mI_Address1 || '',
            MI_Address2: studentMeta?.mI_Address2 || '',
            MI_Address3: studentMeta?.mI_Address3 || '',
            MI_Pincode: studentMeta?.mI_Pincode || '',
            showdetailsreceipt: studentDetails,
            paymenrgrid: currentPaymentDetails,
            currpaymentdetails: currentPaymentDetails
        };

        return compileReceiptTemplate(rawBackendTemplate, scopeData);
    }, [
        rawBackendTemplate,
        receipt_no,
        transaction_date,
        reg_no,
        academic_year,
        student_name,
        class_name,
        section_name,
        father_name,
        mother_name,
        concession_name,
        institute.institute_logo,
        currentPaidAmount,
        dueAmount,
        paymentMode,
        studentDetails,
        currentPaymentDetails,
        studentMeta,
        rowData
    ]);

    // Show backend HTML template if available, else default
    const isShowingBackendTemplate = !!compiledBackendHtml;

    const handlePrint = () => {
        if (!receiptRef.current) return;
        const printWindow = window.open('', '_blank', 'width=1300,height=900');
        if (printWindow) {
            const content = receiptRef.current.innerHTML;

            if (isShowingBackendTemplate) {
                printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Receipt - ${receipt_no}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 0;
              margin: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .modal-footer, .btn, [data-dismiss="modal"] {
              display: none !important;
            }
            table th, table td {
              border: 1px solid #000 !important;
              padding: 3px 5px !important;
              font-size: 10px !important;
            }
            @media print {
              .print\\:hidden, .modal-footer { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="printmodal-wrapper">
            ${content}
          </div>
        </body>
        </html>
      `);
            } else {
                printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Receipt - ${receipt_no}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 landscape;
              margin: 6mm;
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 0;
              margin: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .receipt-grid {
              display: grid !important;
              grid-template-columns: repeat(${copyTitles.length}, minmax(0, 1fr)) !important;
              gap: 12px !important;
              width: 100% !important;
            }
            .receipt-card {
              border: 1px solid #000 !important;
              padding: 8px !important;
              font-size: 10px !important;
              box-shadow: none !important;
            }
            table th, table td {
              border: 1px solid #000 !important;
              padding: 2px 4px !important;
              font-size: 9.5px !important;
            }
            @media print {
              .print\\:hidden { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-grid">
            ${content}
          </div>
        </body>
        </html>
      `);
            }

            printWindow.document.close();
            printWindow.focus();
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 600);
            };
        }
    };

    if (loading) {
        return (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                <div className='rounded-lg bg-white p-8 font-medium shadow-xl'>Loading receipt details...</div>
            </div>
        );
    }

    const gridColsClass =
        copyTitles.length >= 3
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : copyTitles.length === 2
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-1';

    return (
        <Portal>
            <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-5'>
                <div className='relative flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl'>
                    {/* Header bar */}
                    <div className='flex items-center justify-between border-b bg-gray-50 px-6 py-3 print:hidden'>
                        <h3 className='font-bold text-gray-800 text-sm tracking-wide uppercase'>
                            Fee Receipt Preview
                        </h3>
                        <Button onClick={onClose} variant='ghost' size='sm' className='h-8 w-8 p-0 text-gray-500 hover:text-black'>
                            ✕
                        </Button>
                    </div>

                    {/* Scrollable Receipt Area */}
                    <div className='flex-1 overflow-auto p-4 sm:p-6'>
                        {/* 1. BACKEND HTML TEMPLATE (if sent by backend and active) */}
                        {isShowingBackendTemplate && compiledBackendHtml ? (
                            <div className='backend-receipt-container w-full'>
                                <style>{`
                                    .backend-receipt-template {
                                        width: 100%;
                                        font-family: system-ui, -apple-system, sans-serif;
                                    }
                                    .backend-receipt-template .modal-footer,
                                    .backend-receipt-template [data-dismiss="modal"] {
                                        display: none !important;
                                    }
                                    .backend-receipt-template .modal-dialog,
                                    .backend-receipt-template .modal-content,
                                    .backend-receipt-template .modal-body {
                                        width: 100% !important;
                                        max-width: 100% !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        border: none !important;
                                        box-shadow: none !important;
                                        background: transparent !important;
                                    }
                                    .backend-receipt-template table {
                                        width: 100% !important;
                                        border-collapse: collapse !important;
                                    }
                                    .backend-receipt-template table th,
                                    .backend-receipt-template table td {
                                        border: 1px solid #ddd !important;
                                        padding: 4px 6px !important;
                                    }
                                    .backend-receipt-template .col-sm-4 { width: 33.33333333%; float: left; padding: 0 8px; box-sizing: border-box; }
                                    .backend-receipt-template .col-sm-6 { width: 50%; float: left; padding: 0 8px; box-sizing: border-box; }
                                    .backend-receipt-template .col-sm-8 { width: 66.66666667%; float: left; padding: 0 8px; box-sizing: border-box; }
                                    .backend-receipt-template .col-sm-12 { width: 100%; float: left; padding: 0 8px; box-sizing: border-box; }
                                    .backend-receipt-template .row:after,
                                    .backend-receipt-template .clearfix:after {
                                        content: "";
                                        display: table;
                                        clear: both;
                                    }
                                    .backend-receipt-template .text-center { text-align: center !important; }
                                    .backend-receipt-template .text-right { text-align: right !important; }
                                    .backend-receipt-template .text-left { text-align: left !important; }
                                `}</style>
                                <div
                                    ref={receiptRef}
                                    className='backend-receipt-template'
                                    dangerouslySetInnerHTML={{ __html: compiledBackendHtml }}
                                />
                            </div>
                        ) : (
                            /* 2. DEFAULT TEMPLATE (shown if backend does not send template, or user toggled to default) */
                            <div ref={receiptRef} className={`receipt-grid grid gap-6 ${gridColsClass}`}>
                                {copyTitles.map((title, copyIndex) => (
                                    <div
                                        key={copyIndex}
                                        className='receipt-card flex flex-col rounded-lg border-2 border-gray-300 bg-white p-5 shadow-sm transition-all hover:shadow-md'>
                                        {/* Logo Header */}
                                        <div className='mb-3 text-center'>
                                            {institute.institute_logo ? (
                                                <div className='flex justify-center'>
                                                    <img
                                                        src={institute.institute_logo}
                                                        alt='Institute Logo'
                                                        className='max-h-16 w-auto object-contain'
                                                    />
                                                </div>
                                            ) : (
                                                <div className='py-2 text-center font-bold text-gray-800 text-base tracking-wider uppercase'>
                                                    Payment Receipt
                                                </div>
                                            )}
                                        </div>

                                        {/* Copy Title */}
                                        <div className='mb-3 border-b-2 border-violet-100 pb-2 text-center'>
                                            <h4 className='font-extrabold text-sm text-violet-700 tracking-wider uppercase'>
                                                {title}
                                            </h4>
                                        </div>

                                        {/* Student & Receipt Meta Grid */}
                                        <div className='mb-4 grid grid-cols-12 gap-x-2 gap-y-1.5 text-xs'>
                                            <div className='col-span-7 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Receipt No</span>
                                                <span className='font-semibold text-gray-900'>: {receipt_no}</span>
                                            </div>
                                            <div className='col-span-5 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Date</span>
                                                <span className='font-semibold text-gray-900'>: {formatDate(transaction_date)}</span>
                                            </div>

                                            <div className='col-span-7 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Adm No</span>
                                                <span className='font-semibold text-gray-900'>: {reg_no}</span>
                                            </div>
                                            <div className='col-span-5 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Aca Year</span>
                                                <span className='font-semibold text-gray-900'>: {academic_year}</span>
                                            </div>

                                            <div className='col-span-7 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Name</span>
                                                <span className='font-semibold text-gray-900 truncate' title={student_name}>
                                                    : {student_name}
                                                </span>
                                            </div>
                                            <div className='col-span-5 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Class</span>
                                                <span className='font-semibold text-gray-900 truncate' title={full_class}>
                                                    : {full_class}
                                                </span>
                                            </div>

                                            {father_name && (
                                                <div className='col-span-7 flex justify-between'>
                                                    <span className='font-bold text-gray-600'>Father</span>
                                                    <span className='font-semibold text-gray-900'>: {father_name}</span>
                                                </div>
                                            )}
                                            {concession_name && (
                                                <div className='col-span-5 flex justify-between'>
                                                    <span className='font-bold text-gray-600'>Type</span>
                                                    <span className='font-semibold text-gray-900'>: {concession_name}</span>
                                                </div>
                                            )}

                                            {mother_name && (
                                                <div className='col-span-7 flex justify-between'>
                                                    <span className='font-bold text-gray-600'>Mother</span>
                                                    <span className='font-semibold text-gray-900'>: {mother_name}</span>
                                                </div>
                                            )}
                                            <div className='col-span-5 flex justify-between'>
                                                <span className='font-bold text-gray-600'>Reg No.</span>
                                                <span className='font-semibold text-gray-900'>: {reg_no}</span>
                                            </div>
                                        </div>

                                        {/* Fee Breakdown Table */}
                                        <div className='mb-3'>
                                            <table className='w-full border-collapse border border-gray-300 text-xs'>
                                                <thead>
                                                    <tr className='bg-violet-700 text-white'>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>SLNO</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-left font-bold'>Head Name</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Fee Amount</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Installment</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Paid Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentDetails.length > 0 ? (
                                                        studentDetails.map((detail: any, idx: number) => (
                                                            <tr key={idx} className='odd:bg-white even:bg-gray-50'>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>{idx + 1}</td>
                                                                <td className='border border-gray-300 px-2 py-1'>
                                                                    {detail.fmH_FeeName || detail.fmh_feename || 'Fee Amount'}
                                                                </td>
                                                                <td className='border border-gray-300 px-2 py-1 text-right'>
                                                                    {detail.feeAmount ?? detail.totalcharges ?? detail.paid_amount ?? 0}
                                                                </td>
                                                                <td className='border border-gray-300 px-2 py-1 text-center'>
                                                                    {detail.ftI_Name || detail.fti_name || detail.fmt_name || '--'}
                                                                </td>
                                                                <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                    {detail.paid_amount ?? detail.ftP_Paid_Amt ?? 0}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>1</td>
                                                            <td className='border border-gray-300 px-2 py-1'>Fee Amount</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-right'>{currentPaidAmount}</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>--</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                {currentPaidAmount}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    {/* Totals Row */}
                                                    <tr className='bg-gray-100 font-bold'>
                                                        <td className='border border-gray-300 px-2 py-1 text-center' />
                                                        <td className='border border-gray-300 px-2 py-1'>Total</td>
                                                        <td className='border border-gray-300 px-2 py-1 text-right'>
                                                            {studentDetails.length > 0
                                                                ? studentDetails.reduce(
                                                                      (sum: number, d: any) =>
                                                                          sum + (d.feeAmount ?? d.totalcharges ?? d.paid_amount ?? 0),
                                                                      0
                                                                  )
                                                                : currentPaidAmount}
                                                        </td>
                                                        <td className='border border-gray-300 px-2 py-1 text-center' />
                                                        <td className='border border-gray-300 px-2 py-1 text-right text-violet-900'>
                                                            {currentPaidAmount}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Current Payment Detail Table */}
                                        <div className='mb-3'>
                                            <div className='mb-1 font-bold text-gray-800 text-xs'>Current Payment Detail</div>
                                            <table className='w-full border-collapse border border-gray-300 text-xs'>
                                                <thead>
                                                    <tr className='bg-violet-700 text-white'>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>SLNO</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-right font-bold'>Amount</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Bank / Mode</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Ref No</th>
                                                        <th className='border border-gray-300 px-2 py-1 text-center font-bold'>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentPaymentDetails.length > 0 ? (
                                                        currentPaymentDetails.map((p: any, idx: number) => {
                                                            const isBank =
                                                                p.fyP_Bank_Or_Cash === 'B' || p.ivrmmoD_Flag === 'B' || !!p.fyppM_BankName;
                                                            const bankOrMode = isBank
                                                                ? p.fyppM_BankName || p.fyP_Bank_Name || 'Bank'
                                                                : p.ivrmmoD_ModeOfPayment || p.fyP_Bank_Or_Cash || paymentMode || 'Cash';
                                                            const refNo = isBank
                                                                ? p.fyppM_DDChequeNo || p.fyP_DD_Cheque_No || '--'
                                                                : '--';
                                                            const dateVal = isBank
                                                                ? formatDate(p.fyppM_DDChequeDate || p.fyP_DD_Cheque_Date)
                                                                : formatDate(p.fyP_Date || transaction_date);
                                                            return (
                                                                <tr key={idx} className='odd:bg-white even:bg-gray-50'>
                                                                    <td className='border border-gray-300 px-2 py-1 text-center'>{idx + 1}</td>
                                                                    <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                        {p.fyppM_TotalPaidAmount ?? p.ftP_Paid_Amt ?? currentPaidAmount}
                                                                    </td>
                                                                    <td className='border border-gray-300 px-2 py-1 text-center'>{bankOrMode}</td>
                                                                    <td className='border border-gray-300 px-2 py-1 text-center'>{refNo}</td>
                                                                    <td className='border border-gray-300 px-2 py-1 text-center'>{dateVal}</td>
                                                                </tr>
                                                            );
                                                        })
                                                    ) : (
                                                        <tr>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>1</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-right font-semibold'>
                                                                {currentPaidAmount}
                                                            </td>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>{paymentMode}</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>--</td>
                                                            <td className='border border-gray-300 px-2 py-1 text-center'>
                                                                {formatDate(transaction_date)}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Bottom Info Section */}
                                        <div className='mt-auto space-y-1 text-xs'>
                                            <div>
                                                <span className='font-bold text-gray-700'>Payment Mode:</span>{' '}
                                                <span className='font-medium text-gray-900'>{paymentMode}</span>
                                            </div>
                                            <div>
                                                <span className='font-bold text-gray-700'>Amount Received (in Words):</span>{' '}
                                                <span className='font-medium text-gray-900 italic'>
                                                    {convertNumberToWords(currentPaidAmount)} Rupees Only/-
                                                </span>
                                            </div>
                                            {dueAmount > 0 && (
                                                <div>
                                                    <span className='font-bold text-gray-700'>Next Due Amount:</span>{' '}
                                                    <span className='font-bold text-red-600'>{dueAmount}/-</span>
                                                </div>
                                            )}
                                            <div className='pt-1 text-[11px] text-gray-500'>
                                                <strong>Note:</strong> {noteText}
                                            </div>
                                            <div className='pt-6 text-right'>
                                                <p className='font-bold text-gray-800 text-xs tracking-wider'>
                                                    AUTHORISED SIGNATORY
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className='sticky bottom-0 z-10 flex justify-end gap-3 border-t bg-gray-50 px-6 py-4 print:hidden'>
                        <Button onClick={handlePrint} variant='default' className='min-w-[100px] shadow-sm'>
                            Print
                        </Button>
                        <Button onClick={onClose} variant='outline' className='min-w-[100px]'>
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
