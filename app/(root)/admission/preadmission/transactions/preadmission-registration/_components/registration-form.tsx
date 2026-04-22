'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError } from '@/components/ui/extension/field';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import { InputText } from '@/components/ui/extension/input-text';
import { preadmissionRegistrationSchema } from '@/schemas/admission/preadmission/transactions';
import { addPreadmissionRegistration } from '@/server/admission/preadmission/configuration/configuration';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof preadmissionRegistrationSchema.add>;

interface AddPreadmissionRegistrationFormProps {
    sub_domain: string;
    closeDialog: () => void;
}

export default function AddPreadmissionRegistrationForm({ sub_domain, closeDialog }: AddPreadmissionRegistrationFormProps) {
    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(preadmissionRegistrationSchema.add),
        mode: 'onChange'
    });

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        const { mobileno, ...filteredData } = data;
        const payload = {
            sub_domain: sub_domain,
            ...filteredData,
            mobileno: mobileno.toString()
        };

        try {
            const response = await addPreadmissionRegistration(payload);

            if (response.success) {
                toast.success(response.message);
                reset();
                closeDialog();
            } else {
                toast.error(response.message);
                return;
            }
        } catch (error: any) {
            toast.error(error.message);
            return;
        }

        // Auto-login after successful registration (outside try-catch)
        await login({
            values: {
                email: data.username,
                password: data.password
            },
            callbackUrl: '/'
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <AdaptiveBody className='flex flex-col gap-5'>
                <InputText
                    label='Name'
                    required
                    id='name'
                    {...register('name')}
                    error={errors.name?.message}
                    requiredTooltip="Name is mandatory. Please fill it."
                />
                <InputText
                    label='Email'
                    required
                    id='email'
                    {...register('email_id')}
                    error={errors.email_id?.message}
                    requiredTooltip="Email is mandatory. Please fill it."
                />
                <div className='group flex flex-col gap-1.5'>
                    <Controller
                        name='mobileno'
                        control={control}
                        render={({ field }) => (
                            <MobileNumberInput
                                label='Mobile No.'
                                required
                                id='mobileno'
                                value={field.value}
                                onChange={(value) => field.onChange(value)}
                                type='number'
                                showSpinner={false}
                                requiredTooltip="Mobile No. is mandatory. Please fill it."
                            />
                        )}
                    />
                    {errors.mobileno && <FormError>{errors.mobileno.message}</FormError>}
                </div>
                <InputText
                    label='Username'
                    required
                    id='username'
                    {...register('username')}
                    error={errors.username?.message}
                    requiredTooltip="Username is mandatory. Please fill it."
                />
                <InputText
                    label='Password'
                    required
                    id='password'
                    {...register('password')}
                    error={errors.password?.message}
                    requiredTooltip="Password is mandatory. Please fill it."
                />

                <FormError>{errors.root?.message}</FormError>
            </AdaptiveBody>
            <AdaptiveFooter>
                <Button variant='outline' onClick={() => closeDialog()}>
                    Cancel
                </Button>
                <Button type='submit' isLoading={isSubmitting}>
                    Save
                </Button>
            </AdaptiveFooter>
        </form>
    );
}
