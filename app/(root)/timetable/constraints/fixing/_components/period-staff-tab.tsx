'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { type FixingPeriodStaffSchema, fixingPeriodStaffSchema } from '@/schemas/timetable/constraints/fixing';
import {
    deactivateFixingPeriodStaff,
    getClassByCategory,
    getFixingPeriodStaffDetails,
    getSectionByClass,
    getSubjectByStaff,
    saveFixingPeriodStaff
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type IFixingPeriodStaffList, periodStaffColumns } from './columns';
import { FixingViewModal } from './fixing-view-modal';

interface PeriodStaffTabProps {
    initialData: any;
}

function PeriodStaffTabContent({ initialData }: PeriodStaffTabProps) {
    const {
        isEditFormOpen,
        selectedRow,
        closeToggleForm,
        isToggleFormOpen,
        isDetailsViewOpen,
        selectedRow: viewRow,
        closeDetailsView
    } = useFormContext();

    const [academicList] = useState<any[]>(initialData?.yearlist || []);
    const [periodList] = useState<any[]>(initialData?.periodlist || []);
    const [staffList, setStaffList] = useState<any[]>(initialData?.stafflist || []);
    const [gridData, setGridData] = useState<IFixingPeriodStaffList[]>(initialData?.fix_period_staff_list || []);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);
    const [categoryList] = useState<any[]>(initialData?.categorylist || []);

    // View Modal State
    const [viewDetails, setViewDetails] = useState<any[]>([]);
    const [isLoadingView, setIsLoadingView] = useState(false);

    const form = useForm<FixingPeriodStaffSchema>({
        resolver: zodResolver(fixingPeriodStaffSchema),
        defaultValues: {
            TTFPS_Id: 0,
            ASMAY_Id: undefined,
            TTMP_Id: undefined,
            HRME_Id: undefined,
            TTFPS_SUbSelcFlag: false,
            TempararyArrayList: []
        }
    });

    const { reset, setValue, watch, handleSubmit, control } = form;
    const ASMAY_Id = watch('ASMAY_Id');
    const TTFPS_SUbSelcFlag = watch('TTFPS_SUbSelcFlag');
    const HRME_Id = watch('HRME_Id');

    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nod, setNod] = useState<string>('');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'TempararyArrayList'
    });

    // Effect to populate form on Edit
    useEffect(() => {
        if (isEditFormOpen && selectedRow) {
            onEdit(selectedRow);
        }
    }, [isEditFormOpen, selectedRow]);

    // Effect to handle Toggle
    useEffect(() => {
        if (isToggleFormOpen && selectedRow) {
            onToggle(selectedRow);
            closeToggleForm();
        }
    }, [isToggleFormOpen, selectedRow]);

    // Effect to handle View
    useEffect(() => {
        if (isDetailsViewOpen && viewRow) {
            onView(viewRow);
        }
    }, [isDetailsViewOpen, viewRow]);

    const handleCategoryChange = async (categoryId: number) => {
        setSelectedCategory(categoryId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);
        if (ASMAY_Id && categoryId) {
            try {
                const res = await getClassByCategory({ ASMAY_Id, TTMC_Id: categoryId });
                if (Array.isArray(res) && res && res.classbycategory) setClassList(res.classbycategory as any[]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setSectionList([]);
        setSubSubjectList([]);
        if (ASMAY_Id && selectedCategory && classId) {
            try {
                const res = await getSectionByClass({ ASMAY_Id, ASMCL_Id: classId, TTMC_Id: selectedCategory });
                if (Array.isArray(res) && res && res.sectionlist) setSectionList(res.sectionlist as any[]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);
        setSubSubjectList([]);
        if (ASMAY_Id && selectedClass && sectionId && HRME_Id) {
            try {
                const res = await getSubjectByStaff({ ASMAY_Id, ASMCL_Id: selectedClass, ASMS_Id: sectionId, HRME_Id });
                if (Array.isArray(res) && res && res.subjectbystaff) setSubSubjectList(res.subjectbystaff as any[]);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nod) {
            toast.warning('Please select all fields and ensure Staff is selected in main form for Subject fetch');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => s.ismS_Id === selectedSubject);

        // Duplicate Check
        const exists = fields.some(
            (f: any) => f.ASMCL_Id === selectedClass && f.ASMS_Id === selectedSection && f.ISMS_Id === selectedSubject
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            ASMCL_Id: selectedClass,
            ASMS_Id: selectedSection,
            ISMS_Id: selectedSubject,
            NOD: Number(nod),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            subDisplay: subObj?.ismS_SubjectName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'NOD', header: 'No Of Days' }, // Label NOD
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button type='button' variant='ghost' size='sm' onClick={() => remove(row.index)}>
                        <span className='text-red-500'>Delete</span>
                    </Button>
                )
            }
        ],
        [remove]
    );

    // View Columns
    const viewColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'NOD', header: 'No Of Days' }
        ],
        []
    );

    const onEdit = async (item: any) => {
        try {
            const res = await getFixingPeriodStaffDetails(item.ttfpS_Id);
            if (res?.fix_period_staff_edit && (res.fix_period_staff_edit as any[]).length > 0) {
                const d = (res.fix_period_staff_edit as any[])[0];
                reset({
                    TTFPS_Id: d.ttfpS_Id,
                    ASMAY_Id: d.asmaY_Id,
                    TTMP_Id: d.ttmP_Id,
                    HRME_Id: d.hrmE_Id,
                    TTFPS_SUbSelcFlag: d.ttfpS_SUbSelcFlag,
                    TempararyArrayList: []
                });
                if (d.ttfpS_SUbSelcFlag && res.fix_period_staff__classecedit) {
                    (res.fix_period_staff__classecedit as any[]).forEach((sub: any) => {
                        append({
                            ASMCL_Id: sub.asmcL_Id,
                            ASMS_Id: sub.asmS_Id,
                            ISMS_Id: sub.ismS_Id,
                            NOD: sub.ttfpscC_Days,
                            clsDisplay: sub.asmcL_ClassName,
                            sectDisplay: sub.asmC_SectionName,
                            subDisplay: sub.ismS_SubjectName
                        });
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onView = async (item: any) => {
        try {
            setIsLoadingView(true);
            setViewDetails([]);
            const res = await getFixingPeriodStaffDetails(item.ttfpS_Id);
            if (res?.fix_period_staff__classecedit) {
                const details = (res.fix_period_staff__classecedit as any[]).map((sub: any) => ({
                    clsDisplay: sub.asmcL_ClassName,
                    sectDisplay: sub.asmC_SectionName,
                    subDisplay: sub.ismS_SubjectName,
                    NOD: sub.ttfpscC_Days
                }));
                setViewDetails(details);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingView(false);
        }
    };

    const onToggle = async (item: any) => {
        try {
            const payload = { TTFPS_Id: item.ttfpS_Id, TTFPS_ActiveFlag: !item.ttfpS_ActiveFlag };
            const res = await deactivateFixingPeriodStaff(payload);
            if (res?.returnval === true) {
                toast.success('Status Updated');
                window.location.reload();
            } else {
                toast.error('Failed to update status');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const onSubmit = async (data: FixingPeriodStaffSchema) => {
        try {
            if (!data.TTFPS_SUbSelcFlag) {
                data.TempararyArrayList = [];
            } else if (!data.TempararyArrayList || data.TempararyArrayList.length === 0) {
                toast.warning('Please add at least one Class-Section details');
                return;
            }

            const res = await saveFixingPeriodStaff(data);
            if (res?.returnval === true) {
                toast.success('Record Saved Successfully');
                window.location.reload();
            } else {
                toast.error(res?.message || 'Failed to save');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className='space-y-6'>
            {/* <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 rounded-md border bg-white p-4 shadow-sm'>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <FormField control={form.control} name="ASMAY_Id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Academic Year</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {academicList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>{item.asmaY_Year}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="TTMP_Id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Period</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {periodList.map((item: any) => (
                                            <SelectItem key={item.ttmP_Id} value={item.ttmP_Id.toString()}>{item.ttmP_PeriodName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="HRME_Id" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Staff</FormLabel>
                                <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value?.toString()}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>{item.hrmE_EmployeeCode} - {item.hrmE_EmployeeFirstName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>

                    <div className="flex items-center space-x-2">
                        <FormField control={form.control} name="TTFPS_SUbSelcFlag" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Fixing Class-Section Wise</FormLabel>
                                </div>
                            </FormItem>
                        )} />
                    </div>

                    {TTFPS_SUbSelcFlag && (
                        <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                            <h4 className="font-semibold">Add Class Details</h4>
                            <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                                <div className="space-y-2">
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={(v) => handleCategoryChange(Number(v))} value={selectedCategory?.toString()}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {categoryList.map((item: any) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id.toString()}>{item.ttmC_CategoryName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Class</FormLabel>
                                    <Select onValueChange={(v) => handleClassChange(Number(v))} value={selectedClass?.toString()}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {classList.map((item: any) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>{item.asmcL_ClassName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Section</FormLabel>
                                    <Select onValueChange={(v) => handleSectionChange(Number(v))} value={selectedSection?.toString()}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {sectionList.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>{item.asmS_SectionName || item.asmC_SectionName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Subject</FormLabel>
                                    <Select onValueChange={(v) => setSelectedSubject(Number(v))} value={selectedSubject?.toString()}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {subSubjectList.map((item: any) => (
                                                <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>{item.ismS_SubjectName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>No Of Days</FormLabel>
                                    <Input type="number" value={nod} onChange={(e) => setNod(e.target.value)} />
                                </div>
                            </div>
                            <Button type="button" onClick={addToGrid}>Add</Button>
                            {fields.length > 0 && <DataTable data={fields} columns={subColumns} totalItems={fields.length} />}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => reset()}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Form> */}

            <DataTable data={gridData} columns={periodStaffColumns} totalItems={gridData.length} />

            <FixingViewModal
                isOpen={!!isDetailsViewOpen}
                onClose={closeDetailsView}
                title='Class-Section Wise Details'
                data={viewDetails}
                columns={viewColumns}
                isLoading={isLoadingView}
            />
        </div>
    );
}

export default function PeriodStaffTab({ initialData }: PeriodStaffTabProps) {
    return (
        <FormProvider>
            <PeriodStaffTabContent initialData={initialData} />
        </FormProvider>
    );
}
