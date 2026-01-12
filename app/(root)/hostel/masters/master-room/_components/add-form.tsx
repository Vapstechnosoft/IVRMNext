'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { useFormContext } from '@/components/ui/form/form-provider';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextarea } from '@/components/ui/form/form-textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { masterRoomSchema, IMasterRoomForm } from '@/schemas/hostel/master-room.schema';
import { fetchFloors, fetchRoomCategories, IFacility, IFloor, IHostel, IRoomCategory, saveRoom } from '@/server/hostel/master-room/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { use, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterRoomFormProps {
    onSuccess: () => void;
    hostels: IHostel[];
    facilities: IFacility[];
}

export default function AddMasterRoomForm({ onSuccess, hostels, facilities: initialFacilities }: AddMasterRoomFormProps) {
    const { closeAddForm } = useFormContext();
    const [floors, setFloors] = useState<IFloor[]>([]);
    const [categories, setCategories] = useState<IRoomCategory[]>([]);
    // If strict on facilities per floor, we'd fetch them. For now use global.
    const [facilities] = useState<IFacility[]>(initialFacilities);

    const form = useForm<IMasterRoomForm>({
        resolver: zodResolver(masterRoomSchema),
        defaultValues: {
            hlmH_Id: '',
            hlmF_Id: '',
            hlmrcA_Id: '',
            hrmrM_RoomNo: '',
            hrmrM_BedCapacity: '',
            hrmrM_RoomDesc: '',
            hrmrM_ACFlg: false,
            hrmrM_SharingFlg: false,
            hrmrM_RoomForStudentFlg: false,
            hrmrM_RoomForStaffFlg: false,
            hrmrM_RoomForGuestFlg: false,
            facilities: [],
        },
    });

    const { control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = form;

    const selectedHostel = watch('hlmH_Id');
    const selectedFloor = watch('hlmF_Id');

    // Fetch floors when Hostel changes
    useEffect(() => {
        if (selectedHostel) {
            const loadFloors = async () => {
                const result = await fetchFloors(Number(selectedHostel));
                setFloors(result.floors);
                setCategories(result.categories); // Depending on API this might be here or dependent on floor
            };
            loadFloors();
        } else {
            setFloors([]);
            setCategories([]);
        }
    }, [selectedHostel]);

    // Fetch categories when Floor changes (if strictly dependent on floor)
    // In my server action `fetchFloors` returned categories too, assuming they are just filtered by hostel?
    // But let's refine: if categories are floor specific, we should filter them.
    // The server action `fetchFloors` returned all categories for the hostel (or all mock).
    // Let's filter categories client side if they have hlmF_Id, or fetch again.
    // My mock data has `hlmF_Id` in `IRoomCategory`.
    const filteredCategories = categories.filter(c => !selectedFloor || c.hlmF_Id === Number(selectedFloor));

    const onSubmit = async (data: IMasterRoomForm) => {
        const result = await saveRoom(data);
        if (result.success) {
            toast.success(result.message);
            onSuccess();
            closeAddForm();
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="p-4 bg-background rounded-lg border">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        {/* Hostel */}
                        <div className="space-y-2">
                            <Label required>Hostel Name</Label>
                            <Controller
                                control={control}
                                name="hlmH_Id"
                                render={({ field }) => (
                                    <Select onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('hlmF_Id', ''); // Reset floor
                                        setValue('hlmrcA_Id', ''); // Reset category
                                    }} value={field.value}>
                                        <SelectTrigger className={errors.hlmH_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="--Select--" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostels.map((h) => (
                                                <SelectItem key={h.hlmH_Id} value={h.hlmH_Id.toString()}>
                                                    {h.hlmH_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.hlmH_Id?.message}</FormError>
                        </div>

                        {/* Floor */}
                        <div className="space-y-2">
                            <Label required>Floor Name</Label>
                            <Controller
                                control={control}
                                name="hlmF_Id"
                                render={({ field }) => (
                                    <Select onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue('hlmrcA_Id', ''); // Reset category
                                    }} value={field.value} disabled={!selectedHostel}>
                                        <SelectTrigger className={errors.hlmF_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="--Select--" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {floors.map((f) => (
                                                <SelectItem key={f.hlmF_Id} value={f.hlmF_Id.toString()}>
                                                    {f.hrmF_FloorName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.hlmF_Id?.message}</FormError>
                        </div>

                        {/* Room Category */}
                        <div className="space-y-2">
                            <Label required>Room Category</Label>
                            <Controller
                                control={control}
                                name="hlmrcA_Id"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFloor}>
                                        <SelectTrigger className={errors.hlmrcA_Id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="--Select--" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredCategories.map((c) => (
                                                <SelectItem key={c.hlmrcA_Id} value={c.hlmrcA_Id.toString()}>
                                                    {c.hlmrcA_RoomCategory}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <FormError>{errors.hlmrcA_Id?.message}</FormError>
                        </div>

                        {/* Room No */}
                        <FormInput
                            control={control}
                            name="hrmrM_RoomNo"
                            label="Room No."
                            placeholder="Enter Room No."
                            required
                        />

                        {/* Bed Capacity */}
                        <FormInput
                            control={control}
                            name="hrmrM_BedCapacity"
                            label="Bed Capacity"
                            placeholder="Enter Bed Capacity"
                            required
                            pattern="^[0-9]*$"
                            maxLength={5}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-4">
                        {/* Facilities */}
                        <Controller
                            control={control}
                            name="facilities"
                            render={({ field }) => (
                                <CustomMultiSelectBox
                                    label="Room Facilities"
                                    isRequired
                                    options={facilities.map(f => ({ label: f.hlmftY_FacilityName, value: f.hlmftY_Id.toString() }))}
                                    value={field.value?.map(String) || []}
                                    onChange={(vals) => field.onChange(vals.map(Number))}
                                    error={errors.facilities?.message}
                                    isSearchRequired
                                />
                            )}
                        />

                        {/* Description */}
                        <FormTextarea
                            control={control}
                            name="hrmrM_RoomDesc"
                            label="Description"
                            placeholder="Enter Description..."
                        />
                    </div>
                </div>

                {/* Additional Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* AC Checkbox */}
                    <div className="space-y-2 border p-2 rounded text-center">
                        <Label>Room Type</Label>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                            <Controller
                                control={control}
                                name="hrmrM_ACFlg"
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <span className="text-sm font-medium">Whether The Room Is Have AC?</span>
                        </div>
                    </div>

                    {/* Room Only For */}
                    <div className="space-y-2 border p-2 rounded">
                        <Label>Room Only for :</Label>
                        <div className="flex flex-col space-y-2 mt-2 pl-4">
                            <div className="flex items-center space-x-2">
                                <Controller
                                    control={control}
                                    name="hrmrM_RoomForStudentFlg"
                                    render={({ field }) => (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <span>Students</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Controller
                                    control={control}
                                    name="hrmrM_RoomForStaffFlg"
                                    render={({ field }) => (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <span>Staffs</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Controller
                                    control={control}
                                    name="hrmrM_RoomForGuestFlg"
                                    render={({ field }) => (
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <span>Guests</span>
                            </div>
                        </div>
                    </div>

                    {/* Sharing Checkbox */}
                    <div className="space-y-2 border p-2 rounded text-center">
                        <Label>Room Share</Label>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                            <Controller
                                control={control}
                                name="hrmrM_SharingFlg"
                                render={({ field }) => (
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <span className="text-sm font-medium">Whether This Room Is Sharing?</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4 border-t mt-4">
                    <Button type="submit" disabled={isSubmitting} className="w-32">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={closeAddForm} className="w-32">
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
