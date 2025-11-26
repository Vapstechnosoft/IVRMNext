'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { HRMSDateField as DateField } from '@/app/(root)/hrms/_components/hrms-date-field';
import { Label } from '@/components/ui/extension/field';
import { HRMSInputText } from '@/app/(root)/hrms/_components/hrms-input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

export function OtherDetailsTab({ control, register, errors, isSubmitting, watch, options, onClear, currentTab, onPreviousTab }: any) {
    const stopPension = watch('stopPension');
    const employeeLeft = watch('employeeLeft');

    return (
        <div className='space-y-4'>
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>OTHER DETAILS</h3>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                <div className='space-y-1.5'>
                    <HRMSInputText
                        label='Biometric Code'
                        id='biometricCode'
                        placeholder='48'
                        maxLength={50}
                        {...register('biometricCode')}
                        error={errors.biometricCode?.message}
                    />

                    <HRMSInputText label='RF card ID' id='rfCardId' maxLength={50} {...register('rfCardId')} error={errors.rfCardId?.message} />

                    <HRMSInputText
                        label='MS Teams UserName'
                        id='msTeamsUserName'
                        placeholder='STCSAdmin'
                        maxLength={100}
                        {...register('msTeamsUserName')}
                        error={errors.msTeamsUserName?.message}
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

                <div className='space-y-4'>
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
                </div>
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

                        <Controller
                            name='reasonForLeaving'
                            control={control}
                            render={({ field }) => {
                                const leavingReasons = options?.leavingReasons || [];
                                return (
                                    <div className='space-y-2 lg:col-span-2'>
                                        <Label>Reason for Leaving *</Label>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <SelectTrigger className={cn(
                                                errors.reasonForLeaving
                                                    ? 'border-destructive focus-visible:ring-destructive'
                                                    : 'border-input focus-visible:ring-ring'
                                            )}>
                                                <SelectValue placeholder='Select reason for leaving' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {leavingReasons.length === 0 ? (
                                                    <SelectItem value="no-reasons" disabled>No reasons available</SelectItem>
                                                ) : (
                                                    leavingReasons
                                                        .filter((reason: any) => {
                                                            const reasonId = reason.HRMLREA_Id || reason.id || reason.value;
                                                            return reasonId != null && reasonId !== '' && String(reasonId).trim() !== '';
                                                        })
                                                        .map((reason: any) => {
                                                            const reasonId = (reason.HRMLREA_Id || reason.id || reason.value)?.toString();
                                                            const reasonName = reason.HRMLREA_LeavingReason || reason.name || reason.label || reason.text || `Reason ${reasonId}`;
                                                            if (!reasonId || reasonId.trim() === '') return null;
                                                            return (
                                                                <SelectItem key={reasonId} value={reasonName}>
                                                                    {reasonName}
                                                                </SelectItem>
                                                            );
                                                        })
                                                        .filter(Boolean)
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.reasonForLeaving && (
                                            <div className='font-medium text-[0.8rem] text-destructive'>{errors.reasonForLeaving.message}</div>
                                        )}
                                    </div>
                                );
                            }}
                        />
                    </div>
                </div>
            )}

            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} currentTab={currentTab} onPreviousTab={onPreviousTab} />
        </div>
    );
}
