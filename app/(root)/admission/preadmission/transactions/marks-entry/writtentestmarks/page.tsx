'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Search, X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    useWrittenTestMarksInitialData,
    useWrittenTestMarksStudents,
    useWrittenTestMarksGrid,
    useSaveWrittenTestMarks
} from '@/hooks/admission/preadmission/transactions/use-written-test-marks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const searchSchema = z.object({
    pawtS_Id: z.string().optional(),
    ismS_Id: z.string().min(1, 'Please Select Subject'),
    selectedStudents: z.array(z.string()).min(1, 'Please Select Students')
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function WrittenTestMarksPage() {
    const [gridData, setGridData] = useState<any[]>([]);
    const [marksHeaders, setMarksHeaders] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Fetch initial data
    const { data: initialData, isLoading: initialLoading } = useWrittenTestMarksInitialData();

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            pawtS_Id: '',
            ismS_Id: '',
            selectedStudents: []
        }
    });

    const watchScheduleId = form.watch('pawtS_Id');
    const watchSelectedStudents = form.watch('selectedStudents');

    const { data: studentsData, isLoading: studentsLoading } = useWrittenTestMarksStudents(
        watchScheduleId ? Number(watchScheduleId) : null
    );

    const { mutate: fetchGrid, isPending: isFetchingGrid } = useWrittenTestMarksGrid();
    const { mutate: saveMarks, isPending: isSaving } = useSaveWrittenTestMarks();

    useEffect(() => {
        const sourceDetails = studentsData?.studentDetails || (!watchScheduleId ? initialData?.studentDetails : null);
        if (sourceDetails) {
            const formatted = sourceDetails.map((student: any, idx: number) => {
                const nameParts = [student.pasR_FirstName, student.pasR_MiddleName, student.pasR_LastName].filter(Boolean);
                return {
                    ...student,
                    pasR_Id: student.pasR_Id || student.pasr_id || student.PASR_Id || student.pasr_Id || `student-${idx}`,
                    fullName: student.studentName || nameParts.join(' ')
                };
            });
            setAllStudents(formatted);

            // Auto-select all by default when new students are loaded
            const allIds = formatted.map((s: any) => String(s.pasR_Id));
            form.setValue('selectedStudents', allIds);
            setSelectAll(true);
        } else {
            setAllStudents([]);
        }
    }, [studentsData, initialData, watchScheduleId]);

    useEffect(() => {
        if (initialData && (!initialData.subjectNames || initialData.subjectNames.length === 0)) {
            form.setValue('ismS_Id', 'Select ALL');
        }
    }, [initialData, form]);

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            form.setValue('selectedStudents', allStudents.map(s => String(s.pasR_Id)));
        } else {
            form.setValue('selectedStudents', []);
        }
    };

    const handleStudentToggle = (id: string, checked: boolean) => {
        const current = form.getValues('selectedStudents');
        if (checked) {
            form.setValue('selectedStudents', [...current, id]);
        } else {
            form.setValue('selectedStudents', current.filter(s => s !== id));
            setSelectAll(false);
        }
    };

    const onSubmitSearch = (values: SearchFormValues) => {
        if (initialData?.writtenTestSchedule?.length > 0 && !values.pawtS_Id) {
            form.setError('pawtS_Id', { type: 'manual', message: 'Please Select Schedule Name' });
            return;
        }

        const selectedStudentDetails = allStudents.filter(s =>
            values.selectedStudents.includes(String(s.pasR_Id))
        ).map(s => ({
            ...s,
            checked: true
        }));

        fetchGrid(
            {
                selectedStudentDetails: selectedStudentDetails.map(s => ({
                    pasR_Id: typeof s.pasR_Id === 'string' && s.pasR_Id.startsWith('student-') ? 0 : Number(s.pasR_Id)
                })),
                ismS_Id: values.ismS_Id === 'Select ALL' ? 0 : Number(values.ismS_Id),
            },
            {
                onSuccess: (data: any) => {
                    const marksData = Array.isArray(data) ? data : data?.allInOne1 || data?.wirettenTestStudentMarks || [];

                    // Extract headers
                    const headers = marksData
                        .filter((item: any) => item.flagsubject === 'Common')
                        .map((item: any) => ({
                            header: `${item.ismS_SubjectName} (${item.ismS_Max_Marks})`,
                            key: item.ismS_SubjectName,
                            maxMarks: item.ismS_Max_Marks,
                            ismS_Id: item.ismS_Id
                        }));

                    // Deduplicate headers
                    const uniqueHeaders = Array.from(new Map(headers.map((item: any) => [item.key, item])).values());

                    // Format rows
                    const rows = selectedStudentDetails.map(student => {
                        const studentMarks = marksData.filter((m: any) =>
                            String(m.pasR_Id) === String(student.pasR_Id) ||
                            String(m.pasr_id) === String(student.pasR_Id)
                        );

                        const completeMarks = uniqueHeaders.map((header: any) => {
                            const existing = studentMarks.find((m: any) => m.ismS_SubjectName === header.key);
                            return existing || {
                                pasR_Id: student.pasR_Id,
                                ismS_Id: header.ismS_Id,
                                ismS_SubjectName: header.key,
                                obtMarks: '',
                                ismS_Max_Marks: header.maxMarks
                            };
                        });

                        return {
                            ...student,
                            marks: completeMarks
                        };
                    });

                    setMarksHeaders(uniqueHeaders as any);
                    setGridData(rows);
                }
            }
        );
    };

    const onSaveMarks = () => {
        const pawtsId = Number(form.getValues('pawtS_Id'));
        const selectedStudentMarksData = gridData.flatMap(student => student.marks);

        // Validation for marks exceeding max marks
        const hasInvalidMarks = selectedStudentMarksData.some(
            mark => mark.obtMarks !== undefined && mark.obtMarks !== null && Number(mark.obtMarks) > mark.ismS_Max_Marks
        );

        if (hasInvalidMarks) {
            alert('Some entered marks exceed the maximum allowed marks!');
            return;
        }

        const hasEmptyMarks = selectedStudentMarksData.some(
            mark => mark.obtMarks === undefined || mark.obtMarks === null || mark.obtMarks === ''
        );

        if (hasEmptyMarks) {
            alert('Please enter all marks before saving.');
            return;
        }

        saveMarks(
            {
                selectedStudentMarksData: selectedStudentMarksData.map(m => ({
                    pasR_Id: Number(m.pasR_Id) || Number(m.pasr_id) || 0,
                    ismS_Id: Number(m.ismS_Id) || 0,
                    obtMarks: Number(m.obtMarks) || 0
                })),
                writtenTestScheduleAppFlag: initialData?.writtenTestScheduleAppFlag === 1 ? 'true' : 'false',
                pawtS_Id: pawtsId,
                paswM_Id: 0
            },
            {
                onSuccess: () => {
                    setGridData([]);
                    form.reset();
                    window.location.reload();
                }
            }
        );
    };

    const handleMarkChange = (studentId: string | number, subjectName: string, value: string) => {
        setGridData(prev => prev.map(student => {
            if (String(student.pasR_Id) === String(studentId)) {
                return {
                    ...student,
                    marks: student.marks.map((m: any) => {
                        if (m.ismS_SubjectName === subjectName) {
                            return { ...m, obtMarks: value };
                        }
                        return m;
                    })
                };
            }
            return student;
        }));
    };

    if (initialData?.chq_config === false) {
        return (
            <div className="container space-y-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                        PLEASE CHECK CONFIGURATION!
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container space-y-4 py-6">
            <div className="flex items-center justify-between no-print">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-blue-800">Written\Apptitude Test Marks</h1>
                    <p className="text-muted-foreground">Update the student&apos;s written test marks based on schedule and subject.</p>
                </div>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSearch)}>
                    <CollapsibleSection title="Search Schedule" defaultOpen={true}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {(initialData?.writtenTestSchedule?.length > 0) && (
                                    <FormField
                                        control={form.control}
                                        name="pawtS_Id"
                                        render={({ field }) => (
                                            <FormItem className="grid grid-cols-3 items-center gap-4">
                                                <FormLabel className="text-right">Schedule Name <span className="text-red-500">*</span></FormLabel>
                                                <div className="col-span-2">
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={initialLoading}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select Schedule Name" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {initialData?.writtenTestSchedule?.map((sc: any, idx: number) => (
                                                                <SelectItem key={sc.pawtS_Id || `sc-${idx}`} value={String(sc.pawtS_Id || `sc-${idx}`)}>
                                                                    {sc.pawtS_ScheduleName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {form.formState.errors.pawtS_Id && (
                                                        <span className="text-sm text-red-500 font-medium mt-1 block">
                                                            {form.formState.errors.pawtS_Id.message}
                                                        </span>
                                                    )}
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="ismS_Id"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-3 items-center gap-4">
                                            <FormLabel className="text-right">Subject <span className="text-red-500">*</span></FormLabel>
                                            <div className="col-span-2">
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!initialData?.subjectNames?.length}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Subject Name" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Select ALL">Select ALL</SelectItem>
                                                        {initialData?.subjectNames?.map((sub: any, idx: number) => (
                                                            <SelectItem key={sub.ismS_Id || `sub-${idx}`} value={String(sub.ismS_Id || `sub-${idx}`)}>
                                                                {sub.ismS_SubjectName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                {allStudents.length > 0 && (
                                    <FormField
                                        control={form.control}
                                        name="selectedStudents"
                                        render={() => (
                                            <FormItem>
                                                <div className="flex items-center space-x-2 mb-2 bg-slate-50 p-2 rounded border">
                                                    <Checkbox
                                                        checked={selectAll}
                                                        onCheckedChange={handleSelectAll}
                                                        id="select-all"
                                                    />
                                                    <label htmlFor="select-all" className="text-sm font-medium leading-none">
                                                        Select All Students
                                                    </label>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto border rounded p-2 bg-white space-y-2">
                                                    {allStudents.map((student, idx) => {
                                                        const studentKey = student.pasR_Id || `student-${idx}`;
                                                        return (
                                                            <div key={studentKey} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    checked={watchSelectedStudents.includes(String(studentKey))}
                                                                    onCheckedChange={(checked) => handleStudentToggle(String(studentKey), checked as boolean)}
                                                                    id={`student-${studentKey}`}
                                                                />
                                                                <label htmlFor={`student-${studentKey}`} className="text-sm font-medium leading-none">
                                                                    {student.fullName}
                                                                </label>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {studentsLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading students...</p>}
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-6">
                            <Button type="submit" className="w-32" disabled={isFetchingGrid}>
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                            <Button type="button" variant="destructive" className="w-32" onClick={() => {
                                form.reset();
                                setGridData([]);
                            }}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>
            </FormProvider>

            {gridData.length > 0 && (
                <CollapsibleSection title="Student List" defaultOpen={true}>
                    <div className="mb-4">
                        <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full border">
                            Total Grid Records: {gridData.length}
                        </span>
                    </div>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3 border-b border-r text-center">SL.NO</th>
                                    <th className="px-6 py-3 border-b border-r">Student Name</th>
                                    <th className="px-6 py-3 border-b border-r">Registration No</th>
                                    {/* <th className="px-6 py-3 border-b border-r">Class</th> */}
                                    {marksHeaders.map((header, idx) => (
                                        <th key={idx} className="px-6 py-3 border-b text-center border-r last:border-r-0">
                                            {header.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {gridData.map((student, index) => {
                                    const studentKey = student.pasR_Id || `grid-student-${index}`;
                                    return (
                                        <tr key={studentKey} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 border-r text-center font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 border-r">{student.fullName}</td>
                                            <td className="px-6 py-4 border-r">{student.pasR_RegistrationNo || student.regno}</td>
                                            {/* <td className="px-6 py-4 border-r">{student.classname}</td> */}
                                            {marksHeaders.map((header) => {
                                                const mark = student.marks.find((m: any) => m.ismS_SubjectName === header.key);
                                                const isError = mark?.obtMarks !== undefined && mark?.obtMarks !== '' && Number(mark.obtMarks) > header.maxMarks;
                                                return (
                                                    <td key={header.key} className="px-6 py-4 border-r last:border-r-0">
                                                        {mark ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    value={mark.obtMarks !== undefined && mark.obtMarks !== null ? mark.obtMarks : ''}
                                                                    onChange={(e) => handleMarkChange(student.pasR_Id, header.key, e.target.value)}
                                                                    max={header.maxMarks}
                                                                    min={0}
                                                                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${isError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-blue-500'
                                                                        }`}
                                                                    placeholder={`Max ${header.maxMarks}`}
                                                                    required
                                                                />
                                                                {isError && (
                                                                    <span className="text-xs text-red-500 block mt-1">
                                                                        Must be ≤ {header.maxMarks}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400 italic">N/A</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button onClick={onSaveMarks} disabled={isSaving} className="w-32 bg-green-600 hover:bg-green-700">
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
