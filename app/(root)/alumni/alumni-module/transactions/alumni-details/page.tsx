'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getInitialData,
    getStudentList,
    getStudentData,
    deactivateAlumnus,
    approveAlumnusData
} from '@/server/alumni/alumnus-membership';
import type {
    IYear,
    IClass,
    IMemberCategory,
    ICountry,
    IState,
    IDistrict,
    IAlumnusInitialData
} from '@/types/alumni/alumnus-membership';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, UserCheck, UserX, Search } from 'lucide-react';
import AlumnusForm from './_components/alumnus-form';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';

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
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentListLoading, setStudentListLoading] = useState(false);

    const [selectedAlumnus, setSelectedAlumnus] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    const fetchInitial = useCallback(async () => {
        setInitialLoading(true);
        const res = await getInitialData();
        if (res.success && res.data) {
            setYears(res.data.fillyear || []);
            setClasses(res.data.fillclass || []);
            setCategories(res.data.membercategory || []);
            setCountries(res.data.countryDrpDown || []);
            setStates(res.data.statedropdown || []);
            setDistricts(res.data.districtdropdown || []);
            setIsAdmin(!res.data.alumnitrue);

            if (res.data.alumnitrue && res.data.studentDetails?.length > 0) {
                setSelectedAlumnus(res.data.studentDetails[0]);
                setIsEditing(true);
            }
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
            setStudentList(res.data || []);
        } else {
            toast.error(res.message);
        }
        setStudentListLoading(false);
    };

    const handleSelectStudent = async (student: any) => {
        const res = await getStudentData({
            ALMST_Id: student.almsT_Id,
            ASMAY_Id: parseInt(selectedYear),
            AMST_ID: student.amsT_Id
        });
        if (res.success && res.data) {
            setSelectedAlumnus(res.data.studentDetails[0]);
            setIsEditing(true);
            // Scroll to form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            toast.error(res.message || 'Failed to load student details');
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container space-y-8 p-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alumnus Membership</h1>
                    <p className="text-sm text-muted-foreground">Manage profile details, qualifications, and achievements</p>
                </div>
                {isAdmin && !isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        <Plus className="mr-2 h-4 w-4" /> New Alumnus
                    </Button>
                )}
            </div>

            {isEditing ? (
                <AlumnusForm
                    initialData={selectedAlumnus}
                    years={years}
                    classes={classes}
                    categories={categories}
                    countries={countries}
                    states={states}
                    districts={districts}
                    onCancel={() => {
                        setIsEditing(false);
                        setSelectedAlumnus(null);
                    }}
                    onSuccess={() => {
                        setIsEditing(false);
                        setSelectedAlumnus(null);
                        fetchInitial();
                    }}
                    isAdmin={isAdmin}
                />
            ) : (
                <>
                    {isAdmin && (
                        <CollapsibleSection title="Admin Controls - Batch Search" defaultOpen={true}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Batch (Year)</label>
                                    <select
                                        className="w-full rounded-md border p-2"
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

                            {selectedYear && (
                                <div className="mt-8">
                                    <GenericDataTable
                                        data={studentList}
                                        isLoading={studentListLoading}
                                        columns={[
                                            { header: 'Student Name', accessorKey: 'amsT_FirstName' },
                                            { header: 'Admission No', accessorKey: 'almsT_AdmNo' },
                                            { header: 'Join Year', accessorKey: 'asmaY_Year' },
                                            { header: 'Join Class', accessorKey: 'asmcL_ClassName' },
                                            {
                                                header: 'Actions',
                                                id: 'actions',
                                                cell: ({ row }: { row: any }) => (
                                                    <Button variant="ghost" size="sm" onClick={() => handleSelectStudent(row.original)}>
                                                        <Search className="h-4 w-4 mr-2" /> View/Edit
                                                    </Button>
                                                )
                                            }
                                        ]}
                                    />
                                </div>
                            )}
                        </CollapsibleSection>
                    )}
                </>
            )}
        </div>
    );
}
