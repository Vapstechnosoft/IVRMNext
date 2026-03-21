'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/layout/navigation/logo';
import { toast } from 'sonner';

export default function SchoolAdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Static credential validation
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                toast.success('Login successful! Redirecting...');
                router.push('/chairman');
            } else {
                toast.error('Invalid credentials. Hint: admin / admin123');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-layout">
            <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden card-premium">
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-secondary" />

                <CardHeader className="space-y-4 pt-10 pb-6 text-center">
                    <div className="flex justify-center mb-2">
                        <Logo className="h-12" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-black text-foreground tracking-tight">
                            Admin Login
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-semibold">
                            Enter your credentials to access the portal
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-foreground font-bold ml-1">Username</Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-11 h-12 bg-muted/50 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-foreground font-bold ml-1">Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 pr-12 h-12 bg-muted/50 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" className="rounded border-primary text-primary" />
                                <Label htmlFor="remember" className="text-sm font-semibold text-muted-foreground">Remember me</Label>
                            </div>
                            <button type="button" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] btn-gradient"
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="bg-muted/30 border-t border-border py-4 flex flex-col items-center">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Secure Enterprise Access</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
