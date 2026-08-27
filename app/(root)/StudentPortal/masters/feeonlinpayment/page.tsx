<<<<<<< HEAD
'use client';

=======
>>>>>>> 169c9268696c79cf4a7f2f9b39f095ba2da9169e
import FeeOnlinePaymentClient from './_components/fee-online-payment-client';
import { getFeeOnlinePaymentLoadData } from './actions';

export default async function FeeOnlinePaymentPage() {
    return (
        <div className='container mx-auto max-w-7xl p-4'>
<<<<<<< HEAD
            <FeeOnlinePaymentClient />
=======
            <FeeOnlinePaymentClient initialData={response.data} />
>>>>>>> 169c9268696c79cf4a7f2f9b39f095ba2da9169e
        </div>
    );
}
