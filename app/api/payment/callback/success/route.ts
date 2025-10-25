import { updateApplicationPaymentStatus } from '@/server/admission/preadmission/transactions/application_form';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('📥 Received POST from Easebuzz success callback');

        const url = new URL(request.url);
        const transactionId = url.searchParams.get('transaction_id') || url.searchParams.get('txnid');

        if (!transactionId) {
            console.error('❌ No transaction ID found in callback');
            return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
        }

        console.log('💳 Processing payment immediately for:', transactionId);

        // ✅ CRITICAL: Process payment HERE before redirecting
        const paymentResult = await updateApplicationPaymentStatus('success', transactionId);

        console.log('✅ Payment processing result:', paymentResult);

        // ✅ Now redirect to display page
        const redirectUrl = new URL(`/admission/preadmission/transactions/application-form/payment/success/${transactionId}`, request.url);

        // Add a flag to indicate payment was already processed
        redirectUrl.searchParams.set('processed', 'true');

        console.log('🔄 Redirecting to success page');

        return NextResponse.redirect(redirectUrl, { status: 303 });
    } catch (error) {
        console.error('❌ Payment success callback error:', error);
        return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transaction_id') || url.searchParams.get('txnid');

    if (transactionId) {
        return NextResponse.redirect(
            new URL(`/admission/preadmission/transactions/application-form/payment/success/${transactionId}?processed=true`, request.url)
        );
    }

    return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
}
