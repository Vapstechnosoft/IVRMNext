'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IClgAlumniApprovalDetails, IStudentMatchDetails } from '@/types/alumni/clg-alumni-approval';
import { CheckCircle, Clock, Loader2, ShieldCheck, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AlumniList from './_components/alumni-list';
import StudentMatchList from './_components/student-match-list';

// Static alumni approval data
const staticAlumniData: IClgAlumniApprovalDetails[] = [
    {
        alcsreG_Id: 1,
        alcsreG_MemberName: 'John Smith',
        a_year: '2015',
        l_year: '2019',
        admit_course: 'B.Tech Computer Science',
        left_course: 'B.Tech Computer Science',
        admit_branch: 'Computer Science',
        left_branch: 'Computer Science'
    },
    {
        alcsreG_Id: 2,
        alcsreG_MemberName: 'Sarah Johnson',
        a_year: '2016',
        l_year: '2020',
        admit_course: 'B.Tech Electronics',
        left_course: 'B.Tech Electronics',
        admit_branch: 'Electronics & Communication',
        left_branch: 'Electronics & Communication'
    },
    {
        alcsreG_Id: 3,
        alcsreG_MemberName: 'Michael Chen',
        a_year: '2014',
        l_year: '2018',
        admit_course: 'B.Tech Mechanical',
        left_course: 'B.Tech Mechanical',
        admit_branch: 'Mechanical Engineering',
        left_branch: 'Mechanical Engineering'
    },
    {
        alcsreG_Id: 4,
        alcsreG_MemberName: 'Priya Sharma',
        a_year: '2017',
        l_year: '2021',
        admit_course: 'MBA',
        left_course: 'MBA',
        admit_branch: 'Business Administration',
        left_branch: 'Business Administration'
    },
    {
        alcsreG_Id: 5,
        alcsreG_MemberName: 'David Wilson',
        a_year: '2013',
        l_year: '2017',
        admit_course: 'B.Tech Civil',
        left_course: 'B.Tech Civil',
        admit_branch: 'Civil Engineering',
        left_branch: 'Civil Engineering'
    },
    {
        alcsreG_Id: 6,
        alcsreG_MemberName: 'Emma Watson',
        a_year: '2018',
        l_year: '2022',
        admit_course: 'B.Tech Information Technology',
        left_course: 'B.Tech Information Technology',
        admit_branch: 'Information Technology',
        left_branch: 'Information Technology'
    }
];

// Static student match data
const staticStudentMatches: Record<number, IStudentMatchDetails[]> = {
    1: [
        {
            alcmsT_Id: 101,
            alcsreG_Id: 1,
            membername: 'John Smith',
            alcmsT_AdmNo: 'ADM2018015',
            yeardmitted: '2015',
            courseadmitted: 'B.Tech Computer Science',
            branchadmitted: 'Computer Science'
        }
    ],
    2: [
        {
            alcmsT_Id: 102,
            alcsreG_Id: 2,
            membername: 'Sarah Johnson',
            alcmsT_AdmNo: 'ADM2018018',
            yeardmitted: '2016',
            courseadmitted: 'B.Tech Electronics',
            branchadmitted: 'Electronics & Communication'
        }
    ],
    3: [
        {
            alcmsT_Id: 103,
            alcsreG_Id: 3,
            membername: 'Michael Chen',
            alcmsT_AdmNo: 'ADM2014012',
            yeardmitted: '2014',
            courseadmitted: 'B.Tech Mechanical',
            branchadmitted: 'Mechanical Engineering'
        }
    ],
    4: [
        {
            alcmsT_Id: 104,
            alcsreG_Id: 4,
            membername: 'Priya Sharma',
            alcmsT_AdmNo: 'ADM2017020',
            yeardmitted: '2017',
            courseadmitted: 'MBA',
            branchadmitted: 'Business Administration'
        }
    ],
    5: [
        {
            alcmsT_Id: 105,
            alcsreG_Id: 5,
            membername: 'David Wilson',
            alcmsT_AdmNo: 'ADM2013018',
            yeardmitted: '2013',
            courseadmitted: 'B.Tech Civil',
            branchadmitted: 'Civil Engineering'
        }
    ],
    6: [
        {
            alcmsT_Id: 106,
            alcsreG_Id: 6,
            membername: 'Emma Watson',
            alcmsT_AdmNo: 'ADM2018025',
            yeardmitted: '2018',
            courseadmitted: 'B.Tech Information Technology',
            branchadmitted: 'Information Technology'
        }
    ]
};

// Mock API functions
const mockGetClgAlumniApprovalLoadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
        success: true,
        data: {
            almdetails: staticAlumniData
        }
    };
};

const mockCheckStudentAlumni = async (alcsregId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const matches = staticStudentMatches[alcsregId] || [];

    return {
        success: true,
        data: {
            studentDetails: matches
        }
    };
};

const mockApproveClgAlumniData = async ({ ALCSREG_Id, ALCMST_Id }: { ALCSREG_Id: number; ALCMST_Id: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the alumni to remove
    const alumniIndex = staticAlumniData.findIndex((a) => a.alcsreG_Id === ALCSREG_Id);

    if (alumniIndex !== -1) {
        // In real app, this would update database
        console.log(`Approved alumni ${ALCSREG_Id} with student ${ALCMST_Id}`);

        return {
            success: true,
            data: {
                returnval: 'True'
            }
        };
    }

    return {
        success: false,
        data: {
            returnval: 'False'
        }
    };
};

export default function ClgAlumniApprovalPage() {
    const [alumniData, setAlumniData] = useState<IClgAlumniApprovalDetails[]>([]);
    const [matchingStudents, setMatchingStudents] = useState<IStudentMatchDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedAlumniId, setSelectedAlumniId] = useState<number | null>(null);
    const [approvedCount, setApprovedCount] = useState(0);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetClgAlumniApprovalLoadData();
            if (res.success && res.data) {
                setAlumniData(res.data.almdetails || []);
                toast.success(`Loaded ${res.data.almdetails.length} pending alumni approvals`);
            } else {
                toast.error('Failed to load alumni details');
            }
        } catch (error) {
            toast.error('An error occurred while loading data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = async (alcsregId: number) => {
        setIsSearching(true);
        setSelectedAlumniId(alcsregId);
        setMatchingStudents([]); // Clear previous results
        try {
            const res = await mockCheckStudentAlumni(alcsregId);
            if (res.success && res.data) {
                if (res.data.studentDetails && res.data.studentDetails.length > 0) {
                    setMatchingStudents(res.data.studentDetails);
                    toast.success(
                        `Found ${res.data.studentDetails.length} matching student record${res.data.studentDetails.length !== 1 ? 's' : ''}`
                    );
                } else {
                    toast.info('No matching student records found.');
                }
            } else {
                toast.error('Failed to search students');
            }
        } catch (error) {
            toast.error('An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    const handleApprove = async (alcsregId: number, alcmstId: number) => {
        try {
            const res = await mockApproveClgAlumniData({ ALCSREG_Id: alcsregId, ALCMST_Id: alcmstId });
            if (res.success && res.data) {
                if (res.data.returnval === 'True') {
                    toast.success('Alumni member successfully approved!');

                    // Remove approved alumni from list
                    setAlumniData((prev) => prev.filter((a) => a.alcsreG_Id !== alcsregId));
                    setMatchingStudents([]);
                    setSelectedAlumniId(null);
                    setApprovedCount((prev) => prev + 1);

                    // Show success message
                    const alumniName = staticAlumniData.find((a) => a.alcsreG_Id === alcsregId)?.alcsreG_MemberName;
                    toast.success(`${alumniName || 'Alumni'} has been approved successfully!`, {
                        description: 'The alumni record has been verified and approved.'
                    });
                } else {
                    toast.error('Alumni member not approved.');
                }
            } else {
                toast.error('Failed to approve alumni');
            }
        } catch (error) {
            toast.error('An error occurred during approval');
        }
    };

    const handleCancel = () => {
        setMatchingStudents([]);
        setSelectedAlumniId(null);
        toast.info('Operation cancelled');
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='text-muted-foreground'>Loading alumni approval module...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white shadow-lg'>
                        <ShieldCheck className='h-7 w-7' />
                    </div>
                    <div>
                        <h2 className='font-bold text-2xl tracking-tight'>College Alumni Approval</h2>
                        <p className='mt-1 text-muted-foreground text-sm'>Verify and approve alumni registration requests</p>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-center rounded-lg border border-green-200 bg-green-50 p-3'>
                        <div className='flex items-center gap-2'>
                            <CheckCircle className='h-4 w-4 text-green-600' />
                            <span className='font-medium text-green-700 text-xs'>Approved</span>
                        </div>
                        <span className='font-bold text-green-800 text-lg'>{approvedCount}</span>
                    </div>
                    <div className='flex flex-col items-center rounded-lg border border-blue-200 bg-blue-50 p-3'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 text-blue-600' />
                            <span className='font-medium text-blue-700 text-xs'>Pending</span>
                        </div>
                        <span className='font-bold text-blue-800 text-lg'>{alumniData.length}</span>
                    </div>
                </div>
            </div>

            <div className='rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-1'>
                <CollapsibleSection title='Pending Alumni Verification' defaultOpen={true} variant='default'>
                    <div className='p-4'>
                        <div className='mb-6 rounded-lg border bg-white p-4 shadow-sm'>
                            <div className='flex items-center gap-3'>
                                <Users className='h-5 w-5 text-blue-600' />
                                <div>
                                    <h3 className='font-bold text-blue-800'>Verification Process</h3>
                                    <p className='text-blue-700 text-sm'>
                                        1. Select an alumni request • 2. Search for matching student records • 3. Verify and approve
                                    </p>
                                </div>
                            </div>
                        </div>
                        <AlumniList data={alumniData} onSearch={handleSearch} onCancel={handleCancel} />
                    </div>
                </CollapsibleSection>
            </div>

            {(isSearching || matchingStudents.length > 0) && (
                <CollapsibleSection title='Student Match Results' defaultOpen={true} variant='outline'>
                    <div className='p-4'>
                        {isSearching ? (
                            <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                                <div className='relative'>
                                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                                    {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                    <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 blur-xl'></div>
                                </div>
                                <div className='text-center'>
                                    <p className='mb-2 font-medium text-gray-700'>Searching Database</p>
                                    <p className='text-muted-foreground text-sm'>Looking for matching student records...</p>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4'>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            <h3 className='font-bold text-green-800'>Verification Match Found</h3>
                                            <p className='text-green-700 text-sm'>Select the correct match and confirm approval</p>
                                        </div>
                                        <div className='rounded-full bg-green-100 px-3 py-1 text-green-800 text-xs'>
                                            {matchingStudents.length} match{matchingStudents.length !== 1 ? 'es' : ''} found
                                        </div>
                                    </div>
                                </div>
                                <StudentMatchList data={matchingStudents} onApprove={handleApprove} onCancel={handleCancel} />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* Information Panel */}
            <div className='rounded-xl border bg-gradient-to-r from-gray-50 to-white p-6'>
                <h3 className='mb-4 flex items-center gap-2 font-bold text-gray-800 text-lg'>
                    <ShieldCheck className='h-5 w-5' />
                    Approval Guidelines
                </h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <div className='mb-2 flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-100'>
                                <span className='font-bold text-blue-600'>1</span>
                            </div>
                            <h4 className='font-bold text-blue-700'>Verify Identity</h4>
                        </div>
                        <p className='text-gray-600 text-sm'>Check name, admission year, and course details match the student records.</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <div className='mb-2 flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-green-100'>
                                <span className='font-bold text-green-600'>2</span>
                            </div>
                            <h4 className='font-bold text-green-700'>Match Records</h4>
                        </div>
                        <p className='text-gray-600 text-sm'>
                            Ensure the alumni profile matches an existing student record in the database.
                        </p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <div className='mb-2 flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-100'>
                                <span className='font-bold text-purple-600'>3</span>
                            </div>
                            <h4 className='font-bold text-purple-700'>Confirm Approval</h4>
                        </div>
                        <p className='text-gray-600 text-sm'>Once verified, approve the alumni request to grant full access.</p>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className='flex items-center justify-between border-t pt-4 text-muted-foreground text-sm'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                        <span>Approved: {approvedCount}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div className='h-2 w-2 rounded-full bg-blue-500'></div>
                        <span>Pending: {alumniData.length}</span>
                    </div>
                </div>
                <div className='rounded-full bg-muted px-3 py-1 text-xs'>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
        </div>
    );
}
