'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
} from '@/server/exam/exam-module/reports/cumulative-report';
import type { IPromotionRemarksGrid } from '@/types/exam/exam-module/exam-mapping';
import { PromotionRemarksColumns } from './_components/columns';

/* -------------------------
   Placeholder fetch exams
   ------------------------- */
async function fetchexamsByClassAndSection(
    academicYearId: number | string,
    classId: number | string,
    sectionId: number | string
) {
    const res = await fetch(
        `/api/master/exams?academicYearId=${encodeURIComponent(String(academicYearId))}&classId=${encodeURIComponent(
            String(classId)
        )}&sectionId=${encodeURIComponent(String(sectionId))}`
    );
    if (!res.ok) throw new Error('Failed to load exams');
    const json = await res.json();
    return Array.isArray(json) ? json : [];
}

/* -------------------------
   Placeholder fetch students
   ------------------------- */
async function getStudentDetails(
    academicYearId: number | string,
    classId: number | string,
    sectionId: number | undefined
) {
    try {
        const res = await fetch(
            `/api/students?academicYearId=${encodeURIComponent(String(academicYearId))}&classId=${encodeURIComponent(
                String(classId)
            )}&sectionIds=${encodeURIComponent(String(sectionId))}`
        );
        if (!res.ok) throw new Error('Failed to fetch students');
        const json = await res.json();
        return { data: Array.isArray(json) ? json : [] };
    } catch (err) {
        console.error('Fetch failed, returning hardcoded data:', err);

        // Hardcoded 15 student records
        const hardcodedData = Array.from({ length: 15 }, (_, i) => ({
            slNo: i + 1,
            admNo: `ADM${1000 + i}`,
            studentName: `Student ${i + 1}`,
            studentId: i + 1,
            remarks: 'Good',
        }));

        return { data: hardcodedData };
    }
}


/* -------------------------
   Main Component
   ------------------------- */
export default function PromotionRemarksPage() {
    return <PromotionRemarksContent />;
}

function PromotionRemarksContent() {
    // Tabs
    const [activeTab, setActiveTab] = useState<number>(0);

    // Dropdown data
    const { data: academicDropdownData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [exams, setexams] = useState<{ termId: number; termName: string }[]>([]);

    // Selected values
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | undefined>();
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>();
    const [selectedTerm, setSelectedTerm] = useState<number | undefined>();

    // Students
    const [students, setStudents] = useState<IPromotionRemarksGrid[]>([]);
    const [preSelectedStudentIds, setPreSelectedStudentIds] = useState<string[]>([]);
    const [tableProps, setTableProps] = useState<ReturnType<typeof useDataTableProps> | null>(null);
    const [isStudentsGridOpen, setIsStudentsGridOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Loading flags
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingexams, setLoadingexams] = useState(false);

    /* -------------------------
       Load academic years
       ------------------------- */
    useEffect(() => {
        if (academicError) {
            toast.error('Failed to load academic years');
            return;
        }

        if (academicDropdownData?.data && Array.isArray(academicDropdownData.data)) {
            const yrs = academicDropdownData.data.map((y: any) => ({
                asmaY_Id: y.asmaY_Id,
                asmaY_Year: y.asmaY_Year,
            }));
            setAcademicYears(yrs);
            if (yrs.length > 0 && !selectedAcademicYear) {
                setSelectedAcademicYear(yrs[0].asmaY_Id);
            }
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
                const { data } = await getClassDropDownByAcademicYearlist(selectedAcademicYear);
                setClasses(Array.isArray(data) ? data : []);
                setSections([]);
                setSelectedSectionId(undefined);
                setexams([]);
                setSelectedTerm(undefined);
            } catch (err) {
                toast.error('Failed to load classes');
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
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedAcademicYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
                setSelectedSectionId(undefined);
                setexams([]);
                setSelectedTerm(undefined);
            } catch (err) {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedAcademicYear, selectedClass]);

    /* -------------------------
       Load exams
       ------------------------- */
    useEffect(() => {
        if (activeTab !== 0 || !selectedAcademicYear || !selectedClass || selectedSectionId) {
            setexams([]);
            setSelectedTerm(undefined);
            return;
        }

        (async () => {
            setLoadingexams(true);
            try {
                const termData = await fetchexamsByClassAndSection(selectedAcademicYear, selectedClass, Number(selectedSectionId));
                const normalized = Array.isArray(termData)
                    ? termData.map((t: any) => ({
                        termId: t.termId ?? t.id ?? 0,
                        termName: t.termName ?? t.name ?? '',
                    }))
                    : [];
                setexams(normalized);
                if (normalized.length > 0) setSelectedTerm(normalized[0].termId);
                else toast.info('No exams found for selected class and section');
            } catch (err) {
                toast.error('Failed to load exams');
                setexams([]);
                setSelectedTerm(undefined);
            } finally {
                setLoadingexams(false);
            }
        })();
    }, [activeTab, selectedAcademicYear, selectedClass, selectedSectionId]);

    /* -------------------------
       Handle search manually
       ------------------------- */
    const handleSearch = async () => {
        if (!selectedAcademicYear || !selectedClass || !selectedSectionId) {
            toast.info('Select all required fields before search');
            return;
        }
        if (activeTab === 0 && selectedTerm === undefined) {
            toast.info('Select term before search');
            return;
        }

        setIsLoading(true);
        setIsStudentsGridOpen(true);
        try {
            const { data } = await getStudentDetails(selectedAcademicYear, selectedClass, selectedSectionId);
            const studentList: IPromotionRemarksGrid[] = Array.isArray(data)
                ? data.map((s: any, index: number) => ({
                    slNo: index + 1,
                    admNo: s.admNo ?? '',
                    studentName: s.studentName ?? '',
                    studentId: s.studentId ?? 0,
                    remarks: s.remarks ?? '',
                }))
                : [];

            const preSelected = studentList
                .filter((s) => s.remarks && s.remarks.trim() !== '')
                .map((s, index) => index.toString());
            setPreSelectedStudentIds(preSelected);

            setStudents(studentList);

            setTableProps(
                useDataTableProps({
                    data: studentList,
                    total: studentList.length,
                    pageIndex: 0,
                    pageSize: 10,
                })
            );
        } catch (err: any) {
            toast.error(err?.message || 'Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    };

    /* -------------------------
       Update student remarks
       ------------------------- */
    const updateStudent = (id: number, remarks: string) => {
        setStudents((prev) => {
            const updated = prev.map((s) => (s.studentId === id ? { ...s, remarks: remarks } : s));

            // also update table props
            setTableProps((tp: any) => ({
                ...tp,
                data: updated
            }));

            return updated;
        });
    };
    const columns = PromotionRemarksColumns(updateStudent);

    /* -------------------------
       Render
       ------------------------- */
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="container mx-auto space-y-4">


                {/* Tabs */}
                <div className="flex items-center justify-center">
                    <div className="flex gap-2 mb-4 bg-gray-200 rounded-full w-max p-1">
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            onClick={() => {
                                setActiveTab(0);
                                setSelectedTerm(undefined);
                            }}
                        >
                            Individual Term Wise
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${activeTab === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                }`}
                            onClick={() => {
                                setActiveTab(1);
                                setSelectedTerm(undefined);
                            }}
                        >
                            Overall Term Wise
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-md border bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        {/* Academic Year */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Academic Year <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedAcademicYear ? String(selectedAcademicYear) : ''}
                                onValueChange={(v) => setSelectedAcademicYear(v !== 'none' ? Number(v) : undefined)}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Academic Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingAcademic
                                        ? [<SelectItem value="loading" key="loading">Loading...</SelectItem>]
                                        : academicYears.length === 0
                                            ? [<SelectItem value="none" key="empty">-- No academic years --</SelectItem>]
                                            : academicYears.map((y) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                    {y.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Class */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Class <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedClass ? String(selectedClass) : ''}
                                onValueChange={(v) => setSelectedClass(v !== 'none' ? Number(v) : undefined)}
                                disabled={!selectedAcademicYear || loadingClasses}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {!selectedAcademicYear
                                        ? [<SelectItem value="none" key="empty">-- Select Academic Year first --</SelectItem>]
                                        : loadingClasses
                                            ? [<SelectItem value="loading" key="loading">Loading classes...</SelectItem>]
                                            : classes.length === 0
                                                ? [<SelectItem value="none" key="empty">-- No classes --</SelectItem>]
                                                : classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Section */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedSectionId ? String(selectedSectionId) : ''}
                                onValueChange={(v) => setSelectedSectionId(v !== 'none' ? Number(v) : undefined)}
                                disabled={!selectedClass || loadingSections}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingSections
                                        ? [<SelectItem value="loading" key="loading">Loading sections...</SelectItem>]
                                        : sections.length === 0
                                            ? [<SelectItem value="none" key="empty">-- No sections --</SelectItem>]
                                            : sections.map((s) => (
                                                <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                    {s.asmC_SectionName}
                                                </SelectItem>
                                            ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Term */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Term <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={selectedTerm ? String(selectedTerm) : ''}
                                onValueChange={(v) => setSelectedTerm(v !== 'none' && v !== 'disabled' ? Number(v) : undefined)}
                                disabled={activeTab === 1 || loadingexams}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue
                                        placeholder={
                                            activeTab === 1
                                                ? '-- Disabled for Overall --'
                                                : loadingexams
                                                    ? 'Loading exams...'
                                                    : 'Select Term'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeTab === 1
                                        ? [<SelectItem value="disabled" key="disabled">-- Disabled for Overall --</SelectItem>]
                                        : loadingexams
                                            ? [<SelectItem value="loading" key="loading">Loading exams...</SelectItem>]
                                            : exams.length === 0
                                                ? [<SelectItem value="none" key="empty">-- No exams --</SelectItem>]
                                                : exams.map((t) => (
                                                    <SelectItem key={t.termId} value={String(t.termId)}>
                                                        {t.termName}
                                                    </SelectItem>
                                                ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    <div className="w-fit mx-auto mt-6">
                        <Button className="px-6 py-2 shadow" onClick={handleSearch}>
                            SEARCH
                        </Button>
                    </div>


                </div>

                {/* Students Grid */}
                {isStudentsGridOpen && tableProps && (
                    <CollapsibleSection
                        defaultOpen
                        variant="default"
                        size="lg"
                        className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
                    >
                        <GenericDataTable<IPromotionRemarksGrid>
                            {...tableProps}
                            columns={columns}
                            isLoading={isLoading}
                            columnPinning={{ right: ['actions'] }}
                            loadingMessage="Loading remarks..."
                            noDataTitle="No Records Found"
                            noDataDescription="Click SEARCH to view remarks"
                            errorTitle="Error Loading Remarks"
                        />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
