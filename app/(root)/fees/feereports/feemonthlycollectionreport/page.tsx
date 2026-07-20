'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeCustomGroupDefaulterreport, useFeeGroupDefaulterreport, useFeeTermDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FormError } from '@/components/ui/extension/field';
import { feeMonthlyCollectionReportSchema } from '@/schemas/fees/reports';
import { getMonthlyFeeCollectionReport } from '@/server/fees/reports/fee_DefaulterReport';
import { getStudentdetails } from '@/server/fees/trasactions/waived_off';
import type { IFeeCustomGroupDropdownList, IFeeGroupDropdownList, IFeeTermDropdownList } from '@/types/fees/reports/reports';
import type { feeTransactionWaivedOffStudentDetails } from '@/types/fees/transactions/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import {
    exportToExcelforFeeClassWise,
    exportToExcelforFeeGroupWise,
    exportToExcelforFeeHeadWise,
    exportToExcelforFeeInstallmentWise,
    exportToExcelforFeeStudentorStaffWise,
    exportToExcelforFeeStudentorStaffWiseofBalance,
    printTable
} from './_components/columns';

type FormFields = z.infer<typeof feeMonthlyCollectionReportSchema>;

const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

interface IStudentFeeDefaulterReport {
    id: number;
    amsT_Id: number;
    totalBalance: number;
    studentName: string;
    amsT_AdmNo: string;
    classSection: string;
    amsT_MobileNo: string;
    amsT_FatherName: string;
    amsT_emailId: string;
    fmT_Name: string;
    fmG_GroupName: string;
    fmH_FeeName: string;
    asmcL_ClassName: string;
    amsT_Route: string;
    fine_Amount: number;
    admno: string;
    feeName: string;
    className: string;
    sectionName: string;
    fatherName: string;
    mobileNo: string;
    email: string;
    tobepaid: number;
    [key: string]: any;
}
const today = new Date().toISOString().split('T')[0];
export default function FeeDefaulterReport() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeMonthlyCollectionReportSchema),
        defaultValues: {
            fromDate: today,
            toDate: today,
            academicYearId: undefined,
            amstId: undefined,
            customGroupIds: [],
            feeGroupIds: [],
            termIds: []
        }
    });
    const fromDateValue = watch('fromDate');
    const [filters, setFilters] = useState({
        viewMode: 'all' as 'all' | 'individual',
        filter: 'active' as 'active' | 'left',
        filter2: 'admno' as 'admno' | 'name',
        academicYearId: '',
        ischeckdate: false,
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[]
    });

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);
    const [reportData, setReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [studentreportData, setstudentReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [studentGroupreportData, setstudentGroupReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [studentHeadreportData, setstudentHeadReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [studentClassreportData, setstudentClassReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [balancereportData, setBalanceReportData] = useState<IStudentFeeDefaulterReport[]>([]);
    const [dynamicFeeNames, setDynamicFeeNames] = useState<string[]>([]);
    const [reportLoading, setReportLoading] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<'feeGroup' | 'totalDue' | 'fmH_FeeName' | 'totalBalance' | 'asmcL_ClassName' | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [studentDetails, setStudentDetails] = useState<feeTransactionWaivedOffStudentDetails[]>([]);
    const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
    const [studentDetailsError, setStudentDetailsError] = useState<any>(null);
    const { data: academicData, error: academicError } = useAcademicYearDropdown();
    const academicYearId = watch('academicYearId');
    const fetchStudentDetails = async () => {
        if (!academicYearId) return;
        try {
            setStudentDetailsLoading(true);
            setStudentDetailsError(null);

            const res = await getStudentdetails(Number(academicYearId), 0, 0);
            setStudentDetails(res.data ?? []);
            setValue('amstId', 0);
        } catch (error) {
            console.error('Error fetching student class mapping', error);
            setStudentDetailsError(error);
        } finally {
            setStudentDetailsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentDetails();
    }, [academicYearId]);

    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

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
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    const [communicationMethods, setCommunicationMethods] = useState({
        email: false,
        sms: false,
        notification: false,
        whatsapp: false
    });

    const [emailTemplate, setEmailTemplate] = useState('');
    const [showemailContent, setshowEmailContent] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [showSMSModal, setShowSMSModal] = useState(false);

    const [sortConfig, setSortConfig] = useState<{
        key: keyof (typeof studentreportData)[0];
        direction: 'asc' | 'desc';
    } | null>(null);

    const handleSortfull = (key: keyof (typeof studentreportData)[0]) => {
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return studentreportData;

        return [...studentreportData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });
    }, [studentreportData, sortConfig]);

    const filteredStudentData = useMemo(() => {
        if (!search.trim()) return studentreportData;
        const searchTerm = search.toLowerCase().trim();
        return studentreportData.filter((student) => {
            return (
                student.studentName.toLowerCase().includes(searchTerm) ||
                student.amsT_AdmNo.toLowerCase().includes(searchTerm) ||
                student.classSection.toLowerCase().includes(searchTerm) ||
                student.amsT_FatherName.toLowerCase().includes(searchTerm) ||
                student.amsT_MobileNo.includes(searchTerm) ||
                student.amsT_emailId.toLowerCase().includes(searchTerm) ||
                student.amsT_Route.toLowerCase().includes(searchTerm) ||
                student.totalBalance.toString().includes(searchTerm)
            );
        });
    }, [studentreportData, search]);

    const toggleCommunicationMethod = (method: keyof typeof communicationMethods) => {
        setCommunicationMethods((prev) => ({
            ...prev,
            [method]: !prev[method]
        }));
    };

    const handleRequestCommunication = () => {
        if (communicationMethods.email) {
            setshowEmailContent(true);
        } else if (communicationMethods.notification) {
            setShowNotificationModal(true);
        } else if (communicationMethods.sms) {
            setShowSMSModal(true);
        }
    };

    const handleSendEmail = () => {
        const selectedStudents = studentreportData.filter((student) => selectedIds.includes(student.amsT_Id));

        if (selectedStudents.length === 0) {
            toast.error('Please select at least one student');
            return;
        }
        toast.success(`Email sent to ${selectedStudents.length} student(s)`);
    };

    const calculateTotals = () => {
        const selectedStudents = studentreportData.filter((student) => selectedIds.includes(student.amsT_Id));

        return {
            count: selectedStudents.length,
            totalBalance: selectedStudents.reduce((sum, student) => sum + student.totalBalance, 0)
        };
    };

    const filteredData = useMemo(() => {
        let rows = [...reportData];

        if (search) {
            rows = rows.filter(
                (r) => r.fmG_GroupName.toLowerCase().includes(search.toLowerCase()) || r.totalBalance.toString().includes(search)
            );
        }

        if (sortKey) {
            rows.sort((a: any, b: any) => {
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

    const handleSort = (key: 'feeGroup' | 'totalDue' | 'fmH_FeeName' | 'totalBalance' | 'asmcL_ClassName') => {
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
        if (selectedIds.length === studentGroupreportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(studentGroupreportData.map((row) => row.id));
        }
    };

    const toggleAllstudents = () => {
        if (selectedIds.length === studentreportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(studentreportData.map((r) => r.id));
        }
    };

    const toggleAllBalance = () => {
        if (selectedIds.length === balancereportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(balancereportData.map((r) => r.id));
        }
    };
    const totalBalance = filteredData.reduce((sum, r) => sum + r.totalBalance, 0);
    const selectedBalance = filteredData.filter((r) => selectedIds.includes(r.id)).reduce((sum, r) => sum + r.totalBalance, 0);

    const handleExportExcelforFeeGroupWise = () => {
        const rowsToExport = studentGroupreportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcelforFeeGroupWise(rowsToExport, 'Defaulter_Report');
    };
    const handleExportExcelforFeeHeadWise = () => {
        const rowsToExport = studentHeadreportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcelforFeeHeadWise(rowsToExport, 'Defaulter_Report');
    };

    const handleExportExcelforFeeClassWise = () => {
        const rowsToExport = studentClassreportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcelforFeeClassWise(rowsToExport, 'Defaulter_Report');
    };

    const handlePrintforFeeGroupWise = () => {
        const rowsToPrint = studentGroupreportData.filter((row) => selectedIds.includes(row.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = ['Sl.No', 'Fee Group', 'Balance Amount'];

        const printableRows = rowsToPrint.map((row, index) => ({
            'Sl.No': index + 1,
            'Fee Group': row.fmG_GroupName,
            'Balance Amount': `₹${row.totalBalance}`
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalBalance, 0);
        const sumRow = {
            'Sl.No': '',
            'Fee Group': 'Total',
            'Balance Amount': `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columnHeaders, printableRows, sumRow);
    };

    const handlePrintforFeeHeadWise = () => {
        const rowsToPrint = studentHeadreportData.filter((row) => selectedIds.includes(row.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = ['Sl.No', 'Fee Head', 'Balance Amount'];

        const printableRows = rowsToPrint.map((row, index) => ({
            'Sl.No': index + 1,
            'Fee Head': row.fmH_FeeName,
            'Balance Amount': `₹${row.totalBalance}`
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalBalance, 0);
        const sumRow = {
            'Sl.No': '',
            'Fee Head': 'Total',
            'Balance Amount': `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columnHeaders, printableRows, sumRow);
    };

    const handlePrintforFeeClassWise = () => {
        const rowsToPrint = studentClassreportData.filter((row) => selectedIds.includes(row.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = ['Sl.No', 'Class Name', 'Balance Amount'];

        const printableRows = rowsToPrint.map((row, index) => ({
            'Sl.No': index + 1,
            'Class Name': row.asmcL_ClassName,
            'Balance Amount': `₹${row.totalBalance}`
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalBalance, 0);
        const sumRow = {
            'Sl.No': '',
            'Class Name': 'Total',
            'Balance Amount': `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columnHeaders, printableRows, sumRow);
    };

    const handleExportExcelforFeeInstallmentWise = () => {
        const rowsToExport = studentreportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcelforFeeInstallmentWise(rowsToExport, 'Defaulter_Report');
    };

    const handlePrintforFeeInstallmentWise = () => {
        const rowsToPrint = studentreportData.filter((row) => selectedIds.includes(row.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = [
            'Sl.No',
            'Name',
            'Admission No',
            'Class & Section',
            'Father Name',
            'Mobile Number',
            'Email ID',
            'Term',
            'Balance Amount'
        ];

        const printableRows = rowsToPrint.map((row, index) => ({
            'Sl.No': index + 1,
            Name: row.studentName,
            'Admission No': row.amsT_AdmNo,
            'Class & Section': row.classSection,
            'Father Name': row.amsT_FatherName,
            'Mobile Number': row.amsT_MobileNo,
            'Email ID': row.amsT_emailId,
            Term: row.fmT_Name,
            'Balance Amount': row.totalBalance
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalBalance, 0);
        const sumRow = {
            'Sl.No': '',
            Name: 'Total',
            'Admission No': '',
            'Class & Section': '',
            'Father Name': '',
            'Mobile Number': '',
            'Email ID': '',
            Term: '',
            'Balance Amount': `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columnHeaders, printableRows, sumRow);
    };

    const handleExportExcelforFeeStudentorStaffWise = () => {
        const rowsToExport = studentreportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcelforFeeStudentorStaffWise(rowsToExport, 'Defaulter_Report');
    };

    const handlePrintforFeeStudentorStaffWise = () => {
        const rowsToPrint = studentreportData.filter((row) => selectedIds.includes(row.id));

        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = [
            'Sl.No',
            'Name',
            'Admission No',
            'Class & Section',
            'Father Name',
            'Mobile Number',
            'Email ID',
            'Route',
            'Balance Amount'
        ];

        const printableRows = rowsToPrint.map((row, index) => ({
            'Sl.No': index + 1,
            Name: row.studentName,
            'Admission No': row.amsT_AdmNo,
            'Class & Section': row.classSection,
            'Father Name': row.amsT_FatherName,
            'Mobile Number': row.amsT_MobileNo,
            'Email ID': row.amsT_emailId,
            Route: row.amsT_Route,
            'Balance Amount': row.totalBalance
        }));

        const total = rowsToPrint.reduce((sum, r) => sum + r.totalBalance, 0);
        const sumRow = {
            'Sl.No': '',
            Name: 'Total',
            'Admission No': '',
            'Class & Section': '',
            'Father Name': '',
            'Mobile Number': '',
            'Email ID': '',
            Route: '',
            'Balance Amount': `₹${total.toLocaleString('en-IN')}`
        };

        printTable(columnHeaders, printableRows, sumRow);
    };
    const HandleexportToExcelforFeeStudentorStaffWiseofBalance = () => {
        const rowsToPrint = balancereportData.filter((row) => selectedIds.includes(row.id));
        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }
        const fileName = `Fee_Defaulter_Report__${new Date().toISOString().split('T')[0]}`;
        exportToExcelforFeeStudentorStaffWiseofBalance(rowsToPrint, fileName, dynamicFeeNames);
    };

    const handlePrintforFeeStudentorStaffWiseofBalance = () => {
        const rowsToPrint = balancereportData.filter((row) => selectedIds.includes(row.id));
        if (!rowsToPrint || rowsToPrint.length === 0) {
            toast.error('No data selected to print');
            return;
        }

        const columnHeaders = [
            'Sl.No',
            'Name',
            'Admission No',
            'Class',
            'Section',
            'Father Name',
            'Mobile Number',
            'Email ID',
            ...dynamicFeeNames,
            'Total Balance'
        ];

        const tableRows = rowsToPrint.map((row, index) => {
            const rowData: Record<string, any> = {
                'Sl.No': index + 1,
                Name: row.studentName,
                'Admission No': row.admno,
                Class: row.className,
                Section: row.sectionName,
                'Father Name': row.fatherName,
                'Mobile Number': row.mobileNo,
                'Email ID': row.email
            };

            dynamicFeeNames.forEach((feeName) => {
                const feeKey = feeName.toLowerCase().replace(/\s+/g, '_');
                const feeAmount = row[feeKey] || row.feeCategories?.[feeName] || 0;
                rowData[feeName] = feeAmount.toLocaleString('en-IN');
            });

            rowData['Total Balance'] = (row.tobepaid || 0).toLocaleString('en-IN');

            return rowData;
        });
        const sumRow: Record<string, any> = {
            'Sl.No': 'Total',
            Name: '',
            'Admission No': '',
            Class: '',
            Section: '',
            'Father Name': '',
            'Mobile Number': '',
            'Email ID': ''
        };

        dynamicFeeNames.forEach((feeName) => {
            const feeKey = feeName.toLowerCase().replace(/\s+/g, '_');
            const totalFee = rowsToPrint.reduce((sum, row) => {
                const feeAmount = row[feeKey] || row.feeCategories?.[feeName] || 0;
                return sum + feeAmount;
            }, 0);
            sumRow[feeName] = totalFee.toLocaleString('en-IN');
        });

        const totalBalance = rowsToPrint.reduce((sum, row) => sum + (row.tobepaid || 0), 0);
        sumRow['Total Balance'] = totalBalance.toLocaleString('en-IN');

        printTable(columnHeaders, tableRows, sumRow);
    };

    useEffect(() => {
        setReportData([]);
        setstudentGroupReportData([]);
        setstudentHeadReportData([]);
        setstudentClassReportData([]);
        setSelectedIds([]);
        setShowReport(false);
    }, [filters.academicYearId, filters.customGroupIds, filters.termIds, filters.feeGroupIds]);

    const onSubmit: SubmitHandler<FormFields> = async () => {
        setReportLoading(true);
        setShowReport(false);
        setReportData([]);
        setstudentReportData([]);
        setstudentGroupReportData([]);
        setstudentHeadReportData([]);
        setstudentClassReportData([]);

        try {
            const payload: any = {};
            // if (filters.viewMode === 'year') {
            //     payload = {
            //         ASMAY_Id: academicYearId,
            //         radioval: breakdown,
            //         reporttype: filters.viewMode,
            //         active: active,
            //         deactive: deactive,
            //         left: left,
            //         FMG_Ids: feeGroupIds || [],
            //         FMT_Ids: termIds || [],
            //         TRMR_Ids: routeIds || [],
            //         term_group: term_group,
            //         Balance_1: blc_new,
            //         FMG_Id: feeGroupIds && feeGroupIds.length > 0 ? feeGroupIds[0] : 0,
            //         FMGG_Id: customGroupIds && customGroupIds.length > 0 ? customGroupIds[0] : 0,
            //         FMT_Id: termIds && termIds.length > 0 ? termIds[0] : 0,
            //         customflag: customGroupIds.length > 0 ? 'true' : ' ',
            //         groupflag: feeGroupIds.length > 0 ? 'true' : ' ',
            //         ASMCL_Id: asmcL_Id,
            //         AMSC_Id: asmC_Id,
            //         yearid: 0,
            //         Select_Button: filters.userType,
            //         studenttype: 'active'
            //     };
            // } else if (filters.viewMode === 'date') {
            //     payload = {
            //         ASMAY_Id: academicYearId,
            //         radioval: breakdown,
            //         reporttype: filters.viewMode,
            //         active: active,
            //         deactive: deactive,
            //         left: left,
            //         FMG_Ids: feeGroupIds || [],
            //         FMT_Ids: termIds || [],
            //         TRMR_Ids: routeIds || [],
            //         Balance_1: blc_new,
            //         From_Date: filters.dueDate,
            //         duedate: filters.dueDateType,
            //         ASMCL_Id: asmcL_Id,
            //         AMSC_Id: asmC_Id,
            //         term_group: term_group,
            //         Select_Button: filters.userType,
            //         yearid: 0,
            //         studenttype: 'active'
            //     };
            // }

            console.log('Payload for Fee Defaulter Report:', JSON.stringify(payload));

            const reportArray = await getMonthlyFeeCollectionReport(payload);
            const studentDataArray = (reportArray as any)?.data?.list?.studentalldata;
            const studentGroupDataArray = (reportArray as any)?.data?.list?.groupalldata;
            const BalanceGroupDataArray = (reportArray as any)?.data?.list;
            const studentHeadArray = (reportArray as any)?.data?.list?.headalldata;
            const studentClassArray = (reportArray as any)?.data?.list?.classalldata;

            let hasData = false;
            if (studentDataArray != null) {
                if (studentDataArray && Array.isArray(studentDataArray)) {
                    const studentData = JSON.parse(JSON.stringify(studentDataArray));
                    const mapApiToReportRows = (apiData: any[]): IStudentFeeDefaulterReport[] => {
                        return apiData.map((item, index) => ({
                            id: index + 1,
                            amsT_AdmNo: item.amsT_AdmNo,
                            amsT_emailId: item.amsT_emailId,
                            amsT_FatherName: item.amsT_FatherName,
                            amsT_Id: item.amsT_Id,
                            amsT_MobileNo: item.amsT_MobileNo,
                            amsT_Route: item.amsT_Route,
                            asmcL_ClassName: item.asmcL_ClassName,
                            classSection: item.classSection,
                            fmG_GroupName: item.fmG_GroupName,
                            fmH_FeeName: item.fmH_FeeName,
                            fmT_Name: item.fmT_Name,
                            studentName: item.studentName,
                            totalBalance: item.totalBalance,
                            fine_Amount: item.fine_Amount,
                            admno: item.admno,
                            feeName: item.feeName,
                            className: item.className,
                            sectionName: item.sectionName,
                            fatherName: item.fatherName,
                            mobileNo: item.mobileNo,
                            email: item.email,
                            tobepaid: item.tobepaid
                        }));
                    };
                    const data = mapApiToReportRows(studentData);
                    setstudentReportData(data);
                    toast.success(reportArray.message);
                    if (studentData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No student data found!');
                    setstudentReportData([]);
                }
            }
            if (studentGroupDataArray != null) {
                if (studentGroupDataArray && Array.isArray(studentGroupDataArray)) {
                    const studentGroupData = JSON.parse(JSON.stringify(studentGroupDataArray));
                    const mapApiToReportRows = (apiData: any[]): IStudentFeeDefaulterReport[] => {
                        return apiData.map((item, index) => ({
                            id: index + 1,
                            amsT_AdmNo: item.amsT_AdmNo,
                            amsT_emailId: item.amsT_emailId,
                            amsT_FatherName: item.amsT_FatherName,
                            amsT_Id: item.amsT_Id,
                            amsT_MobileNo: item.amsT_MobileNo,
                            amsT_Route: item.amsT_Route,
                            asmcL_ClassName: item.asmcL_ClassName,
                            classSection: item.classSection,
                            fmG_GroupName: item.fmG_GroupName,
                            fmH_FeeName: item.fmH_FeeName,
                            fmT_Name: item.fmT_Name,
                            studentName: item.studentName,
                            totalBalance: item.totalBalance,
                            fine_Amount: item.fine_Amount,
                            admno: item.admno,
                            feeName: item.feeName,
                            className: item.className,
                            sectionName: item.sectionName,
                            fatherName: item.fatherName,
                            mobileNo: item.mobileNo,
                            email: item.email,
                            tobepaid: item.tobepaid
                        }));
                    };
                    const data = mapApiToReportRows(studentGroupData);
                    setstudentGroupReportData(data);
                    toast.success(reportArray.message);
                    if (studentGroupData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No group data found!');
                    setstudentGroupReportData([]);
                }
            }
            if (studentHeadArray != null) {
                if (studentHeadArray && Array.isArray(studentHeadArray)) {
                    const studentHeadData = JSON.parse(JSON.stringify(studentHeadArray));
                    const mapApiToReportRows = (apiData: any[]): IStudentFeeDefaulterReport[] => {
                        return apiData.map((item, index) => ({
                            id: index + 1,
                            amsT_AdmNo: item.amsT_AdmNo,
                            amsT_emailId: item.amsT_emailId,
                            amsT_FatherName: item.amsT_FatherName,
                            amsT_Id: item.amsT_Id,
                            amsT_MobileNo: item.amsT_MobileNo,
                            amsT_Route: item.amsT_Route,
                            asmcL_ClassName: item.asmcL_ClassName,
                            classSection: item.classSection,
                            fmG_GroupName: item.fmG_GroupName,
                            fmH_FeeName: item.fmH_FeeName,
                            fmT_Name: item.fmT_Name,
                            studentName: item.studentName,
                            totalBalance: item.totalBalance,
                            fine_Amount: item.fine_Amount,
                            admno: item.admno,
                            feeName: item.feeName,
                            className: item.className,
                            sectionName: item.sectionName,
                            fatherName: item.fatherName,
                            mobileNo: item.mobileNo,
                            email: item.email,
                            tobepaid: item.tobepaid
                        }));
                    };
                    const data = mapApiToReportRows(studentHeadData);
                    setstudentHeadReportData(data);
                    toast.success(reportArray.message);
                    if (studentHeadData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No group data found!');
                    setstudentGroupReportData([]);
                }
            }

            if (studentClassArray != null) {
                if (studentClassArray && Array.isArray(studentClassArray)) {
                    const studentClassData = JSON.parse(JSON.stringify(studentClassArray));
                    const mapApiToReportRows = (apiData: any[]): IStudentFeeDefaulterReport[] => {
                        return apiData.map((item, index) => ({
                            id: index + 1,
                            amsT_AdmNo: item.amsT_AdmNo,
                            amsT_emailId: item.amsT_emailId,
                            amsT_FatherName: item.amsT_FatherName,
                            amsT_Id: item.amsT_Id,
                            amsT_MobileNo: item.amsT_MobileNo,
                            amsT_Route: item.amsT_Route,
                            asmcL_ClassName: item.asmcL_ClassName,
                            classSection: item.classSection,
                            fmG_GroupName: item.fmG_GroupName,
                            fmH_FeeName: item.fmH_FeeName,
                            fmT_Name: item.fmT_Name,
                            studentName: item.studentName,
                            totalBalance: item.totalBalance,
                            fine_Amount: item.fine_Amount,
                            admno: item.admno,
                            feeName: item.feeName,
                            className: item.className,
                            sectionName: item.sectionName,
                            fatherName: item.fatherName,
                            mobileNo: item.mobileNo,
                            email: item.email,
                            tobepaid: item.tobepaid
                        }));
                    };
                    const data = mapApiToReportRows(studentClassData);
                    setstudentClassReportData(data);
                    toast.success(reportArray.message);
                    if (studentClassData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No group data found!');
                    setstudentClassReportData([]);
                }
            }

            if (BalanceGroupDataArray != null) {
                if (BalanceGroupDataArray && Array.isArray(BalanceGroupDataArray)) {
                    const balanceData: any[] = JSON.parse(JSON.stringify(BalanceGroupDataArray));
                    // Group data by student and collect unique fee names
                    const studentMap = new Map<number, any>();
                    const allFeeNames = new Set<string>(); // To collect all unique fee names
                    balanceData.forEach((item: any) => {
                        const key = item.amsT_Id; // Unique student identifier
                        const feeName = item.feeName?.trim();
                        // Add fee name to set
                        allFeeNames.add(feeName);
                        if (!studentMap.has(key)) {
                            studentMap.set(key, {
                                id: key,
                                amsT_AdmNo: item.amsT_AdmNo,
                                amsT_emailId: item.amsT_emailId,
                                amsT_FatherName: item.amsT_FatherName,
                                amsT_Id: item.amsT_Id,
                                amsT_MobileNo: item.amsT_MobileNo,
                                amsT_Route: item.amsT_Route,
                                asmcL_ClassName: item.asmcL_ClassName,
                                classSection: item.classSection,
                                fmG_GroupName: item.fmG_GroupName,
                                fmT_Name: item.fmT_Name || '',
                                fmH_FeeName: item.fmH_FeeName || '',
                                feeName: item.feeName || '',
                                studentName: item.studentName,
                                totalBalance: 0,
                                fine_Amount: item.fine_Amount || 0,
                                admno: item.admno,
                                className: item.className,
                                sectionName: item.sectionName,
                                fatherName: item.fatherName,
                                mobileNo: item.mobileNo,
                                email: item.email,
                                tobepaid: 0,
                                feeCategories: {}
                            });
                        }
                        const student = studentMap.get(key);
                        // Add fees to appropriate category
                        if (!student.feeCategories[feeName]) {
                            student.feeCategories[feeName] = 0;
                        }
                        student.feeCategories[feeName] += Number(item.tobepaid) || 0;
                        // Update total balance - fix the reduce type issue
                        student.tobepaid = Object.values(student.feeCategories).reduce(
                            (sum: number, fee: unknown) => sum + (Number(fee) || 0),
                            0
                        );
                        student.totalBalance = student.tobepaid;
                    });

                    // Convert map to array and map to desired format
                    const groupedData = Array.from(studentMap.values());
                    const feeNamesArray = Array.from(allFeeNames); // Get array of all fee names

                    const mapApiToReportRows = (apiData: any[]): IStudentFeeDefaulterReport[] => {
                        return apiData.map((item, index) => {
                            // Create the base object matching the interface
                            const reportObj: IStudentFeeDefaulterReport = {
                                id: index + 1,
                                amsT_Id: item.amsT_Id,
                                totalBalance: item.totalBalance,
                                studentName: item.studentName,
                                amsT_AdmNo: item.amsT_AdmNo,
                                classSection: item.classSection,
                                amsT_MobileNo: item.amsT_MobileNo,
                                amsT_FatherName: item.amsT_FatherName,
                                amsT_emailId: item.amsT_emailId,
                                fmT_Name: item.fmT_Name || '',
                                fmG_GroupName: item.fmG_GroupName,
                                fmH_FeeName: item.fmH_FeeName || '',
                                asmcL_ClassName: item.asmcL_ClassName,
                                amsT_Route: item.amsT_Route,
                                fine_Amount: item.fine_Amount,
                                admno: item.admno,
                                feeName: item.feeName || '',
                                className: item.className,
                                sectionName: item.sectionName,
                                fatherName: item.fatherName,
                                mobileNo: item.mobileNo,
                                email: item.email,
                                tobepaid: item.tobepaid
                            };

                            // Add dynamic fee properties as additional properties (TypeScript will allow this with type assertion)
                            const dynamicFeeProps: Record<string, any> = {};
                            Object.entries(item.feeCategories || {}).forEach(([key, value]) => {
                                const propName = key.toLowerCase().replace(/\s+/g, '_');
                                dynamicFeeProps[propName] = value;
                            });
                            return {
                                ...reportObj,
                                ...dynamicFeeProps,
                                // Include feeCategories as an extra property if needed for rendering
                                feeCategories: item.feeCategories
                            } as IStudentFeeDefaulterReport & Record<string, any>;
                        });
                    };

                    const data = mapApiToReportRows(groupedData);
                    setBalanceReportData(data as IStudentFeeDefaulterReport[]);
                    // Also store the dynamic fee names for table header generation
                    setDynamicFeeNames(feeNamesArray);

                    toast.success(reportArray.message);
                    if (balanceData.length > 0) {
                        hasData = true;
                    }
                } else {
                    toast.info('No student data found!');
                    setBalanceReportData([]);
                    setDynamicFeeNames([]);
                }
            }

            if (hasData) {
                const combinedData = [
                    ...(studentDataArray || []),
                    ...(studentGroupDataArray || []),
                    ...(studentHeadArray || []),
                    ...(studentClassArray || [])
                ];
                setReportData(combinedData);
                setShowReport(true);
            } else {
                setReportData([]);
                setShowReport(false);
                toast.info('No data available for the report!');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <h1 className='mb-8 font-bold text-3xl text-gray-900'>Fee Monthly Collection Extract Register</h1>

                            <div className='space-y-8'>
                                {/* User Type Card */}

                                {/* View Mode + Academic Year */}
                                <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
                                    <Card className='border bg-gray-50 p-5 shadow-sm'>
                                        <div className='flex items-center gap-10'>
                                            {(
                                                [
                                                    { label: 'All', value: 'all' },
                                                    { label: 'Individual', value: 'individual' }
                                                ] as const
                                            ).map((mode) => (
                                                <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                    <input
                                                        type='radio'
                                                        name='viewMode'
                                                        checked={filters.viewMode === mode.value}
                                                        onChange={() =>
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                viewMode: mode.value
                                                            }))
                                                        }
                                                        className='h-5 w-5 text-primary'
                                                    />
                                                    <span className='font-medium text-base'>{mode.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </Card>
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
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
                                    {filters.viewMode === 'individual' && (
                                        <div className='md:col-span-2'>
                                            <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                                    <div className='flex items-center gap-10'>
                                                        {(
                                                            [
                                                                { label: 'Adm No', value: 'admno' },
                                                                { label: 'Name', value: 'name' }
                                                            ] as const
                                                        ).map((mode) => (
                                                            <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name='filter2'
                                                                    checked={filters.filter2 === mode.value}
                                                                    onChange={() =>
                                                                        setFilters((prev) => ({
                                                                            ...prev,
                                                                            filter2: mode.value
                                                                        }))
                                                                    }
                                                                    className='h-5 w-5 text-primary'
                                                                />
                                                                <span className='font-medium text-base'>{mode.label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </Card>
                                                <div>
                                                    <Label htmlFor='amstId'>
                                                        Student Name:
                                                        <span className='ml-1 text-red-500'>*</span>
                                                    </Label>
                                                    <div className='flex w-full max-w-[400px] flex-col'>
                                                        <Controller
                                                            name='amstId'
                                                            control={control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    key={field.value}
                                                                    value={
                                                                        field.value && field.value !== 0 ? String(field.value) : undefined
                                                                    }
                                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                                    disabled={!academicYearId}>
                                                                    <SelectTrigger className='min-w-[400px] text-center'>
                                                                        <SelectValue placeholder='--Select student --' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {studentDetailsLoading ? (
                                                                            <SelectItem value='loading' disabled>
                                                                                Loading...
                                                                            </SelectItem>
                                                                        ) : studentDetailsError ? (
                                                                            <SelectItem value='error' disabled>
                                                                                Error loading
                                                                            </SelectItem>
                                                                        ) : studentDetails.length === 0 ? (
                                                                            <SelectItem value='nodata' disabled>
                                                                                No Results
                                                                            </SelectItem>
                                                                        ) : filters.filter2 === 'name' ? (
                                                                            studentDetails?.map((item: any) => (
                                                                                <SelectItem
                                                                                    key={item.amsT_Id}
                                                                                    value={item.amsT_Id.toString()}>
                                                                                    {item.studentName} :{item.amsT_RegistrationNo}
                                                                                </SelectItem>
                                                                            ))
                                                                        ) : (
                                                                            studentDetails?.map((item: any) => (
                                                                                <SelectItem
                                                                                    key={item.amsT_Id}
                                                                                    value={item.amsT_Id.toString()}>
                                                                                    {item.amsT_RegistrationNo} :{item.studentName}
                                                                                </SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.amstId && <FormError>{errors.amstId.message}</FormError>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                    <div className='space-y-3'>
                                        <Label className='font-semibold text-lg'>
                                            Custom Group<span className='text-red-500'>*</span>
                                        </Label>
                                        <Card className='border bg-gray-50 p-4'>
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
                                </div>

                                {/* Class & Section + Status + Date (Date section is conditional) */}
                                <div className='space-y-6 border-t pt-8'>
                                    <div className='flex flex-wrap items-center gap-6'>
                                        <div className='flex items-center gap-3'>
                                            <Checkbox
                                                id='ischeckdate'
                                                checked={filters.ischeckdate}
                                                onCheckedChange={(checked: any) => {
                                                    const value = !!checked;
                                                    setFilters((prev) => ({
                                                        ...prev,
                                                        ischeckdate: value
                                                    }));
                                                    setValue('ischeckdate', value, {
                                                        shouldValidate: true
                                                    });
                                                }}
                                            />

                                            <Label htmlFor='includeClass' className='cursor-pointer font-medium'>
                                                Cheque Date
                                            </Label>
                                            <Card className='border bg-gray-50 p-5 shadow-sm'>
                                                <div className='flex items-center gap-10'>
                                                    {(
                                                        [
                                                            { label: 'Active', value: 'active' },
                                                            { label: 'Left', value: 'left' }
                                                        ] as const
                                                    ).map((mode) => (
                                                        <label key={mode.value} className='flex cursor-pointer items-center gap-3'>
                                                            <input
                                                                type='radio'
                                                                name='filter'
                                                                checked={filters.filter === mode.value}
                                                                onChange={() =>
                                                                    setFilters((prev) => ({
                                                                        ...prev,
                                                                        filter: mode.value
                                                                    }))
                                                                }
                                                                className='h-5 w-5 text-primary'
                                                            />
                                                            <span className='font-medium text-base'>{mode.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </Card>
                                            <div className='flex flex-col gap-1 pr-20'>
                                                <div className='flex items-center gap-2'>
                                                    <Label className='w-32'>
                                                        From Date <span className='text-red-500'>*</span>
                                                    </Label>

                                                    <input
                                                        type='date'
                                                        className='flex-1 rounded-md border px-3 py-2'
                                                        onKeyDown={(e) => e.preventDefault()} // 🔒 blocks typing
                                                        {...register('fromDate', {
                                                            required: 'From Date is required',
                                                            onChange: (e) => {
                                                                const newFromDate = e.target.value;
                                                                const currentToDate = watch('toDate');

                                                                // Clear toDate if it's before new fromDate
                                                                if (currentToDate && newFromDate > currentToDate) {
                                                                    setValue('toDate', '');
                                                                }
                                                            }
                                                        })}
                                                    />
                                                </div>

                                                {errors.fromDate && <FormError className='ml-32'>{errors.fromDate.message}</FormError>}
                                            </div>

                                            {/* TO DATE */}
                                            <div className='flex flex-col gap-1'>
                                                <div className='flex items-center gap-4'>
                                                    <Label className='w-32'>
                                                        To Date <span className='text-red-500'>*</span>
                                                    </Label>
                                                    <input
                                                        type='date'
                                                        className='flex-1 rounded-md border px-3 py-2'
                                                        onKeyDown={(e) => e.preventDefault()} // 🔒 blocks typing
                                                        {...register('toDate', {
                                                            required: 'To Date is required',
                                                            validate: () => {
                                                                if (!fromDateValue) return 'Please select From Date first';
                                                                return true;
                                                            }
                                                        })}
                                                        min={fromDateValue || ''} // 👈 THIS BLOCKS DATES BEFORE FROM DATE
                                                        disabled={!fromDateValue} // 👈 OPTIONAL: Disable until fromDate is selected
                                                    />
                                                </div>

                                                {errors.toDate && <FormError className='ml-32'>{errors.toDate.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/* ==================== ACTION BUTTONS ==================== */}
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button size='lg' variant='outline' className='px-8' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                    {showReport &&
                                        (studentreportData.length > 0 ||
                                            studentGroupreportData.length > 0 ||
                                            studentHeadreportData.length > 0 ||
                                            studentClassreportData.length > 0 ||
                                            balancereportData.length > 0) && (
                                            <div className='-mx-8 mt-12 overflow-hidden rounded-lg bg-white shadow-xl'>
                                                {/* Loading State */}
                                                {reportLoading ? (
                                                    <div className='p-24 text-center'>
                                                        <div className='inline-block h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                        <p className='mt-6 text-lg text-muted-foreground'>
                                                            Generating report, please wait...
                                                        </p>
                                                    </div>
                                                ) : (
                                                    /* Table Inside CollapsibleSection */
                                                    <CollapsibleSection
                                                        defaultOpen={true}
                                                        variant='default'
                                                        size='lg'
                                                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                        <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                            <div className='mb-6 text-center'>
                                                                <h2 className='font-bold text-2xl text-primary'>Fee Defaulter Report</h2>
                                                            </div>
                                                            {studentGroupreportData.length > 0 && (
                                                                <div className='flex gap-3'>
                                                                    <div className='mb-4 flex justify-end gap-2'>
                                                                        <Button
                                                                            size='sm'
                                                                            className='h-8 w-auto px-3 text-xs'
                                                                            onClick={handleExportExcelforFeeGroupWise}>
                                                                            Export Excel
                                                                        </Button>

                                                                        <Button
                                                                            size='sm'
                                                                            variant='outline'
                                                                            className='h-8 w-auto px-3 text-xs'
                                                                            onClick={handlePrintforFeeGroupWise}>
                                                                            Print
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* <div className="flex gap-3">
                              <div className="mb-4 flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 w-auto px-3 text-xs"
                                  onClick={handleExportExcelforFeeGroupWise}
                                >
                                  Export Excel
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-auto px-3 text-xs"
                                  onClick={handlePrintforFeeGroupWise}
                                >
                                  Print
                                </Button>
                              </div>
                            </div> */}
                                                            {selectedIds.length > 0 && (
                                                                <div className='mb-4 rounded-lg border border-gray-300 bg-white p-4 shadow-sm'>
                                                                    {/* Checkboxes Section */}
                                                                    <div className='mb-3'>
                                                                        <div className='flex items-center gap-2 font-medium text-gray-700 text-sm'>
                                                                            <span>Please Select Check Box For:</span>
                                                                            <div className='ml-2 flex items-center gap-4'>
                                                                                {['email', 'sms', 'notification', 'whatsapp'].map(
                                                                                    (method) => (
                                                                                        <div
                                                                                            key={method}
                                                                                            className='flex items-center gap-1.5'>
                                                                                            <Checkbox
                                                                                                id={`${method}-checkbox`}
                                                                                                checked={
                                                                                                    communicationMethods[
                                                                                                        method as keyof typeof communicationMethods
                                                                                                    ]
                                                                                                }
                                                                                                onCheckedChange={() =>
                                                                                                    toggleCommunicationMethod(
                                                                                                        method as keyof typeof communicationMethods
                                                                                                    )
                                                                                                }
                                                                                                className='h-4 w-4'
                                                                                            />
                                                                                            <Label
                                                                                                htmlFor={`${method}-checkbox`}
                                                                                                className='cursor-pointer text-sm uppercase'>
                                                                                                {method === 'whatsapp'
                                                                                                    ? 'WhatsApp'
                                                                                                    : method}
                                                                                            </Label>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Show REQUEST button only if exactly ONE communication method is selected */}
                                                                    {(communicationMethods.email ||
                                                                        communicationMethods.sms ||
                                                                        communicationMethods.notification) &&
                                                                        !(communicationMethods.email && communicationMethods.sms) &&
                                                                        !(
                                                                            communicationMethods.email && communicationMethods.notification
                                                                        ) &&
                                                                        !(
                                                                            communicationMethods.sms && communicationMethods.notification
                                                                        ) && (
                                                                            <div className='mt-3 flex justify-end'>
                                                                                <Button
                                                                                    size='sm'
                                                                                    className='h-8 px-6 text-xs'
                                                                                    onClick={handleRequestCommunication}
                                                                                    disabled={selectedIds.length === 0}>
                                                                                    REQUEST
                                                                                </Button>
                                                                            </div>
                                                                        )}

                                                                    {/* Show error if multiple methods are selected */}
                                                                    {(communicationMethods.email && communicationMethods.sms) ||
                                                                    (communicationMethods.email && communicationMethods.notification) ||
                                                                    (communicationMethods.sms && communicationMethods.notification) ? (
                                                                        <div className='mt-2 text-center text-red-500 text-sm'>
                                                                            Please select only one communication method
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            {/* Search */}
                                                            <input
                                                                value={search}
                                                                onChange={(e) => setSearch(e.target.value)}
                                                                placeholder='Search...'
                                                                className='w-72 rounded border px-3 py-2'
                                                            />

                                                            {/* Table */}
                                                            {studentGroupreportData.length > 0 && (
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
                                                                            {studentGroupreportData.map((row, index) => (
                                                                                <tr key={row.id} className='border-b'>
                                                                                    <td className='p-2 text-center'>
                                                                                        <Checkbox
                                                                                            checked={selectedIds.includes(row.id)}
                                                                                            onCheckedChange={() => toggleRow(row.id)}
                                                                                        />
                                                                                    </td>
                                                                                    <td className='p-2 text-center font-medium'>
                                                                                        {index + 1}
                                                                                    </td>
                                                                                    <td className='p-2 text-center font-medium'>
                                                                                        {row.fmG_GroupName}
                                                                                    </td>
                                                                                    <td className='p-2 text-center font-bold'>
                                                                                        ₹{row.totalBalance.toLocaleString('en-IN')}
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
                    <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto p-0'>
                        <DialogHeader className='items-center border-b p-6 text-center'>
                            <DialogTitle className='font-bold text-2xl'>SELECTED DEFAULTER LIST !!!</DialogTitle>
                            <p className='mt-1 font-medium text-sm'>NOTE : Email Will Trigger For The Same</p>
                        </DialogHeader>
                        <div className='overflow-hidden rounded-lg border'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Sl No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Admission No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Class : Section</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Father Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Mobile Number</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Email-id</th>
                                        <th className='p-3 text-left font-semibold text-sm'>Balance Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentreportData
                                        .filter((student) => selectedIds.includes(student.amsT_Id))
                                        .map((student, index) => (
                                            <tr key={student.amsT_Id} className='border-b hover:bg-gray-50'>
                                                <td className='border-r p-3 text-sm'>{index + 1}</td>
                                                <td className='border-r p-3 text-sm'>{student.studentName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_AdmNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.classSection}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_FatherName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_MobileNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_emailId}</td>
                                                <td className='p-3 font-semibold text-sm'>
                                                    ₹{student.totalBalance.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='space-y-6 p-6'>
                            <div className='space-y-4'>
                                {/* Email Template Selection */}
                                <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>Email Template:*</Label>
                                    <div className='max-w-md flex-1'>
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
                                </div>

                                {/* Email Content Title */}
                                <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>Email Content:</Label>
                                    <div className='max-w-md flex-1'>
                                        <div className='text-gray-600 text-sm'>Sub:</div>
                                        {/* You would add the email subject input/field here */}
                                        {/* Example: <Input placeholder="Enter email subject" /> */}
                                    </div>
                                </div>
                                {/* Template Preview */}
                                <div className='flex items-center gap-3'>
                                    <div className='flex-1'>
                                        <div className='rounded-lg border p-4'>
                                            <div className='mb-3 flex items-center gap-2'>
                                                <h3 className='font-medium text-lg'>Template Preview:</h3>
                                                <button
                                                    type='button'
                                                    className='ml-2 flex items-center gap-1 text-blue-600 hover:text-blue-800'>
                                                    <Eye className='h-4 w-4' />
                                                    <span>Preview</span>
                                                </button>
                                            </div>
                                            <div className='min-h-[100px] rounded border bg-gray-50 p-3'>
                                                <p className='text-gray-700'>Thank You</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Notification Configuration Modal */}
                <Dialog open={showNotificationModal === true} onOpenChange={setShowNotificationModal}>
                    <DialogContent className='max-h-[90vh] max-w-6xl overflow-y-auto p-0'>
                        <DialogHeader className='items-center border-b p-6 text-center'>
                            <DialogTitle className='font-bold text-2xl'>SELECTED DEFAULTER LIST !!!</DialogTitle>
                            <p className='mt-1 font-medium text-sm'>NOTE : Notification Will Trigger For The Same</p>
                        </DialogHeader>
                        <div className='overflow-hidden rounded-lg border'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Sl No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Admission No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Class : Section</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Father Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Mobile Number</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Email-id</th>
                                        <th className='p-3 text-left font-semibold text-sm'>Balance Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentreportData
                                        .filter((student) => selectedIds.includes(student.amsT_Id))
                                        .map((student, index) => (
                                            <tr key={student.amsT_Id} className='border-b hover:bg-gray-50'>
                                                <td className='border-r p-3 text-sm'>{index + 1}</td>
                                                <td className='border-r p-3 text-sm'>{student.studentName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_AdmNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.classSection}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_FatherName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_MobileNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_emailId}</td>
                                                <td className='p-3 font-semibold text-sm'>
                                                    ₹{student.totalBalance.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='space-y-6 p-6'>
                            <div className='space-y-4'>
                                {/* Email Template Selection */}
                                <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>Template:*</Label>
                                    <div className='max-w-md flex-1'>
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
                                </div>

                                {/* <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>Email Content:</Label>
                                    <div className='max-w-md flex-1'>
                                        <div className='text-gray-600 text-sm'>Sub:</div>
                                      
                                    </div>
                                </div>
                              
                                <div className='flex items-center gap-3'>
                                    <div className='flex-1'>
                                        <div className='rounded-lg border p-4'>
                                            <div className='mb-3 flex items-center gap-2'>
                                                <h3 className='font-medium text-lg'>Template Preview:</h3>
                                                <button
                                                    type="button"
                                                    className='ml-2 flex items-center gap-1 text-blue-600 hover:text-blue-800'
                                                >
                                                    <Eye className='h-4 w-4' />
                                                    <span>Preview</span>
                                                </button>
                                            </div>
                                            <div className='min-h-[100px] rounded border bg-gray-50 p-3'>
                                                <p className='text-gray-700'>Thank You</p>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                            {/* Action Buttons */}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* SMS Configuration Modal */}
                <Dialog open={showSMSModal === true} onOpenChange={setShowSMSModal}>
                    <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                        <DialogHeader className='items-center border-b p-6 text-center'>
                            <DialogTitle className='font-bold text-2xl'>SELECTED DEFAULTER LIST !!!</DialogTitle>
                            <p className='mt-1 font-medium text-sm'>NOTE : SMS Will Trigger For The Same</p>
                        </DialogHeader>
                        <div className='overflow-hidden rounded-lg border'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b bg-gray-50'>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Sl No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Admission No</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Class : Section</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Father Name</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Mobile Number</th>
                                        <th className='border-r p-3 text-left font-semibold text-sm'>Email-id</th>
                                        <th className='p-3 text-left font-semibold text-sm'>Balance Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentreportData
                                        .filter((student) => selectedIds.includes(student.amsT_Id))
                                        .map((student, index) => (
                                            <tr key={student.amsT_Id} className='border-b hover:bg-gray-50'>
                                                <td className='border-r p-3 text-sm'>{index + 1}</td>
                                                <td className='border-r p-3 text-sm'>{student.studentName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_AdmNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.classSection}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_FatherName}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_MobileNo}</td>
                                                <td className='border-r p-3 text-sm'>{student.amsT_emailId}</td>
                                                <td className='p-3 font-semibold text-sm'>
                                                    ₹{student.totalBalance.toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className='space-y-6 p-6'>
                            <div className='space-y-4'>
                                {/* Email Template Selection */}
                                <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>Email Template:*</Label>
                                    <div className='max-w-md flex-1'>
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
                                </div>

                                {/* Email Content Title */}
                                <div className='flex items-center justify-center gap-3'>
                                    <Label className='whitespace-nowrap font-semibold'>SMS Content:</Label>
                                    <div className='max-w-md flex-1'>
                                        <div className='text-gray-600 text-sm'>Sub:</div>
                                        {/* You would add the email subject input/field here */}
                                        {/* Example: <Input placeholder="Enter email subject" /> */}
                                    </div>
                                </div>
                                {/* Template Preview */}
                                {/* <div className='flex items-center gap-3'>
                                    <div className='flex-1'>
                                        <div className='rounded-lg border p-4'>
                                            <div className='mb-3 flex items-center gap-2'>
                                                <h3 className='font-medium text-lg'>Template Preview:</h3>
                                                <button
                                                    type="button"
                                                    className='ml-2 flex items-center gap-1 text-blue-600 hover:text-blue-800'
                                                >
                                                    <Eye className='h-4 w-4' />
                                                    <span>Preview</span>
                                                </button>
                                            </div>
                                            <div className='min-h-[100px] rounded border bg-gray-50 p-3'>
                                                <p className='text-gray-700'>Thank You</p>
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                            {/* Action Buttons */}
                        </div>
                    </DialogContent>
                </Dialog>
            </form>
        </div>
    );
}
