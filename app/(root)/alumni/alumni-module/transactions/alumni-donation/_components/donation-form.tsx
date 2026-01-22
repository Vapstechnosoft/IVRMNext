'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IDonationCategory, IPaymentGateway } from '@/types/alumni/alumni-donation';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, IndianRupee, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type AlumniDonationSchema, alumniDonationSchema } from './schema';

interface DonationFormProps {
    categories: IDonationCategory[];
    gateways: IPaymentGateway[];
    isPaying: boolean;
    onSubmit: (values: AlumniDonationSchema) => void;
}

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

// Mock API function
const mockGetDonationAmount = async ({ mI_Id, almdoN_Id }: { mI_Id: number; almdoN_Id: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
    const category = staticCategories.find((cat) => cat.almdoN_Id === almdoN_Id);
    return {
        success: true,
        data: {
            getamountlist: [
                {
                    almdoN_Amount: category?.almdoN_Amount || 0
                }
            ]
        }
    };
};

export default function DonationForm({ categories = staticCategories, gateways = staticGateways, isPaying, onSubmit }: DonationFormProps) {
    const [fetchingAmount, setFetchingAmount] = useState(false);
    const [fixedAmount, setFixedAmount] = useState<number | null>(null);

    const form = useForm<AlumniDonationSchema>({
        resolver: zodResolver(alumniDonationSchema),
        defaultValues: {
            nriStatus: '0',
            panNumber: '',
            donationId: '',
            amount: 0,
            paymentGateway: gateways.length === 1 ? gateways[0].fpgD_PGName : ''
        }
    });

    const {
        control,
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = form;
    const nriStatus = watch('nriStatus');
    const selectedDonationId = watch('donationId');

    useEffect(() => {
        if (selectedDonationId) {
            const fetchAmount = async () => {
                setFetchingAmount(true);
                try {
                    const res = await mockGetDonationAmount({ mI_Id: 0, almdoN_Id: Number(selectedDonationId) });
                    if (res.success && res.data?.getamountlist?.length > 0) {
                        const amt = res.data.getamountlist[0].almdoN_Amount;
                        setValue('amount', amt);
                        setFixedAmount(amt);
                    }
                } catch (error) {
                    // silent fail
                } finally {
                    setFetchingAmount(false);
                }
            };
            fetchAmount();
        }
    }, [selectedDonationId, setValue]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50/30 p-4'>
                    <Label className='font-bold text-orange-900'>
                        Are you an NRI? <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='nriStatus'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='1' id='nri-yes' className='border-orange-400 text-orange-600' />
                                    <Label htmlFor='nri-yes' className='cursor-pointer font-medium'>
                                        Yes, I am an NRI
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='0' id='nri-no' className='border-orange-400 text-orange-600' />
                                    <Label htmlFor='nri-no' className='cursor-pointer font-medium'>
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>Pan Number {nriStatus === '0' && <span className='text-red-500'>*</span>}</Label>
                    <InputText placeholder='Enter PAN Number' {...register('panNumber')} error={errors.panNumber?.message} />
                    <p className='text-[10px] text-muted-foreground italic'>Required for tax exemption certificate (if applicable)</p>
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>
                        Donation To <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='donationId'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className='h-12'>
                                    <SelectValue placeholder='Select Donation Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.almdoN_Id} value={String(cat.almdoN_Id)}>
                                            {cat.almdoN_DonationName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.donationId && <FormError>{errors.donationId.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>
                        Total Payable (INR) <span className='text-red-500'>*</span>
                    </Label>
                    <div className='relative'>
                        <IndianRupee className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground' />
                        <InputText
                            type='number'
                            className='h-12 pl-9 font-bold text-lg text-primary'
                            placeholder='0.00'
                            {...register('amount')}
                            error={errors.amount?.message}
                            readOnly={fixedAmount !== null && fixedAmount > 0}
                        />
                    </div>
                </div>
            </div>

            <div className='pt-4'>
                <Label className='mb-4 block text-center font-bold text-lg'>Select Payment Gateway</Label>
                <Controller
                    name='paymentGateway'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
                            {gateways.map((gw) => (
                                <div key={gw.fpgD_Id} className='relative'>
                                    <RadioGroupItem value={gw.fpgD_PGName} id={`gw-${gw.fpgD_Id}`} className='peer sr-only' />
                                    <Label
                                        htmlFor={`gw-${gw.fpgD_Id}`}
                                        className='flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-4 transition-all hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'>
                                        {gw.fpgD_Image ? (
                                            <img
                                                src={gw.fpgD_Image}
                                                alt={gw.fpgD_PGName}
                                                className='mb-2 h-10 w-auto grayscale peer-data-[state=checked]:grayscale-0'
                                            />
                                        ) : (
                                            <CreditCard className='mb-2 h-8 w-8' />
                                        )}
                                        <span className='font-bold text-xs uppercase tracking-widest'>{gw.fpgD_PGName}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}
                />
                {errors.paymentGateway && <FormError className='mt-2 text-center'>{errors.paymentGateway.message}</FormError>}
            </div>

            <div className='flex justify-center border-t pt-8'>
                <Button
                    type='submit'
                    size='lg'
                    disabled={isPaying || fetchingAmount}
                    className='h-14 min-w-[300px] text-xl shadow-lg ring-offset-4 ring-offset-background hover:ring-2 hover:ring-primary'>
                    {isPaying ? <Loader2 className='mr-3 h-6 w-6 animate-spin' /> : <CreditCard className='mr-3 h-6 w-6' />}
                    CLICK HERE TO PAY NOW
                </Button>
            </div>

            <p className='pb-4 text-center text-muted-foreground text-xs'>Secure payment powered by encrypted gateway processing.</p>
        </form>
    );
}
