'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffRequestSchema, StaffRequestValues } from '@/schemas/hostel/transactions/hostel-requests.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomSelect } from '@/components/ui/form/custom-select';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getStaffRequestLoadData, saveStaffRequest } from '@/server/hostel/transactions/staff-request-actions';
import { format } from 'date-fns';

export default function StaffRequestForm({
    onSaveSuccess,
    editData
}: {
    onSaveSuccess: () => void,
    editData?: any
}) {
    const [loading, setLoading] = useState(false);
    const [hostels, setHostels] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [staffProfile, setStaffProfile] = useState<any>(null);

    const form = useForm<StaffRequestValues>({
        resolver: zodResolver(staffRequestSchema),
        defaultValues: {
            HLHSTREQ_Id: 0,
            HLHSTREQ_RequestDate: new Date(),
            HLHSTREQ_ACRoomFlg: false,
            HLHSTREQ_SingleRoomFlg: false,
            HLHSTREQ_VegMessFlg: false,
            HLHSTREQ_NonVegMessFlg: false,
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editData) {
            form.reset({
                HLHSTREQ_Id: editData.HLHSTREQ_Id,
                HLHSTREQ_RequestDate: new Date(editData.HLHSTREQ_RequestDate),
                HLMH_Id: editData.HLMH_Id.toString(),
                HLMRCA_Id: editData.HLMRCA_Id.toString(),
                HLHSTREQ_ACRoomFlg: editData.HLHSTREQ_ACRoomFlg,
                HLHSTREQ_SingleRoomFlg: editData.HLHSTREQ_SingleRoomFlg,
                HLHSTREQ_VegMessFlg: editData.HLHSTREQ_VegMessFlg,
                HLHSTREQ_NonVegMessFlg: editData.HLHSTREQ_NonVegMessFlg,
                HLHSTREQ_Remarks: editData.HLHSTREQ_Remarks || '',
            });
        }
    }, [editData]);

    async function loadData() {
        const data = await getStaffRequestLoadData();
        if (data) {
            setHostels(data.hostel_list || []);
            setCategories(data.room_list || []);
            if (data.staff_wisedata?.length > 0) {
                setStaffProfile(data.staff_wisedata[0]);
            }
        }
    }

    async function onSubmit(values: StaffRequestValues) {
        setLoading(true);
        const payload = {
            ...values,
            HLHSTREQ_RequestDate: format(values.HLHSTREQ_RequestDate, 'yyyy-MM-dd'),
            HLMH_Id: parseInt(values.HLMH_Id),
            HLMRCA_Id: parseInt(values.HLMRCA_Id),
        };

        const result = await saveStaffRequest(payload);
        if (result?.msg === 'Saved' || result?.msg === 'Updated') {
            toast.success(result.msg === 'Saved' ? "Request submitted!" : "Request updated!");
            onSaveSuccess();
            form.reset();
        } else {
            toast.error(result?.msg || "Failed to save request");
        }
        setLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hostel Staff Request</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
                    <p><strong>Name:</strong> {staffProfile?.empName || '-'}</p>
                    <p><strong>Dept:</strong> {staffProfile?.HRMD_DepartmentName || '-'}</p>
                    <p><strong>Code:</strong> {staffProfile?.HRME_EmployeeCode || '-'}</p>
                    <p><strong>Desig:</strong> {staffProfile?.HRMDES_DesignationName || '-'}</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="HLMH_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hostel</FormLabel>
                                        <FormControl>
                                            <CustomSelect
                                                options={hostels.map(h => ({ label: h.hlmH_Name, value: h.hlmH_Id.toString() }))}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="HLMRCA_Id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Category</FormLabel>
                                        <FormControl>
                                            <CustomSelect
                                                options={categories.map(c => ({ label: c.hlmrcA_RoomCategory, value: c.hlmrcA_Id.toString() }))}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="HLHSTREQ_RequestDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Request Date</FormLabel>
                                        <FormControl>
                                            <DatePicker date={field.value} setDate={field.onChange} disabled />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-2 pt-8">
                                <FormField
                                    control={form.control}
                                    name="HLHSTREQ_VegMessFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Veg Mess</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSTREQ_NonVegMessFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Non-Veg Mess</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSTREQ_ACRoomFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>AC Room</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSTREQ_SingleRoomFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Single Room</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="HLHSTREQ_Remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>Cancel</Button>
                            <Button type="submit" disabled={loading}>Submit Request</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
