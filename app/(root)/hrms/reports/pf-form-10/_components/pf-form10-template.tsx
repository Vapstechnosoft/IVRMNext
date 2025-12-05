'use client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer, X } from 'lucide-react';
interface MemberLeavingService {
    serialNo: number;
    accountNo: string;
    memberName: string;
    fatherOrHusbandName: string;
    dateOfLeaving: string;
    reasonForLeaving: string;
    remarks: string;
}
interface PFForm10TemplateProps {
    establishmentName?: string;
    establishmentCode?: string;
    establishmentAddress?: string;
    month?: string;
    year?: string;
    membersLeavingService: MemberLeavingService[];
    isLoading?: boolean;
    onPrint: () => void;
    onCancel: () => void;
}
export function PFForm10Template({
    establishmentName = '',
    establishmentCode = '',
    establishmentAddress = '',
    month = '',
    year = '',
    membersLeavingService = [],
    isLoading = false,
    onPrint,
    onCancel
}: PFForm10TemplateProps) {
    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd-MM-yyyy');
        } catch {
            return dateString;
        }
    };
    return (
        <div className='mx-auto w-full max-w-[1200px] bg-white p-6 print:p-4'>
            {/* Main Title */}
            <div className='mb-6 text-center'>
                <h1 className='mb-4 font-bold text-2xl text-gray-900 uppercase'>PF FORM 10</h1>
            </div>
            {/* Scheme Information */}
            <div className='mb-6 space-y-2 text-center text-sm'>
                <p className='font-semibold text-gray-800'>THE EMPLOYEES' PROVIDENT FUND SCHEME, 1952[ PARAGRAPH 36 (2) (A)]</p>
                <p className='font-semibold text-gray-800'>AND</p>
                <p className='font-semibold text-gray-800'>THE EMPLOYEES' PENSION FUND SCHEME, 1995[ PARA 20 (4)]</p>
            </div>
            {/* Return Title */}
            <div className='mb-6 text-center'>
                <p className='font-semibold text-base text-gray-800'>
                    Return of Members Leaving Service during the month of {month} - {year}
                </p>
            </div>
            {/* Establishment Details */}
            <div className='mb-6 space-y-3 text-sm'>
                <div>
                    <span className='font-medium text-gray-700'>Name of Establishment: </span>
                    <span className='text-gray-900'>{establishmentName || '-'}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>Code No. of Factory/ Establishment: </span>
                    <span className='text-gray-900'>PF</span>
                    <div className='h-6 w-32 border border-gray-300 bg-white' />
                </div>
                <div>
                    <span className='font-medium text-gray-700'>Address of the Factory/ Establishment: </span>
                    <span className='text-gray-900'>{establishmentAddress || '-'}</span>
                </div>
            </div>
            {/* Members Leaving Service Table */}
            <div className='mb-6 overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-xs'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>S. No</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>Account No.</th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Name of the Member (in BLOCK letters)
                            </th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Father's Name or Husband's Name in case of married women
                            </th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Date of Leaving Service
                            </th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>
                                Reason for Leaving Service
                            </th>
                            <th className='border border-gray-300 px-2 py-2 text-center font-semibold text-gray-900'>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className='border border-gray-300 px-4 py-8 text-center text-gray-500'>
                                    Loading PF Form 10 data...
                                </td>
                            </tr>
                        ) : membersLeavingService.length === 0 ? (
                            <tr>
                                <td className='border border-gray-300 px-2 py-2 text-center'>1</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                                <td className='border border-gray-300 px-2 py-2 text-center'>-</td>
                            </tr>
                        ) : (
                            membersLeavingService.map((member, index) => (
                                <tr key={index}>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{member.serialNo}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{member.accountNo || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left uppercase'>{member.memberName || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-left'>{member.fatherOrHusbandName || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>
                                        {formatDate(member.dateOfLeaving) || '-'}
                                    </td>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{member.reasonForLeaving || '-'}</td>
                                    <td className='border border-gray-300 px-2 py-2 text-center'>{member.remarks || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {/* Instructions and Certifications Section */}
            <div className='mb-6 space-y-4 text-xs'>
                <div>
                    <span className='font-medium text-gray-700'>Date: </span>
                    <div className='mt-1 inline-block h-6 w-32 border border-gray-300 bg-white' />
                </div>
                <div className='space-y-3 text-justify text-gray-800 leading-relaxed'>
                    <p>
                        The reasons for leaving service may be stated as under: (i) Retiring, (ii) Leaving India, (iii) Retrenched, (iv)
                        Dismissed, (v) Discharged, (vi) Resigning, (vii) Taking up employment elsewhere, (viii) Dead.
                    </p>
                    <div className='space-y-2'>
                        <p>
                            (1) In case of deduction from the accounts of members dismissed for misconduct, the following certificate should
                            be filled in:
                        </p>
                        <div className='ml-4 space-y-1'>
                            <p>
                                Sr. No. <span className='font-semibold'>_____</span> Shri. <span className='font-semibold'>_____</span>{' '}
                                employer's contribution amounting to Rs. <span className='font-semibold'>_____</span> has been forfeited in
                                accordance with the provisions of paragraph 72 of the Employees' Provident Fund Scheme, 1952. A copy of the
                                order of dismissal is enclosed.
                            </p>
                        </div>
                        <p>(2) In case of discharge from service, the following certificate should be filled in:</p>
                        <div className='ml-4 space-y-1'>
                            <p>
                                Sr. No. <span className='font-semibold'>_____</span> Shri. <span className='font-semibold'>_____</span> has
                                been paid compensation amounting to Rs. <span className='font-semibold'>_____</span> in accordance with the
                                provisions of the Industrial Disputes Act, 1947.
                            </p>
                        </div>
                    </div>
                    <p>
                        I certify that the difference in contribution, if any, is due to rounding off of the contribution to the nearest
                        rupee.
                    </p>
                </div>
                {/* Signature Section */}
                <div className='mt-8'>
                    <div className='mb-2'>
                        <span className='font-medium text-gray-700'>Signature of the employer with Official Seal</span>
                    </div>
                    <div className='h-16 w-full border border-gray-300 bg-white' />
                </div>
                {/* Note */}
                <div className='mt-4 rounded-md border border-gray-300 bg-gray-50 p-3'>
                    <p className='font-semibold text-gray-900'>Note:</p>
                    <p className='mt-1 text-gray-800'>
                        If the employee was a member of Employees' Provident Fund and Employees' Family Pension scheme before joining this
                        factory, details of membership should be given in the remarks column.
                    </p>
                </div>
            </div>
            {/* Action Buttons */}
            <div className='flex justify-end gap-3 print:hidden'>
                <Button variant='outline' onClick={onCancel} prefix={<X className='size-4' />}>
                    CANCEL
                </Button>
                <Button variant='outline' onClick={onPrint} prefix={<Printer className='size-4' />}>
                    PRINT
                </Button>
            </div>
        </div>
    );
}
