'use client';

import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomTransferSchema, RoomTransferValues } from '@/schemas/hostel/transactions/room-transfer.schema';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CustomSelect } from '@/components/ui/form/custom-select';
import { DatePicker } from '@/components/ui/form/date-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
    getRoomTransferLoadData,
    getTransferPersonDetail,
    getFloorsAndCategories,
    getRoomsForTransfer,
    saveRoomTransfer
} from '@/server/hostel/transactions/room-transfer';
import { format } from 'date-fns';

export default function RoomTransferForm({ onSaveSuccess }: { onSaveSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<any>(null);
    const [personData, setPersonData] = useState<any[]>([]);
    const [hostels, setHostels] = useState<any[]>([]);
    const [floors, setFloors] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [roomDetails, setRoomDetails] = useState<any>(null);

    const form = useForm<RoomTransferValues>({
        resolver: zodResolver(roomTransferSchema),
        defaultValues: {
            type: 'stud',
            HLHSALTC_TransferDate: new Date(),
            HLHSTRSC_EntireRoomReqdFlg: 0,
            HLHSTRSC_NewRoomFee: 0
        },
    });

    const selectedType = useWatch({ control: form.control, name: 'type' });
    const selectedPersonId = useWatch({
        control: form.control,
        name: selectedType === 'stud' ? 'AMCST_Id' : selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id'
    });
    const selectedHostelId = useWatch({ control: form.control, name: 'ToHLMH_Id' });
    const selectedCategoryId = useWatch({ control: form.control, name: 'HLMRCA_Id' });
    const selectedFloorId = useWatch({ control: form.control, name: 'hlmF_Id' });
    const selectedRoomId = useWatch({ control: form.control, name: 'HRMRM_Id' });

    useEffect(() => {
        loadInitialData(selectedType);
    }, [selectedType]);

    useEffect(() => {
        if (selectedPersonId) {
            loadPersonDetail(selectedType, selectedPersonId);
        }
    }, [selectedPersonId]);

    useEffect(() => {
        if (selectedHostelId) {
            loadFloorsAndCategories(selectedHostelId);
        }
    }, [selectedHostelId]);

    useEffect(() => {
        if (selectedFloorId && selectedCategoryId) {
            const oldRoomId = initialData?.studentdata?.[0]?.HRMRM_Id || 0;
            loadRooms(selectedFloorId, selectedCategoryId, oldRoomId);
        }
    }, [selectedFloorId, selectedCategoryId]);

    async function loadInitialData(type: string) {
        setLoading(true);
        const data = await getRoomTransferLoadData(type);
        if (data) {
            if (type === 'stud') setPersonData(data.studentdata || []);
            else if (type === 'staff') setPersonData(data.staffdata || []);
            else setPersonData(data.guestdata || []);
        }
        setLoading(false);
    }

    async function loadPersonDetail(type: string, id: number) {
        const data = await getTransferPersonDetail(type, id);
        if (data) {
            const detail = data.studentdata?.[0] || data.staffdata?.[0] || data.guest_details?.[0];
            if (detail) {
                form.setValue('currentHostel', detail.HLMH_Name);
                form.setValue('currentRoom', detail.HRMRM_RoomNo);
                form.setValue('currentCategory', detail.HLMRCA_RoomCategory);
                form.setValue('joiningDate', detail.HLHSALTC_AllotmentDate || detail.HLHSTALT_AllotmentDate || detail.hlhgstalT_AllotmentDate);
                setHostels(data.hostel_list || []);
            }
        }
    }

    async function loadFloorsAndCategories(hostelId: number) {
        const data = await getFloorsAndCategories(hostelId);
        if (data) {
            setFloors(data.floor_list || []);
            setCategories(data.roomcatgry_list || []);
        }
    }

    async function loadRooms(floorId: number, categoryId: number, oldRoomId: number) {
        const data = await getRoomsForTransfer(floorId, categoryId, oldRoomId);
        if (data) {
            setRooms(data.room_list || []);
        }
    }

    async function onSubmit(values: RoomTransferValues) {
        setLoading(true);
        // Map to legacy payload
        const payload = {
            HLHSALTC_TransferDate: format(values.HLHSALTC_TransferDate, 'yyyy-MM-dd'),
            HLMH_Id: values.ToHLMH_Id,
            HLMRCA_Id: values.HLMRCA_Id, // This might need to be the OLD one? Legacy JS says $scope.roomcategory
            ACMST_Id: values.AMCST_Id,
            HRME_Id: values.HRME_Id,
            HLHGSTALT_Id: values.HLHGSTALT_Id,
            HLHSTRSC_To_HLMRCA_Id: values.HLMRCA_Id,
            HLMRCAC_To_HRMRM_Id: values.HRMRM_Id,
            HLHSTRSC_EntireRoomReqdFlg: values.HLHSTRSC_EntireRoomReqdFlg,
            HLHSTRSC_NewRoomFee: values.HLHSTRSC_NewRoomFee,
            HLHSTRSC_VacateRemarks: values.HLHSTRSC_VacateRemarks,
            type: values.type === 'stud' ? 'ClgStudent' : values.type
        };

        const result = await saveRoomTransfer(payload);
        if (result?.returnval === "save") {
            toast.success("Room transferred successfully!");
            onSaveSuccess();
            form.reset();
        } else {
            toast.error(result?.returnval || "Failed to transfer room");
        }
        setLoading(false);
    }

    return (
        <Card className="shadow-lg border-primary/20">
            <CardHeader className="bg-primary/5">
                <CardTitle className="text-xl font-bold text-primary">Hostel Room Transfer</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex justify-center mb-6 p-4 bg-muted/30 rounded-lg">
                            <Controller
                                control={form.control}
                                name="type"
                                render={({ field, fieldState }) => (
                                    <div className="space-y-3">
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-8"
                                        >
                                            <div className="flex items-center space-x-2 space-y-0">
                                                <RadioGroupItem value="stud" id="r1" />
                                                <Label htmlFor="r1" className="font-medium">Student</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 space-y-0">
                                                <RadioGroupItem value="staff" id="r2" />
                                                <Label htmlFor="r2" className="font-medium">Staff</Label>
                                            </div>
                                            <div className="flex items-center space-x-2 space-y-0">
                                                <RadioGroupItem value="guest" id="r3" />
                                                <Label htmlFor="r3" className="font-medium">Guest</Label>
                                            </div>
                                        </RadioGroup>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Controller
                                    control={form.control}
                                    name={selectedType === 'stud' ? 'AMCST_Id' : selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id'}
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Select {selectedType === 'stud' ? 'Student' : selectedType === 'staff' ? 'Staff' : 'Guest'}</Label>
                                            <CustomSelect
                                                options={personData.map(p => ({
                                                    label: p.studentname || p.staffname || p.hlhgstalT_GuestName,
                                                    value: (p.amcsT_Id || p.hrmE_Id || p.hlhgstalT_Id).toString()
                                                }))}
                                                {...field}
                                                onChange={(val) => field.onChange(parseInt(val))}
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 space-y-2">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 border-bottom mb-2 pb-1 border-blue-200">Current Occupancy Details</h4>
                                    <p className="text-sm"><strong>Hostel:</strong> {form.getValues('currentHostel') || '-'}</p>
                                    <p className="text-sm"><strong>Room:</strong> {form.getValues('currentRoom') || '-'}</p>
                                    <p className="text-sm"><strong>Category:</strong> {form.getValues('currentCategory') || '-'}</p>
                                    <p className="text-sm"><strong>Joined:</strong> {form.getValues('joiningDate') ? format(new Date(form.getValues('joiningDate')!), 'dd/MM/yyyy') : '-'}</p>
                                </div>

                                <Controller
                                    control={form.control}
                                    name="HLHSALTC_TransferDate"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Transfer Date</Label>
                                            <DatePicker date={field.value} setDate={field.onChange} />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="HLHSTRSC_NewRoomFee"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>New Room Fee</Label>
                                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="HLHSTRSC_EntireRoomReqdFlg"
                                    render={({ field }) => (
                                        <div className="flex items-center space-x-2 space-y-0">
                                            <Checkbox
                                                checked={field.value === 1}
                                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                                            />
                                            <Label className="font-medium cursor-pointer">Entire Room Required?</Label>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg text-primary border-b pb-2">Transfer To</h4>

                                <Controller
                                    control={form.control}
                                    name="ToHLMH_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Target Hostel</Label>
                                            <CustomSelect
                                                options={hostels.map(h => ({ label: h.hlmH_Name, value: h.hlmH_Id.toString() }))}
                                                {...field}
                                                onChange={(val) => field.onChange(parseInt(val))}
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="HLMRCA_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Room Category</Label>
                                            <CustomSelect
                                                options={categories.map(c => ({ label: c.hlmrcA_RoomCategory, value: c.hlmrcA_Id.toString() }))}
                                                {...field}
                                                onChange={(val) => field.onChange(parseInt(val))}
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="hlmF_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Floor</Label>
                                            <CustomSelect
                                                options={floors.map(f => ({ label: f.hrmF_FloorName, value: f.hlmF_Id.toString() }))}
                                                {...field}
                                                onChange={(val) => field.onChange(parseInt(val))}
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="HRMRM_Id"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>New Room</Label>
                                            <CustomSelect
                                                options={rooms.map(r => ({ label: r.hrmrM_RoomNo, value: r.hrmrM_Id.toString() }))}
                                                {...field}
                                                onChange={(val) => field.onChange(parseInt(val))}
                                            />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />

                                <Controller
                                    control={form.control}
                                    name="HLHSTRSC_VacateRemarks"
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <Label>Vacate Remarks</Label>
                                            <Textarea placeholder="Enter remarks..." {...field} />
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => form.reset()} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Processing..." : "Transfer Room"}
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
