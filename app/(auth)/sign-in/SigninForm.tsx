'use client';

import Logo from '@/components/layout/navigation/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputPassword } from '@/components/ui/extension/input-password';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { loginSchema } from '@/schemas/auth';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, TriangleAlert, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof loginSchema>;

export default function SigninForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();

    const {
        reset,
        handleSubmit,
        register,
        watch,
        formState: { errors }
    } = useForm<FormFields>({
        mode: 'onChange',
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit: SubmitHandler<FormFields> = (values) => {
        setError('');

        startTransition(async () => {
            login({ values, callbackUrl }).then(async (data) => {
                if (data?.error) {
                    reset({ password: '' });
                    setError(data.error);
                }
            });
        });
    };

    return (
        <section className='py-32'>
            <div className='container'>
                <div className='flex flex-col items-center gap-4'>
                    <Logo />
                    <Card className='mx-auto w-full max-w-md'>
                        <CardHeader className='items-center'>
                            <UserRound className='size-10 rounded-full bg-accent p-2.5 text-muted-foreground' />
                            <CardTitle className='text-xl'>Sign in with your email</CardTitle>
                            <CardDescription>Enter your information to sign in</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
                                <InputText
                                    type='email'
                                    label='Email'
                                    placeholder='m@example.com'
                                    {...register('email')}
                                    error={errors.email?.message}
                                />

                                <div className='grid gap-2'>
                                    <div className='flex justify-between'>
                                        <Label htmlFor='password'>Password</Label>
                                        <Link href='/forgot-password' className='text-sm underline'>
                                            Forgot password
                                        </Link>
                                    </div>
                                    <InputPassword
                                        id='password'
                                        type='password'
                                        placeholder='Enter your password'
                                        {...register('password')}
                                        value={watch('password')}
                                        error={errors.password?.message}
                                    />
                                </div>

                                {error && (
                                    <div className='my-3 flex select-none items-center gap-4 rounded-md bg-red-50 p-3'>
                                        <TriangleAlert className='size-5 text-red-600' />
                                        <p className='font-medium text-red-600 text-sm'>{error || ''}</p>
                                    </div>
                                )}

                                <Button
                                    type='submit'
                                    isLoading={isPending}
                                    loadingText='Signing in...'
                                    suffix={<LogIn className='size-4 transition-all ease-linear group-hover:translate-x-2' />}>
                                    Sign In
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
