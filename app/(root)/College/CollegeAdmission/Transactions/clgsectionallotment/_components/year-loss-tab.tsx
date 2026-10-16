'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { StudentTransferList } from './student-transfer-list';
import { AllottedStudentsTable } from './allotted-students-table';
import {
    useGetClgSectionAllotmentYearLossAcademic,
    useGetClgSectionAllotmentYearLossBranch,
    useGetClgSectionAllotmentYearLossSem,
    useGetClgSectionAllotmentYearLossStudents,
    useSaveClgSectionAllotment
} from '@/hooks/college/useClgSectionAllotment';
import { IClgSectionAllotmentStudent } from '@/types/college/transactions';

interface YearLossTabProps {
    initialData: any;
    refetchAll: () => void;
}

export function YearLossTab({ initialData, refetchAll }: YearLossTabProps) {
    const [asmaY_Id, setAsmaY_Id] = useState<string>('');
    const [amcO_Id, setAmcO_Id] = useState<string>('');
    const [amB_Id, setAmB_Id] = useState<string>('');
    const [amsE_Id, setAmsE_Id] = useState<string>('');
    const [acmS_Id, setAcmS_Id] = useState<string>('');

    // Dynamic Lists
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semList, setSemList] = useState<any[]>([]);

    // Students
    const [availableStudents, setAvailableStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<IClgSectionAllotmentStudent[]>([]);
    const [allottedStudents, setAllottedStudents] = useState<IClgSectionAllotmentStudent[]>([]);

    // Mutations
    const getYearLossAcademicMutation = useGetClgSectionAllotmentYearLossAcademic();
    const getYearLossBranchMutation = useGetClgSectionAllotmentYearLossBranch();
    const getYearLossSemMutation = useGetClgSectionAllotmentYearLossSem();
    const getYearLossStudentsMutation = useGetClgSectionAllotmentYearLossStudents();
    const saveMutation = useSaveClgSectionAllotment();

    // Default Academic Year from initialData (defensive against any casing / structure)
    const yearList: any[] =
        initialData?.yearList ||
        initialData?.yearlist ||
        initialData?.YearList ||
        initialData?.accyearlist ||
        initialData?.data?.yearList ||
        initialData?.data?.yearlist ||
        (Array.isArray(initialData) ? initialData : []);

    const sectionList: any[] =
        initialData?.sectionList ||
        initialData?.sectionlist ||
        initialData?.SectionList ||
        initialData?.data?.sectionList ||
        initialData?.data?.sectionlist ||
        [];

    useEffect(() => {
        if (yearList.length > 0 && !asmaY_Id) {
            const first = yearList[0];
            const defaultYear = (first?.asmaY_Id ?? first?.ASMAY_Id ?? first?.asmay_Id ?? first?.id)?.toString() || '';
            setAsmaY_Id(defaultYear);
            if (defaultYear) {
                handleYearChange(defaultYear);
            }
        }
    }, [yearList]);

    // Handle Year Change
    const handleYearChange = async (yearId: string) => {
        setAsmaY_Id(yearId);
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setCourseList([]);
        setBranchList([]);
        setSemList([]);
        setAvailableStudents([]);
        setSelectedStudents([]);
        setAllottedStudents([]);

        if (!yearId) return;

        try {
            const res = await getYearLossAcademicMutation.mutateAsync({ ASMAY_Id: Number(yearId) });
            const data = res?.data || res;
            const courses = data?.courselist || data?.courseList || data?.courses || [];
            if (courses.length > 0) {
                setCourseList(courses);
            } else {
                toast.warning('No courses found');
            }
        } catch {
            toast.error('Failed to load courses');
        }
    };

    // Handle Course Change
    const handleCourseChange = async (courseId: string) => {
        setAmcO_Id(courseId);
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setBranchList([]);
        setSemList([]);
        setAvailableStudents([]);
        setSelectedStudents([]);
        setAllottedStudents([]);

        if (!courseId || !asmaY_Id) return;

        try {
            const res = await getYearLossBranchMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(courseId)
            });
            const data = res?.data || res;
            const branches = data?.coursebranchlist || data?.courseBranchList || data?.branchlist || data?.branches || [];
            if (branches.length > 0) {
                setBranchList(branches);
            } else {
                toast.warning('No branches found');
            }
        } catch {
            toast.error('Failed to load branches');
        }
    };

    // Handle Branch Change
    const handleBranchChange = async (branchId: string) => {
        setAmB_Id(branchId);
        setAmsE_Id('');
        setAcmS_Id('');
        setSemList([]);
        setAvailableStudents([]);
        setSelectedStudents([]);
        setAllottedStudents([]);

        if (!branchId || !asmaY_Id || !amcO_Id) return;

        try {
            const res = await getYearLossSemMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(branchId)
            });
            const data = res?.data || res;
            const sems = data?.semlist || data?.semList || data?.semesters || [];
            if (sems.length > 0) {
                setSemList(sems);
            } else {
                toast.warning('No semesters found');
            }
        } catch {
            toast.error('Failed to load semesters');
        }
    };

    // Handle Semester Change
    const handleSemesterChange = (semId: string) => {
        setAmsE_Id(semId);
        setAcmS_Id('');
        setAvailableStudents([]);
        setSelectedStudents([]);
        setAllottedStudents([]);
    };

    // Handle Section Change -> Load Students for Year Loss
    const handleSectionChange = async (secId: string) => {
        setAcmS_Id(secId);
        setAvailableStudents([]);
        setSelectedStudents([]);

        if (!secId || !asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) return;

        try {
            const res = await getYearLossStudentsMutation.mutateAsync({
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(amB_Id),
                AMSE_Id: Number(amsE_Id),
                ACMS_Id: Number(secId)
            });
            const data = res?.data || res;

            if (data?.studentList4ys?.length > 0) {
                setAvailableStudents(data.studentList4ys);
            } else {
                toast.info('No students found for year loss');
            }

            if (data?.sectionAllotedStudentList4?.length > 0) {
                setAllottedStudents(data.sectionAllotedStudentList4);
            } else {
                setAllottedStudents([]);
            }
        } catch {
            toast.error('Failed to load students');
        }
    };

    // Clear
    const handleClear = () => {
        setAsmaY_Id(yearList[0]?.asmaY_Id?.toString() || '');
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setAcmS_Id('');
        setCourseList([]);
        setBranchList([]);
        setSemList([]);
        setAvailableStudents([]);
        setSelectedStudents([]);
        setAllottedStudents([]);
    };

    // Save Year Loss
    const handleSave = async () => {
        if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id || !acmS_Id) {
            Swal.fire('Validation Error', 'Please select all required fields', 'warning');
            return;
        }

        if (selectedStudents.length === 0) {
            Swal.fire('Notice', 'Kindly add at least one student to update year loss', 'warning');
            return;
        }

        try {
            const payload = {
                SectionAllotmentType: 'YearLoss',
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(amB_Id),
                AMSE_Id: Number(amsE_Id),
                ACMS_Id: Number(acmS_Id),
                resultData1: selectedStudents
            };

            const res = await saveMutation.mutateAsync(payload);
            const data = res?.data || res;
            const isSuccess = res?.success || data?.returnVal || data?.returnval;

            if (isSuccess) {
                Swal.fire('Success', data?.returnMsg || 'Selected Record Year Loss Updated Successfully', 'success');
                handleSectionChange(acmS_Id);
                setSelectedStudents([]);
                refetchAll();
            } else {
                Swal.fire('Error', data?.returnMsg || 'Failed to update year loss', 'error');
            }
        } catch {
            toast.error('Something went wrong. Please contact administrator.');
        }
    };

    return (
        <div className='space-y-6'>
            {/* Filter Section */}
            <CollapsibleSection
                title='Year Loss Section - Parameters'
                icon={<AlertTriangle className='h-5 w-5 text-amber-500' />}
                defaultOpen={true}
                variant='default'
                size='lg'>
                <div className='grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={asmaY_Id} onValueChange={handleYearChange}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>
                            <SelectContent>
                                {yearList.map((y: any, idx: number) => {
                                    const yId = (y.asmaY_Id ?? y.ASMAY_Id ?? y.asmay_Id ?? y.id ?? idx).toString();
                                    const yName = y.asmaY_Year ?? y.ASMAY_Year ?? y.asmay_Year ?? y.yearName ?? yId;
                                    return (
                                        <SelectItem key={yId} value={yId}>
                                            {yName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Course <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amcO_Id} onValueChange={handleCourseChange} disabled={!asmaY_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Course' />
                            </SelectTrigger>
                            <SelectContent>
                                {courseList.map((c: any, idx: number) => {
                                    const cId = (c.amcO_Id ?? c.AMCO_Id ?? c.amco_Id ?? c.id ?? idx).toString();
                                    const cName = c.amcO_CourseName ?? c.AMCO_CourseName ?? c.amco_CourseName ?? c.courseName ?? cId;
                                    return (
                                        <SelectItem key={cId} value={cId}>
                                            {cName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Branch <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amB_Id} onValueChange={handleBranchChange} disabled={!amcO_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Branch' />
                            </SelectTrigger>
                            <SelectContent>
                                {branchList.map((b: any, idx: number) => {
                                    const bId = (b.amB_Id ?? b.AMB_Id ?? b.amb_Id ?? b.id ?? idx).toString();
                                    const bName = b.amB_BranchName ?? b.AMB_BranchName ?? b.amb_BranchName ?? b.branchName ?? bId;
                                    return (
                                        <SelectItem key={bId} value={bId}>
                                            {bName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Semester <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={amsE_Id} onValueChange={handleSemesterChange} disabled={!amB_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Semester' />
                            </SelectTrigger>
                            <SelectContent>
                                {semList.map((s: any, idx: number) => {
                                    const sId = (s.amsE_Id ?? s.AMSE_Id ?? s.amse_Id ?? s.id ?? idx).toString();
                                    const sName = s.amsE_SEMName ?? s.AMSE_SEMName ?? s.amse_SEMName ?? s.semName ?? sId;
                                    return (
                                        <SelectItem key={sId} value={sId}>
                                            {sName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='space-y-2'>
                        <Label className='font-bold text-xs uppercase tracking-wider text-muted-foreground'>
                            Section <span className='text-red-500'>*</span>
                        </Label>
                        <Select value={acmS_Id} onValueChange={handleSectionChange} disabled={!amsE_Id}>
                            <SelectTrigger className='h-10'>
                                <SelectValue placeholder='Select Section' />
                            </SelectTrigger>
                            <SelectContent>
                                {sectionList.map((sec: any, idx: number) => {
                                    const secId = (sec.acmS_Id ?? sec.ACMS_Id ?? sec.acms_Id ?? sec.id ?? idx).toString();
                                    const secName = sec.acmS_SectionName ?? sec.ACMS_SectionName ?? sec.acms_SectionName ?? sec.sectionName ?? secId;
                                    return (
                                        <SelectItem key={secId} value={secId}>
                                            {secName}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Transfer List */}
            <CollapsibleSection
                title='Year Loss Students List'
                defaultOpen={true}
                variant='outline'
                size='lg'>
                <div className='p-6 space-y-6'>
                    <StudentTransferList
                        availableStudents={availableStudents}
                        setAvailableStudents={setAvailableStudents}
                        selectedStudents={selectedStudents}
                        setSelectedStudents={setSelectedStudents}
                        leftTitle='Current Students'
                        rightTitle='Students Marked For Year Loss'
                        showSem={true}
                        showSection={true}
                    />

                    <div className='flex items-center justify-center gap-4 pt-4 border-t border-border/60'>
                        <Button
                            type='button'
                            onClick={handleSave}
                            disabled={saveMutation.isPending || selectedStudents.length === 0}
                            className='shadow-md transition-all hover:scale-105 active:scale-95'>
                            <Save className='mr-2 h-4 w-4' />
                            {saveMutation.isPending ? 'Saving...' : 'Save Year Loss'}
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleClear}
                            className='shadow-sm transition-all hover:scale-105 active:scale-95'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Bottom Table: Allotted Students List */}
            <AllottedStudentsTable
                title='Section Allotted Student List'
                students={allottedStudents}
            />
        </div>
    );
}
