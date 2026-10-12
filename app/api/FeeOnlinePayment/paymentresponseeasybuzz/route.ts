import { api } from '@/lib/apiService';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let status = 'success';
    let txnid = '';
    let amount = '';
    let receiptno = '';
    let message = '';
    let easepayid = '';
    let rawData: Record<string, any> = {};

    try {
        const formData = await request.formData();
        rawData = Object.fromEntries(formData.entries());
        status = (formData.get('status') as string) || (formData.get('payment_status') as string) || 'success';
        txnid = (formData.get('txnid') as string) || (formData.get('transaction_id') as string) || '';
        amount = (formData.get('amount') as string) || '';
        receiptno = (formData.get('receiptno') as string) || (formData.get('fyP_Receipt_No') as string) || '';
        message = (formData.get('error_Message') as string) || (formData.get('msg') as string) || '';
        easepayid = (formData.get('easepayid') as string) || '';
    } catch {
        const url = new URL(request.url);
        status = url.searchParams.get('status') || 'success';
        txnid = url.searchParams.get('txnid') || '';
        amount = url.searchParams.get('amount') || '';
        receiptno = url.searchParams.get('receiptno') || '';
        message = url.searchParams.get('msg') || url.searchParams.get('message') || '';
    }

    // Attempt to notify backend fees API of payment response
    if (Object.keys(rawData).length > 0) {
        try {
            await api.post('fees', '/FeeOnlinePaymentFacade/paymentresponseeasybuzz', rawData);
        } catch (_err) {
            try {
                await api.post('fees', '/FeeOnlinePayment/paymentresponseeasybuzz', rawData);
            } catch {
                // Ignore backend call failure, continue redirect
            }
        }
    }

    const queryParams = new URLSearchParams({
        status,
        ...(txnid ? { txnid } : {}),
        ...(amount ? { amount } : {}),
        ...(receiptno ? { receiptno } : {}),
        ...(message ? { message } : {}),
        ...(easepayid ? { easepayid } : {})
    });

    const targetUrl = `/StudentPortal/masters/feeonlinpayment?${queryParams.toString()}`;

    // Return HTML page with immediate JavaScript redirect
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Fee Payment...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc;">
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="margin: 0 0 0.5rem; color: #1e293b;">Redirecting...</h2>
        <p style="margin: 0; color: #64748b;">Please wait while we redirect you back to the fee payment screen.</p>
    </div>
    <script>
        window.location.href = '${targetUrl}';
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const targetUrl = `/StudentPortal/masters/feeonlinpayment${url.search}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Redirecting to Fee Payment...</title>
</head>
<body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #f8fafc;">
    <script>
        window.location.href = '${targetUrl}';
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        status: 200,
        headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
    });
}
