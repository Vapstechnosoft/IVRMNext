import FeeOnlinePaymentClient from './_components/fee-online-payment-client';
import { getFeeOnlinePaymentLoadData } from './actions';

export default async function FeeOnlinePaymentPage() {
    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <FeeOnlinePaymentClient />
        </div>
    );
}
