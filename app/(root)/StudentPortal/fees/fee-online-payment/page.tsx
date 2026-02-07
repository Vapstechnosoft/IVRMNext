import { getFeeOnlinePaymentLoadData } from './actions';
import FeeOnlinePaymentClient from './_components/fee-online-payment-client';

export default async function FeeOnlinePaymentPage() {
    const response = await getFeeOnlinePaymentLoadData({
        configset: 'G'
    });

    return (
        <div className="container mx-auto p-6 space-y-6">
            <FeeOnlinePaymentClient initialData={response.data} />
        </div>
    );
}
