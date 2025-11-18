'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

export function OtherDetailsTab({ control, register, errors, isSubmitting, watch, onClear }: any) {
    const stopPension = watch('stopPension');
    const employeeLeft = watch('employeeLeft');
    const [stopPensionDateOpen, setStopPensionDateOpen] = useState(false);
    const [lastWorkingDayOpen, setLastWorkingDayOpen] = useState(false);

    return (
        <div className='space-y-4'>
            <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>Other Details</h3>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <InputText
                    label='Biometric Code'
                    id='biometricCode'
                    placeholder='48'
                    {...register('biometricCode')}
                    error={errors.biometricCode?.message}
                />

                <div className='space-y-2'>
                    <Label className='mb-2 block'>Options</Label>
                    <div className='space-y-3'>
                        <Controller
                            name='punchRelaxation'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='punchRelaxation' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='punchRelaxation' className='cursor-pointer leading-none'>
                                        Punch Relaxation ?
                                    </Label>
                                </div>
                            )}
                        />
                        <Controller
                            name='stopPension'
                            control={control}
                            render={({ field }) => (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox id='stopPension' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                                    <Label htmlFor='stopPension' className='cursor-pointer leading-none'>
                                        Stop Pension ?
                                    </Label>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <InputText label='RF card ID' id='rfCardId' {...register('rfCardId')} error={errors.rfCardId?.message} />

                {stopPension && (
                    <div className='space-y-2'>
                        <Label>Date of Stop Pension</Label>
                        <Controller
                            name='dateOfStopPension'
                            control={control}
                            render={({ field }) => (
                                <Popover open={stopPensionDateOpen} onOpenChange={setStopPensionDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'h-9 w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(day) => {
                                                if (day) {
                                                    field.onChange(format(day, 'yyyy-MM-dd'));
                                                    setStopPensionDateOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                    </div>
                )}

                <InputText
                    label='MS Teams UserName'
                    id='msTeamsUserName'
                    placeholder='STCSAdmin'
                    {...register('msTeamsUserName')}
                    error={errors.msTeamsUserName?.message}
                />

                <Controller
                    name='employeeLeft'
                    control={control}
                    render={({ field }) => (
                        <div className='flex items-center space-x-2'>
                            <Checkbox id='employeeLeft' checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                            <Label htmlFor='employeeLeft' className='cursor-pointer leading-none'>
                                Employee Left ?
                            </Label>
                        </div>
                    )}
                />

                <InputText
                    label='MS Teams Password'
                    id='msTeamsPassword'
                    type='password'
                    {...register('msTeamsPassword')}
                    error={errors.msTeamsPassword?.message}
                />
            </div>

            {employeeLeft && (
                <div className='rounded-lg border bg-muted/50 p-4'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>
                                Last Working day <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='lastWorkingDay'
                                control={control}
                                render={({ field }) => (
                                    <Popover open={lastWorkingDayOpen} onOpenChange={setLastWorkingDayOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant='outline'
                                                className={cn(
                                                    'h-9 w-full justify-start text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <DatePickerWithYear
                                                mode='single'
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(day) => {
                                                    if (day) {
                                                        field.onChange(format(day, 'yyyy-MM-dd'));
                                                        setLastWorkingDayOpen(false);
                                                    }
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                        <div className='space-y-2 lg:col-span-2'>
                            <Label>Reason for Leaving</Label>
                            <textarea
                                id='reasonForLeaving'
                                {...register('reasonForLeaving')}
                                className='min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                                placeholder='Enter reason for leaving...'
                            />
                        </div>
                    </div>
                </div>
            )}

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

