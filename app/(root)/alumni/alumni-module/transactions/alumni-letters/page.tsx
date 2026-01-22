'use client';

import FilterForm from '@/app/(root)/alumni/alumni-module/transactions/alumni-letters/_components/filter-form';
import { LetterTemplates } from '@/app/(root)/alumni/alumni-module/transactions/alumni-letters/_components/letter-templates';
import type { AlumniLettersSchema } from '@/app/(root)/alumni/alumni-module/transactions/alumni-letters/_components/schema';
import StudentList from '@/app/(root)/alumni/alumni-module/transactions/alumni-letters/_components/student-list';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IAcademicYear, IAlumniLetterStudent, IClassDetails } from '@/types/alumni/alumni-letters';
import { GraduationCap, Loader2, Printer, Users } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

// Static academic years
const staticYears: IAcademicYear[] = [
    { asmaY_Id: 1, asmaY_Year: '2024-2025', Selected: false },
    { asmaY_Id: 2, asmaY_Year: '2023-2024', Selected: false },
    { asmaY_Id: 3, asmaY_Year: '2022-2023', Selected: false },
    { asmaY_Id: 4, asmaY_Year: '2021-2022', Selected: false },
    { asmaY_Id: 5, asmaY_Year: '2020-2021', Selected: false },
    { asmaY_Id: 6, asmaY_Year: '2019-2020', Selected: false },
    { asmaY_Id: 7, asmaY_Year: '2018-2019', Selected: false },
    { asmaY_Id: 8, asmaY_Year: '2017-2018', Selected: false }
];

// Static classes
const staticClasses: IClassDetails[] = [
    { asmcL_Id: 1, asmcL_ClassName: '10th Standard', Selected: false },
    { asmcL_Id: 2, asmcL_ClassName: 'PUC I (11th)', Selected: false },
    { asmcL_Id: 3, asmcL_ClassName: 'PUC II (12th)', Selected: false },
    { asmcL_Id: 4, asmcL_ClassName: 'B.Tech I Year', Selected: false },
    { asmcL_Id: 5, asmcL_ClassName: 'B.Tech II Year', Selected: false },
    { asmcL_Id: 6, asmcL_ClassName: 'B.Tech III Year', Selected: false },
    { asmcL_Id: 7, asmcL_ClassName: 'B.Tech IV Year', Selected: false },
    { asmcL_Id: 8, asmcL_ClassName: 'MBA I Year', Selected: false },
    { asmcL_Id: 9, asmcL_ClassName: 'MBA II Year', Selected: false }
];

// Static students data
const staticStudents: IAlumniLetterStudent[] = [
    {
        amsT_Id: 101,
        amsT_RegistrationNo: 'ALM2024001',
        amsT_AdmNo: 'ADM2018015',
        amsT_FirstName: 'John Smith',
        amsT_Date: '2018-06-15T00:00:00.000Z',
        amsT_DOB: '2000-03-12T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech IV Year',
        amsT_MobileNo: '+91 9876543210',
        amsT_emailId: 'john.smith@example.com',
        amsT_Sex: 'Male',
        AMST_PerStreet: '123 Tech Park',
        AMST_PerArea: 'Silicon Valley',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560001',
        amsT_FatherName: 'Robert Smith',
        selected: false,
        AMST_BloodGroup: 'O+'
    },
    {
        amsT_Id: 102,
        amsT_RegistrationNo: 'ALM2024002',
        amsT_AdmNo: 'ADM2018018',
        amsT_FirstName: 'Sarah Johnson',
        amsT_Date: '2018-06-18T00:00:00.000Z',
        amsT_DOB: '2000-07-25T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech IV Year',
        amsT_MobileNo: '+91 8765432109',
        amsT_emailId: 'sarah.j@example.com',
        amsT_Sex: 'Female',
        AMST_PerStreet: '456 Green Avenue',
        AMST_PerArea: 'Koramangala',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560034',
        amsT_FatherName: 'David Johnson',
        selected: false,
        AMST_BloodGroup: 'A+'
    },
    {
        amsT_Id: 103,
        amsT_RegistrationNo: 'ALM2024003',
        amsT_AdmNo: 'ADM2019012',
        amsT_FirstName: 'Michael Chen',
        amsT_Date: '2019-06-20T00:00:00.000Z',
        amsT_DOB: '2001-01-30T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech III Year',
        amsT_MobileNo: '+91 7654321098',
        amsT_emailId: 'michael.chen@example.com',
        amsT_Sex: 'Male',
        AMST_PerStreet: '789 StartUp Road',
        AMST_PerArea: 'HSR Layout',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560102',
        amsT_FatherName: 'James Chen',
        selected: false,
        AMST_BloodGroup: 'B+'
    },
    {
        amsT_Id: 104,
        amsT_RegistrationNo: 'ALM2024004',
        amsT_AdmNo: 'ADM2019015',
        amsT_FirstName: 'Priya Sharma',
        amsT_Date: '2019-06-22T00:00:00.000Z',
        amsT_DOB: '2001-04-15T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech III Year',
        amsT_MobileNo: '+91 6543210987',
        amsT_emailId: 'priya.sharma@example.com',
        amsT_Sex: 'Female',
        AMST_PerStreet: '321 Heritage Lane',
        AMST_PerArea: 'Indiranagar',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560038',
        amsT_FatherName: 'Ramesh Sharma',
        selected: false,
        AMST_BloodGroup: 'AB+'
    },
    {
        amsT_Id: 105,
        amsT_RegistrationNo: 'ALM2024005',
        amsT_AdmNo: 'ADM2020010',
        amsT_FirstName: 'David Wilson',
        amsT_Date: '2020-06-10T00:00:00.000Z',
        amsT_DOB: '2002-09-18T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech II Year',
        amsT_MobileNo: '+91 5432109876',
        amsT_emailId: 'david.wilson@example.com',
        amsT_Sex: 'Male',
        AMST_PerStreet: '654 Lake View',
        AMST_PerArea: 'Whitefield',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560066',
        amsT_FatherName: 'Thomas Wilson',
        selected: false,
        AMST_BloodGroup: 'O-'
    }
];

// More students for demonstration
const moreStudents: IAlumniLetterStudent[] = [
    {
        amsT_Id: 106,
        amsT_RegistrationNo: 'ALM2024006',
        amsT_AdmNo: 'ADM2020012',
        amsT_FirstName: 'Emma Watson',
        amsT_Date: '2020-06-12T00:00:00.000Z',
        amsT_DOB: '2002-11-22T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech II Year',
        amsT_MobileNo: '+91 4321098765',
        amsT_emailId: 'emma.watson@example.com',
        amsT_Sex: 'Female',
        AMST_PerStreet: '987 Garden Street',
        AMST_PerArea: 'JP Nagar',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560078',
        amsT_FatherName: 'Richard Watson',
        selected: false,
        AMST_BloodGroup: 'A-'
    },
    {
        amsT_Id: 107,
        amsT_RegistrationNo: 'ALM2024007',
        amsT_AdmNo: 'ADM2021014',
        amsT_FirstName: 'Robert Brown',
        amsT_Date: '2021-06-14T00:00:00.000Z',
        amsT_DOB: '2003-02-28T00:00:00.000Z',
        asmcL_ClassName: 'B.Tech I Year',
        amsT_MobileNo: '+91 3210987654',
        amsT_emailId: 'robert.brown@example.com',
        amsT_Sex: 'Male',
        AMST_PerStreet: '147 Tech Hub',
        AMST_PerArea: 'Electronic City',
        AMST_PerCity: 'Bangalore',
        AMST_PerPincode: '560100',
        amsT_FatherName: 'William Brown',
        selected: false,
        AMST_BloodGroup: 'B+'
    }
];

// Mock API functions
const mockGetAlumniLettersLoadData = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
        success: true,
        data: {
            newuser1: staticYears,
            newuser2: staticClasses,
            logopath: [{ logoname: 'Alumni' }]
        }
    };
};

const mockGetAlumniLettersShowReport = async ({ ASMAY_Id, ASMCL_Id, logoname }: any) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Filter students based on criteria (simplified for demo)
    if (ASMAY_Id === 1 && ASMCL_Id === 7) {
        // B.Tech IV Year, 2024-2025
        return {
            success: true,
            data: {
                searchstudentDetails: staticStudents.filter((s) => s.asmcL_ClassName === 'B.Tech IV Year')
            }
        };
    } else if (ASMAY_Id === 2 && ASMCL_Id === 6) {
        // B.Tech III Year, 2023-2024
        return {
            success: true,
            data: {
                searchstudentDetails: staticStudents.filter((s) => s.asmcL_ClassName === 'B.Tech III Year')
            }
        };
    } else if (ASMAY_Id === 3 && ASMCL_Id === 5) {
        // B.Tech II Year, 2022-2023
        return {
            success: true,
            data: {
                searchstudentDetails: [...staticStudents.filter((s) => s.asmcL_ClassName === 'B.Tech II Year'), moreStudents[0]]
            }
        };
    } else {
        return {
            success: true,
            data: {
                searchstudentDetails: []
            }
        };
    }
};

const mockGetAlumniLettersReport = async ({ ASMAY_Id, ASMCL_Id, letter_list, logoname, studlistdata }: any) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Get selected students
    const selectedIds = studlistdata.map((s: any) => s.amsT_Id);
    const selectedStudents = [...staticStudents, ...moreStudents].filter((s) => selectedIds.includes(s.amsT_Id));

    return {
        success: true,
        data: {
            searchstudentDetails2: selectedStudents
        }
    };
};

export default function AlumniLettersPage() {
    const [years, setYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IClassDetails[]>([]);
    const [students, setStudents] = useState<IAlumniLetterStudent[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [reportStudents, setReportStudents] = useState<IAlumniLetterStudent[]>([]);
    const [filterValues, setFilterValues] = useState<AlumniLettersSchema | null>(null);
    const [isPrinting, setIsPrinting] = useState(false);

    const printRef = useRef<HTMLDivElement>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await mockGetAlumniLettersLoadData();
            if (res.success && res.data) {
                setYears(res.data.newuser1 || []);
                setClasses(res.data.newuser2 || []);
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleShowReport = async (values: AlumniLettersSchema) => {
        setIsSearching(true);
        setFilterValues(values);
        try {
            const res = await mockGetAlumniLettersShowReport({
                ASMAY_Id: Number(values.asmaY_Id),
                ASMCL_Id: Number(values.asmcL_Id),
                logoname: values.reporttype
            });
            if (res.success && res.data) {
                setStudents(res.data.searchstudentDetails || []);
                setSelectedIds([]);
                if ((res.data.searchstudentDetails || []).length === 0) {
                    toast.info('No records found for the selected criteria.');
                } else {
                    toast.success(`Found ${res.data.searchstudentDetails.length} students`);
                }
            }
        } catch (error) {
            toast.error('Error fetching students');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClear = () => {
        setStudents([]);
        setSelectedIds([]);
        setReportStudents([]);
        setFilterValues(null);
        toast.info('Filters cleared');
    };

    const toggleAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(students.map((s) => s.amsT_Id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleStudent = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);

        // Create print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Alumni Letters - Print</title>
                    <style>
                        body { 
                            font-family: 'Times New Roman', Times, serif; 
                            margin: 0; 
                            padding: 20px; 
                            font-size: 14pt; 
                            line-height: 1.6;
                        }
                        .letter-page { 
                            page-break-after: always; 
                            margin-bottom: 40px;
                        }
                        .letter-header { 
                            text-align: center; 
                            border-bottom: 2px solid #000; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px;
                        }
                        .letter-header h2 { 
                            font-size: 22pt; 
                            font-weight: bold; 
                            margin: 10px 0 5px 0;
                        }
                        .letter-header h3 { 
                            font-size: 18pt; 
                            font-weight: bold; 
                            margin: 5px 0 10px 0;
                        }
                        .letter-content { 
                            text-align: justify; 
                            margin-bottom: 30px;
                        }
                        .hhh { 
                            margin-bottom: 15pt; 
                            text-indent: 20pt;
                        }
                        .signature-section { 
                            margin-top: 40pt;
                        }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div id="print-content"></div>
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Letters</button>
                        <button onclick="window.close()" style="padding: 10px 20px; background: #dc2626; color: white; border: none; border-radius: 5px; margin-left: 10px; cursor: pointer;">Close</button>
                    </div>
                </body>
                </html>
            `);

            // Render letter templates
            const printContent = printWindow.document.getElementById('print-content');
            if (printContent) {
                // Simpler rendering for print window
                const letterTypes: Record<string, string> = {
                    OBA: 'OBA Games Meet Invitation',
                    ENR: 'Enrollment as Member (10th)',
                    ENR3: 'Enrollment as Member (PUC II)',
                    ADR: 'Address Change Acknowledgment',
                    PTRN: 'Enrollment as Patron',
                    LFMB: 'Enrollment as Life Member'
                };

                const letterTypeName = letterTypes[filterValues?.letter_list || ''] || 'Letter';

                reportStudents.forEach((student, index) => {
                    const letterPage = printWindow.document.createElement('div');
                    letterPage.className = 'letter-page';
                    letterPage.innerHTML = `
                        <div class="letter-header">
                            <h2>Sri Ramakrishna Vidyashala</h2>
                            <h3>Old Boys' Association</h3>
                            <p>Yadavagiri, Mysuru 570 020, Karnataka</p>
                            <p>Phone : (0821) 2514000, 2417555 • e-mail : alumnisrkvs@gmail.com • www.srkvs.org</p>
                        </div>
                        <div style="text-align: right; margin-bottom: 30px; font-weight: bold;">
                            Date: ${new Date().toLocaleDateString('en-GB')}
                        </div>
                        <div class="letter-content">
                            <div style="margin-bottom: 10px;">To,</div>
                            <div style="font-weight: bold; margin-bottom: 30px;">
                                Dear ${student.amsT_FirstName},<br/>
                                ${student.AMST_PerStreet}<br/>
                                ${student.AMST_PerArea}<br/>
                                ${student.AMST_PerCity} - ${student.AMST_PerPincode}
                            </div>
                            <div style="font-weight: bold; text-decoration: underline; margin-bottom: 10px;">
                                Sub: ${letterTypeName}
                            </div>
                            <p class="hhh">This is a sample letter for ${student.amsT_FirstName}, Registration No: ${student.amsT_RegistrationNo}.</p>
                            <p class="hhh">The actual letter content would be generated based on the selected letter type and student details.</p>
                            <p class="hhh">Please contact the alumni association office for the complete formal letter.</p>
                        </div>
                        <div class="signature-section">
                            <div style="margin-bottom: 40px;">With best wishes,</div>
                            <div style="text-align: center;">
                                <div style="font-weight: bold;">Yours affectionately,</div>
                                <div style="height: 80px;"></div>
                                <div style="font-weight: bold; text-transform: uppercase;">Correspondent, SRKVS</div>
                                <div style="font-weight: bold; text-transform: uppercase;">Treasurer, SRKVS OBA</div>
                            </div>
                        </div>
                    `;
                    printContent.appendChild(letterPage);
                });
            }

            printWindow.document.close();
            setIsPrinting(false);
        }
    };

    const generateReportAndPrint = async () => {
        if (!filterValues || selectedIds.length === 0) {
            toast.error('Please select students to print letters.');
            return;
        }

        setIsSearching(true);
        try {
            const res = await mockGetAlumniLettersReport({
                ASMAY_Id: Number(filterValues.asmaY_Id),
                ASMCL_Id: Number(filterValues.asmcL_Id),
                letter_list: filterValues.letter_list,
                logoname: filterValues.reporttype,
                studlistdata: selectedIds.map((id) => ({ amsT_Id: id }))
            });

            if (res.success && res.data && res.data.searchstudentDetails2.length > 0) {
                setReportStudents(res.data.searchstudentDetails2);
                toast.success(`Generated letters for ${res.data.searchstudentDetails2.length} students`);
                // Auto-print after a short delay
                setTimeout(() => {
                    handlePrint();
                }, 800);
            } else {
                toast.error('Failed to generate report for selected students.');
            }
        } catch (error) {
            toast.error('Error generating report');
        } finally {
            setIsSearching(false);
        }
    };

    if (isLoading) {
        return (
            <div className='flex h-screen items-center justify-center'>
                <div className='flex flex-col items-center gap-4'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <p className='text-muted-foreground'>Loading alumni letters module...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='container min-h-screen space-y-6 p-4'>
            <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
                <div>
                    <h2 className='font-bold text-2xl tracking-tight'>Alumni Letters</h2>
                    <p className='mt-1 text-muted-foreground text-sm'>Generate and print official letters for alumni</p>
                </div>
                <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm'>
                        <Users className='h-4 w-4' />
                        <span>{years.length} Academic Years</span>
                    </div>
                    <div className='flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-600 text-sm'>
                        <GraduationCap className='h-4 w-4' />
                        <span>{classes.length} Classes</span>
                    </div>
                </div>
            </div>

            <div className='rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-1'>
                <CollapsibleSection title='Filter Criteria' defaultOpen={true} variant='default'>
                    <div className='p-4'>
                        <FilterForm
                            years={years}
                            classes={classes}
                            onShowReport={handleShowReport}
                            onClear={handleClear}
                            onPrint={generateReportAndPrint}
                            canPrint={selectedIds.length > 0}
                        />
                    </div>
                </CollapsibleSection>
            </div>

            {students.length > 0 && (
                <CollapsibleSection title='Filtered Students' defaultOpen={true} variant='outline'>
                    <div className='p-1'>
                        {isSearching ? (
                            <div className='flex flex-col items-center justify-center gap-4 p-12'>
                                <Loader2 className='h-10 w-10 animate-spin text-primary' />
                                <p className='text-muted-foreground'>Searching for students...</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4'>
                                    <div>
                                        <h3 className='font-bold text-green-800'>Selection Summary</h3>
                                        <p className='text-green-700 text-sm'>
                                            {students.length} students found • {selectedIds.length} selected
                                        </p>
                                    </div>
                                    {selectedIds.length > 0 && (
                                        <Button
                                            onClick={generateReportAndPrint}
                                            disabled={isPrinting || isSearching}
                                            size='lg'
                                            className='bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:from-green-700 hover:to-emerald-700'>
                                            {isPrinting ? (
                                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                            ) : (
                                                <Printer className='mr-2 h-5 w-5' />
                                            )}
                                            Print {selectedIds.length} Letter{selectedIds.length !== 1 ? 's' : ''}
                                        </Button>
                                    )}
                                </div>
                                <StudentList
                                    students={students}
                                    selectedIds={selectedIds}
                                    onToggleAll={toggleAll}
                                    onToggleStudent={toggleStudent}
                                />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* Print Content (Visible only for printing) */}
            <div className='print-only'>
                <LetterTemplates
                    ref={printRef}
                    students={reportStudents}
                    letterType={filterValues?.letter_list || ''}
                    displayDateTime={filterValues?.display_DateandTime}
                />
            </div>

            {/* Information Panel */}
            <div className='rounded-xl border bg-gradient-to-r from-gray-50 to-white p-6'>
                <h3 className='mb-4 font-bold text-gray-800 text-lg'>Letter Types Available</h3>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-2 font-bold text-blue-600'>OBA Games Meet</h4>
                        <p className='text-gray-600 text-sm'>Invitation for alumni to participate in annual sports events.</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-2 font-bold text-green-600'>Enrollment as Member</h4>
                        <p className='text-gray-600 text-sm'>Official enrollment letters for new OBA members (10th & PUC II).</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-2 font-bold text-purple-600'>Address Change</h4>
                        <p className='text-gray-600 text-sm'>Acknowledgement of address change notification from alumni.</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-2 font-bold text-orange-600'>Enrollment as Patron</h4>
                        <p className='text-gray-600 text-sm'>Special letters for alumni enrolling as patrons.</p>
                    </div>
                    <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
                        <h4 className='mb-2 font-bold text-red-600'>Enrollment as Life Member</h4>
                        <p className='text-gray-600 text-sm'>Life membership enrollment confirmation letters.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
