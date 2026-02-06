'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    getAlumniMembershipInitialData,
    getStudentList,
    getAlumniStudentData,
    deactivateAlumnus,
    searchFilter
} from '@/server/alumni/alumni-membership';
import type {
    IYear,
    IClass,
    IMemberCategory,
    ICountry,
    IState,
    IDistrict,
    IAlumnusInitialData,
    IAlumniStudentDetail
} from '@/types/alumni/alumni-membership';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Plus, Search, Pencil, XCircle, Users } from 'lucide-react';
import AlumniForm from './_components/alumni-form';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { AlumniDetailsColumns } from './_components/columns';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import ToggleAlumnusForm from './_components/toggle-form';

export default function AlumnusMembershipPage() {
    const [initialLoading, setInitialLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [years, setYears] = useState<IYear[]>([]);
    const [classes, setClasses] = useState<IClass[]>([]);
    const [categories, setCategories] = useState<IMemberCategory[]>([]);
    const [countries, setCountries] = useState<ICountry[]>([]);
    const [states, setStates] = useState<IState[]>([]);
    const [districts, setDistricts] = useState<IDistrict[]>([]);

    const [selectedYear, setSelectedYear] = useState<string>('');
    const [studentList, setStudentList] = useState<IAlumniStudentDetail[]>([]);
    const [studentListLoading, setStudentListLoading] = useState(false);

    // Alumni list data
    const [alumniList, setAlumniList] = useState<IAlumniStudentDetail[]>([]);

    const fetchInitial = useCallback(async () => {
        setInitialLoading(true);
        const res = await getAlumniMembershipInitialData(30, true);
        if (res.success) {
            const data = Array.isArray((res as any).data) ? (res as any).data[0] : (res as any).data;
            setYears(data.fillyear || []);
            setClasses(data.fillclass || []);
            setCategories(data.membercategory || []);
            setCountries(data.countryDrpDown || []);
            setStates(data.statedropdown || []);
            setDistricts(data.districtdropdown || []);
            setAlumniList(data.alumnilist || data.alumnilistnew || data.studentDetails || []);
            setIsAdmin(!data.alumnitrue);
        } else {
            toast.error(res.message || 'Failed to load initial data');
        }
        setInitialLoading(false);
    }, []);

    useEffect(() => {
        fetchInitial();
    }, [fetchInitial]);

    const handleYearChange = async (yearId: string) => {
        setSelectedYear(yearId);
        if (!yearId) {
            setStudentList([]);
            return;
        }
        setStudentListLoading(true);
        const res = await getStudentList(parseInt(yearId));
        if (res.success) {
            // Handle various backend response structures
            if (Array.isArray(res.data)) {
                setStudentList(res.data);
            } else if (res.data && typeof res.data === 'object') {
                const data = res.data;
                const list = data.fillstudent || data.stu_name || data.studentDetails || [];
                setStudentList(Array.isArray(list) ? list : []);
            } else {
                setStudentList([]);
            }
        } else {
            toast.error(res.message);
        }
        setStudentListLoading(false);
    };

    if (initialLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <FormProvider<IAlumniStudentDetail>>
            <PageContent
                alumniList={alumniList}
                isAdmin={isAdmin}
                years={years}
                classes={classes}
                categories={categories}
                countries={countries}
                states={states}
                districts={districts}
                selectedYear={selectedYear}
                studentList={studentList}
                studentListLoading={studentListLoading}
                handleYearChange={handleYearChange}
                onRefresh={fetchInitial}
            />
        </FormProvider>
    );
}

interface PageContentProps {
    alumniList: IAlumniStudentDetail[];
    isAdmin: boolean;
    years: IYear[];
    classes: IClass[];
    categories: IMemberCategory[];
    countries: ICountry[];
    states: IState[];
    districts: IDistrict[];
    selectedYear: string;
    studentList: IAlumniStudentDetail[];
    studentListLoading: boolean;
    handleYearChange: (yearId: string) => void;
    onRefresh: () => void;
}

function PageContent({
    alumniList,
    isAdmin,
    years,
    classes,
    categories,
    countries,
    states,
    districts,
    selectedYear,
    studentList,
    studentListLoading,
    handleYearChange,
    onRefresh
}: PageContentProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        selectedRow,
        openAddForm,
        openEditForm,
        openToggleForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm
    } = useFormContext<IAlumniStudentDetail>();

    // Column filters
    const [filters, setFilters] = useState({
        name: '',
        fatherName: '',
        mobile: '',
        email: '',
        leftYear: '',
        leftClass: ''
    });

    const handleSelectStudent = async (student: IAlumniStudentDetail) => {
        const res = await getAlumniStudentData({
            ALMST_Id: student.almsT_Id || 0,
            ALSREG_Id: student.alsreG_Id,
            ASMCL_Id_Left: student.asmcL_Id_Left,
            ASMCL_Id_Join: student.asmcL_Id_Join,
            ASMAY_Id_Left: student.asmaY_Id_Left,
            ALMST_ConState: student.almsT_ConState,
            ASMAY_Id_Join: student.asmaY_Id_Join,
            Readmitted_student: student.readmitted_student
        });
        if (res.success) {
            let details = null;
            if (Array.isArray(res.data) && res.data.length > 0) {
                details = res.data[0].studentDetails?.[0];
            } else if (res.data?.studentDetails?.length > 0) {
                details = res.data.studentDetails[0];
            }

            if (details) {
                openEditForm(details);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                toast.error('No details found for this student');
            }
        } else {
            toast.error(res.message || 'Failed to load student details');
        }
    };

    // Filter alumni list based on column filters
    const filteredAlumniList = useMemo(() => {
        return alumniList.filter(item => {
            const name = (item.amsT_FirstName || item.almsT_FirstName || '').toLowerCase();
            const fatherName = (item.almsT_FatherName || '').toLowerCase();
            const mobile = (item.almsT_MobileNo || '').toString();
            const email = (item.almsT_emailId || '').toLowerCase();
            const leftYear = (item.asmaY_Year_Left || item.asmaY_Year || '').toString();
            const leftClass = (item.asmcL_ClassName_Left || item.asmcL_ClassName || '').toLowerCase();

            return (
                name.includes(filters.name.toLowerCase()) &&
                fatherName.includes(filters.fatherName.toLowerCase()) &&
                mobile.includes(filters.mobile) &&
                email.includes(filters.email.toLowerCase()) &&
                leftYear.includes(filters.leftYear) &&
                leftClass.includes(filters.leftClass.toLowerCase())
            );
        });
    }, [alumniList, filters]);

    return (
        <div className="container space-y-4 p-4 min-h-screen">
            {/* Page Header Area */}
            <div className="flex flex-col gap-2 border-b pb-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary uppercase">Alumni Details</h1>
                        <p className="text-sm text-muted-foreground">Manage alumni profile details, qualifications, and achievements</p>
                    </div>
                    {!isEditFormOpen && !isAddFormOpen && (
                        <Button onClick={openAddForm} className="bg-primary shadow-md hover:scale-105 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> New Alumnus
                        </Button>
                    )}
                </div>
            </div>

            {isEditFormOpen || isAddFormOpen ? (
                <div className="slide-in-from-top-4 animate-in duration-300">
                    <CollapsibleSection
                        title={isEditFormOpen ? "Edit Alumnus" : "Add New Alumnus"}
                        defaultOpen={true}
                        variant="outline"
                        className="shadow-lg"
                    >
                        <div className="relative">
                            <Button
                                type="button"
                                onClick={isEditFormOpen ? closeEditForm : closeAddForm}
                                variant="ghost"
                                size="sm"
                                className="absolute -top-12 right-0 border p-2 shadow-sm hover:bg-destructive/10"
                            >
                                <XCircle className="h-4 w-4 mr-1 text-destructive" /> Close
                            </Button>
                            <AlumniForm
                                initialData={isEditFormOpen ? selectedRow : null}
                                years={years}
                                classes={classes}
                                categories={categories}
                                countries={countries}
                                states={states}
                                districts={districts}
                                onCancel={isEditFormOpen ? closeEditForm : closeAddForm}
                                onSuccess={() => {
                                    isEditFormOpen ? closeEditForm() : closeAddForm();
                                    onRefresh();
                                }}
                                isAdmin={isAdmin}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Admin Batch Search */}
                    {isAdmin && (
                        <CollapsibleSection
                            title="Admin Controls - Batch Search"
                            defaultOpen={false}
                            variant="outline"
                            className="border-primary/20"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 p-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground uppercase text-[10px] font-bold">Select Batch (Year)</label>
                                    <select
                                        className="w-full rounded-md border p-2 text-sm bg-background"
                                        value={selectedYear}
                                        onChange={(e) => handleYearChange(e.target.value)}
                                    >
                                        <option value="">--Select Batch--</option>
                                        {years.map(y => (
                                            <option key={y.asmaY_Id} value={y.asmaY_Id}>{y.asmaY_Year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {selectedYear && studentList.length > 0 && (
                                <div className="mt-6 overflow-x-auto border rounded-lg shadow-inner">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-primary/5 text-primary border-b">
                                                <th className="p-3 text-left">Sl. No</th>
                                                <th className="p-3 text-left">Student Name</th>
                                                <th className="p-3 text-left">Admission No</th>
                                                <th className="p-3 text-left">Year</th>
                                                <th className="p-3 text-left">Class</th>
                                                <th className="p-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {studentListLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center">
                                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                                    </td>
                                                </tr>
                                            ) : (
                                                studentList.map((student, idx) => (
                                                    <tr key={idx} className="hover:bg-muted/30 border-b transition-colors">
                                                        <td className="p-3">{idx + 1}</td>
                                                        <td className="p-3 font-medium">
                                                            {student.membername || student.alsreG_MemberName || student.amsT_FirstName || student.almsT_FirstName || '--'}
                                                        </td>
                                                        <td className="p-3">{student.almsT_AdmNo || '--'}</td>
                                                        <td className="p-3">{student.asmaY_Year || student.yeardmitted || '--'}</td>
                                                        <td className="p-3">{student.asmcL_ClassName || student.classnameadmitted || '--'}</td>
                                                        <td className="p-3 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="hover:bg-primary/10 text-primary"
                                                                onClick={() => handleSelectStudent(student)}
                                                            >
                                                                <Search className="h-4 w-4 mr-1" /> View/Edit
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CollapsibleSection>
                    )}

                    {/* Alumni List Section */}
                    <CollapsibleSection
                        title="ALUMNI LIST"
                        defaultOpen={true}
                        variant="default"
                        size="lg"
                        className="shadow-lg transition-shadow duration-300 hover:shadow-xl"
                    >
                        {/* Custom Header Badge */}
                        <div className="absolute right-12 top-4">
                            <Badge variant="secondary" className="bg-primary text-white px-3 py-1 text-xs">
                                Records: {filteredAlumniList.length}
                            </Badge>
                        </div>

                        {/* Filter Section - Simplified and inside the section */}
                        <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-4 lg:grid-cols-7 items-end border-b pb-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Name</label>
                                <Input
                                    placeholder="Name..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.name}
                                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Father</label>
                                <Input
                                    placeholder="Father..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.fatherName}
                                    onChange={(e) => setFilters(prev => ({ ...prev, fatherName: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Mobile</label>
                                <Input
                                    placeholder="Mobile..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.mobile}
                                    onChange={(e) => setFilters(prev => ({ ...prev, mobile: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Email</label>
                                <Input
                                    placeholder="Email..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.email}
                                    onChange={(e) => setFilters(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Year</label>
                                <Input
                                    placeholder="Year..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.leftYear}
                                    onChange={(e) => setFilters(prev => ({ ...prev, leftYear: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-muted-foreground">Class</label>
                                <Input
                                    placeholder="Class..."
                                    className="h-8 text-xs focus-visible:ring-primary/30"
                                    value={filters.leftClass}
                                    onChange={(e) => setFilters(prev => ({ ...prev, leftClass: e.target.value }))}
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-[10px] uppercase font-bold hover:bg-muted"
                                onClick={() => setFilters({
                                    name: '',
                                    fatherName: '',
                                    mobile: '',
                                    email: '',
                                    leftYear: '',
                                    leftClass: ''
                                })}
                            >
                                Clear
                            </Button>
                        </div>

                        <GenericDataTable<IAlumniStudentDetail>
                            columns={AlumniDetailsColumns}
                            data={filteredAlumniList}
                            isLoading={false}
                            totalItems={filteredAlumniList.length}
                            columnPinning={{ right: ['actions'] }}
                        />
                    </CollapsibleSection>
                </div>
            )}

            {/* Dialogs/Toggles */}
            {isToggleFormOpen && selectedRow && (
                <ToggleAlumnusForm
                    rowData={selectedRow}
                    onClose={closeToggleForm}
                    onSuccess={onRefresh}
                />
            )}
        </div>
    );
}
