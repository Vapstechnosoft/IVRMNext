'use client';

import './signin-form.css';
import PreadmissionRegistration from '@/app/(root)/admission/preadmission/transactions/preadmission-registration/page';
import { useCheckPreadmissionLive } from '@/hooks/admission/preadmission/useConfigurations';
import { loginSchema } from '@/schemas/admission/preadmission/masters';
import { login } from '@/server/user';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    ArrowRight,
    CheckCircle2,
    Compass,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Newspaper,
    Send,
    Sparkles,
    Target,
    TriangleAlert,
    User,
    X
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react'; // Added import here
import { useEffect, useState, useTransition } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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

    // Dialog / Modal states
    const [isVirtualTourOpen, setIsVirtualTourOpen] = useState(false);
    const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
    const [subscribeEmail, setSubscribeEmail] = useState('');
    const [subscribeSuccess, setSubscribeSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Force light mode for auth page
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

    const handleSubscribeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subscribeEmail || !subscribeEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }
        setSubscribeSuccess(true);
        toast.success('Thank you for subscribing to Technoveda!');
        setTimeout(() => {
            setIsSubscribeOpen(false);
            setSubscribeSuccess(false);
            setSubscribeEmail('');
        }, 2200);
    };

    if (!mounted) return null;

    return (
        <div className='signin-root-container'>
            {/* Background layers */}
            <div className='bg-main-gradient' />
            <div className='bg-grid-premium' />
            <div className='bg-grain-texture' />

            {/* Floating wave & aura glows */}
            <div className='bg-waves-container'>
                <div className='wave-1 bg-wave' />
                <div className='wave-2 bg-wave' />
                <div className='wave-3 bg-wave' />
            </div>

            <div className='bg-blobs'>
                <div className='blob blob-lavender' />
                <div className='blob blob-peach' />
                <div className='blob blob-pink' />
            </div>

            <div className='bg-aura-glow' />

            <div className='signin-layout-wrapper animate-entry'>
                {/* --- MAIN HERO & SIGN-IN GRID --- */}
                <main className='signin-main-grid'>
                    {/* LEFT COLUMN: About VAPS + Mobile Phone Preview + Mission/Vision */}
                    <div className='about-column'>
                        {/* ABOUT VAPS Card with Smartphone Preview */}
                        <div className='about-hero-card glass-premium'>
                            <div className='about-hero-content'>
                                {/* <div className='about-badge'>
                                    <Sparkles size={14} />
                                    <span>ABOUT VAPS</span>
                                </div> */}
                                <a
                                    href='https://www.google.com/search?q=About+VAPS+Technosoft+company+in+Bangalore'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='about-badge'
                                    title='Click to learn about VAPS'
                                    style={{ textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                    <Sparkles size={14} />
                                    <span>ABOUT VAPS</span>
                                </a>
                                <h2 className='about-heading'>Ai-Vidyalaya Resource Management</h2>
                                <p className='about-text'>
                                    VAPS Technosoft is an ISO 9001 established software development company based in Bangalore specialized
                                    in <strong>Ai-Vidyalaya Resource Management Software</strong> for educational Institutions &amp;
                                    universities ranging from Kinder Garden to Post Graduation.
                                </p>

                                <div className='about-highlights'>
                                    <span className='highlight-chip'>ISO 9001 Certified</span>
                                    <span className='highlight-chip'>KG to Higher Ed</span>
                                    <span className='highlight-chip'>Bangalore HQ</span>
                                </div>
                            </div>

                            {/* Smartphone Mobile Preview */}
                            <div className='phone-preview-container'>
                                <PhoneMockup />
                            </div>
                        </div>

                        {/* MISSION & VISION Cards (2 Column) */}
                        <div className='mission-vision-grid'>
                            <div className='mv-card glass-premium'>
                                <div className='mv-header'>
                                    <div className='mv-icon-box icon-mission'>
                                        <Target size={18} />
                                    </div>
                                    <h3 className='mv-title'>ABOUT VAPS MISSION - ARE YOU UP TO DATE?</h3>
                                </div>
                                <p className='mv-body'>
                                    To facilitate customers to achieve their goals by providing innovative, best-in-class consulting, IT
                                    solutions and services.
                                </p>
                            </div>

                            <div className='mv-card glass-premium'>
                                <div className='mv-header'>
                                    <div className='mv-icon-box icon-vision'>
                                        <Compass size={18} />
                                    </div>
                                    <h3 className='mv-title'>VAPS VISION &amp; VALUES</h3>
                                </div>
                                <p className='mv-body'>
                                    <strong>Vision:</strong> VAPS (V -Versatile in Vision,A - Avant Garde in Thinking,P -Prolific in Work,S
                                    -Service is our Motto) <br />
                                    <strong>Values:</strong> To facilitate Customers to grow with us in making high-end technologies
                                    available even to common man.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sign In Form */}
                    <div className='login-column'>
                        <div className='login-card glass-premium'>
                            <div className='login-header'>
                                <div className='login-shield-icon'>
                                    <KeyRound size={22} className='text-warm-orange' />
                                </div>
                                <h2 className='login-title'>SIGN IN</h2>
                                <p className='login-subtitle'>Enter your credentials to access your portal dashboard</p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className='login-form'>
                                {/* Username */}
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

                                {/* Password */}
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
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='password-toggle-btn'
                                            aria-label='Toggle password visibility'>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className='field-error'>{errors.password?.message}</p>}
                                </div>

                                {/* Forgot password link */}
                                <div className='forgot-password-row'>
                                    {/* <Link href='/forgot-password' className='forgot-password-link'>
                                        Forgot password?
                                    </Link> */}
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
                                            <span>Sign In</span>
                                            <ArrowRight size={18} className='btn-arrow' />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className='premium-divider'>
                                <span>OR</span>
                            </div>

                            {/* Pre-Admission Registration Component */}
                            <div className='preadmission-box'>
                                <PreadmissionRegistration />
                            </div>

                            <div className='login-card-footer'>
                                <p className='secure-badge'>
                                    <span className='green-dot' />
                                    End-to-End Secure Session
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                {/* --- BOTTOM BANNER: SUBSCRIBE TO TECHNOVEDA --- */}
                <footer className='technoveda-card glass-premium'>
                    <div className='technoveda-content'>
                        <div className='technoveda-badge'>
                            <Newspaper size={14} />
                            <span>QUARTERLY NEWSLETTER</span>
                        </div>
                        <h2 className='technoveda-title'>SUBSCRIBE TO TECHNOVEDA</h2>
                        <p className='technoveda-text'>
                            Technoveda is the official quarterly digital newsletter of <strong>VAPS Group</strong>, created as a
                            thought-leadership and knowledge-sharing platform for the education and technology ecosystem. It brings together
                            educators, institutions, students, technologists, and industry experts to explore how digital innovation is
                            reshaping learning and campus management.
                        </p>
                        <a
                            href='https://vapstechnoveda.com/subscriber'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='technoveda-subscribe-btn'
                            style={{ textDecoration: 'none' }}>
                            <span>Subscribe Here</span>
                            <Send size={16} />
                        </a>
                    </div>

                    <div className='technoveda-qr-area'>
                        <a
                            href='https://vapstechnoveda.com/subscriber'
                            target='_blank'
                            rel='noopener noreferrer'
                            className='qr-card-link'
                            title='Click or scan to visit https://vapstechnoveda.com/subscriber'>
                            <div className='qr-card'>
                                {/* Replaced the hardcoded component with the dynamic qrcode.react one */}
                                <QRCodeSVG value='https://vapstechnoveda.com/subscriber' className='qr-code-svg' fgColor='#1e293b' />
                                <span className='qr-caption'>Scan here to subscribe now</span>
                            </div>
                        </a>
                    </div>
                </footer>
            </div>

            {/* --- VIRTUAL TOUR DIALOG MODAL --- */}
            {/* {isVirtualTourOpen && (
                <div className='modal-backdrop animate-fade-in'>
                    <div className='modal-container glass-modal'>
                        <button type='button' onClick={() => setIsVirtualTourOpen(false)} className='modal-close-btn'>
                            <X size={20} />
                        </button>

                        <div className='modal-header-icon'>
                            <Compass size={36} className='text-warm-orange animate-spin-slow' />
                        </div>
                        <h3 className='modal-title'>360° Virtual Campus Tour</h3>
                        <p className='modal-subtitle'>Experience the state-of-the-art digital infrastructure of i-Vidyalaya Smart Campus.</p>

                        <div className='virtual-tour-preview-box'>
                            <div className='vt-badge-overlay'>360° INTERACTIVE</div>
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/52b647fd-940b-48f0-b28c-8547e52a7109.png'
                                alt='Virtual Tour Preview'
                                className='vt-preview-img'
                            />
                            <div className='vt-play-hint'>
                                <Compass size={32} className='text-white animate-bounce' />
                                <span>Click to Launch Fullscreen Tour</span>
                            </div>
                        </div>

                        <div className='modal-actions'>
                            <button type='button' onClick={() => setIsVirtualTourOpen(false)} className='btn-modal-secondary'>
                                Close
                            </button>
                            <button
                                type='button'
                                onClick={() => {
                                    toast.info('Launching 360° Virtual Tour...');
                                    setIsVirtualTourOpen(false);
                                }}
                                className='btn-modal-primary'>
                                Launch 360° Tour
                            </button>
                        </div>
                    </div>
                </div>
            )} */}

            {/* --- TECHNOVEDA SUBSCRIBE MODAL --- */}
            {isSubscribeOpen && (
                <div className='modal-backdrop animate-fade-in'>
                    <div className='modal-container glass-modal'>
                        <button type='button' onClick={() => setIsSubscribeOpen(false)} className='modal-close-btn'>
                            <X size={20} />
                        </button>

                        <div className='modal-header-icon'>
                            <Newspaper size={36} className='text-lavender-rich' />
                        </div>
                        <h3 className='modal-title'>Subscribe to Technoveda Newsletter</h3>
                        <p className='modal-subtitle'>
                            Join educators and tech leaders receiving quarterly updates on digital campus innovations.
                        </p>

                        {subscribeSuccess ? (
                            <div className='subscribe-success-box'>
                                <CheckCircle2 size={48} className='animate-bounce text-emerald-500' />
                                <h4>Subscription Confirmed!</h4>
                                <p>You have successfully subscribed to Technoveda quarterly newsletter.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribeSubmit} className='subscribe-form'>
                                <div className='input-wrapper'>
                                    <input
                                        type='email'
                                        value={subscribeEmail}
                                        onChange={(e) => setSubscribeEmail(e.target.value)}
                                        placeholder='Enter your official email address...'
                                        className='subscribe-input'
                                        required
                                    />
                                    <Mail size={18} className='input-icon' />
                                </div>
                                <button type='submit' className='btn-modal-primary mt-4 w-full'>
                                    <span>Subscribe Now</span>
                                    <Send size={16} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* --- Smartphone Mockup Component --- */
function PhoneMockup() {
    return (
        <div className='phone-frame'>
            <div className='phone-notch'>
                <div className='phone-speaker' />
                <div className='phone-camera' />
            </div>
            <div className='phone-screen'>
                {/* Status Bar */}
                <div className='phone-status-bar'>
                    <span>9:41</span>
                    <div className='phone-status-icons'>
                        <span className='dot' />
                        <span className='dot' />
                    </div>
                </div>

                {/* App Header */}
                <div className='phone-app-header'>
                    <div className='phone-app-brand'>
                        <span className='brand-i'>i-</span>
                        <span className='brand-v'>Vidyalaya</span>
                    </div>
                    <div className='phone-avatar'>SA</div>
                </div>

                {/* Dashboard Stats */}
                <div className='phone-dashboard-body'>
                    <div className='phone-section-title'>MY DASHBOARD</div>

                    <div className='phone-stats-grid'>
                        <div className='phone-stat-card card-purple'>
                            <span className='stat-val'>1,420</span>
                            <span className='stat-lbl'>Students</span>
                        </div>
                        <div className='phone-stat-card card-peach'>
                            <span className='stat-val'>98.4%</span>
                            <span className='stat-lbl'>Attendance</span>
                        </div>
                        <div className='phone-stat-card card-orange'>
                            <span className='stat-val'>94%</span>
                            <span className='stat-lbl'>Fee Paid</span>
                        </div>
                    </div>

                    {/* Interactive Curve Chart */}
                    <div className='phone-chart-card'>
                        <div className='chart-header'>
                            <span>Collection Analytics</span>
                            <span className='chart-tag'>+12.4%</span>
                        </div>
                        <svg className='chart-svg' viewBox='0 0 200 60'>
                            <path d='M0,45 Q30,10 60,35 T120,20 T180,30 L200,10 L200,60 L0,60 Z' fill='url(#phoneGrad)' opacity='0.35' />
                            <path d='M0,45 Q30,10 60,35 T120,20 T180,30 L200,10' fill='none' stroke='#ff7a18' strokeWidth='3' />
                            <defs>
                                <linearGradient id='phoneGrad' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor='#ff7a18' />
                                    <stop offset='100%' stopColor='#ff7a18' stopOpacity='0' />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Quick Access Pills */}
                    <div className='phone-quick-actions'>
                        <div className='action-pill'>📚 Academics</div>
                        <div className='action-pill'>💳 Online Fee</div>
                        <div className='action-pill'>🚌 Transport</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
