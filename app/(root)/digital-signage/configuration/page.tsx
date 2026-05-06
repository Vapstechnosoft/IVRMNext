'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Settings, Save, Monitor, ShieldCheck, Zap, Globe, Key, Clock } from 'lucide-react';

export default function DigitalSignageConfiguration() {
    return (
        <div className='container mx-auto p-6 space-y-8'>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='flex items-center justify-between'
            >
                <div>
                    <h1 className='text-3xl font-bold tracking-tight text-orange-600 flex items-center gap-2'>
                        <Settings className='h-8 w-8' />
                        Signage Configuration
                    </h1>
                    <p className='text-muted-foreground mt-1'>Configure the Xibo Flask API and system-wide signage parameters.</p>
                </div>
                <Button className='bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-500/20 transition-all'>
                    <Save className='mr-2 h-4 w-4' /> Save Configuration
                </Button>
            </motion.div>

            <div className='grid gap-6 md:grid-cols-2'>
                {/* API Settings */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Globe className='h-5 w-5' />
                                API Connection
                            </CardTitle>
                            <CardDescription>Configure connection to the Xibo Flask API service.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='api-url'>API Base URL</Label>
                                <Input id='api-url' placeholder='http://xibo-flask-api:5000' defaultValue='http://xibo-flask-api:5000' className='focus-visible:ring-orange-500' />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='api-key'>Secret Key</Label>
                                <div className='flex gap-2'>
                                    <Input id='api-key' type='password' value='••••••••••••••••' readOnly className='focus-visible:ring-orange-500' />
                                    <Button variant='outline' size='sm'><Key className='h-4 w-4' /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Display Settings */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Monitor className='h-5 w-5' />
                                Default Display Properties
                            </CardTitle>
                            <CardDescription>Default settings for newly scheduled items.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='def-width'>Width (px)</Label>
                                    <Input id='def-width' placeholder='1920' defaultValue='1920' className='focus-visible:ring-orange-500' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='def-height'>Height (px)</Label>
                                    <Input id='def-height' placeholder='1080' defaultValue='1080' className='focus-visible:ring-orange-500' />
                                </div>
                            </div>
                            <div className='flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100'>
                                <div className='space-y-0.5'>
                                    <Label>Portrait Mode Default</Label>
                                    <p className='text-xs text-muted-foreground'>Assume portrait orientation if not specified.</p>
                                </div>
                                <Switch className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Automation & Sync */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Clock className='h-5 w-5' />
                                Synchronization
                            </CardTitle>
                            <CardDescription>Manage how often data is refreshed from Xibo CMS.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='sync-interval'>Sync Interval (minutes)</Label>
                                <Input id='sync-interval' type='number' defaultValue='5' className='focus-visible:ring-orange-500' />
                            </div>
                            <div className='flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100'>
                                <div className='space-y-0.5'>
                                    <Label>Auto-cleanup Media</Label>
                                    <p className='text-xs text-muted-foreground'>Remove expired media from server automatically.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <ShieldCheck className='h-5 w-5' />
                                Security Protocols
                            </CardTitle>
                            <CardDescription>Manage access control and authentication.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100'>
                                <div className='space-y-0.5'>
                                    <Label>Force SSL</Label>
                                    <p className='text-xs text-muted-foreground'>Require HTTPS for all API requests.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                            <div className='flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100'>
                                <div className='space-y-0.5'>
                                    <Label>Audit Logging</Label>
                                    <p className='text-xs text-muted-foreground'>Log all upload and schedule actions.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Advanced Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className='md:col-span-2'
                >
                    <Card className='border-orange-100 bg-gradient-to-br from-white to-orange-50/30'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Zap className='h-5 w-5' />
                                System Status & Resources
                            </CardTitle>
                            <CardDescription>Real-time telemetry of the signage service.</CardDescription>
                        </CardHeader>
                        <CardContent className='grid gap-4 md:grid-cols-4'>
                            <div className='p-4 rounded-xl border border-orange-100 bg-white/50 backdrop-blur-sm'>
                                <Label className='text-orange-600 font-bold'>API Latency</Label>
                                <p className='text-2xl font-bold mt-1'>-- ms</p>
                                <p className='text-xs text-muted-foreground'>Awaiting connection</p>
                            </div>
                            <div className='p-4 rounded-xl border border-orange-100 bg-white/50 backdrop-blur-sm'>
                                <Label className='text-orange-600 font-bold'>Active Clients</Label>
                                <p className='text-2xl font-bold mt-1'>0</p>
                                <p className='text-xs text-muted-foreground'>Connected displays</p>
                            </div>
                            <div className='p-4 rounded-xl border border-orange-100 bg-white/50 backdrop-blur-sm'>
                                <Label className='text-orange-600 font-bold'>Storage</Label>
                                <p className='text-2xl font-bold mt-1'>--%</p>
                                <p className='text-xs text-muted-foreground'>Checking resources...</p>
                            </div>
                            <div className='p-4 rounded-xl border border-orange-100 bg-white/50 backdrop-blur-sm'>
                                <Label className='text-orange-600 font-bold'>Version</Label>
                                <p className='text-2xl font-bold mt-1'>v2.4.1</p>
                                <p className='text-xs text-muted-foreground'>System current</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
