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
                <div className="border border-input rounded-md p-6">
                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
                                
                                {/* LEFT COLUMN */}
                                <div className="flex flex-col gap-4">
                                    
                                    <div className="grid grid-cols-[180px_10px_1fr] items-center text-sm">
                                        <span className="font-medium text-foreground">Student Name</span>
                                        <span className="font-medium text-foreground">:</span>
                                        <span className="font-medium text-foreground">{studentProfile?.studentName || ''}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-[180px_10px_1fr] items-center text-sm">
                                        <span className="font-medium text-foreground">Registration No</span>
                                        <span className="font-medium text-foreground">:</span>
                                        <span className="font-medium text-foreground">{studentProfile?.AMST_RegistrationNo || ''}</span>
                                    </div>

                                    <div className="grid grid-cols-[180px_10px_1fr] items-center">
                                        <Label className="text-sm font-medium">Hostel Name<span className="text-destructive">*</span></Label>
                                        <span className="text-sm font-medium">:</span>
                                        <Controller
                                            control={form.control}
                                            name="HLMH_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-sm w-full">
                                                            <SelectValue placeholder="--Select--" />
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
                                    </div>

                                    <div className="grid grid-cols-[180px_10px_1fr] items-center">
                                        <Label className="text-sm font-medium">Room category<span className="text-destructive">*</span></Label>
                                        <span className="text-sm font-medium">:</span>
                                        <Controller
                                            control={form.control}
                                            name="HLMRCA_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-sm w-full">
                                                            <SelectValue placeholder="--Select--" />
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
                                    </div>

                                    <div className="grid grid-cols-[180px_10px_1fr] items-center text-sm">
                                        <span className="font-medium">Single Sharing Amount</span>
                                        <span className="font-medium">:</span>
                                        <span className="font-medium text-foreground">-</span>
                                    </div>

                                    <div className="grid grid-cols-[180px_10px_1fr] items-center text-sm">
                                        <span className="font-medium">Multiple Sharing Amount</span>
                                        <span className="font-medium">:</span>
                                        <span className="font-medium text-foreground">-</span>
                                    </div>

                                    <div className="grid grid-cols-[180px_10px_1fr] items-center mt-1">
                                        <span></span>
                                        <span></span>
                                        <Controller
                                            control={form.control}
                                            name="preferredPartner"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2 pl-4">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Label className="text-sm font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>Preferred Partnar</Label>
                                                </div>
                                            )}
                                        />
                                    </div>

                                </div>

                                {/* RIGHT COLUMN */}
                                <div className="flex flex-col gap-4">
                                    
                                    <div className="grid grid-cols-[120px_10px_1fr] items-center">
                                        <Label className="text-sm font-medium">Request Date<span className="text-destructive">*</span></Label>
                                        <span className="text-sm font-medium"></span>
                                        <Controller
                                            control={form.control}
                                            name="HLHSREQ_RequestDate"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full h-8 pl-3 pr-8 flex justify-center items-center font-normal text-sm",
                                                                    !field.value && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="absolute left-3 h-4 w-4 opacity-50" />
                                                                {field.value ? (
                                                                    format(field.value, "dd-MM-yyyy")
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
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
                                    </div>

                                    <div className="grid grid-cols-[120px_10px_1fr] items-center">
                                        <span></span>
                                        <span></span>
                                        <div className="border border-input rounded-md p-1 flex justify-center gap-12 w-full bg-background h-8 items-center">
                                            <Controller
                                                control={form.control}
                                                name="HLHSREQ_VegMessFlg"
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        <Label className="text-sm font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>Veg</Label>
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                control={form.control}
                                                name="HLHSREQ_NonVegMessFlg"
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        <Label className="text-sm font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>Non-Veg</Label>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[120px_10px_1fr] items-center">
                                        <span></span>
                                        <span></span>
                                        <div className="border border-input rounded-md p-1 flex justify-center w-full bg-background h-8 items-center">
                                            <Controller
                                                control={form.control}
                                                name="HLHSREQ_SingleRoomFlg"
                                                render={({ field }) => (
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        <Label className="text-sm font-medium cursor-pointer" onClick={() => field.onChange(!field.value)}>Entire Room Required?</Label>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[120px_10px_1fr] items-start">
                                        <Label className="text-sm font-medium pt-1">Remarks:</Label>
                                        <span className="text-sm font-medium"></span>
                                        <Controller
                                            control={form.control}
                                            name="HLHSREQ_Remarks"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Textarea {...field} placeholder="Enter Remarks" className="min-h-[50px] h-[50px] resize-none text-sm py-1 px-2" />
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>

                                </div>
                            </div>

                            <div className="flex justify-center space-x-4 mt-8 mb-2">
                                <Button type="submit" className="h-8 w-24 text-xs font-medium" disabled={loading}>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                    SAVE
                                </Button>
                                <Button type="button" variant="outline" className="h-8 w-24 text-xs font-medium" onClick={() => form.reset()} disabled={loading}>
                                    <X className="h-4 w-4 mr-2" />
                                    CANCEL
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </CardContent>
        </Card>
    );
}
