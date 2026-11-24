'use client';

import { Button } from '@/components/ui/button';
import { useFeeTransactionStatus } from '@/hooks/fees/useTrasactions';
import type { Ifeetransaction, ITransLogResult } from '@/types/fees/transactions/transactions';
import { CheckCircle2, CreditCard, Loader2, Minus, RefreshCw, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import Portal from './portal';

interface PaymentStatusModalProps {
    rowData: Ifeetransaction;
    asmayId: number;
    onClose: () => void;
}

export default function PaymentStatusModal({ rowData, asmayId, onClose }: PaymentStatusModalProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Extract target IDs safely
    const targetFypId = Number(rowData.fyP_Id || (rowData as any).fP_Id || 0);
    const targetAsmayId = Number(rowData.asmaY_ID || (rowData as any).asmaY_Id || asmayId || 0);

    const {
        data: statusResponse,
        isLoading,
        error,
        refetch
    } = useFeeTransactionStatus(targetFypId, targetAsmayId, true);

    // Close on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Parse logs from the API response
    const { transLogs, errorDescription } = useMemo(() => {
        const rawResponse = statusResponse as any;
        const resData = rawResponse?.data ?? rawResponse;

        const gatewayLogs = resData?.gatewayLogs ?? rawResponse?.gatewayLogs;
        const transResults: ITransLogResult[] =
            gatewayLogs?.translogresults ??
            resData?.translogresults ??
            rawResponse?.translogresults ??
            [];

        const razorpayLogs: any[] =
            resData?.razorpaytransactionlogs ??
            rawResponse?.razorpaytransactionlogs ??
            [];

        // Combine logs if needed
        let combined: ITransLogResult[] = [...transResults];

        if (combined.length === 0 && razorpayLogs.length > 0) {
            combined = razorpayLogs.map((rzp) => ({
                payment_id: rzp.payment_id ?? rzp.id,
                responsestatuslogs: rzp.status ?? 'captured',
                error_description: rzp.error_description ?? null,
                order_id: rzp.order_id,
                fyP_Date: rzp.created_at ?? rzp.fyP_Date,
                fmA_Amount: rzp.amount,
                fyP_PayModeType: rzp.method ?? 'ONLINE',
                fmoT_PayGatewayType: 'RAZORPAY'
            }));
        }

        const errDesc = combined.find((l) => l.error_description)?.error_description ?? null;

        return {
            transLogs: combined,
            errorDescription: errDesc
        };
    }, [statusResponse]);

    // Format date nicely (DD-MM-YYYY or DD-MM-YYYY HH:mm)
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return String(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return String(dateString);
        }
    };

    const isSuccessStatus = (status?: string | null) => {
        if (!status) return false;
        const s = status.toLowerCase();
        return s === 'captured' || s === 'true' || s === 'success' || s === 'paid' || s === 'settled';
    };

    const studentFullName = [rowData.amsT_FirstName, rowData.amsT_MiddleName, rowData.amsT_LastName]
        .filter(Boolean)
        .join(' ')
        .trim();

    return (
        <Portal>
            <div
                className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200'
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}>
                <div className='relative w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl border border-slate-200 transition-all'>
                    {/* Header Bar matching Image 2 */}
                    <div className='flex items-center justify-between border-b-2 border-orange-500 bg-white px-6 py-3.5'>
                        <div className='flex items-center gap-2.5'>
                            <CreditCard className='h-5 w-5 text-[#00509d]' />
                            <h3 className='font-bold text-lg tracking-wide text-[#00509d] uppercase'>
                                Online Payment Details
                            </h3>
                        </div>

                        <div className='flex items-center gap-1'>
                            <button
                                type='button'
                                onClick={() => refetch()}
                                title='Refresh Status'
                                className='rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'
                                disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                type='button'
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                title={isCollapsed ? 'Expand' : 'Collapse'}
                                className='rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'>
                                <Minus className='h-4 w-4' />
                            </button>
                            <button
                                type='button'
                                onClick={onClose}
                                title='Close'
                                className='rounded p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600'>
                                <X className='h-4 w-4' />
                            </button>
                        </div>
                    </div>

                    {!isCollapsed && (
                        <div className='p-6 space-y-5 max-h-[80vh] overflow-y-auto'>
                            {/* Transaction Info Summary Pill */}
                            <div className='flex flex-wrap items-center justify-between gap-3 rounded-md bg-slate-50 px-4 py-2.5 text-xs text-slate-600 border border-slate-200'>
                                <div>
                                    <span className='font-semibold text-slate-700'>Student:</span>{' '}
                                    <span className='font-medium text-slate-900'>{studentFullName || 'N/A'}</span>
                                    {rowData.amsT_AdmNo && (
                                        <span className='ml-2 text-slate-500'>({rowData.amsT_AdmNo})</span>
                                    )}
                                </div>
                                <div>
                                    <span className='font-semibold text-slate-700'>Receipt No:</span>{' '}
                                    <span className='font-mono font-medium text-slate-900'>
                                        {rowData.fyP_Receipt_No || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className='font-semibold text-slate-700'>Amount:</span>{' '}
                                    <span className='font-bold text-slate-900'>₹{rowData.fyP_Tot_Amount}</span>
                                </div>
                                <div>
                                    <span className='font-semibold text-slate-700'>Mode:</span>{' '}
                                    <span className='rounded bg-blue-100 px-2 py-0.5 font-semibold text-blue-700'>
                                        {rowData.fyP_Bank_Or_Cash === 'O'
                                            ? 'ONLINE'
                                            : rowData.fyP_Bank_Or_Cash === 'C'
                                              ? 'CASH'
                                              : rowData.fyP_Bank_Or_Cash || 'OTHER'}
                                    </span>
                                </div>
                            </div>

                            {/* Error description alert if present */}
                            {errorDescription && (
                                <div className='flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700'>
                                    <XCircle className='h-4 w-4 flex-shrink-0 text-red-600' />
                                    <span>{errorDescription}</span>
                                </div>
                            )}

                            {/* Main Content: Table or Loading or Empty */}
                            {isLoading ? (
                                <div className='flex flex-col items-center justify-center py-12 space-y-3'>
                                    <Loader2 className='h-8 w-8 animate-spin text-[#00509d]' />
                                    <p className='text-sm font-medium text-slate-600'>Loading payment details...</p>
                                </div>
                            ) : error ? (
                                <div className='rounded-md bg-red-50 p-6 text-center border border-red-200'>
                                    <p className='font-semibold text-red-700'>Failed to retrieve transaction status</p>
                                    <p className='mt-1 text-xs text-red-500'>{(error as any)?.message || 'Server error'}</p>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={() => refetch()}
                                        className='mt-3'>
                                        Try Again
                                    </Button>
                                </div>
                            ) : transLogs.length === 0 ? (
                                <div className='rounded-md border border-slate-200 bg-slate-50 p-8 text-center'>
                                    <p className='font-semibold text-slate-700'>No Online Payment Logs Found</p>
                                    <p className='mt-1 text-xs text-slate-500'>
                                        There are no gateway logs recorded for Receipt No. {rowData.fyP_Receipt_No || rowData.fyP_Id}.
                                    </p>
                                </div>
                            ) : (
                                <div className='overflow-x-auto rounded-md border border-slate-200 shadow-sm'>
                                    <table className='w-full border-collapse text-sm'>
                                        <thead>
                                            <tr className='bg-[#00509d] text-white'>
                                                <th className='border border-blue-900/40 px-4 py-3 text-center font-bold tracking-wide'>
                                                    Online Payment Status
                                                </th>
                                                <th className='border border-blue-900/40 px-4 py-3 text-center font-bold tracking-wide'>
                                                    Transaction ID
                                                </th>
                                                <th className='border border-blue-900/40 px-4 py-3 text-center font-bold tracking-wide'>
                                                    Payment Id
                                                </th>
                                                <th className='border border-blue-900/40 px-4 py-3 text-center font-bold tracking-wide'>
                                                    Online Payment Settled Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-slate-200 bg-white'>
                                            {transLogs.map((log, index) => {
                                                const status = log.responsestatuslogs ?? 'True';
                                                const success = isSuccessStatus(status);

                                                return (
                                                    <tr key={index} className='hover:bg-slate-50/80 transition-colors'>
                                                        {/* Status Column */}
                                                        <td className='border border-slate-200 px-4 py-3 text-center'>
                                                            <span
                                                                className={`inline-flex items-center gap-1.5 font-bold ${
                                                                    success ? 'text-[#008000]' : 'text-red-600'
                                                                }`}>
                                                                {success ? (
                                                                    <CheckCircle2 className='h-4 w-4' />
                                                                ) : (
                                                                    <XCircle className='h-4 w-4' />
                                                                )}
                                                                {status}
                                                            </span>
                                                        </td>

                                                        {/* Transaction ID / Order ID */}
                                                        <td className='border border-slate-200 px-4 py-3 text-center font-mono font-bold text-[#008000]'>
                                                            {log.order_id || 'N/A'}
                                                        </td>

                                                        {/* Payment Id */}
                                                        <td className='border border-slate-200 px-4 py-3 text-center font-mono font-bold text-[#008000]'>
                                                            {log.payment_id || 'N/A'}
                                                        </td>

                                                        {/* Settled Date */}
                                                        <td className='border border-slate-200 px-4 py-3 text-center font-bold text-[#008000]'>
                                                            {formatDate(log.fyP_Date)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Additional Gateway Metadata if present */}
                            {transLogs.length > 0 && transLogs[0].fmoT_PayGatewayType && (
                                <div className='flex flex-wrap gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100'>
                                    {transLogs[0].fmoT_PayGatewayType && (
                                        <div>
                                            Gateway:{' '}
                                            <span className='font-semibold text-slate-700'>
                                                {transLogs[0].fmoT_PayGatewayType}
                                            </span>
                                        </div>
                                    )}
                                    {transLogs[0].fyP_PayModeType && (
                                        <div>
                                            Pay Mode:{' '}
                                            <span className='font-semibold text-slate-700'>
                                                {transLogs[0].fyP_PayModeType}
                                            </span>
                                        </div>
                                    )}
                                    {transLogs[0].fmA_Amount && (
                                        <div>
                                            Amount:{' '}
                                            <span className='font-semibold text-slate-700'>
                                                ₹{transLogs[0].fmA_Amount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className='flex justify-end pt-3 border-t border-slate-200'>
                                <Button type='button' variant='outline' onClick={onClose} className='px-6'>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Portal>
    );
}
