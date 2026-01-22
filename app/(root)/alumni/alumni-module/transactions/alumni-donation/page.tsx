'use client';

import DonationForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-donation/_components/donation-form';
import { Card, CardContent } from '@/components/ui/card';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IAlumniDonationDetails, IDonationCategory, IPaymentGateway, IPaymentGatewayDetails } from '@/types/alumni/alumni-donation';
import { Calendar, Hash, Loader2, Mail, MapPin, Phone, User } from 'lucide-react';
import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Static alumni details
const staticAlumniDetails: IAlumniDonationDetails = {
    almsT_FirstName: 'John',
    almsT_LastName: 'Doe',
    almsT_RegistrationNo: 'ALM2024001',
    almsT_AdmNo: 'ADM2018015',
    almsT_MobileNo: '+91 9876543210',
    almsT_emailId: 'john.doe@example.com',
    almsT_StudentPhoto: '/images/alumni/john-doe.jpg',
    almsT_Id: 101,
    alsreG_Id: 201,
    leftyear: '2020',
    classleft: 'B.Tech Computer Science',
    almsT_ConStreet: '123 Tech Park',
    almsT_ConArea: 'Silicon Valley',
    almsT_ConCity: 'Bangalore',
    almsT_District: 'Bangalore Urban',
    ivrmmS_Name: 'Karnataka',
    ivrmmC_CountryName: 'India',
    almsT_ConPincode: '560001',
    almsT_StudentPANCard: 'ABCDE1234F',
    almsT_FatherName: 'Robert Doe'
};

// Static donation categories
const staticCategories: IDonationCategory[] = [
    {
        almdoN_Id: 1,
        almdoN_DonationName: 'Infrastructure Development',
        almdoN_Amount: 5000,
        almdoN_RegistrationFeeFlag: false
    },
    {
        almdoN_Id: 2,
        almdoN_DonationName: 'Scholarship Fund',
        almdoN_Amount: 3000,
        almdoN_RegistrationFeeFlag: false
    },
    {
        almdoN_Id: 3,
        almdoN_DonationName: 'Library Enhancement',
        almdoN_Amount: 2000,
        almdoN_RegistrationFeeFlag: false
    },
    {
        almdoN_Id: 4,
        almdoN_DonationName: 'Sports Equipment',
        almdoN_Amount: 1500,
        almdoN_RegistrationFeeFlag: false
    },
    {
        almdoN_Id: 5,
        almdoN_DonationName: 'Alumni Association Membership',
        almdoN_Amount: 1000,
        almdoN_RegistrationFeeFlag: true
    }
];

// Static payment gateways
const staticGateways: IPaymentGateway[] = [
    {
        fpgD_Id: 1,
        fpgD_PGName: 'Razorpay',
        fpgD_Image: '/images/payment/razorpay.svg'
    },
    {
        fpgD_Id: 2,
        fpgD_PGName: 'PayPal',
        fpgD_Image: '/images/payment/paypal.svg'
    },
    {
        fpgD_Id: 3,
        fpgD_PGName: 'Stripe',
        fpgD_Image: '/images/payment/stripe.svg'
    }
];

// Static payment gateway details
const staticPaymentDetails: IPaymentGatewayDetails = {
    paymentgateway: [
        {
            fpgD_SaltKey: 'rzp_test_YOUR_KEY_HERE',
            fpgD_AuthorisationKey: 'YOUR_AUTH_KEY'
        }
    ],
    orderId: `order_${Date.now()}`,
    institution: [
        {
            mI_Name: 'University of Technology',
            mI_PAN: 'ABCDE1234F',
            mI_Logo: '/images/institution/logo.png'
        }
    ]
};

// Mock API functions
const mockGetAlumniDonationLoadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        data: {
            almdetails: [staticAlumniDetails],
            fillalumnidonationdetails: staticCategories,
            fillpaymentgateway: staticGateways,
            imagenew: staticAlumniDetails.almsT_StudentPhoto
        }
    };
};

const mockGetPaymentDetails = async ({ mI_Id, fpgD_PGName }: { mI_Id: number; fpgD_PGName: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        success: true,
        data: staticPaymentDetails
    };
};

const mockSaveDonationPayment = async (payload: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log('Saved payment:', payload);
    return {
        success: true,
        message: 'Payment saved successfully',
        data: {
            receiptNo: `REC${Date.now()}`,
            transactionId: `TXN${Date.now()}`
        }
    };
};

export default function AlumniDonationPage() {
    const [details, setDetails] = useState<IAlumniDonationDetails | null>(null);
    const [categories, setCategories] = useState<IDonationCategory[]>([]);
    const [gateways, setGateways] = useState<IPaymentGateway[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaying, setIsPaying] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetAlumniDonationLoadData();
            if (res.success && res.data) {
                setDetails(res.data.almdetails?.[0] || null);
                setCategories(res.data.fillalumnidonationdetails || []);
                setGateways(res.data.fillpaymentgateway || []);
            }
        } catch (error) {
            toast.error('Failed to load donation data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handlePayment = async (values: any) => {
        if (!details) return;
        setIsPaying(true);
        try {
            const payRes = await mockGetPaymentDetails({
                mI_Id: 0,
                fpgD_PGName: values.paymentGateway
            });

            if (payRes.success && payRes.data) {
                const pgData = payRes.data;

                // For demo purposes, simulate payment without actual Razorpay
                toast.success('Payment simulation successful! In a real app, this would open Razorpay.');

                // Simulate payment callback
                const mockResponse = {
                    razorpay_payment_id: `pay_${Date.now()}`,
                    razorpay_order_id: pgData.orderId,
                    razorpay_signature: 'demo_signature'
                };

                const saveRes = await mockSaveDonationPayment({
                    ALMDON_Id: Number(values.donationId),
                    ALSREG_Id: details.alsreG_Id,
                    ALMST_Id: details.almsT_Id,
                    ALDON_DonorName: details.almsT_FirstName,
                    ALDON_Amount: values.amount,
                    ALDON_Date: new Date().toISOString(),
                    ReceiptNo: mockResponse.razorpay_payment_id,
                    ALMST_StudentPANCard: values.panNumber || details.almsT_StudentPANCard,
                    ALDON_NRIFlg: values.nriStatus === '1',
                    ALDON_Towards:
                        categories.find((c) => c.almdoN_Id === Number(values.donationId))?.almdoN_DonationName || 'Alumni Donation',
                    userid: 1,
                    MI_Id: 1,
                    ASMAY_Id: 1,
                    transnumbconfigurationsettingsss: {
                        IMN_AutoManualFlag: 'Auto',
                        IMN_PrefixAcadYearCode: true,
                        IMN_PrefixParticular: 'DON',
                        IMN_SuffixAcadYearCode: true,
                        IMN_SuffixParticular: '',
                        IMN_StartingNo: '1',
                        IMN_WidthNumeric: '5',
                        IMN_ZeroPrefixFlag: 'Yes'
                    }
                });

                if (saveRes.success) {
                    toast.success('Payment processed successfully!');
                    loadData();
                } else {
                    toast.error(saveRes.message || 'Failed to save payment details');
                }
            } else {
                toast.error('Failed to initialize payment');
            }
        } catch (error) {
            toast.error('Payment initialization failed');
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <Script src='https://checkout.razorpay.com/v1/checkout.js' strategy='lazyOnload' />

            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Alumni Donation</h2>
                <div className='text-muted-foreground text-sm'>
                    <span className='inline-flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-1'>
                    <CollapsibleSection title='Alumni Information' defaultOpen={true} variant='default'>
                        {details && (
                            <Card className='border-none bg-muted/30 shadow-none'>
                                <CardContent className='space-y-4 p-4'>
                                    <div className='flex flex-col items-center gap-3 border-b pb-4'>
                                        <div className='h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-background'>
                                            <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20'>
                                                <User className='h-10 w-10 text-primary' />
                                            </div>
                                        </div>
                                        <div className='text-center'>
                                            <h3 className='font-bold text-lg'>
                                                {details.almsT_FirstName} {details.almsT_LastName}
                                            </h3>
                                            <p className='text-muted-foreground text-xs uppercase tracking-widest'>
                                                {details.leftyear} Batch
                                            </p>
                                            <p className='mt-1 text-muted-foreground text-sm'>{details.classleft}</p>
                                        </div>
                                    </div>

                                    <div className='space-y-3 pt-2'>
                                        <InfoItem icon={<Hash className='h-4 w-4' />} label='Reg No' value={details.almsT_RegistrationNo} />
                                        <InfoItem icon={<Hash className='h-4 w-4' />} label='Admission No' value={details.almsT_AdmNo} />
                                        <InfoItem icon={<Mail className='h-4 w-4' />} label='Email' value={details.almsT_emailId} />
                                        <InfoItem icon={<Phone className='h-4 w-4' />} label='Mobile' value={details.almsT_MobileNo} />
                                        <InfoItem
                                            icon={<MapPin className='h-4 w-4' />}
                                            label='Address'
                                            value={`${details.almsT_ConStreet}, ${details.almsT_ConCity}, ${details.almsT_District} - ${details.almsT_ConPincode}`}
                                        />
                                        <InfoItem
                                            icon={<User className='h-4 w-4' />}
                                            label="Father's Name"
                                            value={details.almsT_FatherName}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </CollapsibleSection>
                </div>

                <div className='space-y-6 lg:col-span-2'>
                    <CollapsibleSection title='Contribute Now' defaultOpen={true} variant='outline'>
                        <DonationForm categories={categories} gateways={gateways} isPaying={isPaying} onSubmit={handlePayment} />
                    </CollapsibleSection>

                    <div className='rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6'>
                        <h3 className='mb-3 font-bold text-green-800 text-lg'>Why Donate?</h3>
                        <ul className='space-y-2 text-green-700 text-sm'>
                            <li className='flex items-start gap-2'>
                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600'></div>
                                <span>Support infrastructure development for future students</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600'></div>
                                <span>Contribute to scholarship programs for deserving students</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600'></div>
                                <span>Help enhance library resources and digital access</span>
                            </li>
                            <li className='flex items-start gap-2'>
                                {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                <div className='mt-1.5 h-1.5 w-1.5 rounded-full bg-green-600'></div>
                                <span>All donations are eligible for tax exemption under Section 80G</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className='flex items-start gap-3 text-sm'>
            <div className='mt-0.5 text-primary'>{icon}</div>
            <div className='flex-1'>
                <p className='mb-1 font-bold text-[10px] text-muted-foreground uppercase leading-none'>{label}</p>
                <p className='font-medium text-foreground'>{value || 'N/A'}</p>
            </div>
        </div>
    );
}
