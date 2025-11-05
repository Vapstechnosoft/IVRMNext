'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { numberingSchema } from '@/schemas/admission/preadmission/academic-year';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof numberingSchema>;

interface NumberingConfigUpdateFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: any;
    initialData?: Partial<FormFields>;
}

export default function UpdateRegistrationNumberingForm({ onSuccess, className = '', initialData }: NumberingConfigUpdateFormProps) {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(numberingSchema),
        defaultValues: {
            prefix_type: 'academic',
            suffix_type: 'academic',
            prefix_with_zero: 'no',
            restart_frequency: 'never',
            ...initialData
        }
    });

    const prefixType = watch('prefix_type');
    const suffixType = watch('suffix_type');

    // ==========================================
    // ON SUBMIT: Map UI → Exact Payload
    // ==========================================
    const onSubmit = async (data: FormFields) => {
        try {
            const payload = {
                imN_Id: 0,
                imN_AutoManualFlag: 'string',
                imN_DuplicatesFlag: 'string',
                imN_StartingNo: data.suffix_starting_from?.toString() || '1',
                imN_WidthNumeric: data.prefix_numeric_width?.toString() || '2',
                imN_ZeroPrefixFlag: data.prefix_with_zero === 'yes' ? 'Y' : 'N',
                imN_PrefixAcadYearCode: data.prefix_type === 'academic',
                imN_PrefixParticular: data.prefix_type === 'particulars' ? data.prefix_particulars || '' : '',
                imN_SuffixAcadYearCode: data.suffix_type === 'academic',
                imN_SuffixParticular: data.suffix_type === 'particulars' ? data.suffix_particulars || '' : '',
                imN_RestartNumFlag: data.restart_frequency === 'yearly' ? 'Y' : 'N',
                imN_Flag: 'string',
                imN_PrefixFinYearCode: data.prefix_type === 'academic',
                imN_PrefixCalYearCode: data.prefix_type === 'academic',
                imN_SuffixFinYearCode: data.suffix_type === 'academic',
                imN_SuffixCalYearCode: data.suffix_type === 'academic'
            };

            console.log('Submitted Payload:', payload);

            // Replace with your actual API
            // await updateNumberingConfig(payload);

            toast.success('Numbering configuration updated successfully!');
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save configuration');
        }
    };

    const handleReset = () => {
        reset({
            prefix_type: 'academic',
            suffix_type: 'academic',
            prefix_with_zero: 'no',
            restart_frequency: 'never',
            ...initialData
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-8 rounded-lg border bg-white p-6 shadow-sm', className)}>
            {/* === PREFIX SECTION === */}
            <div className='space-y-4'>
                <h3 className='font-semibold text-gray-900 text-lg'>Prefix</h3>

                <div className='space-y-2'>
                    <Label>Prefix Type *</Label>
                    <Controller
                        name='prefix_type'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='academic' id='prefix-academic' />
                                    <Label htmlFor='prefix-academic' className='cursor-pointer font-normal'>
                                        Academic Year Code
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='particulars' id='prefix-particulars' />
                                    <Label htmlFor='prefix-particulars' className='cursor-pointer font-normal'>
                                        Particulars
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                {prefixType === 'particulars' && (
                    <div className='space-y-2'>
                        <Label htmlFor='prefix_particulars'>Particulars</Label>
                        <Controller
                            name='prefix_particulars'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} id='prefix_particulars' placeholder='e.g., INV, REG' className='w-full' />
                            )}
                        />
                        {errors.prefix_particulars && <FormError>{errors.prefix_particulars.message}</FormError>}
                    </div>
                )}

                <div className='space-y-2'>
                    <Label htmlFor='prefix_numeric_width'>Width of Numeric Part</Label>
                    <Controller
                        name='prefix_numeric_width'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='prefix_numeric_width'
                                type='number'
                                min='1'
                                max='10'
                                placeholder='e.g., 4'
                                className='w-full'
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                        )}
                    />
                    {errors.prefix_numeric_width && <FormError>{errors.prefix_numeric_width.message}</FormError>}
                </div>
            </div>

            {/* === SUFFIX SECTION === */}
            <div className='space-y-4 border-t pt-6'>
                <h3 className='font-semibold text-gray-900 text-lg'>Suffix</h3>

                <div className='space-y-2'>
                    <Label>Suffix Type *</Label>
                    <Controller
                        name='suffix_type'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='academic' id='suffix-academic' />
                                    <Label htmlFor='suffix-academic' className='cursor-pointer font-normal'>
                                        Academic Year Code
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='particulars' id='suffix-particulars' />
                                    <Label htmlFor='suffix-particulars' className='cursor-pointer font-normal'>
                                        Particulars
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                {suffixType === 'particulars' && (
                    <div className='space-y-2'>
                        <Label htmlFor='suffix_particulars'>Particulars</Label>
                        <Controller
                            name='suffix_particulars'
                            control={control}
                            render={({ field }) => (
                                <Input {...field} id='suffix_particulars' placeholder='e.g., FY, SEM' className='w-full' />
                            )}
                        />
                        {errors.suffix_particulars && <FormError>{errors.suffix_particulars.message}</FormError>}
                    </div>
                )}

                <div className='space-y-2'>
                    <Label htmlFor='suffix_starting_from'>SLNO Starting From</Label>
                    <Controller
                        name='suffix_starting_from'
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id='suffix_starting_from'
                                type='number'
                                min='1'
                                placeholder='e.g., 1'
                                className='w-full'
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                        )}
                    />
                    {errors.suffix_starting_from && <FormError>{errors.suffix_starting_from.message}</FormError>}
                </div>
            </div>

            {/* === OTHER SETTINGS === */}
            <div className='space-y-6 border-t pt-6'>
                <div className='space-y-2'>
                    <Label>Prefix with Zero</Label>
                    <Controller
                        name='prefix_with_zero'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='yes' id='prefix-zero-yes' />
                                    <Label htmlFor='prefix-zero-yes' className='cursor-pointer font-normal'>
                                        Yes
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='no' id='prefix-zero-no' />
                                    <Label htmlFor='prefix-zero-no' className='cursor-pointer font-normal'>
                                        No
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                <div className='space-y-2'>
                    <Label>Restart Numbering Frequency</Label>
                    <Controller
                        name='restart_frequency'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='never' id='restart-never' />
                                    <Label htmlFor='restart-never' className='cursor-pointer font-normal'>
                                        Never
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='yearly' id='restart-yearly' />
                                    <Label htmlFor='restart-yearly' className='cursor-pointer font-normal'>
                                        Yearly
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>
            </div>

            {/* === ACTION BUTTONS === */}
            <div className='flex justify-end gap-3 border-t pt-6'>
                <Button type='button' variant='outline' onClick={handleReset} disabled={isSubmitting}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    );
}
