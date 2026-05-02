'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { oralTestScheduleSchema, OralTestScheduleFormValues } from '@/schemas/admission/preadmission/transactions/oral-test-schedule';
import { 
    useClasswiseStudents, 
    useOralTestScheduleDetails, 
    useSaveOralTestSchedule,
    useOralTestScheduleSelectedRow 
} from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { IOralTestSchedule, IStudentDetails, IOralTestScheduleDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker/time-picker';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, differenceInMinutes, parse, startOfDay } from 'date-fns';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface OralTestScheduleFormProps {
    onSuccess: () => void;
    initialData?: IOralTestSchedule;
}

export default function OralTestScheduleForm({ onSuccess, initialData }: OralTestScheduleFormProps) {
    const { data: details } = useOralTestScheduleDetails() as any;
    const [selectedClassId, setSelectedClassId] = useState<number>(0);
    const { data: studentsResponse, isLoading: isStudentsLoading } = useClasswiseStudents(selectedClassId) as any;
    const { data: editData } = useOralTestScheduleSelectedRow(initialData?.paotS_Id || 0) as any;
    const { mutate: saveSchedule, isPending: isSaving } = useSaveOralTestSchedule();

    const [selectedStudents, setSelectedStudents] = useState<IStudentDetails[]>([]);
    const [allStudents, setAllStudents] = useState<IStudentDetails[]>([]);

    const form = useForm<OralTestScheduleFormValues>({
        resolver: zodResolver(oralTestScheduleSchema),
        defaultValues: {
            paotS_Id: 0,
            paotS_TPFlag: true, // true for minutes
            autostudent: true,
            paotS_Strength: 0,
            autoschedule: false,
            meetingvc: false,
            pavidc: false,
            stafflag: false,
            principalflg: false,
            managerflg: false,
            anybodystart: false,
        }
    });

    // Initialize edit data
    useEffect(() => {
        if (editData?.oralTestScheduleDetails?.[0]) {
            const data = editData.oralTestScheduleDetails[0];
            const child = editData.childarray?.[0];
            
            form.reset({
                paotS_Id: data.paotS_Id,
                paotS_ScheduleName: data.paotS_ScheduleName,
                asmcL_Id: String(child?.asmcL_Id || ''),
                paotS_ScheduleDate: new Date(data.paotS_ScheduleDate),
                paotS_ScheduleTime: parseTime(data.paotS_ScheduleTime),
                paotS_ScheduleTimeTo: parseTime(data.paotS_ScheduleTimeTo),
                paotS_Remarks: data.paotS_Remarks,
                paotS_Superviser: data.paotS_Superviser,
                paotS_Skills: data.paotS_Skills,
                paotS_TPFlag: data.paotS_TPFlag,
                paotS_TimePeriod: data.paotS_TimePeriod,
                paotS_Strength: data.paotS_Strength,
                autoschedule: data.paotS_ScheduleTime !== '' && data.paotS_ScheduleTimeTo !== '',
                meetingvc: data.paotS_MeetingVC,
                pavidc: data.paotS_PAVIDC,
                autostudent: false,
                stafflag: data.paotS_StaffMapping,
                principalflg: data.paotS_PrincipalMapping,
                managerflg: data.paotS_ManagerMapping,
                anybodystart: data.paotS_AnybodyCanStart,
            });

            if (child?.asmcL_Id) {
                setSelectedClassId(child.asmcL_Id);
            }

            if (editData.studentDetails) {
                setAllStudents(editData.studentDetails);
                setSelectedStudents(editData.studentDetails.filter((s: any) => s.checked));
            }
        }
    }, [editData, form]);

    // Handle class change
    useEffect(() => {
        if (studentsResponse?.studentDetails && !initialData) {
            setAllStudents(studentsResponse.studentDetails);
            setSelectedStudents([]);
        }
    }, [studentsResponse, initialData]);

    // Auto-select students logic
    const autostudent = form.watch('autostudent');
    const strength = form.watch('paotS_Strength');

    useEffect(() => {
        if (autostudent && strength > 0 && allStudents.length > 0) {
            const toSelect = allStudents.slice(0, strength);
            setSelectedStudents(toSelect);
        }
    }, [autostudent, strength, allStudents]);

    const studentColumns: ColumnDef<IStudentDetails>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value: any) => {
                        table.toggleAllPageRowsSelected(!!value);
                        if (value) {
                            setSelectedStudents(allStudents);
                        } else {
                            setSelectedStudents([]);
                        }
                    }}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedStudents.some(s => s.pasR_Id === row.original.pasR_Id)}
                    onCheckedChange={(value: any) => {
                        if (value) {
                            setSelectedStudents([...selectedStudents, row.original]);
                        } else {
                            setSelectedStudents(selectedStudents.filter(s => s.pasR_Id !== row.original.pasR_Id));
                        }
                    }}
                />
            ),
        },
        {
            accessorKey: 'pasR_RegistrationNo',
            header: 'Reg. No',
        },
        {
            accessorKey: 'pasR_FirstName',
            header: 'Student Name',
            cell: ({ row }) => `${row.original.pasR_FirstName} ${row.original.pasR_MiddleName || ''} ${row.original.pasR_LastName || ''}`,
        },
        {
            accessorKey: 'pasR_Sex',
            header: 'Sex',
        },
    ];

    function parseTime(timeStr: string) {
        if (!timeStr) return new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    async function onSubmit(values: OralTestScheduleFormValues) {
        // Time Validation
        const from = values.paotS_ScheduleTime;
        const to = values.paotS_ScheduleTimeTo;
        const diff = differenceInMinutes(to, from);

        const interactionTime = Number(values.paotS_TimePeriod);
        const totalNeeded = values.paotS_TPFlag 
            ? interactionTime * values.paotS_Strength 
            : (interactionTime * 60) * values.paotS_Strength;

        if (totalNeeded > diff) {
            toast.error(`Total interaction time (${totalNeeded} mins) exceeds schedule duration (${diff} mins)`);
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            ...values,
            PAOTS_ScheduleDate: format(values.paotS_ScheduleDate, 'yyyy-MM-dd'),
            PAOTS_ScheduleTime: format(values.paotS_ScheduleTime, 'HH:mm'),
            PAOTS_ScheduleTimeTo: format(values.paotS_ScheduleTimeTo, 'HH:mm'),
            ASMCL_Id: Number(values.asmcL_Id),
            PAOTS_TimePeriod: values.paotS_TimePeriod,
            PAOTS_TPFlag: values.paotS_TPFlag ? 'minutes' : 'hours',
            SelectedStudentData: selectedStudents.map(s => ({ pasR_Id: s.pasR_Id })),
            SelectedStudentDataForEdit: initialData ? selectedStudents.map(s => ({ pasR_Id: s.pasR_Id })) : [],
            stfids: [], // To be handled if staff mapping is implemented
        };

        saveSchedule(payload, {
            onSuccess: () => onSuccess()
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="paotS_ScheduleName"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Schedule Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter schedule name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="asmcL_Id"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select 
                                    onValueChange={(val: any) => {
                                        field.onChange(val);
                                        setSelectedClassId(Number(val));
                                    }} 
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {details?.classlist?.map((cls: any) => (
                                            <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                {cls.asmcL_ClassName}
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
                        name="paotS_ScheduleDate"
                        render={({ field }: any) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Schedule Date</FormLabel>
                                <DatePicker 
                                    date={field.value} 
                                    setDate={field.onChange} 
                                    placeholder="Pick a date"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paotS_ScheduleTime"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Time From</FormLabel>
                                <FormControl>
                                    <TimePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paotS_ScheduleTimeTo"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Time To</FormLabel>
                                <FormControl>
                                    <TimePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paotS_Strength"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>No. of Students</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="paotS_TPFlag"
                            render={({ field }: any) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Duration In</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={(val: any) => field.onChange(val === 'minutes')}
                                            value={field.value ? 'minutes' : 'hours'}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="minutes" id="minutes" />
                                                <Label htmlFor="minutes">Minutes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="hours" id="hours" />
                                                <Label htmlFor="hours">Hours</Label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paotS_TimePeriod"
                            render={({ field }: any) => (
                                <FormItem>
                                    <FormLabel>Interaction Time Per Student</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} placeholder={form.watch('paotS_TPFlag') ? "Minutes" : "Hours"} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
                        <FormField
                            control={form.control}
                            name="autoschedule"
                            render={({ field }: any) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Auto Schedule</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="meetingvc"
                            render={({ field }: any) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Meeting VC</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="autostudent"
                            render={({ field }: any) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Auto Select Students</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="paotS_Remarks"
                        render={({ field }: any) => (
                            <FormItem className="col-span-full">
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter remarks" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Student Selection</h3>
                            <div className="text-sm text-muted-foreground">
                                Selected: <span className="font-bold text-blue-600">{selectedStudents.length}</span> / {allStudents.length}
                            </div>
                        </div>
                        <div className="border rounded-md">
                            <GenericDataTable
                                data={allStudents}
                                columns={studentColumns}
                                isLoading={isStudentsLoading}
                                isSearchRequired={true}
                                loadingMessage="Fetching students..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSaving}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {initialData ? "Update Schedule" : "Save Schedule"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
