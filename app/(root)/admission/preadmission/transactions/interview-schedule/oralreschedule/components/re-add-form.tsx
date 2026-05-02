'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { oralReScheduleSchema, OralReScheduleFormValues } from '@/schemas/admission/preadmission/transactions/oral-test-schedule';
import { 
    useOralReScheduleDetails, 
    useReScheduleReportDetails, 
    useSaveOralReSchedule,
    useReScheduleSelectedRow 
} from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import { IOralTestSchedule, IStudentDetails } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker/time-picker';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format, differenceInMinutes } from 'date-fns';
import { Loader2, Save, RotateCcw, Trash, ShoppingCart } from 'lucide-react';

interface OralReScheduleFormProps {
    onSuccess: () => void;
    initialData?: IOralTestSchedule;
}

export default function OralReScheduleForm({ onSuccess, initialData }: OralReScheduleFormProps) {
    const { data: details } = useOralReScheduleDetails() as any;
    const [selectedPrevId, setSelectedPrevId] = useState<number>(0);
    const { data: reportResponse, isLoading: isReportLoading } = useReScheduleReportDetails(selectedPrevId) as any;
    const { mutate: saveSchedule, isPending: isSaving } = useSaveOralReSchedule();

    const [availableStudents, setAvailableStudents] = useState<IStudentDetails[]>([]);
    const [cartStudents, setCartStudents] = useState<IStudentDetails[]>([]);

    const form = useForm<OralReScheduleFormValues>({
        resolver: zodResolver(oralReScheduleSchema),
        defaultValues: {
            paotS_Id: 0,
            previousScheduleId: '',
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

    // Handle initial available students
    useEffect(() => {
        if (reportResponse?.allreports) {
            setAvailableStudents(reportResponse.allreports);
        }
    }, [reportResponse]);

    // Auto-select logic
    const autostudent = form.watch('autostudent');
    const strength = form.watch('paotS_Strength');

    useEffect(() => {
        if (autostudent && strength > 0 && availableStudents.length > 0) {
            const toSelect = availableStudents.slice(0, Math.min(strength, availableStudents.length));
            setCartStudents(toSelect);
        }
    }, [autostudent, strength, availableStudents]);

    const availableColumns: ColumnDef<IStudentDetails>[] = [
        {
            id: 'select',
            header: 'Select',
            cell: ({ row }) => (
                <Checkbox
                    checked={cartStudents.some(s => s.pasR_Id === row.original.pasR_Id)}
                    onCheckedChange={(value: any) => {
                        if (value) {
                            if (cartStudents.length < strength) {
                                setCartStudents([...cartStudents, row.original]);
                            } else {
                                toast.error(`Cannot select more than ${strength} students`);
                            }
                        } else {
                            setCartStudents(cartStudents.filter(s => s.pasR_Id !== row.original.pasR_Id));
                        }
                    }}
                />
            ),
        },
        { accessorKey: 'regno', header: 'Reg. No' },
        { accessorKey: 'name', header: 'Student Name' },
        { accessorKey: 'gender', header: 'Gender' },
        { 
            accessorKey: 'ScheduleDate', 
            header: 'Prev. Date',
            cell: ({ row }) => row.original.ScheduleDate ? format(new Date(row.original.ScheduleDate), 'dd-MM-yyyy') : ''
        },
        {
            id: 'time',
            header: 'Prev. Time',
            cell: ({ row }) => `${row.original.ScheduleTime || ''} - ${row.original.ScheduleTimeTo || ''}`
        }
    ];

    const cartColumns: ColumnDef<IStudentDetails>[] = [
        { accessorKey: 'regno', header: 'Reg. No' },
        { accessorKey: 'name', header: 'Student Name' },
        { accessorKey: 'gender', header: 'Gender' },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => setCartStudents(cartStudents.filter(s => s.pasR_Id !== row.original.pasR_Id))}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            )
        }
    ];

    async function onSubmit(values: OralReScheduleFormValues) {
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

        if (cartStudents.length === 0) {
            toast.error('Please select at least one student to cart');
            return;
        }

        const payload = {
            ...values,
            PAOTS_Id: Number(values.previousScheduleId),
            PAOTS_ScheduleName: values.paotS_ScheduleName,
            PAOTS_ScheduleDate: format(values.paotS_ScheduleDate, 'yyyy-MM-dd'),
            PAOTS_ScheduleTime: format(values.paotS_ScheduleTime, 'HH:mm'),
            PAOTS_ScheduleTimeTo: format(values.paotS_ScheduleTimeTo, 'HH:mm'),
            PAOTS_TimePeriod: values.paotS_TimePeriod,
            PAOTS_TPFlag: values.paotS_TPFlag,
            PAOTS_Strength: values.paotS_Strength,
            PAOTS_Remarks: values.paotS_Remarks,
            PAOTS_Superviser: values.paotS_Superviser,
            PAOTS_Skills: values.paotS_Skills,
            meetingvc: values.meetingvc,
            SelectedStudentData: cartStudents.map(s => ({ ...s })),
            SelectedStudentDataForEdit: [],
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
                        name="previousScheduleId"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Previous Schedule</FormLabel>
                                <Select 
                                    onValueChange={(val: any) => {
                                        field.onChange(val);
                                        setSelectedPrevId(Number(val));
                                    }} 
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Previous Schedule" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {details?.oralTestSchedule?.map((sch: any) => (
                                            <SelectItem key={sch.paotS_Id} value={String(sch.paotS_Id)}>
                                                {sch.paotS_ScheduleName}
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
                        name="paotS_ScheduleName"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>Re-Schedule Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter reschedule name" {...field} />
                                </FormControl>
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
                                    <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
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
                            name="meetingvc"
                            render={({ field }: any) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Video Conferencing</FormLabel>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">Scheduled Student List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable 
                                data={availableStudents} 
                                columns={availableColumns} 
                                isLoading={isReportLoading}
                                isSearchRequired={true}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-blue-100 bg-blue-50/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-md flex items-center gap-2 text-blue-700">
                                <ShoppingCart className="h-4 w-4" /> Selected Students (Cart)
                            </CardTitle>
                            <div className="text-sm font-medium">
                                Count: {cartStudents.length} / {strength}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <GenericDataTable 
                                data={cartStudents} 
                                columns={cartColumns} 
                                isLoading={false}
                                isSearchRequired={true}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isSaving}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {initialData ? "Update Re-Schedule" : "Save Re-Schedule"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
