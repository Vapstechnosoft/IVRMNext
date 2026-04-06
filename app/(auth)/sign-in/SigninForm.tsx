'use client';

import './signin-form.css';
import PreadmissionRegistration from '@/app/(root)/admission/preadmission/transactions/preadmission-registration/page';
import { useCheckPreadmissionLive } from '@/hooks/admission/preadmission/useConfigurations';
import { loginSchema } from '@/schemas/admission/preadmission/masters';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowRight,
    Cloud,
    Code,
    Eye,
    EyeOff,
    GraduationCap,
    Laptop,
    Lock,
    Monitor,
    Phone,
    Server,
    Smartphone,
    Terminal,
    TriangleAlert,
    User
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { z } from 'zod';

type FormFields = z.infer<typeof loginSchema>;

export default function SigninForm() {
    const searchParams = useSearchParams();
    const { sub_domain } = useParams();

    const { data: preadmissionLive } = useCheckPreadmissionLive(sub_domain?.toString() || '');

    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [error, setError] = useState<string | undefined>('');
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Force light mode
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }, []);

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
        startTransition(() => {
            login({ values, callbackUrl }).then(async (data) => {
                if (data?.error) {
                    reset({ password: '' });
                    setError(data.error);
                }
            });
        });
    };

    if (!mounted) return null;

    return (
        <div className='exact-container'>
            {/* 1. Immersive Animated Background Layers */}
            <div className='bg-main-gradient' />
            <div className='bg-grid-premium' />
            <div className='bg-grain-texture' />

            {/* 2. Layered Flowing Waves */}
            <div className='bg-waves-container'>
                <div className='wave-1 bg-wave' />
                <div className='wave-2 bg-wave' />
                <div className='wave-3 bg-wave' />
            </div>

            {/* 3. Luxurious Blurred Gradient Blobs */}
            <div className='bg-blobs'>
                <div className='blob blob-lavender' />
                <div className='blob blob-peach' />
                <div className='blob blob-pink' />
            </div>

            {/* 4. Floating Computer Tech Icons (Ultra-Low Opacity) */}
            <div className='bg-icons-immersive'>
                <GraduationCap className='bg-icon' style={{ top: '10%', left: '5%', '--d': '12s' } as React.CSSProperties} size={140} />
                <Terminal
                    className='bg-icon'
                    style={{ top: '65%', left: '8%', '--d': '15s', animationDelay: '-2s' } as React.CSSProperties}
                    size={110}
                />
                <Code
                    className='bg-icon'
                    style={{ top: '15%', right: '7%', '--d': '18s', animationDelay: '-4s' } as React.CSSProperties}
                    size={90}
                />
                <Server
                    className='bg-icon'
                    style={{ bottom: '20%', right: '10%', '--d': '14s', animationDelay: '-6s' } as React.CSSProperties}
                    size={120}
                />
                <Laptop
                    className='bg-icon'
                    style={{ bottom: '10%', left: '40%', '--d': '16s', animationDelay: '-8s' } as React.CSSProperties}
                    size={100}
                />
                <Cloud
                    className='bg-icon'
                    style={{ top: '40%', right: '15%', '--d': '20s', animationDelay: '-10s' } as React.CSSProperties}
                    size={130}
                />
            </div>

            {/* 5. Floating Translucent Glass Shapes & Particles */}
            <div className='glass-shapes'>
                <div className='glass-shape g-1' />
                <div className='glass-shape g-2' />
            </div>
            <div className='particles-immersive'>
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className='particle-dot'
                        style={
                            {
                                '--i': i,
                                '--x': `${Math.random() * 100}%`,
                                '--s': `${Math.random() * 4 + 2}px`,
                                '--d': `${Math.random() * 10 + 10}s`
                            } as React.CSSProperties
                        }
                    />
                ))}
            </div>

            {/* 6. Lighting Aura behind panels */}
            <div className='bg-aura-glow' />

            <div className='exact-wrapper animate-entry'>
                {/* --- LEFT PANEL: Emotional Welcome --- */}
                <div className='exact-tray welcome-panel'>
                    <div className='exact-card glass-premium'>
                        <div className='welcome-content'>
                            <div className='exact-shield-premium'>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/52b647fd-940b-48f0-b28c-8547e52a7109.png'
                                    alt='Logo'
                                    className='h-full w-full object-contain'
                                />
                            </div>

                            <h1 className='welcome-heading'>
                                Welcome to your <br />
                                <span>Smart Campus</span>
                            </h1>
                            <p className='welcome-tagline'>Where education meets innovation, seamlessly.</p>

                            <div className='welcome-illustration'>
                                <div className='illus-container'>
                                    <div className='illus-glow' />
                                    <div className='main-illus'>
                                        <GraduationCap size={160} className='main-cap text-lavender-purple' />
                                        <div className='floating-elements'>
                                            <div className='float-item item-1' title='Digital Campus'>
                                                <Monitor size={24} />
                                            </div>
                                            <div className='float-item item-2' title='Infrastructure'>
                                                <Server size={22} />
                                            </div>
                                            <div className='float-item item-3' title='Mobile Access'>
                                                <Smartphone size={20} />
                                            </div>
                                            <div className='float-item item-4' title='Cloud Base'>
                                                <Cloud size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='illus-base' />
                                </div>
                            </div>

                            <div className='welcome-footer'>
                                <div className='contact-pill'>
                                    <Phone size={12} />
                                    <span>24/7 Digital Support Active</span>
                                </div>
                            </div>
                        </div>
                        <div className='card-inner-glow' />
                    </div>
                </div>

                {/* --- RIGHT PANEL: Premium Login --- */}
                <div className='exact-tray login-panel'>
                    <div className='exact-card glass-premium'>
                        <div className='login-header'>
                            <div className='brand-badge'>AIVRM SCHOOL ERP</div>
                            <h2 className='login-title'>Sign In</h2>
                            <p className='login-subtitle'>Enter your credentials to access your dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className='exact-form-premium'>
                            {/* Username with Floating Label */}
                            <div className='floating-field'>
                                <div className='input-wrapper'>
                                    <input
                                        {...register('email')}
                                        type='text'
                                        className={`floating-input ${watch('email') ? 'has-value' : ''}`}
                                        placeholder=' '
                                        id='email-input'
                                    />
                                    <label htmlFor='email-input' className='floating-label'>
                                        Username
                                    </label>
                                    <div className='input-focus-glow' />
                                    <User className='input-icon' size={18} />
                                </div>
                                {errors.email && <p className='field-error'>{errors.email?.message}</p>}
                            </div>

                            {/* Password with Floating Label */}
                            <div className='floating-field'>
                                <div className='input-wrapper'>
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        className={`floating-input ${watch('password') ? 'has-value' : ''}`}
                                        placeholder=' '
                                        id='password-input'
                                    />
                                    <label htmlFor='password-input' className='floating-label'>
                                        Password
                                    </label>
                                    <div className='input-focus-glow' />
                                    <Lock className='input-icon' size={18} />
                                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='password-toggle-btn'>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className='field-error'>{errors.password?.message}</p>}
                            </div>

                            {error && (
                                <div className='login-error-toast'>
                                    <TriangleAlert size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type='submit'
                                className={`btn-premium-primary ${isPending ? 'is-authenticating' : ''}`}
                                disabled={isPending}>
                                {isPending ? (
                                    <div className='loading-spinner'>
                                        <div className='dot' />
                                        <div className='dot' />
                                        <div className='dot' />
                                    </div>
                                ) : (
                                    <>
                                        <span>Sign In to Dashboard</span>
                                        <ArrowRight size={18} className='btn-arrow' />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className='premium-divider'>
                            <span>OR</span>
                        </div>

                        <button className='btn-premium-secondary' type='button'>
                            <Lock size={16} />
                            <span>Pre-Admission Portal</span>
                        </button>

                        <div className='login-card-footer'>
                            <p className='secure-badge'>
                                <span className='green-dot' />
                                End-to-end Secure Session
                            </p>
                        </div>
                        <div className='card-inner-glow' />
                    </div>
                </div>
            </div>

            {/* Hidden functional components for state management */}
            <div className='hidden'>
                <PreadmissionRegistration />
            </div>
        </div>
    );
}
