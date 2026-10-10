'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2, Search, Save, X, Trash2, Eye, Power } from 'lucide-react';
import { getCourses, getBranches, getSemesters, getSubjects, saveData, deleteData, getModalDetails, deactivateData } from '@/server/college/CollegeAdmission/Transactions/attendance-subject-maxperiod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const filterSchema = z.object({
    academicYear: z.string().min(1, 'Academic Year is required'),
    course: z.string().min(1, 'Course is required'),
    branch: z.string().min(1, 'Branch is required'),
    semester: z.string().min(1, 'Semester is required'),
    section: z.string().min(1, 'Section is required'),
});

interface AttendanceSubjectMaxPeriodWrapperProps {
    initialData: any;
}

export const AttendanceSubjectMaxPeriodWrapper = ({ initialData }: AttendanceSubjectMaxPeriodWrapperProps) => {
    const [isLoading, setIsLoading] = useState(false);
    
    // Dropdown lists
    const [yearList, setYearList] = useState<any[]>(initialData?.yearlist || []);
    const [sectionList, setSectionList] = useState<any[]>(initialData?.sectionlist || []);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    
    // Subjects Table state
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [allDetails, setAllDetails] = useState<any[]>(initialData?.alldetails || []);
    const [selectAll, setSelectAll] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any[]>([]);

    const form = useForm<z.infer<typeof filterSchema>>({
        resolver: zodResolver(filterSchema),
        defaultValues: {
            academicYear: '',
            course: '',
            branch: '',
            semester: '',
            section: ''
        }
    });

    const watchAcademicYear = form.watch('academicYear');
    const watchCourse = form.watch('course');
    const watchBranch = form.watch('branch');

    useEffect(() => {
        if (watchAcademicYear) {
            form.setValue('course', '');
            form.setValue('branch', '');
            form.setValue('semester', '');
            setSubjectList([]);
            loadCourses(watchAcademicYear);
        }
    }, [watchAcademicYear]);

    useEffect(() => {
        if (watchCourse && watchAcademicYear) {
            form.setValue('branch', '');
            form.setValue('semester', '');
            setSubjectList([]);
            loadBranches(watchAcademicYear, watchCourse);
        }
    }, [watchCourse, watchAcademicYear]);

    useEffect(() => {
        if (watchBranch && watchCourse && watchAcademicYear) {
            form.setValue('semester', '');
            setSubjectList([]);
            loadSemesters(watchAcademicYear, watchCourse, watchBranch);
        }
    }, [watchBranch, watchCourse, watchAcademicYear]);

    const loadCourses = async (yearId: string) => {
        setIsLoading(true);
        const res = await getCourses(Number(yearId));
        if (res?.data?.courselist) {
            setCourseList(res.data.courselist);
        }
        setIsLoading(false);
    };

    const loadBranches = async (yearId: string, courseId: string) => {
        setIsLoading(true);
        const res = await getBranches(Number(yearId), Number(courseId));
        if (res?.data?.branchlist) {
            setBranchList(res.data.branchlist);
        }
        setIsLoading(false);
    };

    const loadSemesters = async (yearId: string, courseId: string, branchId: string) => {
        setIsLoading(true);
        const res = await getSemesters(Number(yearId), Number(courseId), Number(branchId));
        if (res?.data?.semisterlist) {
            setSemesterList(res.data.semisterlist);
        }
        setIsLoading(false);
    };

    const onSubmitSearch = async (values: z.infer<typeof filterSchema>) => {
        setIsLoading(true);
        const res = await getSubjects(
            Number(values.academicYear), 
            Number(values.course), 
            Number(values.branch), 
            Number(values.semester), 
            Number(values.section)
        );
        
        if (res?.data?.subjectlist) {
            const subjects = res.data.subjectlist.map((subj: any) => {
                const saved = res.data.saveddata?.find((s: any) => s.ismS_Id === subj.ismS_Id);
                return {
                    ...subj,
                    selected: !!saved,
                    maxPeriod: saved ? saved.acasmP_MaxPeriod : ''
                };
            });
            setSubjectList(subjects);
            
            if (subjects.length > 0) {
                const allSelected = subjects.every((s: any) => s.selected);
                setSelectAll(allSelected);
            } else {
                setSelectAll(false);
                toast.info('No Subjects Found');
            }
        }
        setIsLoading(false);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setSubjectList(subjectList.map(subj => ({ ...subj, selected: checked })));
    };

    const handleSubjectCheck = (id: number, checked: boolean) => {
        const updatedList = subjectList.map(subj => 
            subj.ismS_Id === id ? { ...subj, selected: checked } : subj
        );
        setSubjectList(updatedList);
        setSelectAll(updatedList.every(subj => subj.selected));
    };

    const handleMaxPeriodChange = (id: number, value: string) => {
        setSubjectList(subjectList.map(subj => 
            subj.ismS_Id === id ? { ...subj, maxPeriod: value } : subj
        ));
    };

    const handleClear = () => {
        form.reset();
        setSubjectList([]);
        setCourseList([]);
        setBranchList([]);
        setSemesterList([]);
        setSelectAll(false);
        setSearchQuery('');
    };

    const handleSave = async () => {
        const values = form.getValues();
        if (!values.academicYear || !values.course || !values.branch || !values.semester || !values.section) {
            toast.error('Please filter subjects first.');
            return;
        }

        const selectedSubjects = subjectList.filter(s => s.selected);
        
        if (selectedSubjects.length === 0) {
            toast.error('Select at least one subject to save data!');
            return;
        }

        const invalidSubject = selectedSubjects.find(s => !s.maxPeriod || isNaN(Number(s.maxPeriod)));
        if (invalidSubject) {
            toast.error('Please enter a valid Max Period for all selected subjects.');
            return;
        }

        const subData = selectedSubjects.map(s => ({
            ismS_Id: s.ismS_Id,
            acasmP_MaxPeriod: Number(s.maxPeriod)
        }));

        const data = {
            asmaY_Id: Number(values.academicYear),
            amcO_Id: Number(values.course),
            amB_Id: Number(values.branch),
            amsE_Id: Number(values.semester),
            acmS_Id: Number(values.section),
            sub_data: subData
        };

        setIsLoading(true);
        const res = await saveData(data);
        if (res?.data?.returnval) {
            toast.success('Record Saved/Updated Successfully');
            handleClear();
        } else {
            toast.error('Failed to Save/Update Record');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        setIsLoading(true);
        const res = await deleteData(id);
        if (res?.data?.returnval) {
            toast.success('Record Deleted Successfully');
            setAllDetails(allDetails.filter(d => d.acasmP_Id !== id));
        } else {
            toast.error('Failed to Delete Record');
        }
        setIsLoading(false);
    };

    const handleView = async (item: any) => {
        setIsLoading(true);
        const res = await getModalDetails(
            item.asmaY_Id,
            item.amcO_Id,
            item.amB_Id,
            item.amsE_Id,
            item.acmS_Id
        );
        if (res?.data?.showmodaldetails) {
            setModalData(res.data.showmodaldetails);
            setIsModalOpen(true);
        } else {
            toast.error('Failed to fetch modal details or no details found.');
        }
        setIsLoading(false);
    };

    const handleDeactivate = async (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'Deactivate' : 'Activate';
        if (!confirm(`Are you sure you want to ${action} this record?`)) return;
        setIsLoading(true);
        const res = await deactivateData(id);
        if (res?.data?.returnval) {
            toast.success(`Record ${action}d Successfully`);
            setAllDetails(allDetails.map(d => 
                d.acasmP_Id === id ? { ...d, acasmP_ActiveFlag: !currentStatus } : d
            ));
        } else {
            toast.error(`Failed to ${action} Record`);
        }
        setIsLoading(false);
    };

    const filteredSubjects = subjectList.filter(s => 
        s.ismS_SubjectName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Subject Max-Period Filter</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitSearch)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                <FormField
                                    control={form.control}
                                    name="academicYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Academic Year <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Year" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {yearList?.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                            {y.asmaY_Year}
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
                                    name="course"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchAcademicYear}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Course" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {courseList?.map((c: any) => (
                                                        <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>
                                                            {c.amcO_CourseName}
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
                                    name="branch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Branch <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchCourse}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Branch" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {branchList?.map((b: any) => (
                                                        <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>
                                                            {b.amB_BranchName}
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
                                    name="semester"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Semester <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={!watchBranch}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Semester" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {semesterList?.map((s: any) => (
                                                        <SelectItem key={s.amsE_Id} value={s.amsE_Id.toString()}>
                                                            {s.amsE_SEMName}
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
                                    name="section"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Section <span className="text-destructive">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Section" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sectionList?.map((s: any) => (
                                                        <SelectItem key={s.acmS_Id} value={s.acmS_Id.toString()}>
                                                            {s.acmS_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-center gap-4 pt-4 mt-6">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                    Search
                                </Button>
                                <Button type="button" variant="outline" onClick={handleClear} disabled={isLoading}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Form
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {subjectList.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Subject List</CardTitle>
                            <div className="w-72">
                                <Input 
                                    placeholder="Search Subjects..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">SL.No.</TableHead>
                                        <TableHead className="w-[80px]">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox 
                                                    checked={selectAll}
                                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                                />
                                            </div>
                                        </TableHead>
                                        <TableHead>Subject Name</TableHead>
                                        <TableHead className="w-[200px]">Attendance Max.Period</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubjects.map((subj, index) => (
                                        <TableRow key={subj.ismS_Id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={subj.selected}
                                                    onCheckedChange={(checked) => handleSubjectCheck(subj.ismS_Id, checked as boolean)}
                                                />
                                            </TableCell>
                                            <TableCell>{subj.ismS_SubjectName}</TableCell>
                                            <TableCell>
                                                <Input 
                                                    type="number"
                                                    value={subj.maxPeriod || ''}
                                                    onChange={(e) => handleMaxPeriodChange(subj.ismS_Id, e.target.value)}
                                                    placeholder="Max. Period"
                                                    disabled={!subj.selected}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSubjects.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No subjects found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        <div className="sticky bottom-0 z-10 flex justify-end gap-4 border-t bg-background/80 py-4 backdrop-blur mt-4">
                            <Button variant="outline" onClick={handleClear} disabled={isLoading}>
                                Clear All
                            </Button>
                            <Button onClick={handleSave} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Final Submit
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {allDetails.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Subject Max-Period List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground">
                                <b>Total Grid Records:</b> <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{allDetails.length}</span>
                            </p>
                        </div>
                        
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SL.No.</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Branch</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Max Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allDetails.slice(0, 10).map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{item.amcO_CourseName}</TableCell>
                                            <TableCell>{item.amB_BranchName}</TableCell>
                                            <TableCell>{item.amsE_SEMName}</TableCell>
                                            <TableCell>{item.acmS_SectionName}</TableCell>
                                            <TableCell>{item.ismS_SubjectName}</TableCell>
                                            <TableCell>{item.acasmP_MaxPeriod}</TableCell>
                                            <TableCell>
                                                {item.acasmP_ActiveFlag ? (
                                                    <span className="text-green-600 font-medium">Active</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Inactive</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleView(item)}
                                                        disabled={isLoading}
                                                        className="text-primary hover:bg-primary/10"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDeactivate(item.acasmP_Id, item.acasmP_ActiveFlag)}
                                                        disabled={isLoading}
                                                        className={item.acasmP_ActiveFlag ? "text-amber-600 hover:bg-amber-600/10" : "text-green-600 hover:bg-green-600/10"}
                                                        title={item.acasmP_ActiveFlag ? "Deactivate" : "Activate"}
                                                    >
                                                        <Power className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(item.acasmP_Id)}
                                                        disabled={isLoading}
                                                        className="text-destructive hover:bg-destructive/10"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Subject Max-Period Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>SL.No.</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Max Period</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modalData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{item.amcO_CourseName}</TableCell>
                                        <TableCell>{item.amB_BranchName}</TableCell>
                                        <TableCell>{item.amsE_SEMName}</TableCell>
                                        <TableCell>{item.acmS_SectionName}</TableCell>
                                        <TableCell>{item.ismS_SubjectName}</TableCell>
                                        <TableCell>{item.acasmP_MaxPeriod}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
