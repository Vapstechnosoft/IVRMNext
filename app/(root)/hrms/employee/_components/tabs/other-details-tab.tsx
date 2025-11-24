'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { HRMSDateField as DateField } from '@/app/(root)/hrms/_components/hrms-date-field';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

export function OtherDetailsTab({ control, register, errors, isSubmitting, watch, onClear }: any) {
    const stopPension = watch('stopPension');
    const employeeLeft = watch('employeeLeft');

    return (
        <div className='space-y-4'>
            <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                <h3 className='font-semibold'>Other Details</h3>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <HRMSInputText
                    label='Biometric Code'
                    id='biometricCode'
                    placeholder='48'
                    maxLength={50}
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

                <HRMSInputText label='RF card ID' id='rfCardId' maxLength={50} {...register('rfCardId')} error={errors.rfCardId?.message} />

                {stopPension && (
                    <Controller
                        name='dateOfStopPension'
                        control={control}
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label='Date of Stop Pension'
                                placeholder='Pick date of stop pension'
                            />
                        )}
                    />
                )}

                <HRMSInputText
                    label='MS Teams UserName'
                    id='msTeamsUserName'
                    placeholder='STCSAdmin'
                    maxLength={100}
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

                <HRMSInputText
                    label='MS Teams Password'
                    id='msTeamsPassword'
                    type='password'
                    maxLength={255}
                    {...register('msTeamsPassword')}
                    error={errors.msTeamsPassword?.message}
                />
            </div>

            {employeeLeft && (
                <div className='rounded-lg border bg-muted/50 p-4'>
                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                        <Controller
                            name='lastWorkingDay'
                            control={control}
                            render={({ field, fieldState }) => (
                                <DateField
                                    field={field}
                                    fieldState={fieldState}
                                    label='Last Working day'
                                    placeholder='Pick last working day'
                                />
                            )}
                        />

                        <div className='space-y-2 lg:col-span-2'>
                            <Label>Reason for Leaving</Label>
                            <textarea
                                id='reasonForLeaving'
                                maxLength={50}
                                {...register('reasonForLeaving')}
                                className={cn(
                                    'min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                    errors.reasonForLeaving
                                        ? 'border-destructive focus-visible:ring-destructive'
                                        : 'border-input focus-visible:ring-ring'
                                )}
                                placeholder='Enter reason for leaving...'
                            />
                            {errors.reasonForLeaving && (
                                <div className='font-medium text-[0.8rem] text-destructive'>{errors.reasonForLeaving.message}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}
