'use client';

import { GenericForm } from '@/components/ui/form/generic-form';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/form/time-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEventsMapping } from '@/hooks/sports/useEventsMapping';
import { saveEventsMapping } from '@/server/sports/events-mapping';
import { EventsMappingSchema, type EventsMappingFormSchema } from '@/types/sports/events-mapping';
import { Controller, useWatch } from 'react-hook-form';

interface AddEventsMappingFormProps {
    onSuccess?: () => void;
}

export default function AddEventsMappingForm({ onSuccess }: AddEventsMappingFormProps) {
    const { dropdowns } = useEventsMapping();
    const { academicYear, eventsList, venueList, sponsorList } = dropdowns.data || {
        academicYear: [], eventsList: [], venueList: [], sponsorList: []
    };

    return (
        <GenericForm<EventsMappingFormSchema, typeof EventsMappingSchema>
            schema={EventsMappingSchema}
            initialValues={{
                ASMAY_Id: 0,
                SPCCME_Id: 0,
                SPCCMEV_Id: 0,
                SPCCE_Remarks: '',
                SPCCE_StartDate: new Date(),
                SPCCE_EndDate: new Date(),
                SPCCE_StartTime: '',
                SPCCE_EndTime: '',
                SPCCE_SponsorFlag: false,
                selectedSponsors: []
            }}
            onSubmit={async (values) => {
                await saveEventsMapping(values);
            }}
            mode='create'
            successMessage='Events Mapping saved successfully'
            errorMessage='Failed to save Events Mapping'
            onSuccess={onSuccess}
            className='space-y-4'>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {/* Academic Year */}
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Academic Year</Label>
                    <Controller
                        name='ASMAY_Id'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger className={error ? 'border-destructive' : ''}>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYear.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Event Name */}
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Event Name</Label>
                    <Controller
                        name='SPCCME_Id'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger className={error ? 'border-destructive' : ''}>
                                        <SelectValue placeholder='Select Event' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventsList.map((item) => (
                                            <SelectItem key={item.spccmE_Id} value={item.spccmE_Id.toString()}>
                                                {item.spccmE_EventName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Venue Name */}
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Venue Name</Label>
                    <Controller
                        name='SPCCMEV_Id'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <Select
                                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger className={error ? 'border-destructive' : ''}>
                                        <SelectValue placeholder='Select Venue' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venueList.map((item) => (
                                            <SelectItem key={item.spccmeV_Id} value={item.spccmeV_Id.toString()}>
                                                {item.spccmeV_EventVenue}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Start Date */}
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Start Date</Label>
                    <Controller
                        name='SPCCE_StartDate'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <DatePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                    className={error ? 'border-destructive' : ''}
                                />
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* Start Time */}
                <div className='flex flex-col gap-2'>
                    <Label>Start Time</Label>
                    <Controller
                        name='SPCCE_StartTime'
                        render={({ field }) => (
                            <TimePicker
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>

                {/* End Date */}
                <div className='flex flex-col gap-2'>
                    <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">End Date</Label>
                    <Controller
                        name='SPCCE_EndDate'
                        render={({ field, fieldState: { error } }) => (
                            <>
                                <DatePicker
                                    date={field.value}
                                    setDate={field.onChange}
                                    className={error ? 'border-destructive' : ''}
                                />
                                {error && <span className='text-xs text-destructive'>{error.message}</span>}
                            </>
                        )}
                    />
                </div>

                {/* End Time */}
                <div className='flex flex-col gap-2'>
                    <Label>End Time</Label>
                    <Controller
                        name='SPCCE_EndTime'
                        render={({ field }) => (
                            <TimePicker
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Remarks */}
            <div className='flex flex-col gap-2'>
                <Label>Remarks</Label>
                <Controller
                    name='SPCCE_Remarks'
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <Textarea {...field} className={error ? 'border-destructive' : ''} />
                            {error && <span className='text-xs text-destructive'>{error.message}</span>}
                        </>
                    )}
                />
            </div>

            {/* Sponsor Section */}
            <div className='space-y-4 rounded-md border p-4'>
                <Controller
                    name='SPCCE_SponsorFlag'
                    render={({ field }) => (
                        <div className="flex flex-row items-center space-x-3 space-y-0">
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label className='font-normal'>Sponsor Flag</Label>
                        </div>
                    )}
                />

                <SponsorListSelector sponsorList={sponsorList} />
            </div>

        </GenericForm>
    );
}

function SponsorListSelector({ sponsorList }: { sponsorList: { spccmsP_Id: number; spccmsP_SponsorName: string }[] }) {
    const { control } = useWatch({ name: 'SPCCE_SponsorFlag' }) as any; // Need to access context
    // Actually useWatch inside a component that uses useFormContext is better, but here we are inside GenericForm's context.
    // Let's create a separate component to consume the context for conditional rendering.

    return <SponsorListInternal sponsorList={sponsorList} />;
}

import { useFormContext as useRHFContext } from 'react-hook-form';
import { format } from 'date-fns';

function SponsorListInternal({ sponsorList }: { sponsorList: { spccmsP_Id: number; spccmsP_SponsorName: string }[] }) {
    const { watch, control } = useRHFContext<EventsMappingFormSchema>();
    const sponsorFlag = watch('SPCCE_SponsorFlag');

    if (!sponsorFlag) return null;

    return (
        <div className='flex flex-col gap-2'>
            <Label className="after:ml-0.5 after:text-red-500 after:content-['*']">Sponsors</Label>
            <ScrollArea className="h-[200px] w-full border rounded-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sponsorList.map((item) => (
                        <Controller
                            key={item.spccmsP_Id}
                            name="selectedSponsors"
                            control={control}
                            render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={field.value?.some(val => val.spccmsP_Id === item.spccmsP_Id)}
                                        onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            if (checked) {
                                                field.onChange([...current, { spccmsP_Id: item.spccmsP_Id }]);
                                            } else {
                                                field.onChange(current.filter(val => val.spccmsP_Id !== item.spccmsP_Id));
                                            }
                                        }}
                                    />
                                    <span className="text-sm">{item.spccmsP_SponsorName}</span>
                                </div>
                            )}
                        />
                    ))}
                </div>
            </ScrollArea>
            {/* Error message for selectedSponsors can be handled globally by the form schema refinement message or local field state if needed */}
            <Controller
                name="selectedSponsors"
                control={control}
                render={({ fieldState: { error } }) => (
                    error ? <span className='text-xs text-destructive'>{error.message}</span> : <></>
                )}
            />
        </div>
    );
}
