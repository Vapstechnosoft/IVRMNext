'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React from 'react';
import { Controller } from 'react-hook-form';
import { StandardTabActions } from './standard-tab-actions';

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

export function AddressTab({ control, register, errors, isSubmitting, watch, setValue, countries = [], states = [], onClear }: AddressTabProps) {
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
                                                {countries.map((country: any, index: number) => {
                                                    const countryId =
                                                        country.IVRMMC_Id || country.IVRMMCO_Id || country.value || country.id || index;
                                                    const countryName =
                                                        country.IVRMMC_CountryName ||
                                                        country.IVRMMCO_CountryName ||
                                                        country.label ||
                                                        country.name ||
                                                        `Country ${countryId}`;
                                                    return (
                                                        <SelectItem key={countryId} value={countryId.toString()}>
                                                            {countryName}
                                                        </SelectItem>
                                                    );
                                                })}
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
                                                {states.map((state: any, index: number) => {
                                                    const stateId = state.IVRMMS_Id || state.value || state.id || index;
                                                    const stateName = state.IVRMMS_Name || state.label || state.name || `State ${stateId}`;
                                                    return (
                                                        <SelectItem key={stateId} value={stateId.toString()}>
                                                            {stateName}
                                                        </SelectItem>
                                                    );
                                                })}
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
                                                {countries.map((country: any, index: number) => {
                                                    const countryId =
                                                        country.IVRMMC_Id || country.IVRMMCO_Id || country.value || country.id || index;
                                                    const countryName =
                                                        country.IVRMMC_CountryName ||
                                                        country.IVRMMCO_CountryName ||
                                                        country.label ||
                                                        country.name ||
                                                        `Country ${countryId}`;
                                                    return (
                                                        <SelectItem key={countryId} value={countryId.toString()}>
                                                            {countryName}
                                                        </SelectItem>
                                                    );
                                                })}
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
                                                {states.map((state: any, index: number) => {
                                                    const stateId = state.IVRMMS_Id || state.value || state.id || index;
                                                    const stateName = state.IVRMMS_Name || state.label || state.name || `State ${stateId}`;
                                                    return (
                                                        <SelectItem key={stateId} value={stateId.toString()}>
                                                            {stateName}
                                                        </SelectItem>
                                                    );
                                                })}
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
