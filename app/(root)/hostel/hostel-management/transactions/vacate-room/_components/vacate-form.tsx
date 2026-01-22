'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { vacateRoomSchema, type VacateRoomSchema } from '@/schemas/hostel/transactions/vacate-room.schema';
import { saveVacate, getStudentDetail, getStaffDetail, getGuestDetail, getDetailsOnType } from '@/server/hostel/transactions/vacate-room';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface VacateFormProps {
    initialData: {
        studentdata: any[];
        staffdata: any[];
        guestdata: any[];
    };
    onSuccess?: (type: string) => void;
    onTypeChange?: (type: string) => void;
}

export default function VacateForm({ initialData, onSuccess, onTypeChange }: VacateFormProps) {
    const [people, setPeople] = useState<any[]>(initialData.studentdata);
    const [details, setDetails] = useState<any>(null);

    const methods = useForm<VacateRoomSchema>({
        resolver: zodResolver(vacateRoomSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: 'student',
            AMST_Id: null,
            HRME_Id: null,
            HLHGSTALT_Id: null,
            HLHSALT_VacatedDate: new Date(),
            HLHSALT_VacateRemarks: '',
        }
    });

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = methods;

    const selectedType = useWatch({ control, name: 'type' });
    const selectedAMST = useWatch({ control, name: 'AMST_Id' });
    const selectedHRME = useWatch({ control, name: 'HRME_Id' });
    const selectedHLHGSTALT = useWatch({ control, name: 'HLHGSTALT_Id' });

    // Handle Type Change
    useEffect(() => {
        onTypeChange?.(selectedType);
        setDetails(null);
        reset({
            type: selectedType,
            AMST_Id: null,
            HRME_Id: null,
            HLHGSTALT_Id: null,
            HLHSALT_VacatedDate: new Date(),
            HLHSALT_VacateRemarks: ''
        });

        // Fetch people based on type
        (async () => {
            const res = await getDetailsOnType(selectedType);
            if (res && res.list) {
                setPeople(res.list);
            }
        })();
    }, [selectedType, onTypeChange, reset]);

    // Handle Person Selection Details
    useEffect(() => {
        if (selectedType === 'student' && selectedAMST) {
            (async () => {
                const res = await getStudentDetail(Number(selectedAMST));
                if (res && res.studentdata?.[0]) {
                    setDetails(res.studentdata[0]);
                }
            })();
        } else if (selectedType === 'staff' && selectedHRME) {
            (async () => {
                const res = await getStaffDetail(Number(selectedHRME));
                if (res && res.staffdata?.[0]) {
                    setDetails(res.staffdata[0]);
                }
            })();
        } else if (selectedType === 'guest' && selectedHLHGSTALT) {
            (async () => {
                const res = await getGuestDetail(Number(selectedHLHGSTALT));
                if (res && res.guest_details?.[0]) {
                    setDetails(res.guest_details[0]);
                }
            })();
        }
    }, [selectedType, selectedAMST, selectedHRME, selectedHLHGSTALT]);

    const onSubmit = async (data: any) => {
        try {
            // we need to pass the correct date and remarks keys for legacy API
            const payload: any = { type: data.type };
            if (data.type === 'student') {
                payload.AMST_Id = data.AMST_Id;
                payload.HLHSALT_VacatedDate = data.HLHSALT_VacatedDate;
                payload.HLHSALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            } else if (data.type === 'staff') {
                payload.HRME_Id = data.HRME_Id;
                payload.HLHSTALT_VacatedDate = data.HLHSALT_VacatedDate;
                payload.HLHSTALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            } else if (data.type === 'guest') {
                payload.HLHGSTALT_Id = data.HLHGSTALT_Id;
                payload.HLHGSTALT_VacatedDate = data.HLHSALT_VacatedDate;
                payload.HLHGSTALT_VacateRemarks = data.HLHSALT_VacateRemarks;
            }

            const res: any = await saveVacate(payload);
            if (res.success) {
                toast.success(String(res.message));
                reset();
                onSuccess?.(data.type);
            } else {
                toast.error(String(res.message));
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="w-full rounded-2xl bg-white p-6 shadow-sm border">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Hostel Vacate</h3>

                    <div className="flex justify-center pb-4">
                        <Controller
                            control={control}
                            name="type"
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex gap-8 border p-4 rounded-lg bg-gray-50"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="student" id="r1" />
                                        <Label htmlFor="r1">Student</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="staff" id="r2" />
                                        <Label htmlFor="r2">Staff</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="guest" id="r3" />
                                        <Label htmlFor="r3">Guest</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Person Selection */}
                        <div className="space-y-1">
                            <Label required>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Name</Label>
                            <Controller
                                control={control}
                                name={selectedType === 'student' ? 'AMST_Id' : (selectedType === 'staff' ? 'HRME_Id' : 'HLHGSTALT_Id')}
                                render={({ field }) => (
                                    <Select
                                        value={String(field.value || '')}
                                        onValueChange={(v) => field.onChange(Number(v))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={`Select ${selectedType}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {people?.map((p: any) => (
                                                <SelectItem
                                                    key={p.amsT_Id || p.hrmE_Id || p.hlhgstalT_Id}
                                                    value={String(p.amsT_Id || p.hrmE_Id || p.hlhgstalT_Id)}
                                                >
                                                    {p.studentname || p.staffname || p.hlhgstalT_GuestName}
                                                    {p.amsT_AdmNo ? ` : ${p.amsT_AdmNo}` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.AMST_Id && <FormError>{errors.AMST_Id.message}</FormError>}
                        </div>

                        {/* Vacate Date */}
                        <Controller
                            control={control}
                            name="HLHSALT_VacatedDate"
                            render={({ field }) => (
                                <div className="space-y-1">
                                    <Label required>Vacate Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.HLHSALT_VacatedDate && <FormError>{errors.HLHSALT_VacatedDate.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>

                    {/* Details Display */}
                    {details && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100 text-sm">
                            {selectedType === 'student' && (
                                <>
                                    <div><strong>Class:</strong> {details.ASMCL_ClassName}</div>
                                    <div><strong>Section:</strong> {details.ASMC_SectionName}</div>
                                </>
                            )}
                            {selectedType === 'staff' && (
                                <>
                                    <div><strong>Department:</strong> {details.HRMD_DepartmentName}</div>
                                    <div><strong>Designation:</strong> {details.HRMDES_DesignationName}</div>
                                </>
                            )}
                            <div><strong>Hostel:</strong> {details.HLMH_Name}</div>
                            <div><strong>Room No:</strong> {details.HRMRM_RoomNo}</div>
                            <div>
                                <strong>Date of Joining:</strong> {
                                    format(new Date(details.HLHSALT_AllotmentDate || details.HLHSTALT_AllotmentDate || details.hlhgstalT_AllotmentDate), 'dd-MM-yyyy')
                                }
                            </div>
                        </div>
                    )}

                    {/* Remarks */}
                    <Controller
                        control={control}
                        name="HLHSALT_VacateRemarks"
                        render={({ field }) => (
                            <div className="space-y-1">
                                <Label>Remarks</Label>
                                <Textarea {...field} value={field.value || ''} placeholder="Enter Remarks" rows={2} />
                            </div>
                        )}
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => { reset(); setDetails(null); }}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>Submit</Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
