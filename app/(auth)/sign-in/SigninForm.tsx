'use client';

import Logo from '@/components/layout/navigation/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputPassword } from '@/components/ui/extension/input-password';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { loginSchema } from '@/schemas/admission/preadmission/masters';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, LockKeyhole, LogIn, TriangleAlert, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';
import Image from 'next/image';

type FormFields = z.infer<typeof loginSchema>;

export default function SigninForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [rememberMe, setRememberMe] = useState(false);

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
        <div className='min-h-screen flex'>
            {/* Left Side - Background Image */}
            <div className='hidden lg:flex lg:w-1/2 relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-700/20 z-10' />
                <Image src='/assets/Login_BG.png' alt='VAPS Campus' fill className='object-fill' priority />
                <div className='absolute inset-0 z-10 flex flex-col justify-center p-[150px]'>
                    <div className='text-white space-y-4'>
                        <div className='flex items-center gap-3 mb-6'>
                            <GraduationCap className='w-8 h-8' />
                            <span className='text-2xl font-bold'>VAPS</span>
                        </div>
                        <h1 className='text-4xl font-bold leading-tight'>
                            Track progress
                            <br />
                            anytime, anywhere.
                        </h1>
                        <p className='text-lg text-white/90 max-w-md'>
                            Empowering education through technology. Join our community of learners and educators.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Sign In Form */}
            <div className='w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white'>
                <div className='w-full max-w-md'>
                    {/* Mobile Logo */}
                    <div className='flex justify-center lg:hidden'>
                        <Logo size='full' />
                    </div>

                    <Card className='border-0 shadow-2xl bg-white/80 backdrop-blur-sm'>
                        <CardHeader>
                            <div className='hidden lg:flex justify-center mb-4'>
                                <Logo size='full' />
                            </div>
                            <div className='text-center'>
                                <CardTitle className='text-3xl font-bold text-gradient'>Welcome Back</CardTitle>
                                <CardDescription className='text-gray-600'>Sign in to access your dashboard</CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                                <div className='space-y-2'>
                                    <InputText
                                        type='email'
                                        label='Email Address'
                                        placeholder='Enter your email'
                                        {...register('email')}
                                        error={errors.email?.message}
                                    />

                                    <div className='space-y-2'>
                                        <Label htmlFor='password' className='text-sm font-medium'>
                                            Password
                                        </Label>
                                        <InputPassword
                                            id='password'
                                            type='password'
                                            placeholder='Enter your password'
                                            {...register('password')}
                                            value={watch('password')}
                                            error={errors.password?.message}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className='flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200'>
                                        <TriangleAlert className='w-5 h-5 text-red-600 flex-shrink-0' />
                                        <p className='text-sm font-medium text-red-700'>{error}</p>
                                    </div>
                                )}

                                {/* Remember Me & Forgot Password */}
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='remember'
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        />
                                        <Label htmlFor='remember' className='text-sm text-gray-600 cursor-pointer'>
                                            Remember me
                                        </Label>
                                    </div>
                                    <Link
                                        href='/forgot-password'
                                        className='text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors'>
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Action Buttons */}
                                <div className='space-y-2'>
                                    <Button
                                        type='submit'
                                        isLoading={isPending}
                                        loadingText='Signing in...'
                                        className='w-full h-12 bg-gradient-purple-orange text-white font-semibold rounded-lg'
                                        disabled={isPending}
                                        suffix={<LogIn className='size-4 transition-all ease-linear group-hover:translate-x-2' />}>
                                        Sign In
                                    </Button>

                                    <div className='relative'>
                                        <div className='absolute inset-0 flex items-center'>
                                            <div className='w-full border-t border-gray-300' />
                                        </div>
                                        <div className='relative flex justify-center text-sm'>
                                            <span className='px-4 bg-white text-gray-500'>or</span>
                                        </div>
                                    </div>

                                    <Button
                                        type='button'
                                        onClick={() => {}}
                                        disabled={isPending}
                                        variant='outline'
                                        toolTip='Preadmission Registration is not available yet.'
                                        className='w-full h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group'>
                                        <LockKeyhole className='w-4 h-4 mr-2 text-gray-600 group-hover:text-blue-600' />
                                        <span className='flex-1 text-gray-700 group-hover:text-blue-700 font-medium'>
                                            Preadmission Registration
                                        </span>
                                        <ArrowUpRight className='w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all group-hover:translate-x-1' />
                                    </Button>
                                </div>
                            </form>

                            {/* Footer */}
                            <div className='text-center pt-4 border-t border-gray-100'>
                                <p className='text-sm text-gray-600'>
                                    Need help?{' '}
                                    <Link href='/support' className='font-medium text-gradient'>
                                        Contact Support
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
