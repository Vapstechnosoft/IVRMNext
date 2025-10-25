import { updateApplicationPaymentStatus } from '@/server/admission/preadmission/transactions/application_form';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('📥 Received POST from Easebuzz failure callback');

        const url = new URL(request.url);
        const transactionId = url.searchParams.get('transaction_id') || url.searchParams.get('txnid');

        if (!transactionId) {
            console.error('❌ No transaction ID found in callback');
            return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
        }

        console.log('💳 Processing failed payment immediately for:', transactionId);

        // ✅ Process payment HERE before redirecting
        const paymentResult = await updateApplicationPaymentStatus('failed', transactionId);

        console.log('✅ Payment failure processing result:', paymentResult);

        // ✅ Now redirect to display page
        const redirectUrl = new URL(`/admission/preadmission/transactions/application-form/payment/failure/${transactionId}`, request.url);

        redirectUrl.searchParams.set('processed', 'true');

        console.log('🔄 Redirecting to failure page');

        return NextResponse.redirect(redirectUrl, { status: 303 });
    } catch (error) {
        console.error('❌ Payment failure callback error:', error);
        return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
    }
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transaction_id') || url.searchParams.get('txnid');

    if (transactionId) {
        return NextResponse.redirect(
            new URL(`/admission/preadmission/transactions/application-form/payment/failure/${transactionId}?processed=true`, request.url)
        );
    }

    return NextResponse.redirect(new URL('/admission/preadmission/transactions/application-form', request.url));
}
