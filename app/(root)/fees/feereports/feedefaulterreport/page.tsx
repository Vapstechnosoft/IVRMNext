// app/(root)/fees/feereports/feedefaulterreport/page.tsx
'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeBusRouteDefaulterreport,
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDefaulterreport
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { feeDefaulterReportSchema } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import type {
    IFeeBusRouteDropdownList,
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeGroupDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type IFeeDefaluterReport, exportToExcel, printTable } from './_components/columns';

type FormFields = z.infer<typeof feeDefaulterReportSchema>;

// Checkbox with full indeterminate support
const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    //   useEffect(() => {
    //     if (ref.current) {
    //       ref.current.indeterminate = !!indeterminate;
    //     }
    //   }, [indeterminate]);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

interface FeeDefaulterReportPayload {
    // Common fields for both Yearly and Date Wise
    FMG_Id?: number; // Optional fee group ID
    Balance_1?: number; // 1 if balance checkbox is checked, 0 otherwise
    FMGG_Id?: number; // Custom group ID (0 if undefined)
    FMT_Id?: number; // Term ID (0 if undefined)
    ASMAY_Id: number; // Academic Year ID (REQUIRED)
    radioval: string; // "FGW", "FHW", "FCW", "FIW", "FSW", "FPW"
    reporttype: 'year' | 'date'; // "year" or "date"
    yearid?: number; // 1 if route is selected, 0 otherwise
    active: number; // 1 or 0
    deactive: number; // 1 or 0
    left: number; // 1 or 0
    customflag?: string; // Custom flag (empty string if undefined)
    groupflag?: string; // Group flag (empty string if undefined)
    ASMCL_Id?: number; // Class ID (0 if not selected)
    AMSC_Id?: number; // Section ID (0 if not selected)
    FMG_Ids: number[]; // Array of selected fee group IDs
    FMT_Ids: number[]; // Array of selected term IDs
    TRMR_Ids: number[]; // Array of selected bus route IDs
    term_group: 'G' | 'T'; // "G" for group, "T" for term
    Select_Button?: string; // Radio type selection

    // Conditional fields for Date Wise
    From_Date?: string; // Only for date wise (in date string format)
    duedate?: number; // Only for date wise (1 if due date selected)

    // Conditional fields for Yearly Wise
    studenttype?: string; // Only for yearly wise
}

interface IStudentFeeDefaulterReport {
    id: number;
    // slNo: number;
    name: string;
    admissionNo: string;
    classSection: string;
    fatherName: string;
    mobileNumber: string;
    emailId: string;
    route: string;
    balanceAmount: number;
    // fineAmount: number;
    // totalAmount: number;
    // feeGroup: string;
}

export default function FeeDefaulterReport() {
    const breakdownOptions = [
        { value: 'FGW', label: 'Fee Group Wise' },
        { value: 'FHW', label: 'Fee Head Wise' },
        { value: 'FCW', label: 'Class Wise' },
        { value: 'FIW', label: 'Installment Wise' },
        { value: 'FSW', label: 'Student/Staff Wise' },
        { value: 'FPW', label: 'Parent Wise' }
    ] as const;

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeDefaulterReportSchema),
        defaultValues: {
            userType: 'Students',
            viewMode: 'Yearly Wise',
            breakdown: 'FGW',
            academicYearId: undefined,
            includeClassSection: false,
            classId: 0,
            sectionId: 0,
            customGroupIds: [],
            feeGroupIds: [],
            termIds: [],
            busRouteIds: [],
            status: {
                active: true,
                deactive: false,
                left: false,
                balance: false
            },
            formatI: false,
            bulkDownload: false
        }
    });

    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        userType: 'Students' as 'Students' | 'Staff' | 'Others',
        viewMode: 'Yearly Wise' as 'Yearly Wise' | 'Date Wise',
        breakdown: 'Fee Group Wise',
        academicYearId: '',
        classId: 0,
        sectionId: 0,
        includeClassSection: false,
        status: {
            active: true,
            deactive: false,
            left: false,
            balance: false
        },
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[],
        busRouteIds: [] as number[],
        formatI: false,
        dueDate: new Date(),
        dueDateType: 'Due Date' as 'Due Date' | 'Till Due Date',
        bulkDownload: false
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [feeBusRoutes, setFeeBusRoutes] = useState<IFeeBusRouteDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);

    const [reportData, setReportData] = useState<IFeeDefaluterReport[]>([]);

    const [studentreportData, setstudentReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [reportLoading, setReportLoading] = useState(false); // ← ADD THIS LINE
    const [showReport, setShowReport] = useState(false);

    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [sectionLoading, setSectionLoading] = useState(false);

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();
    const {
        data: sectionListResponse,
        isLoading: loadingSections,
        error: sectionListError,
        refetch: refetchSections
    } = useFeeSectionListDefaulterreport();
    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();
    const { data: busRouteResponse, isLoading: loadingBusRoutes, error: busRouteError } = useFeeBusRouteDefaulterreport();
    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    // Load data effects (unchanged)
    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            //  formatted.sort((a, b) => (b.asmaY_Order || 0) - (a.asmaY_Order || 0));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    useEffect(() => {
        if (filters.classId > 0) refetchSections();
        else {
            setSections([]);
            setFilters((prev) => ({ ...prev, sectionId: 0 }));
        }
    }, [filters.classId, refetchSections]);
    // useEffect(() => {
    //     const fetchSections = async () => {
    //         if (!filters.includeClassSection || !filters.academicYearId || filters.classId <= 0) {
    //             setSections([]);
    //             setFilters((prev) => ({ ...prev, sectionId: 0 }));
    //             return;
    //         }

    //         setSectionLoading(true);
    //         try {
    //             const result = await getFeesSectionListByClassId(Number(filters.academicYearId), filters.classId);
    //              console.log('sectionsdata', result);
    //             const data = Array.isArray(result?.data) ? result.data : [];
    //             setSections(data);

    //             if (data.length === 0) {
    //                 toast.info('No sections found for this class');
    //             }
    //         } catch (error: any) {
    //             toast.error(error.message || 'Failed to load sections');
    //             setSections([]);
    //         } finally {
    //             setSectionLoading(false);
    //         }
    //     };

    //     fetchSections();
    // }, [filters.academicYearId, filters.classId, filters.includeClassSection]);

    const classId = watch('classId') ?? 0;
    const academicYearId = watch('academicYearId');
    const includeClassSection = watch('includeClassSection');

    useEffect(() => {
        const fetchSections = async () => {
            if (!includeClassSection || !academicYearId || classId <= 0) {
                setSections([]);
                setValue('sectionId', 0);
                return;
            }

            setSectionLoading(true);

            try {
                const result = await getFeesSectionListByClassId(Number(academicYearId), classId);

                console.log('sectionsdata', result);

                const data = Array.isArray(result?.data) ? result.data : [];
                setSections(data);

                if (data.length === 0) {
                    toast.info('No sections found for this class');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load sections');
                setSections([]);
            } finally {
                setSectionLoading(false);
            }
        };

        fetchSections();
    }, [academicYearId, classId, includeClassSection, setValue]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (busRouteError) toast.error(busRouteError?.message || 'Failed to load bus routes');
        else if (busRouteResponse?.data) setFeeBusRoutes(busRouteResponse.data as IFeeBusRouteDropdownList[]);
    }, [busRouteResponse, busRouteError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    // Toggle handlers
    const toggleCustomGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            customGroupIds: prev.customGroupIds.includes(id) ? prev.customGroupIds.filter((x) => x !== id) : [...prev.customGroupIds, id]
        }));

    const toggleFeeGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            feeGroupIds: prev.feeGroupIds.includes(id) ? prev.feeGroupIds.filter((x) => x !== id) : [...prev.feeGroupIds, id]
        }));

    const toggleTerm = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            termIds: prev.termIds.includes(id) ? prev.termIds.filter((x) => x !== id) : [...prev.termIds, id]
        }));

    const toggleBusRoute = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            busRouteIds: prev.busRouteIds.includes(id) ? prev.busRouteIds.filter((x) => x !== id) : [...prev.busRouteIds, id]
        }));

    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : [] }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : [] }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, termIds: checked ? feeTerms.map((t) => t.fmT_Id) : [] }));
    };

    const selectAllBusRoutes = (checked: boolean) => {
        setFilters((prev) => ({ ...prev, busRouteIds: checked ? feeBusRoutes.map((r) => r.trmR_Id) : [] }));
    };

    const toggleStatus = (status: 'active' | 'deactive' | 'left' | 'balance') => {
        setFilters((prev) => ({
            ...prev,
            status: { ...prev.status, [status]: !prev.status[status] }
        }));
    };

    // Add these state variables after your existing states
    const [communicationMethods, setCommunicationMethods] = useState({
        email: false,
        sms: false,
        notification: false,
        whatsapp: false
    });

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailTemplate, setEmailTemplate] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailContent, setEmailContent] = useState('');

    const [showemailContent, setshowEmailContent] = useState(false);

    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);

    // Also add these state variables for the modal content
    const [notificationTemplate, setNotificationTemplate] = useState('');
    const [notificationContent, setNotificationContent] = useState('');
    const [smsTemplate, setSmsTemplate] = useState('');
    const [smsContent, setSmsContent] = useState('');
    const [smsSearch, setSmsSearch] = useState('');

    // Update the toggleCommunicationMethod function
    const toggleCommunicationMethod = (method: keyof typeof communicationMethods) => {
        setCommunicationMethods((prev) => ({
            ...prev,
            [method]: !prev[method]
        }));

        // Open the appropriate modal when method is selected
        if (!communicationMethods[method]) {
            switch (method) {
                case 'email':
                    setshowEmailContent(true);
                    break;
                case 'notification':
                    setShowNotificationModal(true);
                    break;
                case 'sms':
                    setShowSMSModal(true);
                    break;
                // whatsapp can be handled similarly if needed
            }
        }
    };

    // Add this function to handle communication method toggles
    // const toggleCommunicationMethod = (method: keyof typeof communicationMethods) => {
    //     setCommunicationMethods(prev => ({
    //         ...prev,
    //         [method]: !prev[method]
    //     }));

    //     // If email is selected, open the email modal
    //     if (method === 'email' && !communicationMethods.email) {
    //         setShowEmailModal(true);
    //     }
    // };

    // Add this function to handle sending emails
    const handleSendEmail = () => {
        // Get selected students
        const selectedStudents = studentreportData.filter((student) => selectedIds.includes(student.id));

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        // Here you would typically make an API call to send emails
        console.log('Sending email to:', selectedStudents);
        console.log('Subject:', emailSubject);
        console.log('Content:', emailContent);
        console.log('Template:', emailTemplate);

        toast.success(`Email sent to ${selectedStudents.length} student(s)`);
        setShowEmailModal(false);
    };

    // Add this function to calculate totals
    const calculateTotals = () => {
        const selectedStudents = studentreportData.filter((student) => selectedIds.includes(student.id));

        return {
            count: selectedStudents.length,
            totalBalance: selectedStudents.reduce((sum, student) => sum + student.balanceAmount, 0)
            // Add other totals if needed
        };
    };
    // const handleSubmit = async () => {

    //   if (!filters.academicYearId) return toast.error('Please select an Academic Year');
    //   if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
    //   if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

    //   setReportLoading(true);
    //   setShowReport(false);

    //   try {   // Call your server function (make sure it returns Promise!)
    //     const result = await feedefaluerreportdata(5855, 55);

    //     const data = Array.isArray(result) ? result : (result?.data || []);

    //     setReportData(data as IFeeAuditReport[]);
    //     setShowReport(true);

    //     // Feedback
    //     if (data.length > 0) {
    //       toast.success(`Report generated: ${data.length} defaulter(s) found`);
    //     } else {
    //       toast.info('No defaulters found for the selected criteria');
    //     }

    //     setTimeout(() => {
    //       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    //     }, 100);

    //   } catch (error: any) {
    //     console.error('Fee Defaulter Report Error:', error);
    //     toast.error(error.message || 'Failed to generate report');

    //     setReportData([]);
    //     setShowReport(true);
    //   } finally {
    //     setReportLoading(false);
    //     setLoading(false);
    //   }
    // };

    const filteredData = useMemo(() => {
        let rows = [...reportData]; // your reportData from API

        if (search) {
            rows = rows.filter((r) => r.feeGroup.toLowerCase().includes(search.toLowerCase()) || r.totalDue.toString().includes(search));
        }

        if (sortKey) {
            rows.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                if (typeof valA === 'string') {
                    return sortOrder === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
                }

                return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
            });
        }

        return rows;
    }, [reportData, search, sortKey, sortOrder]);

    const handleSort = (key: 'feeGroup' | 'totalDue') => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredData.map((r) => r.id));
        }
    };

    const totalBalance = filteredData.reduce((sum, r) => sum + r.totalDue, 0);
    const selectedBalance = filteredData.filter((r) => selectedIds.includes(r.id)).reduce((sum, r) => sum + r.totalDue, 0);

    const handleExportExcel = () => {
        const rowsToExport = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcel(rowsToExport, 'Defaulter_Report');
    };

    const handlePrint = () => {
        const rowsToPrint = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columns = ['feeGroup', 'totalDue']; // object keys
        const columnHeaders = ['Fee Group', 'Balance Amount']; // headers

        const printableRows = rowsToPrint.map((row) => ({
            feeGroup: row.feeGroup,
            totalDue: `₹${row.totalDue.toLocaleString('en-IN')}`
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalDue, 0);
        const sumRow = {
            feeGroup: 'Total',
            totalDue: `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columns, printableRows, sumRow);
    };

    watch('customGroupIds');

    const createPayload = (data: FormFields): FeeDefaulterReportPayload => {
        // Determine report type
        const reporttype = data.viewMode === 'Yearly Wise' ? 'year' : 'date';

        // Determine grouporterm based on breakdown
        let term_group: 'G' | 'T' = 'T'; // Default to term
        if (data.breakdown === 'FGW' || data.breakdown === 'FCW' || data.breakdown === 'FPW') {
            term_group = 'G'; // Group
        }

        // Prepare arrays
        const FMG_Ids = data.feeGroupIds || [];
        const FMT_Ids = data.termIds || [];
        const TRMR_Ids = data.busRouteIds || [];

        // Convert status to 1/0
        const active = data.status?.active ? 1 : 0;
        const deactive = data.status?.deactive ? 1 : 0;
        const left = data.status?.left ? 1 : 0;
        const Balance_1 = data.status?.balance ? 1 : 0;

        // Base payload
        const payload: FeeDefaulterReportPayload = {
            ASMAY_Id: Number(data.academicYearId),
            radioval: data.breakdown,
            reporttype,
            active,
            deactive,
            left,
            FMG_Ids,
            FMT_Ids,
            TRMR_Ids,
            term_group,
            Balance_1
        };

        // Set optional fields with defaults
        payload.FMG_Id = data.feeGroupIds?.[0] || 0;
        payload.FMGG_Id = data.customGroupIds?.[0] || 0;
        payload.FMT_Id = data.termIds?.[0] || 0;
        //payload.customflag = data.customGroupIds?.length > 0 ? 'true' : '';
        payload.customflag = '';
        payload.groupflag = data.feeGroupIds?.length > 0 ? 'true' : '';
        payload.Select_Button = data.userType;

        // Set class and section if included
        if (data.includeClassSection && data.classId) {
            payload.ASMCL_Id = data.classId;
            payload.AMSC_Id = data.sectionId || 0;
        } else {
            payload.ASMCL_Id = 0;
            payload.AMSC_Id = 0;
        }

        // Set route/bus info
        if (TRMR_Ids.length > 0) {
            payload.yearid = 1;
            // payload.TRMR_Id = data.busRouteIds[0]; // Uncomment if needed
        } else {
            payload.yearid = 0;
            // payload.TRMR_Id = 0;
        }

        // Conditional logic based on report type
        if (reporttype === 'year') {
            // Yearly Wise specific fields
            payload.studenttype = 'active'; // You might need to adjust this based on your logic
        } else if (reporttype === 'date') {
            // Date Wise specific fields
            if (filters.dueDate) {
                payload.From_Date = new Date(filters.dueDate).toDateString();
            }
            payload.duedate = data.dueDateType === 'Due Date' ? 1 : 0;
        }

        return payload;
    };

    const handleOpenEmailModal = () => {
        console.log('Button clicked, showEmailModal before:', showEmailModal);
        setshowEmailContent(true);
        // Check after a small delay
        setTimeout(() => {
            console.log('showEmailModal after:', showEmailModal);
        }, 100);
    };

    // Add these handler functions
    const handleSendNotification = () => {
        setShowNotificationModal(true);
        setTimeout(() => {
            console.log('showEmailModal after:', showEmailModal);
        }, 100);
    };

    const handleSendSMS = () => {
        setShowSMSModal(true);
        setTimeout(() => {
            console.log('showEmailModal after:', showEmailModal);
        }, 100);
    };

    // const handleSubmit = async () => {
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        const payload = createPayload(data);

        console.log('Sending payload:', JSON.stringify(payload));

        // Optional: Keep validation
        // if (!filters.academicYearId) return toast.error('Please select an Academic Year');
        // if (filters.feeGroupIds.length === 0) return toast.error('Please select at least one Fee Group');
        // if (filters.termIds.length === 0) return toast.error('Please select at least one Term');

        setReportLoading(true);
        setShowReport(false);

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // STATIC MOCK DATA - Looks 100% real!
        const mockData: IFeeDefaluterReport[] = [
            { feeGroup: 'Tuition Fee', totalDue: 12500, id: 1 },
            { feeGroup: 'Transport + Tuition', totalDue: 28500, id: 2 },
            { feeGroup: 'Annual Charges', totalDue: 8000, id: 3 },
            { feeGroup: 'Tuition Fee', totalDue: 15000, id: 4 },
            { feeGroup: 'Lab + Tuition', totalDue: 42000, id: 5 },
            { feeGroup: 'Transport Fee', totalDue: 18000, id: 6 },
            { feeGroup: 'Tuition Fee', totalDue: 12500, id: 7 },
            { feeGroup: 'All Fees', totalDue: 55000, id: 8 },
            { feeGroup: 'Exam Fee', totalDue: 5000, id: 9 },
            { feeGroup: 'Tuition Fee', totalDue: 11000, id: 10 },
            { feeGroup: 'Science Fee', totalDue: 15000, id: 11 },
            { feeGroup: 'Transport', totalDue: 20000, id: 12 },
            { feeGroup: 'Tuition + Lab', totalDue: 30000, id: 13 },
            { feeGroup: 'All Fees', totalDue: 68000, id: 14 },
            { feeGroup: 'Admission Fee', totalDue: 25000, id: 15 }
        ];

        //IStudentFeeDefaulterReport

        // Mock data generation function
        const generateMockStudentData = () => {
            const studentData: IStudentFeeDefaulterReport[] = [
                {
                    name: 'SAMAY V',
                    admissionNo: '78/2025-26',
                    classSection: 'IIC SEC',
                    fatherName: 'VINAY B',
                    mobileNumber: '9876543210',
                    emailId: 'samay@email.com',
                    route: 'Route A',
                    balanceAmount: 42000,
                    id: 1
                },
                {
                    name: 'THANUSHREE N R',
                    admissionNo: '89/2025-26',
                    classSection: 'IIC SEC',
                    fatherName: 'RENANAIAH N',
                    mobileNumber: '8765432109',
                    emailId: 'thanushree@email.com',
                    route: 'Route B',
                    balanceAmount: 62000,
                    id: 2
                },
                {
                    name: 'UMME SUFIYA D F',
                    admissionNo: '75/2025-26',
                    classSection: 'IIC SEC',
                    fatherName: 'MOHAMMED FAZLULLA D S',
                    mobileNumber: '7654321098',
                    emailId: 'sufiya@email.com',
                    route: 'Route C',
                    balanceAmount: 62000,
                    id: 3
                },
                {
                    name: 'VIDWATH A M',
                    admissionNo: '91/2025-26',
                    classSection: 'IIC SEC',
                    fatherName: 'ANUP M J',
                    mobileNumber: '6543210987',
                    emailId: 'vidwath@email.com',
                    route: 'Route A',
                    balanceAmount: 62000,
                    id: 4
                },
                {
                    name: 'VINAY E',
                    admissionNo: '90/2025-26',
                    classSection: 'IIC SEC',
                    fatherName: 'ERESHA B',
                    mobileNumber: '5432109876',
                    emailId: 'vinay@email.com',
                    route: 'Route B',
                    balanceAmount: 32000,
                    id: 5
                },
                {
                    name: 'SHAMANTH REDDY P S',
                    admissionNo: '64',
                    classSection: 'I Std A',
                    fatherName: 'SHASHIDHARA P V',
                    mobileNumber: '4321098765',
                    emailId: 'shamanth@email.com',
                    route: 'Route D',
                    balanceAmount: 24000,
                    id: 6
                },
                {
                    name: 'G P DHEERAJ',
                    admissionNo: '103',
                    classSection: 'I Std A',
                    fatherName: 'B PANDU',
                    mobileNumber: '3210987654',
                    emailId: 'dheeraj@email.com',
                    route: 'Route E',
                    balanceAmount: 24000,
                    id: 7
                },
                {
                    name: 'NIHARIKA C P',
                    admissionNo: '119',
                    classSection: 'I Std A',
                    fatherName: 'PALAKASHA C N',
                    mobileNumber: '2109876543',
                    emailId: 'niharikacp@email.com',
                    route: 'Route A',
                    balanceAmount: 24000,
                    id: 8
                },
                {
                    name: 'BHAVYA C',
                    admissionNo: '68/2025-26',
                    classSection: 'I Std A',
                    fatherName: 'CHANDRASHEKAR N',
                    mobileNumber: '9012345678',
                    emailId: 'bhavya@email.com',
                    route: 'Route C',
                    balanceAmount: 9300,
                    id: 9
                },
                {
                    name: 'CHIRANTH M',
                    admissionNo: '87/2025-26',
                    classSection: 'I Std A',
                    fatherName: 'MANJUNATH V',
                    mobileNumber: '8901234567',
                    emailId: 'chiranth@email.com',
                    route: 'Route D',
                    balanceAmount: 36000,
                    id: 10
                },
                {
                    name: 'DHANUSH KUMAR M',
                    admissionNo: '69/2025-26',
                    classSection: 'I Std A',
                    fatherName: 'MADHU V',
                    mobileNumber: '7890123456',
                    emailId: 'dhanush@email.com',
                    route: 'Route E',
                    balanceAmount: 16000,
                    id: 11
                },
                {
                    name: 'GAHAN REDDY B V',
                    admissionNo: '88/2025-26',
                    classSection: 'I Std A',
                    fatherName: 'VINAYA KUMAR B T',
                    mobileNumber: '6789012345',
                    emailId: 'gahan@email.com',
                    route: 'Route B',
                    balanceAmount: 36000,
                    id: 12
                },
                {
                    name: 'HAMSAT',
                    admissionNo: '70/2025-26',
                    classSection: 'I Std A',
                    fatherName: 'THIPPESWAMY N',
                    mobileNumber: '5678901234',
                    emailId: 'hamsat@email.com',
                    route: 'Route C',
                    balanceAmount: 12000,
                    id: 13
                },
                {
                    name: 'ARJUN KUMAR',
                    admissionNo: '85/2025-26',
                    classSection: 'II Std B',
                    fatherName: 'RAJESH KUMAR',
                    mobileNumber: '4567890123',
                    emailId: 'arjun@email.com',
                    route: 'Route A',
                    balanceAmount: 28000,
                    id: 14
                },
                {
                    name: 'PRIYA SHARMA',
                    admissionNo: '92/2025-26',
                    classSection: 'III Std C',
                    fatherName: 'SUNITA SHARMA',
                    mobileNumber: '3456789012',
                    emailId: 'priya@email.com',
                    route: 'Route D',
                    balanceAmount: 45000,
                    id: 15
                }
            ];

            const feeGroups = [
                'Tuition Fee',
                'Annual Charges',
                'Transport Fee',
                'Lab Fee',
                'Exam Fee',
                'Sports Fee',
                'Library Fee',
                'Development Fee',
                'Computer Fee',
                'Medical Fee',
                'Activity Fee',
                'Bus Fee',
                'Uniform Fee',
                'Book Fee',
                'Miscellaneous'
            ];

            return studentData.map((student, index) => {
                const fineAmount = Math.round(student.balanceAmount * (0.1 + Math.random() * 0.1));
                const totalAmount = student.balanceAmount + fineAmount;

                return {
                    id: index + 1,
                    slNo: index + 1,
                    name: student.name,
                    admissionNo: student.admissionNo,
                    classSection: student.classSection,
                    fatherName: student.fatherName,
                    mobileNumber: student.mobileNumber,
                    emailId: student.emailId,
                    route: student.route,
                    balanceAmount: student.balanceAmount,
                    fineAmount: fineAmount,
                    totalAmount: totalAmount,
                    feeGroup: feeGroups[index] || 'General Fee',
                    totalDue: student.balanceAmount, // For backward compatibility
                    remarks: '' // Empty remarks for now
                };
            });
        };

        if (data.userType === 'Students') {
            const mockData = generateMockStudentData();
            setstudentReportData(mockData);
            setShowReport(true);
            setReportLoading(false);
            setLoading(false);

            toast.success(`Student report generated successfully! Found ${mockData.length} defaulters`);
        } else {
            setReportData(mockData);
            setShowReport(true);
            setReportLoading(false);
            setLoading(false);

            toast.success(`Report generated successfully! Found ${mockData.length} defaulters`);
        }

        // Auto scroll to report
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    // const isAcademicYearSelected = !!filters.academicYearId;
    const isAcademicYearSelected = watch('academicYearId');
    const isClassSectionEnabled = filters.includeClassSection;
    const showDateSection = filters.viewMode === 'Date Wise';
    const showBalancecheckbox = filters.userType === 'Students' && filters.breakdown === 'Student/Staff Wise';

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <h1 className='mb-8 font-bold text-3xl text-gray-900'>Fee Defaulter Report</h1>

                            <div className='space-y-8'>
                                {/* User Type Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        {(['Students', 'Staff', 'Others'] as const).map((type) => (
                                            <label key={type} className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='userType'
                                                    checked={filters.userType === type}
                                                    onChange={() => setFilters((prev) => ({ ...prev, userType: type }))}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-base'>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Card>

                                {/* View Mode + Academic Year */}
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex items-center gap-10'>
                                            {(['Yearly Wise', 'Date Wise'] as const).map((mode) => (
                                                <label key={mode} className='flex cursor-pointer items-center gap-3'>
                                                    <input
                                                        type='radio'
                                                        name='viewMode'
                                                        checked={filters.viewMode === mode}
                                                        onChange={() => setFilters((prev) => ({ ...prev, viewMode: mode }))}
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-base'>{mode}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>

                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        {/* <Select
                                            value={filters.academicYearId}
                                            onValueChange={(val) => setFilters((prev) => ({ ...prev, academicYearId: val }))}
                                            disabled={loadingAcademic}>
                                            <SelectTrigger className='w-full min-w-[300px]'>
                                                <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select> */}
                                        <Controller
                                            name='academicYearId'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString()}
                                                    onValueChange={(v) => {
                                                        const num = Number(v);
                                                        field.onChange(num);
                                                    }}>
                                                    <SelectTrigger className='w-full text-center'>
                                                        <SelectValue placeholder='--Select Academic Year--' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears?.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && (
                                            <FormError className='mt-1'>{errors.academicYearId.message}</FormError>
                                        )}{' '}
                                    </div>
                                </div>

                                {/* Breakdown By Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    {/* <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
                                        {[
                                            'Fee Group Wise',
                                            'Fee Head Wise',
                                            'Class Wise',
                                            'Installment Wise',
                                            'Student/Staff Wise',
                                            'Parent Wise'
                                        ].map((option) => (
                                            <label key={option} className='flex cursor-pointer items-center gap-3'>
                                                <input
                                                    type='radio'
                                                    name='breakdown'
                                                    checked={filters.breakdown === option}
                                                    onChange={() => setFilters((prev) => ({ ...prev, breakdown: option }))}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-sm'>{option}</span>
                                            </label>
                                        ))}
                                    </div> */}

                                    <div className='grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6'>
                                        <Controller
                                            name='breakdown'
                                            control={control}
                                            render={({ field }) => (
                                                <>
                                                    {breakdownOptions.map((option) => (
                                                        <Label key={option.value} className='flex cursor-pointer items-center gap-3'>
                                                            <Input
                                                                type='radio'
                                                                name={field.name}
                                                                value={option.value}
                                                                checked={field.value === option.value}
                                                                onChange={() => {
                                                                    field.onChange(option.value);
                                                                }}
                                                                className='h-5 w-5 text-primary'
                                                            />
                                                            <span>{option.label}</span>
                                                        </Label>
                                                    ))}
                                                </>
                                            )}
                                        />
                                    </div>
                                </Card>

                                {/* Multi-select Filters with Select All */}
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                    {/* Custom Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Custom Group<span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={
                                                            customGroups.length > 0 && filters.customGroupIds.length === customGroups.length
                                                        }
                                                        indeterminate={
                                                            filters.customGroupIds.length > 0 &&
                                                            filters.customGroupIds.length < customGroups.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllCustomGroups(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingCustomGroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : customGroups.length > 0 ? (
                                                    customGroups.map((group) => (
                                                       
                                                        <label
                                                            key={group.fmgG_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.customGroupIds.includes(group.fmgG_Id)}
                                                                onCheckedChange={() => toggleCustomGroup(group.fmgG_Id)}
                                                            />
                                                            <span className='font-medium text-sm'>{group.fmgG_GroupName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                )}
                                            </div> */}
                                            <Controller
                                                name='customGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = customGroups.map((g) => g.fmgG_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('customGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />

                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingCustomGroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : customGroups.length > 0 ? (
                                                                customGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmgG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmgG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmgG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmgG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('customGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />

                                                                            <span className='font-medium text-sm'>
                                                                                {group.fmgG_GroupName}
                                                                            </span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.customGroupIds && <FormError>{errors.customGroupIds.message}</FormError>}
                                    </div>

                                    {/* Fee Group */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Fee Group <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeGroups.length > 0 && filters.feeGroupIds.length === feeGroups.length}
                                                        indeterminate={
                                                            filters.feeGroupIds.length > 0 && filters.feeGroupIds.length < feeGroups.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllFeeGroups(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingfeegroup ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeGroups.length > 0 ? (
                                                    feeGroups.map((group) => (
                                                        
                                                        <label
                                                            key={group.fmG_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.feeGroupIds.includes(group.fmG_Id)}
                                                                onCheckedChange={() => toggleFeeGroup(group.fmG_Id)}
                                                            />
                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                )}
                                            </div> */}
                                            <Controller
                                                name='feeGroupIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeGroups.map((g) => g.fmG_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('feeGroupIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeegroup ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeGroups.length > 0 ? (
                                                                feeGroups.map((group) => {
                                                                    const checked = selectedIds.includes(group.fmG_Id);

                                                                    return (
                                                                        <Label
                                                                            key={group.fmG_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, group.fmG_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== group.fmG_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('feeGroupIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{group.fmG_GroupName}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                                    </div>

                                    {/* Term */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Term Name <span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                               
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeTerms.length > 0 && filters.termIds.length === feeTerms.length}
                                                        indeterminate={filters.termIds.length > 0 && filters.termIds.length < feeTerms.length}
                                                        onCheckedChange={(checked: any) => selectAllTerms(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingfeeterm ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeTerms.length > 0 ? (
                                                    feeTerms.map((term) => (
                                                       
                                                        <label
                                                            key={term.fmT_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.termIds.includes(term.fmT_Id)}
                                                                onCheckedChange={() => toggleTerm(term.fmT_Id)}
                                                            />
                                                            <span className='text-sm'>{term.fmT_Name}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No terms</div>
                                                )}
                                            </div> */}

                                            <Controller
                                                name='termIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeTerms.map((t) => t.fmT_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('termIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingfeeterm ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeTerms.length > 0 ? (
                                                                feeTerms.map((term) => {
                                                                    const checked = selectedIds.includes(term.fmT_Id);

                                                                    return (
                                                                        <Label
                                                                            key={term.fmT_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, term.fmT_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== term.fmT_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('termIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{term.fmT_Name}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No terms</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                        {errors.termIds && <FormError>{errors.termIds.message}</FormError>}
                                    </div>

                                    {/* Bus Route */}
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>Bus Route</Label>
                                        <Card className='border bg-gray-50 p-4'>
                                            {/* <div className='max-h-64 space-y-3 overflow-y-auto'>
                                             
                                                <label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                    <Checkbox
                                                        checked={feeBusRoutes.length > 0 && filters.busRouteIds.length === feeBusRoutes.length}
                                                        indeterminate={
                                                            filters.busRouteIds.length > 0 && filters.busRouteIds.length < feeBusRoutes.length
                                                        }
                                                        onCheckedChange={(checked: any) => selectAllBusRoutes(!!checked)}
                                                    />
                                                    <span>Select All</span>
                                                </label>

                                                {loadingBusRoutes ? (
                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                ) : feeBusRoutes.length > 0 ? (
                                                    feeBusRoutes.map((route) => (
                                                       
                                                        <label
                                                            key={route.trmR_Id}
                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'
                                                        >
                                                            <Checkbox
                                                                checked={filters.busRouteIds.includes(route.trmR_Id)}
                                                                onCheckedChange={() => toggleBusRoute(route.trmR_Id)}
                                                            />
                                                            <span className='text-sm'>{route.trmR_RouteName}</span>
                                                        </label>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-gray-500'>No bus routes</div>
                                                )}
                                            </div> */}

                                            <Controller
                                                name='busRouteIds'
                                                control={control}
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    const allIds = feeBusRoutes.map((r) => r.trmR_Id);

                                                    const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

                                                    return (
                                                        <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                            {/* SELECT ALL */}
                                                            <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                <Checkbox
                                                                    checked={isAllSelected}
                                                                    indeterminate={isIndeterminate}
                                                                    onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                        const value = checked === true ? allIds : [];

                                                                        field.onChange(value);
                                                                        setValue('busRouteIds', value, {
                                                                            shouldValidate: true,
                                                                            shouldDirty: true,
                                                                            shouldTouch: true
                                                                        });
                                                                    }}
                                                                />
                                                                <span>Select All</span>
                                                            </Label>

                                                            {/* LOADING */}
                                                            {loadingBusRoutes ? (
                                                                <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                            ) : feeBusRoutes.length > 0 ? (
                                                                feeBusRoutes.map((route) => {
                                                                    const checked = selectedIds.includes(route.trmR_Id);

                                                                    return (
                                                                        <Label
                                                                            key={route.trmR_Id}
                                                                            className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                            <Checkbox
                                                                                checked={checked}
                                                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                                    const value =
                                                                                        checked === true
                                                                                            ? [...selectedIds, route.trmR_Id]
                                                                                            : selectedIds.filter(
                                                                                                  (id) => id !== route.trmR_Id
                                                                                              );

                                                                                    field.onChange(value);
                                                                                    setValue('busRouteIds', value, {
                                                                                        shouldValidate: true,
                                                                                        shouldDirty: true,
                                                                                        shouldTouch: true
                                                                                    });
                                                                                }}
                                                                            />
                                                                            <span className='text-sm'>{route.trmR_RouteName}</span>
                                                                        </Label>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className='py-4 text-center text-gray-500'>No bus routes</div>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </Card>
                                    </div>
                                </div>

                                {/* Class & Section + Status + Date (Date section is conditional) */}
                                <div className='space-y-6 border-t pt-8'>
                                    <div className='flex flex-wrap items-center gap-6'>
                                        <div className='flex items-center gap-3'>
                                            {/* <Checkbox
                                                id='includeClass'
                                                checked={filters.includeClassSection}
                                                onCheckedChange={(checked: any) => {
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        includeClassSection: !!checked,
                                                     
                                                        classId: !!checked ? prev.classId : 0,
                                                        
                                                        sectionId: !!checked ? prev.sectionId : 0
                                                    }));
                                                    if (!checked) setSections([]);
                                                }}
                                                disabled={!isAcademicYearSelected}
                                            /> */}

                                            <Checkbox
                                                id='includeClass'
                                                checked={filters.includeClassSection}
                                                onCheckedChange={(checked: any) => {
                                                    const value = !!checked;

                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        includeClassSection: value,
                                                        classId: value ? prev.classId : 0,
                                                        sectionId: value ? prev.sectionId : 0
                                                    }));

                                                    // 🔑 THIS IS THE KEY
                                                    setValue('includeClassSection', value, {
                                                        shouldValidate: true
                                                    });

                                                    if (!value) {
                                                        setValue('classId', 0);
                                                        setValue('sectionId', 0);
                                                        setSections([]);
                                                    }
                                                }}
                                                disabled={!isAcademicYearSelected}
                                            />

                                            <Label htmlFor='includeClass' className='cursor-pointer font-medium'>
                                                Class
                                            </Label>
                                        </div>

                                        <div className='w-1/2'>
                                            {/* <Select
                                                value={filters.classId === 0 ? '' : String(filters.classId)}
                                                onValueChange={(val) => {
                                                    const id = Number(val);
                                                    setFilters((prev) => ({ ...prev, classId: id, sectionId: 0 }));
                                                }}
                                                disabled={!isClassSectionEnabled || loadingClasses}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={loadingClasses ? 'Loading classes...' : 'Select Class'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select> */}
                                            <Controller
                                                name='classId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value ? field.value.toString() : ''}
                                                        onValueChange={(v) => {
                                                            const num = Number(v);
                                                            field.onChange(num);

                                                            // 🔑 Trigger validation
                                                            setValue('classId', num, { shouldValidate: true });
                                                            setValue('sectionId', 0, { shouldValidate: true });
                                                        }}
                                                        disabled={!isClassSectionEnabled || loadingClasses}>
                                                        <SelectTrigger className='w-full text-center'>
                                                            <SelectValue placeholder='--Select Class--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {classes.map((cls) => (
                                                                <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                                    {cls.asmcL_ClassName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />

                                            {errors.classId && <FormError className='mt-1'>{errors.classId.message}</FormError>}
                                        </div>

                                        {filters.includeClassSection && (
                                            <>
                                                <div className='flex items-center gap-2'>
                                                    <Label className='font-medium'>Section</Label>
                                                    <span className='text-red-500'>*</span>
                                                </div>

                                                <div className='min-w-[220px] flex-1'>
                                                    {/* <Select
                                                value={filters.sectionId === 0 ? '' : String(filters.sectionId)}
                                                onValueChange={(val) => setFilters((prev) => ({ ...prev, sectionId: Number(val) }))}
                                                disabled={!isClassSectionEnabled || !filters.classId || loadingSections}>
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            !filters.classId
                                                                ? 'Select Class first'
                                                                : loadingSections
                                                                    ? 'Loading sections...'
                                                                    : 'Select Section'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select> */}
                                                    <Controller
                                                        name='sectionId'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ? field.value.toString() : ''}
                                                                onValueChange={(v) => {
                                                                    const num = Number(v);
                                                                    field.onChange(num);

                                                                    // 🔑 Trigger validation
                                                                    setValue('sectionId', num, { shouldValidate: true });
                                                                }}
                                                                disabled={!isClassSectionEnabled || loadingClasses}
                                                                // disabled={!isClassSectionEnabled || !filters.classId || loadingSections}
                                                            >
                                                                <SelectTrigger className='w-full text-center'>
                                                                    <SelectValue
                                                                        placeholder='--Select Section--'
                                                                        // placeholder={
                                                                        //     !filters.classId
                                                                        //         ? 'Select Class first'
                                                                        //         : loadingSections
                                                                        //             ? 'Loading sections...'
                                                                        //             : 'Select Section'
                                                                        // }
                                                                    />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {sections.map((sec) => (
                                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                                            {sec.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />

                                                    {errors.sectionId && <FormError className='mt-1'>{errors.sectionId.message}</FormError>}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className='flex flex-wrap items-center justify-between gap-6'>
                                        <div className='flex flex-wrap items-center gap-8'>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.formatI}
                                                    onCheckedChange={(c: any) => setFilters((prev) => ({ ...prev, formatI: !!c }))}
                                                />
                                                <Label className='cursor-pointer'>Format-I</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox checked={filters.status.active} onCheckedChange={() => toggleStatus('active')} />
                                                <Label className='cursor-pointer'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.status.deactive}
                                                    onCheckedChange={() => toggleStatus('deactive')}
                                                />
                                                <Label className='cursor-pointer'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Checkbox checked={filters.status.left} onCheckedChange={() => toggleStatus('left')} />
                                                <Label className='cursor-pointer'>Left</Label>
                                            </div>

                                            {showBalancecheckbox && (
                                                <div className='flex items-center gap-3'>
                                                    <Checkbox
                                                        checked={filters.status.balance}
                                                        onCheckedChange={() => toggleStatus('balance')}
                                                    />
                                                    <Label className='cursor-pointer'>Balance</Label>
                                                </div>
                                            )}

                                            <div className='flex items-center gap-3'>
                                                <Checkbox
                                                    checked={filters.bulkDownload}
                                                    onCheckedChange={(c: any) => setFilters((prev) => ({ ...prev, bulkDownload: !!c }))}
                                                />
                                                <Label className='cursor-pointer'>Bulk Download</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date section - ONLY shown when Date Wise is selected */}
                                    {showDateSection && (
                                        <div className='fade-in flex animate-in flex-wrap items-center gap-6 duration-300'>
                                            <Label className='min-w-32 font-medium'>
                                                Date <span className='text-red-500'>*</span>
                                            </Label>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {format(filters.dueDate, 'dd-MM-yyyy')}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={filters.dueDate}
                                                        onSelect={(date) => date && setFilters((prev) => ({ ...prev, dueDate: date }))}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <Card className='border bg-gray-50 p-4 shadow-sm'>
                                                <div className='flex items-center gap-10'>
                                                    <label className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            name='dueDateType'
                                                            checked={filters.dueDateType === 'Due Date'}
                                                            onChange={() => setFilters((prev) => ({ ...prev, dueDateType: 'Due Date' }))}
                                                            className='h-4 w-4 text-primary'
                                                        />
                                                        <span className='font-medium'>Due Date</span>
                                                    </label>
                                                    <label className='flex cursor-pointer items-center gap-3'>
                                                        <input
                                                            type='radio'
                                                            name='dueDateType'
                                                            checked={filters.dueDateType === 'Till Due Date'}
                                                            onChange={() =>
                                                                setFilters((prev) => ({ ...prev, dueDateType: 'Till Due Date' }))
                                                            }
                                                            className='h-4 w-4 text-primary'
                                                        />
                                                        <span className='font-medium'>Till Due Date</span>
                                                    </label>
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {/* <div className="flex justify-end gap-4 pt-8 border-t">
                <Button size="lg" variant="outline" className="px-8" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button
                  size="lg"
                  className="px-10"
                  onClick={handleSubmit}
                  disabled={loading || !filters.academicYearId || filters.feeGroupIds.length === 0 || filters.termIds.length === 0}
                >
                  {loading ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </div> */}

                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        {/* 
                                    <Button
                                        size='lg'
                                        className='px-12'
                                        onClick={handleSubmit}
                                        disabled={
                                            reportLoading ||
                                            !filters.academicYearId ||
                                            filters.feeGroupIds.length === 0 ||
                                            filters.termIds.length === 0
                                        }>
                                        {reportLoading ? (
                                            <>
                                                <div className='mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                                                Generating Report...
                                            </>
                                        ) : (
                                            'Generate Report'
                                        )}
                                    </Button> */}

                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                        {/* <Button
                                            size='lg'
                                            variant='secondary'
                                            className='bg-green-600 px-10 font-medium text-white hover:bg-green-700'
                                            onClick={() => exportToExcel(reportData, 'Fee_Defaulter_Report')}
                                            disabled={reportLoading || reportData.length === 0}>
                                            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                                                <path d='M4 4h12v2H4V4zm0 4h12v8H4V8zm2 2v4h8v-4H6z' />
                                                <path d='M13.5 10l-3-3-3 3h2v4h2v-4h2z' />
                                            </svg>
                                            Export to Excel
                                        </Button> */}
                                    </div>

                                    {/* ==================== REPORT SECTION ==================== */}
                                    {/* ==================== REPORT SECTION ==================== */}
                                    {showReport && (
                                        <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                            {/* Loading State */}
                                            {reportLoading ? (
                                                <div className='p-24 text-center'>
                                                    <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    <p className='mt-6 text-lg text-muted-foreground'>Generating report, please wait...</p>
                                                </div>
                                            ) : (
                                                /* Table Inside CollapsibleSection */
                                                <CollapsibleSection
                                                    defaultOpen={true}
                                                    variant='default'
                                                    size='lg'
                                                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                    {/* <div className='border-b bg-primary/5 px-8 py-6'>
                                                        <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                        <div className='mb-4 flex justify-end gap-2'>
                                                            <Button
                                                                size='sm'
                                                                className='h-8 w-auto px-3 text-xs'
                                                                onClick={handleExportExcel}>
                                                                Export Excel
                                                            </Button>

                                                            <Button
                                                                size='sm'
                                                                variant='outline'
                                                                className='h-8 w-auto px-3 text-xs'
                                                                onClick={handlePrint}>
                                                                Print
                                                            </Button>
                                                        </div>
                                                    </div> */}

                                                    <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                        {/* <h2 className='font-bold text-blue-700 text-xl'>Fee Audit Report</h2> */}
                                                        <div className='mb-6 text-center'>
                                                            <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                            {/* <div className="mt-1 text-sm text-gray-600">
                                                                    From {formatDate(fromDate)} To {formatDate(toDate)}
                                                                </div> */}
                                                        </div>
                                                        <div className='flex gap-3'>
                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                <Button
                                                                    size='sm'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handleExportExcel}>
                                                                    Export Excel
                                                                </Button>

                                                                <Button
                                                                    size='sm'
                                                                    variant='outline'
                                                                    className='h-8 w-auto px-3 text-xs'
                                                                    onClick={handlePrint}>
                                                                    Print
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {selectedIds.length > 0 && (
                                                            <div className='mb-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm'>
                                                                {/* Checkboxes Section */}
                                                                <div className='mb-3'>
                                                                    <div className='flex items-center gap-2 font-medium text-gray-700 text-sm'>
                                                                        <span>Please Select Check Box For:</span>
                                                                        <div className='ml-2 flex items-center gap-4'>
                                                                            <div className='flex items-center gap-1.5'>
                                                                                <Checkbox
                                                                                    id='email-checkbox'
                                                                                    checked={communicationMethods.email}
                                                                                    onCheckedChange={() =>
                                                                                        toggleCommunicationMethod('email')
                                                                                    }
                                                                                    className='h-4 w-4'
                                                                                />
                                                                                <Label
                                                                                    htmlFor='email-checkbox'
                                                                                    className='cursor-pointer text-sm'>
                                                                                    EMAIL
                                                                                </Label>
                                                                            </div>

                                                                            <div className='flex items-center gap-1.5'>
                                                                                <Checkbox
                                                                                    id='sms-checkbox'
                                                                                    checked={communicationMethods.sms}
                                                                                    onCheckedChange={() => toggleCommunicationMethod('sms')}
                                                                                    className='h-4 w-4'
                                                                                />
                                                                                <Label
                                                                                    htmlFor='sms-checkbox'
                                                                                    className='cursor-pointer text-sm'>
                                                                                    SMS
                                                                                </Label>
                                                                            </div>

                                                                            <div className='flex items-center gap-1.5'>
                                                                                <Checkbox
                                                                                    id='notification-checkbox'
                                                                                    checked={communicationMethods.notification}
                                                                                    onCheckedChange={() =>
                                                                                        toggleCommunicationMethod('notification')
                                                                                    }
                                                                                    className='h-4 w-4'
                                                                                />
                                                                                <Label
                                                                                    htmlFor='notification-checkbox'
                                                                                    className='cursor-pointer text-sm'>
                                                                                    Notification
                                                                                </Label>
                                                                            </div>

                                                                            <div className='flex items-center gap-1.5'>
                                                                                <Checkbox
                                                                                    id='whatsapp-checkbox'
                                                                                    checked={communicationMethods.whatsapp}
                                                                                    onCheckedChange={() =>
                                                                                        toggleCommunicationMethod('whatsapp')
                                                                                    }
                                                                                    className='h-4 w-4'
                                                                                />
                                                                                <Label
                                                                                    htmlFor='whatsapp-checkbox'
                                                                                    className='cursor-pointer text-sm'>
                                                                                    WhatsApp
                                                                                </Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* REQUEST Button - Only shown when EMAIL is checked */}
                                                                {communicationMethods.email &&
                                                                    !communicationMethods.sms &&
                                                                    !communicationMethods.notification && (
                                                                        <div className='mt-3 flex justify-end'>
                                                                            <Button
                                                                                size='sm'
                                                                                className='h-8 px-6 text-xs'
                                                                                onClick={handleOpenEmailModal}>
                                                                                REQUEST
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                {communicationMethods.notification &&
                                                                    !communicationMethods.email &&
                                                                    !communicationMethods.sms && (
                                                                        <div className='mt-3 flex justify-end'>
                                                                            <Button
                                                                                size='sm'
                                                                                className='h-8 px-6 text-xs'
                                                                                onClick={handleSendNotification}
                                                                                //  onClick={() => setShowNotificationModal(true)}
                                                                            >
                                                                                REQUEST
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                {communicationMethods.sms &&
                                                                    !communicationMethods.email &&
                                                                    !communicationMethods.notification && (
                                                                        <div className='mt-3 flex justify-end'>
                                                                            <Button
                                                                                size='sm'
                                                                                className='h-8 px-6 text-xs'
                                                                                onClick={handleSendSMS}
                                                                                //onClick={() => setShowSMSModal(true)}
                                                                            >
                                                                                REQUEST
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* <div className='mb-6 text-center'>
                                                      
                                                                          
                                                                            <div className='mb-4 flex justify-end gap-2'>
                                                                                <Button size='sm' className='h-8 w-auto px-3 text-xs' onClick={handleExportExcel}>
                                                                                    Export Excel
                                                                                </Button>
                                                    
                                                                                <Button size='sm' variant='outline' className='h-8 w-auto px-3 text-xs' onClick={handlePrint}>
                                                                                    Print
                                                                                </Button>
                                                                            </div>
                                                                        </div> */}
                                                    {/* <GenericDataTable<IFeeAuditReport>
                                                        columns={feeDefaulterReportColumns}
                                                        data={reportData}
                                                        isLoading={reportLoading}
                                                        isPaginationRequired={false}
                                                    /> */}

                                                    {/* <FeeDefaulterCustomTable
                                                        data={reportData}
                                                        isLoading={reportLoading}
                                                    /> */}

                                                    <div>
                                                        {/* Search */}
                                                        <input
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            placeholder='Search...'
                                                            className='w-72 rounded border px-3 py-2'
                                                        />

                                                        {/* Table */}
                                                        {filters.userType !== 'Students' && (
                                                            <div className='overflow-x-auto border'>
                                                                <table className='w-full table-auto border-collapse'>
                                                                    <thead className='bg-primary text-white'>
                                                                        <tr>
                                                                            <th className='p-2 text-center'>
                                                                                <Checkbox
                                                                                    checked={
                                                                                        selectedIds.length === filteredData.length &&
                                                                                        filteredData.length > 0
                                                                                    }
                                                                                    indeterminate={
                                                                                        selectedIds.length > 0 &&
                                                                                        selectedIds.length < filteredData.length
                                                                                    }
                                                                                    onCheckedChange={toggleAll}
                                                                                />
                                                                            </th>
                                                                            <th className='p-2 text-center'>Sl No</th>
                                                                            <th
                                                                                className='cursor-pointer p-2 text-center'
                                                                                onClick={() => handleSort('feeGroup')}>
                                                                                Group Name{' '}
                                                                                {sortKey === 'feeGroup' &&
                                                                                    (sortOrder === 'asc' ? '↑' : '↓')}
                                                                            </th>
                                                                            <th
                                                                                className='cursor-pointer p-2 text-center'
                                                                                onClick={() => handleSort('totalDue')}>
                                                                                Balance Amount{' '}
                                                                                {sortKey === 'totalDue' &&
                                                                                    (sortOrder === 'asc' ? '↑' : '↓')}
                                                                            </th>
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {filteredData.map((row, index) => (
                                                                            <tr key={row.id} className='border-b'>
                                                                                <td className='p-2 text-center'>
                                                                                    <Checkbox
                                                                                        checked={selectedIds.includes(row.id)}
                                                                                        onCheckedChange={() => toggleRow(row.id)}
                                                                                    />
                                                                                </td>
                                                                                <td className='p-2 text-center font-medium'>{index + 1}</td>
                                                                                <td className='p-2 text-center font-medium'>
                                                                                    {row.feeGroup}
                                                                                </td>
                                                                                <td className='p-2 text-center font-bold'>
                                                                                    ₹{row.totalDue.toLocaleString('en-IN')}
                                                                                </td>
                                                                            </tr>
                                                                        ))}

                                                                        {/* Total */}
                                                                        <tr className='bg-gray-100 font-bold'>
                                                                            <td />
                                                                            <td />
                                                                            <td className='p-2 text-center'>Total</td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{totalBalance.toLocaleString('en-IN')}
                                                                            </td>
                                                                        </tr>

                                                                        {/* Selected Total */}
                                                                        <tr className='bg-gray-200 font-bold'>
                                                                            <td />
                                                                            <td />
                                                                            <td className='p-2 text-center'>Selected Balance</td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{selectedBalance.toLocaleString('en-IN')}
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                        {filters.userType === 'Students' && studentreportData.length > 0 && (
                                                            <div className='overflow-x-auto border'>
                                                                <table className='w-full table-auto border-collapse'>
                                                                    <thead className='bg-primary text-white'>
                                                                        <tr>
                                                                            <th className='p-2 text-center'>
                                                                                <Checkbox
                                                                                    checked={
                                                                                        selectedIds.length === reportData.length &&
                                                                                        reportData.length > 0
                                                                                    }
                                                                                    indeterminate={
                                                                                        selectedIds.length > 0 &&
                                                                                        selectedIds.length < studentreportData.length
                                                                                    }
                                                                                    onCheckedChange={toggleAll}
                                                                                />
                                                                            </th>
                                                                            <th className='p-2 text-center'>Sl No</th>
                                                                            <th className='p-2 text-center'>Name</th>
                                                                            <th className='p-2 text-center'>Admission No</th>
                                                                            <th className='p-2 text-center'>Class & Section</th>
                                                                            <th className='p-2 text-center'>Father Name</th>
                                                                            <th className='p-2 text-center'>Mobile Number</th>
                                                                            <th className='p-2 text-center'>Email ID</th>
                                                                            <th className='p-2 text-center'>Route</th>
                                                                            <th className='p-2 text-center'>Balance Amount</th>
                                                                            {/* <th className='p-2 text-center'>Fine Amount</th>
                                                                            <th className='p-2 text-center'>Total Amount</th>
                                                                            <th className='p-2 text-center'>Fee Group</th> */}
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {studentreportData.map((row, index) => (
                                                                            <tr key={row.id} className='border-b hover:bg-gray-50'>
                                                                                <td className='p-2 text-center'>
                                                                                    <Checkbox
                                                                                        checked={selectedIds.includes(row.id)}
                                                                                        onCheckedChange={() => toggleRow(row.id)}
                                                                                    />
                                                                                </td>
                                                                                <td className='p-2 text-center font-medium'>{index + 1}</td>
                                                                                <td className='p-2 text-center font-medium'>{row.name}</td>
                                                                                <td className='p-2 text-center'>{row.admissionNo}</td>
                                                                                <td className='p-2 text-center'>{row.classSection}</td>
                                                                                <td className='p-2 text-center'>{row.fatherName}</td>
                                                                                <td className='p-2 text-center'>{row.mobileNumber}</td>
                                                                                <td className='p-2 text-center'>{row.emailId}</td>
                                                                                <td className='p-2 text-center'>{row.route}</td>
                                                                                <td className='p-2 text-center font-bold'>
                                                                                    ₹{row.balanceAmount.toLocaleString('en-IN')}
                                                                                </td>
                                                                                {/* <td className='p-2 text-center font-bold text-red-600'>
                                                                                    ₹{row.fineAmount.toLocaleString('en-IN')}
                                                                                </td> */}
                                                                                {/* <td className='p-2 text-center font-bold text-green-700'>
                                                                                    ₹{row.totalAmount.toLocaleString('en-IN')}
                                                                                </td>
                                                                                <td className='p-2 text-center'>{row.feeGroup}</td> */}
                                                                            </tr>
                                                                        ))}

                                                                        {/* Totals Row */}
                                                                        {/* <tr className='bg-gray-100 font-bold'>
                                                                            <td colSpan={9} className='p-2 text-center'>Total</td>
                                                                            <td className='p-2 text-center'>
                                                                                ₹{reportData.reduce((sum, r) => sum + r.balanceAmount, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className='p-2 text-center text-red-600'>
                                                                                ₹{reportData.reduce((sum, r) => sum + r.fineAmount, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td className='p-2 text-center text-green-700'>
                                                                                ₹{reportData.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('en-IN')}
                                                                            </td>
                                                                            <td></td>
                                                                        </tr> */}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CollapsibleSection>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Email Configuration Modal */}
                <Dialog open={showemailContent === true} onOpenChange={setshowEmailContent}>
                    <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                        <DialogHeader>
                            <DialogTitle className='font-bold text-2xl'>Email Configuration</DialogTitle>
                        </DialogHeader>

                        <div className='space-y-6'>
                            {/* Email Template Selection */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Email Template:</Label>
                                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='-Select-' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='fee_reminder'>Fee Reminder Template</SelectItem>
                                        <SelectItem value='default_alert'>Default Alert Template</SelectItem>
                                        <SelectItem value='custom'>Custom Template</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Email Subject */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Subject:</Label>
                                <Input
                                    type='text'
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder='Enter email subject'
                                    className='w-full'
                                />
                            </div>

                            {/* Email Content */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Email Content:</Label>
                                <Textarea
                                    value={emailContent}
                                    onChange={(e) => setEmailContent(e.target.value)}
                                    placeholder='Enter email content here...'
                                    className='min-h-[200px]'
                                />
                            </div>

                            {/* Template Preview Section */}
                            <div className='rounded-lg border p-4'>
                                <h3 className='mb-3 font-bold text-lg'>Template Preview:</h3>
                                <div className='rounded bg-gray-50 p-4'>
                                    <p className='text-gray-700'>Thank You</p>
                                    <div className='mt-4 rounded border bg-white p-3'>
                                        <p className='mb-2 font-semibold'>Selected Students:</p>
                                        <ul className='list-disc space-y-1 pl-5'>
                                            {studentreportData
                                                .filter((student) => selectedIds.includes(student.id))
                                                .slice(0, 5) // Show only first 5 for preview
                                                .map((student) => (
                                                    <li key={student.id} className='text-sm'>
                                                        {student.name} - ₹{student.balanceAmount.toLocaleString('en-IN')}
                                                    </li>
                                                ))}
                                            {selectedIds.length > 5 && (
                                                <li className='font-semibold text-sm'>...and {selectedIds.length - 5} more students</li>
                                            )}
                                        </ul>
                                        <p className='mt-3 font-semibold'>
                                            Total Balance: ₹{calculateTotals().totalBalance.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div>
                                <Input type='text' placeholder='Type here to search' className='w-full' />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-end gap-3 pt-4'>
                                <Button variant='outline' onClick={() => setShowEmailModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSendEmail} className='bg-green-600 hover:bg-green-700'>
                                    Send Email
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Notification Configuration Modal */}
                <Dialog open={showNotificationModal === true} onOpenChange={setShowNotificationModal}>
                    <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                        <div className='space-y-6'>
                            <div className='text-center'>
                                <h4 className='mb-2 font-bold text-red-600 text-xl'>SELECTED DEFAULTER LIST !!!</h4>
                                <p className='font-bold text-gray-700'>NOTE : Notification Will Trigger For The Same</p>
                            </div>

                            {/* Defaulters Table */}
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full table-auto border-collapse'>
                                    <thead className='bg-primary text-white'>
                                        <tr>
                                            <th className='border p-3 text-center'>Sl No</th>
                                            <th className='border p-3 text-center'>Name</th>
                                            <th className='border p-3 text-center'>Admission No</th>
                                            <th className='border p-3 text-center'>Class : Section</th>
                                            <th className='border p-3 text-center'>Father Name</th>
                                            <th className='border p-3 text-center'>Mobile Number</th>
                                            <th className='border p-3 text-center'>Email-Id</th>
                                            <th className='border p-3 text-center'>Balance Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentreportData
                                            .filter((student) => selectedIds.includes(student.id))
                                            .slice(0, 3) // Show only first 3 for preview
                                            .map((student, index) => (
                                                <tr key={student.id} className='border hover:bg-gray-50'>
                                                    <td className='border p-2 text-center'>{index + 1}</td>
                                                    <td className='border p-2 text-center'>{student.name}</td>
                                                    <td className='border p-2 text-center'>{student.admissionNo}</td>
                                                    <td className='border p-2 text-center'>{student.classSection}</td>
                                                    <td className='border p-2 text-center'>{student.fatherName}</td>
                                                    <td className='border p-2 text-center'>{student.mobileNumber}</td>
                                                    <td className='border p-2 text-center'>{student.emailId}</td>
                                                    <td className='border p-2 text-center font-bold text-red-600'>
                                                        ₹{student.balanceAmount.toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            ))}
                                        {selectedIds.length > 3 && (
                                            <tr className='border bg-gray-50'>
                                                <td colSpan={8} className='border p-2 text-center font-semibold'>
                                                    ...and {selectedIds.length - 3} more students
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Notification Template Selection */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Notification Template:</Label>
                                <Select value={notificationTemplate} onValueChange={setNotificationTemplate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='-Select-' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='fee_default_notice'>Fee Default Notice</SelectItem>
                                        <SelectItem value='urgent_payment'>Urgent Payment Required</SelectItem>
                                        <SelectItem value='balance_reminder'>Balance Reminder</SelectItem>
                                        <SelectItem value='final_notice'>Final Notice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Notification Content */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Notification Content:</Label>
                                <Textarea
                                    value={notificationContent}
                                    onChange={(e) => setNotificationContent(e.target.value)}
                                    placeholder='Enter notification content here...'
                                    className='min-h-[150px]'
                                />
                            </div>

                            {/* Template Preview Section */}
                            <div className='rounded-lg border p-4'>
                                <h3 className='mb-3 font-bold text-lg'>Template Preview:</h3>
                                <div className='rounded bg-gray-50 p-4'>
                                    <p className='text-gray-700'>Thank You</p>
                                    <div className='mt-4 rounded border bg-white p-3'>
                                        <p className='mb-2 font-semibold'>Selected Students ({selectedIds.length}):</p>
                                        <ul className='list-disc space-y-1 pl-5'>
                                            {studentreportData
                                                .filter((student) => selectedIds.includes(student.id))
                                                .slice(0, 3)
                                                .map((student) => (
                                                    <li key={student.id} className='text-sm'>
                                                        {student.name} ({student.admissionNo}) - ₹
                                                        {student.balanceAmount.toLocaleString('en-IN')}
                                                    </li>
                                                ))}
                                            {selectedIds.length > 3 && (
                                                <li className='font-semibold text-sm'>...and {selectedIds.length - 3} more students</li>
                                            )}
                                        </ul>
                                        <p className='mt-3 font-semibold'>
                                            Total Outstanding: ₹{calculateTotals().totalBalance.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-end gap-3 pt-4'>
                                <Button variant='outline' onClick={() => setShowNotificationModal(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={handleSendNotification}
                                    className='bg-blue-600 hover:bg-blue-700'
                                    disabled={!notificationTemplate}>
                                    <span className='mr-2'>🔔</span>
                                    Send Notification
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* SMS Configuration Modal */}
                <Dialog open={showSMSModal === true} onOpenChange={setShowSMSModal}>
                    <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                        <div className='space-y-6'>
                            <div className='text-center'>
                                <h4 className='mb-2 font-bold text-red-600 text-xl'>SELECTED DEFAULTER LIST !!!</h4>
                                <p className='font-bold text-gray-700'>NOTE : SMS Will Be Sent To The Same</p>
                            </div>

                            {/* Defaulters Table - SMS */}
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full table-auto border-collapse'>
                                    <thead>
                                        <tr>
                                            <th className='border p-3 text-center'>Sl No</th>
                                            <th className='border p-3 text-center'>Name</th>
                                            <th className='border p-3 text-center'>Mobile Number</th>
                                            <th className='border p-3 text-center'>Balance Amount</th>
                                            <th className='border p-3 text-center'>SMS Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentreportData
                                            .filter((student) => selectedIds.includes(student.id))
                                            .slice(0, 5) // Show only first 5 for preview
                                            .map((student, index) => (
                                                <tr key={student.id} className='border hover:bg-gray-50'>
                                                    <td className='border p-2 text-center'>{index + 1}</td>
                                                    <td className='border p-2 text-center'>{student.name}</td>
                                                    <td className='border p-2 text-center font-mono'>{student.mobileNumber}</td>
                                                    <td className='border p-2 text-center font-bold text-red-600'>
                                                        ₹{student.balanceAmount.toLocaleString('en-IN')}
                                                    </td>
                                                    <td className='border p-2 text-center'>
                                                        <span className='inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 font-medium text-xs text-yellow-800'>
                                                            Pending
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        {selectedIds.length > 5 && (
                                            <tr className='border bg-gray-50'>
                                                <td colSpan={5} className='border p-2 text-center font-semibold'>
                                                    ...and {selectedIds.length - 5} more students will receive SMS
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* SMS Template Selection */}
                            <div>
                                <Label className='mb-2 block font-semibold'>SMS Template:</Label>
                                <Select value={smsTemplate} onValueChange={setSmsTemplate}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='-Select-' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='sms_fee_reminder'>Fee Reminder SMS</SelectItem>
                                        <SelectItem value='sms_urgent'>Urgent Payment SMS</SelectItem>
                                        <SelectItem value='sms_short'>Short Balance Alert</SelectItem>
                                        <SelectItem value='sms_detailed'>Detailed Balance SMS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* SMS Content */}
                            <div>
                                <Label className='mb-2 block font-semibold'>SMS Content:</Label>
                                <Textarea
                                    value={smsContent}
                                    onChange={(e) => setSmsContent(e.target.value)}
                                    placeholder='Enter SMS content here...'
                                    className='min-h-[100px]'
                                    maxLength={160}
                                />
                                <p className='mt-1 text-gray-500 text-sm'>Characters: {smsContent.length}/160</p>
                            </div>

                            {/* Search Bar for SMS */}
                            <div>
                                <Label className='mb-2 block font-semibold'>Search Students:</Label>
                                <Input
                                    type='text'
                                    placeholder='Search students by name or mobile...'
                                    className='w-full'
                                    onChange={(e) => setSmsSearch(e.target.value)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex justify-end gap-3 pt-4'>
                                <Button variant='outline' onClick={() => setShowSMSModal(false)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={handleSendSMS}
                                    className='bg-green-600 hover:bg-green-700'
                                    disabled={!smsTemplate || smsContent.length === 0}>
                                    <span className='mr-2'>📱</span>
                                    Send SMS
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </form>
        </div>
    );
}
