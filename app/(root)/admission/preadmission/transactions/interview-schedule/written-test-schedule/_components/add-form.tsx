'use client';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { writtenTestScheduleSchema, WrittenTestScheduleFormValues } from '@/schemas/admission/preadmission/transactions/written-test-schedule';
import { 
    useWrittenTestScheduleDetails, 
    useSaveWrittenTestSchedule,
    useWrittenTestSelectedRowDetails 
} from '@/hooks/admission/preadmission/transactions/use-written-test-schedule';
import { IWrittenTestSchedule, IStudentDetails } from '@/types/admission/preadmission/transactions/written-test-schedule';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { format, differenceInMinutes } from 'date-fns';
import { Loader2, Save, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

interface WrittenTestScheduleFormProps {
    onSuccess: () => void;
    initialData?: IWrittenTestSchedule;
}

export default function WrittenTestScheduleForm({ onSuccess, initialData }: WrittenTestScheduleFormProps) {
    const [selectedClassId, setSelectedClassId] = useState<number>(0);
    const { data: details, isLoading: isDetailsLoading } = useWrittenTestScheduleDetails(selectedClassId);
    const { data: editData } = useWrittenTestSelectedRowDetails(initialData?.pawtS_Id);
    const { mutate: saveSchedule, isPending: isSaving } = useSaveWrittenTestSchedule();

    const [selectedStudents, setSelectedStudents] = useState<IStudentDetails[]>([]);
    const [allStudents, setAllStudents] = useState<IStudentDetails[]>([]);

    const form = useForm<WrittenTestScheduleFormValues>({
        resolver: zodResolver(writtenTestScheduleSchema),
        defaultValues: {
            pawtS_Id: 0,
            pawtS_ScheduleName: '',
            asmcL_Id: '',
            pawtS_ScheduleDate: new Date(),
            pawtS_Remarks: '',
            pawtS_Superviser: '',
            pawtS_Skills: '',
            pawtS_ScheduleTime: '10:00',
            pawtS_ScheduleTimeTo: '11:00',
            NoOfStud: 0,
        }
    });

    // Initialize edit data
    useEffect(() => {
        if (editData && initialData) {
            const data = editData.writtenTestSchedule[0];
            const firstStudent = editData.selectedStudentDetails?.[0];
            
            form.reset({
                pawtS_Id: data.pawtS_Id,
                pawtS_ScheduleName: data.pawtS_ScheduleName || '',
                asmcL_Id: String(firstStudent?.asmcL_Id || ''),
                pawtS_ScheduleDate: new Date(data.pawtS_ScheduleDate),
                pawtS_ScheduleTime: data.pawtS_ScheduleTime || '10:00',
                pawtS_ScheduleTimeTo: data.pawtS_ScheduleTimeTo || '11:00',
                pawtS_Remarks: data.pawtS_Remarks || '',
                pawtS_Superviser: data.pawtS_Superviser || '',
                pawtS_Skills: data.pawtS_Skills || '',
                NoOfStud: editData.selectedStudentDetails?.length || 0,
            });

            if (firstStudent?.asmcL_Id) {
                setSelectedClassId(firstStudent.asmcL_Id);
            }

            if (editData.selectedStudentDetails) {
                // To avoid overriding the whole list, we set all students to the edited ones 
                // and selected ones to the edited ones initially.
                setAllStudents(editData.selectedStudentDetails);
                setSelectedStudents(editData.selectedStudentDetails);
            }
        }
    }, [editData, initialData, form]);

    // Handle class change
    useEffect(() => {
        if (details?.studentDetails && !initialData) {
            setAllStudents(details.studentDetails);
            setSelectedStudents([]);
        }
    }, [details?.studentDetails, initialData]);

    // Auto-select students logic
    const noOfStud = form.watch('NoOfStud');

    useEffect(() => {
        const strengthNum = Number(noOfStud);
        if (strengthNum > 0 && allStudents.length > 0) {
            const toSelect = allStudents.slice(0, strengthNum);
            setSelectedStudents(toSelect);
        } else if (strengthNum === 0 && !initialData) {
            setSelectedStudents([]);
        }
    }, [noOfStud, allStudents, initialData]);

    const studentColumns: ColumnDef<IStudentDetails>[] = useMemo(() => {
        const cols: ColumnDef<IStudentDetails>[] = [
            {
                id: 'slno',
                header: ({ column }) => <DataTableColumnHeader column={column} title="SL.NO" />,
                cell: ({ row }) => row.index + 1,
            },
            {
                accessorKey: 'pasR_FirstName',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Student Name" />,
                cell: ({ row }) => `${row.original.pasR_FirstName} ${row.original.pasR_MiddleName || ''} ${row.original.pasR_LastName || ''}`,
            },
            {
                accessorKey: 'pasR_RegistrationNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Registration No" />,
            },
            {
                accessorKey: 'classname',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Class" />,
            },
            {
                accessorKey: 'pasR_Sex',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
            },
            {
                accessorKey: 'pasR_MobileNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Mobile Number" />,
            },
            {
                accessorKey: 'pasR_EmailId',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Email No" />,
            },
            {
                id: 'select',
                header: ({ table, column }) => (
                    <div className="flex flex-col items-center gap-1">
                        <DataTableColumnHeader column={column} title="Action" className="text-black" />
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
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={selectedStudents.some(s => s.pasR_Id === row.original.pasR_Id)}
                            onCheckedChange={(value: any) => {
                                if (value) {
                                    setSelectedStudents(prev => {
                                        if (prev.some(s => s.pasR_Id === row.original.pasR_Id)) return prev;
                                        return [...prev, row.original];
                                    });
                                } else {
                                    setSelectedStudents(prev => prev.filter(s => s.pasR_Id !== row.original.pasR_Id));
                                }
                            }}
                        />
                    </div>
                ),
            }
        ];

        return cols;
    }, [allStudents, selectedStudents]);

    function parseTime(timeStr: string) {
        if (!timeStr) return new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    const onSubmit: SubmitHandler<WrittenTestScheduleFormValues> = async (values) => {
        // Time Validation
        const from = parseTime(values.pawtS_ScheduleTime);
        const to = parseTime(values.pawtS_ScheduleTimeTo);

        if (values.pawtS_ScheduleTime === values.pawtS_ScheduleTimeTo) {
            Swal.fire({
                title: 'Error!',
                text: 'Schedule Time From and Schedule Time To cannot be the same',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        const diff = differenceInMinutes(to, from);
        if (diff < 0) {
            Swal.fire({
                title: 'Error!',
                text: 'Schedule Time From should be less than Schedule Time To',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            PAWTS_ScheduleName: values.pawtS_ScheduleName,
            PAWTS_ScheduleTime: values.pawtS_ScheduleTime,
            PAWTS_ScheduleTimeTo: values.pawtS_ScheduleTimeTo,
            PAWTS_ScheduleDate: format(values.pawtS_ScheduleDate, 'yyyy-MM-dd'),
            PAWTS_AM_PM: from.getHours() >= 12 ? 'PM' : 'AM',
            PAWTS_Remarks: values.pawtS_Remarks || "",
            SelectedStudentData: selectedStudents,
            SelectedStudentDataForEdit: editData?.selectedStudentDetails || [],
            PAWTS_Superviser: values.pawtS_Superviser || "",
            PAWTS_Skills: values.pawtS_Skills || ""
        };

        saveSchedule(payload, {
            onSuccess: () => onSuccess()
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Section */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="pawtS_ScheduleName"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right">Schedule Name: <span className="text-red-500">*</span></FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input placeholder="Enter schedule name" {...field} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="asmcL_Id"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right">Class: <span className="text-red-500">*</span></FormLabel>
                                    <Select 
                                        onValueChange={(val: any) => {
                                            field.onChange(val);
                                            setSelectedClassId(Number(val));
                                        }} 
                                        value={field.value}
                                        disabled={!!initialData}
                                    >
                                        <FormControl className="col-span-3">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="0">All</SelectItem>
                                            {details?.admissioncatdrpall
                                                ?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="pawtS_ScheduleDate"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right">Date: <span className="text-red-500">*</span></FormLabel>
                                    <div className="col-span-3">
                                        <DatePicker 
                                            date={field.value} 
                                            setDate={field.onChange} 
                                            placeholder="Schedule Date"
                                        />
                                    </div>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="pawtS_Remarks"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right">Remarks:</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="pawtS_Superviser"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                                    <FormLabel className="text-right">Supervisor:</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Input {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="pawtS_Skills"
                            render={({ field }: any) => (
                                <FormItem className="grid grid-cols-4 items-start gap-4 space-y-0">
                                    <FormLabel className="text-right mt-2">Skill/Knowledge:</FormLabel>
                                    <FormControl className="col-span-3">
                                        <Textarea placeholder="Enter Skills/Knowledge" {...field} value={field.value || ''} className="min-h-[80px]" />
                                    </FormControl>
                                    <FormMessage className="col-start-2 col-span-3" />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Section */}
                    <div className="space-y-6">
                        <div className='grid grid-cols-1 gap-6 items-start'>
                            {/* Time Selectors Column */}
                            <div className="space-y-6">
                                <Controller
                                    name='pawtS_ScheduleTime'
                                    control={form.control as any}
                                    render={({ field }) => (
                                        <TimeSpinnerField
                                            label='Schedule Time From: *'
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={form.formState.errors.pawtS_ScheduleTime?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name='pawtS_ScheduleTimeTo'
                                    control={form.control as any}
                                    render={({ field }) => (
                                        <TimeSpinnerField
                                            label='Schedule Time To: *'
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            error={form.formState.errors.pawtS_ScheduleTimeTo?.message}
                                        />
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control as any}
                                name="NoOfStud"
                                render={({ field }: any) => (
                                    <FormItem className="flex items-center gap-4">
                                        <FormLabel className="font-bold w-40 text-right">Auto Select Students: </FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                {...field} 
                                                className="h-10 w-48 bg-slate-100" 
                                                placeholder="Enter Students Count"
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <div className="bg-blue-800 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h3 className="text-white font-bold text-sm uppercase">Student Selection</h3>
                            <div className="px-2 py-0.5 rounded bg-blue-700 text-[10px] text-white font-bold flex items-center gap-2">
                                Total Grid Records : <span className="bg-white text-blue-800 px-1 rounded">{allStudents.length}</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-blue-100 font-bold uppercase flex items-center gap-2">
                            Selected: <span className="px-2 py-0.5 rounded bg-blue-700 text-white">{selectedStudents.length} / {allStudents.length}</span>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <div className="[&_thead_tr_th]:text-black [&_thead_tr_th]:font-bold [&_thead_tr_th]:py-3 [&_thead_tr_th]:text-[11px] [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black [&_tbody_tr:nth-child(even)]:bg-slate-50">
                            <GenericDataTable
                                data={allStudents}
                                columns={studentColumns}
                                isLoading={isDetailsLoading}
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

// ─── Reusable Time Spinner ────────────────────────────────────────────────────
function TimeSpinnerField({
    label,
    value,
    onChange,
    error
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    error?: string;
}) {
    const hoursRef = useRef<HTMLDivElement>(null);
    const minutesRef = useRef<HTMLDivElement>(null);
    const ampmRef = useRef<HTMLDivElement>(null);

    // Parse "HH:mm" (24h) → h (1-12), mm, ampm
    function parse(v: string) {
        if (!v) return { h: 12, m: 0, ap: 'AM' };
        const parts = v.split(':');
        let hh = parseInt(parts[0]) || 0;
        const mm = parseInt(parts[1]) || 0;
        let ap = 'AM';
        if (hh >= 12) {
            ap = 'PM';
            if (hh > 12) hh -= 12;
        } else if (hh === 0) {
            hh = 12;
        }
        return { h: hh, m: mm, ap };
    }

    const { h, m, ap } = parse(value);

    // Update value internally
    function update(newH: number, newM: number, newAp: string) {
        let hr24 = newH;
        if (newAp === 'PM' && hr24 !== 12) hr24 += 12;
        if (newAp === 'AM' && hr24 === 12) hr24 = 0;
        const val = `${String(hr24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
        onChange(val);
    }

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
                <Label className="text-right w-40 font-bold">{label}</Label>
                <div className="flex items-center border rounded-md px-3 py-1 shadow-sm bg-white hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-fit">
                    
                    {/* HOURS */}
                    <div className="flex flex-col items-center">
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h === 12 ? 1 : h + 1, m, ap)}>
                            <ChevronUp className="h-4 w-4" />
                        </button>
                        <div 
                            ref={hoursRef}
                            className="w-8 text-center text-lg focus:outline-none focus:bg-blue-50 rounded"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                let val = parseInt(e.currentTarget.textContent || '12');
                                if (isNaN(val) || val < 1 || val > 12) val = 12;
                                e.currentTarget.textContent = String(val).padStart(2, '0');
                                update(val, m, ap);
                            }}
                        >
                            {String(h).padStart(2, '0')}
                        </div>
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h === 1 ? 12 : h - 1, m, ap)}>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    <span className="text-xl mx-1 font-bold text-slate-300 pb-1">:</span>

                    {/* MINUTES */}
                    <div className="flex flex-col items-center">
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h, (m + 1) % 60, ap)}>
                            <ChevronUp className="h-4 w-4" />
                        </button>
                        <div 
                            ref={minutesRef}
                            className="w-8 text-center text-lg focus:outline-none focus:bg-blue-50 rounded"
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) => {
                                let val = parseInt(e.currentTarget.textContent || '0');
                                if (isNaN(val) || val < 0 || val > 59) val = 0;
                                e.currentTarget.textContent = String(val).padStart(2, '0');
                                update(h, val, ap);
                            }}
                        >
                            {String(m).padStart(2, '0')}
                        </div>
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h, m === 0 ? 59 : m - 1, ap)}>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>

                    {/* AM/PM */}
                    <div className="flex flex-col items-center ml-2 border-l pl-2">
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h, m, ap === 'AM' ? 'PM' : 'AM')}>
                            <ChevronUp className="h-4 w-4" />
                        </button>
                        <div 
                            ref={ampmRef}
                            className="w-10 text-center font-medium focus:outline-none focus:bg-blue-50 rounded cursor-pointer select-none"
                            onClick={() => update(h, m, ap === 'AM' ? 'PM' : 'AM')}
                        >
                            {ap}
                        </div>
                        <button type="button" tabIndex={-1} className="text-slate-400 hover:text-black p-0.5" onClick={() => update(h, m, ap === 'AM' ? 'PM' : 'AM')}>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
            {error && <span className="text-xs text-red-500 font-medium ml-[176px]">{error}</span>}
        </div>
    );
}


