'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { eventSponsorSchema } from '@/schemas/sports/transactions/events-sponsor';
import { saveEventsSponsorMapping } from '@/server/sports/transactions/events-sponsor';
import { useMasterPrograms } from '@/hooks/sports/useMasterPrograms';
import { useMasterSponsors } from '@/hooks/sports/useMasterSponsors';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

interface AddEventSponsorMappingFormProps {
    onSuccess?: () => void;
}

export default function AddEventSponsorMappingForm({ onSuccess }: AddEventSponsorMappingFormProps) {
    const { data: programsResponse, isLoading: programsLoading } = useMasterPrograms({ page_size: 100 });
    const { data: sponsorsResponse, isLoading: sponsorsLoading } = useMasterSponsors({ page_size: 100 });

    const programs = programsResponse?.data || [];
    const sponsors = sponsorsResponse?.data || [];

    return (
        <GenericForm<IEventSponsorMapping, (typeof eventSponsorSchema)['addOrUpdate']>
            schema={eventSponsorSchema.addOrUpdate}
            initialValues={{
                spccesP_Id: 0,
                mI_Id: 1,
                spccE_Id: 0,
                spccmsP_Id: 0,
                spccesP_ActiveFlag: true
            }}
            onSubmit={async (values) => {
                await saveEventsSponsorMapping(values);
            }}
            mode='create'
            successMessage='Mapping saved successfully'
            errorMessage='Failed to save mapping'
            onSuccess={onSuccess}
            className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Program Name</Label>
                    <Controller
                        name='spccE_Id'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger className={error ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={programsLoading ? 'Loading...' : 'Select Program'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {programs.map((prog) => (
                                            <SelectItem key={prog.spccpM_Id} value={prog.spccpM_Id.toString()}>
                                                {prog.spccpM_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Sponsor Name</Label>
                    <Controller
                        name='spccmsP_Id'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger className={error ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={sponsorsLoading ? 'Loading...' : 'Select Sponsor'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sponsors.map((spon) => (
                                            <SelectItem key={spon.spccmsP_Id} value={spon.spccmsP_Id.toString()}>
                                                {spon.spccmsP_SponsorName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>
            </div>
        </GenericForm>
    );
}
