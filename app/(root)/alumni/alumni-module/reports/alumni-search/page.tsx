'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { getAlumniSearchLoadData, performAlumniSearch } from '@/server/alumni/alumni-search';
import type { IAlumniAcademicYear, IAlumniClass, IAlumniSearchResultItem } from '@/types/alumni/alumni-search';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AlumniSearchCriteriaBuilder from './_components/alumni-search-criteria-builder';
import AlumniSearchResults from './_components/alumni-search-results';

export default function AlumniSearchPage() {
    const [years, setYears] = useState<IAlumniAcademicYear[]>([]);
    const [classes, setClasses] = useState<IAlumniClass[]>([]);
    const [results, setResults] = useState<IAlumniSearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getAlumniSearchLoadData();
            if (res.success && res.data) {
                setYears(res.data.yearList || []);
                setClasses(res.data.classList || []);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to load search preferences');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSearch = async (criteria: any[]) => {
        setIsSearching(true);
        try {
            // Transform criteria to match backend expectations (similar to student search)
            const data = {
                output: criteria.map((c) => ({ [c.field]: c.field })),
                output1: criteria.map((c) => ({ [c.field]: c.operator })),
                output2: criteria.map((c) => ({ [c.field]: c.value })),
                output3: criteria.map((c) => ({ [c.field]: c.condition }))
            };

            const res = await performAlumniSearch(data);
            if (res.success && res.data) {
                // Handle response data - check if it's an array directly or inside searchResult
                const rawData = Array.isArray(res.data) ? res.data : res.data.searchResult || [];

                const mappedData: IAlumniSearchResultItem[] = rawData.map((item: any) => ({
                    almst_id: Number.parseInt(item.amst_admno) || Math.floor(Math.random() * 100000), // Fallback ID
                    amsT_FirstName: item.studentname || '',
                    amsT_DOB: item.amst_dob ? new Date(item.amst_dob).toLocaleDateString() : '',
                    amsT_MobileNo: item.amst_mobileno ? item.amst_mobileno.toString() : '',
                    amsT_emailId: item.amst_emailid || '',
                    ASMAY_Id_Join: '', // Not available in response
                    ASMAY_Id_Left: '', // Not available in response
                    ALMST_MembershipId: item.amst_registrationno || '',
                    ALMMC_MembershipCategory: '', // Not available
                    IVRMMD_Name: '', // Not available
                    amsT_BloodGroup: item.amst_bloodgroup || '',
                    ALSPR_Designation: '', // Not available
                    IVRMMS_Name: '', // Not available
                    ALMST_ConCity: '',
                    ALMST_FullAddess: '',
                    ALMST_PerPincode: ''
                }));

                setResults(mappedData);
                if (mappedData.length === 0) {
                    toast.info('No alumni records match your criteria.');
                }
            } else {
                toast.error(res.message || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('An error occurred during search');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setResults([]);
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center bg-background'>
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-10 w-10 animate-spin text-primary' />
                    <p className='animate-pulse text-muted-foreground text-sm'>Initializing research engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto min-h-screen max-w-7xl space-y-8 p-6'>
            <div className='flex flex-col gap-2'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-xl bg-primary/10 p-2.5 text-primary shadow-inner'>
                        <SearchIcon className='h-7 w-7' />
                    </div>
                    <h2 className='bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight'>
                        Alumni Search Report
                    </h2>
                </div>
                <p className='ml-14 text-muted-foreground text-sm'>
                    Dynamic query tool for deep alumni database exploration and reporting.
                </p>
            </div>

            <div className='grid grid-cols-1 gap-8'>
                <CollapsibleSection title='Search Criteria Engine' defaultOpen={true} variant='outline'>
                    <div className='p-2'>
                        <AlumniSearchCriteriaBuilder years={years} classes={classes} onSearch={handleSearch} onClear={handleClear} />
                    </div>
                </CollapsibleSection>

                {(isSearching || results.length > 0) && (
                    <CollapsibleSection title='Reporting & Analytics' defaultOpen={true} variant='outline'>
                        {isSearching ? (
                            <div className='flex flex-col items-center justify-center space-y-6 p-20'>
                                <div className='relative'>
                                    <div className='absolute inset-0 animate-ping rounded-full bg-primary/20' />
                                    <Loader2 className='relative z-10 h-12 w-12 animate-spin text-primary' />
                                </div>
                                <p className='animate-pulse font-medium text-muted-foreground tracking-wide'>
                                    Retrieving matching profiles...
                                </p>
                            </div>
                        ) : (
                            <AlumniSearchResults data={results} />
                        )}
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
