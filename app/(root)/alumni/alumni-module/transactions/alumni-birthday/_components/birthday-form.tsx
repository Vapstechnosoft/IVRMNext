'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageSquare, Mail, MessageCircle, Send, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { type IBirthdayFormValues, birthdayFormSchema } from './schema';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthdayFormProps {
    initialData: any;
    onTypeChange: (type: string, values: any) => void;
    onSubmit: (values: IBirthdayFormValues) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export default function BirthdayForm({ initialData, onTypeChange, onSubmit, onCancel, isLoading }: BirthdayFormProps) {
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 animate-in fade-in slide-in-from-top-4 duration-500'>
                <Card className="border shadow-sm rounded-none overflow-hidden bg-white border-t-4 border-t-orange-400">
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-6 border rounded-sm bg-slate-50/30">
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
                                                    <div key={cat} className="flex items-center space-x-2 cursor-pointer group" onClick={() => {
                                                        field.onChange(cat);
                                                        onTypeChange(cat, form.getValues());
                                                    }}>
                                                        <RadioGroupItem value={cat} id={`cat-${cat}`} className="h-5 w-5 text-primary border-slate-300" />
                                                        <label 
                                                            htmlFor={`cat-${cat}`} 
                                                            className="text-sm font-bold text-slate-600 cursor-pointer group-hover:text-primary capitalize"
                                                        >
                                                            {cat}
                                                        </label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Filters & Channels */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-10 pt-10 border-t border-dashed">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-1 bg-primary rounded-full" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Filtering Criteria</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="asmaY_Id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Year</FormLabel>
                                                <Select 
                                                    onValueChange={(val) => {
                                                        field.onChange(Number(val));
                                                        onTypeChange(radioption, { ...form.getValues(), asmaY_Id: Number(val) });
                                                    }} 
                                                    value={field.value?.toString()}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                            <SelectValue placeholder="Year" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {initialData?.academiclist?.map((year: any) => (
                                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                                {year.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    {radioption === 'student' && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="asmcL_Id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                field.onChange(Number(val));
                                                                onTypeChange(radioption, { ...form.getValues(), asmcL_Id: Number(val) });
                                                            }} 
                                                            value={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                                    <SelectValue placeholder="Class" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {initialData?.classDrpDwn?.map((cls: any) => (
                                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                        {cls.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="asmS_Id"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section</FormLabel>
                                                        <Select 
                                                            onValueChange={(val) => {
                                                                field.onChange(Number(val));
                                                                onTypeChange(radioption, { ...form.getValues(), asmS_Id: Number(val) });
                                                            }} 
                                                            value={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                                                                    <SelectValue placeholder="Section" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {initialData?.sectionDrpDwn?.map((sec: any) => (
                                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                        {sec.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Delivery Channels</h3>
                                </div>
                                <div className='flex flex-wrap gap-4'>
                                    {[
                                        { name: 'sms', label: 'SMS', icon: <MessageSquare className="h-4 w-4" />, color: 'bg-blue-500' },
                                        { name: 'email', label: 'EMAIL', icon: <Mail className="h-4 w-4" />, color: 'bg-rose-500' },
                                        { name: 'Whatsapp', label: 'WHATSAPP', icon: <MessageCircle className="h-4 w-4" />, color: 'bg-emerald-500' }
                                    ].map((channel) => (
                                        <FormField
                                            key={channel.name}
                                            control={form.control}
                                            name={channel.name as any}
                                            render={({ field }) => (
                                                <div 
                                                    className={cn(
                                                        "flex items-center gap-4 px-5 py-3 rounded-xl border transition-all cursor-pointer",
                                                        field.value 
                                                            ? `border-emerald-500 bg-emerald-50/50` 
                                                            : "bg-slate-50/50 border-slate-100 hover:border-slate-200"
                                                    )}
                                                    onClick={() => field.onChange(!field.value)}
                                                >
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("p-1.5 rounded-lg text-white", field.value ? channel.color : "bg-slate-300")}>
                                                            {channel.icon}
                                                        </div>
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", field.value ? "text-emerald-700" : "text-slate-400")}>
                                                            {channel.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isAnySelected && (
                            <div className='flex items-center justify-center gap-6 pt-10 mt-10 border-t border-slate-100 animate-in zoom-in-95 duration-300'>
                                <Button 
                                    type='submit' 
                                    size='lg' 
                                    disabled={isLoading} 
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
