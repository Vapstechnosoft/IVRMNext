'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { masterLocationSchema, MasterLocationSchema } from '@/schemas/visitors-management/master-location-schema';
import { useMasterLocation } from '@/hooks/visitors-management/masters/useMasterLocation';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LocationFormProps {
    onSuccess: () => void;
    initialData?: any;
}

export default function LocationForm({ onSuccess, initialData }: LocationFormProps) {
    const { saveLocation } = useMasterLocation();

    const form = useForm<MasterLocationSchema>({
        resolver: zodResolver(masterLocationSchema),
        defaultValues: {
            locationName: '',
            locationDescription: '',
            locationFacilities: ''
        }
    });

    const onSubmit = async (data: MasterLocationSchema) => {
        try {
            await saveLocation(data);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="locationName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Location Name" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="locationDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Description <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Textarea {...field} placeholder="Description" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="locationFacilities"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location Facilities <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Textarea {...field} placeholder="Facilities" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-center gap-4">
                    <Button type="submit" className="w-40">Save</Button>
                    <Button type="button" variant="outline" className="w-40" onClick={() => onSuccess()}>Cancel</Button>
                </div>

            </form>
        </Form>
    );
}
