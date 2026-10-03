'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { InputText } from '@/components/ui/extension/input-text';
import { InputNumber } from '@/components/ui/extension/input-number';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Search, Save, X, Edit, Plus, Minus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getInitialData, 
    saveData1, 
    getCourses, 
    getBranches, 
    getSemesters, 
    getStudents, 
    saveData2, 
} from '@/server/college/CollegeAdmission/Transactions/atten-batch-mapping';

const batchSchema = z.object({
    batchName: z.string().min(1, 'Enter the Batch Name').max(100, 'Max 100 characters'),
    batchStrength: z.preprocess((val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        return Number(val);
    }, z.number({ required_error: 'Enter the Batch Strength', invalid_type_error: 'Allow only numbers' }).min(1, 'Batch Strength must be at least 1').max(9999, 'Max 4 digits')),
});

const mappingSchema = z.object({
    academicYear: z.string().min(1, 'Select Academic Year'),
    course: z.string().min(1, 'Select Course'),
    branch: z.string().min(1, 'Select Branch'),
    semester: z.string().min(1, 'Select Semester'),
    section: z.string().min(1, 'Select Section'),
    batch: z.string().min(1, 'Select Atten. Batch'),
    subject: z.string().min(1, 'Select Subject'),
});

export const AttenBatchMappingWrapper = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('batch');
    const [showBatchForm, setShowBatchForm] = useState(false);

    // Batch Tab State
    const [batchId, setBatchId] = useState<number>(0);
    const [searchBatch, setSearchBatch] = useState('');

    // Mapping Tab State
    const [studentList, setStudentList] = useState<any[]>([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [savedData, setSavedData] = useState<any[]>([]);

    const batchForm = useForm<z.infer<typeof batchSchema>>({
        resolver: zodResolver(batchSchema),
        defaultValues: { batchName: '', batchStrength: undefined }
    });

    const mappingForm = useForm<z.infer<typeof mappingSchema>>({
        resolver: zodResolver(mappingSchema),
        defaultValues: { academicYear: '', course: '', branch: '', semester: '', section: '', batch: '', subject: '' }
    });

    const watchAcademicYear = mappingForm.watch('academicYear');
    const watchCourse = mappingForm.watch('course');
    const watchBranch = mappingForm.watch('branch');

    // --- React Query Hooks for Fetching ---

    const { data: initialData, isLoading: isLoadingInitial } = useQuery({
        queryKey: ['attenBatchMapping', 'initialData'],
        queryFn: async () => {
            const res = await getInitialData();
            if (res?.data) {
                return {
                    yearList: res.data.yearlist || [],
                    batchList: res.data.batchlist || [],
                    sectionList: res.data.sectionlist || [],
                    subjectList: (res.data.subjectlist || []).map((dd: any) => ({
                        ...dd,
                        displaySubjectName: `${dd.ismS_SubjectName}:${dd.ismS_SubjectCode}`
                    }))
                };
            }
            return { yearList: [], batchList: [], sectionList: [], subjectList: [] };
        }
    });

    const { data: courseList = [], isFetching: isFetchingCourses } = useQuery({
        queryKey: ['attenBatchMapping', 'courses', watchAcademicYear],
        queryFn: async () => {
            const res = await getCourses(Number(watchAcademicYear));
            return res?.data?.courselist || [];
        },
        enabled: !!watchAcademicYear
    });

    const { data: branchList = [], isFetching: isFetchingBranches } = useQuery({
        queryKey: ['attenBatchMapping', 'branches', watchAcademicYear, watchCourse],
        queryFn: async () => {
            const res = await getBranches(Number(watchAcademicYear), Number(watchCourse));
            return res?.data?.branchlist || [];
        },
        enabled: !!watchAcademicYear && !!watchCourse
    });

    const { data: semesterList = [], isFetching: isFetchingSemesters } = useQuery({
        queryKey: ['attenBatchMapping', 'semesters', watchAcademicYear, watchCourse, watchBranch],
        queryFn: async () => {
            const res = await getSemesters(
                Number(watchAcademicYear), 
                Number(watchCourse), 
                Number(watchBranch) 
            );
            return res?.data?.semisterlist || [];
        },
        enabled: !!watchAcademicYear && !!watchCourse && !!watchBranch
    });

    useEffect(() => {
        if (watchAcademicYear) {
            mappingForm.setValue('course', '');
            mappingForm.setValue('branch', '');
            mappingForm.setValue('semester', '');
            setStudentList([]);
        }
    }, [watchAcademicYear]);

    useEffect(() => {
        if (watchCourse && watchAcademicYear) {
            mappingForm.setValue('branch', '');
            mappingForm.setValue('semester', '');
            setStudentList([]);
        }
    }, [watchCourse, watchAcademicYear]);

    useEffect(() => {
        if (watchBranch && watchCourse && watchAcademicYear) {
            mappingForm.setValue('semester', '');
            setStudentList([]);
        }
    }, [watchBranch, watchCourse, watchAcademicYear]);


    // --- React Query Mutations ---

    const saveBatchMutation = useMutation({
        mutationFn: (data: any) => saveData1(data),
        onSuccess: (res) => {
            if (res?.success) {
                toast.success(res?.message || (batchId > 0 ? 'Record Updated Successfully' : 'Record Saved Successfully'));
                
                if (res?.data) {
                    queryClient.setQueryData(['attenBatchMapping', 'initialData'], (oldData: any) => ({
                        ...oldData,
                        batchList: res.data.batchlist || oldData?.batchList,
                        yearList: res.data.yearlist || oldData?.yearList,
                        sectionList: res.data.sectionlist || oldData?.sectionList,
                        subjectList: res.data.subjectlist ? res.data.subjectlist.map((dd: any) => ({
                            ...dd,
                            displaySubjectName: `${dd.ismS_SubjectName}:${dd.ismS_SubjectCode}`
                        })) : oldData?.subjectList
                    }));
                } else {
                    queryClient.invalidateQueries({ queryKey: ['attenBatchMapping', 'initialData'] });
                }
                
                handleClearBatch();
            } else if (res?.success === false) {
                toast.error(res?.message || (batchId > 0 ? 'Failed To Update Record' : 'Failed To Save Record'));
            } else if (res?.data?.returnval) {
                toast.success(batchId > 0 ? 'Record Updated Successfully' : 'Record Saved Successfully');
                queryClient.invalidateQueries({ queryKey: ['attenBatchMapping', 'initialData'] });
                handleClearBatch();
            } else if (res?.data?.returnduplicatestatus) {
                toast.error('Record Already Exist');
            } else {
                toast.error(batchId > 0 ? 'Failed To Update Record' : 'Failed To Save Record');
            }
        }
    });

    const searchStudentsMutation = useMutation({
        mutationFn: (data: any) => getStudents(data),
        onSuccess: (res) => {
            if (res?.data) {
                const fetchedStudents = res.data.studentlist || [];
                const savedStuds = res.data.saveddata || [];
                setSavedData(savedStuds);

                const mappedStudents = fetchedStudents.map((stud: any) => ({
                    ...stud,
                    selected: savedStuds.includes(stud.amcsT_Id)
                }));
                
                setStudentList(mappedStudents);
                
                if (mappedStudents.length === 0) {
                    toast.info('No Students Found');
                }
            }
        }
    });

    const saveMappingMutation = useMutation({
        mutationFn: (data: any) => saveData2(data),
        onSuccess: (res) => {
            if (res?.data?.returnval) {
                toast.success(savedData.length > 0 ? "Record Updated Successfully" : "Record Saved Successfully");
                handleClearMapping();
            } else {
                toast.error(savedData.length > 0 ? "Failed To Update Record" : "Failed To Save Record");
            }
        }
    });


    // --- Handlers ---

    const onBatchSubmit = (values: z.infer<typeof batchSchema>) => {
        saveBatchMutation.mutate({
            acaB_Id: batchId,
            mI_Id: 0,
            acaB_BatchName: values.batchName,
            acaB_StudentStrength: Number(values.batchStrength)
        });
    };

    const handleClearBatch = () => {
        batchForm.reset({ batchName: '', batchStrength: undefined });
        setBatchId(0);
        setSearchBatch('');
        setShowBatchForm(false);
    };

    const handleEditBatch = (batchData: any) => {
        setBatchId(batchData.acaB_Id);
        batchForm.setValue('batchName', batchData.acaB_BatchName);
        batchForm.setValue('batchStrength', batchData.acaB_StudentStrength || undefined);
        setShowBatchForm(true);
    };

    const onMappingSearch = (values: z.infer<typeof mappingSchema>) => {
        searchStudentsMutation.mutate({
            ASMAY_Id: Number(values.academicYear),
            ACAB_Id: Number(values.batch),
            AMCO_Id: Number(values.course),
            AMB_Id: Number(values.branch),
            AMSE_Id: Number(values.semester),
            ACMS_Id: Number(values.section),
            ISMS_Id: Number(values.subject)
        });
    };

    const handleSaveMapping = () => {
        const selectedStudents = studentList.filter(s => s.selected);
        if (selectedStudents.length === 0) {
            toast.error("Select At least one Student To Save Data!!!");
            return;
        }

        const values = mappingForm.getValues();
        const selectedBatch = initialData?.batchList?.find((b: any) => b.acaB_Id === Number(values.batch));
        const batchStrengthVal = selectedBatch ? selectedBatch.acaB_StudentStrength : 0;

        if (selectedStudents.length > batchStrengthVal) {
            toast.error(`Can't Map Students More Than Batch Strength !!! (${batchStrengthVal})`);
            return;
        }

        const studentIds = selectedStudents.map(s => s.amcsT_Id);

        saveMappingMutation.mutate({
            asmaY_Id: Number(values.academicYear),
            amcO_Id: Number(values.course),
            amB_Id: Number(values.branch),
            amsE_Id: Number(values.semester),
            acmS_Id: Number(values.section),
            ismS_Id: Number(values.subject),
            acaB_Id: Number(values.batch),
            acabS_Id: 0,
            sub_data: studentIds
        });
    };

    const handleClearMapping = () => {
        mappingForm.reset({ academicYear: '', course: '', branch: '', semester: '', section: '', batch: '', subject: '' });
        setStudentList([]);
        setSearchStudent('');
    };

    // --- Derived state for UI ---
    const isLoadingGlobal = isLoadingInitial || saveBatchMutation.isPending || searchStudentsMutation.isPending || saveMappingMutation.isPending;

    const filteredBatchList = (initialData?.batchList || []).filter((b: any) => 
        b.acaB_BatchName?.toLowerCase().includes(searchBatch.toLowerCase())
    );

    const filteredStudents = studentList.filter(s => 
        (s.amcsT_FirstName || '').toLowerCase().includes(searchStudent.toLowerCase()) ||
        (s.amcsT_AdmNo || '').toLowerCase().includes(searchStudent.toLowerCase())
    );

    if (isLoadingInitial) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                    <TabsTrigger value="batch">Attendance Batch</TabsTrigger>
                    <TabsTrigger value="mapping">Attendance Batch Mapping</TabsTrigger>
                </TabsList>

                {/* TAB 1: Attendance Batch */}
                <TabsContent value="batch" className="space-y-6">
                    <div className="flex justify-end">
                        <Button 
                            onClick={() => setShowBatchForm(!showBatchForm)} 
                            className="bg-[#f25e36] hover:bg-[#d64e29] text-white rounded-full px-6"
                        >
                            {showBatchForm ? <Minus className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                            {showBatchForm ? 'Close' : 'Add New Batch'}
                        </Button>
                    </div>

                    {showBatchForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Batch</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...batchForm}>
                                <form onSubmit={batchForm.handleSubmit(onBatchSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                        <InputText
                                            label="Batch Name"
                                            id="batchName"
                                            placeholder="Enter Batch Name"
                                            required
                                            {...batchForm.register('batchName')}
                                            error={batchForm.formState.errors.batchName?.message}
                                            disabled={isLoadingGlobal}
                                        />
                                        <Controller
                                            name="batchStrength"
                                            control={batchForm.control}
                                            render={({ field, fieldState }) => (
                                                <InputNumber
                                                    label="Batch Strength"
                                                    id="batchStrength"
                                                    placeholder="Enter Batch Strength"
                                                    required
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={fieldState.error?.message}
                                                    isDisabled={isLoadingGlobal}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div className="flex justify-center gap-4 mt-6">
                                        <Button type="submit" disabled={isLoadingGlobal} className="w-full sm:w-1/2 bg-[#f25e36] hover:bg-[#d64e29]">
                                            {saveBatchMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            {batchId > 0 ? 'Update' : 'Save'}
                                        </Button>
                                        <Button type="button" variant="destructive" onClick={handleClearBatch} disabled={isLoadingGlobal} className="w-full sm:w-1/2">
                                            <X className="w-4 h-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Attendance Batch Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="flex items-center gap-4 text-sm font-medium">
                                    <div>Total Grid Records: <span className="inline-flex items-center justify-center bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">{initialData?.batchList?.length || 0}</span></div>
                                </div>
                                <div className="relative max-w-sm w-full">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search here..."
                                        className="pl-8"
                                        value={searchBatch}
                                        onChange={(e) => setSearchBatch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center font-bold text-black">SL NO</TableHead>
                                            <TableHead className="text-center font-bold text-black">Batch Name</TableHead>
                                            <TableHead className="text-center font-bold text-black">Batch Strength</TableHead>
                                            <TableHead className="text-center w-[100px] font-bold text-black">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBatchList.map((batchItem: any, index: number) => (
                                            <TableRow key={batchItem.acaB_Id}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell className="text-center">{batchItem.acaB_BatchName}</TableCell>
                                                <TableCell className="text-center">{batchItem.acaB_StudentStrength}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditBatch(batchItem)} disabled={isLoadingGlobal}>
                                                        <Edit className="w-4 h-4 text-primary" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {filteredBatchList.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">No records found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: Attendance Batch Mapping */}
                <TabsContent value="mapping" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Batch Mapping</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...mappingForm}>
                                <form onSubmit={mappingForm.handleSubmit(onMappingSearch)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        <FormField
                                            control={mappingForm.control}
                                            name="academicYear"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Academic Year <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingGlobal}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Year" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {(initialData?.yearList || []).map((y: any) => (
                                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>{y.asmaY_Year}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="course"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Course {isFetchingCourses && <Loader2 className="inline h-3 w-3 animate-spin" />} <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchAcademicYear || isLoadingGlobal || isFetchingCourses}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Course" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {courseList.map((c: any) => (
                                                                <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>{c.amcO_CourseName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="branch"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Branch {isFetchingBranches && <Loader2 className="inline h-3 w-3 animate-spin" />} <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!watchCourse || isLoadingGlobal || isFetchingBranches}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Branch" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {branchList.map((b: any) => (
                                                                <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>{b.amB_BranchName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="semester"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Semester {isFetchingSemesters && <Loader2 className="inline h-3 w-3 animate-spin" />} <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={(val) => { field.onChange(val); setStudentList([]); }} value={field.value} disabled={!watchBranch || isLoadingGlobal || isFetchingSemesters}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {semesterList.map((s: any) => (
                                                                <SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>{s.amsE_SEMName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="batch"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Atten. Batch <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={(val) => { field.onChange(val); setStudentList([]); }} value={field.value} disabled={isLoadingGlobal}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Batch" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {(initialData?.batchList || []).map((b: any) => (
                                                                <SelectItem key={b.acaB_Id} value={b.acaB_Id.toString()}>{b.acaB_BatchName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="subject"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={(val) => { field.onChange(val); setStudentList([]); }} value={field.value} disabled={isLoadingGlobal}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {(initialData?.subjectList || []).map((sub: any) => (
                                                                <SelectItem key={sub.ismS_Id} value={sub.ismS_Id.toString()}>{sub.displaySubjectName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={mappingForm.control}
                                            name="section"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Section <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={(val) => { field.onChange(val); setStudentList([]); }} value={field.value} disabled={isLoadingGlobal}>
                                                        <FormControl>
                                                            <SelectTrigger className={fieldState.error ? 'border-destructive' : ''}><SelectValue placeholder="Select Section" /></SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {(initialData?.sectionList || []).map((s: any) => (
                                                                <SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>{s.acmS_SectionName}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex justify-center gap-4 pt-4 mt-6">
                                        <Button type="submit" disabled={isLoadingGlobal}>
                                            {searchStudentsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                            Search
                                        </Button>
                                        <Button type="button" variant="outline" onClick={handleClearMapping} disabled={isLoadingGlobal}>
                                            <X className="mr-2 h-4 w-4" />
                                            Clear Form
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {studentList.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Student List</CardTitle>
                                    <div className="relative max-w-sm w-full">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search students..."
                                            className="pl-8"
                                            value={searchStudent}
                                            onChange={(e) => setSearchStudent(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-md border bg-background">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[60px] text-center font-bold text-black">SL.No</TableHead>
                                                <TableHead className="w-[50px] text-center font-bold text-black">
                                                    <Checkbox 
                                                        checked={studentList.length > 0 && studentList.every(s => s.selected)}
                                                        onCheckedChange={(checked) => {
                                                            setStudentList(studentList.map(s => ({ ...s, selected: !!checked })));
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead className="text-center font-bold text-black">Student Name</TableHead>
                                                <TableHead className="text-center font-bold text-black">Adm. No</TableHead>
                                                <TableHead className="text-center font-bold text-black">Roll.No</TableHead>
                                                <TableHead className="text-center font-bold text-black">Date.Of Birth</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredStudents.map((student, idx) => (
                                                <TableRow key={student.amcsT_Id}>
                                                    <TableCell className="text-center">{idx + 1}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Checkbox
                                                            checked={student.selected}
                                                            onCheckedChange={(checked) => {
                                                                setStudentList(studentList.map(s => 
                                                                    s.amcsT_Id === student.amcsT_Id ? { ...s, selected: !!checked } : s
                                                                ));
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-center">{student.amcsT_FirstName}</TableCell>
                                                    <TableCell className="text-center">{student.amcsT_AdmNo}</TableCell>
                                                    <TableCell className="text-center">{student.acysT_RollNo}</TableCell>
                                                    <TableCell className="text-center">
                                                        {student.amcsT_DOB ? new Date(student.amcsT_DOB).toLocaleDateString('en-GB') : ''}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {filteredStudents.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center h-24">No students found.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="sticky bottom-0 z-10 flex justify-end gap-4 border-t bg-background/80 py-4 backdrop-blur mt-4">
                                    <Button variant="outline" onClick={handleClearMapping} disabled={isLoadingGlobal}>
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSaveMapping} disabled={isLoadingGlobal}>
                                        {saveMappingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {savedData.length > 0 ? 'Update' : 'Final Submit'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
