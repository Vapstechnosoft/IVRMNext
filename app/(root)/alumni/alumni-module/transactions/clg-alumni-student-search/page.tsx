'use client';

import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {
    IAcademicYear,
    IAlumniSearchCriteriaRow,
    IAlumniSearchResult,
    IBranch,
    ICourse,
    ISemester
} from '@/types/alumni/clg-alumni-student-search';
import { format } from 'date-fns';
import { Building, GraduationCap, Layers, Search as SearchIcon, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import SearchCriteriaBuilder from './_components/search-criteria-builder';
import SearchResultsTable from './_components/search-results-table';

// Static academic years
const staticYears: IAcademicYear[] = [
    { asmaY_Id: 1, asmaY_Year: '2024-2025' },
    { asmaY_Id: 2, asmaY_Year: '2023-2024' },
    { asmaY_Id: 3, asmaY_Year: '2022-2023' },
    { asmaY_Id: 4, asmaY_Year: '2021-2022' },
    { asmaY_Id: 5, asmaY_Year: '2020-2021' },
    { asmaY_Id: 6, asmaY_Year: '2019-2020' }
];

// Static courses
const staticCourses: Record<number, ICourse[]> = {
    1: [
        // 2024-2025
        { amcO_Id: 101, courseName: 'B.Tech Computer Science' },
        { amcO_Id: 102, courseName: 'B.Tech Electronics' },
        { amcO_Id: 103, courseName: 'B.Tech Mechanical' },
        { amcO_Id: 104, courseName: 'MBA' }
    ],
    2: [
        // 2023-2024
        { amcO_Id: 201, courseName: 'B.Tech Computer Science' },
        { amcO_Id: 202, courseName: 'B.Tech Electronics' },
        { amcO_Id: 203, courseName: 'B.Tech Civil' },
        { amcO_Id: 204, courseName: 'MCA' }
    ]
};

// Static branches
const staticBranches: Record<number, IBranch[]> = {
    101: [
        // B.Tech Computer Science
        { amB_Id: 1011, branchName: 'Computer Science', acaycB_Id: 1 },
        { amB_Id: 1012, branchName: 'Artificial Intelligence', acaycB_Id: 2 },
        { amB_Id: 1013, branchName: 'Data Science', acaycB_Id: 3 }
    ],
    102: [
        // B.Tech Electronics
        { amB_Id: 1021, branchName: 'Electronics & Communication', acaycB_Id: 4 },
        { amB_Id: 1022, branchName: 'Electrical Engineering', acaycB_Id: 5 }
    ],
    103: [
        // B.Tech Mechanical
        { amB_Id: 1031, branchName: 'Mechanical Engineering', acaycB_Id: 6 },
        { amB_Id: 1032, branchName: 'Automobile Engineering', acaycB_Id: 7 }
    ]
};

// Static semesters
const staticSemesters: Record<number, ISemester[]> = {
    1011: [
        // Computer Science
        { amsE_Id: 1, semesterName: 'Semester 1' },
        { amsE_Id: 2, semesterName: 'Semester 2' },
        { amsE_Id: 3, semesterName: 'Semester 3' },
        { amsE_Id: 4, semesterName: 'Semester 4' },
        { amsE_Id: 5, semesterName: 'Semester 5' },
        { amsE_Id: 6, semesterName: 'Semester 6' },
        { amsE_Id: 7, semesterName: 'Semester 7' },
        { amsE_Id: 8, semesterName: 'Semester 8' }
    ],
    1021: [
        // Electronics & Communication
        { amsE_Id: 9, semesterName: 'Semester 1' },
        { amsE_Id: 10, semesterName: 'Semester 2' },
        { amsE_Id: 11, semesterName: 'Semester 3' },
        { amsE_Id: 12, semesterName: 'Semester 4' }
    ]
};

// Static search results
const staticSearchResults: IAlumniSearchResult[] = [
    {
        ALCMST_Id: 1,
        ALCMST_FirstName: 'John',
        ALCMST_MiddleName: 'M',
        ALCMST_LastName: 'Smith',
        ALCMST_AdmNo: 'ADM2024001',
        AMCO_CourseName: 'B.Tech Computer Science',
        AMB_BranchName: 'Computer Science',
        AMSE_SEMName: 'Semester 6',
        ALCMST_DOB: '2002-05-15T00:00:00.000Z',
        ALCMST_Sex: 'Male',
        ALCMST_MotherName: 'Mary Smith',
        ALCMST_FatherName: 'Robert Smith',
        ALCMST_emailId: 'john.smith@example.com',
        ALCMST_MobileNo: '+91 9876543210',
        ALCMST_BloodGroup: 'O+'
    },
    {
        ALCMST_Id: 2,
        ALCMST_FirstName: 'Sarah',
        ALCMST_MiddleName: '',
        ALCMST_LastName: 'Johnson',
        ALCMST_AdmNo: 'ADM2024002',
        AMCO_CourseName: 'B.Tech Electronics',
        AMB_BranchName: 'Electronics & Communication',
        AMSE_SEMName: 'Semester 4',
        ALCMST_DOB: '2003-07-22T00:00:00.000Z',
        ALCMST_Sex: 'Female',
        ALCMST_MotherName: 'Lisa Johnson',
        ALCMST_FatherName: 'David Johnson',
        ALCMST_emailId: 'sarah.j@example.com',
        ALCMST_MobileNo: '+91 8765432109',
        ALCMST_BloodGroup: 'A+'
    },
    {
        ALCMST_Id: 3,
        ALCMST_FirstName: 'Michael',
        ALCMST_MiddleName: 'K',
        ALCMST_LastName: 'Chen',
        ALCMST_AdmNo: 'ADM2023001',
        AMCO_CourseName: 'B.Tech Computer Science',
        AMB_BranchName: 'Artificial Intelligence',
        AMSE_SEMName: 'Semester 8',
        ALCMST_DOB: '2001-11-30T00:00:00.000Z',
        ALCMST_Sex: 'Male',
        ALCMST_MotherName: 'Mei Chen',
        ALCMST_FatherName: 'James Chen',
        ALCMST_emailId: 'michael.chen@example.com',
        ALCMST_MobileNo: '+91 7654321098',
        ALCMST_BloodGroup: 'B+'
    },
    {
        ALCMST_Id: 4,
        ALCMST_FirstName: 'Priya',
        ALCMST_MiddleName: '',
        ALCMST_LastName: 'Sharma',
        ALCMST_AdmNo: 'ADM2023002',
        AMCO_CourseName: 'MBA',
        AMB_BranchName: 'Business Administration',
        AMSE_SEMName: 'Semester 2',
        ALCMST_DOB: '2000-04-18T00:00:00.000Z',
        ALCMST_Sex: 'Female',
        ALCMST_MotherName: 'Sunita Sharma',
        ALCMST_FatherName: 'Ramesh Sharma',
        ALCMST_emailId: 'priya.sharma@example.com',
        ALCMST_MobileNo: '+91 6543210987',
        ALCMST_BloodGroup: 'AB+'
    },
    {
        ALCMST_Id: 5,
        ALCMST_FirstName: 'David',
        ALCMST_MiddleName: 'P',
        ALCMST_LastName: 'Wilson',
        ALCMST_AdmNo: 'ADM2022001',
        AMCO_CourseName: 'B.Tech Mechanical',
        AMB_BranchName: 'Mechanical Engineering',
        AMSE_SEMName: 'Semester 8',
        ALCMST_DOB: '2000-09-10T00:00:00.000Z',
        ALCMST_Sex: 'Male',
        ALCMST_MotherName: 'Susan Wilson',
        ALCMST_FatherName: 'Thomas Wilson',
        ALCMST_emailId: 'david.wilson@example.com',
        ALCMST_MobileNo: '+91 5432109876',
        ALCMST_BloodGroup: 'O-'
    },
    {
        ALCMST_Id: 6,
        ALCMST_FirstName: 'Emma',
        ALCMST_MiddleName: 'L',
        ALCMST_LastName: 'Watson',
        ALCMST_AdmNo: 'ADM2024003',
        AMCO_CourseName: 'B.Tech Computer Science',
        AMB_BranchName: 'Data Science',
        AMSE_SEMName: 'Semester 4',
        ALCMST_DOB: '2003-02-28T00:00:00.000Z',
        ALCMST_Sex: 'Female',
        ALCMST_MotherName: 'Rachel Watson',
        ALCMST_FatherName: 'Richard Watson',
        ALCMST_emailId: 'emma.watson@example.com',
        ALCMST_MobileNo: '+91 4321098765',
        ALCMST_BloodGroup: 'A-'
    }
];

// Mock API functions
const mockGetClgAlumniSearchLoadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        data: {
            fillyear: staticYears
        }
    };
};

const mockGetCoursesByYear = async (yearId: number) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        success: true,
        data: {
            courses: staticCourses[yearId] || []
        }
    };
};

const mockGetBranchesByCourse = async ({ AMCO_Id }: { AMCO_Id: number; ASMAY_Id: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        success: true,
        data: {
            branches: staticBranches[AMCO_Id] || []
        }
    };
};

const mockGetSemestersByBranch = async ({ AMB_Id }: { AMB_Id: number; ASMAY_Id: number; ACAYCB_Id: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
        success: true,
        data: {
            semesters: staticSemesters[AMB_Id] || []
        }
    };
};

const mockSearchClgAlumniStudents = async (data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter results based on criteria (simplified for demo)
    let filteredResults = [...staticSearchResults];

    // Filter by year (simplified logic)
    if (data.ASMAY_Id === 1) {
        // 2024-2025
        filteredResults = filteredResults.filter(
            (r) => r.ALCMST_AdmNo.includes('2024') || r.AMSE_SEMName === 'Semester 4' || r.AMSE_SEMName === 'Semester 6'
        );
    } else if (data.ASMAY_Id === 2) {
        // 2023-2024
        filteredResults = filteredResults.filter(
            (r) => r.ALCMST_AdmNo.includes('2023') || r.AMSE_SEMName === 'Semester 8' || r.AMSE_SEMName === 'Semester 2'
        );
    }

    // Filter by course
    if (data.AMCO_Id === 101) {
        // B.Tech Computer Science
        filteredResults = filteredResults.filter((r) => r.AMCO_CourseName === 'B.Tech Computer Science');
    } else if (data.AMCO_Id === 102) {
        // B.Tech Electronics
        filteredResults = filteredResults.filter((r) => r.AMCO_CourseName === 'B.Tech Electronics');
    }

    // Apply additional criteria from search builder
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
                        case '>':
                            return Number.parseFloat(itemValue) > Number.parseFloat(searchValue);
                        case '<':
                            return Number.parseFloat(itemValue) < Number.parseFloat(searchValue);
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

export default function ClgAlumniStudentSearchPage() {
    // Dropdown Data
    const [years, setYears] = useState<IAcademicYear[]>([]);
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [branches, setBranches] = useState<IBranch[]>([]);
    const [semesters, setSemesters] = useState<ISemester[]>([]);

    // Selected Values
    const [asmaY_Id, setAsmaY_Id] = useState<string>('');
    const [amcO_Id, setAmcO_Id] = useState<string>('');
    const [amB_Id, setAmB_Id] = useState<string>('');
    const [amsE_Id, setAmsE_Id] = useState<string>('');

    // Results and UI State
    const [results, setResults] = useState<IAlumniSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchStats, setSearchStats] = useState({ totalSearches: 0, lastSearchTime: '' });

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetClgAlumniSearchLoadData();
            if (res.success && res.data) {
                setYears(res.data.fillyear || []);
                toast.success(`Loaded ${res.data.fillyear.length} academic years`);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to load search page data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleYearChange = async (val: string) => {
        setAsmaY_Id(val);
        setAmcO_Id('');
        setAmB_Id('');
        setAmsE_Id('');
        setCourses([]);
        setBranches([]);
        setSemesters([]);
        setResults([]);
        try {
            const res = await mockGetCoursesByYear(Number(val));
            if (res.success && res.data) {
                setCourses(res.data.courses || []);
                toast.info(`Loaded ${res.data.courses.length} courses for selected year`);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to fetch courses');
        }
    };

    const handleCourseChange = async (val: string) => {
        setAmcO_Id(val);
        setAmB_Id('');
        setAmsE_Id('');
        setBranches([]);
        setSemesters([]);
        setResults([]);
        try {
            const res = await mockGetBranchesByCourse({ AMCO_Id: Number(val), ASMAY_Id: Number(asmaY_Id) });
            if (res.success && res.data) {
                setBranches(res.data.branches || []);
                toast.info(`Loaded ${res.data.branches.length} branches`);
            }
            // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        } catch (error) {
            toast.error('Failed to fetch branches');
        }
    };

    const handleBranchChange = async (val: string) => {
        setAmB_Id(val);
        setAmsE_Id('');
        setSemesters([]);
        setResults([]);
        const branchItem = branches.find((b) => b.amB_Id === Number(val));
        if (branchItem) {
            try {
                const res = await mockGetSemestersByBranch({
                    AMB_Id: Number(val),
                    ASMAY_Id: Number(asmaY_Id),
                    ACAYCB_Id: branchItem.acaycB_Id || 0
                });
                if (res.success && res.data) {
                    setSemesters(res.data.semesters || []);
                    toast.info(`Loaded ${res.data.semesters.length} semesters`);
                }
                // biome-ignore lint/correctness/noUnusedVariables: <explanation>
            } catch (error) {
                toast.error('Failed to fetch semesters');
            }
        }
    };

    const handleSearch = async (criteria: IAlumniSearchCriteriaRow[]) => {
        if (!asmaY_Id || !amcO_Id || !amB_Id || !amsE_Id) {
            toast.warning('Please select Year, Course, Branch, and Semester first.');
            return;
        }

        if (criteria.length === 0 || criteria.some((c) => !c.field || !c.operator || !c.value)) {
            toast.warning('Please provide complete search criteria.');
            return;
        }

        setIsSearching(true);
        try {
            const data = {
                output: criteria.map((c) => ({ [c.field]: c.field })),
                output1: criteria.map((c) => ({ [c.field]: c.operator })),
                output2: criteria.map((c) => ({ [c.field]: c.value })),
                output3: criteria.map((c) => ({ [c.field]: c.condition || 'AND' })),
                ASMAY_Id: Number(asmaY_Id),
                AMCO_Id: Number(amcO_Id),
                AMB_Id: Number(amB_Id),
                AMSE_Id: Number(amsE_Id)
            };

            const res = await mockSearchClgAlumniStudents(data);
            if (res.success && res.data) {
                setResults(res.data.searchResult || []);
                setSearchStats((prev) => ({
                    totalSearches: prev.totalSearches + 1,
                    lastSearchTime: new Date().toLocaleTimeString()
                }));

                if (res.data.searchResult.length === 0) {
                    toast.info('No records match your search criteria.');
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

    const handleExportToExcel = (selectedData: IAlumniSearchResult[]) => {
        const worksheet = XLSX.utils.json_to_sheet(
            selectedData.map((item, index) => ({
                SLNO: index + 1,
                'Student Name': `${item.ALCMST_FirstName} ${item.ALCMST_MiddleName || ''} ${item.ALCMST_LastName}`,
                'Admission No': item.ALCMST_AdmNo,
                Course: item.AMCO_CourseName,
                Branch: item.AMB_BranchName,
                Semester: item.AMSE_SEMName,
                'Date of Birth': item.ALCMST_DOB ? format(new Date(item.ALCMST_DOB), 'dd-MM-yyyy') : 'N/A',
                Gender: item.ALCMST_Sex,
                'Mother Name': item.ALCMST_MotherName,
                'Father Name': item.ALCMST_FatherName,
                Email: item.ALCMST_emailId,
                'Mobile No': item.ALCMST_MobileNo,
                'Blood Group': item.ALCMST_BloodGroup
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Alumni Search Results');

        // Add header styling (simulated)
        const headerRow = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z1');
        for (let C = headerRow.s.c; C <= headerRow.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[cell_address]) continue;
            worksheet[cell_address].s = {
                fill: { fgColor: { rgb: 'FF4F46E5' } },
                font: { color: { rgb: 'FFFFFFFF' }, bold: true },
                alignment: { horizontal: 'center' }
            };
        }

        XLSX.writeFile(workbook, `Alumni_Search_Results_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
        toast.success(`Exported ${selectedData.length} records to Excel`);
    };

    const handleClear = () => {
        setResults([]);
        toast.info('Search results cleared');
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/10'>
                <div className='flex flex-col items-center gap-6'>
                    <div className='relative'>
                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                        <div className='h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary'></div>
                        <SearchIcon className='absolute inset-0 m-auto h-8 w-8 animate-pulse text-primary' />
                    </div>
                    <div className='space-y-2 text-center'>
                        <p className='font-medium text-foreground'>Loading Search Module</p>
                        <p className='text-muted-foreground text-sm'>Preparing database connections...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container mx-auto min-h-screen max-w-7xl space-y-8 p-6'>
            {/* Header */}
            <div className='flex flex-col gap-4'>
                <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                    <div className='flex items-center gap-4'>
                        <div className='rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white shadow-xl'>
                            <SearchIcon className='h-8 w-8' />
                        </div>
                        <div>
                            <h2 className='bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-3xl text-transparent tracking-tight'>
                                Alumni Student Search
                            </h2>
                            <p className='mt-1 text-muted-foreground text-sm'>
                                Advanced search tool for alumni database with multi-criteria filtering
                            </p>
                        </div>
                    </div>

                    <div className='flex items-center gap-3'>
                        <div className='rounded-xl border border-blue-200 bg-blue-50 p-3'>
                            <div className='flex items-center gap-2'>
                                <Users className='h-4 w-4 text-blue-600' />
                                <span className='font-medium text-blue-700 text-sm'>Database</span>
                            </div>
                            <div className='mt-1 font-bold text-blue-900 text-lg'>{staticSearchResults.length}+ Alumni</div>
                        </div>
                        <div className='rounded-xl border border-green-200 bg-green-50 p-3'>
                            <div className='text-green-700 text-xs'>Searches</div>
                            <div className='font-bold text-green-900 text-lg'>{searchStats.totalSearches}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-8'>
                {/* Primary Identification Section */}
                <CollapsibleSection
                    title='Primary Identification'
                    defaultOpen={true}
                    className='rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-1'>
                    <div className='p-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='rounded-lg bg-blue-100 p-2'>
                                        <GraduationCap className='h-4 w-4 text-blue-600' />
                                    </div>
                                    <Label className='font-bold text-blue-800 text-sm'>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <Select value={asmaY_Id} onValueChange={handleYearChange}>
                                    <SelectTrigger className='h-12 rounded-xl border-2 border-blue-200 bg-white shadow-sm transition-all hover:border-blue-300'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)} className='py-3'>
                                                <div className='flex items-center gap-2'>
                                                    <span className='font-medium'>{y.asmaY_Year}</span>
                                                    {asmaY_Id === String(y.asmaY_Id) && (
                                                        // biome-ignore lint/style/useSelfClosingElements: <explanation>
                                                        <span className='h-2 w-2 rounded-full bg-green-500'></span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='rounded-lg bg-purple-100 p-2'>
                                        <Building className='h-4 w-4 text-purple-600' />
                                    </div>
                                    <Label className='font-bold text-purple-800 text-sm'>
                                        Course <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <Select value={amcO_Id} onValueChange={handleCourseChange} disabled={!asmaY_Id}>
                                    <SelectTrigger className='h-12 rounded-xl border-2 border-purple-200 bg-white shadow-sm transition-all hover:border-purple-300'>
                                        <SelectValue placeholder='Select Course' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((c) => (
                                            <SelectItem key={c.amcO_Id} value={String(c.amcO_Id)} className='py-3'>
                                                <div className='flex items-center gap-2'>
                                                    <span>{c.courseName}</span>
                                                    {amcO_Id === String(c.amcO_Id) && (
                                                        // biome-ignore lint/style/useSelfClosingElements: <explanation>
                                                        <span className='h-2 w-2 rounded-full bg-green-500'></span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='rounded-lg bg-green-100 p-2'>
                                        <Users className='h-4 w-4 text-green-600' />
                                    </div>
                                    <Label className='font-bold text-green-800 text-sm'>
                                        Branch <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <Select value={amB_Id} onValueChange={handleBranchChange} disabled={!amcO_Id}>
                                    <SelectTrigger className='h-12 rounded-xl border-2 border-green-200 bg-white shadow-sm transition-all hover:border-green-300'>
                                        <SelectValue placeholder='Select Branch' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b) => (
                                            <SelectItem key={b.amB_Id} value={String(b.amB_Id)} className='py-3'>
                                                <div className='flex items-center gap-2'>
                                                    <span>{b.branchName}</span>
                                                    {amB_Id === String(b.amB_Id) && (
                                                        // biome-ignore lint/style/useSelfClosingElements: <explanation>
                                                        <span className='h-2 w-2 rounded-full bg-green-500'></span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-3'>
                                <div className='flex items-center gap-2'>
                                    <div className='rounded-lg bg-orange-100 p-2'>
                                        <Layers className='h-4 w-4 text-orange-600' />
                                    </div>
                                    <Label className='font-bold text-orange-800 text-sm'>
                                        Semester <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <Select value={amsE_Id} onValueChange={setAmsE_Id} disabled={!amB_Id}>
                                    <SelectTrigger className='h-12 rounded-xl border-2 border-orange-200 bg-white shadow-sm transition-all hover:border-orange-300'>
                                        <SelectValue placeholder='Select Semester' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {semesters.map((s) => (
                                            <SelectItem key={s.amsE_Id} value={String(s.amsE_Id)} className='py-3'>
                                                <div className='flex items-center gap-2'>
                                                    <span>{s.semesterName}</span>
                                                    {amsE_Id === String(s.amsE_Id) && (
                                                        // biome-ignore lint/style/useSelfClosingElements: <explanation>
                                                        <span className='h-2 w-2 rounded-full bg-green-500'></span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Selection Status */}
                        {(asmaY_Id || amcO_Id || amB_Id || amsE_Id) && (
                            <div className='mt-6 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-4'>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className={`h-3 w-3 rounded-full ${asmaY_Id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className='font-medium text-sm'>Academic Year Selected</span>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className={`h-3 w-3 rounded-full ${amcO_Id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className='font-medium text-sm'>Course Selected</span>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className={`h-3 w-3 rounded-full ${amB_Id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className='font-medium text-sm'>Branch Selected</span>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className={`h-3 w-3 rounded-full ${amsE_Id ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <span className='font-medium text-sm'>Semester Selected</span>
                                    </div>
                                    <div className='text-muted-foreground text-xs'>
                                        {amsE_Id ? 'Ready to search!' : 'Complete all selections'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Advanced Search Criteria */}
                <CollapsibleSection
                    title='Advanced Search Criteria'
                    defaultOpen={true}
                    variant='outline'
                    className='rounded-2xl bg-gradient-to-br from-white to-gray-50 p-1'>
                    <div className='p-6'>
                        <div className='mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4'>
                            <h3 className='mb-2 font-bold text-blue-800'>Build Your Search Query</h3>
                            <p className='text-blue-700 text-sm'>Add multiple criteria with AND/OR conditions for precise filtering</p>
                        </div>
                        <SearchCriteriaBuilder onSearch={handleSearch} onClear={handleClear} />
                    </div>
                </CollapsibleSection>

                {/* Search Results */}
                {(isSearching || results.length > 0) && (
                    <CollapsibleSection
                        title='Discovery Results'
                        defaultOpen={true}
                        variant='outline'
                        className='rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-1'>
                        <div className='p-6'>
                            {isSearching ? (
                                <div className='flex flex-col items-center justify-center space-y-6 p-16'>
                                    <div className='relative'>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className='h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary'></div>
                                        <SearchIcon className='absolute inset-0 m-auto h-10 w-10 animate-pulse text-primary' />
                                    </div>
                                    <div className='space-y-3 text-center'>
                                        <p className='font-bold text-gray-700 text-xl'>Searching Database</p>
                                        <p className='max-w-md text-muted-foreground'>Querying alumni records with your criteria...</p>
                                        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
                                        <div className='mx-auto h-1 w-48 animate-pulse rounded-full bg-gradient-to-r from-primary/20 via-primary to-primary/20'></div>
                                    </div>
                                </div>
                            ) : (
                                <div className='space-y-6'>
                                    <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                                        <div>
                                            <h3 className='font-bold text-2xl text-gray-800'>Search Results</h3>
                                            <p className='mt-1 text-muted-foreground text-sm'>
                                                Found {results.length} records matching your criteria
                                            </p>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <div className='text-muted-foreground text-xs'>Last search: {searchStats.lastSearchTime}</div>
                                        </div>
                                    </div>
                                    <SearchResultsTable data={results} onExport={handleExportToExcel} />
                                </div>
                            )}
                        </div>
                    </CollapsibleSection>
                )}

                {/* Information Panel */}
                <div className='rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shadow-2xl'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <div className='rounded-xl bg-blue-500/20 p-3'>
                                    <SearchIcon className='h-6 w-6 text-blue-300' />
                                </div>
                                <h3 className='font-bold text-xl'>Advanced Search</h3>
                            </div>
                            <p className='text-gray-300 text-sm leading-relaxed'>
                                Use multiple criteria with AND/OR operators to create complex search queries. Filter by any student
                                attribute with exact or pattern matching.
                            </p>
                        </div>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <div className='rounded-xl bg-green-500/20 p-3'>
                                    <Users className='h-6 w-6 text-green-300' />
                                </div>
                                <h3 className='font-bold text-xl'>Data Export</h3>
                            </div>
                            <p className='text-gray-300 text-sm leading-relaxed'>
                                Export selected records to Excel for further analysis. Complete student profiles with all demographic
                                information.
                            </p>
                        </div>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-3'>
                                <div className='rounded-xl bg-purple-500/20 p-3'>
                                    <GraduationCap className='h-6 w-6 text-purple-300' />
                                </div>
                                <h3 className='font-bold text-xl'>Alumni Database</h3>
                            </div>
                            <p className='text-gray-300 text-sm leading-relaxed'>
                                Access comprehensive alumni records from multiple academic years, courses, and branches. Real-time search
                                with instant results.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
