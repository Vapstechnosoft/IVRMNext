'use client';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentRequestSchema, StudentRequestValues } from '@/schemas/hostel/transactions/hostel-requests.schema';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStudentRequestLoadData, saveStudentRequest } from '@/server/hostel/hostel-management/transactions/student-request-actions';
import { HostelList, RoomCategoryList, StudentProfileData } from '@/types/hostel/hostel-management/transactions';

export default function StudentRequestForm({
    onSaveSuccess,
    editData
}: {
    onSaveSuccess: () => void,
    editData?: any
}) {
    const [loading, setLoading] = useState(false);
    const [hostels, setHostels] = useState<HostelList[]>([]);
    const [categories, setCategories] = useState<RoomCategoryList[]>([]);
    const [studentProfile, setStudentProfile] = useState<StudentProfileData | null>(null);

    const form = useForm<StudentRequestValues>({
        resolver: zodResolver(studentRequestSchema),
        defaultValues: {
            HLHSREQ_Id: 0,
            HLHSREQ_RequestDate: new Date(),
            HLHSREQ_ACRoomFlg: false,
            HLHSREQ_SingleRoomFlg: false,
            HLHSREQ_VegMessFlg: false,
            HLHSREQ_NonVegMessFlg: false,
            preferredPartner: false,
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
                preferredPartner: false,
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
        try {
            const payload = {
                ...values,
                HLHSREQ_RequestDate: format(values.HLHSREQ_RequestDate, 'yyyy-MM-dd'),
                HLMH_Id: Number.parseInt(values.HLMH_Id),
                HLMRCA_Id: Number.parseInt(values.HLMRCA_Id),
            };

            const result = await saveStudentRequest(payload);
            if (result?.msg === 'Saved' || result?.msg === 'updated') {
                toast.success(result.msg === 'Saved' ? "Request submitted!" : "Request updated!");
                onSaveSuccess();
                form.reset({
                    HLHSREQ_Id: 0,
                    HLHSREQ_RequestDate: new Date(),
                    HLHSREQ_ACRoomFlg: false,
                    HLHSREQ_SingleRoomFlg: false,
                    HLHSREQ_VegMessFlg: false,
                    HLHSREQ_NonVegMessFlg: false,
                    preferredPartner: false,
                    HLHSREQ_Remarks: '',
                    HLMH_Id: '',
                    HLMRCA_Id: '',
                    AMST_Id: studentProfile?.AMST_Id
                });
            } else {
                toast.error(result?.message || "Failed to save request");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hostel Student Request</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
                    <p><strong>Student Name:</strong> {studentProfile?.studentName || '-'}</p>
                    <p><strong>Registration No:</strong> {studentProfile?.AMST_RegistrationNo || '-'}</p>
                    <p><strong>Class:</strong> {studentProfile?.ASMCL_ClassName || '-'}</p>
                    <p><strong>Adm No:</strong> {studentProfile?.AMST_AdmNo || '-'}</p>
                </div>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                control={form.control}
                                name="HLMH_Id"
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>Hostel Name <span className="text-destructive">*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-8 text-sm md:w-72">
                                                <SelectValue placeholder="Select Hostel" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hostels.map(h => (
                                                    <SelectItem key={h.hlmH_Id} value={String(h.hlmH_Id)}>
                                                        {h.hlmH_Name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="HLMRCA_Id"
                                render={({ field, fieldState }) => (
                                    <div>
                                        <Label>Room Category <span className="text-destructive">*</span></Label>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="h-8 text-sm md:w-72">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => (
                                                    <SelectItem key={c.hlmrcA_Id} value={String(c.hlmrcA_Id)}>
                                                        {c.hlmrcA_RoomCategory}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="HLHSREQ_RequestDate"
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col">
                                        <Label>Request Date <span className="text-destructive">*</span></Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full md:w-72 h-8 pl-3 text-left font-normal text-sm",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                            
                            <div className="flex gap-4">
                                <div className="space-y-1 w-full md:w-[136px]">
                                    <Label>Single Sharing Amount</Label>
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded-md border min-h-8 h-8 flex items-center">-</div>
                                </div>
                                <div className="space-y-1 w-full md:w-[136px]">
                                    <Label>Multiple Sharing Amount</Label>
                                    <div className="text-sm font-medium p-2 bg-muted/20 rounded-md border min-h-8 h-8 flex items-center">-</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-6">
                                <Controller
                                    control={form.control}
                                    name="HLHSREQ_VegMessFlg"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-y-0">
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            <Label>Veg Mess</Label>
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="HLHSREQ_NonVegMessFlg"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-y-0">
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            <Label>Non-Veg Mess</Label>
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="HLHSREQ_SingleRoomFlg"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-y-0">
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            <Label>Entire Room Required?</Label>
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={form.control}
                                    name="preferredPartner"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-y-0">
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            <Label>Preferred Partner</Label>
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <Controller
                            control={form.control}
                            name="HLHSREQ_Remarks"
                            render={({ field, fieldState }) => (
                                <div>
                                    <Label>Remarks</Label>
                                    <Textarea {...field} className="md:w-96" />
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />

                        <div className="flex justify-center space-x-2 pt-4">
                            <Button type="submit" className="h-8 w-24 text-sm px-3" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                            <Button type="button" variant="outline" className="h-8 w-24 text-sm px-3" onClick={() => form.reset()} disabled={loading}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
