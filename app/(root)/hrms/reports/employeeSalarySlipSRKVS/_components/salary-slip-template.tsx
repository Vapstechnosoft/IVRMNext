'use client';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Printer, X } from 'lucide-react';
interface EarningsItem {
    name: string;
    amount: number;
}
interface DeductionsItem {
    name: string;
    amount: number;
}
interface LeaveDetail {
    serialNo: number;
    leaveName: string;
    totalLeaves: number;
    availedLeaves: number;
    balanceLeaves: number;
}
interface SalarySlipData {
    // Employee Information
    employeeName: string;
    employeeCode: string;
    designation: string;
    department?: string;
    dateOfJoining?: string;
    panNo?: string;
    payLevel?: string;
    bankName?: string;
    bankAccountNo?: string;
    pfNo?: string;
    esiNo?: string;
    uanNumber?: string;
    lopDays: number;
    totalDays?: number;
    paySlipSeq?: number;
    // Financial Details
    earnings: EarningsItem[];
    deductions: DeductionsItem[];
    grossPay: number;
    totalDeduction: number;
    netPayable: number;
    amountInWords: string;
    pensionFund?: number;
    // Leave Details
    leaveDetails: LeaveDetail[];
}
interface SalarySlipTemplateProps {
    schoolName?: string;
    schoolAddress?: string;
    schoolLogo?: string;
    month: string;
    year: string;
    salarySlipData: SalarySlipData | null;
    showLopDays: boolean;
    showLeaveDetails: boolean;
    showPanCardNo: boolean;
    showBankDetails?: boolean;
    isLoading?: boolean;
    showActions?: boolean;
    onPrint: () => void;
    onSendMail: () => void;
    onSendSMS: () => void;
    onCancel: () => void;
}

export function numberToWords(num: number) {
    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const b = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    function inWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
        if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
        return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
    }

    const [rupees, paise] = num.toFixed(2).split(".");

    let words = inWords(parseInt(rupees)) + " Rupees";

    if (parseInt(paise) > 0) {
        words += " and " + inWords(parseInt(paise)) + " Paise";
    }

    return words + " Only";
}

export function SalarySlipTemplate({
    schoolName = '',
    schoolAddress = '',
    schoolLogo,
    month,
    year,
    salarySlipData,
    showLopDays = false,
    showLeaveDetails = false,
    showPanCardNo = false,
    showBankDetails = false,
    isLoading = false,
    showActions = true,
    onPrint,
    onSendMail,
    onSendSMS,
    onCancel
}: SalarySlipTemplateProps) {
    // Format currency
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '0.00';
        return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    // Get month name
    const MONTHS = [
        { id: 1, name: 'January' }, { id: 2, name: 'February' }, { id: 3, name: 'March' },
        { id: 4, name: 'April' }, { id: 5, name: 'May' }, { id: 6, name: 'June' },
        { id: 7, name: 'July' }, { id: 8, name: 'August' }, { id: 9, name: 'September' },
        { id: 10, name: 'October' }, { id: 11, name: 'November' }, { id: 12, name: 'December' }
    ];
    const monthRecord = MONTHS.find(m => m.id.toString() === month.toString());
    const displayMonthName = monthRecord ? monthRecord.name : month;
    const yearValue = year || '';

    // Prepare table rows for side-by-side display
    const earnings = salarySlipData?.earnings || [];
    const deductions = salarySlipData?.deductions || [];
    const maxRows = Math.max(earnings.length, deductions.length);
    const tableRows = Array.from({ length: maxRows }, (_, i) => ({
        earning: earnings[i] || null,
        deduction: deductions[i] || null
    }));

    if (isLoading) {
        return (
            <div className='mx-auto w-full max-w-[900px] bg-white p-6 py-24 text-center text-gray-500 shadow-sm'>
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p>Loading salary slip...</p>
                </div>
            </div>
        );
    }

    if (!salarySlipData) {
        return (
            <div className='mx-auto w-full max-w-[900px] bg-white p-6 py-12 text-center text-gray-500 shadow-sm border rounded-xl'>
                No salary slip data available.
            </div>
        );
    }

    return (
        <div className=' w-full bg-white p-8 shadow-md print:p-0 print:shadow-none mb-8'>
            <div id="EmpPaySlip" className="w-full">
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between border-b-2 border-black pb-4">
                    <div className="flex-shrink-0">
                        {schoolLogo && (
                            <img src={schoolLogo} alt="Institution Logo" className="h-[80px] w-auto object-contain" />
                        )}
                    </div>
                    <div className="flex-grow text-center">
                        <h1 className="text-3xl font-bold text-[#002c86] uppercase">{schoolName}</h1>
                        <p className="text-sm font-semibold">{schoolAddress}</p>
                    </div>
                    <div className="w-[80px]"></div>
                </div>

                <h3 className="mb-6 text-center text-xl font-bold underline">
                    Salary Slip: {displayMonthName} {yearValue}
                </h3>

                {/* Employee Details Section */}
                <div className="mb-6 grid grid-cols-2 gap-x-8 text-[13px] leading-relaxed">
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="w-[140px] font-semibold py-1">Name</td>
                                <td className="w-[10px] py-1">:</td>
                                <td className="py-1 uppercase">{salarySlipData.employeeName}</td>
                            </tr>
                            <tr>
                                <td className="font-semibold py-1">Department</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.department || '-'}</td>
                            </tr>
                            <tr>
                                <td className="font-semibold py-1">Designation</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.designation}</td>
                            </tr>
                            {/* {salarySlipData.uanNumber && (
                                <tr>
                                    <td className="font-semibold py-1">PF UAN Number</td>
                                    <td className="py-1">:</td>
                                    <td className="py-1">{salarySlipData.uanNumber}</td>
                                </tr>
                            )} */}
                            {showBankDetails && (
                                <>
                                    <tr>
                                        <td className="font-semibold py-1">Bank Name</td>
                                        <td className="py-1">:</td>
                                        <td className="py-1">{salarySlipData.bankName || '-'}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-semibold py-1">Bank Acc No.</td>
                                        <td className="py-1">:</td>
                                        <td className="py-1">{salarySlipData.bankAccountNo || '-'}</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                    <table className="w-full border-collapse">
                        <tbody>
                            <tr>
                                <td className="w-[140px] font-semibold py-1">Employee Code</td>
                                <td className="w-[10px] py-1">:</td>
                                <td className="py-1">{salarySlipData.employeeCode}</td>
                            </tr>
                            {/* <tr>
                                <td className="font-semibold py-1">Date Of Joining</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.dateOfJoining ? new Date(salarySlipData.dateOfJoining).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '-'}</td>
                            </tr> */}
                            {showPanCardNo && salarySlipData.panNo && (
                                <tr>
                                    <td className="font-semibold py-1">PAN No.</td>
                                    <td className="py-1">:</td>
                                    <td className="py-1">{salarySlipData.panNo}</td>
                                </tr>
                            )}
                            {/* <tr>
                                <td className="font-semibold py-1">Total Days</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.totalDays || 0}</td>
                            </tr> */}
                            {showLopDays && (
                                <tr>
                                    <td className="font-semibold py-1">L.W.O.P Days</td>
                                    <td className="py-1">:</td>
                                    <td className="py-1">{salarySlipData.lopDays || 0}</td>
                                </tr>
                            )}
                            {/* <tr>
                                <td className="font-semibold py-1">Pay Slip Seq</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.paySlipSeq || 0}</td>
                            </tr> */}
                            <tr>
                                <td className="font-semibold py-1">Date of Joining</td>
                                <td className="py-1">:</td>
                                <td className="py-1">{salarySlipData.dateOfJoining?.split('T')[0] || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Combined Earnings & Deductions Table */}
                <div className="mb-6">
                    <table className="w-full border-collapse border border-black text-[13px]">
                        <thead>
                            <tr>
                                <th className="border border-black p-2 text-left font-bold w-[35%]">Earnings</th>
                                <th className="border border-black p-2 text-right font-bold w-[15%]">Amount</th>
                                <th className="border border-black p-2 text-left font-bold w-[35%]">Deductions</th>
                                <th className="border border-black p-2 text-right font-bold w-[15%]">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, index) => (
                                <tr key={index}>
                                    <td className="border border-black p-2 text-left">
                                        {row.earning?.name || ''}
                                    </td>
                                    <td className="border border-black p-2 text-right">
                                        {row.earning ? formatCurrency(row.earning.amount) : ''}
                                    </td>
                                    <td className="border border-black p-2 text-left">
                                        {row.deduction?.name || ''}
                                    </td>
                                    <td className="border border-black p-2 text-right">
                                        {row.deduction ? formatCurrency(row.deduction.amount) : ''}
                                    </td>
                                </tr>
                            ))}
                            <tr className="font-bold">
                                <td className="border border-black p-2 text-left">Total:</td>
                                <td className="border border-black p-2 text-right">{formatCurrency(salarySlipData.grossPay)}</td>
                                <td className="border border-black p-2 text-left">Total:</td>
                                <td className="border border-black p-2 text-right">{formatCurrency(salarySlipData.totalDeduction)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="mb-10 space-y-2 text-[13px]">
                    <div className="flex gap-2">
                        <span className="w-[180px] font-bold">Net Salary</span>
                        <span className="font-semibold">: {formatCurrency(salarySlipData.netPayable)} /-</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="w-[180px] font-bold">Net Salary in Words</span>
                        <span className="font-semibold">: {numberToWords(salarySlipData.netPayable)}</span>
                    </div>
                    {/* {salarySlipData.pensionFund !== undefined && (
                        <div className="flex gap-2">
                            <span className="w-[180px] font-bold">Pension Fund</span>
                            <span className="font-semibold">: {formatCurrency(salarySlipData.pensionFund)} /-</span>
                        </div>
                    )} */}
                </div>

                {/* Signature Section */}
                <div className="mb-10 flex justify-between px-4 text-[13px] font-bold">
                    <span>Principal/Accountant</span>
                    <span>Signature</span>
                </div>

                {/* Note */}
                <p className="mb-12 text-center text-[12px] font-bold italic">
                    NOTE : Signature is not required because it is a computer generated statement.
                </p>

                {/* Leave Details Table */}
                {showLeaveDetails && (
                    <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-8">
                        <h4 className="mb-4 text-center font-bold text-lg underline">Leave Details</h4>
                        <table className="mx-auto w-[80%] border-collapse border border-black text-[13px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-black p-2 text-center font-bold">Serial No.</th>
                                    <th className="border border-black p-2 text-center font-bold">Leave Name</th>
                                    <th className="border border-black p-2 text-center font-bold">Total Leaves</th>
                                    <th className="border border-black p-2 text-center font-bold">Availed Leaves</th>
                                    <th className="border border-black p-2 text-center font-bold">Balance Leaves</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salarySlipData.leaveDetails && salarySlipData.leaveDetails.length > 0 ? (
                                    salarySlipData.leaveDetails.map((leave, index) => (
                                        <tr key={index}>
                                            <td className="border border-black p-2 text-center">{leave.serialNo}</td>
                                            <td className="border border-black p-2 text-left pl-4">{leave.leaveName || '-'}</td>
                                            <td className="border border-black p-2 text-center">{leave.totalLeaves || 0}</td>
                                            <td className="border border-black p-2 text-center">{leave.availedLeaves || 0}</td>
                                            <td className="border border-black p-2 text-center">{leave.balanceLeaves || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="border border-black p-4 text-center text-gray-400">
                                            No leave details available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            {showActions && (
                <div className='mt-8 flex flex-wrap justify-end gap-3 border-t pt-6 print:hidden'>
                    <Button variant='outline' onClick={onCancel} className="bg-white hover:bg-gray-50">
                        <X className="mr-2 size-4" />
                        CANCEL
                    </Button>

                    <Button variant='default' onClick={onPrint} className="bg-primary hover:bg-primary/90">
                        <Printer className="mr-2 size-4" />
                        PRINT
                    </Button>
                </div>
            )}
        </div>
    );
}
