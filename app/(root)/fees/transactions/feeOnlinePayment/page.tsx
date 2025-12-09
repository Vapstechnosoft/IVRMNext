'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { useFeeTransactionList, useopeningacademicyerdropdowndatafee } from '@/hooks/fees/useTrasactions';
import type { Ifeetransaction } from '@/types/fees/transactions/transactions';
import { use, useState } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FeeOnlinePaymentPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [showChargesPopup, setShowChargesPopup] = useState(false);

    const { data: academicYearData, isLoading: loadingYears } = useopeningacademicyerdropdowndatafee();
    const { data: response } = useFeeTransactionList(selectedAsmayId ?? 0, searchParams);

    return (
        <FormProvider<Ifeetransaction>>
            <FeeTransactionContent
                selectedAsmayId={selectedAsmayId}
                setSelectedAsmayId={setSelectedAsmayId}
                academicYearData={academicYearData}
                loadingYears={loadingYears}
                showChargesPopup={showChargesPopup}
                setShowChargesPopup={setShowChargesPopup}
            />
        </FormProvider>
    );
}

function FeeTransactionContent({
    selectedAsmayId,
    setSelectedAsmayId,
    academicYearData,
    loadingYears,
    showChargesPopup,
    setShowChargesPopup
}: {
    selectedAsmayId: number | null;
    setSelectedAsmayId: (id: number | null) => void;
    loadingYears: boolean;
    academicYearData: any;
    showChargesPopup: boolean;
    setShowChargesPopup: (show: boolean) => void;
}) {
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-3'>
                <CollapsibleSection defaultOpen variant='outline' size='lg' className='shadow-lg'>
                    <FeeOnlinePaymentUI openChargesPopup={() => setShowChargesPopup(true)} />
                </CollapsibleSection>

                {showChargesPopup && <PaymentChargesPopup onClose={() => setShowChargesPopup(false)} />}
            </div>
        </div>
    );
}

function PaymentChargesPopup({ onClose }: { onClose: () => void }) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
            <div className='max-h-[90vh] w-[420px] space-y-4 overflow-y-auto rounded border bg-white p-4 shadow-lg'>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h2 className='font-bold text-blue-900'>PAYMENT GATE WAY CHARGES</h2>
                    <Button className='bg-gray-300 px-3 text-black hover:bg-gray-400' onClick={onClose}>
                        Close
                    </Button>
                </div>

                <div className='space-y-4 text-sm'>
                    {/* PAYU */}
                    <div>
                        <h3 className='font-bold text-lg'>1) PAYU</h3>
                        <ul className='mt-2 ml-2 space-y-1'>
                            <li>* Net Banking : ₹ 7.39</li>
                            <li>* Credit Card : 1.4671%</li>
                            <li>* Debit Card : 1.07% &lt; ₹2000 , 1.18421% &gt; ₹2000</li>
                        </ul>
                        <hr className='my-3' />
                    </div>

                    {/* Razorpay */}
                    <div>
                        <h3 className='font-bold text-lg'>2) RAZORPAY</h3>
                        <ul className='mt-2 ml-2 space-y-1'>
                            <li>* Credit Card Domestic – 0.90%</li>
                            <li>* Debit Card – 0% &lt; ₹2000, 0.80% &gt; ₹2000</li>
                            <li>* Net Banking – ₹7</li>
                            <li>* Wallets – 1.68%</li>
                            <li>* EMI – 1.1%</li>
                            <li>* UPI – ₹12</li>
                        </ul>
                        <hr className='my-3' />
                    </div>

                    {/* Paytm */}
                    <div>
                        <h3 className='font-bold text-lg'>3) PAYTM CHARGES</h3>
                        <ul className='mt-2 ml-2 space-y-1'>
                            <li>* Credit Card – 1.1%</li>
                            <li>* Debit Card – 0% &lt; ₹2000, 0.80% &gt; ₹2000</li>
                            <li>* Net Banking – ₹10</li>
                            <li>* Wallet – 1.5%</li>
                            <li>* Postpaid – 1.06%</li>
                            <li>* UPI – 0% &lt; ₹2000 , 1.6% &gt; ₹2000</li>
                        </ul>
                    </div>

                    <p className='mt-4 font-semibold text-red-600'>NOTE: GST APPLICABLE AS PER GOVERNMENT OF INDIA GUIDELINES</p>
                </div>
            </div>
        </div>
    );
}

function FeeOnlinePaymentUI({ openChargesPopup }: { openChargesPopup: () => void }) {
    return (
        <div className='space-y-4 rounded-md border bg-white p-4 shadow-md'>
            {/* Notice */}
            <div className='rounded border border-green-300 bg-green-100 p-2 text-center text-green-700 text-sm'>
                If Amount is deducted from actual account and receipt is not generated Kindly wait for 12 hours.
            </div>

            {/* LEFT = Fee Structure | RIGHT = Payment Charges */}
            <div className='flex items-center justify-between'>
                <Button className='bg-green-600 px-4 py-2 text-white hover:bg-green-700'>View Fee Structure</Button>

                <Button className='bg-blue-600 px-4 py-2 text-white hover:bg-blue-700' onClick={openChargesPopup}>
                    View Payment Gateway Charges
                </Button>
            </div>

            {/* Two-column layout */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                {/* Student Info */}
                <div className='rounded-md border shadow-sm'>
                    <div className='bg-blue-900 px-3 py-2 font-semibold text-sm text-white'>Student Information</div>

                    <div className='space-y-2 p-4 text-sm'>
                        <InfoRow label='Name' value='PARINITH ARYA N' />
                        <InfoRow label='Class/Section/Roll No' value='Nursery / A / 15' />
                        <InfoRow label='Adm No' value='108/2025-26' />
                        <InfoRow label='Reg No' value='108/2025-26' />
                        <InfoRow label='Mobile No' value='0' />
                        <InfoRow label='Email-Id' value='' />
                    </div>
                </div>

                {/* Group List */}
                <div className='rounded-md border shadow-sm'>
                    <div className='bg-blue-900 px-3 py-2 font-semibold text-sm text-white'>Group List</div>

                    <div className='space-y-3 p-4 text-sm'>
                        <div className='flex items-center gap-2'>
                            <Checkbox /> <span>School Fees</span>
                        </div>

                        <div className='flex items-center gap-2'>
                            <Checkbox /> <span>Other and Books Fees</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amount Fields */}
            <div className='mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <InputField label='Current Year Charges' value='42900' />
                <InputField label='Current Year Paid' value='20000' />
                <InputField label='Current Year Outstanding' value='22900' />
                <InputField label='Current Year Concession' value='0' />
            </div>

            {/* Bottom Buttons */}
            <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <Button className='w-full bg-blue-700 py-2 text-white shadow-md hover:bg-blue-800'>SHOW</Button>
                <Button className='w-full bg-orange-500 py-2 text-white shadow-md hover:bg-orange-600'>CANCEL</Button>
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className='flex text-sm'>
            <span className='w-44 font-semibold'>{label}</span>
            <span>: {value}</span>
        </div>
    );
}

function InputField({ label, value }: { label: string; value: string }) {
    return (
        <div className='space-y-1'>
            <Label className='text-sm'>{label}</Label>
            <Input defaultValue={value} className='h-9 text-sm' />
        </div>
    );
}
