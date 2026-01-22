'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { approveClgAlumniData, checkStudentAlumni, getClgAlumniApprovalLoadData } from '@/server/alumni/clg-alumni-approval';
import type { IClgAlumniApprovalDetails, IStudentMatchDetails } from '@/types/alumni/clg-alumni-approval';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AlumniList from './_components/alumni-list';
import StudentMatchList from './_components/student-match-list';

export default function ClgAlumniApprovalPage() {
    const [alumniData, setAlumniData] = useState<IClgAlumniApprovalDetails[]>([]);
    const [matchingStudents, setMatchingStudents] = useState<IStudentMatchDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getClgAlumniApprovalLoadData();
            if (res.success && res.data) {
                setAlumniData(res.data.almdetails || []);
            } else {
                toast.error(res.message || 'Failed to load alumni details');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
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
        setMatchingStudents([]); // Clear previous results
        try {
            const res = await checkStudentAlumni(alcsregId);
            if (res.success && res.data) {
                if (res.data.studentDetails && res.data.studentDetails.length > 0) {
                    setMatchingStudents(res.data.studentDetails);
                } else {
                    toast.info('No matching student records found.');
                }
            } else {
                toast.error(res.message || 'Failed to search students');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    const handleApprove = async (alcsregId: number, alcmstId: number) => {
        try {
            const res = await approveClgAlumniData({ ALCSREG_Id: alcsregId, ALCMST_Id: alcmstId });
            if (res.success && res.data) {
                if (res.data.returnval === 'True') {
                    toast.success('Alumni member successfully approved!');
                    setMatchingStudents([]);
                    loadData();
                } else {
                    toast.error('Alumni member not approved.');
                }
            } else {
                toast.error(res.message || 'Failed to approve alumni');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred during approval');
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-primary/10 p-2 text-primary'>
                    <ShieldCheck className='h-6 w-6' />
                </div>
                <h2 className='font-bold text-2xl tracking-tight'>College Alumni Approval</h2>
            </div>

            <CollapsibleSection title='Pending Alumni Verification' defaultOpen={true} variant='default'>
                <AlumniList data={alumniData} onSearch={handleSearch} onCancel={handleCancel} />
            </CollapsibleSection>

            {(isSearching || matchingStudents.length > 0) && (
                <CollapsibleSection title='Student Match Results' defaultOpen={true} variant='outline'>
                    {isSearching ? (
                        <div className='flex flex-col items-center justify-center space-y-4 p-12'>
                            <Loader2 className='h-10 w-10 animate-spin text-primary' />
                            <p className='animate-pulse text-muted-foreground'>Searching for matching student records...</p>
                        </div>
                    ) : (
                        <StudentMatchList data={matchingStudents} onApprove={handleApprove} onCancel={handleCancel} />
                    )}
                </CollapsibleSection>
            )}
        </div>
    );
}
