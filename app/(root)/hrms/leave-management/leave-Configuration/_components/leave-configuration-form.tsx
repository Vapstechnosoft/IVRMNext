'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { leaveConfigurationSchema, type LeaveConfigurationFormValues } from '@/schemas/hrms/leaveConfiguration/leaveConfiguration';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface LeaveConfigurationFormProps {
    initialData?: LeaveConfigurationFormValues | null;
    onSubmit: (data: LeaveConfigurationFormValues) => void;
    onCancel?: () => void;
    isPending?: boolean;
}

export default function LeaveConfigurationForm({ initialData, onSubmit, onCancel, isPending = false }: LeaveConfigurationFormProps) {
    const form = useForm<LeaveConfigurationFormValues>({
        resolver: zodResolver(leaveConfigurationSchema),
        defaultValues: initialData || {
            id: 0,
            spOrGenFlg: 'G',
            punchGapTime: '00:15',
            absentFlag: 'Y',
            lateInEarlyOutFlag: 'Y',
            lateInRelaxFlag: false,
            lateInEarlyOut: 'LateIn',
            lateInTime: '00:10',
            earlyOutRelaxFlag: false,
            earlyOutTime: '00:20',
            cummulativeTimeFlag: false,
            cummulativeTime: 60,
            afterCummulativeTime: 'HalfDay',
            noOfLatesFlag: false,
            noofMonthlyLateInExempted: 0,
            noOfLates: 0,
            noOfLatesCFFlag: false,
            leavePrefixSuffixFlag: false,
            includeHolidayFlag: false,
            activeFlag: true
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Punch GAP Time */}
                    <FormField
                        control={form.control}
                        name='punchGapTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Punch GAP Time (HH:mm)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='00:15' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Absent Flag */}
                    <FormField
                        control={form.control}
                        name='absentFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Absent Flag *</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Y' id='absent-yes' />
                                            <Label htmlFor='absent-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='N' id='absent-no' />
                                            <Label htmlFor='absent-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Late In/Early Out Flag */}
                    <FormField
                        control={form.control}
                        name='lateInEarlyOutFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Late In/Early Out Flag *</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Y' id='latein-yes' />
                                            <Label htmlFor='latein-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='N' id='latein-no' />
                                            <Label htmlFor='latein-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Late In Time */}
                    <FormField
                        control={form.control}
                        name='lateInTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Late In Time (minutes) *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter minutes' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Early Out Time */}
                    <FormField
                        control={form.control}
                        name='earlyOutTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Early Out Time (minutes) *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter minutes' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* No. of Lates Flag */}
                    <FormField
                        control={form.control}
                        name='noOfLatesFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>No. of Lates Flag</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='true' id='nolates-yes' />
                                            <Label htmlFor='nolates-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='false' id='nolates-no' />
                                            <Label htmlFor='nolates-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* No. of Lates */}
                    <FormField
                        control={form.control}
                        name='noOfLates'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. of Lates *</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder='Enter number of lates' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Cumulative Time Flag */}
                    <FormField
                        control={form.control}
                        name='cummulativeTimeFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Cumulative Time Flag</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='true' id='cumtime-yes' />
                                            <Label htmlFor='cumtime-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='false' id='cumtime-no' />
                                            <Label htmlFor='cumtime-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Cumulative Time */}
                    <FormField
                        control={form.control}
                        name='cummulativeTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cumulative Time (minutes) *</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder='Enter minutes' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* After Cumulative Time */}
                    <FormField
                        control={form.control}
                        name='afterCummulativeTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>After Cumulative Time *</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='e.g., HalfDay' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Monthly Late In Exempted */}
                    <FormField
                        control={form.control}
                        name='noofMonthlyLateInExempted'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. of Monthly Late In Exempted</FormLabel>
                                <FormControl>
                                    <Input {...field} type='number' placeholder='Enter number' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Carry Forward */}
                    <FormField
                        control={form.control}
                        name='noOfLatesCFFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Carry Forward</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='true' id='cf-yes' />
                                            <Label htmlFor='cf-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='false' id='cf-no' />
                                            <Label htmlFor='cf-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Leave Prefix Suffix Flag */}
                    <FormField
                        control={form.control}
                        name='leavePrefixSuffixFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Leave Prefix Suffix Flag</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='true' id='prefix-yes' />
                                            <Label htmlFor='prefix-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='false' id='prefix-no' />
                                            <Label htmlFor='prefix-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Include Holiday Flag */}
                    <FormField
                        control={form.control}
                        name='includeHolidayFlag'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Include Holiday Flag</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='true' id='holiday-yes' />
                                            <Label htmlFor='holiday-yes'>Yes</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='false' id='holiday-no' />
                                            <Label htmlFor='holiday-no'>No</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* SP or General Flag */}
                    <FormField
                        control={form.control}
                        name='spOrGenFlg'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>Stored Procedure/General Flag *</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className='flex space-x-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='SP' id='sp-flag' />
                                            <Label htmlFor='sp-flag'>Stored Procedure</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='G' id='gen-flag' />
                                            <Label htmlFor='gen-flag'>General</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isPending} className='min-w-[120px]'>
                        {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending} className='min-w-[120px]'>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
