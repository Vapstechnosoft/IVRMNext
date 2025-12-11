'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getExamsDropDownByAcademicYearandClassandSectionlist,
    getSectionsDropDownByAcademicYearandClasslist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import { buildMarksEntryColumns, IStudentMarksRow } from './_components/columns';
import MarksCustomTable from './_components/marks-entry-custom-table';
import { GetLoginPrivilegeClassesDropdown, GetLoginPrivilegeSectionsDropdown, getSubjectsByAcademicYearandClassandSectionlist } from '@/server/exam/exam-module/marks-entry/exam-marks-entry';

/**
 * NOTE:
 * - This file keeps your original logic but fixes the dropdown-fetch flow,
 *   completes the save/validate code, and keeps the mock fetch.
 *
 * - Replace mocks with real API calls when ready.
 */

/* -------------------------
   Types used by this page
   ------------------------- */
export interface ISubjectMeta {
    subjectId: number;
    subjectName: string;
    subsubFlag: boolean;
    subexamFlag: boolean;
    maxMarks: number;
    minMarks?: number;
    subsubData: { subsubId: number; subsubName: string; maxMarks: number; minMarks?: number }[];
    subexamData: { subexamId: number; subexamName: string; maxMarks: number; minMarks?: number }[];
}

/* -------------------------
   Mock fetch: returns the JSON you provided (scenario: no flags)
   Replace with a real API call in production
   ------------------------- */
async function fetchSubjectAndStudentsMock(
    academicYearId: number | string,
    classId: number | string,
    sectionId: number | string,
    examId?: number | string,
    subjectId?: number | string
) {
    let subjectData: any = {};

    if (subjectId === 1) {
        // No flags
        subjectData = {
            subjectId: 1,
            subjectName: 'FL KANNADA',
            subsubFlag: false,
            subexamFlag: false,
            maxMarks: 25,
            minMarks: 0,
            subsubData: [],
            subexamData: [],
        };
    } else if (subjectId === 12) {
        // Sub-subjects enabled
        subjectData = {
            subjectId: 12,
            subjectName: 'FL KANNADA (SUBS)',
            subsubFlag: true,
            subexamFlag: false,
            maxMarks: 50,
            minMarks: 20,
            subsubData: [
                { subsubId: 1, subsubName: 'Sub 1', maxMarks: 15, minMarks: 5 },
                { subsubId: 2, subsubName: 'Sub 2', maxMarks: 20, minMarks: 10 },
                { subsubId: 3, subsubName: 'Sub 3', maxMarks: 15, minMarks: 5 },
            ],
            subexamData: [],
        };
    } else if (subjectId === 44) {
        // Sub-exams enabled
        subjectData = {
            subjectId: 44,
            subjectName: 'MATHEMATICS (EXAMS)',
            subsubFlag: false,
            subexamFlag: true,
            maxMarks: 80,
            minMarks: 30,
            subsubData: [],
            subexamData: [
                { subexamId: 1, subexamName: 'Exam 1', maxMarks: 40, minMarks: 10 },
                { subexamId: 2, subexamName: 'Exam 2', maxMarks: 40, minMarks: 10 },
            ],
        };
    } else {
        // fallback
        subjectData = {
            subjectId: 0,
            subjectName: 'Unknown',
            subsubFlag: false,
            subexamFlag: false,
            maxMarks: 0,
            minMarks: 0,
            subsubData: [],
            subexamData: [],
        };
    }

    const studentData = Array.from({ length: 15 }, (_, i) => {
        const id = 101 + i;

        return {
            studentID: id,
            studentName: `Student ${i + 1}`,
            RegNo: `REG/${1000 + i}`,
            AdmissionNo: `ADM/${1000 + i}`,
            RollNo: 10 + i,
            marks: '', // keep blank for main mark if subsub/subexam used
            subSubMarks: subjectData.subsubFlag
                ? subjectData.subsubData.map((sub: { subsubId: any; maxMarks: number }) => ({
                    subsubId: sub.subsubId,
                    marks: '', // leave blank for entry
                }))
                : [],
            subExamMarks: subjectData.subexamFlag
                ? subjectData.subexamData.map((se: { subexamId: any; maxMarks: number }) => ({
                    subexamId: se.subexamId,
                    marks: '',
                }))
                : [],
        };
    });

    await new Promise((r) => setTimeout(r, 350)); // emulate latency

    return { subjectData, studentData };
}

/* -------------------------
   Page Component
   ------------------------- */
export default function MarksEntryPage() {
    return <MarksEntryContent />;
}

function MarksEntryContent() {
    // Tabs: Individual/Overall
    const [activeTab, setActiveTab] = useState<number>(0);

    // dropdown data
    const { data: academicDropdownData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<{ subjectId: number; subjectName: string }[]>([]);

    // selected
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
    const [selectedExam, setSelectedExam] = useState<number | undefined>();
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>();

    // data & table
    const [subjectMeta, setSubjectMeta] = useState<ISubjectMeta | null>(null);
    const [students, setStudents] = useState<IStudentMarksRow[]>([]);
    const [tableProps, setTableProps] = useState<ReturnType<typeof useDataTableProps> | null>(null);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // loading flags
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    /* -------------------------
       Load academic years
       ------------------------- */
    useEffect(() => {
        if (academicError) {
            toast.error('Failed to load academic years');
            return;
        }
        if (academicDropdownData?.data && Array.isArray(academicDropdownData.data)) {
            const yrs = academicDropdownData.data.map((y: any) => ({ asmaY_Id: y.asmaY_Id, asmaY_Year: y.asmaY_Year }));
            setAcademicYears(yrs);
            if (yrs.length > 0 && !selectedAcademicYear) setSelectedAcademicYear(yrs[0].asmaY_Id);
        }
    }, [academicDropdownData, academicError, selectedAcademicYear]);

    /* -------------------------
       Load classes when academic year changes
       ------------------------- */
    useEffect(() => {
        if (!selectedAcademicYear) {
            setClasses([]);
            setSelectedClass(undefined);
            return;
        }

        (async () => {
            setLoadingClasses(true);
            try {
                // Use your privileged endpoint if available
                const res = await GetLoginPrivilegeClassesDropdown(selectedAcademicYear);
                const data = res?.data ?? [];
                if (!Array.isArray(data) || data.length === 0) {
                    toast.info('No classes are mapped for your selections');
                }
                setClasses(Array.isArray(data) ? data : []);
                // reset dependent selects
                setSections([]);
                setSelectedSectionId(undefined);
                setExams([]);
                setSelectedExam(undefined);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load classes');
                setClasses([]);
                setSelectedClass(undefined);
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedAcademicYear]);

    /* -------------------------
       Load sections when class changes
       ------------------------- */
    useEffect(() => {
        if (!selectedAcademicYear || !selectedClass) {
            setSections([]);
            setSelectedSectionId(undefined);
            return;
        }

        (async () => {
            setLoadingSections(true);
            try {
                const res = await GetLoginPrivilegeSectionsDropdown(selectedAcademicYear, selectedClass);
                const data = res?.data ?? [];
                setSections(Array.isArray(data) ? data : []);
                setSelectedSectionId(undefined);
                setExams([]);
                setSelectedExam(undefined);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load sections');
                setSections([]);
                setSelectedSectionId(undefined);
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedAcademicYear, selectedClass]);

    /* -------------------------
       Load exams when section selected
       ------------------------- */
    useEffect(() => {
        if (activeTab !== 0 || !selectedAcademicYear || !selectedClass || !selectedSectionId) {
            setExams([]);
            setSelectedExam(undefined);
            return;
        }

        (async () => {
            setLoadingExams(true);
            try {
                const res = await getExamsDropDownByAcademicYearandClassandSectionlist(selectedAcademicYear, selectedClass, selectedSectionId);
                // Normalize possible shapes — your backend sometimes returns different keys
                const data = res?.data ?? [];
                // Some endpoints return { emE_Id, emE_ExamName } while others return { examId, examName }
                const normalized = (Array.isArray(data) ? data : []).map((x: any) => {
                    if (x.emE_Id !== undefined) return { examId: x.emE_Id, examName: x.emE_ExamName };
                    if (x.examId !== undefined) return { examId: x.examId, examName: x.examName };
                    // fallback: attempt to guess keys
                    const keys = Object.keys(x);
                    return { examId: x[keys[0]], examName: x[keys[1]] ?? JSON.stringify(x) };
                });
                setExams(normalized);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load exams');
                setExams([]);
                setSelectedExam(undefined);
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [activeTab, selectedAcademicYear, selectedClass, selectedSectionId]);

    /* -------------------------
       mock subjects list (still using your static list)
       ------------------------- */
    useEffect(() => {
        if (activeTab !== 0 || !selectedAcademicYear || !selectedClass || !selectedSectionId) return;
        (async () => {
            try {
                const res = await getSubjectsByAcademicYearandClassandSectionlist(selectedAcademicYear, selectedClass, selectedSectionId);
                const data = res?.data ?? [];
                const normalized = (Array.isArray(data) ? data : []).map((x: any) => {
                    if (x.subjectId !== undefined) return { subjectId: x.ismS_Id, subjectName: x.ismS_SubjectName };
                    // fallback: attempt to guess keys
                    const keys = Object.keys(x);
                    return { subjectId: x[keys[0]], subjectName: x[keys[1]] ?? JSON.stringify(x) };
                });
                setSubjects(normalized);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load subjects');
                setSubjects([
                    { subjectId: 1, subjectName: 'FL KANNADA (M-25)' },
                    { subjectId: 12, subjectName: 'FL KANNADA (M-50) (SUBS)' },
                    { subjectId: 44, subjectName: 'MATHEMATICS (M-80) (EXAMS)' }
                ]);
                setSelectedSubjectId(undefined);
            }
        })

    }, []);

    /* -------------------------
       handleSearch -> fetch subject+students
       ------------------------- */
    const handleSearch = async () => {
        if (!selectedAcademicYear || !selectedClass || !selectedSectionId) {
            toast.info('Select all required fields before search');
            return;
        }
        // exam is optional for some flows — keep commented code if you want mandatory
        // if (activeTab === 0 && selectedExam === undefined) {
        //     toast.info('Select exam before search');
        //     return;
        // }
        if (!selectedSubjectId) {
            toast.info('Select subject before search');
            return;
        }

        setIsLoading(true);
        setIsStudentsGridOpen(true);

        try {
            const resp = await fetchSubjectAndStudentsMock(selectedAcademicYear!, selectedClass!, String(selectedSectionId!), selectedExam, selectedSubjectId);
            const s = resp.subjectData;

            const subjectMeta: ISubjectMeta = {
                subjectId: Number(s.subjectId ?? 0),
                subjectName: String(s.subjectName ?? ''),
                subsubFlag: !!s.subsubFlag,
                subexamFlag: !!s.subexamFlag,
                maxMarks: Number(s.maxMarks ?? 0),
                minMarks: s.minMarks !== undefined ? Number(s.minMarks) : undefined,
                subsubData: Array.isArray(s.subsubData) ? s.subsubData.map((x: any) => ({
                    subsubId: Number(x.subsubId ?? x.subsubid ?? x.id),
                    subsubName: String(x.subsubName ?? x.subsubName ?? x.subsubName ?? x.name ?? ''),
                    maxMarks: Number(x.maxMarks ?? x.max ?? 0),
                    minMarks: x.minMarks !== undefined ? Number(x.minMarks) : undefined
                })) : [],
                subexamData: Array.isArray(s.subexamData) ? s.subexamData.map((x: any) => ({
                    subexamId: Number(x.subexamId ?? x.subexamid ?? x.id),
                    subexamName: String(x.subexamName ?? x.subexamName ?? x.name ?? ''),
                    maxMarks: Number(x.maxMarks ?? x.max ?? 0),
                    minMarks: x.minMarks !== undefined ? Number(x.minMarks) : undefined
                })) : []
            };

            // normalize students
            const students: IStudentMarksRow[] = Array.isArray(resp.studentData) ? resp.studentData.map((st: any) => {
                const row: IStudentMarksRow = {
                    studentID: st.studentID ?? st.studentId ?? 0,
                    studentName: st.studentName ?? st.name ?? '',
                    RegNo: st.RegNo ?? st.Reg_No ?? '',
                    AdmissionNo: st.AdmissionNo ?? st.Admission_no ?? st.AdmissionNo ?? '',
                    RollNo: st.RollNo ?? st.rollNo ?? 0
                };

                if (!subjectMeta.subsubFlag && !subjectMeta.subexamFlag) {
                    row.marks = st.marks === '' || st.marks === undefined ? '' : Number(st.marks);
                } else {
                    if (subjectMeta.subsubFlag) {
                        row.subSubMarks = subjectMeta.subsubData.map((ss) => {
                            const found = Array.isArray(st.subSubMarks) ? st.subSubMarks.find((x: any) => Number(x.subsubId ?? x.subsubid) === Number(ss.subsubId)) : undefined;
                            return { subsubId: ss.subsubId, marks: found?.marks === '' || found?.marks === undefined ? '' : Number(found?.marks) };
                        });
                    }
                    if (subjectMeta.subexamFlag) {
                        row.subExamMarks = subjectMeta.subexamData.map((se) => {
                            const found = Array.isArray(st.subExamMarks) ? st.subExamMarks.find((x: any) => Number(x.subexamId ?? x.subexamid) === Number(se.subexamId)) : undefined;
                            return { subexamId: se.subexamId, marks: found?.marks === '' || found?.marks === undefined ? '' : Number(found?.marks) };
                        });
                    }
                }

                return row;
            }) : [];

            setSubjectMeta(subjectMeta);
            setStudents(students);

            setTableProps(
                useDataTableProps({
                    data: students,
                    total: students.length,
                    pageIndex: 0,
                    pageSize: 10
                })
            );
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || 'Failed to fetch students/subject');
            setSubjectMeta(null);
            setStudents([]);
            setTableProps(null);
            setIsStudentsGridOpen(false);
        } finally {
            setIsLoading(false);
        }
    };

    /* -------------------------
       Update handlers for marks (update state + tableProps)
       ------------------------- */
    const updateSimpleMark = (studentID: number, newMark: number | '') => {
        setStudents((prev) => {
            const updated = prev.map((r) => (r.studentID === studentID ? { ...r, marks: newMark } : r));
            setTableProps((tp: any) => ({ ...tp, data: updated }));
            return updated;
        });
    };

    const updateSubSubMark = (studentID: number, subsubId: number, newMark: number | '') => {
        setStudents((prev) => {
            const updated = prev.map((r) => {
                if (r.studentID !== studentID) return r;
                const ssm = r.subSubMarks ? [...r.subSubMarks] : [];
                const idx = ssm.findIndex((x) => x.subsubId === subsubId);
                if (idx >= 0) ssm[idx] = { ...ssm[idx], marks: newMark };
                else ssm.push({ subsubId, marks: newMark });
                return { ...r, subSubMarks: ssm };
            });
            setTableProps((tp: any) => ({ ...tp, data: updated }));
            return updated;
        });
    };

    const updateSubExamMark = (studentID: number, subexamId: number, newMark: number | '') => {
        setStudents((prev) => {
            const updated = prev.map((r) => {
                if (r.studentID !== studentID) return r;
                const sem = r.subExamMarks ? [...r.subExamMarks] : [];
                const idx = sem.findIndex((x) => x.subexamId === subexamId);
                if (idx >= 0) sem[idx] = { ...sem[idx], marks: newMark };
                else sem.push({ subexamId, marks: newMark });
                return { ...r, subExamMarks: sem };
            });
            setTableProps((tp: any) => ({ ...tp, data: updated }));
            return updated;
        });
    };

    /* -------------------------
       Columns (memoized)
       ------------------------- */
    const columns = useMemo(() => {
        return buildMarksEntryColumns(subjectMeta, updateSimpleMark, updateSubSubMark, updateSubExamMark);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectMeta]); // intentionally only subjectMeta here — columns depend on meta

    /* -------------------------
       Save - validate everything and print (or send to API)
       ------------------------- */
    const handleSave = () => {
        if (!subjectMeta) {
            toast.error('No subject loaded');
            return;
        }

        // validate rows
        const errors: string[] = [];
        students.forEach((s) => {
            if (!subjectMeta.subsubFlag && !subjectMeta.subexamFlag) {
                // simple
                const v = s.marks === '' || s.marks === undefined ? null : Number(s.marks);
                if (v === null || v === undefined || Number.isNaN(v)) {
                    errors.push(`${s.studentName}: Marks required`);
                } else {
                    if (subjectMeta.minMarks !== undefined && v < subjectMeta.minMarks) errors.push(`${s.studentName}: below min (${subjectMeta.minMarks})`);
                    if (v > subjectMeta.maxMarks) errors.push(`${s.studentName}: above max (${subjectMeta.maxMarks})`);
                }
            } else {
                if (subjectMeta.subsubFlag) {
                    // ensure all subsub marks are present and respect sub-sub max (if provided) and total
                    const arr = s.subSubMarks ?? [];
                    // check count match
                    if (arr.length !== subjectMeta.subsubData.length) {
                        errors.push(`${s.studentName}: all sub-subject marks required`);
                    } else {
                        // check each value & sum
                        let sum = 0;
                        for (let i = 0; i < arr.length; i++) {
                            const m = arr[i].marks;
                            const maxForSub = subjectMeta.subsubData[i]?.maxMarks ?? subjectMeta.maxMarks;
                            const minForSub = subjectMeta.subsubData[i]?.minMarks;
                            if (m === '' || m === undefined || Number.isNaN(Number(m))) {
                                errors.push(`${s.studentName}: sub-subject ${subjectMeta.subsubData[i]?.subsubName ?? subjectMeta.subsubData[i]?.subsubId} marks required`);
                            } else {
                                const num = Number(m);
                                if (minForSub !== undefined && num < minForSub) errors.push(`${s.studentName}: sub-sub ${subjectMeta.subsubData[i].subsubName} below min (${minForSub})`);
                                if (maxForSub !== undefined && num > maxForSub) errors.push(`${s.studentName}: sub-sub ${subjectMeta.subsubData[i].subsubName} above max (${maxForSub})`);
                                sum += num;
                            }
                        }
                        if (sum > subjectMeta.maxMarks) errors.push(`${s.studentName}: sub-subject sum exceeds max (${subjectMeta.maxMarks})`);
                    }
                }

                if (subjectMeta.subexamFlag) {
                    // similar checks for sub-exam
                    const arr = s.subExamMarks ?? [];
                    if (arr.length !== subjectMeta.subexamData.length) {
                        errors.push(`${s.studentName}: all sub-exam marks required`);
                    } else {
                        let sum = 0;
                        for (let i = 0; i < arr.length; i++) {
                            const m = arr[i].marks;
                            const maxForSub = subjectMeta.subexamData[i]?.maxMarks ?? subjectMeta.maxMarks;
                            const minForSub = subjectMeta.subexamData[i]?.minMarks;
                            if (m === '' || m === undefined || Number.isNaN(Number(m))) {
                                errors.push(`${s.studentName}: sub-exam ${subjectMeta.subexamData[i]?.subexamName ?? subjectMeta.subexamData[i]?.subexamId} marks required`);
                            } else {
                                const num = Number(m);
                                if (minForSub !== undefined && num < minForSub) errors.push(`${s.studentName}: sub-exam ${subjectMeta.subexamData[i].subexamName} below min (${minForSub})`);
                                if (maxForSub !== undefined && num > maxForSub) errors.push(`${s.studentName}: sub-exam ${subjectMeta.subexamData[i].subexamName} above max (${maxForSub})`);
                                sum += num;
                            }
                        }
                        if (sum > subjectMeta.maxMarks) errors.push(`${s.studentName}: sub-exam sum exceeds max (${subjectMeta.maxMarks})`);
                    }
                }
            }
        });

        if (errors.length > 0) {
            toast.error('Validation failed - open console for details');
            console.error('Validation errors', errors);
            return;
        }

        // build payload
        const payload = {
            academicYearId: selectedAcademicYear,
            classId: selectedClass,
            sectionId: selectedSectionId,
            examId: selectedExam,
            subjectId: subjectMeta.subjectId,
            studentData: students
        };
        console.log('Save payload', payload);
        toast.success('Validation passed - payload logged to console (replace with API call)');
    };

    /* -------------------------
       Render
       ------------------------- */
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="container mx-auto space-y-4">
                {/* Filters */}
                <div className="rounded-md border bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Academic Year */}
                        <div>
                            <label htmlFor="academicYear" className="mb-1 block text-sm font-medium text-slate-700">
                                Academic Year <span className="text-red-500">*</span>
                            </label>

                            <Select
                                //id="academicYear"
                                value={selectedAcademicYear ? String(selectedAcademicYear) : ""}
                                onValueChange={(v) => setSelectedAcademicYear(v !== "none" ? Number(v) : undefined)}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>

                                <SelectContent>
                                    {loadingAcademic ? (
                                        <SelectItem value="loading">Loading...</SelectItem>
                                    ) : academicYears.length === 0 ? (
                                        <SelectItem value="none">-- No academic years --</SelectItem>
                                    ) : (
                                        academicYears.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class */}
                        <div>
                            <label htmlFor="classSelect" className="mb-1 block text-sm font-medium text-slate-700">
                                Class <span className="text-red-500">*</span>
                            </label>

                            <Select
                                //id="classSelect"
                                value={selectedClass ? String(selectedClass) : ""}
                                onValueChange={(v) => setSelectedClass(v !== "none" ? Number(v) : undefined)}
                                disabled={!selectedAcademicYear || loadingClasses}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>

                                <SelectContent>
                                    {!selectedAcademicYear ? (
                                        <SelectItem value="none">-- Select Academic Year first --</SelectItem>
                                    ) : loadingClasses ? (
                                        <SelectItem value="loading">Loading classes...</SelectItem>
                                    ) : classes.length === 0 ? (
                                        <SelectItem value="none">-- No classes --</SelectItem>
                                    ) : (
                                        classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section */}
                        <div>
                            <label htmlFor="sectionSelect" className="mb-1 block text-sm font-medium text-slate-700">
                                Section <span className="text-red-500">*</span>
                            </label>

                            <Select
                                //id="sectionSelect"
                                value={selectedSectionId ? String(selectedSectionId) : ""}
                                onValueChange={(v) => setSelectedSectionId(v !== "none" ? Number(v) : undefined)}
                                disabled={!selectedClass || loadingSections}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>

                                <SelectContent>
                                    {loadingSections ? (
                                        <SelectItem value="loading">Loading sections...</SelectItem>
                                    ) : sections.length === 0 ? (
                                        <SelectItem value="none">-- No sections --</SelectItem>
                                    ) : (
                                        sections.map((s) => (
                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exam */}
                        <div>
                            <label htmlFor="examSelect" className='mb-1 block font-medium text-slate-700 text-sm'>
                                Exam <span className="text-red-500">*</span>
                            </label>

                            <Select
                                //id="examSelect"
                                value={selectedExam ? String(selectedExam) : ""}
                                onValueChange={(v) => setSelectedExam(v !== "none" && v !== "disabled" ? Number(v) : undefined)}
                                disabled={activeTab === 1 || loadingExams}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder={activeTab === 1 ? "-- Disabled for Overall --" : "Select exam"} />
                                </SelectTrigger>

                                <SelectContent>
                                    {activeTab === 1 ? (
                                        <SelectItem value="disabled">-- Disabled for Overall --</SelectItem>
                                    ) : loadingExams ? (
                                        <SelectItem value="loading">Loading exams...</SelectItem>
                                    ) : exams.length === 0 ? (
                                        <SelectItem value="none">-- No exams --</SelectItem>
                                    ) : (
                                        exams.map((t: any) => (
                                            <SelectItem key={String(t.examId)} value={String(t.examId)}>
                                                {t.examName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject */}
                        <div className="mt-4 md:col-span-1">
                            <label htmlFor="subjectSelect" className="mb-1 block text-sm font-medium text-slate-700">
                                Subject <span className="text-red-500">*</span>
                            </label>

                            <Select
                                //id="subjectSelect"
                                value={selectedSubjectId ? String(selectedSubjectId) : ""}
                                onValueChange={(v) => setSelectedSubjectId(v !== "none" ? Number(v) : undefined)}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>

                                <SelectContent>
                                    {subjects.length === 0 ? (
                                        <SelectItem value="none">-- No subjects --</SelectItem>
                                    ) : (
                                        subjects.map((s) => (
                                            <SelectItem key={s.subjectId} value={String(s.subjectId)}>
                                                {s.subjectName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="mt-3 text-sm">
                        <label className="inline-flex items-center">
                            <input type="checkbox" className="mr-2" />
                            Do You Want Calculate Marks ?
                        </label>
                    </div>
                    <div className="w-fit mx-auto mt-6">
                        <Button className="px-6 py-2 shadow" onClick={handleSearch}>SEARCH</Button>
                    </div>
                </div>

                {/* Students Grid */}
                {isStudentsGridOpen && tableProps && subjectMeta && (
                    <CollapsibleSection defaultOpen variant="default" size="lg" className="shadow-lg transition-shadow duration-300 hover:shadow-xl">
                        <div>
                            {/* The custom table component handles rendering + inputs */}
                            <MarksCustomTable
                                subjectMeta={subjectMeta}
                                students={students}
                                onUpdateSubSubMark={updateSubSubMark}
                                onUpdateSubExamMark={updateSubExamMark}
                                onUpdateSimpleMark={updateSimpleMark}
                                onSave={handleSave}
                            />
                        </div>

                        <div className="p-4 flex gap-2 justify-end">
                            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>Save</Button>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
