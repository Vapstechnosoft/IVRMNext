'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from '@/components/ui/form/form-provider';
import { masterFloorSchema, IMasterFloorForm } from '@/schemas/hostel/master-floor.schema';
import { saveFloor, IFacility, IHostel } from '@/server/hostel/master-floor/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddMasterFloorFormProps {
    onSuccess: () => void;
    hostels: IHostel[];
    facilities: IFacility[];
    initialData?: any;
}

export default function AddMasterFloorForm({ onSuccess, hostels, facilities, initialData }: AddMasterFloorFormProps) {
    const { closeAddForm: closeAdd, closeEditForm } = useFormContext();

    const form = useForm<IMasterFloorForm>({
        resolver: zodResolver(masterFloorSchema),
        defaultValues: initialData || {
            hlmH_Id: '',
            hrmF_FloorName: '',
            hrmF_TotalRooms: '',
            hrmF_FloorDesc: '',
            facilities: [],
        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = form;



    const onSubmit = async (data: IMasterFloorForm) => {
        const result = await saveFloor(data);
        if (result.success) {
            toast.success(result.message);
            onSuccess();
        } else {
            toast.error(result.message);
        }
    };

    const onCancel = () => {
        if (initialData) {
            closeEditForm();
        } else {
            closeAdd();
        }
    };



    return (
        <div className="p-4 bg-background rounded-lg border">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        {/* Hostel Selection */}
                        <div className="space-y-2">
                            <Label>Hostel Name <span className="text-destructive">*</span></Label>
                            <Controller
                                control={control}
                                name="hlmH_Id"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
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

                        {/* Floor Name */}
                        <div className="space-y-2">
                            <Label>Floor Name <span className="text-destructive">*</span></Label>
                            <Controller
                                control={control}
                                name="hrmF_FloorName"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder='Enter Floor Name'
                                        className={errors.hrmF_FloorName ? 'border-destructive' : ''}
                                    />
                                )}
                            />
                            <FormError>{errors.hrmF_FloorName?.message}</FormError>
                        </div>

                        {/* Total Rooms */}
                        <div className="space-y-2">
                            <Label>Total Room <span className="text-destructive">*</span></Label>
                            <Controller
                                control={control}
                                name="hrmF_TotalRooms"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder='Enter Total No Of Room'
                                        maxLength={50}
                                        className={errors.hrmF_TotalRooms ? 'border-destructive' : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^[0-9]*$/.test(val)) {
                                                field.onChange(val);
                                            }
                                        }}
                                    />
                                )}
                            />
                            <FormError>{errors.hrmF_TotalRooms?.message}</FormError>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Controller
                                control={control}
                                name="hrmF_FloorDesc"
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder='Enter Description...'
                                        className={errors.hrmF_FloorDesc ? 'border-destructive' : ''}
                                    />
                                )}
                            />
                            <FormError>{errors.hrmF_FloorDesc?.message}</FormError>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Facilities */}
                    <div className="space-y-4">
                        <Controller
                            control={control}
                            name="facilities"
                            render={({ field }) => (
                                <CustomMultiSelectBox
                                    label="Facilities"
                                    isRequired
                                    options={facilities.map(f => ({ label: f.hlmftY_FacilityName, value: f.hlmftY_Id.toString() }))}
                                    value={field.value?.map(String) || []}
                                    onChange={(vals) => field.onChange(vals.map(Number))}
                                    error={errors.facilities?.message}
                                    isSearchRequired
                                />
                            )}
                        />
                    </div>

                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4 border-t">
                    <Button type="submit" disabled={isSubmitting} className="w-32">
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button type="button" variant="destructive" onClick={onCancel} className="w-32">
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
