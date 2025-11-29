'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examLoginPrivilegesSchema } from '@/schemas/exam/exam-module/exam-mapping';
import { addorUpdateExamLoginPrivileges } from '@/server/exam/exam-module/exam-mapping/exam-login-privilages';
import { getClassDropDownByAcademicYearlist, getSectionsDropDownByAcademicYearandClasslist } from '@/server/exam/exam-module/reports/cumulative-report';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useClassTeacherEmployee, useMasterClassDropdown, useMasterSectionDropdown } from '@/hooks/admission/preadmission/useMasters';
import type { z } from 'zod';
import type { IClass } from '@/types/exam/exam-module/masters';
import type { IAcademicYearDropDown, IMasterClassSectionDropDown } from '@/types/admission/preadmission/masters';
import { useGetMasterSubjectDropdownList, useMasterSubSubjectDropdownList } from '@/hooks/exam/exammodule/usemasters';
import { getTeacherClassSection } from '@/server/admission/preadmission/masters/class_teacher';
import { Edit, Trash2 } from 'lucide-react';
import { IExamLoginPrivileges } from '@/types/exam/exam-module/exam-mapping';

// form fields type
type FormFields = z.infer<typeof examLoginPrivilegesSchema.addOrUpdate>;

/** Row stored in details table (internal) */
type DetailRow = {
    id: string; // local unique id
    yearid: number;
    user_id: number;
    year: string;
    emp_name: string;
    emp_Id: number;
    elpflg: string;
    clas: any; // full class object (follow API structure)
    secs: any; // single section object
    sub: any[]; // subjects array
    ssub: any[]; // sub-subjects array
};

export default function AddExamLoginPrivileges({ onSuccess, rowData }: { onSuccess?: () => void, rowData?: IExamLoginPrivileges }) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(examLoginPrivilegesSchema.addOrUpdate),
        defaultValues: {
            asmaY_Id: 0,
            hrmE_Id: 0,
            ivrmulF_Id: 0,
            asmcL_Id: 0,
            sectionList: [],
            subjectList: [],
            subSubjectList: [],
            entryType: 'BY_CLASS_TEACHER',
            remarks: '',
            elp_ActiveFlag: true,
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState
    } = methods;

    // Then you can access:
    const { errors, isSubmitted } = formState;

    useEffect(() => {
        if (isSubmitted && Object.keys(errors).length > 0) {
            console.log("Validation Errors:", errors);

            Object.values(errors).forEach((err: any) => {
                if (err?.message) toast.error(err.message);
            });
        }
    }, [errors, isSubmitted]);


    // dropdowns
    const [classes, setClasses] = useState<IClass[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [subSubjects, setSubSubjects] = useState<any[]>([]);
    const [userLogins, setUserLogins] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // details rows (class × section => many rows)
    const [details, setDetails] = useState<DetailRow[]>([]);

    // editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [disableClassSection, setDisableClassSection] = useState(false); // disables manual change when teacher-mapped or editing

    // tabs: 0 = by class teacher, 1 = by subject teacher, 2 = by others
    const [activeTab, setActiveTab] = useState<number>(0);

    // watchers
    const asmaY_Id = watch('asmaY_Id');
    const hrmE_Id = watch('hrmE_Id');
    const selectedClassSingle = watch('asmcL_Id'); // used by tab behavior
    const entryType = watch('entryType');
    const class_list = watch('classList');

    // Academic years / employees from hooks
    const { data: academicYear, isLoading: academicYearLoading, error: academicYearError } = useAcademicYearDropdown();
    const { data: employeeData, isLoading: employeeLoading, error: employeeError } = useClassTeacherEmployee(asmaY_Id);
    const { data: masterSection, isLoading: masterSectionLoading, error: masterSectionError, refetchAll: refetchMasterSection } = useMasterSectionDropdown();
    const { data: masterClass, isLoading: masterClassLoading, error: masterClassError, refetchAll: refetchMasterClass } = useMasterClassDropdown();
    const { data: masterSubject, isLoading: masterSubjectLoading, error: masterSubjectError } = useGetMasterSubjectDropdownList();
    const { data: masterSubSubject, isLoading: masterSubSubjectLoading, error: masterSubSubjectError } = useMasterSubSubjectDropdownList();


    useEffect(() => {
        setUserLogins([{ ivrmulF_Id: 1, userName: 'admin' }, { ivrmulF_Id: 2, userName: 'teacher1' }]);

    }, []);

    useEffect(() => {
        if (masterSection && Array.isArray(masterSection.data)) {
            setSections(masterSection.data);  // set the API data to state
        }
    }, [masterSection]);


    useEffect(() => {
        if (masterClass && Array.isArray(masterClass.data)) {
            setClasses(masterClass.data);  // set the API data to state
        }
    }, [masterClass]);

    useEffect(() => {
        if (masterSubject && Array.isArray(masterSubject.data)) {
            setSubjects(masterSubject.data);  // set the API data to state
        }
    }, [masterSubject]);

    useEffect(() => {
        if (masterSubSubject && Array.isArray(masterSubSubject.data)) {
            setSubSubjects(masterSubSubject.data);  // set the API data to state
        }
    }, [masterSubSubject]);

    useEffect(() => {
        if (employeeData && Array.isArray(employeeData.data)) {
            setEmployees(employeeData.data);  // set the API data to state
        }
    })


    // ---------- When user chooses employee in Tab 1, fetch teacher mapped classes & sections and lock them ----------
    useEffect(() => {
        async function fetchTeacherMapping() {
            if (!asmaY_Id || !hrmE_Id) return;

            try {
                const { data } = await getTeacherClassSection(asmaY_Id, hrmE_Id);

                if (!Array.isArray(data) || data.length === 0) {
                    setDisableClassSection(false);
                    return;
                }

                // Extract unique classes
                const classMap = new Map<number, IMasterClassSectionDropDown>();
                const sectionList: { asmS_Id: number }[] = [];

                data.forEach((item) => {
                    // Add class once
                    if (!classMap.has(item.asmcL_Id)) {
                        classMap.set(item.asmcL_Id, {
                            asmcL_Id: item.asmcL_Id,
                            asmcL_ClassName: item.asmcL_ClassName,
                            asmS_Id: item.asmS_Id,
                            asmC_SectionName: item.asmC_SectionName,
                            imcT_Id: item.imcT_Id
                        });
                    }

                    // Sections always go into sectionList
                    sectionList.push({
                        asmS_Id: item.asmS_Id
                    });
                });

                const classList = Array.from(classMap.values());
                setValue(
                    "classList",
                    classList.map((c) => ({
                        asmcL_Id: c.asmcL_Id,
                        asmcL_ClassName: c.asmcL_ClassName
                    }))
                );
                setValue("asmcL_Id", classList[0]?.asmcL_Id ?? 0);
                setValue("sectionList", sectionList);
                setDisableClassSection(true);

            } catch (err: any) {
                toast.error(err.message || "Failed to fetch teacher mapping");
                setDisableClassSection(false);
            }
        }

        if (activeTab === 0) {
            fetchTeacherMapping();
        } else {
            setDisableClassSection(false);
        }
    }, [asmaY_Id, hrmE_Id, activeTab]);


    // ---------- Helpers ----------
    const makeUniqueId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    function computeDetailRowsForAdd(): DetailRow[] {
        const v = getValues();

        // ---- FIX 1: Remove duplicate classes by asmcL_Id ----
        const rawClasses: any[] = Array.isArray(v['classList']) && v['classList'].length
            ? v['classList']
            : (v['asmcL_Id']
                ? classes.filter((c) => c.asmcL_Id === v['asmcL_Id'])
                : classes);

        const selectedClassesFromForm = Array.from(
            new Map(rawClasses.map((c: any) => [c.asmcL_Id, c])).values()
        );

        // ---- FIX 2: Remove duplicate sections by asmS_Id ----
        const rawSections: any[] = Array.isArray(v['sectionList']) && v['sectionList'].length
            ? v['sectionList']
            : sections;

        const selectedSectionsFromForm = Array.from(
            new Map(rawSections.map((s: any) => [s.asmS_Id, s])).values()
        );

        // Subjects
        const selectedSubjects: any[] = Array.isArray(v['subjectList']) ? v['subjectList'] : [];
        const selectedSSubjects: any[] = Array.isArray(v['subSubjectList']) ? v['subSubjectList'] : [];

        const rows: DetailRow[] = [];

        selectedClassesFromForm.forEach((cls: any) => {
            selectedSectionsFromForm.forEach((sec: any) => {
                rows.push({
                    id: makeUniqueId(),
                    yearid: v.asmaY_Id ?? 0,
                    user_id: v.ivrmulF_Id ?? 0,
                    year:
                        academicYear?.data?.find((y: any) => y.asmaY_Id === v.asmaY_Id)
                            ?.asmaY_Year ?? '',
                    emp_name:
                        employees.find((e) => e.hrmE_Id === v.hrmE_Id)?.employee_name ??
                        '',
                    emp_Id: v.hrmE_Id ?? 0,
                    elpflg: 'Y',
                    clas: cls,
                    secs: sec,
                    sub: selectedSubjects.length ? selectedSubjects : [],
                    ssub: selectedSSubjects.length ? selectedSSubjects : [],
                });
            });
        });

        return rows;
    }

    // Add button handler: takes the computed rows and append to details array (avoid duplicates for same class-section pairs)
    function handleAddRows() {
        const rowsToAdd = computeDetailRowsForAdd();

        if (rowsToAdd.length === 0) {
            toast.error('Please select classes and sections before adding');
            return;
        }

        // ---- FIX: maintain unique class-section pairs ----
        const existingPairs = new Set(
            details.map((d) => `${d.clas?.asmcL_Id}_${d.secs?.asmS_Id}_${d.yearid}_${d.user_id}_${d.emp_Id}`)
        );

        const filtered = rowsToAdd.filter(
            (r) =>
                !existingPairs.has(`${r.clas?.asmcL_Id}_${r.secs?.asmS_Id}_${r.yearid}_${r.user_id}_${r.emp_Id}`)
        );

        if (filtered.length === 0) {
            toast.error('Selected Class-Section combination(s) already added');
            return;
        }

        setDetails((prev) => [...prev, ...filtered]);
        toast.success(`${filtered.length} row(s) added`);
    }


    // Delete row
    function handleDeleteRow(id: string) {
        setDetails((prev) => prev.filter((r) => r.id !== id));
    }

    // Edit row -> populate form fields and lock class and section for edit
    function handleEditRow(id: string) {
        const row = details.find((r) => r.id === id);
        if (!row) return;
        setEditingId(id);
        setValue('asmaY_Id', row.yearid);
        setValue('hrmE_Id', row.emp_Id || 0);
        setValue('ivrmulF_Id', row.user_id || 0);
        setValue('sectionList', [row.secs]);
        setValue('classList', [row.clas]);
        setValue('subjectList', row.sub ?? []);
        setValue('subSubjectList', row.ssub ?? []);
        setDisableClassSection(true);
    }

    // Update edited row after user modifies subject/sub-subject
    function handleUpdateRow() {
        if (!editingId) return;
        const rowIndex = details.findIndex((r) => r.id === editingId);
        if (rowIndex === -1) return;

        const v = getValues();
        const updated: DetailRow = {
            ...details[rowIndex],
            // keep clas & secs same
            sub: Array.isArray(v.subjectList) ? v.subjectList : details[rowIndex].sub,
            ssub: Array.isArray(v.subSubjectList) ? v.subSubjectList : details[rowIndex].ssub,
            yearid: v.asmaY_Id ?? details[rowIndex].yearid,
            user_id: v.ivrmulF_Id ?? details[rowIndex].user_id,
            emp_name: employees.find((e) => e.hrmE_Id === v.hrmE_Id)?.employee_name ?? details[rowIndex].emp_name,
        };

        setDetails((prev) => prev.map((r) => (r.id === editingId ? updated : r)));
        setEditingId(null);
        setDisableClassSection(false);
        toast.success('Row updated');
    }

    // Cancel editing
    function cancelEdit() {
        setEditingId(null);
        setDisableClassSection(false);
        reset(); // optional: keep earlier form values if needed
    }

    // Build final payload according to your exact required structure and call API helper
    // inside your component


    const onSubmit: SubmitHandler<FormFields> = async () => {
        if (details.length === 0) {
            toast.error("Add at least one row to save");
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare selected rows → payload
            const selectedclass = details.map((d) => {
                const sub = (d.sub || []).map((s: any) => ({
                    ismS_Id: s.ismS_Id ?? 0,
                    mI_Id: 0,
                    ismS_SubjectName: s.ismS_SubjectName ?? s.name ?? "",
                    ismS_SubjectCode: s.ismS_SubjectCode ?? "",
                    ismS_Max_Marks: s.ismS_Max_Marks ?? 0,
                    ismS_Min_Marks: s.ismS_Min_Marks ?? 0,
                    ismS_ExamFlag: s.ismS_ExamFlag ?? 0,
                    ismS_PreadmFlag: s.ismS_PreadmFlag ?? 0,
                    ismS_SubjectFlag: s.ismS_SubjectFlag ?? 0,
                    ismS_BatchAppl: s.ismS_BatchAppl ?? 0,
                    ismS_ActiveFlag: s.ismS_ActiveFlag ?? 1,
                    ismS_OrderFlag: s.ismS_OrderFlag ?? 0,
                    ismS_TTFlag: typeof s.ismS_TTFlag === "boolean" ? s.ismS_TTFlag : true,
                    ismS_AttendanceFlag:
                        typeof s.ismS_AttendanceFlag === "boolean" ? s.ismS_AttendanceFlag : true,
                }));

                const ssub = (d.ssub || []).map((ss: any) => ({
                    emsS_Id: ss.emsS_Id ?? ss.issS_Id ?? 0,
                    mI_Id: 0,
                    emsS_SubSubjectName: ss.emsS_SubSubjectName ?? ss.name ?? "",
                    emsS_SubSubjectCode: ss.emsS_SubSubjectCode ?? "",
                    emsS_Order: ss.emsS_Order ?? 0,
                    emsS_ActiveFlag:
                        typeof ss.emsS_ActiveFlag === "boolean" ? ss.emsS_ActiveFlag : true,
                }));

                return {
                    yearid: d.yearid ?? 0,
                    user_id: d.user_id ?? 0,
                    year: d.year ?? "",
                    emp_name: d.emp_name ?? "",
                    elpflg: d.elpflg ?? "Y",

                    clas: {
                        asmcL_Id: d.clas?.asmcL_Id ?? 0,
                        asmcL_ClassName: d.clas?.asmcL_ClassName ?? "",
                        asmcL_Order: d.clas?.asmcL_Order ?? 0,
                        mI_Id: 0,
                        asmcL_MinAgeYear: d.clas?.asmcL_MinAgeYear ?? 0,
                        asmcL_MinAgeMonth: d.clas?.asmcL_MinAgeMonth ?? 0,
                        asmcL_MinAgeDays: d.clas?.asmcL_MinAgeDays ?? 0,
                        asmcL_MaxAgeYear: d.clas?.asmcL_MaxAgeYear ?? 0,
                        asmcL_MaxAgeMonth: d.clas?.asmcL_MaxAgeMonth ?? 0,
                        asmcL_MaxAgeDays: d.clas?.asmcL_MaxAgeDays ?? 0,
                        asmcL_MaxCapacity: d.clas?.asmcL_MaxCapacity ?? 0,
                        asmcL_ActiveFlag:
                            typeof d.clas?.asmcL_ActiveFlag === "boolean"
                                ? d.clas.asmcL_ActiveFlag
                                : true,
                    },

                    secs: {
                        asmS_Id: d.secs?.asmS_Id ?? 0,
                        mI_Id: 0,
                        asmC_SectionName: d.secs?.asmC_SectionName ?? "",
                        asmC_SectionCode: d.secs?.asmC_SectionCode ?? "",
                        asmC_Order: d.secs?.asmC_Order ?? 0,
                        asmC_ActiveFlag: d.secs?.asmC_ActiveFlag ?? 1,
                        asmC_MaxCapacity: d.secs?.asmC_MaxCapacity ?? 0,
                    },

                    sub,
                    ssub,
                };
            });

            // Final Payload
            const payload = {
                mI_Id: 0,
                selectedclass,
                action: "ADD",
            };
            console.log('login privilages payload', payload);

            // Call API
            const res = await addorUpdateExamLoginPrivileges(payload as any);

            if (res?.success) {
                toast.success("Saved successfully");
                setDetails([]);
                reset();
                onSuccess && onSuccess();
            } else {
                toast.error(res?.message || "Save failed");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to save");
        } finally {
            setIsSubmitting(false);
        }
    };


    // Build display columns for details table - minimal table without external table lib
    const detailsTable = useMemo(() => {
        return (
            <>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr style={{ background: 'hsl(277 90% 52%)', color: '#fff' }}>
                            <th className="p-2 border">SLNO</th>
                            <th className="p-2 border">Academic Year</th>
                            <th className="p-2 border">user_id</th>
                            <th className="p-2 border">Employee Name</th>
                            <th className="p-2 border">Class</th>
                            <th className="p-2 border">Section</th>
                            <th className="p-2 border">Subject</th>
                            <th className="p-2 border">Sub Subject</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {details.map((d, idx) => (
                            <tr key={d.id} className="even:bg-gray-50">
                                <td className="p-2 border text-center">{idx + 1}</td>
                                <td className="p-2 border text-center">{d.year}</td>
                                <td className="p-2 border text-center">{d.user_id}</td>
                                <td className="p-2 border">{d.emp_name}</td>
                                <td className="p-2 border">{d.clas?.asmcL_ClassName ?? ''}</td>
                                <td className="p-2 border">
                                    {sections.find((s) => s.asmS_Id === d.secs?.asmS_Id)?.asmC_SectionName ?? ''}
                                </td>
                                <td className="p-2 border">
                                    {(d.sub || []).map((s) => s.ismS_SubjectName).join(', ')}
                                </td>
                                <td className="p-2 border">
                                    {(d.ssub || []).map((ss) => ss.emsS_SubSubjectName ?? ss.issS_SubSubjectName).join(', ')}
                                </td>

                                <td className="p-2 border">
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditRow(d.id)}
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteRow(d.id)}
                                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {details.length === 0 && (
                            <tr>
                                <td className="p-4 border text-center" colSpan={9}>
                                    No rows added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* ✅ Save button — OUTSIDE table & centered */}
                <div className="w-full flex justify-center mt-5">
                    <div className="w-fit">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>

            </>
        );
    }, [details]);

    // Render
    return (
        <div className="w-full space-y-6">
            <FormProvider {...methods}>
                <div className="bg-white p-3 rounded shadow">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-4 bg-gray-200 rounded-full w-max p-1">
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            onClick={() => {
                                setActiveTab(0);
                                setDisableClassSection(false);
                                setValue('sectionList', []);
                                setValue('classList', []);
                                setValue('subjectList', []);
                                setValue('subSubjectList', []);
                                setEditingId(null);
                            }}
                        >
                            Entry By Class teacher
                        </button>

                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            onClick={() => {
                                setActiveTab(1);
                                setDisableClassSection(false);
                                setValue('sectionList', []);
                                setValue('classList', []);
                                setValue('subjectList', []);
                                setValue('subSubjectList', []);
                                setEditingId(null);
                            }}
                        >
                            Entry By Subject Teacher
                        </button>

                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            onClick={() => {
                                setActiveTab(2);
                                setDisableClassSection(false);
                                setValue('sectionList', []);
                                setValue('classList', []);
                                setValue('subjectList', []);
                                setValue('subSubjectList', []);
                                setEditingId(null);
                            }}
                        >
                            Entry By Others
                        </button>
                    </div>


                    <form onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6"
                    >

                        {/* 2 Column Layout */}
                        <div className="grid grid-cols-2 gap-6">

                            {/* LEFT COLUMN ------------------------------------------ */}
                            <div className="flex flex-col gap-6">

                                {/* Academic Year */}
                                <Controller
                                    control={control}
                                    name="asmaY_Id"
                                    disabled={editingId !== null}
                                    render={({ field, fieldState }) => (
                                        <div className="w-full">
                                            <Label>Academic Year *</Label>
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {!academicYear ? (
                                                        <SelectItem value="0" disabled>Loading...</SelectItem>
                                                    ) : academicYear?.data?.length === 0 ? (
                                                        <SelectItem value="0" disabled>No academic years</SelectItem>
                                                    ) : (
                                                        academicYear?.data?.map((y) => (
                                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </div>
                                    )}
                                />
                                <Controller control={control} name="hrmE_Id" disabled={editingId !== null} render={({ field, fieldState }) => (<div className="w-full"> <Label>Employee Name *</Label> <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''} > <SelectTrigger> <SelectValue placeholder="Select Employee" /> </SelectTrigger> <SelectContent> {employeeLoading ? (<SelectItem value="loading" disabled>Loading...</SelectItem>) : employeeError ? (<SelectItem value="error" disabled>Error loading staff</SelectItem>) : !asmaY_Id ? (<SelectItem value="no-year" disabled>Select Academic Year first</SelectItem>) : !employeeData?.data || employeeData.data.length === 0 ? (<SelectItem value="empty" disabled>No Employee found</SelectItem>) : (employeeData.data.map((e: any) => (<SelectItem key={e.hrmE_Id} value={String(e.hrmE_Id)}> {e.employee_name} </SelectItem>)))} </SelectContent> </Select> {fieldState.error && <FormError>{fieldState.error.message}</FormError>} </div>)} />

                                {/* Classes */}
                                <Controller
                                    control={control}
                                    name="classList"
                                    render={({ field, fieldState }) => {
                                        const options = classes.map((c: any) => ({
                                            label: c.asmcL_ClassName ?? c.name ?? '',
                                            value: String(c.asmcL_Id ?? c.id),
                                        }));

                                        const selectedValues = (field.value || []).map((c: any) =>
                                            String(c?.asmcL_Id ?? c)
                                        );

                                        return (
                                            <CustomMultiSelectBox
                                                options={options}
                                                value={selectedValues}
                                                onChange={(vals) => {
                                                    const selected = vals.map(
                                                        (v) =>
                                                            classes.find((c) => String(c.asmcL_Id) === v) || {
                                                                asmcL_Id: Number(v),
                                                                asmcL_ClassName: '',
                                                            }
                                                    );
                                                    field.onChange(selected);
                                                }}
                                                label="Classes"
                                                height="200px"
                                                isSearchRequired
                                                disabled={disableClassSection}
                                                error={fieldState?.error?.message}
                                                isLoading={masterClassLoading}
                                            />
                                        );
                                    }}
                                />

                                {/* Subjects */}
                                <Controller
                                    control={control}
                                    name="subjectList"
                                    render={({ field, fieldState }) => {
                                        const options = subjects.map((s: any) => ({
                                            label: s.ismS_SubjectName,
                                            value: String(s.ismS_Id),
                                        }));

                                        const selectedValues = (field.value || []).map((s: any) =>
                                            String(s?.ismS_Id ?? s)
                                        );

                                        return (
                                            <CustomMultiSelectBox
                                                options={options}
                                                value={selectedValues}
                                                onChange={(vals) => {
                                                    const selected = vals.map(
                                                        (v) =>
                                                            subjects.find((s) => String(s.ismS_Id) === v) || {
                                                                ismS_Id: Number(v),
                                                                ismS_SubjectName: '',
                                                            }
                                                    );
                                                    field.onChange(selected);
                                                }}
                                                label="Subjects"
                                                height="200px"
                                                isSearchRequired
                                                error={fieldState?.error?.message}
                                                isLoading={masterSubjectLoading}
                                            />
                                        );
                                    }}
                                />

                            </div>

                            {/* RIGHT COLUMN ------------------------------------------ */}
                            <div className="flex flex-col gap-6">

                                {/* User Name */}
                                <Controller
                                    control={control}
                                    name="ivrmulF_Id"
                                    disabled={editingId !== null}
                                    render={({ field }) => (
                                        <div className="w-full">
                                            <Label>User Name</Label>
                                            <Select
                                                onValueChange={(v) => field.onChange(Number(v))}
                                                value={field.value ? String(field.value) : ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select User --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {userLogins.map((u) => (
                                                        <SelectItem key={u.ivrmulF_Id} value={String(u.ivrmulF_Id)}>
                                                            {u.userName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                />

                                {/* Sections */}
                                <Controller
                                    control={control}
                                    name="sectionList"
                                    render={({ field, fieldState }) => {
                                        const options = sections.map((s: any) => ({
                                            label: s.asmC_SectionName,
                                            value: String(s.asmS_Id),
                                        }));

                                        const selectedValues = (field.value || []).map((s: any) =>
                                            String(s?.asmS_Id ?? s)
                                        );

                                        return (
                                            <CustomMultiSelectBox
                                                options={options}
                                                value={selectedValues}
                                                onChange={(vals) => {
                                                    const selected = vals.map(
                                                        (v) =>
                                                            sections.find((s) => String(s.asmS_Id) === v) || {
                                                                asmS_Id: Number(v),
                                                                asmC_SectionName: '',
                                                            }
                                                    );
                                                    field.onChange(selected);
                                                }}
                                                label="Sections"
                                                height="200px"
                                                isSearchRequired
                                                disabled={disableClassSection}
                                                error={fieldState?.error?.message}
                                                isLoading={masterSectionLoading}
                                            />
                                        );
                                    }}
                                />

                                {/* Sub-subjects */}
                                <Controller
                                    control={control}
                                    name="subSubjectList"
                                    render={({ field, fieldState }) => {
                                        const options = subSubjects.map((s: any) => ({
                                            label: s.emsS_SubSubjectName ?? s.issS_SubSubjectName ?? '',
                                            value: String(s.emsS_Id ?? s.issS_Id),
                                        }));

                                        const selectedValues = (field.value || []).map((s: any) =>
                                            String(s?.emsS_Id ?? s?.issS_Id ?? s)
                                        );

                                        return (
                                            <CustomMultiSelectBox
                                                options={options}
                                                value={selectedValues}
                                                onChange={(vals) => {
                                                    const selected = vals.map(
                                                        (v) =>
                                                            subSubjects.find(
                                                                (s) => String(s.emsS_Id ?? s.issS_Id) === v
                                                            ) || {
                                                                emsS_Id: Number(v),
                                                                emsS_SubSubjectName: '',
                                                            }
                                                    );
                                                    field.onChange(selected);
                                                }}
                                                label="Sub-Subjects"
                                                height="200px"
                                                isSearchRequired
                                                error={fieldState?.error?.message}
                                                isLoading={masterSubSubjectLoading}
                                            />
                                        );
                                    }}
                                />

                                {/* Remarks */}
                                <Controller
                                    control={control}
                                    name="remarks"
                                    render={({ field }) => (
                                        <InputText
                                            {...field}
                                            label="Remarks"
                                            placeholder="Enter remarks"
                                        />
                                    )}
                                />

                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="w-full flex justify-center">
                            <div className="w-fit flex justify-center gap-3 mt-4">
                                {editingId ? (
                                    <>
                                        <Button type="button" onClick={handleUpdateRow}>Update Row</Button>
                                        <Button type="button" variant="outline" onClick={cancelEdit}>Cancel Edit</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button type="button" onClick={handleAddRows}>+ ADD</Button>

                                        <Button type="button" variant="outline" onClick={() => { reset(); setDetails([]); }}>Reset</Button>
                                    </>
                                )}
                            </div>
                        </div>


                    </form>


                </div>
                {details.length > 0 && (
                    <div className="bg-white p-4 rounded shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">DETAILS</h3>
                            {/* collapse/expand or additional controls can go here */}
                        </div>

                        <div className="overflow-x-auto">{detailsTable}</div>
                    </div>
                )}

            </FormProvider>
        </div>
    );
}
