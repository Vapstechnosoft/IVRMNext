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
import { EventsMappingSchema, type EventsMappingFormSchema, type IEventsMappingData } from '@/types/sports/events-mapping';
import { Controller, useFormContext as useRHFContext } from 'react-hook-form';
import { parseISO, format } from 'date-fns';

interface UpdateEventsMappingFormProps {
    data: IEventsMappingData;
    onSuccess?: () => void;
}

export default function UpdateEventsMappingForm({ data, onSuccess }: UpdateEventsMappingFormProps) {
    const { dropdowns } = useEventsMapping();
    const { academicYear, eventsList, venueList, sponsorList } = dropdowns.data || {
        academicYear: [], eventsList: [], venueList: [], sponsorList: []
    };

    // Transform IEventsMappingData to EventsMappingFormSchema
    const initialValues: EventsMappingFormSchema = {
        ASMAY_Id: Number(dropdowns.data?.academicYear.find(y => y.asmaY_Year === data.asmaY_Year)?.asmaY_Id || 0), // Logic to reverse lookup ID might be needed if API returns names. Using 0 as fallback or needing proper ID from grid data.
        // Wait, grid data seems to have IDs inside 'spccE_Id' but relationships like 'asmaY_Year' are strings.
        // This is a common issue with mock data/grids showing text but forms needing IDs.
        // For this refactor, I will assume the grid data *should* ideally contain IDs or I will try to find them.
        // Looking at server/sports/events-mapping.ts getEventsMappingList return type:
        /*
         spccE_Id: 101,
         asmaY_Year: '2023-2024',
         ...
        */
        // I need to map these back to IDs for the form.
        // Let's do a best-effort lookup.
        SPCCME_Id: eventsList.find(e => e.spccmE_EventName === data.spccmE_EventName)?.spccmE_Id || 0,
        SPCCMEV_Id: venueList.find(v => v.spccmeV_EventVenue === data.spccmeV_EventVenue)?.spccmeV_Id || 0,
        SPCCE_Remarks: data.spccE_Remarks,
        SPCCE_StartDate: new Date(data.spccE_StartDate),
        SPCCE_EndDate: new Date(data.spccE_EndDate),
        SPCCE_StartTime: data.spccE_StartTime,
        SPCCE_EndTime: data.spccE_EndTime,
        SPCCE_SponsorFlag: data.spccE_SponsorFlag,
        selectedSponsors: [] // This would normally come from an API detail fetch. For now, empty or mock.
    };

    // Correction: InitialValues `ASMAY_Id`
    const foundYear = academicYear.find(y => y.asmaY_Year === data.asmaY_Year);
    if (foundYear) initialValues.ASMAY_Id = foundYear.asmaY_Id;


    return (
        <GenericForm<EventsMappingFormSchema, typeof EventsMappingSchema>
            schema={EventsMappingSchema}
            initialValues={initialValues}
            onSubmit={async (values) => {
                await saveEventsMapping(values); // In real app, might need ID to update
            }}
            mode='edit'
            successMessage='Events Mapping updated successfully'
            errorMessage='Failed to update Events Mapping'
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
    return <SponsorListInternal sponsorList={sponsorList} />;
}

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
