import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NdaStudentProfileUpdateFields } from '@/schemas/admission/nda-student-profile-update';

interface AddressFieldsProps {
    control: Control<NdaStudentProfileUpdateFields>;
    type: 'Res' | 'Per';
    countries: any[];
    states: any[];
    onCountryChange?: (countryId: number | string) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ 
    control, 
    type, 
    countries, 
    states,
    onCountryChange 
}) => {
    const isResidential = type === 'Res';
    const streetKey = isResidential ? 'Resstreet' : 'Perstreett';
    const areaKey = isResidential ? 'ResArea' : 'PerArea';
    const cityKey = isResidential ? 'Rescity' : 'Percity';
    const countryKey = isResidential ? 'Rescountry' : 'Rescountry'; // Both use Rescountry in legacy?
    const stateKey = isResidential ? 'Resstate' : 'PerState';
    const pinKey = isResidential ? 'ResPincode' : 'PerPincode';

    return (
        <div className="space-y-4 p-4 rounded-xl bg-background/50 border border-primary/10 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-primary/80 border-b border-primary/10 pb-2">
                {isResidential ? 'Residential Address' : 'Permanent Address'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Street</Label>
                    <Controller
                        name={streetKey as any}
                        control={control}
                        render={({ field }) => (
                            <InputText {...field} placeholder="Enter Street" className="w-full" />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Area</Label>
                    <Controller
                        name={areaKey as any}
                        control={control}
                        render={({ field }) => (
                            <InputText {...field} placeholder="Enter Area" className="w-full" />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label>City</Label>
                    <Controller
                        name={cityKey as any}
                        control={control}
                        render={({ field }) => (
                            <InputText {...field} placeholder="Enter City" className="w-full" />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Country</Label>
                    <Controller
                        name={countryKey as any}
                        control={control}
                        render={({ field }) => (
                            <Select 
                                value={field.value?.toString()} 
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    if (onCountryChange) onCountryChange(val);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select Country</SelectItem>
                                    {countries.map((c) => (
                                        <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                            {c.ivrmmC_CountryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label>State</Label>
                    <Controller
                        name={stateKey as any}
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value?.toString()} onValueChange={field.onChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Select State</SelectItem>
                                    {states.map((s) => (
                                        <SelectItem key={s.ivrmmS_Id} value={s.ivrmmS_Id.toString()}>
                                            {s.ivrmmS_Name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Controller
                        name={pinKey as any}
                        control={control}
                        render={({ field }) => (
                            <InputText {...field} placeholder="Pincode" className="w-full" />
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
