'use client';

import { Button } from '@/components/ui/button';
import { updateApplicationPaymentStatus } from '@/server/admission/preadmission/transactions/application_form';
import { AlertCircle, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PaymentFailurePage() {
    const router = useRouter();
    const { id } = useParams();
    const [isProcessing, setIsProcessing] = useState(true);
    const [apiCallStatus, setApiCallStatus] = useState<'pending' | 'success' | 'error'>('pending');
    const [failureReason, setFailureReason] = useState('');
    const [transactionId, setTransactionId] = useState('');

    // Add this check right after all useState declarations
    if (!id) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <div className='text-center'>
                    <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin' />
                    <p className='text-muted-foreground'>Loading...</p>
                </div>
            </div>
        );
    }

    useEffect(() => {
        // Only run when id is available
        if (id) {
            handlePaymentCallback();
        }
    }, [id]);

    const handlePaymentCallback = async () => {
        try {
            // Get all payment response parameters from URL
            const transactionId = id?.toString();
            if (!transactionId) {
                console.log('Waiting for transaction ID...');
                return; // Exit early if ID not available yet
            }

            setTransactionId(transactionId || 'N/A');
            setFailureReason('Payment was not completed');

            const response = await updateApplicationPaymentStatus('failed', transactionId);
            if (response.success) {
                setApiCallStatus('success');
                toast.success('Payment completed successfully!');
                // Redirect to appropriate page after 3 seconds
                setTimeout(() => {
                    setTimeout(() => {
                        router.push('/admission/preadmission/transactions/application-form');
                    }, 3000);
                }, 3000);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Payment failure logging error:', error);
            setApiCallStatus('error');
            toast.error('Failed to record payment status');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetry = () => {
        router.push('/admission/preadmission/transactions/application-form');
    };

    const handleGoBack = () => {
        router.push('/admission/preadmission/transactions/application-form');
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-gray-900 dark:to-gray-800'>
            <div className='w-full max-w-md'>
                <div className='rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800'>
                    {isProcessing ? (
                        <div className='flex flex-col items-center gap-6'>
                            <div className='relative'>
                                <div className='absolute inset-0 animate-ping rounded-full bg-orange-500/20' />
                                <div className='relative rounded-full bg-orange-100 p-6 dark:bg-orange-900/30'>
                                    <Loader2 className='h-12 w-12 animate-spin text-orange-600 dark:text-orange-400' />
                                </div>
                            </div>
                            <div className='text-center'>
                                <h2 className='mb-2 font-bold text-2xl text-gray-900 dark:text-white'>Processing Response</h2>
                                <p className='text-gray-600 dark:text-gray-400'>Please wait while we record your payment status...</p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center gap-6'>
                            <div className='relative'>
                                <div className='absolute inset-0 animate-pulse rounded-full bg-red-500/20' />
                                <div className='relative rounded-full bg-red-100 p-6 dark:bg-red-900/30'>
                                    <XCircle className='h-16 w-16 text-red-600 dark:text-red-400' />
                                </div>
                            </div>
                            <div className='text-center'>
                                <h2 className='mb-2 font-bold text-2xl text-gray-900 dark:text-white'>Payment Failed</h2>
                                <p className='mb-4 text-gray-600 dark:text-gray-400'>Your payment could not be processed.</p>
                            </div>

                            {/* Failure Details */}
                            <div className='w-full space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/10'>
                                <div className='flex items-start gap-3'>
                                    <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400' />
                                    <div className='flex-1'>
                                        <h3 className='mb-1 font-medium text-red-900 text-sm dark:text-red-100'>Reason</h3>
                                        <p className='text-red-700 text-sm dark:text-red-300'>{failureReason}</p>
                                    </div>
                                </div>
                                {transactionId !== 'N/A' && (
                                    <div className='border-red-200 border-t pt-2 dark:border-red-900'>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-red-700 dark:text-red-300'>Transaction ID</span>
                                            <span className='font-mono text-red-900 text-xs dark:text-red-100'>{transactionId}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Common Failure Reasons */}
                            <div className='w-full rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50'>
                                <h3 className='mb-3 font-medium text-gray-900 text-sm dark:text-white'>
                                    Common reasons for payment failure:
                                </h3>
                                <ul className='space-y-2 text-gray-600 text-sm dark:text-gray-400'>
                                    <li className='flex items-start gap-2'>
                                        <span className='mt-1 text-gray-400'>•</span>
                                        <span>Insufficient funds in your account</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='mt-1 text-gray-400'>•</span>
                                        <span>Incorrect card details or OTP</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='mt-1 text-gray-400'>•</span>
                                        <span>Payment limit exceeded</span>
                                    </li>
                                    <li className='flex items-start gap-2'>
                                        <span className='mt-1 text-gray-400'>•</span>
                                        <span>Network or technical issues</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex w-full flex-col gap-3 pt-2 sm:flex-row'>
                                <Button
                                    type='button'
                                    onClick={handleGoBack}
                                    className='flex-1 rounded-lg border border-input bg-background px-6 py-3 font-medium transition-colors hover:bg-accent'>
                                    Go Back
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleRetry}
                                    className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90'>
                                    <RefreshCw className='h-4 w-4' />
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                {/* {!isProcessing && (
                    <div className='mt-6 text-center'>
                        <p className='text-gray-600 dark:text-gray-400 text-sm'>
                            Need help? Contact{' '}
                            <a href='mailto:support@example.com' className='text-primary hover:underline'>
                                support@example.com
                            </a>
                        </p>
                    </div>
                )} */}
            </div>
        </div>
    );
}
