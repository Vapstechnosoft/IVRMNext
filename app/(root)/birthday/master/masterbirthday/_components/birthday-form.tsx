'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Mail, MessageCircle, Send, XCircle } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { type IBirthdayFormValues, birthdayFormSchema } from './schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthdayFormProps {
    initialData: any;
    onTypeChange: (type: string, values: any) => void;
    onChannelChange: (channels: { sms: boolean; email: boolean; Whatsapp: boolean }) => void;
    onSubmit: (values: IBirthdayFormValues) => void;
    onCancel: () => void;
    isLoading: boolean;
    totalRecords?: number;
}


export default function BirthdayForm({ initialData, onTypeChange, onChannelChange, onSubmit, onCancel, isLoading, totalRecords = 0 }: BirthdayFormProps) {
    const form = useForm<IBirthdayFormValues>({
        resolver: zodResolver(birthdayFormSchema),
        defaultValues: {
            radioption: undefined,
            asmaY_Id: undefined,
            asmcL_Id: undefined,
            asmS_Id: undefined,
            sms: false,
            email: false,
            Whatsapp: false,
            selectedParticipants: []
        }
    });

    const isAnySelected = form.watch('sms') || form.watch('email') || form.watch('Whatsapp');
    const radioption = form.watch('radioption');

    // Watch for changes and notify parent
    const sms = form.watch('sms');
    const email = form.watch('email');
    const Whatsapp = form.watch('Whatsapp');

    React.useEffect(() => {
        onChannelChange({ sms, email, Whatsapp });
    }, [sms, email, Whatsapp, onChannelChange]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 animate-in fade-in slide-in-from-top-4 duration-500'>
                <Card className="border shadow-sm rounded-b-3xl overflow-hidden bg-white border-t-4 border-t-orange-400 border-x-1 border-b-1">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 border rounded-[2rem] bg-slate-50/50">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-700">Please Select Radio Button:</span>
                                <span className="text-red-500 font-bold">*</span>
                            </div>

                            <FormField
                                control={form.control}
                                name='radioption'
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    onTypeChange(val, form.getValues());
                                                }}
                                                value={field.value}
                                                className='flex items-center gap-8'
                                            >
                                                {['student', 'Staff', 'Alumni'].map((cat) => (
                                                    <div key={cat} className="flex items-center space-x-2 cursor-pointer group">
                                                        <RadioGroupItem value={cat} id={`cat-${cat}`} className="h-5 w-5 text-primary border-slate-300" />
                                                        <label
                                                            htmlFor={`cat-${cat}`}
                                                            className="text-sm font-bold text-slate-600 cursor-pointer group-hover:text-primary capitalize"
                                                        >
                                                            {cat === 'student' ? 'Student' : cat}
                                                        </label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Checkboxes Row - Only show when a radio button is selected */}
                        {radioption && (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8 border rounded-[2rem] bg-slate-50/50 mt-6 animate-in zoom-in-95 fade-in duration-500 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-700">Please Select Check Box:</span>
                                    <span className="text-red-500 font-bold">*</span>
                                </div>

                                <div className='flex items-center gap-8'>
                                    {[
                                        { name: 'sms', label: 'SMS' },
                                        { name: 'email', label: 'EMAIL' },
                                        { name: 'Whatsapp', label: 'WHATSAPP' }
                                    ].map((channel) => (
                                        <FormField
                                            key={channel.name}
                                            control={form.control}
                                            name={channel.name as any}
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        id={`check-${channel.name}`}
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                                                    />
                                                    <label
                                                        htmlFor={`check-${channel.name}`}
                                                        className={cn(
                                                            "text-sm font-bold cursor-pointer transition-colors uppercase tracking-wider",
                                                            field.value ? "text-primary" : "text-slate-500 group-hover:text-primary"
                                                        )}
                                                    >
                                                        {channel.label}
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filtering Criteria - Removed as per request */}

                        {isAnySelected && (
                            <div className='flex items-center justify-center gap-6 pt-10 mt-10 border-t border-slate-100 animate-in zoom-in-95 duration-300'>
                                <Button
                                    type='submit'
                                    size='lg'
                                    disabled={isLoading || initialData == undefined || totalRecords === 0}
                                    className='h-14 px-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20'
                                >
                                    {isLoading ? 'Sending...' : <><Send className='mr-3 h-4 w-4' /> Send Wishes</>}
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='lg'
                                    onClick={onCancel}
                                    className='h-14 px-10 rounded-xl font-black uppercase tracking-widest text-[10px] text-slate-400'
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
