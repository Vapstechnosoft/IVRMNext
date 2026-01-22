'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRequestSchema, StudentRequestValues } from '@/schemas/hostel/transactions/hostel-requests.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomSelect } from '@/components/ui/form/custom-select';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getStudentRequestLoadData, saveStudentRequest } from '@/server/hostel/transactions/student-request-actions';
import { format } from 'date-fns';

export default function StudentRequestForm({
    onSaveSuccess,
    editData
}: {
    onSaveSuccess: () => void,
    editData?: any
}) {
    const [loading, setLoading] = useState(false);
    const [hostels, setHostels] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [studentProfile, setStudentProfile] = useState<any>(null);

    const form = useForm<StudentRequestValues>({
        resolver: zodResolver(studentRequestSchema),
        defaultValues: {
            HLHSREQ_Id: 0,
            HLHSREQ_RequestDate: new Date(),
            HLHSREQ_ACRoomFlg: false,
            HLHSREQ_SingleRoomFlg: false,
            HLHSREQ_VegMessFlg: false,
            HLHSREQ_NonVegMessFlg: false,
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (editData) {
            form.reset({
                HLHSREQ_Id: editData.HLHSREQ_Id,
                HLHSREQ_RequestDate: new Date(editData.HLHSREQ_RequestDate),
                HLMH_Id: editData.HLMH_Id.toString(),
                HLMRCA_Id: editData.HLMRCA_Id.toString(),
                HLHSREQ_ACRoomFlg: editData.HLHSREQ_ACRoomFlg,
                HLHSREQ_SingleRoomFlg: editData.HLHSREQ_SingleRoomFlg,
                HLHSREQ_VegMessFlg: editData.HLHSREQ_VegMessFlg,
                HLHSREQ_NonVegMessFlg: editData.HLHSREQ_NonVegMessFlg,
                HLHSREQ_Remarks: editData.HLHSREQ_Remarks || '',
            });
        }
    }, [editData]);

    async function loadData() {
        const data = await getStudentRequestLoadData();
        if (data) {
            setHostels(data.hostel_list || []);
            setCategories(data.room_list || []);
            if (data.student_wisedata?.length > 0) {
                setStudentProfile(data.student_wisedata[0]);
                form.setValue('AMST_Id', data.student_wisedata[0].AMST_Id);
            }
        }
    }

    async function onSubmit(values: StudentRequestValues) {
        setLoading(true);
        const payload = {
            ...values,
            HLHSREQ_RequestDate: format(values.HLHSREQ_RequestDate, 'yyyy-MM-dd'),
            HLMH_Id: parseInt(values.HLMH_Id),
            HLMRCA_Id: parseInt(values.HLMRCA_Id),
        };

        const result = await saveStudentRequest(payload);
        if (result?.msg === 'Saved' || result?.msg === 'updated') {
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
                <CardTitle>Hostel Student Request</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
                    <p><strong>Name:</strong> {studentProfile?.studentName || '-'}</p>
                    <p><strong>Class:</strong> {studentProfile?.ASMCL_ClassName || '-'}</p>
                    <p><strong>Adm No:</strong> {studentProfile?.AMST_AdmNo || '-'}</p>
                    <p><strong>Reg No:</strong> {studentProfile?.AMST_RegistrationNo || '-'}</p>
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
                                name="HLHSREQ_RequestDate"
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
                                    name="HLHSREQ_VegMessFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Veg Mess</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSREQ_NonVegMessFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>Non-Veg Mess</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSREQ_ACRoomFlg"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <FormLabel>AC Room</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="HLHSREQ_SingleRoomFlg"
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
                            name="HLHSREQ_Remarks"
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
