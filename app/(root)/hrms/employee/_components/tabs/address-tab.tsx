'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

// Safe SelectItem wrapper that prevents empty string values - ABSOLUTE PROTECTION
const SafeSelectItem = ({ value, children, ...props }: { value: any; children: React.ReactNode; [key: string]: any }) => {
    // ABSOLUTE CHECK: If value is null, undefined, or empty string, don't render
    if (value == null || value === undefined || value === '') {
        console.error('🔴 [SafeSelectItem - address-tab] EMPTY VALUE DETECTED:', {
            value,
            valueType: typeof value,
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // Convert to string
    const strValue = String(value);

    // ABSOLUTE CHECK: If string is empty or only whitespace, don't render
    if (strValue === '' || strValue.trim() === '' || strValue.length === 0) {
        console.error('🔴 [SafeSelectItem - address-tab] EMPTY STRING DETECTED:', {
            originalValue: value,
            strValue,
            strValueLength: strValue.length,
            trimmed: strValue.trim(),
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    const trimmedValue = strValue.trim();

    // FINAL ABSOLUTE CHECK: If trimmed is empty, don't render
    if (trimmedValue === '' || trimmedValue.length === 0) {
        console.error('🔴 [SafeSelectItem - address-tab] EMPTY TRIMMED VALUE DETECTED:', {
            originalValue: value,
            strValue,
            trimmedValue,
            trimmedLength: trimmedValue.length,
            props: Object.keys(props),
            children: typeof children === 'string' ? children : 'ReactNode',
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // FINAL FINAL CHECK: Double-check trimmedValue is not empty before rendering
    if (!trimmedValue || trimmedValue === '' || trimmedValue.length === 0) {
        console.error('🔴 [SafeSelectItem - address-tab] FINAL CHECK FAILED - trimmedValue is empty:', {
            originalValue: value,
            strValue,
            trimmedValue,
            trimmedLength: trimmedValue?.length,
            stack: new Error().stack?.split('\n').slice(0, 5).join('\n')
        });
        return null;
    }

    // Only render if we have a valid non-empty string
    return (
        <SelectItem {...props} value={trimmedValue}>
            {children}
        </SelectItem>
    );
};

// Helper function to ensure SelectItem value is never empty string
const ensureNonEmptyValue = (value: any, fallback: any = null): string | null => {
    // Handle null/undefined
    if (value == null || value === undefined) {
        if (fallback != null && fallback !== undefined) {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Handle empty string explicitly
    if (value === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Convert to string
    const str = String(value);

    // Check if empty or whitespace
    if (str === '' || str.trim() === '') {
        if (fallback != null && fallback !== undefined && fallback !== '') {
            const fallbackStr = String(fallback);
            if (fallbackStr.trim() !== '' && fallbackStr !== '') {
                return fallbackStr;
            }
        }
        return null;
    }

    // Final check - ensure it's not empty
    const trimmed = str.trim();
    if (trimmed === '' || trimmed.length === 0) {
        return null;
    }

    return trimmed;
};

interface AddressTabProps {
    control: any;
    register: any;
    errors: any;
    isSubmitting: boolean;
    watch: any;
    setValue: any;
    countries?: any[];
    states?: any[];
    onClear?: () => void;
}

export function AddressTab({
    control,
    register,
    errors,
    isSubmitting,
    watch,
    setValue,
    countries = [],
    states = [],
    onClear
}: AddressTabProps) {
    const sameAsCommunicationAddress = watch('sameAsCommunicationAddress');

    // Watch communication address fields
    const contactAddress = watch('contactAddress');
    const contactArea = watch('contactArea');
    const contactCountry = watch('contactCountry');
    const contactState = watch('contactState');
    const contactCity = watch('contactCity');
    const contactPincode = watch('contactPincode');

    // Watch permanent address country for state filtering
    const permanentCountry = watch('permanentCountry');

    // Copy communication address to permanent address when checkbox is checked
    React.useEffect(() => {
        if (sameAsCommunicationAddress) {
            // Copy communication address to permanent address
            setValue('permanentAddress', contactAddress || '');
            setValue('permanentArea', contactArea || '');
            setValue('permanentCountry', contactCountry || '');
            setValue('permanentState', contactState || '');
            setValue('permanentCity', contactCity || '');
            setValue('permanentPincode', contactPincode || '');
        }
    }, [sameAsCommunicationAddress]); // Only depend on checkbox state, not communication address fields

    // Log when country changes to help debug state loading
    React.useEffect(() => {
        // Country change handled by state loading logic
        if (contactCountry) {
            // State loading logic handled elsewhere
        }
    }, [contactCountry, states.length]);

    React.useEffect(() => {
        // Country change handled by state loading logic
        if (permanentCountry) {
            // State loading logic handled elsewhere
        }
    }, [permanentCountry, states.length]);
    return (
        <div className='space-y-6'>
            {/* Contact Address */}
            <div className='space-y-4'>
                <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                    <h3 className='font-semibold'>Contact Address:</h3>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    <InputText label='Address' id='contactAddress' {...register('contactAddress')} error={errors.contactAddress?.message} />
                    <InputText label='Area' id='contactArea' {...register('contactArea')} error={errors.contactArea?.message} />
                    <div className='flex flex-col gap-4 lg:flex-row lg:gap-4'>
                        <div className='flex-1 space-y-2'>
                            <Controller
                                name='contactCountry'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Label>Country</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Country' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter((country: any, index: number) => {
                                                        const countryId =
                                                            country.IVRMMC_Id ?? country.IVRMMCO_Id ?? country.value ?? country.id ?? index;
                                                        return countryId != null && countryId !== '' && String(countryId).trim() !== '';
                                                    })
                                                    .map((country: any, index: number) => {
                                                        const countryIdRaw =
                                                            country.IVRMMC_Id ?? country.IVRMMCO_Id ?? country.value ?? country.id ?? index;
                                                        const countryIdStr = ensureNonEmptyValue(countryIdRaw, index);
                                                        // Ensure value is never empty string
                                                        if (!countryIdStr || countryIdStr.trim() === '' || countryIdStr === '') return null;
                                                        const finalCountryId = String(countryIdStr).trim();
                                                        if (finalCountryId === '') return null;
                                                        const countryName =
                                                            country.IVRMMC_CountryName ||
                                                            country.IVRMMCO_CountryName ||
                                                            country.label ||
                                                            country.name ||
                                                            `Country ${countryIdRaw}`;
                                                        return (
                                                            <SafeSelectItem key={countryIdRaw} value={finalCountryId}>
                                                                {countryName}
                                                            </SafeSelectItem>
                                                        );
                                                    })
                                                    .filter(Boolean)}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                            />
                        </div>
                        <div className='flex-1 space-y-2'>
                            <Controller
                                name='contactState'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Label>State</Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select State' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {states
                                                    .filter((state: any, index: number) => {
                                                        const stateId = state.IVRMMS_Id || state.value || state.id || index;
                                                        return stateId != null && stateId !== '' && String(stateId).trim() !== '';
                                                    })
                                                    .map((state: any, index: number) => {
                                                        const stateId = state.IVRMMS_Id ?? state.value ?? state.id ?? index;
                                                        const stateIdStr = ensureNonEmptyValue(stateId, index);
                                                        // Ensure value is never empty string
                                                        if (!stateIdStr || stateIdStr.trim() === '' || stateIdStr === '') return null;
                                                        const finalStateId = String(stateIdStr).trim();
                                                        if (finalStateId === '') return null;
                                                        const stateName =
                                                            state.IVRMMS_Name || state.label || state.name || `State ${stateId}`;
                                                        return (
                                                            <SafeSelectItem key={stateId} value={finalStateId}>
                                                                {stateName}
                                                            </SafeSelectItem>
                                                        );
                                                    })
                                                    .filter(Boolean)}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 lg:flex-row lg:gap-4'>
                        <div className='flex-1 space-y-2'>
                            <InputText label='City' id='contactCity' {...register('contactCity')} error={errors.contactCity?.message} />
                        </div>
                        <div className='flex-1 space-y-2'>
                            <InputText
                                label='Pincode'
                                id='contactPincode'
                                {...register('contactPincode')}
                                error={errors.contactPincode?.message}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Permanent Address */}
            <div className='space-y-4'>
                <div className='rounded-md bg-primary px-4 py-2 text-primary-foreground'>
                    <h3 className='font-semibold'>Permanent Address:</h3>
                </div>
                <div className='mb-4 flex items-center space-x-2'>
                    <Checkbox
                        id='sameAsCommunicationAddress'
                        checked={sameAsCommunicationAddress || false}
                        onCheckedChange={(checked) => {
                            setValue('sameAsCommunicationAddress', !!checked);
                        }}
                    />
                    <Label htmlFor='sameAsCommunicationAddress'>Same As Communication Address</Label>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    <InputText
                        label='Address'
                        id='permanentAddress'
                        {...register('permanentAddress')}
                        error={errors.permanentAddress?.message}
                        disabled={sameAsCommunicationAddress}
                    />
                    <InputText
                        label='Area'
                        id='permanentArea'
                        {...register('permanentArea')}
                        error={errors.permanentArea?.message}
                        disabled={sameAsCommunicationAddress}
                    />
                    <div className='flex flex-col gap-4 lg:flex-row lg:gap-4'>
                        <div className='flex-1 space-y-2'>
                            <Controller
                                name='permanentCountry'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Label>Country</Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={sameAsCommunicationAddress}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Country' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries
                                                    .filter((country: any, index: number) => {
                                                        const countryId =
                                                            country.IVRMMC_Id ?? country.IVRMMCO_Id ?? country.value ?? country.id ?? index;
                                                        return countryId != null && countryId !== '' && String(countryId).trim() !== '';
                                                    })
                                                    .map((country: any, index: number) => {
                                                        const countryIdRaw =
                                                            country.IVRMMC_Id ?? country.IVRMMCO_Id ?? country.value ?? country.id ?? index;
                                                        const countryIdStr = ensureNonEmptyValue(countryIdRaw, index);
                                                        // Ensure value is never empty string
                                                        if (!countryIdStr || countryIdStr.trim() === '' || countryIdStr === '') return null;
                                                        const finalCountryId = String(countryIdStr).trim();
                                                        if (finalCountryId === '') return null;
                                                        const countryName =
                                                            country.IVRMMC_CountryName ||
                                                            country.IVRMMCO_CountryName ||
                                                            country.label ||
                                                            country.name ||
                                                            `Country ${countryIdRaw}`;
                                                        return (
                                                            <SafeSelectItem key={countryIdRaw} value={finalCountryId}>
                                                                {countryName}
                                                            </SafeSelectItem>
                                                        );
                                                    })
                                                    .filter(Boolean)}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                            />
                        </div>
                        <div className='flex-1 space-y-2'>
                            <Controller
                                name='permanentState'
                                control={control}
                                render={({ field }) => (
                                    <>
                                        <Label>State</Label>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={sameAsCommunicationAddress}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select State' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {states
                                                    .filter((state: any, index: number) => {
                                                        const stateId = state.IVRMMS_Id || state.value || state.id || index;
                                                        return stateId != null && stateId !== '' && String(stateId).trim() !== '';
                                                    })
                                                    .map((state: any, index: number) => {
                                                        const stateId = state.IVRMMS_Id ?? state.value ?? state.id ?? index;
                                                        const stateIdStr = ensureNonEmptyValue(stateId, index);
                                                        // Ensure value is never empty string
                                                        if (!stateIdStr || stateIdStr.trim() === '' || stateIdStr === '') return null;
                                                        const finalStateId = String(stateIdStr).trim();
                                                        if (finalStateId === '') return null;
                                                        const stateName =
                                                            state.IVRMMS_Name || state.label || state.name || `State ${stateId}`;
                                                        return (
                                                            <SafeSelectItem key={stateId} value={finalStateId}>
                                                                {stateName}
                                                            </SafeSelectItem>
                                                        );
                                                    })
                                                    .filter(Boolean)}
                                            </SelectContent>
                                        </Select>
                                    </>
                                )}
                            />
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 lg:flex-row lg:gap-4'>
                        <div className='flex-1 space-y-2'>
                            <InputText
                                label='City'
                                id='permanentCity'
                                {...register('permanentCity')}
                                error={errors.permanentCity?.message}
                                disabled={sameAsCommunicationAddress}
                            />
                        </div>
                        <div className='flex-1 space-y-2'>
                            <InputText
                                label='Pincode'
                                id='permanentPincode'
                                {...register('permanentPincode')}
                                error={errors.permanentPincode?.message}
                                disabled={sameAsCommunicationAddress}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <StandardTabActions errors={errors} isSubmitting={isSubmitting} onClear={onClear} />
        </div>
    );
}

// Experience Tab Component
