'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { visitorAppointmentSchema, VisitorAppointmentSchema } from '@/schemas/visitors-management/visitor-appointment-schema';
import { useVisitorAppointment } from '@/hooks/visitors-management/transactions/useVisitorAppointment';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DateField } from '@/components/ui/dateField';
import { Plus, Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';

interface AppointmentFormProps {
    onSuccess: () => void;
    initialData?: any;
}

export default function AppointmentForm({ onSuccess, initialData }: AppointmentFormProps) {
    const { saveAppointment, data: loadedData } = useVisitorAppointment();
    const emplist = loadedData?.emplist || [];

    const form = useForm<VisitorAppointmentSchema>({
        resolver: zodResolver(visitorAppointmentSchema),
        defaultValues: {
            visitorName: '',
            contactNo: '',
            email: '',
            fromPlace: '',
            meetingDurationHrs: 0,
            meetingDurationMins: 0,
            toMeet: '',
            staffId: undefined, // Will be number
            visitType: '',
            purpose: '',
            personsAccompanying: 0,
            entryDate: new Date(),
            fromTime: '',
            toTime: '',
            location: '',
            remarks: '',
            address: '',
            multiVisitors: [],
            documents: []
        }
    });

    const { fields: visitorFields, append: appendVisitor, remove: removeVisitor } = useFieldArray({
        control: form.control,
        name: 'multiVisitors'
    });

    const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
        control: form.control,
        name: 'documents'
    });

    // Effect to populate form when initialData exists
    useEffect(() => {
        if (initialData) {
            form.reset({
                // assuming initialData keys match schema or mapping logic here
                // Based on columns: vmaP_VisitorName etc.
                // But schema uses visitorName.
                // I need mapping logic. 
                // Let's assume initialData is VisitorAppointmentData type and map it.
                // Wait, I don't have mapping logic ready.
                // For now, I'll attempt simple mapping mapping based on typical property names
                visitorName: initialData.vmaP_VisitorName,
                contactNo: initialData.vmaP_VisitorContactNo,
                email: initialData.vmaP_VisitorEmailid,
                fromPlace: initialData.vmaP_FromPlace,
                // meetingDurationHrs: logic needed?,
                // meetingDurationMins: logic needed?,
                toMeet: initialData.vmaP_ToMeet || '',
                staffId: initialData.hrmE_Id,
                visitType: initialData.vmaP_VisitTypeFlg,
                purpose: initialData.vmaP_MeetingPurpose,
                personsAccompanying: initialData.vmaP_PersonsAccompanying,
                entryDate: initialData.vmaP_EntryDateTime ? new Date(initialData.vmaP_EntryDateTime) : new Date(),
                fromTime: initialData.vmaP_MeetingFromTime,
                toTime: initialData.vmaP_MeetingToTime,
                location: initialData.vmaP_MeetingLocation,
                remarks: initialData.vmaP_Remarks,
                address: initialData.vmaP_VisitorAddress,
                // multiVisitors: initialData.multiVisitorsList || [], // Need to map structure
                // documents: initialData.documentsList || [] // Need to map structure
            });
        }
    }, [initialData, form]);

    const onSubmit = async (data: VisitorAppointmentSchema) => {
        try {
            await saveAppointment(data);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-md">

                <h3 className="text-lg font-semibold">Appointment Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="visitorName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Visitor Name <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Visitor Name" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact No <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Mobile No" maxLength={10} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Id <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Email Id" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="fromPlace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>From Place <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter From Place" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Meeting Duration */}
                    <div className="flex gap-2 items-end">
                        <FormField
                            control={form.control}
                            name="meetingDurationHrs"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Meeting Duration (Hrs)</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="meetingDurationMins"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>(Mins)</FormLabel>
                                    <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="toMeet"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Meet <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="To Meet" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="staffId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>To Meet (Staff) <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Staff" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {emplist.map((emp) => (
                                            <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                {emp.hrmE_EmployeeFirstName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="visitType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Visit Type <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="--Select--" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Personal">Personal</SelectItem>
                                        <SelectItem value="Official">Official</SelectItem>
                                        <SelectItem value="Recruitment">Recruitment</SelectItem>
                                        <SelectItem value="Meeting">Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Purpose <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Textarea {...field} placeholder="Enter Purpose" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="personsAccompanying"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Persons Accompanying</FormLabel>
                                <FormControl><Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="entryDate"
                        render={({ field, fieldState }) => (
                            <DateField
                                field={field}
                                fieldState={fieldState}
                                label="Entry/Request Date"
                            />
                        )}
                    />

                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="fromTime"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>From Time <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="toTime"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>To Time <span className="text-red-500">*</span></FormLabel>
                                    <FormControl><Input type="time" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Input {...field} placeholder="Enter Location" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Remarks <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Textarea {...field} placeholder="Remarks" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                                <FormControl><Textarea {...field} placeholder="Full Address" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator />

                {/* Multiple Visitors */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Add Multiple Visitors</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendVisitor({ vmapvI_VisitorName: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Visitor
                        </Button>
                    </div>
                    {visitorFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded bg-slate-50 dark:bg-slate-900 relative">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => removeVisitor(index)}
                            >
                                <Trash className="w-3 h-3" />
                            </Button>
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorName`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                        <FormControl><Input {...field} placeholder="Visitor Name" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorContactNo`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact No</FormLabel>
                                        <FormControl><Input {...field} placeholder="Mobile No" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorEmailId`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input {...field} placeholder="Email" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`multiVisitors.${index}.vmapvI_VisitorAddress`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Textarea {...field} placeholder="Address" rows={2} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Documents */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Documents</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={() => appendDoc({ cfiledesc: '' })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Document
                        </Button>
                    </div>
                    {docFields.map((field, index) => (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-slate-50 dark:bg-slate-900 relative">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6"
                                onClick={() => removeDoc(index)}
                            >
                                <Trash className="w-3 h-3" />
                            </Button>
                            <FormField
                                control={form.control}
                                name={`documents.${index}.cfiledesc`}
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Input {...field} placeholder="Description" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-end">
                                <Input type="file" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center gap-4">
                    <Button type="submit" className="w-40">Save</Button>
                    <Button type="button" variant="outline" className="w-40" onClick={() => onSuccess()}>Cancel</Button>
                </div>

            </form>
        </Form>
    );
}
