'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IAlumniAcademicYear, IAlumniClass, IAlumniSearchResultItem } from '@/types/alumni/alumni-search';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AlumniSearchCriteriaBuilder from './_components/alumni-search-criteria-builder';
import AlumniSearchResults from './_components/alumni-search-results';

// Static data for academic years
const staticYears: IAlumniAcademicYear[] = [
    { asmaY_Id: 1, asmaY_Year: '2024-2025' },
    { asmaY_Id: 2, asmaY_Year: '2023-2024' },
    { asmaY_Id: 3, asmaY_Year: '2022-2023' },
    { asmaY_Id: 4, asmaY_Year: '2021-2022' },
    { asmaY_Id: 5, asmaY_Year: '2020-2021' },
    { asmaY_Id: 6, asmaY_Year: '2019-2020' },
    { asmaY_Id: 7, asmaY_Year: '2018-2019' },
    { asmaY_Id: 8, asmaY_Year: '2017-2018' },
    { asmaY_Id: 9, asmaY_Year: '2016-2017' },
    { asmaY_Id: 10, asmaY_Year: '2015-2016' }
];

// Static data for classes
const staticClasses: IAlumniClass[] = [
    { asmcL_Id: 1, asmcL_ClassName: 'Class 1' },
    { asmcL_Id: 2, asmcL_ClassName: 'Class 2' },
    { asmcL_Id: 3, asmcL_ClassName: 'Class 3' },
    { asmcL_Id: 4, asmcL_ClassName: 'Class 4' },
    { asmcL_Id: 5, asmcL_ClassName: 'Class 5' },
    { asmcL_Id: 6, asmcL_ClassName: 'Class 6' },
    { asmcL_Id: 7, asmcL_ClassName: 'Class 7' },
    { asmcL_Id: 8, asmcL_ClassName: 'Class 8' },
    { asmcL_Id: 9, asmcL_ClassName: 'Class 9' },
    { asmcL_Id: 10, asmcL_ClassName: 'Class 10' },
    { asmcL_Id: 11, asmcL_ClassName: 'Class 11' },
    { asmcL_Id: 12, asmcL_ClassName: 'Class 12' }
];

// Static search results
const staticSearchResults: IAlumniSearchResultItem[] = [
    {
        almst_id: 1,
        amsT_FirstName: 'John Smith',
        amsT_DOB: '1995-05-15',
        amsT_MobileNo: '+91 9876543210',
        amsT_emailId: 'john.smith@example.com',
        ASMAY_Id_Join: '2010-2011',
        ASMAY_Id_Left: '2020-2021',
        ALMST_MembershipId: 'ALM2024001',
        ALMMC_MembershipCategory: 'Gold Member',
        IVRMMD_Name: 'Bangalore',
        amsT_BloodGroup: 'O+',
        ALSPR_Designation: 'Software Engineer',
        IVRMMS_Name: 'Karnataka',
        ALMST_ConCity: 'Bangalore',
        ALMST_FullAddess: '123 MG Road, Bangalore, Karnataka',
        ALMST_PerPincode: '560001',
        ASMAY_Id_NEW_Left: '2021',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 5,
        ALMST_District: 'Bangalore Urban'
    },
    {
        almst_id: 2,
        amsT_FirstName: 'Sarah Johnson',
        amsT_DOB: '1996-07-22',
        amsT_MobileNo: '+91 8765432109',
        amsT_emailId: 'sarah.j@example.com',
        ASMAY_Id_Join: '2011-2012',
        ASMAY_Id_Left: '2021-2022',
        ALMST_MembershipId: 'ALM2024002',
        ALMMC_MembershipCategory: 'Silver Member',
        IVRMMD_Name: 'Chennai',
        amsT_BloodGroup: 'A+',
        ALSPR_Designation: 'Doctor',
        IVRMMS_Name: 'Tamil Nadu',
        ALMST_ConCity: 'Chennai',
        ALMST_FullAddess: '45 Marina Beach Road, Chennai, Tamil Nadu',
        ALMST_PerPincode: '600001',
        ASMAY_Id_NEW_Left: '2022',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 6,
        ALMST_District: 'Chennai'
    },
    {
        almst_id: 3,
        amsT_FirstName: 'Michael Chen',
        amsT_DOB: '1994-11-30',
        amsT_MobileNo: '+91 7654321098',
        amsT_emailId: 'michael.chen@example.com',
        ASMAY_Id_Join: '2009-2010',
        ASMAY_Id_Left: '2019-2020',
        ALMST_MembershipId: 'ALM2023001',
        ALMMC_MembershipCategory: 'Platinum Member',
        IVRMMD_Name: 'Mumbai',
        amsT_BloodGroup: 'B+',
        ALSPR_Designation: 'Business Consultant',
        IVRMMS_Name: 'Maharashtra',
        ALMST_ConCity: 'Mumbai',
        ALMST_FullAddess: '78 Bandra West, Mumbai, Maharashtra',
        ALMST_PerPincode: '400050',
        ASMAY_Id_NEW_Left: '2020',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 4,
        ALMST_District: 'Mumbai Suburban'
    },
    {
        almst_id: 4,
        amsT_FirstName: 'Priya Sharma',
        amsT_DOB: '1993-04-18',
        amsT_MobileNo: '+91 6543210987',
        amsT_emailId: 'priya.sharma@example.com',
        ASMAY_Id_Join: '2008-2009',
        ASMAY_Id_Left: '2018-2019',
        ALMST_MembershipId: 'ALM2023002',
        ALMMC_MembershipCategory: 'Gold Member',
        IVRMMD_Name: 'Delhi',
        amsT_BloodGroup: 'AB+',
        ALSPR_Designation: 'Architect',
        IVRMMS_Name: 'Delhi',
        ALMST_ConCity: 'New Delhi',
        ALMST_FullAddess: '12 Connaught Place, New Delhi',
        ALMST_PerPincode: '110001',
        ASMAY_Id_NEW_Left: '2019',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 7,
        ALMST_District: 'New Delhi'
    },
    {
        almst_id: 5,
        amsT_FirstName: 'David Wilson',
        amsT_DOB: '1997-09-10',
        amsT_MobileNo: '+91 5432109876',
        amsT_emailId: 'david.wilson@example.com',
        ASMAY_Id_Join: '2012-2013',
        ASMAY_Id_Left: '2022-2023',
        ALMST_MembershipId: 'ALM2024003',
        ALMMC_MembershipCategory: 'Bronze Member',
        IVRMMD_Name: 'Hyderabad',
        amsT_BloodGroup: 'O-',
        ALSPR_Designation: 'Teacher',
        IVRMMS_Name: 'Telangana',
        ALMST_ConCity: 'Hyderabad',
        ALMST_FullAddess: '34 Banjara Hills, Hyderabad, Telangana',
        ALMST_PerPincode: '500034',
        ASMAY_Id_NEW_Left: '2023',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 8,
        ALMST_District: 'Hyderabad'
    },
    {
        almst_id: 6,
        amsT_FirstName: 'Emma Watson',
        amsT_DOB: '1998-02-28',
        amsT_MobileNo: '+91 4321098765',
        amsT_emailId: 'emma.watson@example.com',
        ASMAY_Id_Join: '2013-2014',
        ASMAY_Id_Left: '2023-2024',
        ALMST_MembershipId: 'ALM2024004',
        ALMMC_MembershipCategory: 'Silver Member',
        IVRMMD_Name: 'Kolkata',
        amsT_BloodGroup: 'A-',
        ALSPR_Designation: 'Journalist',
        IVRMMS_Name: 'West Bengal',
        ALMST_ConCity: 'Kolkata',
        ALMST_FullAddess: '56 Park Street, Kolkata, West Bengal',
        ALMST_PerPincode: '700016',
        ASMAY_Id_NEW_Left: '2024',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 9,
        ALMST_District: 'Kolkata'
    },
    {
        almst_id: 7,
        amsT_FirstName: 'Rahul Kumar',
        amsT_DOB: '1992-08-12',
        amsT_MobileNo: '+91 3210987654',
        amsT_emailId: 'rahul.kumar@example.com',
        ASMAY_Id_Join: '2007-2008',
        ASMAY_Id_Left: '2017-2018',
        ALMST_MembershipId: 'ALM2022001',
        ALMMC_MembershipCategory: 'Platinum Member',
        IVRMMD_Name: 'Pune',
        amsT_BloodGroup: 'B-',
        ALSPR_Designation: 'Research Scientist',
        IVRMMS_Name: 'Maharashtra',
        ALMST_ConCity: 'Pune',
        ALMST_FullAddess: '23 Koregaon Park, Pune, Maharashtra',
        ALMST_PerPincode: '411001',
        ASMAY_Id_NEW_Left: '2018',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 10,
        ALMST_District: 'Pune'
    },
    {
        almst_id: 8,
        amsT_FirstName: 'Ananya Patel',
        amsT_DOB: '1999-12-05',
        amsT_MobileNo: '+91 2109876543',
        amsT_emailId: 'ananya.patel@example.com',
        ASMAY_Id_Join: '2014-2015',
        ASMAY_Id_Left: '2024-2025',
        ALMST_MembershipId: 'ALM2025001',
        ALMMC_MembershipCategory: 'Gold Member',
        IVRMMD_Name: 'Ahmedabad',
        amsT_BloodGroup: 'AB-',
        ALSPR_Designation: 'Lawyer',
        IVRMMS_Name: 'Gujarat',
        ALMST_ConCity: 'Ahmedabad',
        ALMST_FullAddess: '89 CG Road, Ahmedabad, Gujarat',
        ALMST_PerPincode: '380009',
        ASMAY_Id_NEW_Left: '2025',
        Leftclass: 'Class 12',
        ASMCL_Id_Join: 11,
        ALMST_District: 'Ahmedabad'
    }
];

// Mock API functions
const mockGetAlumniSearchLoadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        data: {
            yearList: staticYears,
            classList: staticClasses
        }
    };
};

const mockPerformAlumniSearch = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    let filteredResults = [...staticSearchResults];

    // Apply search criteria (simplified logic)
    const criteria = data.output || [];
    if (criteria.length > 0) {
        criteria.forEach((criterion: any, index: number) => {
            const field = Object.values(criterion)[0];
            const operator = Object.values(data.output1?.[index] || {})[0];
            const value = Object.values(data.output2?.[index] || {})[0];

            if (field && operator && value) {
                const searchValue = value.toString().toLowerCase();
                filteredResults = filteredResults.filter((item) => {
                    const itemValue = (item as any).toString().toLowerCase() || '';

                    switch (operator) {
                        case '=':
                            return itemValue === searchValue;
                        case '!=':
                            return itemValue !== searchValue;
                        case 'like':
                            return itemValue.includes(searchValue);
                        default:
                            return true;
                    }
                });
            }
        });
    }

    return {
        success: true,
        data: {
            searchResult: filteredResults,
            count: filteredResults.length
        }
    };
};

export default function AlumniSearchPage() {
    const [years, setYears] = useState<IAlumniAcademicYear[]>([]);
    const [classes, setClasses] = useState<IAlumniClass[]>([]);
    const [results, setResults] = useState<IAlumniSearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetAlumniSearchLoadData();
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
            // Transform criteria to match backend expectations
            const data = {
                output: criteria.map((c) => ({ [c.field]: c.field })),
                output1: criteria.map((c) => ({ [c.field]: c.operator })),
                output2: criteria.map((c) => ({ [c.field]: c.value })),
                output3: criteria.map((c) => ({ [c.field]: c.condition }))
            };

            const res = await mockPerformAlumniSearch(data);
            if (res.success && res.data) {
                setResults(res.data.searchResult || []);
                if ((res.data.searchResult || []).length === 0) {
                    toast.info('No alumni records match your criteria.');
                } else {
                    toast.success(`Found ${res.data.searchResult.length} matching records`);
                }
            } else {
                toast.error('Search failed');
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('An error occurred during search');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setResults([]);
        toast.info('Search results cleared');
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
