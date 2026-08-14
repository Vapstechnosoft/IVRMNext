'use client';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffRequestSchema, StaffRequestValues } from '@/schemas/hostel/transactions/hostel-requests.schema';
import { FormError, Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DateField } from '@/components/ui/dateField';
import { getStaffRequestLoadData, saveStaffRequest } from '@/server/hostel/hostel-management/transactions/staff-request-actions';
import { Loader2, Save, XCircle, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    const { control, handleSubmit, reset } = form;

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
        const response = await getStaffRequestLoadData();
        if (response.success && response.data) {
            setHostels(response.data.hostel_list || []);
            setCategories(response.data.room_list || []);
            if (response.data.staff_wisedata?.length > 0) {
                setStaffProfile(response.data.staff_wisedata[0]);
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
        if (result?.success) {
            toast.success("Request saved successfully!");
            onSaveSuccess();
            form.reset();
        } else {
            toast.error(result?.message || "Failed to save request");
        }
        setLoading(false);
    }

    const ReadOnlyField = ({ label, value }: { label: string, value: any }) => (
        <div className="flex items-center py-1">
            <Label className="w-40 text-left text-gray-700 font-medium">{label}</Label>
            <span className="text-gray-500 mr-4">:</span>
            <span className="flex-1 text-blue-900 font-semibold truncate">{value || '-'}</span>
        </div>
    );

    return (
        <Card className="shadow-md border-t-4 border-t-[#4255a7]">
            <CardHeader className="bg-white py-2 px-4 border-b flex flex-row items-center justify-between">
                <CardTitle className="text-[#4255a7] text-sm font-bold uppercase">HOSTEL STAFF REQUEST</CardTitle>
                <Minus className="h-4 w-4 text-gray-400 cursor-pointer" />
            </CardHeader>
            <CardContent className="p-8">
                <FormProvider {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-1">
                            {/* Left Column */}
                            <div className="space-y-2">
                                <ReadOnlyField label="Staff Name" value={staffProfile?.empName} />
                                <ReadOnlyField label="Designation" value={staffProfile?.HRMDES_DesignationName} />
                                
                                <div className="flex items-center py-1">
                                    <Label className="w-40 text-left text-gray-700 font-medium">Hostel</Label>
                                    <span className="text-gray-500 mr-4">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HLMH_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-xs border-blue-200">
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
                                </div>

                                {/* Mess Type Box */}
                                <div className="flex items-center border rounded-md p-1.5 bg-white shadow-sm space-x-20 mt-4">
                                    <Label className="pl-4 font-medium text-gray-700 w-32">Mess Type :</Label>
                                    <div className="flex items-center space-x-6">
                                        <Controller
                                            control={control}
                                            name="HLHSTREQ_VegMessFlg"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Label className="text-xs font-medium">Veg</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            control={control}
                                            name="HLHSTREQ_NonVegMessFlg"
                                            render={({ field }) => (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    <Label className="text-xs font-medium">Non-Veg</Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Room Features Box */}
                                <div className="flex items-center justify-center border rounded-md p-1.5 bg-white shadow-sm space-x-12">
                                    <Controller
                                        control={control}
                                        name="HLHSTREQ_ACRoomFlg"
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                <Label className="text-xs font-medium">AC</Label>
                                            </div>
                                        )}
                                    />
                                    <Controller
                                        control={control}
                                        name="HLHSTREQ_SingleRoomFlg"
                                        render={({ field }) => (
                                            <div className="flex items-center space-x-2">
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                <Label className="text-xs font-medium">Single</Label>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-2">
                                <ReadOnlyField label="Department" value={staffProfile?.HRMD_DepartmentName} />
                                <ReadOnlyField label="Emp Code" value={staffProfile?.HRME_EmployeeCode} />

                                <div className="flex items-center py-1">
                                    <Label className="w-40 text-left text-gray-700 font-medium">Room category:</Label>
                                    <span className="text-gray-500 mr-4">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HLMRCA_Id"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-xs border-blue-200">
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
                                </div>

                                <div className="flex items-center py-1">
                                    <Label className="w-40 text-left text-gray-700 font-medium">Request Date:<span className="text-red-500">*</span></Label>
                                    <span className="text-gray-500 mr-4">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HLHSTREQ_RequestDate"
                                            render={({ field, fieldState }) => (
                                                <DateField field={field} fieldState={fieldState} label="" placeholder="Select date" />
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start py-1">
                                    <Label className="w-40 text-left pt-2 text-gray-700 font-medium">Remarks</Label>
                                    <span className="text-gray-500 mr-4 pt-2">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            control={control}
                                            name="HLHSTREQ_Remarks"
                                            render={({ field, fieldState }) => (
                                                <div className="w-full">
                                                    <Textarea {...field} className="min-h-[60px] border-blue-100" />
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-4 pt-6">
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-32 bg-[#4255a7] hover:bg-[#354486] text-white rounded-md shadow-md uppercase font-bold text-xs"
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
                                SAVE
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => { reset(); onSaveSuccess(); }} 
                                className="w-32 bg-[#ff5c33] hover:bg-[#e64d26] text-white border-none rounded-md shadow-md uppercase font-bold text-xs"
                            >
                                <XCircle className="mr-2 h-3 w-3" />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
