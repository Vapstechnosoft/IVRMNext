'use client';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useFilterEmployeeOfferAndExperienceData, useGetEmployeeDetailsBySelection } from '@/hooks/hrms/useReports';
import { createLocalCrud } from '@/lib/localdb';
import { format } from 'date-fns';
import { Printer, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    type Department,
    type Designation,
    type Employee,
    EmployeeOfferLetterFilters,
    type GroupType,
    type OfferLetterFilters
} from './_components/filters';
export default function EmployeeOfferLetterPage() {
    // API hooks
    const filterMutation = useFilterEmployeeOfferAndExperienceData();
    const searchMutation = useGetEmployeeDetailsBySelection();
    // Database instances (for dropdowns - group types, departments, designations)
    const groupTypeDB = createLocalCrud<GroupType>('master:group-type');
    const departmentDB = createLocalCrud<Department>('master:department');
    const designationDB = createLocalCrud<Designation>('master:designation');
    const employeeDB = createLocalCrud<Employee>('master:employee');
    // State
    const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState<OfferLetterFilters>({
        type: '',
        department: '',
        designation: '',
        selectedEmployee: '',
        currentDate: new Date(),
        reportType: 'Experience Certificate'
    });
    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);
    const loadData = () => {
        try {
            // Load master data
            let groupList = groupTypeDB.list();
            if (groupList.length === 0) {
                const mockData = generateMockGroupTypes();
                mockData.forEach((group) => groupTypeDB.create(group));
                groupList = groupTypeDB.list();
            }
            setGroupTypes(groupList.filter((g) => g.isActive));
            let deptList = departmentDB.list();
            if (deptList.length === 0) {
                const mockData = generateMockDepartments();
                mockData.forEach((dept) => departmentDB.create(dept));
                deptList = departmentDB.list();
            }
            setDepartments(deptList.filter((d) => d.isActive));
            let desigList = designationDB.list();
            if (desigList.length === 0) {
                const mockData = generateMockDesignations();
                mockData.forEach((desig) => designationDB.create(desig));
                desigList = designationDB.list();
            }
            setDesignations(desigList.filter((d) => d.isActive));
            // Load employees
            let empList = employeeDB.list();
            if (empList.length === 0) {
                const mockData = generateMockEmployees();
                mockData.forEach((emp) => employeeDB.create(emp));
                empList = employeeDB.list();
            }
            setEmployees(empList);
            setFilteredEmployees(empList);
        } catch (_error) {
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };
    // Generate mock data
    const generateMockGroupTypes = (): Omit<GroupType, 'id' | 'createdAt'>[] => {
        return [
            { groupType: 'Teaching', groupCode: 'T', order: 1, isActive: true },
            { groupType: 'Non Teaching', groupCode: 'NT', order: 2, isActive: true },
            { groupType: 'Administrative', groupCode: 'ADM', order: 3, isActive: true }
        ];
    };
    const generateMockDepartments = (): Omit<Department, 'id' | 'createdAt'>[] => {
        return [
            { departmentName: 'Teaching', internalTrainingHours: '40', order: 1, isActive: true },
            { departmentName: 'JUNIOR SCHOOL', internalTrainingHours: '35', order: 2, isActive: true },
            { departmentName: 'SENIOR SCHOOL', internalTrainingHours: '40', order: 3, isActive: true },
            { departmentName: 'OFFICE STAFF', internalTrainingHours: '40', order: 4, isActive: true }
        ];
    };
    const generateMockDesignations = (): Omit<Designation, 'id' | 'createdAt'>[] => {
        return [
            {
                designationName: 'Senior yoga teacher',
                basicAmount: '50000',
                sanctionedSeats: '5',
                displaySanctionedSeats: true,
                order: 1,
                isActive: true
            },
            {
                designationName: 'Principal',
                basicAmount: '100000',
                sanctionedSeats: '1',
                displaySanctionedSeats: true,
                order: 2,
                isActive: true
            },
            {
                designationName: 'Assistant Teacher',
                basicAmount: '40000',
                sanctionedSeats: '10',
                displaySanctionedSeats: true,
                order: 3,
                isActive: true
            },
            {
                designationName: 'Vice Principal',
                basicAmount: '80000',
                sanctionedSeats: '2',
                displaySanctionedSeats: true,
                order: 4,
                isActive: true
            }
        ];
    };
    const generateMockEmployees = (): Omit<Employee, 'id' | 'createdAt'>[] => {
        return [
            {
                employeeCode: 'EMP001',
                employeeName: 'chandrakala j k',
                employeeFirstName: 'chandrakala',
                employeeMiddleName: 'j',
                employeeLastName: 'k',
                groupTypeId: 1,
                departmentId: 1,
                designationId: 1,
                departmentName: 'Teaching',
                designationName: 'Senior yoga teacher',
                dateOfJoining: '2021-05-01',
                employmentType: 'Permanent',
                gender: 'Female'
            }
        ];
    };
    // Filter employees using API when filters change
    useEffect(() => {
        // Only call API if we have at least one filter selected
        if (!filters.type && !filters.department && !filters.designation) {
            setFilteredEmployees([]);
            setEmployees([]);
            return;
        }
        // Find IDs for selected filters
        const selectedType = groupTypes.find((gt) => gt.groupType === filters.type);
        const selectedDept = departments.find((d) => d.departmentName === filters.department);
        const selectedDesig = designations.find((d) => d.designationName === filters.designation);
        const filterRequest = {
            MI_Id: 30,
            HRMGT_Id: selectedType?.id || 0,
            HRMD_Id: selectedDept?.id || 0,
            HRMDES_Id: selectedDesig?.id || 0,
            LogInUserId: 0
        };
        filterMutation.mutate(filterRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const employeeList = response.data.employeedropdown || [];
                    const mappedEmployees: Employee[] = employeeList.map((emp: any) => ({
                        id: emp.HRME_Id || 0,
                        createdAt: new Date(),
                        employeeCode: emp.HRME_EmployeeCode || '',
                        employeeName:
                            `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim(),
                        employeeFirstName: emp.HRME_EmployeeFirstName || '',
                        employeeMiddleName: emp.HRME_EmployeeMiddleName,
                        employeeLastName: emp.HRME_EmployeeLastName || '',
                        groupTypeId: emp.HRMGT_Id || 0,
                        departmentId: emp.HRMD_Id || 0,
                        designationId: emp.HRMDES_Id || 0,
                        departmentName: emp.HRMD_DepartmentName || '',
                        designationName: emp.HRMDES_DesignationName || '',
                        dateOfJoining: emp.HRME_DOJ ? emp.HRME_DOJ.split('T')[0] : '',
                        dateOfLeaving: emp.HRME_DOL ? emp.HRME_DOL.split('T')[0] : undefined,
                        employmentType:
                            emp.HRMET_EmployeeType === 'Permanent'
                                ? 'Permanent'
                                : emp.HRMET_EmployeeType === 'Probationary'
                                  ? 'Probationary'
                                  : 'Permanent',
                        gender: (emp.IVRMMG_GenderName === 'Male' ? 'Male' : emp.IVRMMG_GenderName === 'Female' ? 'Female' : undefined) as
                            | 'Male'
                            | 'Female'
                            | 'Other'
                            | undefined
                    }));
                    setEmployees(mappedEmployees);
                    setFilteredEmployees(mappedEmployees);
                } else {
                    toast.error(response.message || 'Failed to filter employees');
                    setEmployees([]);
                    setFilteredEmployees([]);
                }
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Failed to filter employees');
                setEmployees([]);
                setFilteredEmployees([]);
            }
        });
    }, [filters.type, filters.department, filters.designation, groupTypes, departments, designations]);
    const handleFilterChange = (key: keyof OfferLetterFilters, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        // Reset employee when filters change
        if (key !== 'selectedEmployee' && key !== 'currentDate' && key !== 'reportType') {
            setFilters((prev) => ({ ...prev, selectedEmployee: '' }));
        }
    };
    const handleSearch = () => {
        if (!filters.selectedEmployee) {
            toast.error('Please select an employee');
            return;
        }
        if (!filters.type || !filters.department || !filters.designation) {
            toast.error('Please select Type, Department, and Designation');
            return;
        }
        // Find IDs for selected filters
        const selectedType = groupTypes.find((gt) => gt.groupType === filters.type);
        const selectedDept = departments.find((d) => d.departmentName === filters.department);
        const selectedDesig = designations.find((d) => d.designationName === filters.designation);
        const searchRequest = {
            MI_Id: 30,
            HRMGT_Id: selectedType?.id || 0,
            HRMD_Id: selectedDept?.id || 0,
            HRMDES_Id: selectedDesig?.id || 0,
            LogInUserId: 0
        };
        searchMutation.mutate(searchRequest, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const employeeList = response.data.employeedropdown || [];
                    const mappedEmployees: Employee[] = employeeList.map((emp: any) => ({
                        id: emp.HRME_Id || 0,
                        createdAt: new Date(),
                        employeeCode: emp.HRME_EmployeeCode || '',
                        employeeName:
                            `${emp.HRME_EmployeeFirstName || ''} ${emp.HRME_EmployeeMiddleName || ''} ${emp.HRME_EmployeeLastName || ''}`.trim(),
                        employeeFirstName: emp.HRME_EmployeeFirstName || '',
                        employeeMiddleName: emp.HRME_EmployeeMiddleName,
                        employeeLastName: emp.HRME_EmployeeLastName || '',
                        groupTypeId: emp.HRMGT_Id || 0,
                        departmentId: emp.HRMD_Id || 0,
                        designationId: emp.HRMDES_Id || 0,
                        departmentName: emp.HRMD_DepartmentName || '',
                        designationName: emp.HRMDES_DesignationName || '',
                        dateOfJoining: emp.HRME_DOJ ? emp.HRME_DOJ.split('T')[0] : '',
                        dateOfLeaving: emp.HRME_DOL ? emp.HRME_DOL.split('T')[0] : undefined,
                        employmentType:
                            emp.HRMET_EmployeeType === 'Permanent'
                                ? 'Permanent'
                                : emp.HRMET_EmployeeType === 'Probationary'
                                  ? 'Probationary'
                                  : 'Permanent',
                        gender: (emp.IVRMMG_GenderName === 'Male' ? 'Male' : emp.IVRMMG_GenderName === 'Female' ? 'Female' : undefined) as
                            | 'Male'
                            | 'Female'
                            | 'Other'
                            | undefined
                    }));
                    // Update employees list and find selected employee
                    setEmployees(mappedEmployees);
                    const selectedEmp = mappedEmployees.find((emp) => emp.id.toString() === filters.selectedEmployee);
                    if (selectedEmp) {
                        setShowReport(true);
                        toast.success(`${filters.reportType} generated successfully`);
                    } else {
                        toast.error('Selected employee not found in the filtered results');
                    }
                } else {
                    toast.error(response.message || 'Failed to get employee details');
                }
            },
            onError: (error: any) => {
                toast.error(error?.message || 'Failed to get employee details');
            }
        });
    };
    const handleCancel = () => {
        setFilters({
            type: '',
            department: '',
            designation: '',
            selectedEmployee: '',
            currentDate: new Date(),
            reportType: 'Experience Certificate'
        });
        setShowReport(false);
        toast.info('Filters cleared');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };
    // Get selected employee details
    const selectedEmployeeDetails = useMemo(() => {
        if (!filters.selectedEmployee) return null;
        return employees.find((emp) => emp.id.toString() === filters.selectedEmployee) || null;
    }, [filters.selectedEmployee, employees]);
    // Format employee name with title (Mr/Ms)
    const getEmployeeNameWithTitle = (employee: Employee | null) => {
        if (!employee) return '';
        const title = employee.gender === 'Male' ? 'Mr' : employee.gender === 'Female' ? 'Ms' : 'Mr/Ms';
        const fullName = `${employee.employeeFirstName} ${employee.employeeMiddleName || ''} ${employee.employeeLastName || ''}`.trim();
        return `${title}.${fullName}`;
    };
    return (
        <div className='space-y-6'>
            {/* Report Configuration Section */}
            <EmployeeOfferLetterFilters
                filters={filters}
                groupTypes={groupTypes}
                departments={departments}
                designations={designations}
                filteredEmployees={filteredEmployees}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onCancel={handleCancel}
            />
            {/* Report Results */}
            {showReport && selectedEmployeeDetails && (
                <CollapsibleSection
                    title='EMPLOYEE OFFER AND EXPERIENCE REPORT'
                    description={`${filters.reportType} - ${selectedEmployeeDetails.employeeName}`}
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div className='space-y-6'>
                        {/* Experience Certificate */}
                        {filters.reportType === 'Experience Certificate' && (
                            <div className='rounded-lg border bg-white p-8'>
                                <div className='space-y-6'>
                                    {/* Date */}
                                    <div className='text-right text-sm'>
                                        <span className='font-semibold'>DATE: {format(filters.currentDate, 'dd-MM-yyyy')}</span>
                                    </div>
                                    {/* Heading */}
                                    <div className='text-center'>
                                        <h2 className='font-bold text-lg uppercase'>TO WHOMSOEVER IT MAY CONCERN</h2>
                                    </div>
                                    {/* Certificate Content */}
                                    <div className='mx-auto max-w-3xl space-y-4 text-sm leading-relaxed'>
                                        <p className='text-justify'>
                                            This is to certify that <strong>{getEmployeeNameWithTitle(selectedEmployeeDetails)}</strong> is
                                            a{' '}
                                            <strong>
                                                {selectedEmployeeDetails.employmentType === 'Permanent' ||
                                                selectedEmployeeDetails.employmentType === 'Probationary'
                                                    ? selectedEmployeeDetails.employmentType
                                                    : 'Permanent'}
                                            </strong>{' '}
                                            employee of Our Institution working as a{' '}
                                            <strong>{selectedEmployeeDetails.designationName}</strong> since{' '}
                                            <strong>{format(new Date(selectedEmployeeDetails.dateOfJoining), 'dd-MM-yyyy')}</strong>.
                                        </p>
                                        {selectedEmployeeDetails.dateOfLeaving && (
                                            <p className='text-justify'>
                                                The employee served from{' '}
                                                <strong>{format(new Date(selectedEmployeeDetails.dateOfJoining), 'dd-MM-yyyy')}</strong> to{' '}
                                                <strong>{format(new Date(selectedEmployeeDetails.dateOfLeaving), 'dd-MM-yyyy')}</strong>.
                                            </p>
                                        )}
                                    </div>
                                    {/* Signature Section */}
                                    <div className='mt-12 flex flex-col items-end space-y-2 text-sm'>
                                        <div className='font-semibold'>Mrs. Phebe Sheela Rani</div>
                                        <div>MANAGER</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Offer Letter */}
                        {filters.reportType === 'Offer Letter' && (
                            <div className='rounded-lg border bg-white p-8'>
                                <div className='space-y-6'>
                                    {/* Date */}
                                    <div className='text-right text-sm'>
                                        <span className='font-semibold'>DATE: {format(filters.currentDate, 'dd-MM-yyyy')}</span>
                                    </div>
                                    {/* Employee Details */}
                                    <div className='space-y-1 text-sm'>
                                        <div>
                                            <strong>{getEmployeeNameWithTitle(selectedEmployeeDetails)}</strong>
                                        </div>
                                        <div>Employee Code: {selectedEmployeeDetails.employeeCode}</div>
                                        {selectedEmployeeDetails.departmentName && <div>{selectedEmployeeDetails.departmentName}</div>}
                                    </div>
                                    {/* Subject */}
                                    <div className='space-y-2 text-sm'>
                                        <div>
                                            <strong>Subject: Offer of Employment</strong>
                                        </div>
                                    </div>
                                    {/* Letter Content */}
                                    <div className='mx-auto max-w-3xl space-y-4 text-sm leading-relaxed'>
                                        <p className='text-justify'>Dear {selectedEmployeeDetails.employeeFirstName},</p>
                                        <p className='text-justify'>
                                            We are pleased to offer you the position of{' '}
                                            <strong>{selectedEmployeeDetails.designationName}</strong> in the{' '}
                                            <strong>{selectedEmployeeDetails.departmentName}</strong> department at our institution.
                                        </p>
                                        <p className='text-justify'>
                                            Your employment will commence from <strong>{format(filters.currentDate, 'dd-MM-yyyy')}</strong>.
                                            We are confident that your skills and experience will be a valuable addition to our team.
                                        </p>
                                        <p className='text-justify'>
                                            Please confirm your acceptance of this offer by signing and returning a copy of this letter
                                            within 7 days.
                                        </p>
                                        <p className='text-justify'>We look forward to welcoming you to our organization.</p>
                                    </div>
                                    {/* Signature Section */}
                                    <div className='mt-12 flex flex-col items-end space-y-2 text-sm'>
                                        <div className='font-semibold'>Mrs. Phebe Sheela Rani</div>
                                        <div>MANAGER</div>
                                        <div>VAPS SCHOOL</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className='flex justify-center gap-2 border-t pt-4'>
                            <Button variant='outline' onClick={handlePrint}>
                                <Printer className='mr-2 h-4 w-4' />
                                PRINT
                            </Button>
                            <Button variant='outline' onClick={handleCancel}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
