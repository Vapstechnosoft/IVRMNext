'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { birthdayFormSchema, type IBirthdayFormValues } from './schema';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Send, RotateCcw } from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';

interface BirthdayFormProps {
    onTypeChange: (type: string) => void;
    onSubmit: (values: IBirthdayFormValues) => void;
    isLoading: boolean;
}

export default function BirthdayForm({ onTypeChange, onSubmit, isLoading }: BirthdayFormProps) {
    const form = useForm<IBirthdayFormValues>({
        resolver: zodResolver(birthdayFormSchema),
        defaultValues: {
            radioption: 'student',
            sms: false,
            email: false,
            Whatsapp: false,
            selectedParticipants: []
        }
    });

    const watchType = form.watch('radioption');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <CollapsibleSection title="Send Birthday Wishes">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="radioption"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-lg font-semibold">Select Participant Category</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    onTypeChange(val);
                                                }}
                                                defaultValue={field.value}
                                                className="flex flex-wrap gap-6"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="student" /></FormControl>
                                                    <FormLabel className="font-normal">Student</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="Staff" /></FormControl>
                                                    <FormLabel className="font-normal">Staff</FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl><RadioGroupItem value="Alumni" /></FormControl>
                                                    <FormLabel className="font-normal">Alumni</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <FormLabel className="text-lg font-semibold">Delivery Methods</FormLabel>
                            <div className="flex flex-wrap gap-8 pt-2">
                                <FormField
                                    control={form.control}
                                    name="sms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="flex items-center gap-2 font-normal"><MessageSquare className="h-4 w-4" /> SMS</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="flex items-center gap-2 font-normal"><Mail className="h-4 w-4" /> Email</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="Whatsapp"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="flex items-center gap-2 font-normal">WhatsApp</FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {(form.watch('sms') || form.watch('email') || form.watch('Whatsapp')) && (
                        <div className="flex justify-center gap-4 pt-8 border-t mt-6">
                            <Button type="submit" size="lg" disabled={isLoading} className="w-48 bg-primary hover:bg-primary/90">
                                <Send className="mr-2 h-5 w-5" /> Send Wishes
                            </Button>
                            <Button type="button" variant="outline" size="lg" className="w-48" onClick={() => form.reset()}>
                                <RotateCcw className="mr-2 h-5 w-5" /> Cancel
                            </Button>
                        </div>
                    )}
                </CollapsibleSection>
            </form>
        </Form>
    );
}
