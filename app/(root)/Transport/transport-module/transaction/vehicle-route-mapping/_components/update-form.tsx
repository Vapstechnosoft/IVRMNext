'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouteDropDown, useSessionDropDown, useVehicleDropDown, useVehicleRouteMapping } from '@/hooks/transport/transportmodule/usetransaction';
import { cn } from '@/lib/utils';
import { vehicleRouteMappingSchema } from '@/schemas/transport/transaction';
import { saveVehicleRouteMapping } from '@/server/transport/transport-module/transaction/vehicle-route-mapping';
import type { IVehicleRouteMapping } from '@/types/transport/transport-module/transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UpdateFormProps {
    onClose: () => void;
    selectedRow: IVehicleRouteMapping;
}

const formSchema = vehicleRouteMappingSchema.addOrUpdate;

export default function UpdateForm({ onClose, selectedRow: row }: UpdateFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { refetchAll } = useVehicleRouteMapping();

    const { data: vehicleData } = useVehicleDropDown();
    const { data: routeData } = useRouteDropDown();
    const { data: sessionData } = useSessionDropDown();

    const vehicles = Array.isArray(vehicleData) ? vehicleData : vehicleData?.data || [];
    const routes = Array.isArray(routeData) ? routeData : routeData?.data || [];
    const sessions = Array.isArray(sessionData) ? sessionData : sessionData?.data || [];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            trvR_Id: row?.trvR_Id,
            trmV_Id: row?.trmV_Id || 0,
            trmR_Id: row?.trmR_Id || 0,
            trmS_Id: row?.trmS_Id || 0,
            trmS_Flag: row?.trmS_Flag || 'PickUp',
            trvR_Date: row?.trvR_Date ? new Date(row.trvR_Date).toISOString() : new Date().toISOString(),
            trmV_VehicleNo: row?.trmV_VehicleNo,
            trmR_RouteName: row?.trmR_RouteName,
            trmS_SessionName: row?.trmS_SessionName,
        }
    });

    const { reset } = form;

    useEffect(() => {
        if (row) {
            let flagValue = row.trmS_Flag;
            // Normalize flag value if backend sends variations
            if (flagValue === 'Pick Up' || flagValue === 'Pickup') flagValue = 'PickUp';

            reset({
                trvR_Id: row.trvR_Id,
                trmV_Id: row.trmV_Id,
                trmR_Id: row.trmR_Id,
                trmS_Id: row.trmS_Id,
                trmS_Flag: flagValue || 'PickUp',
                trvR_Date: row.trvR_Date ? new Date(row.trvR_Date).toString() !== 'Invalid Date' ? row.trvR_Date : new Date().toISOString() : new Date().toISOString(),
                trmV_VehicleNo: row.trmV_VehicleNo,
                trmR_RouteName: row.trmR_RouteName,
                trmS_SessionName: row.trmS_SessionName,
            });
        }
    }, [row, reset]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const payload = {
                trmV_Id: values.trmV_Id,
                trmR_Id: values.trmR_Id,
                trmS_Id: values.trmS_Id,
                trmS_Flag: values.trmS_Flag,
                trvR_Date: values.trvR_Date,
                trvR_Id: values.trvR_Id,
            };

            const response = await saveVehicleRouteMapping(payload);
            if (response.success) {
                toast.success(response.message);
                refetchAll();
                onClose();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Vehicle */}
                    <FormField
                        control={form.control}
                        name='trmV_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle <span className='text-destructive'>*</span></FormLabel>
                                <Select
                                    key={field.value}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Vehicle' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vehicles.map((item: any) => (
                                            <SelectItem key={item.trmV_Id} value={String(item.trmV_Id)}>
                                                {item.trmV_VehicleNo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Route */}
                    <FormField
                        control={form.control}
                        name='trmR_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Route Name <span className='text-destructive'>*</span></FormLabel>
                                <Select
                                    key={field.value}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Route' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {routes.map((item: any) => (
                                            <SelectItem key={item.trmR_Id} value={String(item.trmR_Id)}>
                                                {item.trmR_RouteName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name='trvR_Date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>Date <span className='text-destructive'>*</span></FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value && new Date(field.value).toString() !== 'Invalid Date' ? (
                                                    <span>{new Date(field.value).toLocaleDateString()}</span>
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => field.onChange(date?.toISOString())}
                                            disabled={(date) =>
                                                date < new Date('1900-01-01')
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Session */}
                    <FormField
                        control={form.control}
                        name='trmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Session Name <span className='text-destructive'>*</span></FormLabel>
                                <Select
                                    key={field.value}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Session' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sessions.map((item: any) => (
                                            <SelectItem key={item.trmS_Id} value={String(item.trmS_Id)}>
                                                {item.trmS_SessionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Pickup/Drop Flag */}
                    <FormField
                        control={form.control}
                        name='trmS_Flag'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>PickUp / Drop</FormLabel>
                                <Select
                                    key={field.value}
                                    onValueChange={field.onChange}
                                    value={field.value || 'PickUp'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Flag" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="PickUp">PickUp</SelectItem>
                                        <SelectItem value="Drop">Drop</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <div className='flex justify-end space-x-2'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isLoading}>
                        {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        <Save className='mr-2 h-4 w-4' />
                        Update
                    </Button>
                </div>
            </form>
        </Form>
    );
}
